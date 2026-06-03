"use client";

import {
  Briefcase,
  FileText,
  LayoutDashboard,
  Mail,
  MessageSquare,
  UserCircle,
} from "lucide-react";
import type { SalesView } from "../sales-context";
import { useSales } from "../sales-context";

const ITEMS: { id: SalesView; label: string; icon: typeof LayoutDashboard }[] =
  [
    { id: "dashboard", label: "工作台", icon: LayoutDashboard },
    { id: "customer360", label: "客户360", icon: UserCircle },
    { id: "visit", label: "拜访准备", icon: Briefcase },
    { id: "proposal", label: "方案生成", icon: FileText },
    { id: "meeting", label: "会议纪要", icon: MessageSquare },
    { id: "email", label: "跟进邮件", icon: Mail },
  ];

export function AppNav() {
  const { view, setView } = useSales();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-slate-900 px-2 py-2">
      {ITEMS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => setView(id)}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium sm:text-sm ${
            view === id
              ? "bg-white text-slate-900"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {label}
        </button>
      ))}
    </nav>
  );
}
