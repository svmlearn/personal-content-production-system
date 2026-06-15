import "server-only";

import { randomUUID } from "node:crypto";

import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

import type { LlmRuntimeSettingsDto } from "@/contracts/platform-admin";
import { getPlatformSettings } from "@/lib/db/platform-admin-repository";
import { createChatCompletion } from "@/server/api/ai-runtime";
import { parseDifyFinalJson } from "@/server/api/dify-final-json-mapper";
import { difyV31NodePrompts } from "@/server/api/dify-v31-node-prompts";
import { ApiError } from "@/server/api/errors";

type JsonRecord = Record<string, unknown>;
type DifyV31NodeId = keyof typeof difyV31NodePrompts;

type LangGraphContentWorkflowRunResult = {
  finalResultJson: unknown;
  workflowRunId?: string | null;
  rawOutputs?: JsonRecord | null;
};

type PromptNodeResult = {
  text: string;
  json: JsonRecord;
  model: string;
  usage?: JsonRecord;
};

const riskTerms = [
  "投资回报率高",
  "租金回报高",
  "收益稳定",
  "稳赚",
  "保值增值",
  "闭眼买",
  "错过后悔",
  "满租",
  "租金区间",
  "租金回报",
  "投资属性",
  "资产回报",
  "低位价格",
  "价格错位",
  "收租",
  "贴月供",
  "租出去",
  "保租",
  "保回报",
  "确定兑现",
  "运营成熟验证",
] as const;

const internalRiskListKeys = new Set(["mustAvoidClaims", "mustReviewBeforePublish"]);
const riskNoteKeys = new Set(["riskNotes"]);

const LangGraphContentState = Annotation.Root({
  inputs: Annotation<JsonRecord>,
  user: Annotation<string>,
  llmRuntime: Annotation<LlmRuntimeSettingsDto>,
  taskUnderstandingText: Annotation<string | null>,
  taskUnderstandingJson: Annotation<JsonRecord | null>,
  knowledgeRetrievalResult: Annotation<string | null>,
  creativeStrategyText: Annotation<string | null>,
  creativeStrategyJson: Annotation<JsonRecord | null>,
  titleCoverText: Annotation<string | null>,
  titleCoverJson: Annotation<JsonRecord | null>,
  articleBodyText: Annotation<string | null>,
  articleBodyJson: Annotation<JsonRecord | null>,
  articlePackage: Annotation<JsonRecord | null>,
  titleStrategy: Annotation<JsonRecord | null>,
  videoNarrativeText: Annotation<string | null>,
  videoNarrativeJson: Annotation<JsonRecord | null>,
  sceneBreakdownText: Annotation<string | null>,
  sceneBreakdownJson: Annotation<JsonRecord | null>,
  videoScript: Annotation<JsonRecord | null>,
  memberDelivery: Annotation<JsonRecord | null>,
  workerDelivery: Annotation<JsonRecord | null>,
  qualityReviewText: Annotation<string | null>,
  qualityReviewJson: Annotation<JsonRecord | null>,
  riskTerms: Annotation<string[]>,
  needsRewrite: Annotation<boolean>,
  rewrittenBundle: Annotation<JsonRecord | null>,
  finalResultJsonText: Annotation<string | null>,
  finalResultJson: Annotation<unknown | null>,
  rawOutputs: Annotation<JsonRecord>,
  validationError: Annotation<string | null>,
  model: Annotation<string | null>,
});

const langGraphContentWorkflow = new StateGraph(LangGraphContentState)
  .addNode("task_understanding", taskUnderstandingNode)
  .addNode("kb_project_knowledge", knowledgeRetrievalNode)
  .addNode("creative_strategy", creativeStrategyNode)
  .addNode("title_cover", titleCoverNode)
  .addNode("article_body", articleBodyNode)
  .addNode("article_compiler", articleCompilerNode)
  .addNode("video_narrative", videoNarrativeNode)
  .addNode("scene_breakdown", sceneBreakdownNode)
  .addNode("delivery_compiler", deliveryCompilerNode)
  .addNode("quality_reviewer", qualityReviewerNode)
  .addNode("content_risk_rewriter", contentRiskRewriterNode)
  .addNode("final_compiler", finalCompilerNode)
  .addNode("validate_final", validateFinalNode)
  .addEdge(START, "task_understanding")
  .addEdge("task_understanding", "kb_project_knowledge")
  .addEdge("kb_project_knowledge", "creative_strategy")
  .addEdge("creative_strategy", "title_cover")
  .addEdge("title_cover", "article_body")
  .addEdge("article_body", "article_compiler")
  .addEdge("article_compiler", "video_narrative")
  .addEdge("video_narrative", "scene_breakdown")
  .addEdge("scene_breakdown", "delivery_compiler")
  .addEdge("delivery_compiler", "quality_reviewer")
  .addConditionalEdges("quality_reviewer", routeAfterQualityReviewer, {
    content_risk_rewriter: "content_risk_rewriter",
    final_compiler: "final_compiler",
  })
  .addEdge("content_risk_rewriter", "final_compiler")
  .addEdge("final_compiler", "validate_final")
  .addEdge("validate_final", END)
  .compile({ name: "dify-v31-content-generation-langgraph" });

export async function runLangGraphContentWorkflow(input: {
  inputs: JsonRecord;
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
        workflowVersion: getLangGraphContentWorkflowVersion(),
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
    taskUnderstandingText: null,
    taskUnderstandingJson: null,
    knowledgeRetrievalResult: null,
    creativeStrategyText: null,
    creativeStrategyJson: null,
    titleCoverText: null,
    titleCoverJson: null,
    articleBodyText: null,
    articleBodyJson: null,
    articlePackage: null,
    titleStrategy: null,
    videoNarrativeText: null,
    videoNarrativeJson: null,
    sceneBreakdownText: null,
    sceneBreakdownJson: null,
    videoScript: null,
    memberDelivery: null,
    workerDelivery: null,
    qualityReviewText: null,
    qualityReviewJson: null,
    riskTerms: [],
    needsRewrite: false,
    rewrittenBundle: null,
    finalResultJsonText: null,
    finalResultJson: null,
    rawOutputs: {
      provider: "langgraph",
      workflowRunId,
      workflowVersion: getLangGraphContentWorkflowVersion(),
      difyPromptSource: "Dify V3.1 final JSON YAML",
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

async function taskUnderstandingNode(state: typeof LangGraphContentState.State) {
  const result = await runDifyPromptNode(state, "task_understanding");

  return {
    taskUnderstandingText: result.text,
    taskUnderstandingJson: result.json,
    model: result.model,
    rawOutputs: appendPromptNodeOutput(state, "task_understanding", result),
  };
}

function knowledgeRetrievalNode(state: typeof LangGraphContentState.State) {
  const result = compactStrings([
    stringifyPromptValue(state.inputs.fallback_knowledge_text),
    state.taskUnderstandingText ? `任务理解检索信息：\n${state.taskUnderstandingText}` : "",
    state.inputs.calendar_task_json
      ? `原始内容日历任务：\n${stringifyPromptValue(state.inputs.calendar_task_json)}`
      : "",
  ]).join("\n\n");

  return {
    knowledgeRetrievalResult: result || "无知识库检索结果。",
    rawOutputs: {
      ...state.rawOutputs,
      kb_project_knowledge: {
        type: "deterministic_knowledge_fallback",
        result: result || "无知识库检索结果。",
      },
    },
  };
}

async function creativeStrategyNode(state: typeof LangGraphContentState.State) {
  const result = await runDifyPromptNode(state, "creative_strategy");

  return {
    creativeStrategyText: result.text,
    creativeStrategyJson: result.json,
    model: result.model,
    rawOutputs: appendPromptNodeOutput(state, "creative_strategy", result),
  };
}

async function titleCoverNode(state: typeof LangGraphContentState.State) {
  const result = await runDifyPromptNode(state, "title_cover");

  return {
    titleCoverText: result.text,
    titleCoverJson: result.json,
    model: result.model,
    rawOutputs: appendPromptNodeOutput(state, "title_cover", result),
  };
}

async function articleBodyNode(state: typeof LangGraphContentState.State) {
  const result = await runDifyPromptNode(state, "article_body");

  return {
    articleBodyText: result.text,
    articleBodyJson: result.json,
    model: result.model,
    rawOutputs: appendPromptNodeOutput(state, "article_body", result),
  };
}

function articleCompilerNode(state: typeof LangGraphContentState.State) {
  const compiled = compileArticlePackage(state.titleCoverJson, state.articleBodyJson);
  const result = JSON.stringify(compiled);

  return {
    articlePackage: compiled.articlePackage,
    titleStrategy: compiled.titleStrategy,
    rawOutputs: {
      ...state.rawOutputs,
      article_compiler: {
        type: "dify_code_node_typescript_port",
        result,
        json: compiled,
      },
    },
  };
}

async function videoNarrativeNode(state: typeof LangGraphContentState.State) {
  const result = await runDifyPromptNode(state, "video_narrative");

  return {
    videoNarrativeText: result.text,
    videoNarrativeJson: result.json,
    model: result.model,
    rawOutputs: appendPromptNodeOutput(state, "video_narrative", result),
  };
}

async function sceneBreakdownNode(state: typeof LangGraphContentState.State) {
  const result = await runDifyPromptNode(state, "scene_breakdown");

  return {
    sceneBreakdownText: result.text,
    sceneBreakdownJson: result.json,
    model: result.model,
    rawOutputs: appendPromptNodeOutput(state, "scene_breakdown", result),
  };
}

function deliveryCompilerNode(state: typeof LangGraphContentState.State) {
  const compiled = compileVideoDelivery(state.videoNarrativeJson, state.sceneBreakdownJson);
  const result = JSON.stringify(compiled);

  return {
    videoScript: compiled.videoScript,
    memberDelivery: compiled.memberDelivery,
    workerDelivery: compiled.workerDelivery,
    rawOutputs: {
      ...state.rawOutputs,
      delivery_compiler: {
        type: "dify_code_node_typescript_port",
        result,
        json: compiled,
      },
    },
  };
}

function qualityReviewerNode(state: typeof LangGraphContentState.State) {
  const quality = buildQualityReview({
    articlePackage: state.articlePackage,
    titleStrategy: state.titleStrategy,
    videoScript: state.videoScript,
    memberDelivery: state.memberDelivery,
    workerDelivery: state.workerDelivery,
    imageAssetsJson: state.inputs.image_assets_json,
    fallbackKnowledgeText: state.inputs.fallback_knowledge_text,
  });
  const qualityText = JSON.stringify(quality);
  const hits = toStringArray(quality.riskTerms);

  return {
    qualityReviewText: qualityText,
    qualityReviewJson: quality,
    needsRewrite: hits.length > 0,
    riskTerms: hits,
    rawOutputs: {
      ...state.rawOutputs,
      quality_reviewer: {
        type: "dify_code_node_typescript_port",
        text: qualityText,
        needs_rewrite: hits.length > 0 ? "true" : "false",
        risk_terms: hits.join("、"),
      },
    },
  };
}

async function contentRiskRewriterNode(state: typeof LangGraphContentState.State) {
  const result = await runDifyPromptNode(state, "content_risk_rewriter");

  return {
    rewrittenBundle: result.json,
    model: result.model,
    rawOutputs: appendPromptNodeOutput(state, "content_risk_rewriter", result),
  };
}

function finalCompilerNode(state: typeof LangGraphContentState.State) {
  const rewrittenArticlePackage = extractArticlePackage(state.rewrittenBundle);
  const rewrittenVideoDelivery = extractVideoDelivery(state.rewrittenBundle);
  const articlePackage = hasKeys(rewrittenArticlePackage)
    ? rewrittenArticlePackage
    : state.articlePackage ?? {};
  const videoDelivery = hasKeys(rewrittenVideoDelivery.videoScript)
    ? rewrittenVideoDelivery
    : {
        videoScript: state.videoScript ?? {},
        memberDelivery: state.memberDelivery ?? {},
        workerDelivery: state.workerDelivery ?? {},
      };
  const quality = markRepairIfNeeded(normalizeQuality(state.qualityReviewJson));
  const finalResultJson = compileFinalJson({
    articlePackage,
    videoDelivery,
    quality,
    imageAssetsJson: state.inputs.image_assets_json,
  });
  const finalResultJsonText = JSON.stringify(finalResultJson);

  return {
    finalResultJsonText,
    rawOutputs: {
      ...state.rawOutputs,
      final_compiler: {
        type: "dify_code_node_typescript_port",
        final_result_json: finalResultJsonText,
      },
    },
  };
}

function validateFinalNode(state: typeof LangGraphContentState.State) {
  try {
    const parsed = parseDifyFinalJson(parseJsonObjectText(state.finalResultJsonText ?? ""));

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

function routeAfterQualityReviewer(state: typeof LangGraphContentState.State) {
  return state.needsRewrite ? "content_risk_rewriter" : "final_compiler";
}

async function runDifyPromptNode(
  state: typeof LangGraphContentState.State,
  nodeId: DifyV31NodeId,
): Promise<PromptNodeResult> {
  const prompt = difyV31NodePrompts[nodeId];

  let completion: Awaited<ReturnType<typeof createChatCompletion>>;

  try {
    completion = await createChatCompletion({
      runtime: getLangGraphLlmRuntime(state.llmRuntime),
      messages: [
        {
          role: "system",
          content: prompt.systemPrompt,
        },
        {
          role: "user",
          content: renderDifyPromptTemplate(prompt.userPrompt, buildDifyTemplateVariables(state)),
        },
      ],
      responseFormat: "json_object",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "LangGraph LLM node failed.";

    throw new ApiError(502, "LANGGRAPH_LLM_NODE_FAILED", `LangGraph node ${nodeId} failed: ${message}`);
  }

  return {
    text: completion.content,
    json: toRecord(parseJsonObjectText(completion.content)),
    model: completion.model,
    usage: completion.usage,
  };
}

function getLangGraphLlmRuntime(runtime: LlmRuntimeSettingsDto): LlmRuntimeSettingsDto {
  const timeoutSeconds = readPositiveIntEnv("LANGGRAPH_LLM_TIMEOUT_SECONDS");

  if (!timeoutSeconds || timeoutSeconds <= runtime.timeoutSeconds) {
    return runtime;
  }

  return {
    ...runtime,
    timeoutSeconds,
  };
}

function appendPromptNodeOutput(
  state: typeof LangGraphContentState.State,
  nodeId: DifyV31NodeId,
  result: PromptNodeResult,
) {
  const prompt = difyV31NodePrompts[nodeId];

  return {
    ...state.rawOutputs,
    [nodeId]: {
      type: "dify_v31_llm_prompt_node",
      title: prompt.title,
      systemPromptId: prompt.systemPromptId,
      userPromptId: prompt.userPromptId,
      text: result.text,
      json: result.json,
      model: result.model,
      usage: result.usage ?? null,
    },
  };
}

function buildDifyTemplateVariables(state: typeof LangGraphContentState.State) {
  const articleCompilerResult = JSON.stringify({
    articlePackage: state.articlePackage ?? {},
    titleStrategy: state.titleStrategy ?? {},
  });
  const deliveryCompilerResult = JSON.stringify({
    videoScript: state.videoScript ?? {},
    memberDelivery: state.memberDelivery ?? {},
    workerDelivery: state.workerDelivery ?? {},
  });

  return {
    "start.calendar_task_json": stringifyPromptValue(state.inputs.calendar_task_json),
    "start.extra_requirement": stringifyPromptValue(state.inputs.extra_requirement),
    "start.fallback_knowledge_text": stringifyPromptValue(state.inputs.fallback_knowledge_text),
    "start.viral_references_json": stringifyPromptValue(state.inputs.viral_references_json),
    "start.image_assets_json": stringifyPromptValue(state.inputs.image_assets_json),
    "task_understanding.text": state.taskUnderstandingText ?? "",
    "kb_project_knowledge.result": state.knowledgeRetrievalResult ?? "",
    "creative_strategy.text": state.creativeStrategyText ?? "",
    "title_cover.text": state.titleCoverText ?? "",
    "video_narrative.text": state.videoNarrativeText ?? "",
    "quality_reviewer.risk_terms": state.riskTerms.join("、"),
    "quality_reviewer.text": state.qualityReviewText ?? "",
    "article_compiler.result": articleCompilerResult,
    "delivery_compiler.result": deliveryCompilerResult,
  };
}

function renderDifyPromptTemplate(template: string, variables: Record<string, string>) {
  return template.replace(/\{\{#([^#]+)#\}\}/g, (_match, key: string) => {
    return variables[key.trim()] ?? "";
  });
}

function compileArticlePackage(titleCoverInput: unknown, articleBodyInput: unknown) {
  const titleCover = toRecord(titleCoverInput);
  const articleBody = toRecord(articleBodyInput);
  const blocks = toRecordArray(articleBody.contentBlocks);
  const hashtags = normalizeHashtags(asList(articleBody.hashtags));
  const cta = readString(articleBody.cta);
  const bodyText = blocks
    .map((block) => readString(block.text))
    .filter(Boolean)
    .join("\n\n");
  const hashtagText = hashtags.join(" ");
  const copyReadyText = compactStrings([
    readString(titleCover.selectedTitle),
    bodyText,
    hashtagText,
  ]).join("\n\n");
  const imageMatches: JsonRecord[] = [];
  const imageBriefs: string[] = [];

  blocks.forEach((block, index) => {
    const imageMatch = toRecord(block.imageMatch);

    if (hasKeys(imageMatch)) {
      imageMatches.push({
        blockNo: block.blockNo ?? index + 1,
        assetId: readString(imageMatch.assetId),
        title: readString(imageMatch.title),
        usage: readString(imageMatch.usage),
        cosPath: readString(imageMatch.cosPath),
        role: readString(imageMatch.role) || (imageMatches.length === 0 ? "cover" : "body"),
      });
    }

    const imageBrief = readString(block.imageBrief);

    if (imageBrief) {
      imageBriefs.push(imageBrief);
    }
  });

  const titleItems = toRecordArray(titleCover.titles);
  const titleTexts = titleItems.map((item) => readString(item.text)).filter(Boolean);

  return {
    articlePackage: {
      titles: titleTexts,
      selectedTitle: readString(titleCover.selectedTitle),
      coverCopy: readString(titleCover.selectedCoverCopy),
      body: bodyText,
      contentBlocks: blocks,
      hashtags,
      cta,
      imageMatches,
      imageBriefIfMissing: imageBriefs.join("; "),
      riskNotes: asList(articleBody.riskNotes),
      copyReadyText,
    },
    titleStrategy: {
      titles: titleItems,
      selectedTitleReason: readString(titleCover.selectedTitleReason),
      coverCopyOptions: asList(titleCover.coverCopyOptions),
      hookAngle: readString(titleCover.hookAngle),
    },
  };
}

function compileVideoDelivery(videoNarrativeInput: unknown, sceneBreakdownInput: unknown) {
  const narrative = toRecord(videoNarrativeInput);
  const breakdown = toRecord(sceneBreakdownInput);
  const scenes = toRecordArray(breakdown.scenes).map(normalizeScene);
  const filmingScenes = scenes.filter((scene) => scene.sceneType === "口播");
  const assetScenes = scenes.filter((scene) => scene.sceneType === "素材");
  const memberDelivery = {
    tasks: filmingScenes.map((scene, index) => {
      const filmingGuide = toRecord(scene.filmingGuide);

      return {
        taskNo: index + 1,
        sceneNo: scene.sceneNo,
        script: scene.voiceover,
        location: readString(filmingGuide.location),
        posture: readString(filmingGuide.posture),
        tips: asList(filmingGuide.tips),
      };
    }),
  };
  const workerDelivery = {
    storyOutline: readString(narrative.storyOutline),
    bgm: readString(narrative.bgmDirection),
    toneOfVoice: readString(narrative.toneOfVoice),
    estimatedDuration: readString(narrative.estimatedDuration),
    scenes,
    teamAssetQueries: assetScenes.map((scene) => scene.assetQuery).filter(Boolean),
  };

  return {
    videoScript: {
      narrative,
      scenes,
      riskNotes: asList(breakdown.riskNotes),
    },
    memberDelivery,
    workerDelivery,
  };
}

function normalizeScene(sceneInput: JsonRecord, index: number) {
  const sceneType = firstNonEmpty(sceneInput.sceneType, "口播");
  const sceneNo = readNumber(sceneInput.sceneNo, index + 1);
  const filmingGuide = toRecord(sceneInput.filmingGuide);
  const shotLanguage = toRecord(sceneInput.shotLanguage);
  const editGuide = toRecord(sceneInput.editGuide);
  const visual = firstNonEmpty(sceneInput.visualDescription, sceneInput.fallbackVisual);
  const voiceover = firstNonEmpty(sceneInput.voiceover);
  const subtitle = firstNonEmpty(sceneInput.subtitle, voiceover);
  const title = firstNonEmpty(sceneInput.title, `镜头 ${sceneNo}`);
  const purpose = firstNonEmpty(
    sceneInput.purpose,
    sceneInput.emotionalBeat,
    sceneInput.taskDescription,
    title,
    visual,
    "说明当前内容要点",
  );
  const visualDescription = firstNonEmpty(
    visual,
    subtitle,
    voiceover,
    title,
    "中介面对镜头自然讲述项目要点",
  );
  const requiresUserUpload =
    typeof sceneInput.requiresUserUpload === "boolean"
      ? sceneInput.requiresUserUpload
      : sceneType === "口播";
  const defaultMethod =
    sceneType === "口播"
      ? "手机横屏，半身自拍口播"
      : sceneType === "素材"
        ? "使用团队素材或项目实拍素材"
        : "剪辑生成文字卡";

  return {
    sceneNo,
    timeRange: firstNonEmpty(sceneInput.timeRange, "0-3s"),
    durationSec: parseDurationSec(sceneInput),
    sceneType,
    title,
    requiresUserUpload,
    purpose,
    taskDescription: firstNonEmpty(sceneInput.taskDescription, title, visualDescription, purpose),
    visualDescription,
    voiceover,
    subtitle,
    shotLanguage: {
      framing: firstNonEmpty(shotLanguage.framing, sceneType === "口播" ? "中景" : "全景"),
      cameraMovement: firstNonEmpty(
        shotLanguage.cameraMovement,
        sceneType === "口播" ? "固定镜头" : "稳定推进或平移",
      ),
      orientation: firstNonEmpty(shotLanguage.orientation, "横屏"),
      composition: firstNonEmpty(shotLanguage.composition, visualDescription),
    },
    filmingGuide: {
      method: firstNonEmpty(filmingGuide.method, defaultMethod),
      location: firstNonEmpty(filmingGuide.location, "根据现场条件选择"),
      posture: firstNonEmpty(filmingGuide.posture, sceneType === "口播" ? "自然站姿" : "不需要出镜"),
      tips: toStringArray(filmingGuide.tips),
    },
    editGuide: {
      transition: firstNonEmpty(editGuide.transition, sceneInput.transition, "直接切"),
      pacing: firstNonEmpty(editGuide.pacing, sceneInput.pacing, "正常"),
      minUsableSeconds: readNumber(editGuide.minUsableSeconds, 3),
    },
    assetQuery: firstNonEmpty(sceneInput.assetQuery),
  };
}

function buildQualityReview(input: {
  articlePackage: JsonRecord | null;
  titleStrategy: JsonRecord | null;
  videoScript: JsonRecord | null;
  memberDelivery: JsonRecord | null;
  workerDelivery: JsonRecord | null;
  imageAssetsJson: unknown;
  fallbackKnowledgeText: unknown;
}) {
  const article = input.articlePackage ?? {};
  const titleStrategy = input.titleStrategy ?? {};
  const videoScript = input.videoScript ?? {};
  const narrative = toRecord(videoScript.narrative);
  const scenes = toRecordArray(videoScript.scenes);
  const imageAssets = parseList(input.imageAssetsJson);
  const publicText = JSON.stringify({
    articlePackage: article,
    videoDelivery: {
      videoScript,
      memberDelivery: input.memberDelivery ?? {},
      workerDelivery: input.workerDelivery ?? {},
    },
  });
  const hits = riskTerms.filter((term) => publicText.includes(term));
  const scores: JsonRecord = {
    factAccuracy: 8,
    projectFit: 8,
    viralStructure: 8,
    platformTone: 8,
    materialFit: 8,
    compliance: hits.length > 0 ? 4 : 9,
  };
  const problems: string[] = [];
  const revisionSuggestions: string[] = [];
  const redFlags: string[] = [];
  const missingInputs: string[] = [];

  if (hits.length) {
    problems.push("公开成稿存在风险承诺类或价格趋势类表述");
    redFlags.push(`命中风险词：${hits.join("、")}`);
  }

  if (!readString(article.copyReadyText)) {
    scores.platformTone = Math.min(readNumber(scores.platformTone, 8), 6);
    problems.push("copyReadyText 为空，不能直接复制发布");
  }

  const titles = asList(article.titles);

  if (!titles.length) {
    scores.platformTone = Math.min(readNumber(scores.platformTone, 8), 6);
    problems.push("titles 为空");
  } else if (titles.length < 2) {
    scores.viralStructure = Math.min(readNumber(scores.viralStructure, 8), 6);
    problems.push("标题备选不足 2 个");
  }

  if (readString(article.selectedTitle).length > 20) {
    scores.viralStructure = Math.min(readNumber(scores.viralStructure, 8), 6);
    problems.push("selectedTitle 超过 20 字限制");
  }

  if (hasKeys(titleStrategy) && !readString(titleStrategy.selectedTitleReason)) {
    scores.viralStructure = Math.min(readNumber(scores.viralStructure, 8), 6);
    problems.push("缺少标题选择理由");
  }

  const hashtags = asList(article.hashtags);

  if (!hashtags.length) {
    scores.platformTone = Math.min(readNumber(scores.platformTone, 8), 6);
    problems.push("hashtags 为空");
  } else if (hashtags.length < 5) {
    scores.platformTone = Math.min(readNumber(scores.platformTone, 8), 6);
    problems.push("hashtags 少于 5 个");
  }

  const blocks = toRecordArray(article.contentBlocks);

  if (blocks.length < 3) {
    scores.platformTone = Math.min(readNumber(scores.platformTone, 8), 6);
    problems.push("正文信息块不足 3 个");
  }

  if (blocks.length && !blocks.some((block) => block.blockType === "CTA块")) {
    scores.platformTone = Math.min(readNumber(scores.platformTone, 8), 6);
    problems.push("缺少 CTA 块");
  }

  blocks.forEach((block) => {
    const blockNo = block.blockNo ?? "?";

    if (!readString(block.text)) {
      scores.platformTone = Math.min(readNumber(scores.platformTone, 8), 6);
      problems.push(`Block ${blockNo} 缺少正文`);
    }

    if (block.blockType !== "CTA块" && !hasKeys(toRecord(block.imageMatch)) && !readString(block.imageBrief)) {
      scores.materialFit = Math.min(readNumber(scores.materialFit, 8), 6);
      problems.push(`Block ${blockNo} 缺少配图策略`);
    }
  });

  if (stringifyPromptValue(input.fallbackKnowledgeText).includes("只有很少资料")) {
    scores.factAccuracy = Math.min(readNumber(scores.factAccuracy, 8), 5);
    problems.push("项目知识不足，成稿仅适合内部预览");
    missingInputs.push("更完整的项目事实");
  }

  if (!imageAssets.length) {
    scores.materialFit = Math.min(readNumber(scores.materialFit, 8), 6);
    problems.push("缺少可用图片素材");
    missingInputs.push("图文图片素材");
  }

  const hook = toRecord(narrative.hook);

  if (!readString(hook.openingLine)) {
    scores.viralStructure = Math.min(readNumber(scores.viralStructure, 8), 6);
    problems.push("视频叙事缺少前 3 秒钩子 openingLine");
  }

  if (asList(narrative.narrativeArc).length < 3) {
    scores.viralStructure = Math.min(readNumber(scores.viralStructure, 8), 6);
    problems.push("视频叙事弧线少于 3 个节拍");
  }

  if (!readString(narrative.bgmDirection)) {
    scores.materialFit = Math.min(readNumber(scores.materialFit, 8), 6);
    problems.push("视频叙事缺少 bgmDirection");
  }

  if (!scenes.length) {
    scores.materialFit = Math.min(readNumber(scores.materialFit, 8), 5);
    problems.push("视频镜头脚本为空");
  }

  scenes.forEach((scene, index) => {
    const sceneNo = scene.sceneNo ?? index + 1;
    const sceneType = readString(scene.sceneType);

    if (!["口播", "素材", "文字卡"].includes(sceneType)) {
      scores.materialFit = Math.min(readNumber(scores.materialFit, 8), 5);
      problems.push(`场景 ${sceneNo} sceneType 非法或缺失`);
      return;
    }

    if (sceneType !== "文字卡" && !readString(scene.visualDescription)) {
      scores.materialFit = Math.min(readNumber(scores.materialFit, 8), 6);
      problems.push(`场景 ${sceneNo} 缺少具体 visualDescription`);
    }

    if (!readString(scene.title)) {
      scores.materialFit = Math.min(readNumber(scores.materialFit, 8), 6);
      problems.push(`场景 ${sceneNo} 缺少 title`);
    }

    if (typeof scene.requiresUserUpload !== "boolean") {
      scores.materialFit = Math.min(readNumber(scores.materialFit, 8), 6);
      problems.push(`场景 ${sceneNo} 缺少 requiresUserUpload`);
    }

    if (sceneType === "口播" && !readString(scene.voiceover)) {
      scores.materialFit = Math.min(readNumber(scores.materialFit, 8), 5);
      problems.push(`口播场景 ${sceneNo} 缺少 voiceover 台词`);
    }

    if (sceneType === "素材" && !readString(scene.assetQuery)) {
      scores.materialFit = Math.min(readNumber(scores.materialFit, 8), 5);
      problems.push(`素材场景 ${sceneNo} 缺少 assetQuery`);
    }

    if (sceneType === "文字卡" && !readString(scene.subtitle)) {
      scores.materialFit = Math.min(readNumber(scores.materialFit, 8), 5);
      problems.push(`文字卡场景 ${sceneNo} 缺少 subtitle`);
    }
  });

  const passed =
    Object.values(scores).every((value) => typeof value === "number" && value >= 7) &&
    redFlags.length === 0 &&
    missingInputs.length === 0 &&
    problems.length === 0;

  return {
    scores,
    pass: passed,
    needsRewrite: hits.length > 0,
    riskTerms: hits,
    problems,
    revisionSuggestions,
    redFlags,
    missingInputs,
  };
}

function compileFinalJson(input: {
  articlePackage: JsonRecord;
  videoDelivery: {
    videoScript: JsonRecord;
    memberDelivery: JsonRecord;
    workerDelivery: JsonRecord;
  };
  quality: JsonRecord;
  imageAssetsJson: unknown;
}) {
  const articleTitle = buildArticleTitle(input.articlePackage);
  const coverCopy = buildArticleCoverCopy(input.articlePackage, articleTitle);
  const result = {
    status: input.quality.pass === true ? "passed" : "needs_review",
    article: {
      title: articleTitle,
      coverCopy,
      images: buildImages(input.articlePackage, input.imageAssetsJson),
      copyText: buildCopyText(input.articlePackage, articleTitle, coverCopy),
    },
    video: buildVideo(input.videoDelivery),
    quality: {
      riskTerms: asList(input.quality.riskTerms),
    },
  };

  return sanitizePublicOutput(result);
}

function buildArticleTitle(article: JsonRecord) {
  const titleCandidates = [
    article.selectedTitle,
    ...toRecordArray(article.titles).map((item) => item.text),
    ...asList(article.titles),
    article.coverCopy,
  ];

  return firstNonEmpty(...titleCandidates, "今日项目内容");
}

function buildArticleCoverCopy(article: JsonRecord, articleTitle: string) {
  return firstNonEmpty(article.coverCopy, article.selectedCoverCopy, articleTitle, "项目看点整理");
}

function buildCopyText(article: JsonRecord, articleTitle: string, coverCopy: string) {
  const body = firstNonEmpty(article.body);
  const copyReadyText = firstNonEmpty(article.copyReadyText);
  const hashtagText = normalizeHashtags(asList(article.hashtags)).join(" ");
  const text = body
    ? compactStrings([articleTitle, body]).join("\n\n")
    : firstNonEmpty(
        copyReadyText,
        compactStrings([articleTitle, coverCopy, "适合先结合预算和实际需求了解。"]).join("\n\n"),
      );

  if (hashtagText && !text.includes(hashtagText)) {
    return compactStrings([text, hashtagText]).join("\n\n");
  }

  return text;
}

function buildImages(article: JsonRecord, imageAssetsJson: unknown) {
  const lookup = buildAssetLookup(imageAssetsJson);
  const seen = new Set<string>();
  const images: Array<{ cosPath: string; role: string }> = [];

  toRecordArray(article.imageMatches).forEach((match, index) => {
    const assetId = readString(match.assetId);
    const asset = lookup.get(assetId) ?? {};
    const cosPath = imagePathFrom(match, asset);

    if (!cosPath || seen.has(cosPath)) {
      return;
    }

    seen.add(cosPath);
    images.push({
      cosPath,
      role: firstNonEmpty(match.role, index === 0 ? "cover" : "body"),
    });
  });

  return images;
}

function buildVideo(videoDelivery: {
  videoScript: JsonRecord;
  memberDelivery: JsonRecord;
  workerDelivery: JsonRecord;
}) {
  const videoScript = toRecord(videoDelivery.videoScript);
  const workerDelivery = toRecord(videoDelivery.workerDelivery);
  const narrative = toRecord(videoScript.narrative);
  const sourceScenes = toRecordArray(videoScript.scenes).length
    ? toRecordArray(videoScript.scenes)
    : toRecordArray(workerDelivery.scenes);
  const scenes = sourceScenes.length
    ? sourceScenes.map(normalizeScene)
    : [
        normalizeScene(
          {
            sceneNo: 1,
            timeRange: "0-6s",
            durationSec: 6,
            sceneType: "口播",
            title: "开场说明",
            purpose: "用口播交代本条内容的核心看点",
            taskDescription: "中介面对镜头自然说明项目内容看点",
            visualDescription: "中介面对镜头半身口播，背景选择项目现场或售楼处",
            voiceover: "今天用一个克制的角度，讲讲这个项目适合谁先了解。",
            subtitle: "这个项目适合谁先了解？",
          },
          0,
        ),
      ];

  return {
    storyOutline: firstNonEmpty(
      workerDelivery.storyOutline,
      narrative.storyOutline,
      "围绕项目生活便利、空间使用和预算友好度展开。",
    ),
    estimatedDuration: firstNonEmpty(workerDelivery.estimatedDuration, narrative.estimatedDuration, "45s"),
    bgm: firstNonEmpty(workerDelivery.bgm, narrative.bgmDirection, "轻快生活感背景音乐"),
    toneOfVoice: firstNonEmpty(workerDelivery.toneOfVoice, narrative.toneOfVoice, "克制、真实、口语化"),
    scenes,
  };
}

function extractArticlePackage(value: unknown) {
  const obj = parseObjectValue(value);
  const articlePackage = toRecord(obj.articlePackage);

  if (isArticlePackage(articlePackage)) {
    return articlePackage;
  }

  if (isArticlePackage(obj)) {
    return obj;
  }

  return {};
}

function extractVideoDelivery(value: unknown) {
  const obj = parseObjectValue(value);
  const videoScript = toRecord(obj.videoScript);

  if (isVideoScript(videoScript)) {
    return {
      videoScript,
      memberDelivery: toRecord(obj.memberDelivery),
      workerDelivery: toRecord(obj.workerDelivery),
    };
  }

  if (isVideoScript(obj)) {
    return {
      videoScript: obj,
      memberDelivery: {},
      workerDelivery: {},
    };
  }

  return {
    videoScript: {},
    memberDelivery: {},
    workerDelivery: {},
  };
}

function normalizeQuality(value: unknown) {
  const quality = parseObjectValue(value);

  if (!hasKeys(quality)) {
    return {
      pass: false,
      needsRewrite: false,
      riskTerms: [],
    };
  }

  return {
    ...quality,
    pass: quality.pass === true,
    needsRewrite: quality.needsRewrite === true,
    riskTerms: asList(quality.riskTerms),
  };
}

function markRepairIfNeeded(quality: JsonRecord) {
  if (quality.needsRewrite !== true) {
    return quality;
  }

  const scores = toRecord(quality.scores);
  scores.compliance = Math.max(readNumber(scores.compliance, 0), 8);
  const cleaned = {
    ...quality,
    scores,
    problems: asList(quality.problems).filter(
      (item) => !["风险承诺", "价格趋势", "命中风险词"].some((keyword) => String(item).includes(keyword)),
    ),
    redFlags: asList(quality.redFlags).filter((item) => !String(item).includes("命中风险词")),
    revisionSuggestions: asList(quality.revisionSuggestions).filter(
      (item) => !["风险承诺", "价格趋势", "命中风险词"].some((keyword) => String(item).includes(keyword)),
    ),
    missingInputs: asList(quality.missingInputs),
  };
  const scoreValues = Object.values(scores).filter((value): value is number => typeof value === "number");

  return {
    ...cleaned,
    pass:
      scoreValues.length > 0 &&
      scoreValues.every((value) => value >= 7) &&
      asList(cleaned.problems).length === 0 &&
      asList(cleaned.redFlags).length === 0 &&
      asList(cleaned.missingInputs).length === 0,
  };
}

function sanitizePublicOutput(value: unknown, key = ""): unknown {
  if (Array.isArray(value)) {
    return value
      .filter((item) => {
        if (internalRiskListKeys.has(key) || riskNoteKeys.has(key)) {
          return !containsRisk(item);
        }

        return true;
      })
      .map((item) => sanitizePublicOutput(item, key));
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([childKey, childValue]) => {
        if (internalRiskListKeys.has(childKey) || riskNoteKeys.has(childKey)) {
          return [childKey, []];
        }

        return [childKey, sanitizePublicOutput(childValue, childKey)];
      }),
    );
  }

  if (typeof value === "string" && (containsRisk(value) || value.includes("<think>") || value.includes("</think>"))) {
    return scrubRiskText(value);
  }

  return value;
}

function buildAssetLookup(imageAssetsJson: unknown) {
  const lookup = new Map<string, JsonRecord>();

  parseList(imageAssetsJson).forEach((item) => {
    const asset = toRecord(item);
    const assetId = readString(asset.assetId);

    if (assetId) {
      lookup.set(assetId, asset);
    }
  });

  return lookup;
}

function imagePathFrom(match: JsonRecord, asset: JsonRecord) {
  for (const source of [match, asset]) {
    for (const key of ["cosPath", "cos_path", "assetPath", "path", "url"]) {
      const value = readString(source[key]);

      if (value) {
        return value;
      }
    }
  }

  return "";
}

function isArticlePackage(value: unknown) {
  const record = toRecord(value);

  return ["copyReadyText", "body", "selectedTitle", "contentBlocks"].some((key) => key in record);
}

function isVideoScript(value: unknown) {
  const record = toRecord(value);

  return Array.isArray(record.scenes) || hasKeys(toRecord(record.narrative)) || "storyOutline" in record;
}

function normalizeHashtags(items: unknown[]) {
  return items
    .map((item) => readString(item))
    .filter(Boolean)
    .map((item) => (item.startsWith("#") ? item : `#${item}`));
}

function parseDurationSec(scene: JsonRecord) {
  const durationSec = readNumberOrNull(scene.durationSec);

  if (durationSec !== null) {
    return durationSec;
  }

  const numbers = firstNonEmpty(scene.timeRange)
    .match(/\d+(?:\.\d+)?/g)
    ?.map((item) => Number.parseFloat(item))
    .filter((item) => Number.isFinite(item)) ?? [];

  if (numbers.length >= 2 && numbers[1] >= numbers[0]) {
    return numbers[1] - numbers[0];
  }

  return 3;
}

function parseObjectValue(value: unknown): JsonRecord {
  if (isRecord(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return {};
  }

  try {
    return toRecord(parseJsonObjectText(value));
  } catch {
    return {};
  }
}

function parseList(value: unknown) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
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
  const cleaned = cleanJsonText(text);

  if (!cleaned) {
    throw new Error("LangGraph model returned an empty JSON response.");
  }

  for (const candidate of buildJsonCandidates(cleaned)) {
    try {
      return JSON.parse(candidate) as unknown;
    } catch {
      continue;
    }
  }

  throw new Error("LangGraph model response did not contain a valid JSON object.");
}

function buildJsonCandidates(text: string) {
  return [text, ...Array.from(text.matchAll(/\{/g), (match) => text.slice(match.index).trim())];
}

function cleanJsonText(value: string) {
  let text = stripThink(value).trim();

  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }

  return text.trim();
}

function stripThink(text: string) {
  if (text.includes("</think>")) {
    text = text.slice(text.lastIndexOf("</think>") + "</think>".length);
  }

  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

function toRecord(value: unknown): JsonRecord {
  return isRecord(value) ? value : {};
}

function toRecordArray(value: unknown): JsonRecord[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasKeys(value: JsonRecord) {
  return Object.keys(value).length > 0;
}

function asList(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(readString).filter(Boolean) : [];
}

function readString(value: unknown) {
  return typeof value === "string" ? stripThink(value).trim() : "";
}

function firstNonEmpty(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && stripThink(value).trim()) {
      return stripThink(value).trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }

    if (typeof value === "boolean") {
      return String(value);
    }
  }

  return "";
}

function readNumber(value: unknown, fallback: number) {
  return readNumberOrNull(value) ?? fallback;
}

function readPositiveIntEnv(name: string) {
  const parsed = Number.parseInt(process.env[name] ?? "", 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function readNumberOrNull(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseFloat(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function containsRisk(value: unknown) {
  const text = String(value ?? "");

  return riskTerms.some((term) => text.includes(term));
}

function scrubRiskText(value: string) {
  let text = stripThink(String(value ?? ""));

  for (const term of [...riskTerms].sort((a, b) => b.length - a.length)) {
    text = text.replaceAll(term, "合规敏感表述");
  }

  return text
    .replace(/(合规敏感表述[、,，/\s]*){2,}/g, "合规敏感表述")
    .replaceAll("如合规敏感表述等", "相关表述")
    .replaceAll("例如合规敏感表述", "相关表述")
    .replaceAll("已过滤风险词：合规敏感表述", "已处理合规风险表述")
    .trim();
}

function compactStrings(values: string[]) {
  return values.filter((value) => value.trim());
}

function getLangGraphContentWorkflowVersion() {
  return process.env.LANGGRAPH_CONTENT_WORKFLOW_VERSION?.trim() || "content-v31-dify-node-parity";
}
