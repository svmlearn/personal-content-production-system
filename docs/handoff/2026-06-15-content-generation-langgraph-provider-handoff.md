# 2026-06-15 内容生成 LangGraph provider 交接

## 当前目标

把小红书 / 抖音矩阵内容生成链路从固定 Dify 调用，改成默认 LangGraph provider，同时保留 Dify 回滚路径。

## 当前状态

已完成，待用户验收 / 待合并决策。

用户补充要求后已修正：上一版 LangGraph provider 只是简化 workflow，现在已按 Dify V3.1 YAML 把 LLM 节点的 system prompt / user prompt 原文抽出并接入 LangGraph 原节点名。

## Branch / Worktree

- Branch: `codex/content-langgraph-provider`
- Worktree: `/Users/wy/Desktop/个人IP/个人网站搭建-worktrees/content-langgraph-provider`
- Base: `main` at `87b38c6`
- Implementation commit: `85ef446dd4eb1d0365eb376f9ad0f34f4722642a`
- Branch tip: 以交付时 `git rev-parse HEAD` 为准；commit hash 不能可靠写入自身提交内容。
- Push: 未 push
- Merge: 未 merge

## 已完成内容

- 新增应用内 LangGraph workflow runner：
  - `apps/content-growth-platform/src/server/api/langgraph-content-workflow.ts`
  - 使用 `@langchain/langgraph`。
  - 复用现有 `createChatCompletion` 和平台 `llmRuntime`。
  - 输出仍校验为现有 final JSON contract。

- 新增 Dify V3.1 prompt 常量：
  - `apps/content-growth-platform/src/server/api/dify-v31-node-prompts.ts`
  - 来源是本地 Dify V3.1 YAML：
    `refrences/小红书抖音矩阵获客平台/docs/探索/2026-05-11-用dify来测试链路/2026-05-13-142434-内容日历生成图文与视频脚本-Dify工作流-V3.1-最终JSON收敛.yml`
  - 保留 7 个 LLM 节点的 `systemPromptId/systemPrompt/userPromptId/userPrompt` 原文：
    `task_understanding`、`creative_strategy`、`title_cover`、`article_body`、`video_narrative`、`scene_breakdown`、`content_risk_rewriter`。

- LangGraph 节点已改成 Dify V3.1 节点名：
  - LLM 节点直接引用 `difyV31NodePrompts`。
  - user prompt 仅替换 Dify 变量占位符 `{{#...#}}`。
  - `article_compiler / delivery_compiler / quality_reviewer / final_compiler` 用 TypeScript 端口实现 Dify code node 的收敛逻辑。
  - 已移除上一版 `draft_content / repair_content / buildSystemPrompt` 简化实现。

- 内容生成 service 改成 provider-aware：
  - 新批次默认 `langgraph`。
  - `CONTENT_GENERATION_WORKFLOW_PROVIDER=dify` 可回滚。
  - run-next worker 不再固定只取 Dify，改为按 job provider 分派。

- 保留兼容：
  - Dify client 未删除。
  - 旧 Dify wrapper 函数保留。
  - Dify job 仍写旧 `difyFinalJson/difyRawOutputs`。

- UI 文案去 Dify 化：
  - 今日内容页生成状态改成 AI 文案。
  - 成员端复用内容日历脚本的错误 / 提示文案不再写 Dify。

- 新增依赖：
  - `@langchain/langgraph`
  - `@langchain/core`

## 改动文件

- `apps/content-growth-platform/.env.example`
- `apps/content-growth-platform/package.json`
- `apps/content-growth-platform/src/app/api/content-generation/batches/route.ts`
- `apps/content-growth-platform/src/app/api/content-generation/batches/[batchId]/route.ts`
- `apps/content-growth-platform/src/app/api/content-generation/jobs/run-next/route.ts`
- `apps/content-growth-platform/src/components/member/member-workspace.tsx`
- `apps/content-growth-platform/src/components/merchant/daily-tasks-workspace.tsx`
- `apps/content-growth-platform/src/lib/db/content-generation-repository.ts`
- `apps/content-growth-platform/src/lib/db/content-generation-repository-phase-2d-contract.test.mjs`
- `apps/content-growth-platform/src/server/api/content-generation-batch-service.ts`
- `apps/content-growth-platform/src/server/api/content-generation-service.ts`
- `apps/content-growth-platform/src/server/api/content-generation-worker-contract.test.ts`
- `apps/content-growth-platform/src/server/api/dify-v31-node-prompts.ts`
- `apps/content-growth-platform/src/server/api/langgraph-content-workflow.ts`
- `pnpm-lock.yaml`
- `docs/progress/2026-06-15-content-generation-langgraph-provider.md`
- `docs/progress/2026-06-15-content-generation-langgraph-dify-prompt-parity.md`
- `docs/handoff/2026-06-15-content-generation-langgraph-provider-handoff.md`

## 验证结果

通过：

```bash
pnpm --dir apps/content-growth-platform typecheck
node --test apps/content-growth-platform/src/server/api/content-generation-worker-contract.test.ts
node --test apps/content-growth-platform/src/lib/db/content-generation-repository-phase-2d-contract.test.mjs
node --test apps/content-growth-platform/src/server/api/content-generation-batch-service-contract.test.ts
node --test apps/content-growth-platform/src/server/api/dify-final-json-mapper.test.ts
pnpm --dir apps/content-growth-platform lint
git diff --check
pnpm --dir apps/content-growth-platform build
```

服务器真实 smoke 也已跑通：

- 临时目录：`/tmp/personal-website-langgraph-test`
- 临时服务：`127.0.0.1:3011`
- 正式 PM2 服务未重启
- job id：`c73ccecc-8039-42cf-950f-ad3895491703`
- status：`succeeded`
- current stage：`persisted`
- workflow provider：`langgraph`
- workflow version：`content-v31-dify-node-parity`
- content draft id：`cc4843d0-2830-4981-b9e9-a03a968716e6`
- article title：`看了20个盘，还是这个最对味`
- video scene count：`11`
- risk terms：`[]`

lint 仍有两个既有 warning，不是本轮新增：

- `scripts/migrate-factory-source-items-to-merchant-media.mjs` 的 `sourceItem` 未使用。
- `src/server/api/video-job-payload.ts` 的 `buildMissingVideoAssetHints` 未使用。

## 未做 / 风险

- 未在真实服务器创建测试 batch。
- 未真实调用线上 LangGraph 内容生成，只做了编译、构建、契约测试。
- LangGraph 现在是应用内 `StateGraph`，不是外部 LangGraph Platform 服务。
- 真实生成质量取决于当前 `platform_settings.llm_runtime` 和 server env 中的模型 key。
- 真实 smoke 显示 `scene_breakdown` 长 prompt 节点在默认 60s / 180s 下可能超时；部署时建议设置 `LANGGRAPH_LLM_TIMEOUT_SECONDS=300` 并重启 app / worker。
- `kb_project_knowledge` 没有接入 Dify 知识库 runtime，目前是确定性兜底，把手工知识、任务理解和原始任务拼成 `kb_project_knowledge.result`。
- Code 节点是 TypeScript 端口，不是直接执行 YAML 中的 Python code；如果后续追求逐行 parity，需要补 code node 快照测试。

## 下一步建议

1. 用户验收代码改动。
2. 如要部署，先确认服务器 env 有可用 `SILICONFLOW_API_KEY` / `LLM_API_KEY` / `OPENAI_API_KEY`。
3. 部署后用远期日期创建 1 个测试 batch，观察：
   - job `workflow_provider=langgraph`
   - running stage `calling_langgraph`
   - succeeded 后 `output_json` 非空
   - `content_drafts.input_snapshot.workflowProvider=langgraph`
4. 如果线上生成质量或时延不满意，先用 env 回滚到 Dify：

```text
CONTENT_GENERATION_WORKFLOW_PROVIDER=dify
```
