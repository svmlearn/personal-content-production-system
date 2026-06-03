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
  generateGrowthStrategy,
  generateReviewReport,
  generateSQL,
  getAnomalyDetail,
  parseNaturalLanguage,
} from "@/lib/bi-copilot/engine";
import { CAMPAIGNS, METRICS } from "@/lib/growth-copilot/mock-data";
import type {
  AnalysisResult,
  Anomaly,
  CampaignPlan,
  GrowthStrategy,
  MetricId,
  ReviewReport,
} from "@/lib/growth-copilot/types";
import type { SqlPreview } from "@/lib/bi-copilot/types";

export type BiView =
  | "dashboard"
  | "catalog"
  | "anomaly"
  | "analysis"
  | "sql"
  | "campaign"
  | "review";

interface BiContextValue {
  view: BiView;
  setView: (v: BiView) => void;
  metrics: typeof METRICS;
  anomalies: ReturnType<typeof detectAnomalies>;
  selectedMetricId: MetricId | null;
  setSelectedMetricId: (id: MetricId | null) => void;
  anomalyDetail: Anomaly | null;
  analysis: AnalysisResult | null;
  sqlPreview: SqlPreview | null;
  growthStrategy: GrowthStrategy | null;
  campaignPlan: CampaignPlan | null;
  campaignGoal: string;
  setCampaignGoal: (g: string) => void;
  reviewReport: ReviewReport | null;
  selectedCampaignId: string;
  setSelectedCampaignId: (id: string) => void;
  nlMessage: string | null;
  runNlCommand: (input: string) => void;
  runAnalysis: (q: string) => void;
  runSql: (q: string) => void;
  generateCampaign: () => void;
  generateReview: () => void;
  selectMetricForAnomaly: (id: MetricId) => void;
}

const BiContext = createContext<BiContextValue | null>(null);

export function BiProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<BiView>("dashboard");
  const [selectedMetricId, setSelectedMetricId] = useState<MetricId | null>(
    "retention",
  );
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [sqlPreview, setSqlPreview] = useState<SqlPreview | null>(null);
  const [growthStrategy, setGrowthStrategy] = useState<GrowthStrategy | null>(
    null,
  );
  const [campaignPlan, setCampaignPlan] = useState<CampaignPlan | null>(null);
  const [campaignGoal, setCampaignGoal] = useState("提升沉默用户 7 日回访率");
  const [reviewReport, setReviewReport] = useState<ReviewReport | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState(CAMPAIGNS[0].id);
  const [nlMessage, setNlMessage] = useState<string | null>(null);

  const anomalies = useMemo(() => detectAnomalies(METRICS), []);
  const anomalyDetail = useMemo(
    () => (selectedMetricId ? getAnomalyDetail(selectedMetricId) : null),
    [selectedMetricId],
  );

  const runAnalysis = useCallback((question: string) => {
    setAnalysis(analyzeMetric(question, METRICS));
    setSqlPreview(generateSQL(question));
    setView("analysis");
  }, []);

  const runSql = useCallback((question: string) => {
    setSqlPreview(generateSQL(question));
    setView("sql");
  }, []);

  const generateCampaign = useCallback(() => {
    setGrowthStrategy(generateGrowthStrategy(campaignGoal));
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
      if (route === "review") generateReview();
      else if (route === "campaign") {
        const goal =
          input.includes("召回") || input.includes("沉默")
            ? "提升沉默用户 7 日回访率"
            : campaignGoal;
        setCampaignGoal(goal);
        setGrowthStrategy(generateGrowthStrategy(goal));
        setCampaignPlan(generateCampaignPlan(goal));
        setView("campaign");
      } else runAnalysis(input);
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
      sqlPreview,
      growthStrategy,
      campaignPlan,
      campaignGoal,
      setCampaignGoal,
      reviewReport,
      selectedCampaignId,
      setSelectedCampaignId,
      nlMessage,
      runNlCommand,
      runAnalysis,
      runSql,
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
      sqlPreview,
      growthStrategy,
      campaignPlan,
      campaignGoal,
      reviewReport,
      selectedCampaignId,
      nlMessage,
      runNlCommand,
      runAnalysis,
      runSql,
      generateCampaign,
      generateReview,
      selectMetricForAnomaly,
    ],
  );

  return <BiContext.Provider value={value}>{children}</BiContext.Provider>;
}

export function useBi() {
  const ctx = useContext(BiContext);
  if (!ctx) throw new Error("useBi must be used within BiProvider");
  return ctx;
}
