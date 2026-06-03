export type RoleId = "employee" | "manager" | "admin";

export type KnowledgeCategory =
  | "hr"
  | "finance"
  | "it"
  | "product"
  | "project"
  | "faq";

export type PermissionLevel = 1 | 2 | 3;

export type FeedbackType = "helpful" | "not_helpful" | "need_human";

export type IndexStatus = "indexed" | "pending" | "failed";

export interface Role {
  id: RoleId;
  label: string;
  maxPermissionLevel: PermissionLevel;
  departments: string[];
}

export interface User {
  id: string;
  name: string;
  role: RoleId;
  department: string;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  category: KnowledgeCategory;
  type: string;
  updatedAt: string;
  owner: string;
  accessibleDepartments: string[];
  indexStatus: IndexStatus;
  permissionLevel: PermissionLevel;
}

export interface KnowledgeChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  category: KnowledgeCategory;
  section: string;
  content: string;
  keywords: string[];
  department: string[];
  permissionLevel: PermissionLevel;
  updatedAt: string;
}

export interface Citation {
  chunkId: string;
  documentTitle: string;
  category: KnowledgeCategory;
  excerpt: string;
  updatedAt: string;
  section: string;
}

export interface AIAnswer {
  id: string;
  questionId: string;
  summary: string;
  explanation: string;
  steps: string[];
  cautions: string[];
  citations: Citation[];
  confidence: "high" | "medium" | "low";
  confidenceLabel: string;
  noAccess?: boolean;
  notFound?: boolean;
  createdAt: string;
}

export interface AIQuestion {
  id: string;
  text: string;
  askedAt: string;
  userId: string;
}

export interface Feedback {
  answerId: string;
  type: FeedbackType;
  submittedAt: string;
}
