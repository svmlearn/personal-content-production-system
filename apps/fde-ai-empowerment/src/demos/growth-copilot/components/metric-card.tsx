"use client";

import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import type { Metric } from "@/lib/growth-copilot/types";
import { TrendChart } from "./trend-chart";

interface MetricCardProps {
  metric: Metric;
  isAnomaly?: boolean;
  onClick?: () => void;
}

export function MetricCard({ metric, isAnomaly, onClick }: MetricCardProps) {
  const up = metric.weekChangePercent >= 0;
  const goodTrend =
    metric.id === "retention" ||
    metric.id === "conversion" ||
    metric.id === "gmv" ||
    metric.id === "dau" ||
    metric.id === "new_users" ||
    metric.id === "aov"
      ? up
      : !up;

  const displayValue =
    metric.id === "gmv"
      ? metric.value
      : metric.id === "retention" || metric.id === "conversion"
        ? metric.value
        : metric.id === "aov"
          ? metric.value
          : metric.value >= 10000
            ? `${(metric.value / 10000).toFixed(1)}万`
            : metric.value.toLocaleString();

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border bg-white p-4 text-left shadow-sm transition-all hover:shadow-md ${
        isAnomaly
          ? "border-amber-300 ring-1 ring-amber-100"
          : "border-slate-200 hover:border-violet-300"
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-slate-500">{metric.name}</span>
        {isAnomaly && (
          <AlertTriangle className="h-4 w-4 text-amber-500" aria-label="异常" />
        )}
      </div>
      <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
        {displayValue}
        <span className="ml-0.5 text-sm font-normal text-slate-500">
          {metric.unit}
        </span>
      </p>
      <div
        className={`mt-1 flex items-center gap-1 text-xs font-medium ${
          goodTrend ? "text-emerald-600" : "text-red-600"
        }`}
      >
        {up ? (
          <TrendingUp className="h-3.5 w-3.5" />
        ) : (
          <TrendingDown className="h-3.5 w-3.5" />
        )}
        本周 {up ? "+" : ""}
        {metric.weekChangePercent.toFixed(1)}%
      </div>
      <div className="mt-3 h-[120px]">
        <TrendChart
          data={metric.trend}
          color={isAnomaly ? "#f59e0b" : "#6366f1"}
          unit={metric.unit}
        />
      </div>
    </button>
  );
}
