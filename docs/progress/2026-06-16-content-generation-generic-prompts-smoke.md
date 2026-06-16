# 2026-06-16 LangGraph Generic Content Prompt Smoke

## Context

用户反馈 Dify 原 workflow 虽然当前样例偏房地产，但很多 LLM 节点结构本身是通用内容生产，不应在 LangGraph 内继续硬编码“房地产 / 户型 / 售楼处 / 中介”等行业锚点。

本轮目标：

1. 将 LangGraph 复刻的 Dify V3.1 节点 prompt 泛化为多行业小红书 / 抖音内容生产。
2. 保留原 Dify 节点 id、user/system prompt 变量和 LangGraph 节点链路。
3. 清掉运行时 fallback 中会把内容拉回房地产的兜底文案。
4. 用线上 LangGraph 跑几组非房产输入，检查最终产物是否仍有房地产味道。

## Code Changes

Branch / worktree:

- Branch: `codex/generic-content-prompts`
- Worktree: `/Users/wy/Desktop/个人IP/个人网站搭建-worktrees/generic-content-prompts`

Commits:

- `966fcee` `refactor: genericize langgraph content prompts`
- `90ccdb5` `fix: accept langgraph article block content fields`
- `fec1b0a` `fix: support langgraph article text outputs`

Changed files:

- `apps/content-growth-platform/src/server/api/dify-v31-node-prompts.ts`
  - Replaced hard-coded real-estate prompt language with generic product/service/content workflow language.
  - Preserved Dify V3.1 node keys, prompt ids, and template variables.
- `apps/content-growth-platform/src/server/api/langgraph-content-workflow.ts`
  - Replaced real-estate risk dictionary and fallback video/article copy with generic compliance terms.
  - Added article compiler compatibility for real model variants:
    - `blocks[].text`
    - `blocks[].content`
    - `blocks[].body`
    - `blocks[].copy`
    - top-level `articleBody.text`
    - top-level `articleBody.images`
    - direct `image.assetId`
- `apps/content-growth-platform/src/server/api/content-generation-batch-service.ts`
  - Genericized fallback knowledge principle and CTA.
- `apps/content-growth-platform/src/server/api/dify-final-json-mapper.ts`
  - Genericized final fallback CTA.
- `apps/content-growth-platform/src/server/api/content-generation-worker-contract.test.ts`
  - Added source-level guards that the LangGraph content workflow runtime avoids hard-coded real-estate fallback language.
  - Added assertions for observed Dify article body variants.

## Local Validation

Ran in local worktree:

- `node --test apps/content-growth-platform/src/server/api/content-generation-worker-contract.test.ts`
  - Pass: 10/10.
- `pnpm --dir apps/content-growth-platform typecheck`
  - Pass after final compiler compatibility fixes.
- `pnpm --dir apps/content-growth-platform build`
  - Pass after final compiler compatibility fixes.
- `git diff --check`
  - Pass.

## Server Deployment

Server:

- Host: `ubuntu@43.129.207.237`
- Repo: `/opt/personal-website`
- Final deployed git HEAD: `fec1b0a`

Deployment method:

- Transferred git bundles from local worktree.
- Fast-forwarded server repo.
- Ran `pnpm --dir apps/content-growth-platform build`.
- Restarted PM2:
  - `content-growth-platform`
  - `content-generation-worker`

Health note:

- `/api/health` returned 503 because storage config is not configured:
  - database: ok
  - storage: error, Aliyun OSS environment variables missing
- This matches current demo assumption: content generation tests do not require real OSS.

## Live LangGraph Runs

Test merchant:

- Merchant: `Codex LangGraph Smoke Test Project`
- Merchant id: `09266677-2267-4cf9-a8fe-48b447150104`
- Member user id: `a8b86335-5448-4677-ad06-9932acf7db8c`

Important RAG fact:

- This smoke merchant currently has no user knowledge documents/chunks.
- Live jobs still executed the `kb_project_knowledge` node and embedding path.
- Final successful rerun showed:
  - Coffee job: `kb_project_knowledge.matchCount = 6`, `embeddingMode = embedded`
  - Portfolio job: `kb_project_knowledge.matchCount = 3`, `embeddingMode = embedded`
- These matches came from current DB search behavior for the test merchant/query path; final public outputs did not contain hard real-estate anchors.

### Initial 3-Case Run

Batch:

- `33ce9c27-022b-4afb-8b55-f2d400fb1ff5`

Jobs:

- AI learning companion: `1d12e425-ac49-4e02-9343-96516595a12d`
  - Status: succeeded
  - Result: complete article body and video script.
  - Hard real-estate hits: none.
- Coffee workshop: `605ad433-3648-4683-b248-4c5a53fa1fdc`
  - Status: succeeded
  - Issue found: article final copy only had title + hashtags.
  - Root cause: article compiler did not support actual Dify body variants.
- Portfolio coaching: `2aaaa19d-f55e-42b5-b289-2da2d0c37bb9`
  - Status: succeeded
  - Issue found: article final copy only had title + hashtags.
  - Root cause: model returned `blocks[].content`; compiler only read `blocks[].text`.

### Compiler Fix Reruns

Batch:

- `14bcd32c-3a65-4182-9e48-642a5612e2e4`

Jobs:

- Coffee rerun: `9956b07d-3062-4e31-aa26-33410deab794`
  - Status: failed_retryable
  - Error: `LangGraph model response did not contain a valid JSON object.`
  - Treated as transient LLM JSON failure; max attempts for smoke job was 1.
- Portfolio rerun: `f2deed50-8481-44a4-a40b-68e498ca4822`
  - Status: succeeded
  - Issue still found: final article was still title + hashtags.
  - Root cause: model returned top-level `article_body.json.text` and `article_body.json.images`; compiler did not support top-level text/images yet.

### Final Rerun After Top-Level Text/Image Support

Batch:

- `83458605-0f6d-40b7-8256-d8c6bf966fd0`

Jobs:

- Coffee final rerun: `2cc0d97d-7c13-42ae-af5b-bdc3c201950e`
  - Status: succeeded
  - Draft: `7e7ca9e5-47e1-4b8b-b33a-b0d8a8d09524`
  - Hard real-estate hits: none
  - Article title: `第一次手冲咖啡，其实不用懂术语`
  - Cover copy: `不学术语，只喝风味`
  - Article body: complete, non-real-estate.
- Portfolio final rerun: `fbe8319c-5ad5-473b-96b7-fd67c983f6dd`
  - Status: succeeded
  - Draft: `48ce8bcd-e739-4e93-ae2d-aaa94a4e4f54`
  - Hard real-estate hits: none
  - Article title: `改版多次没回应？问题不在页数`
  - Cover copy: `作品集诊断看这3点`
  - Article body: complete, non-real-estate.

## Final Output Assessment

Final smoke outputs no longer contain the hard real-estate anchor terms checked by regex:

`房地产|房产|楼盘|楼栋|户型|样板间|沙盘|售楼处|中介|买房|看房|刚需|小区|地铁|学区|租金|业主|开发商|空间动线|项目实景|带看|月供|首付|满租|保值|增值|收租`

Observed remaining generic wording:

- The prompt/code still uses generic words such as `项目` where it means project/product/service, not real estate.
- Some video fallback text still uses `项目` in helper descriptions such as material handling, but the hard real-estate terms above are no longer in the LangGraph content workflow runtime/prompt path.

## Risks And Follow-Up

1. The smoke merchant has little/no real user knowledge corpus. These tests validate prompt/fallback genericity and RAG node execution, but not a rich generic user knowledge-base retrieval scenario.
2. One coffee rerun hit a transient invalid-JSON model response. Current job retry behavior can recover when `max_attempts > 1`; the one-off smoke job used `max_attempts = 1` to avoid repeated queue churn.
3. The final outputs are generic and usable, but content quality is still model-dependent. The compiler fixes prevent body loss across observed Dify output variants.
4. `/api/health` remains 503 until OSS/storage env is configured or the health route is adjusted for demo storage mode.

