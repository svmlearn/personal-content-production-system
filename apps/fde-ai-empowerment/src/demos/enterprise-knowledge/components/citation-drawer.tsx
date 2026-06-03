"use client";

import { X } from "lucide-react";
import { CATEGORY_META } from "@/lib/knowledge/constants";
import { useKnowledge } from "../knowledge-context";

export function CitationDrawer() {
  const { citationChunk, closeCitationDrawer } = useKnowledge();

  if (!citationChunk) return null;

  const meta = CATEGORY_META[citationChunk.category];

  return (
    <>
      <button
        type="button"
        aria-label="关闭"
        className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px]"
        onClick={closeCitationDrawer}
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">引用原文</h3>
          <button
            type="button"
            onClick={closeCitationDrawer}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <span
            className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${meta.color}`}
          >
            {meta.label}
          </span>
          <h4 className="mt-3 text-base font-semibold leading-snug text-slate-900">
            {citationChunk.documentTitle}
          </h4>
          <p className="mt-1 text-xs text-slate-500">
            {citationChunk.section} · 更新于 {citationChunk.updatedAt}
          </p>
          <div className="mt-4 rounded-lg border border-sky-100 bg-sky-50/50 p-4">
            <p className="text-sm leading-relaxed text-slate-700">
              {citationChunk.content}
            </p>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            可访问范围：{citationChunk.department.join("、")}
          </p>
        </div>
      </aside>
    </>
  );
}
