# 2026-06-16 LangGraph 内容生成 RAG 修复交接

## 当前目标

修复 LangGraph 内容生成 provider 中 `kb_project_knowledge` 节点没有真正调用用户知识库 RAG 的问题。

## 当前状态

已完成代码修复和本地验证，待合并 / 部署决策。

## Branch / Worktree

- Branch: `codex/content-langgraph-rag`
- Worktree: `/Users/wy/Desktop/个人IP/个人网站搭建-worktrees/content-langgraph-rag`
- Base: `main` at `0bd4b22`
- Push: 未 push
- Merge: 未 merge

## 已完成内容

- Dify V3.1 YAML 复核：
  - `kb_project_knowledge` 是 `knowledge-retrieval` 节点。
  - query 来自 `task_understanding.text`。
  - topK 为 `6`。

- LangGraph workflow 修复：
  - `runLangGraphContentWorkflow` 接收 `merchantId`。
  - `content-generation-batch-service.ts` 用 `job.merchantId` 传入 LangGraph。
  - `kb_project_knowledge` 改为调用本地知识库检索：
    - query: `taskUnderstandingText`
    - topK: `min(knowledgeRuntime.retrievalTopK, 6)`
    - embedding: `createEmbeddings`
    - retrieval: `searchKnowledgeChunks`
  - 后续 Dify prompt 变量仍是 `{{#kb_project_knowledge.result#}}`。

- 知识库 repository 修复：
  - `searchKnowledgeChunks` 读取 `embedding_json`。
  - 有 query embedding 时用 cosine similarity。
  - 没有 embedding 或维度不匹配时降级原 text scoring。
  - 不依赖 Supabase RPC / pgvector RPC。

## 改动文件

- `apps/content-growth-platform/src/server/api/langgraph-content-workflow.ts`
- `apps/content-growth-platform/src/server/api/content-generation-batch-service.ts`
- `apps/content-growth-platform/src/lib/db/knowledge-repository.ts`
- `apps/content-growth-platform/src/server/api/content-generation-worker-contract.test.ts`
- `apps/content-growth-platform/src/lib/db/knowledge-repository-phase-2c-contract.test.mjs`
- `docs/progress/2026-06-16-content-generation-langgraph-rag.md`
- `docs/handoff/2026-06-16-content-generation-langgraph-rag-handoff.md`

## 验证结果

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

lint 仍只有两个既有 warning：

- `scripts/migrate-factory-source-items-to-merchant-media.mjs` 的 `sourceItem` 未使用。
- `src/server/api/video-job-payload.ts` 的 `buildMissingVideoAssetHints` 未使用。

## 未做 / 风险

- 未在服务器正式 PM2 环境再次创建真实 batch。
- 如果商户没有 indexed 文档，LangGraph RAG 会返回 `无知识库检索结果。`，后续仍依赖 `start.fallback_knowledge_text`。
- 如果 embedding API 失败，会降级 text scoring，不会让内容生成整体失败。
- 本轮没有改变知识库上传/切片/入库流程。

## 下一步建议

1. 合并到 `main`。
2. 推送远端。
3. 部署服务器。
4. 用有 indexed 用户知识库的商户跑一个生成 smoke，检查：
   - `rawOutputs.kb_project_knowledge.type=local_merchant_knowledge_rag`
   - `rawOutputs.kb_project_knowledge.matchCount > 0`
   - `rawOutputs.kb_project_knowledge.embeddingMode=embedded`
   - 后续 `creative_strategy` prompt 中能看到 `kb_project_knowledge.result`
