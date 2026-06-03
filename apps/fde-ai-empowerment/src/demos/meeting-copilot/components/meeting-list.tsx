"use client";

import { useState } from "react";
import { Calendar, Plus, Users } from "lucide-react";
import type { MeetingType } from "@/lib/meeting-copilot/types";
import { useMeeting } from "../meeting-context";

const TYPE_LABEL: Record<MeetingType, string> = {
  standup: "站会",
  review: "评审",
  planning: "计划",
  sales: "客户会议",
  retro: "复盘",
};

export function MeetingList() {
  const { meetings, openMeeting, createMeeting } = useMeeting();
  const [title, setTitle] = useState("");
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">AI 会议 Copilot</h2>
          <p className="mt-1 text-sm text-slate-500">转写 · 纪要 · 待办 · 决策沉淀</p>
        </div>
        <button
          type="button"
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          新建会议记录
        </button>
      </div>

      {showNew && (
        <form
          className="mt-4 flex gap-2 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            createMeeting(title);
            setTitle("");
            setShowNew(false);
          }}
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="会议标题…"
            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white"
          >
            创建
          </button>
        </form>
      )}

      <ul className="mt-8 space-y-3">
        {meetings.map((m) => (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => openMeeting(m.id)}
              className="flex w-full flex-col rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:border-indigo-300 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="font-semibold text-slate-900">{m.title}</h3>
                <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(m.startTime).toLocaleString("zh-CN")}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {m.participants.length} 人
                  </span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5">
                    {TYPE_LABEL[m.type]}
                  </span>
                </p>
              </div>
              <div className="mt-2 flex items-center gap-2 sm:mt-0">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    m.hasMinutes
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {m.hasMinutes ? "已生成纪要" : "待生成纪要"}
                </span>
                <span className="text-xs text-slate-400">{m.status}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
