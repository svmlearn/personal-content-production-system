"use client";

import { X } from "lucide-react";
import { useDocument } from "../document-context";

const CAT_LABEL = {
  product: "产品资料",
  case: "历史案例",
  industry: "行业资料",
  template: "企业模板",
};

export function SourceDrawer() {
  const { activeSource, closeSource } = useDocument();
  if (!activeSource) return null;

  return (
    <>
      <button
        type="button"
        aria-label="关闭"
        className="fixed inset-0 z-40 bg-slate-900/20"
        onClick={closeSource}
      />
      <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-sm border-l bg-white p-4 shadow-xl">
        <div className="flex justify-between">
          <span className="rounded bg-violet-50 px-2 py-0.5 text-xs text-violet-700">
            {CAT_LABEL[activeSource.category]}
          </span>
          <button type="button" onClick={closeSource}>
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>
        <h3 className="mt-3 font-semibold text-slate-900">{activeSource.title}</h3>
        <p className="mt-1 text-xs text-slate-500">更新 {activeSource.updatedAt}</p>
        <p className="mt-4 text-sm leading-relaxed text-slate-700">
          {activeSource.excerpt}
        </p>
      </aside>
    </>
  );
}
