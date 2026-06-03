export type TaskGoalType =
  | "reimbursement"
  | "procurement"
  | "hr_onboarding"
  | "it_ticket"
  | "generic";

export type StepStatus =
  | "pending"
  | "running"
  | "needs_confirmation"
  | "completed"
  | "failed";

export type TaskStatus = "idle" | "running" | "awaiting_confirmation" | "completed" | "failed";

export type ToolName =
  | "policySearchTool"
  | "reimbursementTool"
  | "procurementTool"
  | "hrOnboardingTool"
  | "itTicketTool"
  | "approvalTool"
  | "notificationTool";

export interface User {
  id: string;
  name: string;
  department: string;
  role: string;
}

export interface ParsedGoal {
  type: TaskGoalType;
  summary: string;
  entities: Record<string, string>;
}

export interface ToolCall {
  id: string;
  toolName: ToolName;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  status: "success" | "error";
  durationMs: number;
  timestamp: string;
}

export interface TaskStep {
  id: string;
  name: string;
  description: string;
  status: StepStatus;
  input?: string;
  output?: string;
  toolCalls: ToolCall[];
  requiresConfirmation: boolean;
  startedAt?: string;
  completedAt?: string;
}

export interface Confirmation {
  stepId: string;
  action: string;
  impact: string;
  keyInfo: Record<string, string>;
  risks: string[];
  resolvedAt?: string;
  decision?: "confirmed" | "modified" | "cancelled";
}

export interface FormField {
  key: string;
  label: string;
  value: string;
  editable: boolean;
}

export interface BusinessForm {
  type: TaskGoalType;
  title: string;
  fields: FormField[];
}

export interface Approval {
  id: string;
  title: string;
  approvers: string[];
  status: "pending" | "approved";
  submittedAt: string;
}

export interface AuditLogEntry {
  id: string;
  type:
    | "user_input"
    | "plan"
    | "tool_call"
    | "confirmation"
    | "form_edit"
    | "result";
  message: string;
  detail?: string;
  timestamp: string;
}

export interface AgentTask {
  id: string;
  userInput: string;
  goal: ParsedGoal;
  status: TaskStatus;
  steps: TaskStep[];
  form?: BusinessForm;
  confirmation?: Confirmation;
  approval?: Approval;
  auditLog: AuditLogEntry[];
  createdAt: string;
  completedAt?: string;
}
