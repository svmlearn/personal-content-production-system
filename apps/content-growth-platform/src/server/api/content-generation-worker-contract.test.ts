import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workerSource = readFileSync(
  new URL("../../../scripts/content-generation-worker.mjs", import.meta.url),
  "utf8",
);
const runNextRouteSource = readFileSync(
  new URL("../../app/api/content-generation/jobs/run-next/route.ts", import.meta.url),
  "utf8",
);
const serviceSource = readFileSync(
  new URL("./content-generation-batch-service.ts", import.meta.url),
  "utf8",
);
const difyWorkflowClientSource = readFileSync(
  new URL("./dify-workflow-client.ts", import.meta.url),
  "utf8",
);
const langGraphWorkflowSource = readFileSync(
  new URL("./langgraph-content-workflow.ts", import.meta.url),
  "utf8",
);
const difyFinalJsonMapperSource = readFileSync(
  new URL("./dify-final-json-mapper.ts", import.meta.url),
  "utf8",
);
const difyPromptSource = readFileSync(
  new URL("./dify-v31-node-prompts.ts", import.meta.url),
  "utf8",
);

test("content generation worker only drives the run-next single-job route", () => {
  assert.match(workerSource, /CONTENT_GENERATION_WORKER_RUN_ONCE/);
  assert.match(workerSource, /api\/content-generation\/jobs\/run-next/);
  assert.match(workerSource, /concurrency: 1/);
  assert.doesNotMatch(workerSource, /Promise\.all/);
  assert.doesNotMatch(workerSource, /\/api\/video-edit-jobs/);
  assert.doesNotMatch(workerSource, /OpenStoryline|FireRed|video-worker/);
});

test("run-next route remains worker-secret protected and processes at most one job", () => {
  assert.match(runNextRouteSource, /CONTENT_GENERATION_WORKER_SECRET/);
  assert.match(runNextRouteSource, /x-content-generation-worker-secret/);
  assert.match(runNextRouteSource, /runNextContentGenerationJob\(\)/);
});

test("workflow transient failures are retryable while missing keys are manual", () => {
  assert.match(serviceSource, /isRetryableContentGenerationError/);
  assert.match(serviceSource, /DIFY_API_KEY_MISSING/);
  assert.match(serviceSource, /isMissingAiRuntimeKeyError/);
  assert.match(serviceSource, /failed_retryable|retryable/);
  assert.doesNotMatch(serviceSource, /retryable: false/);
});

test("content generation defaults new batches to LangGraph while retaining Dify fallback", () => {
  assert.match(serviceSource, /defaultContentGenerationWorkflowProvider: ContentGenerationProvider = "langgraph"/);
  assert.match(serviceSource, /CONTENT_GENERATION_WORKFLOW_PROVIDER/);
  assert.match(serviceSource, /runLangGraphContentWorkflow/);
  assert.match(serviceSource, /merchantId: job\.merchantId/);
  assert.match(serviceSource, /runDifyWorkflow/);
});

test("Dify workflow inputs are compacted before reaching Start node limits", () => {
  assert.match(serviceSource, /const difyInputMaxChars = 5800/);
  assert.match(serviceSource, /buildDifyCalendarTaskForDify/);
  assert.match(serviceSource, /compactTeamCalendarSourceForDify/);
  assert.match(serviceSource, /calendar_task_json: stringifyDifyJsonInput\(difyCalendarTask\)/);
  assert.match(serviceSource, /fallback_knowledge_text: clampDifyInputText\(fallbackKnowledgeText\)/);
  assert.doesNotMatch(serviceSource, /calendar_task_json: JSON\.stringify\(calendarTask\)/);
});

test("Dify streaming waits for workflow terminal events instead of node status", () => {
  assert.match(difyWorkflowClientSource, /eventName === "workflow_finished"/);
  assert.match(difyWorkflowClientSource, /eventName === "message_end"/);
  assert.match(difyWorkflowClientSource, /DIFY_WORKFLOW_FAILED/);
  assert.doesNotMatch(difyWorkflowClientSource, /input\.status === "succeeded"/);
  assert.doesNotMatch(difyWorkflowClientSource, /input\.status === "failed"/);
  assert.doesNotMatch(difyWorkflowClientSource, /input\.status === "stopped"/);
});

test("LangGraph content workflow preserves Dify V3.1 LLM nodes and final JSON contract", () => {
  assert.match(langGraphWorkflowSource, /new StateGraph\(LangGraphContentState\)/);
  assert.match(langGraphWorkflowSource, /difyV31NodePrompts/);
  assert.match(langGraphWorkflowSource, /\.addNode\("task_understanding"/);
  assert.match(langGraphWorkflowSource, /\.addNode\("kb_project_knowledge"/);
  assert.match(langGraphWorkflowSource, /searchKnowledgeChunks/);
  assert.match(langGraphWorkflowSource, /createEmbeddings/);
  assert.match(langGraphWorkflowSource, /task_understanding_query_to_user_knowledge_base/);
  assert.match(langGraphWorkflowSource, /const topK = 6/);
  assert.match(langGraphWorkflowSource, /"task_understanding", "kb_project_knowledge"/);
  assert.match(langGraphWorkflowSource, /"kb_project_knowledge", "creative_strategy"/);
  assert.match(langGraphWorkflowSource, /\.addNode\("creative_strategy"/);
  assert.match(langGraphWorkflowSource, /\.addNode\("title_cover"/);
  assert.match(langGraphWorkflowSource, /\.addNode\("article_body"/);
  assert.match(langGraphWorkflowSource, /\.addNode\("article_compiler"/);
  assert.match(langGraphWorkflowSource, /\.addNode\("video_narrative"/);
  assert.match(langGraphWorkflowSource, /\.addNode\("scene_breakdown"/);
  assert.match(langGraphWorkflowSource, /\.addNode\("delivery_compiler"/);
  assert.match(langGraphWorkflowSource, /\.addNode\("quality_reviewer"/);
  assert.match(langGraphWorkflowSource, /\.addNode\("content_risk_rewriter"/);
  assert.match(langGraphWorkflowSource, /\.addNode\("final_compiler"/);
  assert.match(langGraphWorkflowSource, /parseDifyFinalJson/);
  assert.match(langGraphWorkflowSource, /LANGGRAPH_MOCK_FINAL_RESULT_JSON/);
  assert.doesNotMatch(langGraphWorkflowSource, /deterministic_knowledge_fallback/);
  assert.doesNotMatch(langGraphWorkflowSource, /buildSystemPrompt/);
  assert.doesNotMatch(langGraphWorkflowSource, /\.addNode\("draft_content"/);
  assert.doesNotMatch(langGraphWorkflowSource, /\.addNode\("repair_content"/);
});

test("LangGraph article compiler accepts actual Dify title and body field variants", () => {
  assert.match(langGraphWorkflowSource, /articleBody\.blocks/);
  assert.match(langGraphWorkflowSource, /articleBody\.contentBlocks/);
  assert.match(langGraphWorkflowSource, /articleBody\.text/);
  assert.match(langGraphWorkflowSource, /articleBody\.images/);
  assert.match(langGraphWorkflowSource, /titleCover\.bestTitle/);
  assert.match(langGraphWorkflowSource, /titleCover\.selectedTitle/);
  assert.match(langGraphWorkflowSource, /titleCover\.bestCoverCopy/);
  assert.match(langGraphWorkflowSource, /titleCover\.selectedCoverCopy/);
  assert.match(langGraphWorkflowSource, /item\.title/);
  assert.match(langGraphWorkflowSource, /item\.text/);
  assert.match(langGraphWorkflowSource, /block\.content/);
  assert.match(langGraphWorkflowSource, /block\.body/);
  assert.match(langGraphWorkflowSource, /block\.copy/);
  assert.match(langGraphWorkflowSource, /image\.description/);
  assert.match(langGraphWorkflowSource, /block\.imageBrief/);
  assert.match(langGraphWorkflowSource, /readString\(image\.assetId\)/);
});

test("Dify V3.1 node prompts keep ids while using generic content framing", () => {
  assert.match(difyPromptSource, /task-understanding-system/);
  assert.match(difyPromptSource, /task-understanding-user/);
  assert.match(difyPromptSource, /creative-strategy-system/);
  assert.match(difyPromptSource, /creative-strategy-user/);
  assert.match(difyPromptSource, /title-cover-system/);
  assert.match(difyPromptSource, /title-cover-user/);
  assert.match(difyPromptSource, /article-body-system/);
  assert.match(difyPromptSource, /article-body-user/);
  assert.match(difyPromptSource, /video-narrative-system/);
  assert.match(difyPromptSource, /video-narrative-user/);
  assert.match(difyPromptSource, /scene-breakdown-system/);
  assert.match(difyPromptSource, /scene-breakdown-user/);
  assert.match(difyPromptSource, /content-risk-rewriter-system/);
  assert.match(difyPromptSource, /content-risk-rewriter-user/);
  assert.match(difyPromptSource, /你是内容生产工作流中的“任务理解节点”/);
  assert.match(difyPromptSource, /你是短视频分镜编排师/);
  assert.match(difyPromptSource, /\{\{#start\.calendar_task_json#\}\}/);
  assert.match(difyPromptSource, /\{\{#creative_strategy\.text#\}\}/);
});

test("LangGraph content workflow runtime avoids hard-coded real-estate fallback language", () => {
  const hardCodedRealEstateTerms =
    /房地产|房产|楼盘|楼栋|户型|样板间|沙盘|售楼处|中介|买房|看房|刚需|小区|地铁|学区|租金|业主|开发商|空间动线|项目实景|带看|月供|首付|满租|保值|增值|收租/;

  assert.doesNotMatch(difyPromptSource, hardCodedRealEstateTerms);
  assert.doesNotMatch(langGraphWorkflowSource, hardCodedRealEstateTerms);
  assert.doesNotMatch(serviceSource, hardCodedRealEstateTerms);
  assert.doesNotMatch(difyFinalJsonMapperSource, hardCodedRealEstateTerms);
});
