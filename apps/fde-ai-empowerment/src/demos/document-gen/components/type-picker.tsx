"use client";

import { FileText } from "lucide-react";
import { DOCUMENT_TEMPLATES } from "@/lib/document-gen/templates";
import { useDocument } from "../document-context";

export function TypePicker() {
  const { selectType } = useDocument();

  return (
    <div className="p-6 sm:p-8">
      <h2 className="text-xl font-semibold text-slate-900">文档生成工作台</h2>
      <p className="mt-1 text-sm text-slate-500">
        选择文档类型，基于模板与知识库快速生成
      </p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DOCUMENT_TEMPLATES.map((t) => (
          <li key={t.type}>
            <button
              type="button"
              onClick={() => selectType(t.type)}
              className="flex h-full w-full flex-col rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:border-violet-300 hover:shadow-md"
            >
              <FileText className="h-5 w-5 text-violet-600" />
              <span className="mt-2 font-semibold text-slate-900">{t.label}</span>
              <span className="mt-1 flex-1 text-xs text-slate-500">
                {t.description}
              </span>
              {t.requiresApproval && (
                <span className="mt-2 inline-flex w-fit rounded bg-amber-50 px-2 py-0.5 text-[10px] text-amber-800">
                  需审批
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
