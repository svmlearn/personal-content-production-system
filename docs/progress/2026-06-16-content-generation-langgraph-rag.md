# 2026-06-16 LangGraph 内容生成接入用户知识库 RAG

## 问题原貌

用户指出：原 Dify 工作流并不是只靠手工知识兜底，而是有知识库节点。拓扑应为：

```text
task_understanding -> kb_project_knowledge -> creative_strategy
```

其中 `task_understanding.text` 作为知识库 query，知识库检索结果写入 `kb_project_knowledge.result`，再给下一个大模型节点使用。

复查确认：

- Dify V3.1 YAML 的 `kb_project_knowledge` 节点类型是 `knowledge-retrieval`。
- `query_variable_selector` 是 `task_understanding.text`。
- `top_k` 是 `6`。
- 之前 LangGraph 迁移保留了节点名和 prompt 变量，但 `kb_project_knowledge` 只是把 `fallback_knowledge_text`、任务理解和原始日历任务拼起来，没有调用本地用户知识库。

## 根因判断

LangGraph provider 第一版只做了 prompt parity 和 final JSON contract parity，遗漏了 Dify 知识库节点的 runtime 行为。

本地项目已有用户知识库能力：

- 商户可上传知识文档。
- 知识文档入库为 `knowledge_documents` / `knowledge_chunks`。
- `replaceKnowledgeChunks` 会写 `embedding_json`。
- `searchKnowledgeChunks` 是已有知识库检索入口。

因此不应新增一套 RAG，而应让 LangGraph 的 `kb_project_knowledge` 节点复用现有知识库 repository。

## 实际改动

Worktree / branch:

- Worktree: `/Users/wy/Desktop/个人IP/个人网站搭建-worktrees/content-langgraph-rag`
- Branch: `codex/content-langgraph-rag`
- Base: `main` at `0bd4b22`

代码：

- `apps/content-growth-platform/src/server/api/content-generation-batch-service.ts`
  - 调用 `runLangGraphContentWorkflow` 时传入 `merchantId: job.merchantId`。
  - `merchantId` 只用于 RAG scope 过滤，不写进 prompt 文本。

- `apps/content-growth-platform/src/server/api/langgraph-content-workflow.ts`
  - LangGraph state 新增 `merchantId`、`knowledgeRuntime`、`knowledgeRetrievalQuery`。
  - `kb_project_knowledge` 从确定性兜底改为异步 RAG 节点。
  - query 使用 `taskUnderstandingText`，贴近 Dify YAML 的 `query_variable_selector: task_understanding.text`。
  - topK 使用 `min(knowledgeRuntime.retrievalTopK, 6)`，贴近 Dify `top_k: 6`。
  - 使用 `createEmbeddings` 生成 query embedding；embedding 失败时降级为 lexical search，不中断整个内容生成。
  - 调用 `searchKnowledgeChunks({ merchantId, query, limit, queryEmbedding })`。
  - `kb_project_knowledge.result` 现在是格式化后的知识库命中片段；没有命中时返回 `无知识库检索结果。`。
  - `rawOutputs.kb_project_knowledge` 记录 query、topK、embeddingMode、embeddingModel、matchCount 和 compact matches。

- `apps/content-growth-platform/src/lib/db/knowledge-repository.ts`
  - `knowledgeChunkSelect` 增加 `embedding_json`。
  - `searchKnowledgeChunks` 在有 `queryEmbedding` 且 chunk 有 `embedding_json` 时使用 cosine similarity。
  - chunk 没有 embedding 或维度不匹配时保留原 PostgreSQL text scoring fallback。
  - 不引入 Supabase RPC，也不依赖 pgvector 扩展；生产库只要有 `embedding_json` 就能做本地 cosine 排序。

测试：

- `content-generation-worker-contract.test.ts`
  - 断言 LangGraph provider 传入 `merchantId`。
  - 断言 LangGraph workflow 调用 `searchKnowledgeChunks` / `createEmbeddings`。
  - 断言 `task_understanding -> kb_project_knowledge -> creative_strategy` 边仍存在。
  - 断言不再出现 `deterministic_knowledge_fallback`。

- `knowledge-repository-phase-2c-contract.test.mjs`
  - 断言搜索会读取 `embedding_json`。
  - 断言使用 `scoreEmbedding` / `cosineSimilarity`。
  - 断言保留 text scoring fallback。
  - 断言仍不使用 `.rpc("match_knowledge_chunks")`。

## 验证证据

通过：

```bash
pnpm install --frozen-lockfile
pnpm --dir apps/content-growth-platform typecheck
node --test apps/content-growth-platform/src/server/api/content-generation-worker-contract.test.ts
node --test apps/content-growth-platform/src/lib/db/knowledge-repository-phase-2c-contract.test.mjs
git diff --check
pnpm --dir apps/content-growth-platform lint
pnpm --dir apps/content-growth-platform build
```

验证结论：

- TypeScript 通过。
- 内容生成 worker contract 通过。
- 知识库 repository contract 通过。
- Next production build 通过。
- lint 通过，仍只有两个既有 warning：
  - `scripts/migrate-factory-source-items-to-merchant-media.mjs` 的 `sourceItem` 未使用。
  - `src/server/api/video-job-payload.ts` 的 `buildMissingVideoAssetHints` 未使用。

## 半成功与未覆盖范围

- 本轮已修复 LangGraph 代码路径，并已部署到服务器正式 PM2 环境；没有再次创建真实生成 batch，避免继续污染生产数据。
- 如果某个商户没有 indexed 知识文档，`kb_project_knowledge.result` 会是 `无知识库检索结果。`，后续 prompt 仍会看到独立的 `start.fallback_knowledge_text`。
- 如果 embedding API 失败，LangGraph 会降级使用 `searchKnowledgeChunks` 的文本评分 fallback，避免内容生成整体失败。
- 这仍不是 pgvector / LangGraph Platform 检索；是复用本项目 self-hosted `embedding_json` 和 PostgreSQL rows 的应用层 RAG。

## 正式部署记录

代码已合并并部署：

- Main / deployed commit: `51f5e1e`
- Gitee `origin/main`: 已推送
- GitHub 安全分支：
  - `codex/langgraph-content-provider`: 已更新到 `51f5e1e`
  - `codex/content-langgraph-rag`: 已推送到 `51f5e1e`
- GitHub `main`: 未强推，仍保持远端原分叉历史
- Server repo: `/opt/personal-website`
- Server deployed HEAD: `51f5e1e`
- PM2:
  - `content-growth-platform`: online
  - `content-generation-worker`: online
- Server build: `pnpm --dir apps/content-growth-platform build` passed
- `pm2 save`: completed

服务器知识库数据检查：

```json
{
  "docs": {
    "indexed_total": 6,
    "indexed_merchant": 0,
    "indexed_platform": 6
  },
  "chunks": {
    "chunks_total": 18,
    "chunks_with_embedding": 0
  }
}
```

结论：

- 线上当前有 indexed 平台知识库，可被 LangGraph RAG 节点纳入检索。
- 线上当前没有 indexed 商户知识库文档，因此暂时没有用户上传知识库命中可验证。
- 线上当前 chunk 没有 `embedding_json`，所以会走 text scoring fallback；后续新上传 / retry ingestion 且 embedding 成功后，会自动使用 `embedding_json` cosine scoring。

## 2026-06-16 生产 per-node smoke 与后续修复

用户要求确认 LangGraph 是否真正走通，并检查每个节点产出。

本轮在生产服务器创建了三条仅用于验证的 smoke job，均使用 `workflow_provider='langgraph'` / `workflow_version='content-v31-dify-node-parity'`，并克隆既有 smoke 输入但替换新的 `daily_task_id` / `task_date`，避免覆盖历史草稿。

### 第一次 per-node smoke

- Job: `32139abc-0e8c-441f-9daf-70aa30af49f9`
- Draft: `15fd8039-63a4-42dd-a6c5-32ec2ea633cb`
- Result: `succeeded` / `persisted`
- Raw output:
  - 必需节点齐全：`task_understanding`、`kb_project_knowledge`、`creative_strategy`、`title_cover`、`article_body`、`article_compiler`、`video_narrative`、`scene_breakdown`、`delivery_compiler`、`quality_reviewer`、`final_compiler`、`validation_status`、`final_result_json`、`final_model`
  - `validation_status='passed'`
  - `final_model='deepseek-ai/DeepSeek-V4-Flash'`
  - `kb_project_knowledge.embeddingMode='embedded'`

发现的问题：

- `title_cover` 和 `article_body` 节点本身有正常标题 / 正文 JSON。
- 但 `article_compiler` 只读取旧字段 `selectedTitle` / `selectedCoverCopy` / `contentBlocks`。
- 当前 Dify prompt 实际产出包含 `bestTitle` / `bestCoverCopy` / `blocks`。
- 结果是最终 `output_json.article.copyText` 只剩 hashtags，长度约 42 字符，标题 fallback 为 `今日项目内容`。

根因：

- LangGraph TS port 的 `article_compiler` 没有兼容 Dify V3.1 节点实际字段变体，属于“链路成功但产物丢字段”的迁移问题。

修复：

- Commit: `4e2fadc fix: preserve langgraph article compiler output`
- 文件：
  - `apps/content-growth-platform/src/server/api/langgraph-content-workflow.ts`
  - `apps/content-growth-platform/src/server/api/content-generation-worker-contract.test.ts`
- 改动：
  - `article_compiler` 兼容 `articleBody.blocks` 和 `articleBody.contentBlocks`。
  - 标题兼容 `bestTitle` / `selectedTitle` / `titles[].title` / `titles[].text`。
  - 封面文案兼容 `bestCoverCopy` / `selectedCoverCopy` / `coverCopyOptions[]`。
  - 配图说明兼容 `block.imageBrief`、`block.imageDescription`、`block.image.description` 等形式。
  - 补充源码合同断言，防止字段兼容被删。

验证：

- 本地 `pnpm --dir apps/content-growth-platform typecheck` passed。
- 本地 `pnpm --dir apps/content-growth-platform build` passed。
- Server build passed。
- PM2 `content-growth-platform` / `content-generation-worker` restarted and online。

### 第二次 smoke：验证 article compiler 修复

- Job: `26346cf4-427b-4dd7-8024-2e1a9130f777`
- Draft: `5df4ed1a-b767-4471-a899-736d1a6bd963`
- Result: `succeeded` / `persisted`
- Effective duration: about `262s`
- Raw output:
  - 必需节点齐全。
  - `validation_status='passed'`
  - `article_compiler.articlePackage.selectedTitle='总价友好但担心配套？实地看了再说'`
  - `article_compiler.articlePackage.bodyLength=381`
  - `article_compiler.articlePackage.contentBlockCount=5`
  - `finalArticle.copyLength=442`

结论：

- article compiler 丢正文的问题已修复。
- 该次 smoke 仍显示 `kb_project_knowledge.topK=5`，因为代码使用了平台 runtime setting；但 Dify 原节点固定 `top_k: 6`。

### topK parity 修复

- Commit: `b0dde78 fix: align langgraph rag topk with dify`
- 改动：
  - `kb_project_knowledge` 固定 `topK=6`，与 Dify V3.1 YAML 的 `top_k: 6` 对齐。
  - 合同测试增加 `const topK = 6` 断言。

验证：

- 本地源码断言 passed。
- 本地 `pnpm --dir apps/content-growth-platform typecheck` passed。
- 本地 `pnpm --dir apps/content-growth-platform build` passed。
- Gitee `origin/main` 已推送到 `b0dde78`。
- GitHub 安全分支 `codex/langgraph-article-compiler-fix` 已推送到 `b0dde78`。
- Server `/opt/personal-website` 已通过 git bundle fast-forward 到 `b0dde78`。
- Server build passed。
- PM2:
  - `content-growth-platform`: online
  - `content-generation-worker`: online

### 最终 smoke：验证 per-node + topK=6 + 最终产物

- Job: `0e58434f-dde9-47ab-baf9-b8070971cb30`
- Draft: `49877a2e-e503-4541-a4b7-5c5bf31309f8`
- Result: `succeeded` / `persisted`
- Effective duration: about `402s`
- Workflow run id: `langgraph-17812be1-dc91-4df2-bf60-dbf7396fc62f`
- `workflow_provider='langgraph'`
- `workflow_version='content-v31-dify-node-parity'`

最终 raw 检查：

- 必需节点无缺失。
- `validation_status='passed'`
- `validation_error=null`
- `final_model='deepseek-ai/DeepSeek-V4-Flash'`
- `content_risk_rewriter` 未触发，因为 `quality_reviewer.needsRewrite=false`。

RAG 节点：

- `kb_project_knowledge.type='local_merchant_knowledge_rag'`
- `strategy='task_understanding_query_to_user_knowledge_base'`
- `topK=6`
- `embeddingMode='embedded'`
- `embeddingModel='Qwen/Qwen3-Embedding-4B'`
- `matchCount=6`
- 当前命中均为 `platform` scope，因为生产库暂无 indexed 商户知识库文档。

LLM 节点：

- `task_understanding`: `textLength=1231`，JSON keys 包含 `taskId`、`taskDate`、`articleTask`、`videoTask`、`copySearchQuery` 等。
- `creative_strategy`: `textLength=1163`，JSON keys 包含 `articlePlan`、`videoPlan`、`qualityGateHints`。
- `title_cover`: `textLength=1110`，JSON keys 包含 `titles`、`bestTitle`、`bestCoverCopy`、`coverCopyOptions`。
- `article_body`: `textLength=1477`，JSON keys 包含 `cta`、`blocks`、`hashtags`。
- `video_narrative`: `textLength=772`，JSON keys 包含 `hookDesign`、`narrativeArc`、`scriptOutline`。
- `scene_breakdown`: `textLength=4199`，JSON keys 包含 `scenes`、`riskNotes`。

Code 节点：

- `article_compiler`: `resultLength=3085`，JSON keys 为 `titleStrategy` / `articlePackage`。
- `delivery_compiler`: `resultLength=14927`，JSON keys 为 `videoScript` / `memberDelivery` / `workerDelivery`。
- `final_compiler`: `finalResultLength=7272`。

最终产物：

- Article title: `看完20个盘，才发现买房第一步就错了`
- Cover copy: `买房第一步，99%的人错了`
- Article copy length: `513`
- Video scene count: `10`
- Final status: `needs_review`
- Draft status: `review_pending`

剩余风险：

- 当前生产库没有 indexed 商户知识库文档，所以已经验证“RAG 节点调用、query embedding、平台知识命中、raw 输出”这条链路，但还没有验证真实用户上传知识库命中。
- 生产库当前历史 chunks 缺少 `embedding_json` / `embedding`，所以检索排序会在 pgvector 无命中后落到 repository fallback。新上传或 retry 后产生 embedding 的文档会走向量路径。
- `started_at` / `updated_at` 使用 `timezone('utc', now())`，`finished_at` 使用 JS ISO 时间，导致直接算 `finished_at - started_at` 会多 8 小时；本轮 smoke 采用 `updated_at - started_at` 作为 effective duration。这个时间字段不影响生成结果，但后续最好单独修正时间写法。

## 回滚路径

短期回滚整个内容生成 provider：

```text
CONTENT_GENERATION_WORKFLOW_PROVIDER=dify
```

如果只回滚本次 RAG 修复，需要回退分支 `codex/content-langgraph-rag` 的提交，恢复 `kb_project_knowledge` deterministic fallback。

## 后续排查入口

如果线上生成仍像“没用用户知识库”，优先查：

1. `knowledge_documents` 中对应商户文档是否 `status='indexed'`。
2. `knowledge_chunks` 是否有对应 document chunks。
3. `knowledge_chunks.embedding_json` 是否非空，维度是否和 `EMBEDDING_DIMENSIONS` 一致。
4. `platform_settings.knowledge_runtime.embeddingModel` 是否能被当前 AI runtime 支持。
5. `content_generation_jobs.output_json.rawOutputs.kb_project_knowledge` 的 `matchCount`、`embeddingMode` 和 `matches`。
