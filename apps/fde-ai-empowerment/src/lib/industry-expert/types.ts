export const INDUSTRY_LABEL = "金融" as const;

export type KnowledgeCategory =
  | "regulation"
  | "report"
  | "case"
  | "policy"
  | "expert";

export interface IndustryKnowledge {
  id: string;
  title: string;
  category: KnowledgeCategory;
  summary: string;
  effectiveDate?: string;
  tags: string[];
}

export interface Regulation extends IndustryKnowledge {
  category: "regulation";
  issuer: string;
  article?: string;
}

export interface CaseStudy extends IndustryKnowledge {
  category: "case";
  outcome: string;
  year: number;
}

export interface ExpertQuestion {
  id: string;
  text: string;
  askedAt: string;
}

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface RiskItem {
  id: string;
  title: string;
  level: RiskLevel;
  description: string;
  basis: string;
  recommendation: string;
}

export interface ExpertAnswer {
  conclusion: string;
  analysis: string[];
  basis: string[];
  riskLevel: RiskLevel;
  references: { id: string; title: string; excerpt: string }[];
  actions: string[];
  disclaimer: string;
  needsReview: boolean;
}

export type ReportType =
  | "contract"
  | "due_diligence"
  | "equipment"
  | "policy"
  | "supply_chain";

export interface ProfessionalReport {
  id: string;
  type: ReportType;
  title: string;
  background: string;
  findings: string[];
  risks: RiskItem[];
  basis: string[];
  recommendations: string[];
  nextActions: string[];
  generatedAt: string;
  reviewStatus: ExpertReview["status"];
}

export interface ExpertReview {
  id: string;
  status: "pending" | "in_review" | "approved" | "rejected";
  aiSuggestion: string;
  expertComment?: string;
  finalConclusion?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export type ExpertView =
  | "home"
  | "qa"
  | "knowledge"
  | "risk"
  | "report"
  | "review";
