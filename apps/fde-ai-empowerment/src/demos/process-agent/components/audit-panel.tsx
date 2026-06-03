"use client";

import type { AuditLogEntry } from "@/lib/process-agent/types";

const TYPE_LABEL: Record<AuditLogEntry["type"], string> = {
  user_input: "用户输入",
  plan: "任务拆解",
  tool_call: "工具调用",
  confirmation: "人工确认",
  form_edit: "表单编辑",
  result: "步骤结果",
};

export function AuditPanel({ entries }: { entries: AuditLogEntry[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-900 p-4 text-slate-100">
      <h3 className="text-sm font-semibold">审计日志</h3>
      <p className="mt-0.5 text-xs text-slate-400">全流程可追溯</p>
      <ul className="mt-4 max-h-[320px] space-y-2 overflow-y-auto font-mono text-[11px]">
        {entries.map((e) => (
          <li key={e.id} className="border-l-2 border-indigo-500 pl-2">
            <span className="text-slate-500">
              {new Date(e.timestamp).toLocaleTimeString("zh-CN")}
            </span>{" "}
            <span className="text-indigo-300">[{TYPE_LABEL[e.type]}]</span>{" "}
            {e.message}
            {e.detail && (
              <p className="mt-0.5 truncate text-slate-400">{e.detail}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
