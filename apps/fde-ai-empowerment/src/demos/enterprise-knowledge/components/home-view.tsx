"use client";

import { EXAMPLE_QUESTIONS, CATEGORY_META } from "@/lib/knowledge/constants";
import type { KnowledgeCategory } from "@/lib/knowledge/types";
import { useKnowledge } from "../knowledge-context";
import { QuestionInput } from "./question-input";

const CATEGORIES = Object.keys(CATEGORY_META) as KnowledgeCategory[];

export function HomeView() {
  const { ask } = useKnowledge();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-sky-600">
          Enterprise Knowledge AI
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          企业 AI 知识助手
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          基于制度、SOP、产品文档与 FAQ 的可溯源问答
        </p>
      </div>

      <div className="mt-8">
        <QuestionInput large onSubmit={ask} />
      </div>

      <div className="mt-6">
        <p className="text-center text-xs text-slate-500">试试这些问题</p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {EXAMPLE_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => ask(q)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition-colors hover:border-sky-300 hover:text-sky-700"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-sm font-semibold text-slate-900">知识库分类</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            return (
              <li
                key={cat}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <span
                  className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${meta.color}`}
                >
                  {meta.label}
                </span>
                <p className="mt-2 text-xs text-slate-500">{meta.description}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
