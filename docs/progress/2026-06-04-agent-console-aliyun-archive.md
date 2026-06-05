# 2026-06-04 Agent Console / skill / soul.md archive from Aliyun

## Goal

用户要求真实检查旧阿里云 ECS 中的小红书平台 Agent 配置，确认 skill、system prompt / agent.md、soul.md 是否还在，并把内容原样取回。

本轮不修改旧阿里云服务器，不修改腾讯新服务器数据库，只做只读导出与对比。

## Source Servers

旧阿里云 ECS：

- Instance id: `i-bp190gb0a3ajywl6urzk`
- Public IP: `8.154.28.41`
- SSH verified as `root@8.154.28.41`
- Hostname: `iZbp190gb0a3ajywl6urzkZ`
- App root: `/srv/jingjing-domestic`
- Current release: `/srv/jingjing-domestic/releases/20260603162642-eee4166`
- Env path checked by variable names only: `/srv/jingjing-domestic/shared/env/app.env`

腾讯新服务器：

- Public IP: `43.129.207.237`
- App root: `/opt/personal-website`
- PM2 app `content-growth-platform` online
- PostgreSQL database: `personal_website_content`

## Key Finding

旧阿里云 RDS 中，Agent Console 资产仍在；腾讯新库目前没有完整继承这套资产。

精确计数：

| Table | Aliyun old DB | Tencent current DB |
| --- | ---: | ---: |
| `agent_configs` | 2 | 1 |
| `agent_prompt_versions` | 4 | 1 |
| `agent_soul_versions` | 4 | 1 |
| `agent_skills` | 8 | 0 |
| `agent_skill_bindings` | 8 | 0 |
| `knowledge_sets` | 6 | 1 |
| `knowledge_documents` | 9 | 0 |
| `knowledge_chunks` | 54 | 0 |

旧库当前有效 Agent：

| Agent key | Display name | Status | Active prompt | Active soul | Enabled skills | Knowledge sets |
| --- | --- | --- | --- | --- | ---: | ---: |
| `initial_consultation_agent` | `Initial Consultation Agent` | `enabled` | v4 / 1570 chars | v4 / 634 chars | 4 | 5 |
| `marketing_expert_agent` | `营销专家` | `enabled` | none | none | 4 | 1 |

旧库 active prompt / soul：

- Active prompt: `initial_consultation_agent` version 4, change note `咨询 Agent agent.md v4：改为用户信息语境，并加入用户纠偏协议。`
- Active soul: `initial_consultation_agent` version 4, change note `咨询 Agent soul.md v3：改为用户信息语境，并强化纠偏时的表达风格。`

腾讯新库当前只是 self-host foundation 空壳：

- `initial_consultation_agent` active prompt v1: `76` chars
- active soul v1: `0` chars
- skills: `0`
- knowledge chunks: `0`

## Retrieved Artifacts

Artifact directory:

- `docs/progress/artifacts/2026-06-04-agent-config-archive/`

Files:

- `aliyun-agent-console-full-data.json`
  - Full JSON export from old Aliyun DB.
  - Includes `platform_settings`, agent configs, all prompt versions, all soul versions, skills, bindings, knowledge sets/documents/chunks, ingestion jobs, runtime snapshots, and test runs.
  - Size: about `4.7MB`.
- `aliyun-agent-console-readable.md`
  - Human-readable full text export.
  - Includes all `agent.md` / system prompt versions, all `soul.md` versions, all skill bodies, skill bindings, knowledge set bindings, and knowledge chunks.
  - Size: about `536KB`.
- `tencent-agent-console-current-data.json`
  - Full JSON export from the current Tencent DB for comparison and rollback reference.
  - Size: about `41KB`.
- `tencent-agent-console-current-data.sql`
  - Data-only SQL dump of current Tencent Agent Console-related rows.
  - Size: about `20KB`.
- `tencent-agent-console-readable.md`
  - Human-readable current Tencent state.
  - Size: about `2.1KB`.
- `export-agent-console-json.sql`
  - Read-only SQL used to export the 15 related tables into JSON.
- `export-readable-agent-console.jq`
  - `jq` formatter used to generate readable markdown from JSON.

## Old Skills Found

旧阿里云 DB 中存在 8 个 enabled skills：

| Skill key | Name | Body chars |
| --- | --- | ---: |
| `dbs_ai_check` | `DBS AI 写作特征识别` | 5126 |
| `dbs_content` | `DBS 内容创作诊断` | 4641 |
| `dbs_diagnosis` | `DBS 商业诊断` | 448 |
| `dbs_benchmark` | `DBS 对标判断` | 361 |
| `dbs_xhs_title` | `DBS 小红书标题公式工具` | 13716 |
| `dbs_deconstruct` | `DBS 概念拆解` | 399 |
| `dbs_goal` | `DBS 目标清晰化` | 375 |
| `dbs_hook` | `DBS 短视频开头优化` | 4796 |

这些 skill 正文已完整写入 `aliyun-agent-console-readable.md` 和 `aliyun-agent-console-full-data.json`。

## Historical Evidence

历史 progress `refrences/小红书抖音矩阵获客平台/docs/progress/2026-05-19-aliyun-agent-knowledge-seed-migration.md` 记录过：

- 当时目标是把已配置的 consultation Agent assets、DBS skills、platform knowledge seeds 迁入阿里云 self-hosted PostgreSQL。
- 明确说明大 skill body 和 knowledge chunks 来自原 SQL，不是 AI 重新生成。
- 当时 active prompt 为 `initial_consultation_agent` v4，active soul 为 v4。

本轮数据库实查与该历史记录一致。

## Migration Notes

腾讯新库里的 `initial_consultation_agent` id 与旧阿里云 id 不同：

- Aliyun old: `26bccdea-e17a-4a7b-9915-8be6eb8ecece`
- Tencent current: `f9f10e18-6345-40f1-9286-38ed094535bc`

因此后续不能简单按同 ID 覆盖。建议迁移时：

1. 保留本轮 `tencent-agent-console-current-data.json` / `.sql` 作为回滚点。
2. 保留腾讯 `platform_settings.llm_runtime` 和 `platform_settings.consultation_agent` 中刚配置的 SiliconFlow / DeepSeek runtime。
3. 在事务中替换 Agent Console 相关空壳数据：
   - `agent_configs`
   - `agent_prompt_versions`
   - `agent_soul_versions`
   - `agent_skills`
   - `agent_skill_bindings`
   - `agent_knowledge_set_bindings`
   - `agent_route_bindings`
   - `knowledge_sets`
   - `knowledge_documents`
   - `knowledge_chunks`
   - `knowledge_set_documents`
   - `knowledge_ingestion_jobs`
4. 迁移后跑用户端咨询 smoke，确认 runtime 仍使用 `deepseek-ai/DeepSeek-V4-Flash`，并确认 `candidateSkillIds` / `activeSkillIds` 不为空。

## Validation

Commands / checks completed:

- SSH into old Aliyun ECS: passed.
- Old app release pointer read: passed.
- Old systemd services list: app / content-generation worker / FireRed / OpenStoryline / video-worker active.
- Old env variable names listed without printing secret values.
- Old PostgreSQL related table list: passed.
- Old exact row counts: passed.
- Tencent PostgreSQL related table list: passed.
- Tencent exact row counts: passed.
- Full JSON export from old DB: passed.
- Full JSON export from Tencent DB: passed.
- Readable markdown export from both JSON files: passed.

## Out Of Scope

- Did not import old Agent Console data into Tencent DB yet.
- Did not print or store environment secrets in this progress document.
- Did not edit old Aliyun ECS or RDS.
- Did not change the already configured SiliconFlow / DeepSeek runtime.
