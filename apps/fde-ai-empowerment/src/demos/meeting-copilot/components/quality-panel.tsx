"use client";

import { useMeeting } from "../meeting-context";

export function QualityPanel() {
  const { activeMeeting } = useMeeting();
  const q = activeMeeting?.quality;

  if (!q) {
    return (
      <p className="py-12 text-center text-sm text-slate-500">请先生成会议纪要</p>
    );
  }

  const dims = [
    { label: "时长合理性", score: q.durationScore, comment: q.durationComment },
    { label: "议题清晰度", score: q.clarityScore, comment: q.clarityComment },
    { label: "结论明确性", score: q.conclusionScore, comment: q.conclusionComment },
    { label: "待办责任人", score: q.ownershipScore, comment: q.ownershipComment },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-6">
        <div className="text-center">
          <p className="text-4xl font-bold text-indigo-600">{q.overallScore}</p>
          <p className="text-xs text-slate-500">综合评分</p>
        </div>
        <p className="text-sm text-slate-600">
          AI 基于转写内容、决策与待办覆盖度评估本次会议质量，供团队复盘改进。
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {dims.map((d) => (
          <div key={d.label} className="rounded-xl border bg-white p-4">
            <div className="flex justify-between text-sm font-semibold">
              <span>{d.label}</span>
              <span className="text-indigo-600">{d.score}</span>
            </div>
            <p className="mt-2 text-xs text-slate-600">{d.comment}</p>
          </div>
        ))}
      </div>
      <section>
        <h3 className="text-sm font-semibold">改进建议</h3>
        <ul className="mt-2 list-decimal space-y-1 pl-4 text-sm text-slate-600">
          {q.improvements.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
