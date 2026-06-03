"use client";

import { ArrowRight, Shield } from "lucide-react";
import { INTENT_LABEL } from "@/lib/tob-workbench/types";
import { useWorkbench } from "../workbench-context";
import { PageHeader } from "./app-shell";

export function WorkbenchView() {
  const {
    scenarios,
    records,
    input,
    setInput,
    runTask,
    setView,
    history,
    auditLogs,
  } = useWorkbench();

  return (
    <>
      <PageHeader
        title="企业 AI 工作台"
        desc="嵌入 OA / CRM / ERP 流程：知识问答、文档、分析、Agent、风控 — 统一入口与审计"
      />
      <div className="space-y-6 p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "今日任务", value: history.length || 0 },
            { label: "待审批", value: history.filter((t) => t.status === "pending_approval").length },
            { label: "审计事件", value: auditLogs.length },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-bold text-indigo-600">{value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-white p-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runTask()}
            placeholder="描述你的业务问题，系统将识别意图并路由…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
          />
          <button
            type="button"
            onClick={() => runTask()}
            className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            运行 AI 任务
          </button>
        </div>

        <div>
          <p className="text-xs font-medium uppercase text-slate-500">AI 范式入口</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {scenarios.map((s) => (
              <button
                key={s.intent}
                type="button"
                onClick={() => {
                  setInput(s.example);
                  setView("task");
                }}
                className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-indigo-300"
              >
                <p className="font-semibold text-slate-900">{s.title}</p>
                <p className="mt-1 text-xs text-slate-500">{s.desc}</p>
                <p className="mt-2 text-xs text-indigo-600">{INTENT_LABEL[s.intent]}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium uppercase text-slate-500">业务对象</p>
          <ul className="mt-2 space-y-2">
            {records.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm"
              >
                <span>{r.title}</span>
                <span className="text-xs text-slate-500">{r.meta.status ?? r.type}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50 p-3 text-xs text-amber-900">
          <Shield className="mt-0.5 h-4 w-4 shrink-0" />
          数据在企业租户内处理，机密文档按角色过滤；高风险输出需人工审批后方可落库。
        </p>

        <button
          type="button"
          onClick={() => setView("task")}
          className="inline-flex items-center gap-1 text-sm text-indigo-600"
        >
          进入 AI 任务中心
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </>
  );
}
