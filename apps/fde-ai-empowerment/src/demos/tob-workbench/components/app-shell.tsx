"use client";

import { History, LayoutDashboard, Settings, Sparkles } from "lucide-react";
import type { WorkbenchView } from "@/lib/tob-workbench/types";
import { USERS } from "@/lib/tob-workbench/mock-data";
import { useWorkbench } from "../workbench-context";

const NAV: { id: WorkbenchView; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "workbench", label: "工作台", icon: LayoutDashboard },
  { id: "task", label: "AI 任务", icon: Sparkles },
  { id: "history", label: "历史记录", icon: History },
  { id: "admin", label: "管理配置", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { view, setView, currentUser, setUserRole } = useWorkbench();

  return (
    <div className="flex min-h-[640px] flex-col bg-slate-50 lg:flex-row">
      <aside className="w-full shrink-0 border-b border-slate-200 bg-white lg:w-56 lg:border-b-0 lg:border-r">
        <div className="border-b border-slate-100 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
            ToB Universal
          </p>
          <h1 className="text-sm font-bold text-slate-900">通用 AI 工作台</h1>
          <p className="mt-1 text-xs text-slate-500">跨行业 · 可编排 · 可审计</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-visible">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium lg:w-full ${
                view === id || (id === "task" && view === "result")
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
        <div className="hidden border-t border-slate-100 p-3 lg:block">
          <p className="text-xs text-slate-500">当前身份</p>
          <select
            value={currentUser.role}
            onChange={(e) => setUserRole(e.target.value as typeof currentUser.role)}
            className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs"
          >
            {USERS.map((u) => (
              <option key={u.id} value={u.role}>
                {u.name} · {u.role}
              </option>
            ))}
          </select>
        </div>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}

export function PageHeader({
  title,
  desc,
}: {
  title: string;
  desc?: string;
}) {
  return (
    <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {desc && <p className="mt-1 text-sm text-slate-500">{desc}</p>}
    </div>
  );
}
