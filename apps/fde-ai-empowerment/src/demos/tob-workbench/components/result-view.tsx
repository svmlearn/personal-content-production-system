"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Check,
  Download,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import { DOCUMENTS } from "@/lib/tob-workbench/mock-data";
import { INTENT_LABEL } from "@/lib/tob-workbench/types";
import { useWorkbench } from "../workbench-context";
import { PageHeader } from "./app-shell";

export function ResultView() {
  const {
    activeTask,
    activeAnswer,
    toolCalls,
    approval,
    can,
    updateAnswerContent,
    submitApproval,
    submitFeedback,
    exportResult,
    setView,
  } = useWorkbench();
  const [apvComment, setApvComment] = useState("");
  const [showCites, setShowCites] = useState(true);

  if (!activeTask || !activeAnswer) {
    return (
      <>
        <PageHeader title="结果详情" />
        <p className="p-8 text-center text-sm text-slate-500">暂无结果，请先执行任务</p>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="结果详情"
        desc={`${INTENT_LABEL[activeTask.intent]} · 置信度 ${(activeAnswer.confidence * 100).toFixed(0)}%`}
      />
      <div className="grid gap-4 p-4 lg:grid-cols-3 lg:p-6">
        <div className="space-y-4 lg:col-span-2">
          {activeAnswer.needsApproval && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              高风险 / Agent 待确认项：需主管审批后写入业务系统
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="font-semibold text-slate-900">{activeAnswer.summary}</p>
            {activeAnswer.sections.map((s) => (
              <div key={s.title} className="mt-4">
                <h4 className="text-sm font-medium text-slate-700">{s.title}</h4>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{s.body}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">可编辑输出</h4>
              <button
                type="button"
                onClick={exportResult}
                className="inline-flex items-center gap-1 text-xs text-indigo-600"
              >
                <Download className="h-3.5 w-3.5" />
                导出 Markdown
              </button>
            </div>
            <textarea
              value={activeAnswer.editableContent ?? ""}
              onChange={(e) => updateAnswerContent(e.target.value)}
              rows={8}
              className="mt-2 w-full rounded-lg border border-slate-200 p-2 font-mono text-xs"
            />
          </div>

          {toolCalls.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h4 className="text-sm font-medium">工具调用</h4>
              <ul className="mt-2 space-y-2">
                {toolCalls.map((t) => (
                  <li key={t.id} className="rounded-lg bg-slate-50 p-2 text-xs font-mono">
                    <span className="text-indigo-600">{t.tool}</span> → {t.output}
                    <span
                      className={`ml-2 ${
                        t.status === "pending" ? "text-amber-600" : "text-emerald-600"
                      }`}
                    >
                      {t.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => submitFeedback("up")}
              className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              有用
            </button>
            <button
              type="button"
              onClick={() => submitFeedback("down", "引用不完整")}
              className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
              需改进
            </button>
          </div>
        </div>

        <aside className="space-y-4">
          {showCites && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex justify-between">
                <h4 className="text-sm font-medium">引用溯源</h4>
                <button type="button" onClick={() => setShowCites(false)} className="text-slate-400">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ul className="mt-2 space-y-2">
                {activeAnswer.citations.map((c) => {
                  const doc = DOCUMENTS.find((d) => d.id === c.documentId);
                  return (
                    <li key={c.id} className="rounded-lg border border-slate-100 p-2 text-xs">
                      <p className="font-medium text-indigo-700">{doc?.title}</p>
                      <p className="mt-1 text-slate-600">{c.content}</p>
                      <p className="mt-1 text-slate-400">相关度 {(c.score * 100).toFixed(0)}%</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
            <h4 className="font-medium">推荐下一步</h4>
            <ul className="mt-2 list-disc pl-4 text-xs text-slate-600">
              {activeAnswer.recommendations.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>

          {approval && approval.status === "pending" && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
              <h4 className="text-sm font-medium text-amber-900">人工审批</h4>
              {!can("task", "approve") ? (
                <p className="mt-2 text-xs text-amber-800">
                  当前角色无审批权限，请切换「主管」或「管理员」
                </p>
              ) : (
                <>
                  <textarea
                    value={apvComment}
                    onChange={(e) => setApvComment(e.target.value)}
                    rows={2}
                    className="mt-2 w-full rounded border border-amber-200 p-2 text-xs"
                    placeholder="审批意见…"
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => submitApproval(true, apvComment)}
                      className="flex-1 inline-flex justify-center gap-1 rounded bg-emerald-600 py-1.5 text-xs text-white"
                    >
                      <Check className="h-3.5 w-3.5" />
                      通过
                    </button>
                    <button
                      type="button"
                      onClick={() => submitApproval(false, apvComment)}
                      className="flex-1 rounded border border-red-300 py-1.5 text-xs text-red-700"
                    >
                      驳回
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {approval && approval.status !== "pending" && (
            <p className="text-xs text-slate-600">
              审批{approval.status === "approved" ? "已通过" : "已驳回"} — {approval.comment}
            </p>
          )}

          <button
            type="button"
            onClick={() => setView("history")}
            className="w-full text-xs text-indigo-600 underline"
          >
            查看历史记录
          </button>
        </aside>
      </div>
    </>
  );
}
