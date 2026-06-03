"use client";

import { Headphones, MessageCircle, ShieldCheck } from "lucide-react";
import type { ServiceView } from "../service-context";
import { useService } from "../service-context";

const VIEWS: { id: ServiceView; label: string; icon: typeof MessageCircle }[] = [
  { id: "customer", label: "客户咨询", icon: MessageCircle },
  { id: "agent", label: "坐席工作台", icon: Headphones },
  { id: "supervisor", label: "主管质检", icon: ShieldCheck },
];

export function AppNav() {
  const { view, setView } = useService();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2">
      {VIEWS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => setView(id)}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            view === id
              ? "bg-indigo-600 text-white"
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
