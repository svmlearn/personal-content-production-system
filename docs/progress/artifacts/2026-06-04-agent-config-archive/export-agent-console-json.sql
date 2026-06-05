select jsonb_pretty(
  jsonb_build_object(
    'exportedAt', timezone('utc', now()),
    'tables', jsonb_build_object(
      'platform_settings', (
        select coalesce(jsonb_agg(to_jsonb(row_data) order by row_data.key), '[]'::jsonb)
        from (select * from public.platform_settings order by key) row_data
      ),
      'agent_configs', (
        select coalesce(jsonb_agg(to_jsonb(row_data) order by row_data.agent_key), '[]'::jsonb)
        from (select * from public.agent_configs order by agent_key) row_data
      ),
      'agent_prompt_versions', (
        select coalesce(jsonb_agg(to_jsonb(row_data) order by row_data.agent_id, row_data.version_no), '[]'::jsonb)
        from (select * from public.agent_prompt_versions order by agent_id, version_no) row_data
      ),
      'agent_soul_versions', (
        select coalesce(jsonb_agg(to_jsonb(row_data) order by row_data.agent_id, row_data.version_no), '[]'::jsonb)
        from (select * from public.agent_soul_versions order by agent_id, version_no) row_data
      ),
      'agent_skills', (
        select coalesce(jsonb_agg(to_jsonb(row_data) order by row_data.name), '[]'::jsonb)
        from (select * from public.agent_skills order by name) row_data
      ),
      'agent_skill_bindings', (
        select coalesce(jsonb_agg(to_jsonb(row_data) order by row_data.agent_id, row_data.skill_id), '[]'::jsonb)
        from (select * from public.agent_skill_bindings order by agent_id, skill_id) row_data
      ),
      'agent_knowledge_set_bindings', (
        select coalesce(jsonb_agg(to_jsonb(row_data) order by row_data.agent_id, row_data.knowledge_set_id), '[]'::jsonb)
        from (select * from public.agent_knowledge_set_bindings order by agent_id, knowledge_set_id) row_data
      ),
      'agent_route_bindings', (
        select coalesce(jsonb_agg(to_jsonb(row_data) order by row_data.route_key), '[]'::jsonb)
        from (select * from public.agent_route_bindings order by route_key) row_data
      ),
      'knowledge_sets', (
        select coalesce(jsonb_agg(to_jsonb(row_data) order by row_data.set_key nulls last, row_data.name), '[]'::jsonb)
        from (select * from public.knowledge_sets order by set_key nulls last, name) row_data
      ),
      'knowledge_documents', (
        select coalesce(jsonb_agg(to_jsonb(row_data) order by row_data.title), '[]'::jsonb)
        from (select * from public.knowledge_documents order by title) row_data
      ),
      'knowledge_chunks', (
        select coalesce(jsonb_agg(to_jsonb(row_data) order by row_data.document_id, row_data.chunk_index), '[]'::jsonb)
        from (select * from public.knowledge_chunks order by document_id, chunk_index) row_data
      ),
      'knowledge_set_documents', (
        select coalesce(jsonb_agg(to_jsonb(row_data) order by row_data.knowledge_set_id, row_data.document_id), '[]'::jsonb)
        from (select * from public.knowledge_set_documents order by knowledge_set_id, document_id) row_data
      ),
      'knowledge_ingestion_jobs', (
        select coalesce(jsonb_agg(to_jsonb(row_data) order by row_data.created_at), '[]'::jsonb)
        from (select * from public.knowledge_ingestion_jobs order by created_at) row_data
      ),
      'agent_runtime_snapshots', (
        select coalesce(jsonb_agg(to_jsonb(row_data) order by row_data.created_at), '[]'::jsonb)
        from (select * from public.agent_runtime_snapshots order by created_at) row_data
      ),
      'agent_test_runs', (
        select coalesce(jsonb_agg(to_jsonb(row_data) order by row_data.created_at), '[]'::jsonb)
        from (select * from public.agent_test_runs order by created_at) row_data
      )
    )
  )
);
