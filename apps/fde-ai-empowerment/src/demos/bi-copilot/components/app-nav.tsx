"use client";

import {
  AlertCircle,
  BookOpen,
  Database,
  FileText,
  LayoutDashboard,
  Megaphone,
  Sparkles,
} from "lucide-react";
import type { BiView } from "../bi-context";
import { useBi } from "../bi-context";

const ITEMS: { id: BiView; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "数据工作台", icon: LayoutDashboard },
  { id: "catalog", label: "指标目录", icon: BookOpen },
  { id: "anomaly", label: "异常诊断", icon: AlertCircle },
  { id: "analysis", label: "智能分析", icon: Sparkles },
  { id: "sql", label: "SQL 实验室", icon: Database },
  { id: "campaign", label: "策略方案", icon: Megaphone },
  { id: "review", label: "复盘报告", icon: FileText },
];

export function AppNav() {
  const { view, setView, anomalies } = useBi();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-teal-950 bg-gradient-to-r from-slate-900 to-teal-950 px-2 py-2">
      {ITEMS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => setView(id)}
          className={`relative inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium sm:text-sm ${
            view === id
              ? "bg-teal-500 text-white"
              : "text-slate-300 hover:bg-white/10"
          }`}
        >
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {label}
          {id === "anomaly" && anomalies.length > 0 && (
            <span className="rounded-full bg-amber-400 px-1.5 text-[10px] text-slate-900">
              {anomalies.length}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}
