"use client";

import { useState } from "react";
import { Check, Copy, RefreshCw } from "lucide-react";
import type { EmailTone } from "@/lib/sales-copilot/types";
import { useSales } from "../sales-context";

const TONES: { id: EmailTone; label: string }[] = [
  { id: "formal", label: "正式" },
  { id: "friendly", label: "亲和" },
  { id: "concise", label: "简洁" },
];

export function EmailView() {
  const {
    followUpEmail,
    generateEmail,
    regenerateEmail,
    emailTone,
    setEmailToneAndRegenerate,
    meetingNote,
    parseMeeting,
  } = useSales();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!followUpEmail) return;
    await navigator.clipboard.writeText(
      `主题：${followUpEmail.subject}\n\n${followUpEmail.body}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!meetingNote) {
    return (
      <div className="flex flex-col items-center gap-3 p-12">
        <p className="text-sm text-slate-500">请先在会议纪要页解析会议文本</p>
        <button
          type="button"
          onClick={parseMeeting}
          className="text-sm text-blue-600 hover:underline"
        >
          去解析纪要
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900">跟进邮件</h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 p-0.5">
            {TONES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setEmailToneAndRegenerate(t.id)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                  emailTone === t.id
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={regenerateEmail}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            重新生成
          </button>
          {!followUpEmail && (
            <button
              type="button"
              onClick={generateEmail}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white"
            >
              生成邮件
            </button>
          )}
        </div>
      </div>

      {followUpEmail ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-medium text-slate-800">
              主题：{followUpEmail.subject}
            </p>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  一键复制
                </>
              )}
            </button>
          </div>
          <pre className="whitespace-pre-wrap p-4 text-sm leading-relaxed text-slate-700">
            {followUpEmail.body}
          </pre>
        </div>
      ) : (
        <p className="mt-8 text-center text-sm text-slate-500">
          选择语气后点击「生成邮件」
        </p>
      )}
    </div>
  );
}
