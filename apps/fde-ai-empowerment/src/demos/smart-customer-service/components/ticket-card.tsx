"use client";

import { Ticket } from "lucide-react";
import type { PendingTicketDraft } from "@/lib/customer-service/types";

interface TicketCardProps {
  draft: PendingTicketDraft;
  onConfirm: () => void;
  confirmed?: boolean;
}

const PRIORITY_LABEL = {
  low: "低",
  medium: "中",
  high: "高",
  urgent: "紧急",
};

export function TicketCard({ draft, onConfirm, confirmed }: TicketCardProps) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
        <Ticket className="h-4 w-4" />
        创建工单
      </div>
      <dl className="mt-3 space-y-2 text-xs text-amber-950/90">
        <div>
          <dt className="text-amber-700">问题分类</dt>
          <dd className="font-medium">{draft.category}</dd>
        </div>
        <div>
          <dt className="text-amber-700">优先级</dt>
          <dd className="font-medium">{PRIORITY_LABEL[draft.priority]}</dd>
        </div>
        <div>
          <dt className="text-amber-700">联系方式</dt>
          <dd>{draft.contact}</dd>
        </div>
        <div>
          <dt className="text-amber-700">AI 摘要</dt>
          <dd className="leading-relaxed">{draft.summary}</dd>
        </div>
      </dl>
      {!confirmed ? (
        <button
          type="button"
          onClick={onConfirm}
          className="mt-3 w-full rounded-lg bg-amber-600 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          确认创建工单
        </button>
      ) : (
        <p className="mt-3 text-center text-xs font-medium text-emerald-700">
          工单已提交
        </p>
      )}
    </div>
  );
}
