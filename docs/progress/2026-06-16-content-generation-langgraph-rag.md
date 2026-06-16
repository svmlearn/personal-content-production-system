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

- 本轮已修复 LangGraph 代码路径，但尚未在服务器正式 PM2 环境再次创建真实生成 batch。
- 如果某个商户没有 indexed 知识文档，`kb_project_knowledge.result` 会是 `无知识库检索结果。`，后续 prompt 仍会看到独立的 `start.fallback_knowledge_text`。
- 如果 embedding API 失败，LangGraph 会降级使用 `searchKnowledgeChunks` 的文本评分 fallback，避免内容生成整体失败。
- 这仍不是 pgvector / LangGraph Platform 检索；是复用本项目 self-hosted `embedding_json` 和 PostgreSQL rows 的应用层 RAG。

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
