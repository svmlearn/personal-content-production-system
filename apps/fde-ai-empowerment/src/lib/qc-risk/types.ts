/** 质检标准条目 */
export interface InspectionStandard {
  id: string;
  name: string;
  category: string;
  threshold: string;
}

/** 缺陷记录 */
export interface DefectRecord {
  id: string;
  productLine: string;
  defectType: string;
  severity: "critical" | "major" | "minor";
  batchNo?: string;
}

/** 抽检任务 */
export interface SamplingTask {
  id: string;
  title: string;
  sampleSize: number;
  frequency: string;
  owner: string;
}

/** 风控规则 */
export interface RiskRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  priority: "P0" | "P1" | "P2";
}

/** 异常案例（订单/交易） */
export interface AnomalyCase {
  id: string;
  bizType: string;
  amount?: number;
  signals: string[];
}

/** 合规报告 */
export interface ComplianceReport {
  title: string;
  period: string;
  summary: string;
  findings: string[];
  recommendations: string[];
}

/** 风险项 */
export interface RiskItem {
  id: string;
  description: string;
  level: "high" | "medium" | "low";
  mitigation: string;
}

export type QcMode =
  | "home"
  | "standard"
  | "defect"
  | "sampling"
  | "rule"
  | "anomaly"
  | "compliance";

export interface StandardInterpretation {
  summary: string;
  keyMetrics: string[];
  procedures: string[];
  acceptanceCriteria: string[];
  tools: string[];
  risks: RiskItem[];
}

export interface DefectAnalysis {
  summary: string;
  rootCauses: string[];
  impact: string;
  investigationSteps: string[];
  correctiveActions: string[];
  preventRecurrence: string[];
  escalate: boolean;
  escalateReason?: string;
}

export interface SamplingPlanResult {
  planName: string;
  sampleRate: string;
  tasks: SamplingTask[];
  checkpoints: string[];
  normalCases: string[];
  edgeCases: string[];
  regressionPoints: string[];
}

export interface RuleDiagnosis {
  features: string[];
  ruleSuggestions: RiskRule[];
  dataFields: string[];
  testPoints: string[];
  risks: RiskItem[];
  complexity: "S" | "M" | "L" | "XL";
}

export interface AnomalyReviewResult {
  summary: string;
  riskFindings: { category: string; message: string; severity: string; suggestion: string }[];
  performanceIssues: string[];
  securityIssues: string[];
  readabilityIssues: string[];
  level: "pass" | "review" | "block";
}
