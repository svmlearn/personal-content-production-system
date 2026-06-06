# 2026-06-06 小红书 Dify content-generation worker 真实运行记录

## 范围

验证小红书内容平台 `content-generation worker` 是否能调用真实 Dify workflow，并确认 `今日内容` 的图文 / 视频脚本是否来自 Dify 写回，而不是前端 mock 或 daily task fallback。

## 环境配置

服务器：

- IP：`43.129.207.237`
- 应用目录：`/opt/personal-website/apps/content-growth-platform`
- PM2 服务：`content-growth-platform`

本轮更新服务器 `.env.production`：

- 新增 / 更新 `DIFY_API_KEY`
- 备份：`.env.production.bak-dify-20260606044658`
- 未记录 key 明文

服务器配置状态：

- `DIFY_BASE_URL=https://api.dify.ai/v1`
- `DIFY_API_KEY=SET`
- `DIFY_WORKFLOW_RESPONSE_MODE=streaming`
- `DIFY_WORKFLOW_TIMEOUT_SECONDS=900`
- `DIFY_MOCK_FINAL_RESULT_JSON=MISSING`
- `CONTENT_GENERATION_WORKER_SECRET=SET`
- `APP_BASE_URL=https://xhs.2young.xin`

执行：

- `pm2 restart content-growth-platform --update-env`
- 重启后 `content-growth-platform` online，pid `601086`

## 真实运行过程

为避免污染今天演示页，创建了一个远期测试批次：

- 测试日期：`2026-07-31`
- `memberScope=self`
- `days=1`
- `extraRequirement=codex-real-dify-20260606-0452`

创建结果：

- login status：`303`
- batch id：`346e0b65-fced-4ab4-87e2-ef9cd0f31dd4`
- job id：`2e1be0b4-f33a-439a-85a5-aafa22aa1a39`
- daily task id：`32e11e57-a138-4aec-a4ce-a0f2da844aab`
- job 初始状态：`pending`

随后用 run-once 模式执行 worker：

- 首次直接 `source .env.production` 失败，原因是 env 文件中存在未加引号且包含空格的值，shell 把其中一段当命令执行。
- 改用 Node 解析 `.env.production` 并注入环境变量后，worker 成功启动。
- worker 输出：
  - `content_generation_worker_started`
  - `content_generation_job_processed`
  - `processed=true`
  - `status=failed_retryable`
  - `currentStage=failed`
  - `elapsedMs=7021`

## 第一层失败：应用提前截断 Dify stream

失败 job 的应用侧错误：

```text
Dify workflow stream did not return outputs.final_result_json.
```

只读诊断 Dify SSE 事件后发现：

- HTTP `200`
- content type：`text/event-stream`
- 第一个 `node_finished` 事件状态为 `succeeded`
- 该节点 outputs 只有：
  - `calendar_task_json`
  - `viral_references_json`
  - `image_assets_json`
  - `fallback_knowledge_text`
  - `extra_requirement`
- 没有 `final_result_json`

根因：

- `dify-workflow-client.ts` 旧逻辑把任何 SSE event 的 `status=succeeded|failed|stopped` 都当成 terminal。
- Dify 的普通节点完成事件 `node_finished` 也会带 `status=succeeded`。
- 因此应用在 Start 节点完成时提前退出，没有等到真正的 `workflow_finished`。

修复：

- `apps/content-growth-platform/src/server/api/dify-workflow-client.ts`
  - streaming 终止条件改为只认 `workflow_finished` / `message_end`
  - 不再把普通节点的 `status=succeeded|failed|stopped` 当成 workflow 终点
  - workflow terminal failed/stopped 且没有 `final_result_json` 时，抛出 `DIFY_WORKFLOW_FAILED` 并保留 Dify 原始错误
- `apps/content-growth-platform/src/server/api/content-generation-worker-contract.test.ts`
  - 增加回归断言，防止 Dify streaming 再因为节点状态提前退出

## 第二层失败：Dify 内部模型 key 无效

用修正后的终止逻辑重新诊断同一输入，结果：

- HTTP `200`
- Dify workflow 能启动
- 最终 terminal event：`workflow_finished`
- terminal status：`failed`
- workflow run id：`2f299537-b959-49e8-9f58-fd36e1ef0d17`
- terminal outputs：空
- terminal error：

```text
PluginInvokeError: [models] Error: API request failed with status code 401: "Api key is invalid"
```

判断：

- 服务器的 `DIFY_API_KEY` 是可用的，至少能启动 Dify workflow。
- 当前阻塞点在 Dify workflow 内部的模型节点。
- 需要在 Dify 控制台修复该 workflow 使用的模型供应商 API key。
- 这不是小红书应用服务器 `.env.production` 里的 `DIFY_API_KEY` 问题。

## fallback / mock 判断

本轮确认：

- 服务器没有设置 `DIFY_MOCK_FINAL_RESULT_JSON`，所以不是应用侧硬 mock。
- 页面里已有的 `generatedArticle` / `generatedVideoScript` 可能来自 daily task 初始化 fallback。
- 判断真实 Dify 是否成功，必须看：
  - `content_generation_jobs.status`
  - `content_generation_jobs.dify_workflow_run_id`
  - `content_generation_jobs.output_json`
  - `daily_content_tasks.article_task.generationStatus`
  - `daily_content_tasks.video_task.generationStatus`
  - `contentDraftId` / `contentVariantId`

本次测试 job 没有成功写入 Dify 输出：

- `dify_workflow_run_id=null`
- `output_json=null`
- `content_draft_id=null`
- `article_variant_id=null`
- `video_variant_id=null`
- daily task 的 generation status 被标记为 `failed`

## 清理动作

因为 `claimNextContentGenerationJob` 会继续捡起 `failed_retryable` 且 attempt 未达上限的 job，为避免后续常驻 worker 重跑测试任务，本轮清理了远期测试数据：

- deleted jobs：`1`
- deleted batch：`1`
- deleted daily task：`1`

清理对象：

- job：`2e1be0b4-f33a-439a-85a5-aafa22aa1a39`
- batch：`346e0b65-fced-4ab4-87e2-ef9cd0f31dd4`
- daily task：`32e11e57-a138-4aec-a4ce-a0f2da844aab`

## 本地验证

通过：

```bash
pnpm --dir apps/content-growth-platform exec jiti ../../apps/content-growth-platform/src/server/api/content-generation-worker-contract.test.ts
git diff --check
pnpm --dir apps/content-growth-platform lint
pnpm --dir apps/content-growth-platform build
```

lint 仍有 2 个既有 warning：

- `scripts/migrate-factory-source-items-to-merchant-media.mjs` 的 `sourceItem` 未使用
- `src/server/api/video-job-payload.ts` 的 `buildMissingVideoAssetHints` 未使用

## 当前状态

Dify app key 已配置到服务器，worker 可以启动并调用 Dify workflow。

真实内容生成闭环仍未完成，当前阻塞点是 Dify 控制台内模型供应商 API key 无效。

代码侧已修复 Dify streaming 提前终止 bug，并已提交、推送、部署到服务器。

部署状态：

- commit：`2ea7476 fix: wait for dify workflow terminal events`
- Gitee `main`：已推送到 `2ea7476`
- 服务器 `/opt/personal-website`：已 fast-forward 到 `2ea7476`
- 服务器 build：`pnpm --dir apps/content-growth-platform build` 通过
- PM2：`content-growth-platform` 已重启，pid `605026`

## 下一步

1. 在 Dify 控制台修复该 workflow 使用的模型供应商 API key。
2. 重新创建一个低污染测试 batch。
3. run-once 执行 `content-generation worker`。
4. 验证：
   - `content_generation_jobs.status=succeeded`
   - `dify_workflow_run_id` 有真实值
   - `output_json` 有 Dify `final_result_json`
   - `daily_content_tasks` 写入 Dify 生成的 `generatedArticle` / `generatedVideoScript`
   - `/api/member/tasks/today?date=<测试日期>` 返回同一份内容
