"use client";

import { INTENT_LABEL } from "@/lib/tob-workbench/types";
import { useWorkbench } from "../workbench-context";
import { PageHeader } from "./app-shell";

export function HistoryView() {
  const { history, openResult } = useWorkbench();

  return (
    <>
      <PageHeader title="历史记录" desc="任务留痕，支持回溯结果与审计关联" />
      <div className="p-4 sm:p-6">
        {history.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500">暂无历史任务</p>
        ) : (
          <ul className="space-y-2">
            {history.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => openResult(t.id)}
                  className="flex w-full flex-col rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-indigo-300 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-slate-900">{t.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {INTENT_LABEL[t.intent]} · {t.createdBy} ·{" "}
                      {t.createdAt.slice(0, 16).replace("T", " ")}
                    </p>
                  </div>
                  <span
                    className={`mt-2 inline-flex w-fit rounded-full px-2 py-0.5 text-xs sm:mt-0 ${
                      t.status === "completed"
                        ? "bg-emerald-100 text-emerald-800"
                        : t.status === "pending_approval"
                          ? "bg-amber-100 text-amber-800"
                          : t.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {t.status}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
