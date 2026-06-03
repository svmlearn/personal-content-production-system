"use client";

import { Sparkles } from "lucide-react";
import { useMeeting } from "../meeting-context";

export function TranscriptPanel() {
  const {
    activeMeeting,
    transcriptVisibleCount,
    isSimulatingLive,
    generateMinutes,
  } = useMeeting();

  if (!activeMeeting) return null;

  const visible = activeMeeting.transcript.slice(0, transcriptVisibleCount);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900">会议转写</h3>
          {isSimulatingLive && (
            <span className="animate-pulse text-xs text-indigo-600">
              模拟实时转写中…
            </span>
          )}
        </div>
        <ul className="space-y-3">
          {visible.map((seg) => (
            <li
              key={seg.id}
              className={`rounded-lg border p-3 ${
                seg.isHighlight
                  ? "border-indigo-200 bg-indigo-50/40"
                  : "border-slate-100 bg-white"
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-indigo-700">
                  {seg.speakerName}
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  {seg.startTime}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">
                {seg.text}
              </p>
            </li>
          ))}
        </ul>
        {!activeMeeting.hasMinutes && !isSimulatingLive && (
          <button
            type="button"
            onClick={generateMinutes}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Sparkles className="h-4 w-4" />
            生成会议纪要
          </button>
        )}
      </div>

      <aside className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="flex items-center gap-1 text-xs font-semibold uppercase text-slate-500">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          AI 实时重点
        </h3>
        <ul className="mt-3 space-y-2 text-xs text-slate-600">
          {activeMeeting.liveHighlights.map((h) => (
            <li key={h} className="rounded-lg bg-white p-2 border border-slate-100">
              {h}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
