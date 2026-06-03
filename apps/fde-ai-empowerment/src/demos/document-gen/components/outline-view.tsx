"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { getSourceById } from "@/lib/document-gen/sources";
import { useDocument } from "../document-context";

export function OutlineView() {
  const { document, moveOutline, generateBody, setView } = useDocument();
  if (!document?.outline.sections.length) return null;

  return (
    <div className="mx-auto max-w-2xl p-6">
      <button
        type="button"
        onClick={() => setView("form")}
        className="text-sm text-slate-500"
      >
        ← 修改输入
      </button>
      <h2 className="mt-2 text-lg font-semibold">AI 文档大纲</h2>
      <p className="text-sm text-slate-500">可调整章节顺序后生成正文</p>
      <ol className="mt-6 space-y-3">
        {document.outline.sections.map((s, i) => (
          <li
            key={s.id}
            className={`rounded-xl border bg-white p-4 ${s.level === 2 ? "ml-4 border-slate-100" : "border-slate-200"}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs text-violet-600">
                  {s.level === 1 ? "H1" : "H2"}
                </span>
                <h3 className="font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-1 text-xs text-slate-500">目标：{s.goal}</p>
                {s.suggestedSources.length > 0 && (
                  <p className="mt-2 text-[11px] text-slate-400">
                    推荐引用：
                    {s.suggestedSources
                      .map((id) => getSourceById(id)?.title ?? id)
                      .join("、")}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => moveOutline(i, -1)}
                  disabled={i === 0}
                  className="rounded p-1 hover:bg-slate-100 disabled:opacity-30"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveOutline(i, 1)}
                  disabled={i === document.outline.sections.length - 1}
                  className="rounded p-1 hover:bg-slate-100 disabled:opacity-30"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={generateBody}
        className="mt-8 w-full rounded-xl bg-violet-600 py-3 text-sm font-medium text-white"
      >
        生成正文
      </button>
    </div>
  );
}
