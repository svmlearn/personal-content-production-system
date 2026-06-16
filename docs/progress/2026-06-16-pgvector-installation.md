# 2026-06-16 服务器 pgvector 安装与 RAG 检索切换记录

## 问题原貌

用户确认服务器是香港 2C/2G，并希望把 Postgres 的 pgvector 装上，让 LangGraph 内容生成 RAG 不止停留在应用层 `embedding_json` fallback。

安装前服务器状态：

- Host: `43.129.207.237`
- GeoIP: Hong Kong / Tencent Cloud
- OS: Ubuntu 22.04.5 LTS
- CPU: 2 vCPU
- Memory: 1.9 GiB + 2.0 GiB swap
- Disk: 40G, available about 29G
- PostgreSQL: 14.23, cluster `14/main`, port `5432`
- Database: `personal_website_content`
- pgvector extension: not installed / not available
- `knowledge_chunks.embedding`: missing
- `knowledge_chunks.embedding_json`: present, but current rows are empty

## 根因判断

项目已有 optional pgvector migration，但服务器没有安装 pgvector extension files，因此数据库中无法 `create extension vector`。

同时，上一轮代码虽然让 LangGraph RAG 接入用户知识库，并支持 `embedding_json` cosine fallback，但还没有优先调用数据库层 `match_knowledge_chunks`。

## 系统安装

先安装 PostgreSQL 14 server dev headers：

```bash
sudo apt-get install -y postgresql-server-dev-14
```

影响：

- 新增编译依赖约 616 MB。
- `libssl3` 从 Ubuntu security/update 源升级到 `3.0.2-0ubuntu1.25`。
- `needrestart` 建议后续可重启 Postgres / nginx / ssh 等服务加载新库；本轮未立即重启系统服务，避免无谓中断。

然后从 pgvector 官方仓库安装：

```bash
git clone --depth 1 --branch v0.8.2 https://github.com/pgvector/pgvector.git /tmp/pgvector
cd /tmp/pgvector
make
sudo make install
```

安装结果：

- `/usr/lib/postgresql/14/lib/vector.so`
- `/usr/share/postgresql/14/extension/vector.control`
- `/usr/share/postgresql/14/extension/vector--0.8.2.sql`

## 数据库启用

执行：

```bash
sudo -u postgres psql -d personal_website_content -c "create extension if not exists vector;"
sudo -u postgres psql -d personal_website_content -f apps/content-growth-platform/db/migrations/202605160002_selfhost_pgvector_optional.sql
```

数据库验证：

- `pg_extension.vector = 0.8.2`
- `knowledge_chunks.embedding vector` exists
- `idx_knowledge_chunks_embedding_hnsw` exists
- `public.match_knowledge_chunks(query_embedding vector, match_count integer, document_ids uuid[])` exists
- `select '[1,2,3]'::vector` passed

## 代码改动

- `apps/content-growth-platform/src/lib/db/knowledge-repository.ts`
  - `searchKnowledgeChunks` 现在优先调用 `public.match_knowledge_chunks($1::vector, $2, $3)`。
  - 如果 pgvector 查询没有命中或失败，再 fallback 到 `embedding_json` cosine。
  - 如果没有 query embedding / chunk embedding，再 fallback 到原 text scoring。
  - 保留“不使用 Supabase RPC”的约束。

- `apps/content-growth-platform/db/migrations/202605160002_selfhost_pgvector_optional.sql`
  - 增加 `public.sync_knowledge_chunk_embedding()` trigger function。
  - 增加 `trg_sync_knowledge_chunk_embedding` trigger。
  - 以后 ingestion 写 `embedding_json` 时，会自动同步 `embedding vector(1536)`。
  - 对已有非空 `embedding_json` 做一次 backfill。

- `apps/content-growth-platform/src/lib/db/knowledge-repository-phase-2c-contract.test.mjs`
  - 增加 pgvector-first、fallback、trigger migration 断言。

## 验证证据

本地通过：

```bash
pnpm install --frozen-lockfile
pnpm --dir apps/content-growth-platform typecheck
node --test apps/content-growth-platform/src/lib/db/knowledge-repository-phase-2c-contract.test.mjs
node --test apps/content-growth-platform/src/server/api/content-generation-worker-contract.test.ts
git diff --check
pnpm --dir apps/content-growth-platform lint
pnpm --dir apps/content-growth-platform build
```

lint 仍只有两个既有 warning：

- `scripts/migrate-factory-source-items-to-merchant-media.mjs` 的 `sourceItem` 未使用。
- `src/server/api/video-job-payload.ts` 的 `buildMissingVideoAssetHints` 未使用。

## 半成功与未覆盖范围

- 当前线上已有 chunks 的 `embedding_json` 为空，因此安装 pgvector 后还没有历史向量可回填。
- 后续新上传或 retry ingestion 的知识文档，如果 embedding 成功，会由 trigger 同步写入 `embedding vector`。
- 本轮安装了 pgvector 并准备代码切换，但最终部署验证需在本提交合并部署后完成。

## 后续排查入口

如果 pgvector RAG 没命中，按顺序查：

1. `select extname, extversion from pg_extension where extname='vector';`
2. `information_schema.columns` 是否有 `knowledge_chunks.embedding`。
3. `pg_indexes` 是否有 `idx_knowledge_chunks_embedding_hnsw`。
4. `pg_proc` 是否有 `match_knowledge_chunks`。
5. `knowledge_chunks.embedding_json` 和 `knowledge_chunks.embedding` 是否非空。
6. `knowledge_documents.status` 是否为 `indexed`。
7. `content_generation_jobs.output_json.rawOutputs.kb_project_knowledge.embeddingMode` 是否为 `embedded`。
