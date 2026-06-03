"use client";

import { SAMPLE_RISK_INPUT } from "@/lib/industry-expert/mock-data";
import { useExpert } from "../expert-context";
import { RiskBadge } from "./risk-badge";

export function RiskView() {
  const { riskInput, setRiskInput, risks, analyzeRisks, setView } = useExpert();

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <p className="text-sm text-slate-400">
        粘贴授信申请、合同条款、尽调片段或业务描述，自动识别风险点。
      </p>
      <button
        type="button"
        onClick={() => setRiskInput(SAMPLE_RISK_INPUT)}
        className="text-xs text-sky-400 underline"
      >
        填入示例
      </button>
      <textarea
        value={riskInput}
        onChange={(e) => setRiskInput(e.target.value)}
        rows={10}
        className="w-full rounded-md border border-slate-600 bg-slate-950 p-3 font-mono text-xs text-slate-200"
      />
      <button
        type="button"
        onClick={() => {
          analyzeRisks();
        }}
        className="w-full rounded-md bg-sky-600 py-2.5 text-sm font-medium text-white"
      >
        识别风险
      </button>

      {risks.length > 0 && (
        <ul className="space-y-3">
          {risks.map((r) => (
            <li
              key={r.id}
              className="rounded-lg border border-slate-700 bg-slate-800/40 p-4 text-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-medium text-white">{r.title}</h3>
                <RiskBadge level={r.level} />
              </div>
              <p className="mt-2 text-slate-400">{r.description}</p>
              <p className="mt-2 text-xs text-slate-500">
                <span className="text-slate-400">依据：</span>
                {r.basis}
              </p>
              <p className="mt-1 text-xs text-sky-300/90">
                <span className="text-slate-400">建议：</span>
                {r.recommendation}
              </p>
            </li>
          ))}
        </ul>
      )}

      {risks.some((r) => r.level === "high" || r.level === "critical") && (
        <button
          type="button"
          onClick={() => setView("review")}
          className="text-sm text-amber-400 underline"
        >
          前往专家复核 →
        </button>
      )}
    </div>
  );
}
