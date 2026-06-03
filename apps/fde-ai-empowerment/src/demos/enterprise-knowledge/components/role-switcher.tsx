"use client";

import { ROLES } from "@/lib/knowledge/mock-data";
import { useKnowledge } from "../knowledge-context";
import type { RoleId } from "@/lib/knowledge/types";

const ROLE_ORDER: RoleId[] = ["employee", "manager", "admin"];

export function RoleSwitcher() {
  const { user, setUserByRole } = useKnowledge();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-slate-500">模拟角色</span>
      <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
        {ROLE_ORDER.map((roleId) => (
          <button
            key={roleId}
            type="button"
            onClick={() => setUserByRole(roleId)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              user.role === roleId
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {ROLES[roleId].label}
          </button>
        ))}
      </div>
      <span className="hidden text-xs text-slate-500 sm:inline">
        {user.name} · {user.department}
      </span>
    </div>
  );
}
