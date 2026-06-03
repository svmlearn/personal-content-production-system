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
  analyzeMetric,
  detectAnomalies,
  generateCampaignPlan,
  generateReviewReport,
  getAnomalyDetail,
  parseNaturalLanguage,
} from "@/lib/growth-copilot/engine";
import { CAMPAIGNS, METRICS } from "@/lib/growth-copilot/mock-data";
import type {
  AnalysisResult,
  Anomaly,
  CampaignPlan,
  MetricId,
  ReviewReport,
} from "@/lib/growth-copilot/types";

export type GrowthView =
  | "dashboard"
  | "anomaly"
  | "analysis"
  | "campaign"
  | "review";

interface GrowthContextValue {
  view: GrowthView;
  setView: (v: GrowthView) => void;
  metrics: typeof METRICS;
  anomalies: ReturnType<typeof detectAnomalies>;
  selectedMetricId: MetricId | null;
  setSelectedMetricId: (id: MetricId | null) => void;
  anomalyDetail: Anomaly | null;
  analysis: AnalysisResult | null;
  campaignPlan: CampaignPlan | null;
  campaignGoal: string;
  setCampaignGoal: (g: string) => void;
  reviewReport: ReviewReport | null;
  selectedCampaignId: string;
  setSelectedCampaignId: (id: string) => void;
  nlMessage: string | null;
  runNlCommand: (input: string) => void;
  runAnalysis: (question: string) => void;
  generateCampaign: () => void;
  generateReview: () => void;
  selectMetricForAnomaly: (id: MetricId) => void;
}

const GrowthContext = createContext<GrowthContextValue | null>(null);

export function GrowthProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<GrowthView>("dashboard");
  const [selectedMetricId, setSelectedMetricId] = useState<MetricId | null>(
    "retention",
  );
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [campaignPlan, setCampaignPlan] = useState<CampaignPlan | null>(null);
  const [campaignGoal, setCampaignGoal] = useState(
    "提升沉默用户 7 日回访率",
  );
  const [reviewReport, setReviewReport] = useState<ReviewReport | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState(
    CAMPAIGNS[0].id,
  );
  const [nlMessage, setNlMessage] = useState<string | null>(null);

  const anomalies = useMemo(() => detectAnomalies(METRICS), []);
  const anomalyDetail = useMemo(
    () => (selectedMetricId ? getAnomalyDetail(selectedMetricId) : null),
    [selectedMetricId],
  );

  const runAnalysis = useCallback((question: string) => {
    setAnalysis(analyzeMetric(question, METRICS));
    setView("analysis");
  }, []);

  const generateCampaign = useCallback(() => {
    setCampaignPlan(generateCampaignPlan(campaignGoal));
    setView("campaign");
  }, [campaignGoal]);

  const generateReview = useCallback(() => {
    const camp = CAMPAIGNS.find((c) => c.id === selectedCampaignId);
    if (camp) {
      setReviewReport(generateReviewReport(camp));
      setView("review");
    }
  }, [selectedCampaignId]);

  const selectMetricForAnomaly = useCallback((id: MetricId) => {
    setSelectedMetricId(id);
    setView("anomaly");
  }, []);

  const runNlCommand = useCallback(
    (input: string) => {
      const { route, message } = parseNaturalLanguage(input);
      setNlMessage(message);
      if (route === "review") {
        generateReview();
      } else if (route === "campaign") {
        const goal =
          input.includes("召回") || input.includes("沉默")
            ? "提升沉默用户 7 日回访率"
            : campaignGoal;
        setCampaignGoal(goal);
        setCampaignPlan(generateCampaignPlan(goal));
        setView("campaign");
      } else {
        runAnalysis(input);
      }
    },
    [campaignGoal, generateReview, runAnalysis],
  );

  const value = useMemo(
    () => ({
      view,
      setView,
      metrics: METRICS,
      anomalies,
      selectedMetricId,
      setSelectedMetricId,
      anomalyDetail,
      analysis,
      campaignPlan,
      campaignGoal,
      setCampaignGoal,
      reviewReport,
      selectedCampaignId,
      setSelectedCampaignId,
      nlMessage,
      runNlCommand,
      runAnalysis,
      generateCampaign,
      generateReview,
      selectMetricForAnomaly,
    }),
    [
      view,
      anomalies,
      selectedMetricId,
      anomalyDetail,
      analysis,
      campaignPlan,
      campaignGoal,
      reviewReport,
      selectedCampaignId,
      nlMessage,
      runNlCommand,
      runAnalysis,
      generateCampaign,
      generateReview,
      selectMetricForAnomaly,
    ],
  );

  return (
    <GrowthContext.Provider value={value}>{children}</GrowthContext.Provider>
  );
}

export function useGrowth() {
  const ctx = useContext(GrowthContext);
  if (!ctx) throw new Error("useGrowth must be used within GrowthProvider");
  return ctx;
}
