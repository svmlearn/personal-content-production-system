export type MetricId =
  | "dau"
  | "new_users"
  | "retention"
  | "conversion"
  | "gmv"
  | "aov";

export type AnomalySeverity = "high" | "medium" | "low";

export type TrendDirection = "up" | "down" | "flat";

export interface MetricTrend {
  date: string;
  value: number;
}

export interface Metric {
  id: MetricId;
  name: string;
  unit: string;
  value: number;
  previousValue: number;
  weekChange: number;
  weekChangePercent: number;
  trend: MetricTrend[];
  target?: number;
}

export interface Segment {
  name: string;
  value: number;
  change: number;
  share: number;
}

export interface Anomaly {
  metricId: MetricId;
  severity: AnomalySeverity;
  description: string;
  possibleCauses: string[];
  impact: string;
  dimensions: string[];
  suggestedActions: string[];
}

export interface Campaign {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  goal: string;
  status: "completed" | "running" | "planned";
  metrics: { label: string; target: number; actual: number; unit: string }[];
}

export interface GrowthStrategy {
  goal: string;
  hypotheses: string[];
  initiatives: string[];
  metrics: string[];
  timeline: string[];
}

export interface CampaignPlan {
  goal: string;
  targetAudience: string;
  mechanism: string[];
  pushSchedule: string[];
  copyVariants: string[];
  risks: string[];
  estimatedMetrics: { label: string; value: string }[];
  checklist: string[];
}

export interface ReviewReport {
  campaignId: string;
  background: string;
  goalAchievement: string;
  coreData: { label: string; value: string }[];
  highlights: string[];
  issues: string[];
  rootCauses: string[];
  optimizations: string[];
}

export interface ActionRecommendation {
  id: string;
  metricId: MetricId;
  title: string;
  reason: string;
  priority: "high" | "medium" | "low";
}

export interface AnalysisResult {
  question: string;
  conclusion: string;
  chartData: { name: string; value: number }[];
  segments: Segment[];
  causes: string[];
  nextSteps: string[];
}
