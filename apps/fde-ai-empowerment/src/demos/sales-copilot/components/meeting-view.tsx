"use client";

import { Sparkles } from "lucide-react";
import { useSales } from "../sales-context";

export function MeetingView() {
  const { transcript, setTranscript, meetingNote, parseMeeting, generateEmail } =
    useSales();

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">会议纪要</h2>
      <p className="mt-1 text-sm text-slate-500">
        粘贴会议记录，AI 自动提取需求、异议、决策人与待办
      </p>

      <textarea
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        rows={8}
        className="mt-4 w-full rounded-xl border border-slate-200 p-3 text-sm leading-relaxed outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
      />

      <button
        type="button"
        onClick={parseMeeting}
        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        <Sparkles className="h-4 w-4" />
        AI 解析纪要
      </button>

      {meetingNote && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card title="客户需求" items={meetingNote.customerNeeds} />
          <Card title="异议点" items={meetingNote.objections} />
          <Card title="决策人" items={meetingNote.decisionMakers} />
          <div className="rounded-xl border border-slate-200 bg-white p-4 md:col-span-2">
            <h3 className="text-sm font-semibold">待办事项</h3>
            <ul className="mt-2 space-y-2">
              {meetingNote.actionItems.map((a) => (
                <li
                  key={a.task}
                  className="flex flex-wrap justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm"
                >
                  <span>{a.task}</span>
                  <span className="text-xs text-slate-500">
                    {a.owner} · {a.due}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 md:col-span-2">
            <h3 className="text-sm font-semibold text-blue-900">跟进建议</h3>
            <p className="mt-2 text-sm text-slate-700">
              {meetingNote.followUpSuggestion}
            </p>
            <button
              type="button"
              onClick={generateEmail}
              className="mt-3 text-sm font-medium text-blue-700 hover:underline"
            >
              基于此纪要生成跟进邮件 →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-600">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}
