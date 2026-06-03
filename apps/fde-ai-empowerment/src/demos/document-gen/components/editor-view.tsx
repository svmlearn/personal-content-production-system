"use client";

import { useState } from "react";
import { Check, Copy, FileDown } from "lucide-react";
import { DOCUMENT_TEMPLATES } from "@/lib/document-gen/templates";
import { useDocument } from "../document-context";
import { SectionCard } from "./section-card";
import { SourceDrawer } from "./source-drawer";

const STATUS_LABEL: Record<string, string> = {
  draft: "草稿",
  pending_review: "待审核",
  in_review: "审核中",
  approved: "已通过",
  needs_revision: "需修改",
};

export function EditorView() {
  const {
    document,
    setView,
    copyFullText,
    exportDoc,
    exportToast,
    clearExportToast,
    submitApprovalFlow,
    simulateReview,
  } = useDocument();
  const [copied, setCopied] = useState(false);

  if (!document) return null;

  const tpl = DOCUMENT_TEMPLATES.find((t) => t.type === document.type);
  const needsApproval = tpl?.requiresApproval;

  async function handleCopy() {
    await navigator.clipboard.writeText(copyFullText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex min-h-[640px] flex-col lg:flex-row">
      <aside className="w-full shrink-0 border-b border-slate-200 bg-slate-50 p-4 lg:w-52 lg:border-b-0 lg:border-r">
        <button
          type="button"
          onClick={() => setView("picker")}
          className="text-xs text-slate-500"
        >
          ← 新建文档
        </button>
        <p className="mt-2 text-sm font-semibold text-slate-900">{tpl?.label}</p>
        <p className="mt-1 line-clamp-2 text-xs text-slate-500">{document.title}</p>
        {needsApproval && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs">
            <p className="font-medium text-amber-900">
              审批：{STATUS_LABEL[document.approvalStatus]}
            </p>
            {document.approvalStatus === "draft" && (
              <button
                type="button"
                onClick={submitApprovalFlow}
                className="mt-2 w-full rounded bg-slate-900 py-1.5 text-white"
              >
                提交审核
              </button>
            )}
            {document.approvalStatus === "pending_review" && (
              <div className="mt-2 flex gap-1">
                <button
                  type="button"
                  onClick={() => simulateReview(true)}
                  className="flex-1 rounded bg-emerald-600 py-1 text-white"
                >
                  通过
                </button>
                <button
                  type="button"
                  onClick={() => simulateReview(false)}
                  className="flex-1 rounded border py-1"
                >
                  退回
                </button>
              </div>
            )}
            <ul className="mt-2 space-y-1 text-[10px] text-amber-800">
              {document.approvalHistory.map((h) => (
                <li key={h.id}>
                  {h.actor}：{h.action}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex w-full items-center justify-center gap-1 rounded-lg border bg-white py-2 text-xs"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            复制全文
          </button>
          {(["word", "ppt", "pdf"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => exportDoc(f)}
              className="flex w-full items-center justify-center gap-1 rounded-lg border bg-white py-2 text-xs hover:bg-slate-50"
            >
              <FileDown className="h-3.5 w-3.5" />
              导出 {f.toUpperCase()}
            </button>
          ))}
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
        <h1 className="text-xl font-bold text-slate-900">{document.title}</h1>
        <div className="mt-6 space-y-4">
          {document.sections.map((s) => (
            <SectionCard key={s.id} section={s} />
          ))}
        </div>
      </main>

      <aside className="hidden w-56 shrink-0 border-l border-slate-200 bg-slate-50 p-4 xl:block">
        <h3 className="text-xs font-semibold uppercase text-slate-500">AI 辅助</h3>
        <p className="mt-2 text-xs text-slate-600">
          点击段落引用标签查看来源片段；使用扩写/润色优化各节内容。
        </p>
        <p className="mt-4 text-xs text-slate-500">
          共 {document.sections.length} 节 · 风格{" "}
          {document.form.style ?? document.style}
        </p>
      </aside>

      <SourceDrawer />

      {exportToast && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
          {exportToast}
          <button type="button" className="ml-3 underline" onClick={clearExportToast}>
            关闭
          </button>
        </div>
      )}
    </div>
  );
}
