"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  analyzeDefect,
  diagnoseRiskRule,
  generateComplianceReport,
  generateSamplingPlan,
  interpretStandard,
  reviewAnomaly,
  routeNaturalLanguage,
} from "@/lib/qc-risk/engine";
import type {
  AnomalyReviewResult,
  ComplianceReport,
  DefectAnalysis,
  QcMode,
  RuleDiagnosis,
  SamplingPlanResult,
  StandardInterpretation,
} from "@/lib/qc-risk/types";

interface QcContextValue {
  mode: QcMode;
  setMode: (m: QcMode) => void;
  input: string;
  setInput: (s: string) => void;
  run: () => void;
  analyze: () => void;
  standardResult: StandardInterpretation | null;
  defectResult: DefectAnalysis | null;
  samplingResult: SamplingPlanResult | null;
  ruleResult: RuleDiagnosis | null;
  anomalyResult: AnomalyReviewResult | null;
  complianceResult: ComplianceReport | null;
}

const QcContext = createContext<QcContextValue | null>(null);

export function QcProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<QcMode>("home");
  const [input, setInput] = useState("");
  const [standardResult, setStandardResult] =
    useState<StandardInterpretation | null>(null);
  const [defectResult, setDefectResult] = useState<DefectAnalysis | null>(null);
  const [samplingResult, setSamplingResult] =
    useState<SamplingPlanResult | null>(null);
  const [ruleResult, setRuleResult] = useState<RuleDiagnosis | null>(null);
  const [anomalyResult, setAnomalyResult] =
    useState<AnomalyReviewResult | null>(null);
  const [complianceResult, setComplianceResult] =
    useState<ComplianceReport | null>(null);

  const runForMode = useCallback((m: QcMode, text: string) => {
    switch (m) {
      case "standard":
        setStandardResult(interpretStandard(text));
        break;
      case "defect":
        setDefectResult(analyzeDefect(text));
        break;
      case "sampling":
        setSamplingResult(generateSamplingPlan(text));
        break;
      case "rule":
        setRuleResult(diagnoseRiskRule(text));
        break;
      case "anomaly":
        setAnomalyResult(reviewAnomaly(text));
        break;
      case "compliance":
        setComplianceResult(generateComplianceReport(text));
        break;
      default:
        break;
    }
  }, []);

  const analyze = useCallback(() => {
    if (mode === "home") return;
    runForMode(mode, input);
  }, [mode, input, runForMode]);

  const run = useCallback(() => {
    const target = routeNaturalLanguage(input);
    setMode(target);
    runForMode(target, input);
  }, [input, runForMode]);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      input,
      setInput,
      run,
      analyze,
      standardResult,
      defectResult,
      samplingResult,
      ruleResult,
      anomalyResult,
      complianceResult,
    }),
    [
      mode,
      input,
      run,
      analyze,
      standardResult,
      defectResult,
      samplingResult,
      ruleResult,
      anomalyResult,
      complianceResult,
    ],
  );

  return <QcContext.Provider value={value}>{children}</QcContext.Provider>;
}

export function useQc() {
  const ctx = useContext(QcContext);
  if (!ctx) throw new Error("useQc within QcProvider");
  return ctx;
}
