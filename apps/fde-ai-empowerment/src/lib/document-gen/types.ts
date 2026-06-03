export type DocumentType =
  | "presales_proposal"
  | "bid_response"
  | "industry_report"
  | "contract_summary"
  | "meeting_minutes"
  | "weekly_report"
  | "activity_review";

export type OutputStyle = "formal" | "consulting" | "sales" | "concise";

export type ApprovalStatus =
  | "draft"
  | "pending_review"
  | "in_review"
  | "approved"
  | "needs_revision";

export type SourceCategory =
  | "product"
  | "case"
  | "industry"
  | "template";

export interface DocumentTemplate {
  type: DocumentType;
  label: string;
  description: string;
  requiresApproval: boolean;
}

export interface FormFieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export type DocumentForm = Record<string, string>;

export interface OutlineSection {
  id: string;
  level: 1 | 2;
  title: string;
  goal: string;
  suggestedSources: string[];
}

export interface DocumentOutline {
  sections: OutlineSection[];
}

export interface SourceMaterial {
  id: string;
  title: string;
  category: SourceCategory;
  excerpt: string;
  updatedAt: string;
}

export interface SectionCitation {
  sourceId: string;
  label: string;
}

export interface DocumentSection {
  id: string;
  outlineId: string;
  title: string;
  content: string;
  citations: SectionCitation[];
  status: "empty" | "generated" | "edited";
}

export interface ApprovalRecord {
  id: string;
  actor: string;
  action: string;
  comment?: string;
  timestamp: string;
  status: ApprovalStatus;
}

export interface GeneratedDocument {
  id: string;
  type: DocumentType;
  title: string;
  form: DocumentForm;
  outline: DocumentOutline;
  sections: DocumentSection[];
  style: OutputStyle;
  approvalStatus: ApprovalStatus;
  approvalHistory: ApprovalRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface ExportPreview {
  format: "word" | "ppt" | "pdf";
  filename: string;
  pageCount: number;
  message: string;
}
