"use client";

import { useEffect } from "react";
import { useTraining } from "../training-context";
import { SkillRadar } from "./skill-radar";

export function ReportView() {
  const { report, refreshReport } = useTraining();

  useEffect(() => {
    refreshReport();
  }, [refreshReport]);

  if (!report) return null;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "学习进度", value: `${report.progressPercent}%` },
          { label: "测验均分", value: `${report.quizAvg}` },
          { label: "陪练均分", value: `${report.roleplayAvg}` },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-4 text-center"
          >
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-violet-700">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="font-semibold text-slate-900">能力雷达</h3>
        <SkillRadar skills={report.skills} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">薄弱点</h3>
          <ul className="mt-2 list-disc pl-4 text-sm text-slate-700">
            {report.weakPoints.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-4">
          <h3 className="text-sm font-semibold text-violet-900">下阶段建议</h3>
          <ul className="mt-2 list-disc pl-4 text-sm text-slate-700">
            {report.nextSteps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
