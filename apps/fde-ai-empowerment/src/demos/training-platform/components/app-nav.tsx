"use client";

import {
  BarChart3,
  BookOpen,
  GraduationCap,
  HelpCircle,
  Home,
  MessageSquare,
  Shield,
} from "lucide-react";
import type { TrainingView } from "@/lib/training/types";
import { useTraining } from "../training-context";

const NAV: { id: TrainingView; label: string; icon: typeof Home }[] = [
  { id: "home", label: "学习首页", icon: Home },
  { id: "path", label: "学习路径", icon: BookOpen },
  { id: "qa", label: "知识问答", icon: HelpCircle },
  { id: "roleplay", label: "AI 陪练", icon: MessageSquare },
  { id: "quiz", label: "测验", icon: GraduationCap },
  { id: "report", label: "学习报告", icon: BarChart3 },
  { id: "admin", label: "管理后台", icon: Shield },
];

export function AppNav() {
  const { view, setView } = useTraining();

  return (
    <nav className="flex flex-wrap gap-1 border-b border-slate-200 bg-white px-2 py-2 sm:px-4">
      {NAV.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => setView(id)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors sm:px-3 sm:text-sm ${
            view === id
              ? "bg-violet-100 text-violet-800"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </nav>
  );
}
