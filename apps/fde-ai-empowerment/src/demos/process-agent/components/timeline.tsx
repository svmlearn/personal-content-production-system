"use client";

import {
  CheckCircle2,
  Circle,
  Loader2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import type { TaskStep } from "@/lib/process-agent/types";

const STATUS_ICON = {
  pending: Circle,
  running: Loader2,
  needs_confirmation: AlertCircle,
  completed: CheckCircle2,
  failed: XCircle,
};

const STATUS_STYLE = {
  pending: "text-slate-300",
  running: "text-indigo-500 animate-spin",
  needs_confirmation: "text-amber-500",
  completed: "text-emerald-500",
  failed: "text-red-500",
};

export function Timeline({ steps }: { steps: TaskStep[] }) {
  return (
    <ol className="relative space-y-0 border-l-2 border-slate-200 pl-6">
      {steps.map((step, i) => {
        const Icon = STATUS_ICON[step.status];
        return (
          <li key={step.id} className="relative pb-8 last:pb-0">
            <span
              className={`absolute -left-[1.65rem] flex h-6 w-6 items-center justify-center rounded-full bg-white ${STATUS_STYLE[step.status]}`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="rounded-lg border border-slate-100 bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-slate-900">
                  {i + 1}. {step.name}
                </h4>
                <span className="text-[10px] uppercase tracking-wide text-slate-400">
                  {step.status}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">{step.description}</p>
              {step.input && (
                <p className="mt-2 text-xs text-slate-600">
                  <span className="font-medium">输入：</span>
                  {step.input.slice(0, 120)}
                </p>
              )}
              {step.output && step.status !== "pending" && (
                <p className="mt-1 text-xs text-slate-700">
                  <span className="font-medium">输出：</span>
                  {step.output}
                </p>
              )}
              {step.toolCalls.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {step.toolCalls.map((tc) => (
                    <li
                      key={tc.id}
                      className="rounded-md border border-slate-100 bg-slate-50 p-2 text-[11px]"
                    >
                      <div className="flex justify-between font-mono text-indigo-700">
                        <span>{tc.toolName}</span>
                        <span className="text-slate-400">{tc.durationMs}ms</span>
                      </div>
                      <p className="mt-1 text-slate-500">
                        入参：{JSON.stringify(tc.input).slice(0, 80)}…
                      </p>
                      <p className="mt-0.5 text-slate-600">
                        返回：{JSON.stringify(tc.output).slice(0, 100)}…
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
