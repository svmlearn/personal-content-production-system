"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { NL_EXAMPLES } from "@/lib/growth-copilot/constants";
import { useGrowth } from "../growth-context";
import { MetricCard } from "./metric-card";

export function DashboardView() {
  const {
    metrics,
    anomalies,
    runNlCommand,
    nlMessage,
    selectMetricForAnomaly,
  } = useGrowth();
  const [input, setInput] = useState("");

  const anomalyIds = new Set(anomalies.map((a) => a.metricId));

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">运营工作台</h2>
        <p className="text-sm text-slate-500">本周核心指标与 AI 分析入口</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((m) => (
          <MetricCard
            key={m.id}
            metric={m}
            isAnomaly={anomalyIds.has(m.id)}
            onClick={() => selectMetricForAnomaly(m.id)}
          />
        ))}
      </div>

      <div className="rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-4">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
          <Sparkles className="h-4 w-4 text-violet-600" />
          增长分析助手
        </label>
        <form
          className="mt-2 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            runNlCommand(input);
            setInput("");
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="用自然语言提问或下达任务…"
            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
          >
            分析
          </button>
        </form>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {NL_EXAMPLES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => runNlCommand(q)}
              className="rounded-full border border-violet-200 bg-white px-2.5 py-1 text-[11px] text-violet-700 hover:bg-violet-50"
            >
              {q}
            </button>
          ))}
        </div>
        {nlMessage && (
          <p className="mt-2 text-xs text-violet-700">{nlMessage}</p>
        )}
      </div>
    </div>
  );
}
