# Agent Console Readable Export

Generated from the matching JSON backup. Secrets are not read from environment files here; this document contains database rows only.

## Table Counts

- `agent_skills`: 0
- `agent_configs`: 1
- `knowledge_sets`: 1
- `agent_test_runs`: 0
- `knowledge_chunks`: 0
- `platform_settings`: 6
- `agent_soul_versions`: 1
- `knowledge_documents`: 0
- `agent_route_bindings`: 1
- `agent_skill_bindings`: 0
- `agent_prompt_versions`: 1
- `agent_runtime_snapshots`: 1
- `knowledge_set_documents`: 0
- `knowledge_ingestion_jobs`: 0
- `agent_knowledge_set_bindings`: 1

## Agents

- `initial_consultation_agent` / Initial Consultation Agent / status=`enabled` / flags=`{"skillsEnabled":true,"knowledgeEnabled":true,"systemPromptEnabled":true}`

## Route Bindings

- `consultation_default` -> initial_consultation_agent / Initial Consultation Agent / status=`active` / description=Default merchant consultation route.

## Prompt Versions: agent.md / System Prompt

### initial_consultation_agent / Initial Consultation Agent - agent.md v1 [active]

- id: `d22c88c7-c2b6-462d-bf4e-5de486ddab99`
- change_note: Initial self-hosted foundation prompt.
- created_at: 2026-06-04T12:17:13.602463+08:00
- activated_at: 2026-06-04T12:17:13.602463+08:00
- archived_at: 

```text
You are the default business consultation agent for local service merchants.
```

## Soul Versions: soul.md

### initial_consultation_agent / Initial Consultation Agent - soul.md v1 [active]

- id: `c1514dcb-0654-44cc-9a0c-de0122b3a091`
- change_note: Initial self-hosted foundation soul.
- created_at: 2026-06-04T12:17:13.604207+08:00
- activated_at: 2026-06-04T12:17:13.604207+08:00
- archived_at: 

```text

```

## Skills



## Agent Skill Bindings



## Knowledge Sets

- `base_platform_knowledge` / Base Platform Knowledge / scope=`platform` / status=`enabled` / description=Default platform knowledge set for the initial consultation agent.

## Agent Knowledge Set Bindings

- initial_consultation_agent / Initial Consultation Agent -> base_platform_knowledge / Base Platform Knowledge / status=`enabled`

## Knowledge Set Documents



## Knowledge Documents And Chunks


