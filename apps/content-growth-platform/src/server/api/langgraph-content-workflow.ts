import "server-only";

import { randomUUID } from "node:crypto";

import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

import type { LlmRuntimeSettingsDto } from "@/contracts/platform-admin";
import { getPlatformSettings } from "@/lib/db/platform-admin-repository";
import { createChatCompletion } from "@/server/api/ai-runtime";
import { parseDifyFinalJson } from "@/server/api/dify-final-json-mapper";
import { ApiError } from "@/server/api/errors";

type LangGraphContentWorkflowRunResult = {
  finalResultJson: unknown;
  workflowRunId?: string | null;
  rawOutputs?: Record<string, unknown> | null;
};

const LangGraphContentState = Annotation.Root({
  inputs: Annotation<Record<string, unknown>>,
  user: Annotation<string>,
  llmRuntime: Annotation<LlmRuntimeSettingsDto>,
  draftJsonText: Annotation<string | null>,
  finalResultJson: Annotation<unknown | null>,
  rawOutputs: Annotation<Record<string, unknown>>,
  validationError: Annotation<string | null>,
  model: Annotation<string | null>,
});

const langGraphContentWorkflow = new StateGraph(LangGraphContentState)
  .addNode("draft_content", draftContentNode)
  .addNode("validate_content", validateContentNode)
  .addNode("repair_content", repairContentNode)
  .addNode("validate_repair", validateContentNode)
  .addEdge(START, "draft_content")
  .addEdge("draft_content", "validate_content")
  .addConditionalEdges("validate_content", routeAfterValidation, {
    repair_content: "repair_content",
    [END]: END,
  })
  .addEdge("repair_content", "validate_repair")
  .addEdge("validate_repair", END)
  .compile({ name: "content-generation-langgraph-v1" });

export async function runLangGraphContentWorkflow(input: {
  inputs: Record<string, unknown>;
  user: string;
}): Promise<LangGraphContentWorkflowRunResult> {
  const mockResult = process.env.LANGGRAPH_MOCK_FINAL_RESULT_JSON;

  if (mockResult) {
    const finalResultJson = JSON.parse(mockResult) as unknown;

    return {
      finalResultJson,
      workflowRunId: "mock-langgraph-content-run",
      rawOutputs: {
        provider: "langgraph",
        mode: "mock",
        final_result_json: finalResultJson,
      },
    };
  }

  const { llmRuntime } = await getPlatformSettings();
  const workflowRunId = `langgraph-${randomUUID()}`;
  const finalState = await langGraphContentWorkflow.invoke({
    inputs: input.inputs,
    user: input.user,
    llmRuntime,
    draftJsonText: null,
    finalResultJson: null,
    rawOutputs: {
      provider: "langgraph",
      workflowRunId,
      workflowVersion: getLangGraphContentWorkflowVersion(),
    },
    validationError: null,
    model: null,
  });

  if (!finalState.finalResultJson) {
    throw new ApiError(
      502,
      "LANGGRAPH_FINAL_RESULT_JSON_INVALID",
      finalState.validationError ?? "LangGraph workflow did not produce a valid final JSON.",
    );
  }

  return {
    finalResultJson: finalState.finalResultJson,
    workflowRunId,
    rawOutputs: {
      ...finalState.rawOutputs,
      final_result_json: finalState.finalResultJson,
      final_model: finalState.model,
    },
  };
}

async function draftContentNode(state: typeof LangGraphContentState.State) {
  const completion = await createChatCompletion({
    runtime: state.llmRuntime,
    messages: buildDraftMessages(state),
    responseFormat: "json_object",
  });

  return {
    draftJsonText: completion.content,
    model: completion.model,
    rawOutputs: {
      ...state.rawOutputs,
      draft_json_text: completion.content,
      draft_model: completion.model,
      draft_usage: completion.usage ?? null,
    },
  };
}

function validateContentNode(state: typeof LangGraphContentState.State) {
  try {
    const parsed = parseDifyFinalJson(parseJsonObjectText(state.draftJsonText ?? ""));

    return {
      finalResultJson: parsed,
      validationError: null,
      rawOutputs: {
        ...state.rawOutputs,
        validation_status: "passed",
        validation_error: null,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "LangGraph final JSON validation failed.";

    return {
      finalResultJson: null,
      validationError: message,
      rawOutputs: {
        ...state.rawOutputs,
        validation_status: "failed",
        validation_error: message,
      },
    };
  }
}

async function repairContentNode(state: typeof LangGraphContentState.State) {
  const completion = await createChatCompletion({
    runtime: state.llmRuntime,
    messages: buildRepairMessages(state),
    responseFormat: "json_object",
  });

  return {
    draftJsonText: completion.content,
    model: completion.model,
    rawOutputs: {
      ...state.rawOutputs,
      repair_json_text: completion.content,
      repair_model: completion.model,
      repair_usage: completion.usage ?? null,
    },
  };
}

function routeAfterValidation(state: typeof LangGraphContentState.State) {
  return state.finalResultJson ? END : "repair_content";
}

function buildDraftMessages(state: typeof LangGraphContentState.State) {
  return [
    {
      role: "system" as const,
      content: buildSystemPrompt(),
    },
    {
      role: "user" as const,
      content: [
        "请基于以下内容生成内容日历任务的最终交付 JSON。",
        `用户标识：${state.user}`,
        formatWorkflowInputs(state.inputs),
      ].join("\n\n"),
    },
  ];
}

function buildRepairMessages(state: typeof LangGraphContentState.State) {
  return [
    {
      role: "system" as const,
      content: buildSystemPrompt(),
    },
    {
      role: "user" as const,
      content: [
        "上一版 JSON 没有通过合同校验。请只返回修复后的完整 JSON，不要解释。",
        `校验错误：${state.validationError ?? "unknown validation error"}`,
        "上一版输出：",
        state.draftJsonText ?? "",
        "原始输入：",
        formatWorkflowInputs(state.inputs),
      ].join("\n\n"),
    },
  ];
}

function buildSystemPrompt() {
  return [
    "你是小红书/抖音内容矩阵的内容生成 workflow。",
    "你必须只返回一个 JSON object，不要 Markdown，不要代码围栏，不要解释。",
    "顶层 key 必须且只能是：status, article, video, quality。",
    "status 使用 passed、needs_review 或 blocked。",
    "article 必须包含 title、coverCopy、images、copyText。",
    "article.images 是数组，每项必须包含 cosPath 和 role；没有可用图片时返回空数组。",
    "video 必须包含 storyOutline、estimatedDuration、bgm、toneOfVoice、scenes。",
    "video.scenes 至少 5 个镜头，除非输入明确要求极短视频。",
    "每个 scene 必须包含 sceneNo、timeRange、durationSec、sceneType、title、requiresUserUpload、purpose、taskDescription、visualDescription、voiceover、subtitle、shotLanguage、filmingGuide、editGuide、assetQuery。",
    "shotLanguage 必须包含 framing、cameraMovement、orientation、composition。",
    "filmingGuide 必须包含 method、location、posture、tips。",
    "editGuide 必须包含 transition、pacing、minUsableSeconds。",
    "quality 必须包含 riskTerms 数组。",
    "只能使用输入里的项目事实、素材能力和知识参考；不确定的信息要写成建议拍摄或用户补拍，不要写成既有事实。",
    "内容语气要像真实达人运营交付，不要像模板，不要提到 LangGraph、Dify、工作流或内部字段。",
  ].join("\n");
}

function formatWorkflowInputs(inputs: Record<string, unknown>) {
  return [
    ["calendar_task_json", inputs.calendar_task_json],
    ["viral_references_json", inputs.viral_references_json],
    ["image_assets_json", inputs.image_assets_json],
    ["fallback_knowledge_text", inputs.fallback_knowledge_text],
    ["extra_requirement", inputs.extra_requirement],
    ["member_profile_json", inputs.member_profile_json],
    ["account_profile_json", inputs.account_profile_json],
  ]
    .map(([label, value]) => `${label}:\n${stringifyPromptValue(value)}`)
    .join("\n\n");
}

function stringifyPromptValue(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (value === null || value === undefined) {
    return "";
  }

  return JSON.stringify(value);
}

function parseJsonObjectText(text: string) {
  const trimmed = text.trim();

  if (!trimmed) {
    throw new Error("LangGraph model returned an empty JSON response.");
  }

  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");

    if (start < 0 || end <= start) {
      throw new Error("LangGraph model response did not contain a JSON object.");
    }

    return JSON.parse(trimmed.slice(start, end + 1)) as unknown;
  }
}

function getLangGraphContentWorkflowVersion() {
  return process.env.LANGGRAPH_CONTENT_WORKFLOW_VERSION?.trim() || "content-v1";
}
