"use client";

import {
  BookOpen,
  FileText,
  Home,
  MessageSquare,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import type { ExpertView } from "@/lib/industry-expert/types";
import { INDUSTRY_LABEL } from "@/lib/industry-expert/types";
import { useExpert } from "../expert-context";

const NAV: { id: ExpertView; label: string; icon: typeof Home }[] = [
  { id: "home", label: "首页", icon: Home },
  { id: "qa", label: "专业问答", icon: MessageSquare },
  { id: "knowledge", label: "知识库", icon: BookOpen },
  { id: "risk", label: "风险识别", icon: ShieldAlert },
  { id: "report", label: "报告生成", icon: FileText },
  { id: "review", label: "专家复核", icon: UserCheck },
];

export function AppNav() {
  const { view, setView } = useExpert();

  return (
    <header className="border-b border-slate-700 bg-slate-900">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-sky-400">
            {INDUSTRY_LABEL} AI Expert
          </p>
          <h1 className="text-sm font-semibold text-white sm:text-base">
            {INDUSTRY_LABEL}行业专家系统
          </h1>
        </div>
      </div>
      <nav className="flex gap-0.5 overflow-x-auto px-2 pb-2">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-medium ${
              view === id
                ? "bg-sky-600 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </nav>
    </header>
  );
}
