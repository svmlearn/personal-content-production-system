"use client";

import { AlertTriangle } from "lucide-react";
import type { Confirmation } from "@/lib/process-agent/types";

interface ConfirmationCardProps {
  confirmation: Confirmation;
  onConfirm: () => void;
  onModify: () => void;
  onCancel: () => void;
  disabled?: boolean;
}

export function ConfirmationCard({
  confirmation,
  onConfirm,
  onModify,
  onCancel,
  disabled,
}: ConfirmationCardProps) {
  return (
    <div className="rounded-xl border-2 border-amber-300 bg-amber-50/80 p-5 shadow-sm">
      <div className="flex items-center gap-2 text-amber-900">
        <AlertTriangle className="h-5 w-5" />
        <h3 className="font-semibold">需要您的确认</h3>
      </div>
      <p className="mt-2 text-sm font-medium text-slate-900">
        {confirmation.action}
      </p>
      <p className="mt-1 text-sm text-slate-600">{confirmation.impact}</p>
      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        {Object.entries(confirmation.keyInfo).map(([k, v]) => (
          <div key={k} className="rounded-lg bg-white/80 px-3 py-2">
            <dt className="text-xs text-slate-500">{k}</dt>
            <dd className="font-medium text-slate-800">{v}</dd>
          </div>
        ))}
      </dl>
      <ul className="mt-3 space-y-1 text-xs text-amber-900/90">
        {confirmation.risks.map((r) => (
          <li key={r}>· {r}</li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={onConfirm}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          确认执行
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onModify}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
        >
          修改后确认
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-white/50 disabled:opacity-50"
        >
          取消
        </button>
      </div>
    </div>
  );
}
