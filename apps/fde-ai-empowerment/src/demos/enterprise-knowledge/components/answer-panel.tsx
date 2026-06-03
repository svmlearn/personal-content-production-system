"use client";

import type { ReactNode } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ListOrdered,
  ShieldAlert,
  ThumbsDown,
  ThumbsUp,
  UserRound,
} from "lucide-react";
import { CATEGORY_META } from "@/lib/knowledge/constants";
import type { AIAnswer } from "@/lib/knowledge/types";
import { useKnowledge } from "../knowledge-context";

interface AnswerPanelProps {
  answer: AIAnswer;
  question: string;
}

const CONFIDENCE_STYLE = {
  high: "bg-emerald-50 text-emerald-800 border-emerald-200",
  medium: "bg-amber-50 text-amber-800 border-amber-200",
  low: "bg-slate-100 text-slate-600 border-slate-200",
};

export function AnswerPanel({ answer, question }: AnswerPanelProps) {
  const { feedbackForAnswer, submitAnswerFeedback, openCitationDrawer } =
    useKnowledge();
  const feedback = feedbackForAnswer(answer.id);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 text-sm text-slate-600">
        <span className="font-medium text-slate-800">您的问题：</span>
        {question}
      </div>

      <div
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${CONFIDENCE_STYLE[answer.confidence]}`}
      >
        <ShieldAlert className="h-3.5 w-3.5" />
        {answer.confidenceLabel}
      </div>

      <section>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <CheckCircle2 className="h-4 w-4 text-sky-600" />
          简短结论
        </h3>
        <p className="mt-2 text-base leading-relaxed text-slate-800">
          {answer.summary}
        </p>
      </section>

      <section>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <BookOpen className="h-4 w-4 text-sky-600" />
          详细解释
        </h3>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
          {answer.explanation}
        </p>
      </section>

      {answer.steps.length > 0 && (
        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ListOrdered className="h-4 w-4 text-sky-600" />
            操作步骤
          </h3>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-slate-700">
            {answer.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      )}

      {answer.cautions.length > 0 && (
        <section className="rounded-lg border border-amber-200 bg-amber-50/60 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-900">
            <AlertTriangle className="h-4 w-4" />
            注意事项
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900/90">
            {answer.cautions.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>
      )}

      {answer.citations.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-slate-900">引用来源</h3>
          <ul className="mt-3 space-y-2">
            {answer.citations.map((c, i) => {
              const meta = CATEGORY_META[c.category];
              return (
                <li key={c.chunkId}>
                  <button
                    type="button"
                    onClick={() => openCitationDrawer(c.chunkId)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-3 text-left transition-colors hover:border-sky-300 hover:bg-sky-50/30"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-medium text-sky-600">
                        [{i + 1}]
                      </span>
                      <span
                        className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${meta.color}`}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {c.documentTitle}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {c.section} · {c.updatedAt}
                    </p>
                    <p className="mt-2 line-clamp-2 text-xs text-slate-600">
                      {c.excerpt}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
        <span className="text-xs text-slate-500">这条回答有帮助吗？</span>
        <FeedbackBtn
          active={feedback === "helpful"}
          label="有用"
          icon={<ThumbsUp className="h-3.5 w-3.5" />}
          onClick={() => submitAnswerFeedback(answer.id, "helpful")}
        />
        <FeedbackBtn
          active={feedback === "not_helpful"}
          label="无用"
          icon={<ThumbsDown className="h-3.5 w-3.5" />}
          onClick={() => submitAnswerFeedback(answer.id, "not_helpful")}
        />
        <FeedbackBtn
          active={feedback === "need_human"}
          label="需要人工补充"
          icon={<UserRound className="h-3.5 w-3.5" />}
          onClick={() => submitAnswerFeedback(answer.id, "need_human")}
        />
        {feedback && (
          <span className="text-xs text-emerald-600">已记录反馈</span>
        )}
      </div>
    </div>
  );
}

function FeedbackBtn({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-sky-600 bg-sky-50 text-sky-700"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
