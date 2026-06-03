"use client";

import { useMeeting } from "../meeting-context";
import type { ActionPriority } from "@/lib/meeting-copilot/types";

const PRIORITY_STYLE: Record<ActionPriority, string> = {
  high: "bg-red-100 text-red-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-slate-100 text-slate-600",
};

export function ActionsPanel() {
  const { activeMeeting, updateActionItem } = useMeeting();
  const items = activeMeeting?.actionItems;

  if (!items?.length) {
    return (
      <p className="py-12 text-center text-sm text-slate-500">请先生成会议纪要</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b text-xs text-slate-500">
            <th className="pb-2 font-medium">任务</th>
            <th className="pb-2 font-medium">负责人</th>
            <th className="pb-2 font-medium">截止</th>
            <th className="pb-2 font-medium">优先级</th>
            <th className="pb-2 font-medium">关联议题</th>
            <th className="pb-2 font-medium">状态</th>
          </tr>
        </thead>
        <tbody>
          {items.map((a) => (
            <tr key={a.id} className="border-b border-slate-50">
              <td className="py-3 pr-2 font-medium text-slate-900">{a.title}</td>
              <td className="py-3">
                <input
                  value={a.assignee}
                  onChange={(e) =>
                    updateActionItem(a.id, { assignee: e.target.value })
                  }
                  className="w-24 rounded border px-2 py-1 text-xs"
                />
              </td>
              <td className="py-3">
                <input
                  type="date"
                  value={a.dueDate}
                  onChange={(e) =>
                    updateActionItem(a.id, { dueDate: e.target.value })
                  }
                  className="rounded border px-2 py-1 text-xs"
                />
              </td>
              <td className="py-3">
                <span
                  className={`rounded px-2 py-0.5 text-xs ${PRIORITY_STYLE[a.priority]}`}
                >
                  {a.priority}
                </span>
              </td>
              <td className="py-3 text-xs text-slate-500">{a.relatedTopic}</td>
              <td className="py-3">
                <select
                  value={a.status}
                  onChange={(e) =>
                    updateActionItem(a.id, {
                      status: e.target.value as typeof a.status,
                    })
                  }
                  className="rounded border px-2 py-1 text-xs"
                >
                  <option value="todo">待办</option>
                  <option value="in_progress">进行中</option>
                  <option value="done">完成</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
