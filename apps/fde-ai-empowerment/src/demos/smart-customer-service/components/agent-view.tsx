"use client";

import { CheckCircle, Sparkles } from "lucide-react";
import { INTENT_COLORS, INTENT_LABELS } from "@/lib/customer-service/constants";
import { useService } from "../service-context";

const PRIORITY_STYLE = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-sky-100 text-sky-700",
  high: "bg-amber-100 text-amber-800",
  urgent: "bg-red-100 text-red-800",
};

const STATUS_LABEL = {
  open: "待处理",
  in_progress: "处理中",
  resolved: "已解决",
};

export function AgentView() {
  const { tickets, adoptReply, resolveTicket } = useService();
  const openTickets = tickets.filter((t) => t.status !== "resolved");

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">人工坐席工作台</h3>
        <p className="text-sm text-slate-500">
          待处理工单 {openTickets.length} 条 · 可采纳 AI 推荐回复
        </p>
      </div>

      <div className="space-y-4">
        {tickets.map((ticket) => (
          <article
            key={ticket.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-semibold text-slate-900">
                {ticket.id}
              </span>
              <span
                className={`rounded px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLE[ticket.priority]}`}
              >
                {ticket.priority}
              </span>
              <span
                className={`rounded px-2 py-0.5 text-xs font-medium ${INTENT_COLORS[ticket.intent]}`}
              >
                {INTENT_LABELS[ticket.intent]}
              </span>
              <span className="text-xs text-slate-500">
                {STATUS_LABEL[ticket.status]}
              </span>
            </div>

            <p className="mt-3 text-sm font-medium text-slate-800">
              用户问题：{ticket.userQuestion}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              <span className="font-medium text-slate-600">AI 摘要：</span>
              {ticket.aiSummary}
            </p>

            <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50/50 p-3">
              <p className="flex items-center gap-1 text-xs font-semibold text-indigo-800">
                <Sparkles className="h-3.5 w-3.5" />
                AI 推荐回复
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                {ticket.recommendedReply}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {ticket.status === "open" && (
                <button
                  type="button"
                  onClick={() => adoptReply(ticket.id)}
                  className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  采用 AI 推荐回复
                </button>
              )}
              {ticket.status !== "resolved" && (
                <button
                  type="button"
                  onClick={() => resolveTicket(ticket.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  标记已解决
                </button>
              )}
            </div>
          </article>
        ))}

        {tickets.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-500">
            暂无工单，请在客户咨询页创建工单后查看
          </p>
        )}
      </div>
    </div>
  );
}
