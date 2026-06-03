"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { NL_EXAMPLES } from "@/lib/growth-copilot/constants";
import { useBi } from "../bi-context";
import { MetricCard } from "../../growth-copilot/components/metric-card";
import { FunnelChart } from "./funnel-chart";

export function DashboardView() {
  const { metrics, anomalies, runNlCommand, nlMessage, selectMetricForAnomaly } =
    useBi();
  const [input, setInput] = useState("");

  const anomalyIds = new Set(anomalies.map((a) => a.metricId));

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          数据分析 / BI 工作台
        </h2>
        <p className="text-sm text-slate-500">
          指标看板 · 漏斗 · 自然语言查询与策略生成
        </p>
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

      <FunnelChart />

      <div className="rounded-xl border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-4">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
          <Sparkles className="h-4 w-4 text-teal-600" />
          BI Copilot
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
            placeholder="提问、查数或生成运营策略…"
            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            执行
          </button>
        </form>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {NL_EXAMPLES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => runNlCommand(q)}
              className="rounded-full border border-teal-200 bg-white px-2.5 py-1 text-[11px] text-teal-800 hover:bg-teal-50"
            >
              {q}
            </button>
          ))}
        </div>
        {nlMessage && (
          <p className="mt-2 text-xs text-teal-700">{nlMessage}</p>
        )}
      </div>
    </div>
  );
}
