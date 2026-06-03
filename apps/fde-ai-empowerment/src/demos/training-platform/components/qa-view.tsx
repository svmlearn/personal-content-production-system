"use client";

import { Send } from "lucide-react";
import { useTraining } from "../training-context";

const SUGGESTIONS = [
  "这个产品卖点怎么讲？",
  "客户说价格贵该怎么回应？",
  "新员工入职第一周要学什么？",
];

export function QaView() {
  const { qaInput, setQaInput, qaResult, askQuestion } = useTraining();

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <p className="text-sm text-slate-600">
        基于企业培训资料 Mock 检索回答，可接入真实知识库与 RAG。
      </p>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setQaInput(s)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 hover:border-violet-300"
          >
            {s}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={qaInput}
          onChange={(e) => setQaInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && askQuestion()}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500"
          placeholder="输入培训相关问题…"
        />
        <button
          type="button"
          onClick={() => askQuestion()}
          className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700"
        >
          <Send className="h-4 w-4" />
          提问
        </button>
      </div>
      {qaResult && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm">
          <p className="whitespace-pre-wrap text-slate-800">{qaResult.answer}</p>
          <p className="mt-3 text-xs text-slate-500">
            引用：{qaResult.citations.join(" · ")}
          </p>
          <p className="mt-1 text-xs text-violet-600">
            推荐课程：{qaResult.relatedCourses.join("、")}
          </p>
        </div>
      )}
    </div>
  );
}
