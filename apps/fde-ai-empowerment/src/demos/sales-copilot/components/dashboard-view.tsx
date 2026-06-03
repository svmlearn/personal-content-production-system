"use client";

import { useState } from "react";
import { ArrowRight, Sparkles, Target } from "lucide-react";
import { OPPORTUNITIES } from "@/lib/sales-copilot/mock-data";
import { NL_EXAMPLES, STAGE_COLORS, STAGE_LABELS } from "@/lib/sales-copilot/constants";
import { useSales } from "../sales-context";
import { CustomerPicker } from "./customer-picker";

export function DashboardView() {
  const { nextActions, runNlCommand, nlMessage, setView, setSelectedCustomerId } =
    useSales();
  const [nlInput, setNlInput] = useState("");

  const followToday = OPPORTUNITIES.filter((o) => o.probability >= 30).slice(0, 3);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">销售工作台</h2>
          <p className="text-sm text-slate-500">今日重点客户与 AI 推荐行动</p>
        </div>
        <CustomerPicker compact />
      </div>

      <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
          <Sparkles className="h-4 w-4 text-blue-600" />
          AI 助手
        </label>
        <form
          className="mt-2 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            runNlCommand(nlInput);
            setNlInput("");
          }}
        >
          <input
            value={nlInput}
            onChange={(e) => setNlInput(e.target.value)}
            placeholder="输入指令，如：帮我分析这个客户…"
            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
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
              className="rounded-full border border-blue-200 bg-white px-2.5 py-1 text-[11px] text-blue-700 hover:bg-blue-50"
            >
              {q}
            </button>
          ))}
        </div>
        {nlMessage && (
          <p className="mt-2 text-xs text-blue-700">{nlMessage}</p>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">今日待跟进客户</h3>
          <ul className="mt-3 space-y-2">
            {followToday.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCustomerId(o.customerId);
                    setView("customer360");
                  }}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-100 p-3 text-left hover:border-blue-200 hover:bg-blue-50/30"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">{o.name}</p>
                    <p className="text-xs text-slate-500">
                      ¥{(o.amount / 10000).toFixed(0)} 万 · 赢率 {o.probability}%
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">重点商机</h3>
          <ul className="mt-3 space-y-2">
            {OPPORTUNITIES.map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
              >
                <span className="text-sm text-slate-800">{o.name}</span>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-medium ${STAGE_COLORS[o.stage]}`}
                >
                  {STAGE_LABELS[o.stage]}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Target className="h-4 w-4 text-blue-600" />
          AI 推荐行动
        </h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {nextActions.map((a) => (
            <li
              key={a.id}
              className="rounded-lg border border-slate-100 p-3 text-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-slate-800">{a.title}</span>
                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                    a.priority === "high"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {a.dueDate}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">{a.customerName}</p>
              <p className="mt-1 text-xs text-slate-600">{a.reason}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
