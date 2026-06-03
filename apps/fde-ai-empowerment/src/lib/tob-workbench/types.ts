export type UserRole = "employee" | "manager" | "admin";

export interface User {
  id: string;
  name: string;
  department: string;
  role: UserRole;
  avatar?: string;
}

export interface Permission {
  resource: string;
  actions: ("read" | "write" | "approve" | "admin")[];
}

export interface Role {
  id: UserRole;
  name: string;
  permissions: Permission[];
}

export interface Document {
  id: string;
  title: string;
  category: string;
  sensitivity: "public" | "internal" | "confidential";
  updatedAt: string;
}

export interface Chunk {
  id: string;
  documentId: string;
  content: string;
  score: number;
}

export type TaskStatus = "draft" | "pending_approval" | "completed" | "rejected";
export type TaskIntent =
  | "knowledge_qa"
  | "doc_gen"
  | "data_analysis"
  | "agent_task"
  | "risk_review";

export interface Task {
  id: string;
  intent: TaskIntent;
  title: string;
  input: string;
  status: TaskStatus;
  createdAt: string;
  createdBy: string;
  riskLevel: "low" | "medium" | "high";
}

export interface ToolCall {
  id: string;
  tool: string;
  input: Record<string, string>;
  output: string;
  status: "success" | "failed" | "pending";
}

export interface AIAnswer {
  id: string;
  taskId: string;
  summary: string;
  sections: { title: string; body: string }[];
  citations: Chunk[];
  confidence: number;
  recommendations: string[];
  editableContent?: string;
  needsApproval: boolean;
}

export interface Approval {
  id: string;
  taskId: string;
  status: "pending" | "approved" | "rejected";
  approver?: string;
  comment?: string;
  at?: string;
}

export interface Feedback {
  id: string;
  taskId: string;
  rating: "up" | "down";
  comment?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actor: string;
  resource: string;
  detail: string;
  at: string;
}

export interface BusinessRecord {
  id: string;
  type: string;
  title: string;
  owner: string;
  meta: Record<string, string>;
}

export type WorkbenchView =
  | "workbench"
  | "task"
  | "result"
  | "history"
  | "admin";

export const INTENT_LABEL: Record<TaskIntent, string> = {
  knowledge_qa: "知识库问答",
  doc_gen: "文档生成",
  data_analysis: "数据分析",
  agent_task: "流程 Agent",
  risk_review: "风控审核",
};
