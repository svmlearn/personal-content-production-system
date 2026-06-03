"use client";

import {
  AlertCircle,
  FileText,
  LayoutDashboard,
  Megaphone,
  Sparkles,
} from "lucide-react";
import type { GrowthView } from "../growth-context";
import { useGrowth } from "../growth-context";

const ITEMS: { id: GrowthView; label: string; icon: typeof LayoutDashboard }[] =
  [
    { id: "dashboard", label: "工作台", icon: LayoutDashboard },
    { id: "anomaly", label: "异常洞察", icon: AlertCircle },
    { id: "analysis", label: "NL 分析", icon: Sparkles },
    { id: "campaign", label: "活动方案", icon: Megaphone },
    { id: "review", label: "复盘报告", icon: FileText },
  ];

export function AppNav() {
  const { view, setView, anomalies } = useGrowth();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-slate-800 bg-slate-900 px-2 py-2">
      {ITEMS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => setView(id)}
          className={`relative inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium sm:text-sm ${
            view === id
              ? "bg-violet-600 text-white"
              : "text-slate-300 hover:bg-slate-800"
          }`}
        >
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {label}
          {id === "anomaly" && anomalies.length > 0 && (
            <span className="ml-1 rounded-full bg-amber-500 px-1.5 text-[10px] text-white">
              {anomalies.length}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}
