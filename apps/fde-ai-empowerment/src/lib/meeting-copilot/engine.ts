import { SAMPLE_TRANSCRIPT } from "./mock-data";
import type {
  ActionItem,
  Decision,
  Meeting,
  MeetingQualityReport,
  MeetingSummary,
  TranscriptSegment,
} from "./types";

/** 预留：ASR / LLM / 飞书 / Jira */
export const MEETING_HOOK = {
  transcribeAudio: async (audio: Blob) => {
    void audio;
    return SAMPLE_TRANSCRIPT;
  },
  llmSummarize: async (text: string) => {
    void text;
    return null;
  },
};

export function transcribeMeeting(audio?: Blob): TranscriptSegment[] {
  void audio;
  return SAMPLE_TRANSCRIPT;
}

export function summarizeMeeting(transcript: TranscriptSegment[]): MeetingSummary {
  void transcript;
  return {
    overview:
      "本次会议对齐华东智造一期建设范围，明确 POC 路径与技术评估会安排，并识别集成文档交付为关键阻塞风险。",
    topics: [
      {
        id: "topic-1",
        title: "一期范围与客户诉求",
        summary: "聚焦采购+费用流程，强调 NC 集成与移动端体验。",
      },
      {
        id: "topic-2",
        title: "POC 与里程碑",
        summary: "决策采用 4 周 POC，暂不纳入报表中心。",
      },
      {
        id: "topic-3",
        title: "集成与风险",
        summary: "需客户周三前提供接口文档，否则联调推迟。",
      },
    ],
    conclusions: [
      "一期范围锁定为采购与费用两大流程",
      "以 4 周 POC 验证集成与移动体验",
      "技术评估会安排在下周",
    ],
    decisions: [
      "先做 4 周 POC，范围不含报表中心",
      "方案中须明确 POC 里程碑与验收标准",
    ],
    risks: [
      "客户 IT 接口文档延迟将导致联调推迟一周",
      "集成工作量若超 15 人日需重新排期",
    ],
    nextMeetingSuggestion:
      "建议下周二召开技术评估会，参会：客户 CIO、流程总监、我方售前与研发；会前确认接口文档已交付。",
  };
}

export function extractActionItems(
  transcript: TranscriptSegment[],
): ActionItem[] {
  void transcript;
  return [
    {
      id: "ai-1",
      title: "催促客户提供 NC 集成接口文档",
      assignee: "赵敏",
      dueDate: "2025-05-29",
      priority: "high",
      relatedTopic: "集成与风险",
      status: "todo",
    },
    {
      id: "ai-2",
      title: "预约并组织技术评估会",
      assignee: "赵敏",
      dueDate: "2025-06-03",
      priority: "high",
      relatedTopic: "POC 与里程碑",
      status: "todo",
    },
    {
      id: "ai-3",
      title: "输出含 POC 里程碑的更新版方案",
      assignee: "李四",
      dueDate: "2025-05-31",
      priority: "medium",
      relatedTopic: "一期范围与客户诉求",
      status: "todo",
    },
    {
      id: "ai-4",
      title: "评估集成开发工作量（人日）",
      assignee: "王五",
      dueDate: "2025-06-02",
      priority: "medium",
      relatedTopic: "集成与风险",
      status: "todo",
    },
  ];
}

export function extractDecisions(
  transcript: TranscriptSegment[],
): Decision[] {
  void transcript;
  return [
    {
      id: "dec-1",
      content: "采用 4 周 POC，范围锁定采购+费用流程",
      background: "客户希望 Q3 上线但需控制范围与风险",
      participants: ["张三", "李四", "王五"],
      impact: "研发与售前按 POC 范围投入，报表中心延后",
      followUp: "方案中补充 POC 验收标准与退出条件",
    },
    {
      id: "dec-2",
      content: "一期不包含报表中心",
      background: "避免范围膨胀导致交付延期",
      participants: ["张三", "李四"],
      impact: "产品路线图需调整二期规划",
      followUp: "客户沟通二期报表能力规划",
    },
  ];
}

export function analyzeMeetingQuality(
  transcript: TranscriptSegment[],
  actionItems: ActionItem[],
): MeetingQualityReport {
  void transcript;
  const hasOwner = actionItems.every((a) => a.assignee);
  const hasDue = actionItems.every((a) => a.dueDate);

  return {
    durationScore: 85,
    clarityScore: 88,
    conclusionScore: 90,
    ownershipScore: hasOwner && hasDue ? 92 : 70,
    overallScore: 89,
    durationComment: "会议时长约 65 分钟，议题覆盖完整，略偏长但可接受",
    clarityComment: "议题拆分清晰，客户诉求与内部行动分界明确",
    conclusionComment: "形成明确 POC 决策，结论可执行",
    ownershipComment: hasOwner
      ? "待办均已指定负责人与截止时间"
      : "部分待办缺少截止时间",
    improvements: [
      "可提前 24h 发送议程，减少会中发散",
      "对「15 人日」阈值建议会前书面确认",
      "下次可增设 5 分钟决策复核环节",
    ],
  };
}

export function syncToProjectTool(
  actionItems: ActionItem[],
): { synced: number; tool: string; message: string } {
  return {
    synced: actionItems.length,
    tool: "Mock Jira / 飞书项目",
    message: `已模拟同步 ${actionItems.length} 条待办到项目管理系统`,
  };
}

export function syncToCalendar(meeting: Meeting): string {
  return `已模拟将「${meeting.title}」跟进事项写入日历（${meeting.participants.length} 人）`;
}

export function sendMinutesEmail(meeting: Meeting): string {
  return `已模拟向 ${meeting.participants.map((p) => p.name).join("、")} 发送会议纪要邮件`;
}

export function formatMinutesMarkdown(meeting: Meeting): string {
  const s = meeting.summary;
  if (!s) return "";
  let md = `# ${meeting.title}\n\n## 摘要\n${s.overview}\n\n## 核心结论\n`;
  s.conclusions.forEach((c) => {
    md += `- ${c}\n`;
  });
  md += "\n## 待办\n";
  meeting.actionItems?.forEach((a) => {
    md += `- [ ] ${a.title} (@${a.assignee} · ${a.dueDate})\n`;
  });
  md += "\n## 风险\n";
  s.risks.forEach((r) => {
    md += `- ${r}\n`;
  });
  return md;
}

export function processMeeting(meeting: Meeting): Meeting {
  const transcript =
    meeting.transcript.length > 0
      ? meeting.transcript
      : transcribeMeeting();
  const summary = summarizeMeeting(transcript);
  const actionItems = extractActionItems(transcript);
  const decisions = extractDecisions(transcript);
  const quality = analyzeMeetingQuality(transcript, actionItems);

  return {
    ...meeting,
    transcript,
    summary,
    actionItems,
    decisions,
    quality,
    hasMinutes: true,
  };
}

export function extractLiveHighlights(
  transcript: TranscriptSegment[],
): string[] {
  return transcript
    .filter((t) => t.isHighlight)
    .map((t) => `${t.speakerName}：${t.text.slice(0, 28)}…`)
    .slice(0, 5);
}
