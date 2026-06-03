"use client";

import { useMemo, type ReactNode } from "react";
import { AlertTriangle, Star } from "lucide-react";
import { generateQualityReport } from "@/lib/customer-service/engine";
import { INTENT_LABELS } from "@/lib/customer-service/constants";
import { useService } from "../service-context";

export function SupervisorView() {
  const { conversations } = useService();

  const reviewed = useMemo(
    () =>
      conversations
        .filter((c) => c.messages.some((m) => m.role === "user"))
        .map((c) => ({
          conversation: c,
          report: generateQualityReport(c),
        })),
    [conversations],
  );

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900">客服主管质检</h3>
        <p className="text-sm text-slate-500">
          AI 自动生成会话评分、维度分析与改进建议
        </p>
      </div>

      <ul className="space-y-4">
        {reviewed.map(({ conversation: c, report }) => (
          <li
            key={c.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {c.messages.find((m) => m.role === "user")?.content ??
                    "会话记录"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {c.currentIntent && INTENT_LABELS[c.currentIntent]} ·{" "}
                  {new Date(c.updatedAt).toLocaleString("zh-CN")}
                </p>
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1">
                <span className="text-lg font-bold text-indigo-600">
                  {report.score}
                </span>
                <span className="text-xs text-slate-500">分</span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-3 text-xs">
              <Metric
                label="满意度"
                value={
                  c.satisfaction ? (
                    <span className="flex items-center gap-0.5">
                      {c.satisfaction}
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    </span>
                  ) : (
                    "—"
                  )
                }
              />
              <Metric label="已解决" value={c.resolved ? "是" : "否"} />
              <Metric label="转人工" value={c.transferredToHuman ? "是" : "否"} />
              <Metric
                label="知识命中"
                value={c.knowledgeHits.length > 0 ? `${c.knowledgeHits.length} 条` : "无"}
              />
            </div>

            {c.riskFlags.length > 0 && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-100 bg-red-50/80 p-2 text-xs text-red-800">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>风险提示：{c.riskFlags.join("、")}</span>
              </div>
            )}

            <p className="mt-3 text-xs text-slate-600">{report.summary}</p>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {report.dimensions.map((d) => (
                <div
                  key={d.label}
                  className="rounded-lg border border-slate-100 bg-slate-50/80 p-2"
                >
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{d.label}</span>
                    <span className="text-indigo-600">{d.score}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">{d.comment}</p>
                </div>
              ))}
            </div>

            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-700">改进建议</p>
              <ul className="mt-1 list-disc pl-4 text-xs text-slate-600">
                {report.improvements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div>
      <span className="text-slate-400">{label} </span>
      <span className="font-medium text-slate-700">{value}</span>
    </div>
  );
}
