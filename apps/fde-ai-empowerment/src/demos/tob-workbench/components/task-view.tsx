"use client";

import { classifyIntent } from "@/lib/tob-workbench/engine";
import { INTENT_LABEL, type TaskIntent } from "@/lib/tob-workbench/types";
import { useWorkbench } from "../workbench-context";
import { PageHeader } from "./app-shell";

const INTENTS: TaskIntent[] = [
  "knowledge_qa",
  "doc_gen",
  "data_analysis",
  "agent_task",
  "risk_review",
];

export function TaskView() {
  const { input, setInput, runTask } = useWorkbench();
  const detected = input ? classifyIntent(input) : null;

  return (
    <>
      <PageHeader
        title="AI 任务中心"
        desc="自然语言输入 → 意图识别 → RAG / 工具 / 风控 → 结构化结果"
      />
      <div className="space-y-4 p-4 sm:p-6">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={5}
          className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-indigo-500"
          placeholder="例如：分析本月 GMV 下降原因 / 生成客户拜访纪要 / 审核授信风险…"
        />
        {detected && (
          <p className="text-sm text-slate-600">
            识别意图：<span className="font-medium text-indigo-600">{INTENT_LABEL[detected]}</span>
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {INTENTS.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => runTask(i)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs hover:border-indigo-400"
            >
              {INTENT_LABEL[i]}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => runTask()}
          className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white sm:w-auto sm:px-8"
        >
          执行（自动识别意图）
        </button>
      </div>
    </>
  );
}
