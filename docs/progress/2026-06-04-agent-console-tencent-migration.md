# 2026-06-04 Agent Console migration to Tencent

## Goal

把旧阿里云 ECS / RDS 中已配置的 Agent Console 资产迁移到腾讯 Lighthouse PostgreSQL，让当前内容获客平台重新拥有原来的：

- `agent.md` / system prompt 版本
- `soul.md` 版本
- DBS skills
- Agent-skill bindings
- platform knowledge sets / inline seed documents / chunks

用户额外要求：

1. 删除文本中的 `静境商家平台的商家`。
2. 不迁移 `对话记录1`、`对话记录2`、`对话记录3` 及其后续 chunk。

## Source And Target

Source:

- Old Aliyun ECS: `8.154.28.41`
- Instance id: `i-bp190gb0a3ajywl6urzk`
- Source export: `docs/progress/artifacts/2026-06-04-agent-config-archive/aliyun-agent-console-full-data.json`

Target:

- Tencent Lighthouse: `43.129.207.237`
- DB: `personal_website_content`
- App: `/opt/personal-website/apps/content-growth-platform`

## Sanitized Artifacts

Artifact directory:

- `docs/progress/artifacts/2026-06-04-agent-config-archive/`

Important files:

- `aliyun-agent-console-readable.md`
  - 已按用户要求清洗后的可读版。
  - 已删除 `静境商家平台的商家`。
  - 已不包含 `对话记录1/2/3`。
- `aliyun-agent-console-sanitized-data.json`
  - 迁移用清洗数据。
- `tencent-agent-console-current-data.json`
  - 迁移前腾讯库备份。
- `tencent-agent-console-current-data.sql`
  - 迁移前腾讯库 SQL 备份。
- `tencent-agent-console-import.sql`
  - 实际执行的事务式导入 SQL。
- `tencent-agent-console-import-dry-run.sql`
  - `ROLLBACK` 版 dry-run SQL。
- `sanitize-agent-console.jq`
  - 清洗规则。
- `generate-agent-console-import-sql.mjs`
  - 从清洗 JSON 生成导入 SQL。

## Sanitization Result

清洗前旧阿里云导出：

- `knowledge_documents`: 9
- `knowledge_chunks`: 54
- `agent_runtime_snapshots`: 42

清洗后迁移数据：

- `agent_configs`: 2
- `agent_prompt_versions`: 4
- `agent_soul_versions`: 4
- `agent_skills`: 8
- `agent_skill_bindings`: 8
- `agent_knowledge_set_bindings`: 6
- `knowledge_sets`: 6
- `knowledge_documents`: 6
- `knowledge_chunks`: 18
- `knowledge_set_documents`: 6
- `agent_runtime_snapshots`: 0
- `agent_test_runs`: 0

线上目标库验证：

- `静境商家平台的商家`: 0 occurrences in prompt / soul bodies.
- `对话记录%`, `20260509_%.txt`, `芭芭客功能测试对接`: 0 matching knowledge documents.

用户随后进一步确认：“关于商家部分的任何东西都是不需要导入的”。本轮追加了第二层温和清洗：

- `agent_prompt_versions.body`
  - `local service merchants` -> `users`
  - `商家` -> `用户`
- `agent_soul_versions.body`
  - `商家` -> `用户`
- `agent_skills.body`
  - `输出给商家的内容` -> `输出给用户的内容`
- `agent_route_bindings.description`
  - `Default merchant consultation route.` -> `Default consultation route.`

追加清洗后，腾讯线上库验证：

- `agent_configs`: 0 matching `商家`
- `agent_prompt_versions`: 0 matching `商家` / `local service merchants`
- `agent_soul_versions`: 0 matching `商家`
- `agent_skills` 指令层: 0 matching `输出给商家`
- `knowledge_documents`: 0 matching `商家`
- `agent_route_bindings`: 0 matching `merchant`

保留说明：

- DBS 知识库 chunk 中仍可能出现泛化语料里的 `商家`，例如“商家自媒体”“商家诉求”等内容案例。这不是某个商家的私有资料或对话记录，而是营销/内容知识原文的一部分。未做机械替换，避免破坏知识语料。

## Import

导入策略：

- 不导入 `platform_settings`，避免覆盖腾讯库中刚配置好的 SiliconFlow / DeepSeek runtime。
- 不导入 runtime snapshots / test runs / ingestion jobs。
- 事务内先删除腾讯库当前 Agent Console 空壳数据，再插入清洗后的旧阿里云数据。

Dry-run:

- 第一次 dry-run 失败，原因是 SQL 生成器把空数组 `[]` 输出成 PostgreSQL array literal `{}`，进入 `jsonb` 字段后违反 `agent_skills_dependencies_array_check`。
- 修复生成器后第二次 dry-run 成功，最后 `ROLLBACK`。

正式导入：

- `COMMIT` 成功。
- 插入结果：
  - `agent_configs`: 2
  - `knowledge_sets`: 6
  - `agent_skills`: 8
  - `agent_prompt_versions`: 4
  - `agent_soul_versions`: 4
  - `knowledge_documents`: 6
  - `knowledge_chunks`: 18
  - `agent_skill_bindings`: 8
  - `agent_knowledge_set_bindings`: 6
  - `knowledge_set_documents`: 6
  - `agent_route_bindings`: 1

## Target DB State After Import

Agent state:

| Agent key | Display name | Status | Active prompt | Active soul | Enabled skills | Knowledge sets |
| --- | --- | --- | --- | --- | ---: | ---: |
| `initial_consultation_agent` | `Initial Consultation Agent` | `enabled` | v4 / 1570 chars | v4 / 634 chars | 4 | 5 |
| `marketing_expert_agent` | `营销专家` | `enabled` | none | none | 4 | 1 |

Skills:

| Skill key | Name | Status | Body chars |
| --- | --- | --- | ---: |
| `dbs_ai_check` | `DBS AI 写作特征识别` | `enabled` | 5126 |
| `dbs_benchmark` | `DBS 对标判断` | `enabled` | 361 |
| `dbs_content` | `DBS 内容创作诊断` | `enabled` | 4641 |
| `dbs_deconstruct` | `DBS 概念拆解` | `enabled` | 399 |
| `dbs_diagnosis` | `DBS 商业诊断` | `enabled` | 448 |
| `dbs_goal` | `DBS 目标清晰化` | `enabled` | 375 |
| `dbs_hook` | `DBS 短视频开头优化` | `enabled` | 4796 |
| `dbs_xhs_title` | `DBS 小红书标题公式工具` | `enabled` | 13716 |

Runtime settings preserved:

- `llm_runtime.providerLabel`: `SiliconFlow`
- `llm_runtime.baseUrl`: `https://api.siliconflow.cn/v1`
- `llm_runtime.primaryModel`: `deepseek-ai/DeepSeek-V4-Flash`
- `llm_runtime.fallbackModel`: `Qwen/Qwen3-32B`
- `consultation_agent.model`: `deepseek-ai/DeepSeek-V4-Flash`

## Runtime Verification

After import:

- Restarted PM2 app `content-growth-platform`.
- Login with demo merchant succeeded.
- Created test session `58be625f-ced1-4fab-906e-bc539d3e2353`.
- An early manual curl attempt against `POST /api/consultation/sessions` timed out at 20s while the DB row was created. Later smoke checks did not reproduce this as a foreground create-session failure.
- Sent test message successfully; API returned queued.
- Assistant reply persisted:
  - `当前默认模型和 agent 配置已接入，工具循环状态正常，可用工具 5 项，可以开始咨询。`

Events / snapshots showed:

- `session.created`
  - `activePromptVersion`: 4
  - `activeSoulVersion`: 4
  - `candidateSkillIds`: 4
- `agent.loop.started`
  - `activePromptVersion`: 4
  - `activeSoulVersion`: 4
  - `candidateSkillIds`: 4
  - `knowledgeSetIds`: 5
- `llm.response.completed`
  - model: `deepseek-ai/DeepSeek-V4-Flash`
- `agent_runtime_snapshots`
  - `agent_id`: `26bccdea-e17a-4a7b-9915-8be6eb8ecece`
  - `prompt_version_id`: `7f0ce605-6709-4744-bff9-e292ec31b514`
  - model: `deepseek-ai/DeepSeek-V4-Flash`
  - candidate skills: 4
  - actual skills: 0
  - knowledge sets: 5

The test input did not semantically trigger one of the DBS skills, so `actual_skill_ids` was empty. Candidate skill disclosure and knowledge set wiring were present.

Cleanup:

- Deleted test runtime snapshot.
- Deleted test consultation session.
- Verified remaining rows:
  - sessions: 0
  - messages: 0
  - events: 0
  - snapshots: 0

Note:

- The smoke caused a neutral `merchant_strategy_assets` timestamp refresh for the demo merchant, but did not write concrete positioning or content strategy. The asset remains an empty neutral strategy asset.

Additional smoke after cleanup:

- Server-local smoke via `http://127.0.0.1:3001`:
  - DB connected.
  - Required tables present.
  - `settingsGetStatus`: 200
  - `agentsStatus`: 200
  - `agentDetailHasActivePrompt`: true
  - `agentDetailHasActiveSoul`: true
  - `agentDetailKnowledgeBindings`: 5
  - `merchantLoginStatus`: 303
  - `expertsStatus`: 200
  - `defaultExpertPresent`: true
  - `createConsultationStatus`: 201
- Public smoke via `http://43.129.207.237`:
  - `settingsGetStatus`: 200
  - `agentsStatus`: 200
  - `agentDetailHasActivePrompt`: true
  - `agentDetailHasActiveSoul`: true
  - `agentDetailKnowledgeBindings`: 5
  - `merchantLoginStatus`: 303
  - `expertsStatus`: 200
  - `defaultExpertPresent`: true
  - `createConsultationStatus`: 201
- Both smoke runs reported overall `failed` only because old assertions no longer match migrated state:
  - The script expects the default prompt version to be `1`, while the migrated active prompt is v4.
  - The public run's platform-admin debug run returned `504`; this is not the foreground user consultation session creation path.
- Smoke cleanup finished with status `ok`.

## OSS / COS Note

The old `对话记录1/2/3` documents used `storage_provider=aliyun_oss`, but those documents were intentionally excluded from this migration.

The migrated DBS knowledge documents use `storage_provider=inline_seed`; their content lives in PostgreSQL and does not require OSS.

Therefore:

- For current AI consultation / Agent / Skill / soul.md migration: no OSS is required.
- For future media uploads, private material library, video worker, or file download flows: storage is still required.
- Current code mainline supports `aliyun_oss`; switching to Tencent COS would require code changes, not only environment variable changes.

## Remaining Risk / Follow-up

1. Update `scripts/check-domestic-agent-runtime-smoke.mjs` so it no longer assumes active prompt version `1`.
2. Investigate the platform-admin debug-run `504` on the public path if admin test-run UI is needed. This does not currently block foreground consultation session creation.
3. `GET /api/health` still returns `503` because storage env vars are empty, while app and DB checks are ok.
4. Decide whether to configure Aliyun OSS now or postpone until media/video features are needed.
