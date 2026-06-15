# 2026-06-15 内容生成链路改为 LangGraph provider 记录

## 问题原貌

用户希望把小红书 / 抖音矩阵中“调用 Dify 生成今日内容”的链路改成 LangGraph 实现，并提到当时可能预留了接口。

本轮检查确认：

- 数据库迁移 `content_generation_batches.workflow_provider` 和 `content_generation_jobs.workflow_provider` 已允许 `dify` / `langgraph`。
- TypeScript contract `ContentGenerationProvider` 已是 `"dify" | "langgraph"`。
- 但服务实现仍固定创建 Dify job，worker 也固定 `claimNextContentGenerationJob({ provider: "dify" })`。

## 根因判断

当时只完成了 provider 字段和数据库约束预留，没有把 service / worker 层真正抽象成 provider-aware runtime。

关键证据：

- `createDifyDailyTaskGenerationBatchForUser` 固定写入 `workflowProvider: "dify"`。
- `runNextDifyContentGenerationJob` 固定领取 Dify job。
- `dify-workflow-client.ts` 是唯一真实外部 workflow 调用入口。

## 实际改动

分支 / worktree：

- Branch: `codex/content-langgraph-provider`
- Worktree: `/Users/wy/Desktop/个人IP/个人网站搭建-worktrees/content-langgraph-provider`
- Base: `main` at `87b38c6`
- Implementation commit: `85ef446dd4eb1d0365eb376f9ad0f34f4722642a`
- Branch tip: 以交付时 `git rev-parse HEAD` 为准；commit hash 不能可靠写入自身提交内容。

核心代码：

- 新增 `apps/content-growth-platform/src/server/api/langgraph-content-workflow.ts`
  - 使用 `@langchain/langgraph` 的 `StateGraph / Annotation / START / END`。
  - graph 节点：`draft_content -> validate_content -> repair_content -> validate_repair`。
  - 模型调用复用现有 OpenAI-compatible `createChatCompletion` 和平台 `llmRuntime`，不新增另一套模型 key。
  - 输出继续走现有 `parseDifyFinalJson` 合同，确保后续图文包、视频脚本、草稿、成员端展示复用旧落库链路。
  - 支持 `LANGGRAPH_MOCK_FINAL_RESULT_JSON` 作为本地 / CI mock。

- 更新 `content-generation-batch-service.ts`
  - 新批次默认 provider 改为 `langgraph`。
  - 支持 `CONTENT_GENERATION_WORKFLOW_PROVIDER=dify|langgraph` 选择新批次 provider。
  - 保留 `createDifyDailyTaskGenerationBatchForUser` / `runNextDifyContentGenerationJob` 包装函数作为旧代码兼容和回滚入口。
  - worker run-next 改为按 job 自身 `workflowProvider` 分派到 Dify 或 LangGraph。
  - job input snapshot 新增 generic `workflowInputs`，同时保留 `difyInputs` 兼容旧合同。
  - draft input snapshot 新增 `workflowFinalJson/workflowRawOutputs`；Dify job 保留 `difyFinalJson/difyRawOutputs`，LangGraph job 写入 `langgraphFinalJson/langgraphRawOutputs`。

- 更新 `content-generation-repository.ts`
  - running stage 从固定 `calling_dify` 改为 provider-aware：
    - Dify: `calling_dify`
    - LangGraph: `calling_langgraph`

- 更新 API route
  - `/api/content-generation/batches` 调用 generic `createContentGenerationBatchForUser`。
  - `/api/content-generation/batches/[batchId]` 调用 generic status 函数。
  - `/api/content-generation/jobs/run-next` 调用 generic `runNextContentGenerationJob`。

- 更新 UI 文案
  - 商家今日内容页从 “Dify 队列中 / Dify 已生成” 改为 “AI 队列中 / AI 已生成”。
  - 成员端复用日历脚本文案从 Dify 改为内容日历 AI 生成。

- 更新依赖
  - `@langchain/langgraph`
  - `@langchain/core`

## 验证证据

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

验证结论：

- TypeScript 通过。
- Next production build 通过。
- content-generation worker 契约测试通过，确认 run-next 已切到 generic 函数，LangGraph 默认 provider 和 Dify fallback 都被断言覆盖。
- repository 契约测试通过，确认 PostgreSQL queue locking / attempt increment / provider-aware stage 仍存在。
- final JSON mapper 测试通过，确认 LangGraph 复用的输出合同未变。
- lint 通过，仍有 2 个既有 warning：
  - `scripts/migrate-factory-source-items-to-merchant-media.mjs` 的 `sourceItem` 未使用。
  - `src/server/api/video-job-payload.ts` 的 `buildMissingVideoAssetHints` 未使用。

## 半成功与未覆盖范围

- 本轮没有调用真实线上 LLM 生成内容，也没有创建真实 `content_generation_jobs` 数据。
- 本轮验证覆盖了编译、构建、契约和 source-level regression，不覆盖真实模型质量、真实 token 成本、真实生成时延。
- LangGraph 产出仍依赖当前平台 `llmRuntime` 和 `SILICONFLOW_API_KEY / LLM_API_KEY / OPENAI_API_KEY`。如果服务器缺少这些 key，LangGraph job 会失败并进入非重试 manual failure。
- 当前 LangGraph 实现是应用内 graph，不是 LangGraph Platform / LangSmith 部署，不包含 durable checkpoint。

## 正式部署记录

用户确认后，本轮已把代码合并并部署到服务器。

本地 / 远端代码状态：

- Main: fast-forward from `87b38c6` to `e2af3d4`
- Gitee `origin/main`: pushed `87b38c6..e2af3d4`
- GitHub `github/main`: ordinary push rejected because remote `main` is a divergent history (`2f17a60`) with a different layout; do not force-push without explicit confirmation.

服务器：

- Host: `43.129.207.237`
- Repo: `/opt/personal-website`
- Deployed HEAD: `e2af3d4`
- `git status --short`: clean after deploy

执行动作：

```bash
git fetch origin main
git merge --ff-only origin/main
pnpm install --frozen-lockfile
pnpm --dir apps/content-growth-platform build
pm2 restart content-growth-platform --update-env
pm2 restart content-generation-worker --update-env
pm2 save
```

生产 env 更新：

- `.env.production` 已备份到 `.env.production.bak-20260616005409`
- `CONTENT_GENERATION_WORKFLOW_PROVIDER=langgraph`
- `LANGGRAPH_CONTENT_WORKFLOW_VERSION=content-v31-dify-node-parity`
- `LANGGRAPH_LLM_TIMEOUT_SECONDS=300`

部署验证：

- 生产构建通过。
- PM2 `content-growth-platform` online。
- PM2 `content-generation-worker` online。
- worker 真实子进程已读取：
  - `CONTENT_GENERATION_WORKFLOW_PROVIDER=langgraph`
  - `LANGGRAPH_CONTENT_WORKFLOW_VERSION=content-v31-dify-node-parity`
  - `LANGGRAPH_LLM_TIMEOUT_SECONDS=300`
- PM2 日志无本轮重启后的新错误；worker 已进入 idle 轮询。
- 临时 smoke 目录 `/tmp/personal-website-langgraph-test` 已删除，临时端口 `3011` 已释放。

健康检查：

```text
GET http://127.0.0.1:3001/api/health -> HTTP 503
app.status=ok
database.status=ok
storage.status=error
```

503 原因是生产 `.env.production` 里多个 `ALIYUN_OSS_*` 值为空，导致 OSS storage health 未配置；这不是本轮 LangGraph 迁移引入的问题。内容生成 worker 的 LangGraph provider 和模型 key 已验证进入真实 worker 子进程。

## 回滚路径

短期回滚无需回代码：

```text
CONTENT_GENERATION_WORKFLOW_PROVIDER=dify
```

然后重启应用和 content-generation worker。

代码层回滚：

- 旧 Dify client 仍保留。
- 旧 Dify wrapper 函数仍保留。
- Dify job 仍写 `difyFinalJson/difyRawOutputs`。

## 未来排查入口

如果线上生成失败，优先检查：

1. `content_generation_jobs.workflow_provider`
2. `content_generation_jobs.current_stage`
3. `content_generation_jobs.error_message`
4. `content_generation_jobs.output_json`
5. `content_generation_jobs.dify_workflow_run_id`，LangGraph job 这里会记录 `langgraph-<uuid>`
6. `content_drafts.input_snapshot.workflowProvider`
7. `content_drafts.input_snapshot.workflowFinalJson`
8. 服务器 env：`CONTENT_GENERATION_WORKFLOW_PROVIDER`、`LANGGRAPH_CONTENT_WORKFLOW_VERSION`、`SILICONFLOW_API_KEY` / `LLM_API_KEY` / `OPENAI_API_KEY`

## 后续修正：Dify V3.1 Prompt Parity

用户随后明确要求：Dify 工作流里每个 LLM 节点的 system prompt / user prompt 必须原原本本保留到 LangGraph 节点中。

因此，本记录中早期描述的简化 LangGraph 节点：

- `draft_content`
- `validate_content`
- `repair_content`
- `validate_repair`

已经被替换，不再是当前实现。

当前实现以 Dify V3.1 YAML 为来源，新增 `dify-v31-node-prompts.ts`，并把 LangGraph workflow 改成 Dify 原节点名：

- `task_understanding`
- `kb_project_knowledge`
- `creative_strategy`
- `title_cover`
- `article_body`
- `article_compiler`
- `video_narrative`
- `scene_breakdown`
- `delivery_compiler`
- `quality_reviewer`
- `content_risk_rewriter`
- `final_compiler`
- `validate_final`

详细记录见：

- `docs/progress/2026-06-15-content-generation-langgraph-dify-prompt-parity.md`
