"use client";

import { AlertCircle } from "lucide-react";
import { useExpert } from "../expert-context";
import { RiskBadge } from "./risk-badge";

export function QaView() {
  const { question, setQuestion, answer, askExpert } = useExpert();

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="flex-1 rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white"
          placeholder="专业问题…"
        />
        <button
          type="button"
          onClick={() => askExpert()}
          className="rounded-md bg-sky-600 px-4 py-2 text-sm text-white"
        >
          分析
        </button>
      </div>

      {!answer && (
        <p className="py-8 text-center text-sm text-slate-500">从首页提问或输入问题后分析</p>
      )}

      {answer && (
        <article className="space-y-4 rounded-lg border border-slate-700 bg-slate-800/40 p-5 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold text-white">结论</h3>
            <RiskBadge level={answer.riskLevel} />
          </div>
          <p className="text-sky-100">{answer.conclusion}</p>

          <Section title="专业分析" items={answer.analysis} />
          <Section title="判断依据" items={answer.basis} />

          <div>
            <h4 className="font-medium text-slate-300">引用资料</h4>
            <ul className="mt-2 space-y-2">
              {answer.references.map((r) => (
                <li
                  key={r.id}
                  className="rounded border border-slate-600 bg-slate-900/50 p-2 text-xs"
                >
                  <span className="font-mono text-sky-400">[{r.id}]</span> {r.title}
                  <p className="mt-1 text-slate-500">{r.excerpt}</p>
                </li>
              ))}
            </ul>
          </div>

          <Section title="建议动作" items={answer.actions} />

          {answer.needsReview && (
            <p className="flex items-center gap-2 rounded border border-amber-700/50 bg-amber-950/30 p-3 text-xs text-amber-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              该回答风险等级需专家复核后方可用于业务决策
            </p>
          )}

          <p className="border-t border-slate-700 pt-3 text-xs text-slate-500">
            {answer.disclaimer}
          </p>
        </article>
      )}
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="font-medium text-slate-300">{title}</h4>
      <ul className="mt-1 list-disc pl-4 text-slate-400">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}
