import fs from "node:fs";

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error("Usage: node generate-agent-console-import-sql.mjs <sanitized-json> <output-sql>");
  process.exit(1);
}

const payload = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const tables = payload.tables;

const insertOrder = [
  "agent_configs",
  "knowledge_sets",
  "agent_skills",
  "agent_prompt_versions",
  "agent_soul_versions",
  "knowledge_documents",
  "knowledge_chunks",
  "agent_skill_bindings",
  "agent_knowledge_set_bindings",
  "knowledge_set_documents",
  "agent_route_bindings",
];

const deleteOrder = [
  "agent_runtime_snapshots",
  "agent_test_runs",
  "agent_route_bindings",
  "agent_skill_bindings",
  "agent_knowledge_set_bindings",
  "knowledge_set_documents",
  "knowledge_chunks",
  "knowledge_ingestion_jobs",
  "agent_prompt_versions",
  "agent_soul_versions",
  "agent_skills",
  "knowledge_documents",
  "knowledge_sets",
  "agent_configs",
];

const columnOrder = {
  agent_configs: [
    "id",
    "agent_key",
    "display_name",
    "role_description",
    "description",
    "service_status",
    "service_flags",
    "model_config",
    "copied_from_agent_id",
    "created_by_admin_id",
    "created_at",
    "updated_at",
  ],
  agent_prompt_versions: [
    "id",
    "agent_id",
    "version_no",
    "body",
    "status",
    "change_note",
    "created_by_admin_id",
    "created_at",
    "activated_at",
    "archived_at",
  ],
  agent_soul_versions: [
    "id",
    "agent_id",
    "version_no",
    "body",
    "status",
    "change_note",
    "created_by_admin_id",
    "created_at",
    "activated_at",
    "archived_at",
  ],
  agent_skills: [
    "id",
    "skill_key",
    "name",
    "description",
    "when_to_use",
    "body",
    "status",
    "dependencies",
    "metadata",
    "created_by_admin_id",
    "created_at",
    "updated_at",
  ],
  agent_skill_bindings: [
    "id",
    "agent_id",
    "skill_id",
    "status",
    "created_by_admin_id",
    "created_at",
    "updated_at",
  ],
  agent_knowledge_set_bindings: [
    "id",
    "agent_id",
    "knowledge_set_id",
    "status",
    "created_by_admin_id",
    "created_at",
    "updated_at",
  ],
  agent_route_bindings: [
    "id",
    "route_key",
    "agent_id",
    "status",
    "description",
    "created_by_admin_id",
    "created_at",
    "updated_at",
  ],
  knowledge_sets: [
    "id",
    "set_key",
    "name",
    "description",
    "scope",
    "merchant_id",
    "status",
    "metadata",
    "created_by_admin_id",
    "created_at",
    "updated_at",
  ],
  knowledge_documents: [
    "id",
    "scope",
    "merchant_id",
    "title",
    "source_name",
    "document_kind",
    "content_kind",
    "storage_provider",
    "bucket_name",
    "storage_key",
    "mime_type",
    "status",
    "summary_text",
    "metadata",
    "created_by_user_id",
    "created_by_admin_id",
    "created_at",
    "updated_at",
  ],
  knowledge_chunks: [
    "id",
    "document_id",
    "chunk_index",
    "content",
    "token_count",
    "metadata",
    "embedding_model",
    "embedding_dimensions",
    "embedding_json",
    "created_at",
  ],
  knowledge_set_documents: [
    "id",
    "knowledge_set_id",
    "document_id",
    "created_by_admin_id",
    "created_at",
  ],
};

function quoteIdent(identifier) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

function quoteLiteral(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlValue(value) {
  if (value === null || value === undefined) {
    return "null";
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "null";
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (Array.isArray(value)) {
    return quoteLiteral(JSON.stringify(value));
  }
  if (typeof value === "object") {
    return quoteLiteral(JSON.stringify(value));
  }
  return quoteLiteral(value);
}

const lines = [];

lines.push("-- Generated from aliyun-agent-console-sanitized-data.json.");
lines.push("-- Does not import platform_settings, runtime snapshots, test runs, or ingestion jobs.");
lines.push("-- Keeps Tencent SiliconFlow / DeepSeek platform_settings untouched.");
lines.push("begin;");
lines.push("set constraints all deferred;");
lines.push("");

for (const table of deleteOrder) {
  lines.push(`delete from public.${quoteIdent(table)};`);
}

lines.push("");

for (const table of insertOrder) {
  const rows = tables[table] ?? [];
  if (rows.length === 0) {
    continue;
  }

  const columns = columnOrder[table];
  if (!columns) {
    throw new Error(`Missing column order for ${table}`);
  }

  lines.push(`insert into public.${quoteIdent(table)} (${columns.map(quoteIdent).join(", ")}) values`);
  rows.forEach((row, index) => {
    const tuple = `  (${columns.map((column) => sqlValue(row[column])).join(", ")})`;
    lines.push(`${tuple}${index === rows.length - 1 ? ";" : ","}`);
  });
  lines.push("");
}

lines.push("commit;");
lines.push("");

fs.writeFileSync(outputPath, lines.join("\n"), "utf8");
