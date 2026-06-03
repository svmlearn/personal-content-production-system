export type MeetingType =
  | "standup"
  | "review"
  | "planning"
  | "sales"
  | "retro";

export type MeetingStatus = "scheduled" | "in_progress" | "ended";

export type ActionStatus = "todo" | "in_progress" | "done";

export type ActionPriority = "high" | "medium" | "low";

export interface Participant {
  id: string;
  name: string;
  role: string;
}

export interface TranscriptSegment {
  id: string;
  speakerId: string;
  speakerName: string;
  text: string;
  startTime: string;
  isHighlight?: boolean;
}

export interface AgendaTopic {
  id: string;
  title: string;
  summary: string;
}

export interface ActionItem {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  priority: ActionPriority;
  relatedTopic: string;
  status: ActionStatus;
}

export interface Decision {
  id: string;
  content: string;
  background: string;
  participants: string[];
  impact: string;
  followUp: string;
}

export interface MeetingSummary {
  overview: string;
  topics: AgendaTopic[];
  conclusions: string[];
  decisions: string[];
  risks: string[];
  nextMeetingSuggestion: string;
}

export interface MeetingQualityReport {
  durationScore: number;
  clarityScore: number;
  conclusionScore: number;
  ownershipScore: number;
  overallScore: number;
  durationComment: string;
  clarityComment: string;
  conclusionComment: string;
  ownershipComment: string;
  improvements: string[];
}

export interface Meeting {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  type: MeetingType;
  status: MeetingStatus;
  participants: Participant[];
  hasMinutes: boolean;
  transcript: TranscriptSegment[];
  summary?: MeetingSummary;
  actionItems?: ActionItem[];
  decisions?: Decision[];
  quality?: MeetingQualityReport;
  liveHighlights: string[];
}
