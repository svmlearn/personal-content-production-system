--
-- PostgreSQL database dump
--

\restrict N3hnZm1emI61memsc87KETUeTZXUHyIpzgqe99uoNz9jt59zkSI5VIDPeAQiLea

-- Dumped from database version 14.23 (Ubuntu 14.23-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 14.23 (Ubuntu 14.23-0ubuntu0.22.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: agent_configs; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.agent_configs (id, agent_key, display_name, role_description, description, service_status, service_flags, model_config, copied_from_agent_id, created_by_admin_id, created_at, updated_at) VALUES ('f9f10e18-6345-40f1-9286-38ed094535bc', 'initial_consultation_agent', 'Initial Consultation Agent', 'Local service merchant consultation advisor.', 'Seeded by the self-hosted PostgreSQL P0 foundation migration.', 'enabled', '{"skillsEnabled": true, "knowledgeEnabled": true, "systemPromptEnabled": true}', '{}', NULL, NULL, '2026-06-04 12:17:13.600504+08', '2026-06-04 12:17:13.600504+08');


--
-- Data for Name: knowledge_sets; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.knowledge_sets (id, set_key, name, description, scope, merchant_id, status, metadata, created_by_admin_id, created_at, updated_at) VALUES ('e4da8977-d87d-473c-97d2-e0c7e07863fb', 'base_platform_knowledge', 'Base Platform Knowledge', 'Default platform knowledge set for the initial consultation agent.', 'platform', NULL, 'enabled', '{"seededBy": "202605160001_selfhost_p0_foundation"}', NULL, '2026-06-04 12:17:13.598355+08', '2026-06-04 12:17:13.598355+08');


--
-- Data for Name: agent_knowledge_set_bindings; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.agent_knowledge_set_bindings (id, agent_id, knowledge_set_id, status, created_by_admin_id, created_at, updated_at) VALUES ('20cfe1ef-416f-45d2-9533-7fb61cd8909e', 'f9f10e18-6345-40f1-9286-38ed094535bc', 'e4da8977-d87d-473c-97d2-e0c7e07863fb', 'enabled', NULL, '2026-06-04 12:17:13.605674+08', '2026-06-04 12:17:13.605674+08');


--
-- Data for Name: agent_prompt_versions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.agent_prompt_versions (id, agent_id, version_no, body, status, change_note, created_by_admin_id, created_at, activated_at, archived_at) VALUES ('d22c88c7-c2b6-462d-bf4e-5de486ddab99', 'f9f10e18-6345-40f1-9286-38ed094535bc', 1, 'You are the default business consultation agent for local service merchants.', 'active', 'Initial self-hosted foundation prompt.', NULL, '2026-06-04 12:17:13.602463+08', '2026-06-04 12:17:13.602463+08', NULL);


--
-- Data for Name: agent_route_bindings; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.agent_route_bindings (id, route_key, agent_id, status, description, created_by_admin_id, created_at, updated_at) VALUES ('dcb9f213-fb87-439d-adbe-6fb655f26112', 'consultation_default', 'f9f10e18-6345-40f1-9286-38ed094535bc', 'active', 'Default merchant consultation route.', NULL, '2026-06-04 12:17:13.606878+08', '2026-06-04 12:17:13.606878+08');


--
-- Data for Name: agent_soul_versions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.agent_soul_versions (id, agent_id, version_no, body, status, change_note, created_by_admin_id, created_at, activated_at, archived_at) VALUES ('c1514dcb-0654-44cc-9a0c-de0122b3a091', 'f9f10e18-6345-40f1-9286-38ed094535bc', 1, '', 'active', 'Initial self-hosted foundation soul.', NULL, '2026-06-04 12:17:13.604207+08', '2026-06-04 12:17:13.604207+08', NULL);


--
-- Data for Name: agent_runtime_snapshots; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.agent_runtime_snapshots (id, session_id, message_id, agent_id, prompt_version_id, soul_version_id, candidate_skill_ids, actual_skill_ids, knowledge_set_ids, knowledge_match_ids, memory_match_ids, tool_call_summary, model, created_at) VALUES ('4f808eea-de0d-426c-8ac4-c96e12f0951e', '249b355e-3b2f-4e92-82cb-7294098d2c21', '231ec042-18d7-4f51-9ca9-b5bf357ca3d4', 'f9f10e18-6345-40f1-9286-38ed094535bc', 'd22c88c7-c2b6-462d-bf4e-5de486ddab99', NULL, '[]', '[]', '["e4da8977-d87d-473c-97d2-e0c7e07863fb"]', '[]', '[]', '{"failedTools": [], "plannerMode": "model_json_planner", "toolResults": [{"status": "skipped", "summary": "暂无 indexed 知识片段命中，继续使用用户信息与会话上下文。", "toolName": "retrieve_knowledge_base", "guardrail": null, "rawToolName": null}, {"status": "skipped", "summary": "未检测到有效字段变更，策略资产保持不变。", "toolName": "update_strategy_snapshot", "guardrail": {"allowed": true, "summary": "未检测到有效字段变更，策略资产保持不变。", "warnings": [], "reasonCode": "no_effective_change"}, "rawToolName": null}], "plannerTrace": [{"mode": "deterministic", "turn": 1, "error": null, "reason": "AI runtime API key 未配置，使用确定性 planner。", "status": "planned", "toolName": "retrieve_knowledge_base"}, {"mode": "deterministic", "turn": 2, "error": null, "reason": "AI runtime API key 未配置，使用确定性 planner。", "status": "planned", "toolName": "update_strategy_snapshot"}], "skippedTools": ["retrieve_knowledge_base", "update_strategy_snapshot"], "assistantMode": "fallback_no_key", "contextBudget": {"policy": "char_budget_v1", "buckets": [{"key": "merchantIdentityContext", "chars": 24, "limit": 400, "truncated": false}, {"key": "merchantBusinessFactsContext", "chars": 93, "limit": 1400, "truncated": false}, {"key": "outputStyleConstraints", "chars": 34, "limit": 700, "truncated": false}, {"key": "safetyLanguageConstraints", "chars": 21, "limit": 700, "truncated": false}, {"key": "strategyAsset", "chars": 359, "limit": 3200, "truncated": false}, {"key": "contentCalendarContext", "chars": 33, "limit": 2600, "truncated": false}, {"key": "currentUserMessage", "chars": 4, "limit": 1000, "truncated": false}, {"key": "sessionSummary", "chars": 47, "limit": 1200, "truncated": false}, {"key": "soul.md", "chars": 2, "limit": 1600, "truncated": false}, {"key": "activeSkillBodies", "chars": 2, "limit": 4200, "truncated": false}, {"key": "activeSkillReferences", "chars": 2, "limit": 1200, "truncated": false}, {"key": "knowledgeMatches", "chars": 2, "limit": 4200, "truncated": false}, {"key": "toolResults", "chars": 60, "limit": 1600, "truncated": false}, {"key": "sharedConsultationState", "chars": 500, "limit": 2400, "truncated": false}, {"key": "expertTurnNotes", "chars": 2, "limit": 3200, "truncated": false}], "totalChars": 1185}, "expertTraffic": {"policy": "short_term_expert_traffic_v1", "expertTurnNotes": [], "latestExpertTurnNote": {"turnId": "249b355e-3b2f-4e92-82cb-7294098d2c21:round:1:agent:initial_consultation_agent", "agentId": "f9f10e18-6345-40f1-9286-38ed094535bc", "agentKey": "initial_consultation_agent", "createdAt": "2026-06-04T13:48:21.609Z", "confidence": "low", "displayName": "Initial Consultation Agent", "whatIChanged": "本轮没有写入新的策略资产或内容任务，主要完成理解、追问或风险确认。", "whatIUnderstood": "你好", "handoffForNextExpert": "本轮没有写入新的策略资产或内容任务，主要完成理解、追问或风险确认。 下一位专家可继续围绕当前策略资产推进：尚未明确定位", "openQuestionsForUser": []}, "sharedConsultationState": {"knownFacts": [], "currentGoal": "Demo Merchant 的首轮咨询会话已建立，等待补充个人背景、可提供价值与当前目标。", "openQuestions": [], "expertTurnNotes": [], "latestUserIntent": "你好", "unresolvedConflicts": [], "merchantProfileSummary": "Demo Merchant；domestic_validation", "strategySnapshotSummary": "# 策略资产\n\n## 当前定位\n继续通过咨询补充。\n\n## 目标对象洞察\n继续补充目标对象。\n\n## 核心卖点\n继续补充核心卖点。\n\n## 核心场景\n继续补充用户决策和使用场景。\n\n## 策略标签\n继续补充可检索的策略标签。\n\n## 小红书表达方向\n- 继续在咨询中沉淀适合小红书的表达方式。\n\n## 风控边界\n不编造价格、疗效、收益、资质、真实案例、活动承诺；不使用绝对化或功效承诺表达。\n\n## 待验证想法\n- 后续咨询中继续补充。"}}, "memoryMatches": [], "runtimeDesign": "model_json_tool_loop_v1", "activeSkillIds": [], "assistantError": null, "completedTools": [], "fallbackReason": "AI runtime API key 未配置。", "mentionRouting": {"mode": "default_agent", "rawMention": null, "targetAgentId": "f9f10e18-6345-40f1-9286-38ed094535bc", "cleanedContent": "你好", "targetAgentKey": "initial_consultation_agent", "availableMentions": ["Initial Consultation Agent"], "targetDisplayName": "Initial Consultation Agent"}, "terminalReason": "fallback_deterministic", "contextBoundary": {"budget": {"policy": "char_budget_v1", "buckets": [{"key": "merchantIdentityContext", "chars": 24, "limit": 400, "truncated": false}, {"key": "merchantBusinessFactsContext", "chars": 93, "limit": 1400, "truncated": false}, {"key": "outputStyleConstraints", "chars": 34, "limit": 700, "truncated": false}, {"key": "safetyLanguageConstraints", "chars": 21, "limit": 700, "truncated": false}, {"key": "strategyAsset", "chars": 359, "limit": 3200, "truncated": false}, {"key": "contentCalendarContext", "chars": 33, "limit": 2600, "truncated": false}, {"key": "currentUserMessage", "chars": 4, "limit": 1000, "truncated": false}, {"key": "sessionSummary", "chars": 47, "limit": 1200, "truncated": false}, {"key": "soul.md", "chars": 2, "limit": 1600, "truncated": false}, {"key": "activeSkillBodies", "chars": 2, "limit": 4200, "truncated": false}, {"key": "activeSkillReferences", "chars": 2, "limit": 1200, "truncated": false}, {"key": "knowledgeMatches", "chars": 2, "limit": 4200, "truncated": false}, {"key": "toolResults", "chars": 60, "limit": 1600, "truncated": false}, {"key": "sharedConsultationState", "chars": 500, "limit": 2400, "truncated": false}, {"key": "expertTurnNotes", "chars": 2, "limit": 3200, "truncated": false}], "totalChars": 1185}, "policy": "consultation_context_boundary_v1", "sources": {"tools": {"count": 2, "failed": [], "results": [{"callId": "2190774d-6e26-4d7b-8366-9ae5119399b8", "status": "skipped", "summary": "暂无 indexed 知识片段命中，继续使用用户信息与会话上下文。", "toolName": "retrieve_knowledge_base", "errorType": null, "rawToolName": null}, {"callId": "14120c44-e993-43d5-88f3-0950f63820ac", "status": "skipped", "summary": "未检测到有效字段变更，策略资产保持不变。", "toolName": "update_strategy_snapshot", "errorType": null, "rawToolName": null}], "skipped": ["retrieve_knowledge_base", "update_strategy_snapshot"], "completed": []}, "skills": {"activeSkillIds": [], "candidateSkillIds": [], "activeSkillReferenceCount": 0}, "session": {"sessionId": "249b355e-3b2f-4e92-82cb-7294098d2c21", "previousMessageCount": 1, "conversationMessageCount": 1}, "knowledge": {"policy": "controlled_context_chunks_only", "matches": [], "matchIds": [], "matchCount": 0, "memoryMatchIds": [], "selectedMatches": [], "selectedMatchIds": []}, "agentAssets": {"agentId": "f9f10e18-6345-40f1-9286-38ed094535bc", "agentKey": "initial_consultation_agent", "soulVersionId": "c1514dcb-0654-44cc-9a0c-de0122b3a091", "soulVersionNo": 1, "promptVersionId": "d22c88c7-c2b6-462d-bf4e-5de486ddab99", "promptVersionNo": 1}, "expertTraffic": {"expertTurnNoteCount": 0, "sharedStateKnownFacts": 0, "sharedStateOpenQuestions": 0}, "strategyAsset": {"fieldCounts": {"keyScenes": 0, "strategyTags": 0, "targetAudiences": 0, "coreSellingPoints": 0}, "strategyTags": [], "markdownChars": 218}, "contentCalendar": {"status": "not_generated", "itemCount": 0}, "selectedContext": {"omittedContext": [{"field": "contextInjection", "reason": "legacy_field_removed", "availableInDebug": false}, {"field": "toolResults", "reason": "duplicate_authority", "availableInDebug": true}, {"field": "skillDisclosure", "reason": "debug_only", "availableInDebug": true}, {"field": "budget", "reason": "debug_only", "availableInDebug": true}, {"field": "expertTraffic", "reason": "debug_only", "availableInDebug": true}, {"field": "strategyMarkdown", "reason": "not_relevant_to_intent", "availableInDebug": true}], "contextPackMode": "slim_v2", "selectedContextPack": "light_chat", "selectedContextDecision": {"intent": "light_chat", "omitted": [{"field": "contextInjection", "reason": "legacy_field_removed", "availableInDebug": false}, {"field": "toolResults", "reason": "duplicate_authority", "availableInDebug": true}, {"field": "skillDisclosure", "reason": "debug_only", "availableInDebug": true}, {"field": "budget", "reason": "debug_only", "availableInDebug": true}, {"field": "expertTraffic", "reason": "debug_only", "availableInDebug": true}, {"field": "strategyMarkdown", "reason": "not_relevant_to_intent", "availableInDebug": true}], "included": ["merchantIdentityContext", "merchantBusinessFactsContext", "outputStyleConstraints", "safetyLanguageConstraints", "expertRoutingContext", "strategySnapshotContext", "contentCalendarContext"]}}, "currentUserMessage": {"chars": 2, "mentionRouting": {"mode": "default_agent", "rawMention": null, "targetAgentId": "f9f10e18-6345-40f1-9286-38ed094535bc", "cleanedContent": "你好", "targetAgentKey": "initial_consultation_agent", "availableMentions": ["Initial Consultation Agent"], "targetDisplayName": "Initial Consultation Agent"}}}, "boundaryId": "249b355e-3b2f-4e92-82cb-7294098d2c21:round:1:context", "budgetBuckets": [{"key": "merchantIdentityContext", "chars": 24, "limit": 400, "truncated": false}, {"key": "merchantBusinessFactsContext", "chars": 93, "limit": 1400, "truncated": false}, {"key": "outputStyleConstraints", "chars": 34, "limit": 700, "truncated": false}, {"key": "safetyLanguageConstraints", "chars": 21, "limit": 700, "truncated": false}, {"key": "strategyAsset", "chars": 359, "limit": 3200, "truncated": false}, {"key": "contentCalendarContext", "chars": 33, "limit": 2600, "truncated": false}, {"key": "currentUserMessage", "chars": 4, "limit": 1000, "truncated": false}, {"key": "sessionSummary", "chars": 47, "limit": 1200, "truncated": false}, {"key": "soul.md", "chars": 2, "limit": 1600, "truncated": false}, {"key": "activeSkillBodies", "chars": 2, "limit": 4200, "truncated": false}, {"key": "activeSkillReferences", "chars": 2, "limit": 1200, "truncated": false}, {"key": "knowledgeMatches", "chars": 2, "limit": 4200, "truncated": false}, {"key": "toolResults", "chars": 60, "limit": 1600, "truncated": false}, {"key": "sharedConsultationState", "chars": 500, "limit": 2400, "truncated": false}, {"key": "expertTurnNotes", "chars": 2, "limit": 3200, "truncated": false}], "compactBoundary": {"policy": "context_compact_boundary_v1", "reason": "consultation_context_preflight_enforcer_v1_checked_no_compaction_needed", "status": "not_applied", "reports": []}}, "expertTurnNotes": [], "skillDisclosure": {"activeSkillIds": [], "candidateSkillIds": [], "activeSkillTriggers": []}, "knowledgeMatchIds": [], "agentAssetVersions": {"memoryMdPolicy": "placeholder_not_injected", "soulMdVersionId": "c1514dcb-0654-44cc-9a0c-de0122b3a091", "soulMdVersionNo": 1, "agentMdVersionId": "d22c88c7-c2b6-462d-bf4e-5de486ddab99", "agentMdVersionNo": 1}, "strategyWriteCount": 0, "toolCallingProvider": null, "latestExpertTurnNote": {"turnId": "249b355e-3b2f-4e92-82cb-7294098d2c21:round:1:agent:initial_consultation_agent", "agentId": "f9f10e18-6345-40f1-9286-38ed094535bc", "agentKey": "initial_consultation_agent", "createdAt": "2026-06-04T13:48:21.609Z", "confidence": "low", "displayName": "Initial Consultation Agent", "whatIChanged": "本轮没有写入新的策略资产或内容任务，主要完成理解、追问或风险确认。", "whatIUnderstood": "你好", "handoffForNextExpert": "本轮没有写入新的策略资产或内容任务，主要完成理解、追问或风险确认。 下一位专家可继续围绕当前策略资产推进：尚未明确定位", "openQuestionsForUser": []}, "sharedConsultationState": {"knownFacts": [], "currentGoal": "Demo Merchant 的首轮咨询会话已建立，等待补充个人背景、可提供价值与当前目标。", "openQuestions": [], "expertTurnNotes": [], "latestUserIntent": "你好", "unresolvedConflicts": [], "merchantProfileSummary": "Demo Merchant；domestic_validation", "strategySnapshotSummary": "# 策略资产\n\n## 当前定位\n继续通过咨询补充。\n\n## 目标对象洞察\n继续补充目标对象。\n\n## 核心卖点\n继续补充核心卖点。\n\n## 核心场景\n继续补充用户决策和使用场景。\n\n## 策略标签\n继续补充可检索的策略标签。\n\n## 小红书表达方向\n- 继续在咨询中沉淀适合小红书的表达方式。\n\n## 风控边界\n不编造价格、疗效、收益、资质、真实案例、活动承诺；不使用绝对化或功效承诺表达。\n\n## 待验证想法\n- 后续咨询中继续补充。"}, "skillDependencyWarnings": []}', 'Qwen/Qwen3-32B', '2026-06-04 13:48:21.618143+08');


--
-- Data for Name: agent_skills; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: agent_skill_bindings; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: agent_test_runs; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: knowledge_documents; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: knowledge_chunks; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: knowledge_ingestion_jobs; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: knowledge_set_documents; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: platform_settings; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.platform_settings (key, category, value, description, created_at, updated_at) VALUES ('import_runtime', 'import', '{"waitSeconds": 120, "importProvider": "apify", "defaultMaxComments": 30, "defaultCreatorPosts": 20}', 'Platform-level import runtime defaults.', '2026-06-04 12:17:13.573955+08', '2026-06-04 12:17:13.573955+08');
INSERT INTO public.platform_settings (key, category, value, description, created_at, updated_at) VALUES ('membership_plans', 'membership', '{"max": {"dailyCredits": 1000}, "pro": {"dailyCredits": 300}, "free": {"dailyCredits": 20}, "plus": {"dailyCredits": 100}}', 'Membership plan defaults.', '2026-06-04 12:17:13.573955+08', '2026-06-04 12:17:13.573955+08');
INSERT INTO public.platform_settings (key, category, value, description, created_at, updated_at) VALUES ('script_production_agent', 'script_production', '{"model": "gpt-4.1-mini", "maxRounds": 4, "temperature": 0.6}', 'Default script production agent settings.', '2026-06-04 12:17:13.573955+08', '2026-06-04 12:17:13.573955+08');
INSERT INTO public.platform_settings (key, category, value, description, created_at, updated_at) VALUES ('knowledge_runtime', 'knowledge', '{"chunkSize": 900, "chunkOverlap": 120, "retrievalTopK": 5, "embeddingModel": "text-embedding-3-small", "embeddingDimensions": 1536, "queryRewriteEnabled": true}', 'Default knowledge retrieval runtime settings.', '2026-06-04 12:17:13.573955+08', '2026-06-04 12:17:13.573955+08');
INSERT INTO public.platform_settings (key, category, value, description, created_at, updated_at) VALUES ('llm_runtime', 'llm', '{"baseUrl": "https://api.siliconflow.cn/v1", "maxTokens": 1800, "retryCount": 2, "temperature": 0.7, "primaryModel": "deepseek-ai/DeepSeek-V4-Flash", "fallbackModel": "Qwen/Qwen3-32B", "providerLabel": "SiliconFlow", "timeoutSeconds": 60}', 'Platform-level LLM runtime defaults.', '2026-06-04 12:17:13.573955+08', '2026-06-04 14:09:52.441656+08');
INSERT INTO public.platform_settings (key, category, value, description, created_at, updated_at) VALUES ('consultation_agent', 'consultation', '{"model": "deepseek-ai/DeepSeek-V4-Flash", "maxRounds": 6, "temperature": 0.6, "enabledTools": ["read_merchant_profile", "retrieve_knowledge_base", "update_strategy_snapshot", "update_content_calendar", "generate_article_brief", "generate_video_brief", "read_history"], "systemPrompt": "You are the default business consultation agent for local service merchants.", "retrievalTopK": 5, "visibleExecutionMode": "cards"}', 'Default consultation agent settings.', '2026-06-04 12:17:13.573955+08', '2026-06-04 14:09:52.445752+08');


--
-- PostgreSQL database dump complete
--

\unrestrict N3hnZm1emI61memsc87KETUeTZXUHyIpzgqe99uoNz9jt59zkSI5VIDPeAQiLea

