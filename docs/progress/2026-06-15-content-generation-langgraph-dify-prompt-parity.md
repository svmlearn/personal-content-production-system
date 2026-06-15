# 2026-06-15 内容生成 LangGraph Dify V3.1 Prompt Parity 记录

## 问题原貌

用户追问确认：默认是否已经是 LangGraph，并明确要求 Dify 工作流里每个 LLM 节点的 system prompt / user prompt 必须原原本本保留下来，写到 LangGraph 节点里。

复查发现上一版实现虽然已把新内容生成批次默认切到 LangGraph，但 `langgraph-content-workflow.ts` 只是简化成：

- `draft_content`
- `validate_content`
- `repair_content`
- `validate_repair`

这不是 Dify V3.1 的逐节点迁移，不能满足 prompt parity。

## 根因判断

上一版实现只解决 provider 切换和 final JSON contract，没有按历史 Dify YAML 恢复原工作流的 LLM 节点和 prompt 模板。

本轮以本地 Dify V3.1 YAML 为来源：

```text
refrences/小红书抖音矩阵获客平台/docs/探索/2026-05-11-用dify来测试链路/2026-05-13-142434-内容日历生成图文与视频脚本-Dify工作流-V3.1-最终JSON收敛.yml
```

历史 progress / handoff 也确认 V3.1 未改 LLM prompt，只调整结构化输出和最终 JSON 收敛，因此该 YAML 是本轮 prompt parity 的正确来源。

## 实际改动

新增：

- `apps/content-growth-platform/src/server/api/dify-v31-node-prompts.ts`

该文件从 Dify V3.1 YAML 机械抽取并保留 7 个 LLM 节点的原始 prompt：

- `task_understanding`
- `creative_strategy`
- `title_cover`
- `article_body`
- `video_narrative`
- `scene_breakdown`
- `content_risk_rewriter`

每个节点保留：

- `title`
- `description`
- `systemPromptId`
- `systemPrompt`
- `userPromptId`
- `userPrompt`

重写：

- `apps/content-growth-platform/src/server/api/langgraph-content-workflow.ts`

新的 LangGraph 图结构使用 Dify 原节点名：

```text
task_understanding
kb_project_knowledge
creative_strategy
title_cover
article_body
article_compiler
video_narrative
scene_breakdown
delivery_compiler
quality_reviewer
content_risk_rewriter
final_compiler
validate_final
```

LLM 节点调用规则：

- system message 直接使用 `difyV31NodePrompts[nodeId].systemPrompt`
- user message 使用 `difyV31NodePrompts[nodeId].userPrompt`
- 仅对 user prompt 中的 Dify 变量占位符 `{{#...#}}` 做运行时插值
- 不重写、不摘要、不改写 prompt 模板文本

Code 节点处理：

- `article_compiler`
- `delivery_compiler`
- `quality_reviewer`
- `final_compiler`

以上节点用 TypeScript 端口实现 Dify code node 的拼接、归一化、质检、final JSON 收敛逻辑，输出仍走现有 `parseDifyFinalJson` contract。

## 验证证据

通过：

```bash
pnpm --dir apps/content-growth-platform typecheck
node --test apps/content-growth-platform/src/server/api/content-generation-worker-contract.test.ts
node --test apps/content-growth-platform/src/server/api/content-generation-batch-service-contract.test.ts
node --test apps/content-growth-platform/src/server/api/dify-final-json-mapper.test.ts
node --test apps/content-growth-platform/src/lib/db/content-generation-repository-phase-2d-contract.test.mjs
pnpm --dir apps/content-growth-platform lint
```

新增 / 更新的 source-level contract 覆盖：

- LangGraph 必须引用 `difyV31NodePrompts`
- LangGraph 必须包含 Dify V3.1 节点名
- LangGraph 不得再出现 `draft_content` / `repair_content` 简化节点
- LangGraph 不得再出现简化 `buildSystemPrompt`
- prompt 常量文件必须包含 7 个 LLM 节点的 system/user prompt id
- prompt 常量文件必须包含 Dify 原 prompt 关键片段和 `{{#...#}}` 变量占位符

另做了一次机械 prompt parity 校验：

- 从 Dify V3.1 YAML 重新抽取 7 个 LLM 节点 prompt 到临时文件。
- 与 `apps/content-growth-platform/src/server/api/dify-v31-node-prompts.ts` 执行 `diff -u`。
- diff 无输出，确认当前 prompt 常量与 YAML 抽取结果一致。

### 服务器真实 LangGraph Smoke

服务器：

- Host: `43.129.207.237`
- 临时目录：`/tmp/personal-website-langgraph-test`
- 临时服务：`127.0.0.1:3011`
- 正式服务 / PM2：未重启，未改 `/opt/personal-website`
- 模型 key：使用服务器现有 `SILICONFLOW_API_KEY`，未读取或记录明文；直连 `deepseek-ai/DeepSeek-V4-Flash` 返回 `正常`

真实运行过程：

1. 第一轮以默认平台 LLM timeout 跑 LangGraph job，进入 `calling_langgraph`，失败：
   - job id: `bbd5841b-d645-481e-8f9a-ab17518107c9`
   - error: `The operation was aborted due to timeout`
2. 增加 `LANGGRAPH_LLM_TIMEOUT_SECONDS` 并补节点错误上下文后复跑，定位到：
   - error: `LangGraph node scene_breakdown failed: The operation was aborted due to timeout`
3. 将 LangGraph 节点 timeout 提到 `300s` 后，`scene_breakdown` 跑过，暴露 final JSON 必填字段兜底问题：
   - `Dify final JSON missing video.scenes[0].purpose.`
   - `Dify final JSON missing article.title.`
4. 修复 `normalizeScene` 和 final article compile 的兜底后，新建第三个 smoke batch，真实跑通：
   - batch id: `d3acfb73-4fcf-4d29-8a46-2e944330e0db`
   - job id: `c73ccecc-8039-42cf-950f-ad3895491703`
   - status: `succeeded`
   - current stage: `persisted`
   - workflow provider: `langgraph`
   - workflow version: `content-v31-dify-node-parity`
   - workflow run id: `langgraph-742f3754-26fe-4d06-b0cd-b41a2899dba9`
   - content draft id: `cc4843d0-2830-4981-b9e9-a03a968716e6`
   - article title: `看了20个盘，还是这个最对味`
   - video scene count: `11`
   - risk terms: `[]`
   - draft input snapshot: `workflowProvider=langgraph`
   - draft raw outputs include: `task_understanding=true`, `scene_breakdown=true`

测试清理：

- 失败的前两轮 smoke batch/job/daily task/临时 merchant/user 已清理。
- 成功样本保留，用于后续线上排查和验收。
- 临时 `3011` Next 服务已停止。

lint 仍只有两个既有 warning：

- `scripts/migrate-factory-source-items-to-merchant-media.mjs` 的 `sourceItem` 未使用。
- `src/server/api/video-job-payload.ts` 的 `buildMissingVideoAssetHints` 未使用。

## 半成功与未覆盖范围

- 已追加服务器真实 smoke，确认链路可跑通；但真实耗时偏长，且 `scene_breakdown` 这类长 prompt 节点需要 `LANGGRAPH_LLM_TIMEOUT_SECONDS=300` 才更稳。
- 真实 smoke 覆盖了一个最小测试商户 / 单日任务，不等于覆盖所有真实商家素材、知识库和内容日历场景。
- `kb_project_knowledge` 在应用内没有 Dify 知识库 runtime，对应实现是确定性兜底：把手工知识文本、任务理解结果和原始任务拼成 `kb_project_knowledge.result`。
- Dify Code 节点已用 TypeScript 端口实现核心逻辑，但不是逐行运行 Python code。需要更严格 parity 时，可继续把 YAML 内的 code node 增加快照测试。
- 这仍是应用内 `StateGraph`，不是 LangGraph Platform durable workflow。

## 回滚路径

短期回滚到 Dify：

```text
CONTENT_GENERATION_WORKFLOW_PROVIDER=dify
```

代码回滚入口仍在：

- `runDifyWorkflow`
- `createDifyDailyTaskGenerationBatchForUser`
- `runNextDifyContentGenerationJob`

## 未来排查入口

如果后续发现“LangGraph 生成效果和 Dify 不一致”，先查：

1. `apps/content-growth-platform/src/server/api/dify-v31-node-prompts.ts` 是否仍与 V3.1 YAML prompt 文本一致。
2. `langgraph-content-workflow.ts` 的 `renderDifyPromptTemplate` 是否正确替换了 `{{#...#}}` 变量。
3. `rawOutputs.<nodeId>.text` 中每个 LLM 节点实际返回的 JSON。
4. `rawOutputs.article_compiler / delivery_compiler / quality_reviewer / final_compiler` 是否出现 TypeScript code node 端口差异。
5. `content_generation_jobs.output_json` 和 `content_drafts.input_snapshot.workflowFinalJson` 是否仍满足 final JSON contract。
