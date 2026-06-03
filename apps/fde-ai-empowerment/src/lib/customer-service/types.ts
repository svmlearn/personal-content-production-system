export type IntentType =
  | "presales"
  | "order"
  | "refund"
  | "technical"
  | "complaint"
  | "account"
  | "transfer_human";

export type MessageRole = "user" | "ai" | "system";

export type TicketStatus = "open" | "in_progress" | "resolved";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

export type ConversationStatus = "active" | "resolved" | "escalated";

export interface Intent {
  type: IntentType;
  label: string;
  confidence: number;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  tier: "标准版" | "专业版" | "企业版";
  contact: string;
  email: string;
}

export interface FAQItem {
  id: string;
  intent: IntentType;
  question: string;
  answer: string;
  policy?: string;
  keywords: string[];
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  intent?: IntentType;
  structuredReply?: StructuredReply;
  followUp?: string;
  pendingTicket?: PendingTicketDraft;
}

export interface StructuredReply {
  understanding: string;
  solution: string;
  steps: string[];
  policy: string;
  needsHuman: boolean;
  humanReason?: string;
}

export interface PendingTicketDraft {
  summary: string;
  category: string;
  priority: TicketPriority;
  contact: string;
}

export interface Conversation {
  id: string;
  customerId: string;
  status: ConversationStatus;
  messages: Message[];
  currentIntent?: IntentType;
  satisfaction?: 1 | 2 | 3 | 4 | 5;
  resolved: boolean;
  transferredToHuman: boolean;
  ticketId?: string;
  knowledgeHits: string[];
  riskFlags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  conversationId: string;
  userQuestion: string;
  category: string;
  priority: TicketPriority;
  contact: string;
  aiSummary: string;
  intent: IntentType;
  status: TicketStatus;
  recommendedReply: string;
  createdAt: string;
}

export interface AgentSuggestion {
  ticketId: string;
  reply: string;
  confidence: number;
  sources: string[];
}

export interface QualityReport {
  conversationId: string;
  score: number;
  dimensions: { label: string; score: number; comment: string }[];
  improvements: string[];
  summary: string;
}
