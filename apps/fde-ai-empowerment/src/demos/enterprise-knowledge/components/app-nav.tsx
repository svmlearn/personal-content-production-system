"use client";

import { BookMarked, Home, Library } from "lucide-react";
import { useKnowledge } from "../knowledge-context";

export function AppNav() {
  const { view, setView } = useKnowledge();

  const items = [
    { id: "home" as const, label: "工作台", icon: Home },
    { id: "qa" as const, label: "知识问答", icon: BookMarked },
    { id: "admin" as const, label: "知识库管理", icon: Library },
  ];

  return (
    <nav className="flex gap-1 overflow-x-auto">
      {items.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => setView(id)}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            view === id
              ? "bg-sky-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </nav>
  );
}
