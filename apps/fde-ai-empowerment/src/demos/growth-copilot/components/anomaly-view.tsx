"use client";

import { METRIC_LABELS } from "@/lib/growth-copilot/constants";
import type { MetricId } from "@/lib/growth-copilot/types";
import { recommendActions } from "@/lib/growth-copilot/engine";
import { useGrowth } from "../growth-context";

export function AnomalyView() {
  const {
    metrics,
    anomalies,
    selectedMetricId,
    setSelectedMetricId,
    anomalyDetail,
  } = useGrowth();

  const metric = metrics.find((m) => m.id === selectedMetricId);
  const detail = anomalyDetail;
  const actions = metric ? recommendActions(metric) : [];

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">异常洞察</h2>
      <p className="mt-1 text-sm text-slate-500">
        自动标记异常指标 · 点击切换查看 AI 归因
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {metrics.map((m) => {
          const isAnomaly = anomalies.some((a) => a.metricId === m.id);
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedMetricId(m.id)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedMetricId === m.id
                  ? "border-violet-600 bg-violet-50 text-violet-800"
                  : isAnomaly
                    ? "border-amber-300 bg-amber-50 text-amber-900"
                    : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              {m.name}
              {isAnomaly && " ⚠"}
            </button>
          );
        })}
      </div>

      {detail && metric ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section className="rounded-xl border border-amber-200 bg-amber-50/30 p-5">
            <span
              className={`rounded px-2 py-0.5 text-xs font-medium ${
                detail.severity === "high"
                  ? "bg-red-100 text-red-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {detail.severity === "high" ? "高优先级" : "需关注"}
            </span>
            <h3 className="mt-2 text-base font-semibold text-slate-900">
              {METRIC_LABELS[detail.metricId as MetricId]} 异常
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              {detail.description}
            </p>
            <Block title="可能原因" items={detail.possibleCauses} />
            <p className="mt-3 text-sm">
              <span className="font-medium text-slate-800">影响范围：</span>
              {detail.impact}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              相关维度：{detail.dimensions.join(" · ")}
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-900">建议动作</h3>
            <ul className="mt-3 space-y-2">
              {actions.map((a) => (
                <li
                  key={a.id}
                  className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800">{a.title}</span>
                    <span
                      className={`text-[10px] font-medium ${
                        a.priority === "high"
                          ? "text-red-600"
                          : "text-amber-600"
                      }`}
                    >
                      {a.priority}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{a.reason}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : (
        <p className="mt-8 text-center text-sm text-slate-500">
          选择指标查看洞察
        </p>
      )}
    </div>
  );
}

function Block({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-4">
      <p className="text-xs font-semibold uppercase text-slate-500">{title}</p>
      <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-slate-600">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}
