"use client";

import { Scale } from "lucide-react";
import { CATEGORY_LABEL } from "@/lib/industry-expert/engine";
import { SAMPLE_QUESTIONS } from "@/lib/industry-expert/mock-data";
import { INDUSTRY_LABEL } from "@/lib/industry-expert/types";
import { useExpert } from "../expert-context";

const CATEGORIES = Object.entries(CATEGORY_LABEL);

export function HomeView() {
  const { question, setQuestion, askExpert, setView } = useExpert();

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-5">
        <div className="flex items-start gap-3">
          <Scale className="mt-1 h-8 w-8 text-sky-400" />
          <div>
            <h2 className="text-lg font-semibold text-white">
              {INDUSTRY_LABEL}行业 AI 专家助手
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              结合法规标准、行业报告、历史案例、企业制度与专家经验，提供可引用、可复核的专业问答、风险识别与报告生成。重要结论须经专家复核。
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && askExpert()}
          placeholder="输入专业问题，如尽调重点、合同风险、政策适用范围…"
          className="w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-500"
        />
        <button
          type="button"
          onClick={() => askExpert()}
          className="mt-3 w-full rounded-md bg-sky-600 py-2.5 text-sm font-medium text-white hover:bg-sky-500 sm:w-auto sm:px-8"
        >
          专家问答
        </button>
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          典型问题
        </p>
        <ul className="mt-2 flex flex-col gap-2">
          {SAMPLE_QUESTIONS.map((q) => (
            <li key={q}>
              <button
                type="button"
                onClick={() => askExpert(q)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/30 px-3 py-2 text-left text-sm text-slate-300 hover:border-sky-600 hover:text-white"
              >
                {q}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          知识库分类
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {CATEGORIES.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setView("knowledge");
              }}
              className="rounded-md border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:border-sky-500"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
