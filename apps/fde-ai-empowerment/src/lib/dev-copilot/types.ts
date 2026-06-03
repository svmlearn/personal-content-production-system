export type DevMode =
  | "home"
  | "requirement"
  | "code"
  | "test"
  | "log"
  | "review"
  | "api";

export type ReviewLevel = "approve" | "comment" | "request_changes";

export type TaskComplexity = "S" | "M" | "L" | "XL";

export interface Requirement {
  id: string;
  title: string;
  rawPrd: string;
}

export interface DevelopmentTask {
  id: string;
  title: string;
  owner: "frontend" | "backend" | "qa" | "dba";
  complexity: TaskComplexity;
}

export interface RequirementAnalysis {
  features: string[];
  frontendTasks: DevelopmentTask[];
  backendTasks: DevelopmentTask[];
  dbChanges: string[];
  apiNeeds: { method: string; path: string; description: string }[];
  testPoints: string[];
  risks: RiskItem[];
  complexity: TaskComplexity;
}

export interface CodeSnippet {
  language: string;
  code: string;
}

export interface CodeExplanation {
  summary: string;
  coreLogic: string[];
  inputs: string[];
  outputs: string[];
  dependencies: string[];
  issues: string[];
  optimizations: string[];
}

export interface TestCase {
  id: string;
  category: string;
  title: string;
  steps: string;
  expected: string;
}

export interface LogEntry {
  raw: string;
}

export interface LogAnalysis {
  summary: string;
  causes: string[];
  impact: string;
  steps: string[];
  fixes: string[];
  escalate: boolean;
  escalateReason?: string;
}

export interface ReviewFinding {
  category: "risk" | "performance" | "security" | "readability";
  severity: "high" | "medium" | "low";
  message: string;
  suggestion: string;
}

export interface CodeReviewResult {
  findings: ReviewFinding[];
  level: ReviewLevel;
  summary: string;
}

export interface ApiDocument {
  title: string;
  method: string;
  path: string;
  description: string;
  requestBody: string;
  responseBody: string;
  errors: { code: number; message: string }[];
}

export interface RiskItem {
  id: string;
  description: string;
  mitigation: string;
}
