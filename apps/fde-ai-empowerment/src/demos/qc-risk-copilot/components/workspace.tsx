"use client";

import { ArrowLeft, Play } from "lucide-react";
import { useQc } from "../qc-context";
import { StandardResult } from "./results/standard-result";
import { DefectResult } from "./results/defect-result";
import { SamplingResult } from "./results/sampling-result";
import { RuleResult } from "./results/rule-result";
import { AnomalyResult } from "./results/anomaly-result";
import { ComplianceResult } from "./results/compliance-result";

const MODE_LABEL: Record<string, string> = {
  standard: "质检标准解读",
  defect: "缺陷根因分析",
  sampling: "抽检方案生成",
  rule: "风控规则诊断",
  anomaly: "异常单审核",
  compliance: "合规报告生成",
};

export function Workspace() {
  const {
    mode,
    setMode,
    input,
    setInput,
    analyze,
    standardResult,
    defectResult,
    samplingResult,
    ruleResult,
    anomalyResult,
    complianceResult,
  } = useQc();

  if (mode === "home") return null;

  const hasResult =
    standardResult ||
    defectResult ||
    samplingResult ||
    ruleResult ||
    anomalyResult ||
    complianceResult;

  return (
    <div className="flex min-h-[560px] flex-col lg:flex-row">
      <aside className="w-full shrink-0 border-b border-slate-200 bg-slate-50 p-3 lg:w-48 lg:border-b-0 lg:border-r">
        <button
          type="button"
          onClick={() => setMode("home")}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          工作台
        </button>
        <p className="mt-2 text-sm font-semibold text-amber-800">{MODE_LABEL[mode]}</p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:flex-row">
        <div className="border-b border-slate-200 p-4 lg:w-1/2 lg:border-b-0 lg:border-r">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={14}
            className="w-full resize-y rounded-lg border border-slate-200 bg-white p-3 font-mono text-xs leading-relaxed outline-none focus:border-amber-500"
            placeholder="粘贴质检标准、缺陷记录、业务场景或异常订单…"
          />
          <button
            type="button"
            onClick={analyze}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 py-2.5 text-sm font-medium text-white hover:bg-amber-700"
          >
            <Play className="h-4 w-4" />
            分析
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {mode === "standard" && standardResult && (
            <StandardResult data={standardResult} />
          )}
          {mode === "defect" && defectResult && <DefectResult data={defectResult} />}
          {mode === "sampling" && samplingResult && (
            <SamplingResult data={samplingResult} />
          )}
          {mode === "rule" && ruleResult && <RuleResult data={ruleResult} />}
          {mode === "anomaly" && anomalyResult && (
            <AnomalyResult data={anomalyResult} />
          )}
          {mode === "compliance" && complianceResult && (
            <ComplianceResult data={complianceResult} />
          )}
          {!hasResult && (
            <p className="py-12 text-center text-sm text-slate-400">
              输入内容后点击「分析」
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
