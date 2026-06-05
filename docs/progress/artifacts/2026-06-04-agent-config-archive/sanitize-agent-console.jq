def strip_legacy_phrase:
  walk(if type == "string" then gsub("静境商家平台的商家"; "") else . end);

def strip_agent_merchant_framing:
  .tables.agent_prompt_versions |= map(.body |= (gsub("local service merchants"; "users") | gsub("商家"; "用户")))
  | .tables.agent_soul_versions |= map(.body |= gsub("商家"; "用户"))
  | .tables.agent_skills |= map(.body |= gsub("输出给商家的内容"; "输出给用户的内容"))
  | .tables.agent_route_bindings |= map(.description |= if . == null then null else gsub("Default merchant consultation route\\."; "Default consultation route.") end);

strip_legacy_phrase
| . as $root
| (
    $root.tables.knowledge_documents
    | map(select(
        ((.title // "") | test("^对话记录[0-9]+$"))
        or ((.source_name // "") | test("^20260509_[0-9]+\\.txt$"))
        or ((.source_name // "") | test("芭芭客功能测试对接"))
      ) | .id)
  ) as $removedDocumentIds
| .tables.knowledge_documents = (
    .tables.knowledge_documents
    | map(select(.id as $id | $removedDocumentIds | index($id) | not))
  )
| .tables.knowledge_chunks = (
    .tables.knowledge_chunks
    | map(select(.document_id as $id | $removedDocumentIds | index($id) | not))
  )
| .tables.knowledge_set_documents = (
    .tables.knowledge_set_documents
    | map(select(.document_id as $id | $removedDocumentIds | index($id) | not))
  )
| .tables.knowledge_ingestion_jobs = []
| .tables.agent_runtime_snapshots = []
| .tables.agent_test_runs = []
| strip_agent_merchant_framing
