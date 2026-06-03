"use client";

import { useState } from "react";
import { Bot, Play, X } from "lucide-react";
import { EXAMPLE_TASKS } from "@/lib/process-agent/engine";
import { CURRENT_USER } from "@/lib/process-agent/mock-data";
import { useProcess } from "../process-context";
import { Timeline } from "./timeline";
import { ConfirmationCard } from "./confirmation-card";
import { FormEditor } from "./form-editor";
import { AuditPanel } from "./audit-panel";

export function Workbench() {
  const {
    recentTasks,
    activeTask,
    isRunning,
    startTask,
    confirmAction,
    updateFormField,
    cancelTask,
  } = useProcess();
  const [input, setInput] = useState("");

  const awaiting =
    activeTask?.status === "awaiting_confirmation" && activeTask.confirmation;

  return (
    <div className="min-h-[640px] bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Bot className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-base font-semibold text-slate-900">
                流程自动化 Agent
              </h1>
              <p className="text-xs text-slate-500">
                {CURRENT_USER.name} · {CURRENT_USER.department}
              </p>
            </div>
          </div>
          {activeTask && (
            <button
              type="button"
              onClick={cancelTask}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
            >
              <X className="h-3.5 w-3.5" />
              结束任务
            </button>
          )}
        </div>
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            startTask(input);
            setInput("");
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isRunning && !awaiting}
            placeholder="用自然语言描述要完成的流程目标…"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
          />
          <button
            type="submit"
            disabled={isRunning && !awaiting}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            执行
          </button>
        </form>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {EXAMPLE_TASKS.slice(0, 4).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => startTask(t)}
              disabled={isRunning && !awaiting}
              className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600 hover:border-indigo-300 hover:text-indigo-700 disabled:opacity-50"
            >
              {t.length > 24 ? `${t.slice(0, 24)}…` : t}
            </button>
          ))}
        </div>
      </header>

      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_280px] xl:grid-cols-[240px_1fr_280px]">
        <aside className="order-2 xl:order-1">
          <h2 className="text-xs font-semibold uppercase text-slate-500">
            最近任务
          </h2>
          <ul className="mt-2 space-y-2">
            {recentTasks.map((t) => (
              <li
                key={t.id}
                className="rounded-lg border border-slate-200 bg-white p-3 text-xs"
              >
                <p className="line-clamp-2 font-medium text-slate-800">
                  {t.userInput}
                </p>
                <p className="mt-1 text-slate-400">
                  {t.status} · {new Date(t.createdAt).toLocaleDateString("zh-CN")}
                </p>
              </li>
            ))}
          </ul>
        </aside>

        <main className="order-1 min-w-0 space-y-4 xl:order-2">
          {!activeTask ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
              <Bot className="h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">
                输入任务目标，Agent 将自动拆解并执行
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 px-3 py-2 text-sm text-indigo-900">
                <span className="font-medium">当前任务：</span>
                {activeTask.userInput}
                <span className="ml-2 rounded bg-white/80 px-1.5 py-0.5 text-xs">
                  {activeTask.status}
                </span>
              </div>

              {awaiting && activeTask.confirmation && (
                <ConfirmationCard
                  confirmation={activeTask.confirmation}
                  onConfirm={() => confirmAction("confirmed")}
                  onModify={() => confirmAction("modified")}
                  onCancel={() => confirmAction("cancelled")}
                />
              )}

              {activeTask.form && (
                <FormEditor form={activeTask.form} onChange={updateFormField} />
              )}

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <h2 className="text-sm font-semibold text-slate-900">
                  执行时间线
                </h2>
                <div className="mt-4">
                  <Timeline steps={activeTask.steps} />
                </div>
              </div>

              {activeTask.approval && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                  审批单 {activeTask.approval.id} 已提交，等待{" "}
                  {activeTask.approval.approvers.join("、")}
                </div>
              )}
            </>
          )}
        </main>

        <aside className="order-3">
          {activeTask ? (
            <AuditPanel entries={activeTask.auditLog} />
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
              执行任务后显示审计日志
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
