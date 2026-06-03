"use client";

import { useEffect, useState } from "react";
import { useTraining } from "../training-context";
import type { RoleplayRole } from "@/lib/training/types";

const ROLES: { id: RoleplayRole; label: string }[] = [
  { id: "objection", label: "客户异议" },
  { id: "complaint", label: "客服投诉" },
  { id: "interview", label: "面试官" },
  { id: "management", label: "管理沟通" },
];

export function RoleplayView() {
  const {
    roleplayRole,
    setRoleplayRole,
    roleplayMessages,
    sendRoleplay,
    resetRoleplay,
    roleplayScore,
    finishRoleplay,
  } = useTraining();
  const [draft, setDraft] = useState("");

  useEffect(() => {
    resetRoleplay();
  }, [roleplayRole, resetRoleplay]);

  return (
    <div className="flex min-h-[480px] flex-col p-4 sm:p-6">
      <div className="flex flex-wrap gap-2">
        {ROLES.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRoleplayRole(r.id)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              roleplayRole === r.id
                ? "bg-violet-600 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex-1 space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
        {roleplayMessages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              m.role === "user"
                ? "ml-auto bg-violet-600 text-white"
                : "bg-white text-slate-800 shadow-sm"
            }`}
          >
            {m.content}
          </div>
        ))}
      </div>

      {!roleplayScore ? (
        <div className="mt-3 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && draft.trim()) {
                sendRoleplay(draft.trim());
                setDraft("");
              }
            }}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="输入你的回应…"
          />
          <button
            type="button"
            onClick={() => {
              if (draft.trim()) {
                sendRoleplay(draft.trim());
                setDraft("");
              }
            }}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm text-white"
          >
            发送
          </button>
          <button
            type="button"
            onClick={finishRoleplay}
            className="rounded-lg border border-violet-300 px-3 py-2 text-sm text-violet-700"
          >
            结束评分
          </button>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 text-sm">
          <p className="text-lg font-bold text-emerald-800">
            综合得分 {roleplayScore.overall}
          </p>
          <ul className="mt-2 grid gap-1 sm:grid-cols-3">
            {roleplayScore.dimensions.map((d) => (
              <li key={d.name} className="text-xs text-slate-600">
                {d.name}：{d.score}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs">
            <span className="font-medium">亮点：</span>
            {roleplayScore.highlights.join("；")}
          </p>
          <p className="mt-1 text-xs text-amber-800">
            <span className="font-medium">改进：</span>
            {roleplayScore.improvements.join("；")}
          </p>
          <button
            type="button"
            onClick={resetRoleplay}
            className="mt-3 text-xs text-violet-600 underline"
          >
            再练一次
          </button>
        </div>
      )}
    </div>
  );
}
