export type OpportunityStage =
  | "lead"
  | "qualified"
  | "demo"
  | "proposal"
  | "negotiation"
  | "closed_won";

export type ActionPriority = "high" | "medium" | "low";

export type EmailTone = "formal" | "friendly" | "concise";

export interface Contact {
  id: string;
  name: string;
  title: string;
  role: "决策人" | "影响者" | "使用者" | "采购";
  email: string;
}

export interface Customer {
  id: string;
  name: string;
  industry: string;
  scale: string;
  region: string;
  currentSystems: string[];
  painTags: string[];
  stage: OpportunityStage;
  expectedAmount: number;
  contacts: Contact[];
  lastActivity: string;
}

export interface Opportunity {
  id: string;
  customerId: string;
  name: string;
  stage: OpportunityStage;
  amount: number;
  probability: number;
  owner: string;
  closeDate: string;
}

export interface ProductModule {
  id: string;
  name: string;
  description: string;
  tags: string[];
}

export interface CaseStudy {
  id: string;
  industry: string;
  title: string;
  outcome: string;
  modules: string[];
}

export interface CustomerInsight {
  possibleNeeds: string[];
  decisionRisks: string[];
  entryPoints: string[];
  competitorRisks: string[];
  nextSteps: string[];
}

export interface VisitBrief {
  background: string;
  industryTrends: string[];
  likelyPains: string[];
  recommendedModules: string[];
  questionList: string[];
  meetingGoals: string[];
  risks: string[];
}

export interface Proposal {
  background: string;
  pains: string[];
  architecture: string[];
  productMatch: { module: string; fit: string }[];
  implementation: string[];
  expectedBenefits: string[];
  caseStudies: string[];
  nextPlan: string[];
}

export interface MeetingNote {
  customerNeeds: string[];
  objections: string[];
  decisionMakers: string[];
  actionItems: { task: string; owner: string; due: string }[];
  followUpSuggestion: string;
}

export interface FollowUpEmail {
  subject: string;
  body: string;
  tone: EmailTone;
}

export interface NextAction {
  id: string;
  opportunityId: string;
  customerName: string;
  title: string;
  reason: string;
  priority: ActionPriority;
  dueDate: string;
}
