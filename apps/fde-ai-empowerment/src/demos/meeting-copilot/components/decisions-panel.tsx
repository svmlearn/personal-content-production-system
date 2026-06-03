"use client";

import { useMeeting } from "../meeting-context";

export function DecisionsPanel() {
  const { activeMeeting } = useMeeting();
  const decisions = activeMeeting?.decisions;

  if (!decisions?.length) {
    return (
      <p className="py-12 text-center text-sm text-slate-500">请先生成会议纪要</p>
    );
  }

  return (
    <ul className="space-y-4">
      {decisions.map((d) => (
        <li
          key={d.id}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <h3 className="font-semibold text-slate-900">{d.content}</h3>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-500">决策背景</dt>
              <dd className="text-slate-700">{d.background}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">参与讨论</dt>
              <dd className="text-slate-700">{d.participants.join("、")}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">影响范围</dt>
              <dd className="text-slate-700">{d.impact}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">后续动作</dt>
              <dd className="text-slate-700">{d.followUp}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  );
}
