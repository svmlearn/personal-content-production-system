. as $root |
def text($value): ($value // "");
def fence($value; $kind): "```" + $kind + "\n" + text($value) + "\n```";
def json_fence($value): "```json\n" + ($value | tojson) + "\n```";
def agent_name($id):
  (($root.tables.agent_configs[]? | select(.id == $id) | "\(.agent_key) / \(.display_name)") // $id);
def skill_name($id):
  (($root.tables.agent_skills[]? | select(.id == $id) | "\(.skill_key // "no-key") / \(.name)") // $id);
def knowledge_set_name($id):
  (($root.tables.knowledge_sets[]? | select(.id == $id) | "\(.set_key // "no-key") / \(.name)") // $id);
def document_name($id):
  (($root.tables.knowledge_documents[]? | select(.id == $id) | .title) // $id);

"# Agent Console Readable Export\n\n" +
"Generated from the matching JSON backup. Secrets are not read from environment files here; this document contains database rows only.\n\n" +
"## Table Counts\n\n" +
(
  $root.tables
  | to_entries
  | map("- `\(.key)`: \(.value | length)")
  | join("\n")
) +
"\n\n## Agents\n\n" +
(
  $root.tables.agent_configs
  | sort_by(.agent_key)
  | map("- `\(.agent_key)` / \(.display_name) / status=`\(.service_status)` / flags=`\(.service_flags | tojson)`")
  | join("\n")
) +
"\n\n## Route Bindings\n\n" +
(
  $root.tables.agent_route_bindings
  | sort_by(.route_key)
  | map("- `\(.route_key)` -> \(agent_name(.agent_id)) / status=`\(.status)` / description=\(text(.description))")
  | join("\n")
) +
"\n\n## Prompt Versions: agent.md / System Prompt\n\n" +
(
  $root.tables.agent_prompt_versions
  | sort_by(.agent_id, .version_no)
  | map(
      "### \(agent_name(.agent_id)) - agent.md v\(.version_no) [\(.status)]\n\n" +
      "- id: `\(.id)`\n" +
      "- change_note: \(text(.change_note))\n" +
      "- created_at: \(text(.created_at))\n" +
      "- activated_at: \(text(.activated_at))\n" +
      "- archived_at: \(text(.archived_at))\n\n" +
      fence(.body; "text")
    )
  | join("\n\n")
) +
"\n\n## Soul Versions: soul.md\n\n" +
(
  $root.tables.agent_soul_versions
  | sort_by(.agent_id, .version_no)
  | map(
      "### \(agent_name(.agent_id)) - soul.md v\(.version_no) [\(.status)]\n\n" +
      "- id: `\(.id)`\n" +
      "- change_note: \(text(.change_note))\n" +
      "- created_at: \(text(.created_at))\n" +
      "- activated_at: \(text(.activated_at))\n" +
      "- archived_at: \(text(.archived_at))\n\n" +
      fence(.body; "text")
    )
  | join("\n\n")
) +
"\n\n## Skills\n\n" +
(
  $root.tables.agent_skills
  | sort_by(.name)
  | map(
      "### \(.name) (`\(.skill_key // "no-key")`) [\(.status)]\n\n" +
      "- id: `\(.id)`\n" +
      "- description: \(text(.description))\n" +
      "- when_to_use: \(text(.when_to_use))\n" +
      "- dependencies:\n\n" + json_fence(.dependencies) + "\n\n" +
      "- metadata:\n\n" + json_fence(.metadata) + "\n\n" +
      "#### Body\n\n" +
      fence(.body; "text")
    )
  | join("\n\n")
) +
"\n\n## Agent Skill Bindings\n\n" +
(
  $root.tables.agent_skill_bindings
  | sort_by(.agent_id, .skill_id)
  | map("- \(agent_name(.agent_id)) -> \(skill_name(.skill_id)) / status=`\(.status)`")
  | join("\n")
) +
"\n\n## Knowledge Sets\n\n" +
(
  $root.tables.knowledge_sets
  | sort_by(.set_key, .name)
  | map("- `\(.set_key // "no-key")` / \(.name) / scope=`\(.scope)` / status=`\(.status)` / description=\(text(.description))")
  | join("\n")
) +
"\n\n## Agent Knowledge Set Bindings\n\n" +
(
  $root.tables.agent_knowledge_set_bindings
  | sort_by(.agent_id, .knowledge_set_id)
  | map("- \(agent_name(.agent_id)) -> \(knowledge_set_name(.knowledge_set_id)) / status=`\(.status)`")
  | join("\n")
) +
"\n\n## Knowledge Set Documents\n\n" +
(
  $root.tables.knowledge_set_documents
  | sort_by(.knowledge_set_id, .document_id)
  | map("- \(knowledge_set_name(.knowledge_set_id)) -> \(document_name(.document_id))")
  | join("\n")
) +
"\n\n## Knowledge Documents And Chunks\n\n" +
(
  $root.tables.knowledge_documents
  | sort_by(.title)
  | map(
      . as $document |
      "### \($document.title)\n\n" +
      "- id: `\($document.id)`\n" +
      "- source_name: \(text($document.source_name))\n" +
      "- storage_provider: \(text($document.storage_provider))\n" +
      "- status: \(text($document.status))\n" +
      "- summary_text: \(text($document.summary_text))\n" +
      "- metadata:\n\n" + json_fence($document.metadata) + "\n\n" +
      (
        $root.tables.knowledge_chunks
        | map(select(.document_id == $document.id))
        | sort_by(.chunk_index)
        | map(
            "#### Chunk \(.chunk_index)\n\n" +
            "- id: `\(.id)`\n" +
            "- token_count: \(.token_count)\n" +
            "- metadata:\n\n" + json_fence(.metadata) + "\n\n" +
            fence(.content; "text")
          )
        | join("\n\n")
      )
    )
  | join("\n\n")
)
