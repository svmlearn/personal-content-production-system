"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Check,
  Copy,
  Mail,
  Send,
} from "lucide-react";
import { useMeeting } from "../meeting-context";
import { TranscriptPanel } from "./transcript-panel";
import { MinutesPanel } from "./minutes-panel";
import { ActionsPanel } from "./actions-panel";
import { DecisionsPanel } from "./decisions-panel";
import { QualityPanel } from "./quality-panel";

const TABS = [
  { id: "transcript" as const, label: "转写" },
  { id: "minutes" as const, label: "纪要" },
  { id: "actions" as const, label: "待办" },
  { id: "decisions" as const, label: "决策" },
  { id: "quality" as const, label: "质量分析" },
];

export function MeetingDetail() {
  const {
    activeMeeting,
    backToList,
    tab,
    setTab,
    syncProject,
    syncCalendar,
    sendEmail,
    copyMinutes,
    syncToast,
    clearSyncToast,
  } = useMeeting();
  const [copied, setCopied] = useState(false);

  if (!activeMeeting) return null;

  async function handleCopy() {
    const md = copyMinutes();
    if (md) {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="min-h-[640px]">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <button
          type="button"
          onClick={backToList}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          会议列表
        </button>
        <h2 className="mt-2 text-lg font-semibold text-slate-900">
          {activeMeeting.title}
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          {new Date(activeMeeting.startTime).toLocaleString("zh-CN")} ·{" "}
          {activeMeeting.participants.map((p) => p.name).join("、")}
        </p>

        <div className="mt-4 flex gap-1 overflow-x-auto border-b border-slate-100">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`shrink-0 border-b-2 px-3 py-2 text-sm font-medium ${
                tab === t.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeMeeting.hasMinutes && (
          <div className="mt-3 flex flex-wrap gap-2">
            <SyncBtn icon={Send} label="同步项目" onClick={syncProject} />
            <SyncBtn icon={Calendar} label="同步日程" onClick={syncCalendar} />
            <SyncBtn icon={Mail} label="发送邮件" onClick={sendEmail} />
            <SyncBtn
              icon={copied ? Check : Copy}
              label={copied ? "已复制" : "复制纪要"}
              onClick={handleCopy}
            />
          </div>
        )}
      </header>

      <div className="p-4 sm:p-6">
        {tab === "transcript" && <TranscriptPanel />}
        {tab === "minutes" && <MinutesPanel />}
        {tab === "actions" && <ActionsPanel />}
        {tab === "decisions" && <DecisionsPanel />}
        {tab === "quality" && <QualityPanel />}
      </div>

      {syncToast && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">
          {syncToast}
          <button type="button" className="ml-3 underline" onClick={clearSyncToast}>
            关闭
          </button>
        </div>
      )}
    </div>
  );
}

function SyncBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Send;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
