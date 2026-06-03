"use client";

import { useState } from "react";
import { useExpert } from "../expert-context";

const STATUS_LABEL = {
  pending: "待复核",
  in_review: "复核中",
  approved: "已通过",
  rejected: "已驳回",
};

export function ReviewView() {
  const { review, submitReview } = useExpert();
  const [comment, setComment] = useState("");

  if (!review) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        暂无待复核项。请先进行专业问答、风险识别或报告生成（中高风险将自动进入复核队列）。
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="rounded-lg border border-amber-700/40 bg-amber-950/20 p-4">
        <p className="text-xs font-medium uppercase text-amber-400">人机协同</p>
        <p className="mt-2 text-sm text-amber-100">
          AI 输出仅为初步建议，不构成最终审批结论。须由持证专家填写意见并确认。
        </p>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-5 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">复核单号</span>
          <span className="font-mono text-xs text-slate-500">{review.id}</span>
        </div>
        <div className="mt-3 flex justify-between">
          <span className="text-slate-400">状态</span>
          <span className="font-medium text-white">{STATUS_LABEL[review.status]}</span>
        </div>
        <div className="mt-4">
          <p className="text-xs text-slate-500">AI 初步建议</p>
          <p className="mt-1 text-slate-200">{review.aiSuggestion}</p>
        </div>

        {review.status === "pending" && (
          <>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="专家意见（必填）…"
              className="mt-4 w-full rounded-md border border-slate-600 bg-slate-950 p-2 text-sm text-white"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => submitReview(comment || "同意 AI 建议，补充现场尽调", true)}
                className="flex-1 rounded-md bg-emerald-700 py-2 text-sm text-white hover:bg-emerald-600"
              >
                专家通过
              </button>
              <button
                type="button"
                onClick={() => submitReview(comment || "风险过高，不予通过", false)}
                className="flex-1 rounded-md border border-red-700 py-2 text-sm text-red-300 hover:bg-red-950/50"
              >
                驳回
              </button>
            </div>
          </>
        )}

        {review.expertComment && (
          <div className="mt-4 border-t border-slate-700 pt-4">
            <p className="text-xs text-slate-500">专家意见</p>
            <p className="mt-1 text-slate-300">{review.expertComment}</p>
            {review.finalConclusion && (
              <p className="mt-2 font-medium text-emerald-300">{review.finalConclusion}</p>
            )}
            <p className="mt-2 text-xs text-slate-500">
              {review.reviewedBy} · {review.reviewedAt?.slice(0, 10)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
