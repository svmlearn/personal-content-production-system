"use client";

import { METRIC_LABELS } from "@/lib/growth-copilot/constants";
import { recommendActions } from "@/lib/bi-copilot/engine";
import type { MetricId } from "@/lib/growth-copilot/types";
import { useBi } from "../bi-context";

export function AnomalyView() {
  const {
    metrics,
    anomalies,
    selectedMetricId,
    setSelectedMetricId,
    anomalyDetail,
  } = useBi();

  const metric = metrics.find((m) => m.id === selectedMetricId);
  const detail = anomalyDetail;
  const actions = metric ? recommendActions(metric) : [];

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">异常诊断</h2>
      <p className="mt-1 text-sm text-slate-500">自动检测 · AI 归因与下钻建议</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {metrics.map((m) => {
          const isAnomaly = anomalies.some((a) => a.metricId === m.id);
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedMetricId(m.id)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                selectedMetricId === m.id
                  ? "border-teal-600 bg-teal-50 text-teal-900"
                  : isAnomaly
                    ? "border-amber-300 bg-amber-50"
                    : "border-slate-200 bg-white"
              }`}
            >
              {m.name}
              {isAnomaly && " ⚠"}
            </button>
          );
        })}
      </div>
      {detail && metric && (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section className="rounded-xl border border-amber-200 bg-amber-50/40 p-5">
            <h3 className="font-semibold text-slate-900">
              {METRIC_LABELS[detail.metricId as MetricId]}
            </h3>
            <p className="mt-2 text-sm text-slate-700">{detail.description}</p>
            <ul className="mt-3 list-disc pl-4 text-sm text-slate-600">
              {detail.possibleCauses.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              维度：{detail.dimensions.join(" · ")}
            </p>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold">建议动作</h3>
            <ul className="mt-2 space-y-2">
              {actions.map((a) => (
                <li key={a.id} className="rounded-lg bg-slate-50 p-3 text-sm">
                  {a.title}
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
