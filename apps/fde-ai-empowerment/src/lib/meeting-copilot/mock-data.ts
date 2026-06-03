import type { Meeting, Participant, TranscriptSegment } from "./types";

export const PARTICIPANTS: Participant[] = [
  { id: "p1", name: "张三", role: "项目经理" },
  { id: "p2", name: "李四", role: "产品经理" },
  { id: "p3", name: "王五", role: "研发负责人" },
  { id: "p4", name: "赵敏", role: "客户成功" },
];

export const SAMPLE_TRANSCRIPT: TranscriptSegment[] = [
  {
    id: "t1",
    speakerId: "p1",
    speakerName: "张三",
    text: "今天我们主要对齐华东智造项目的一期范围和下周技术评估会安排。",
    startTime: "00:00:12",
    isHighlight: true,
  },
  {
    id: "t2",
    speakerId: "p2",
    speakerName: "李四",
    text: "客户最关心的是 NC 集成和移动端审批体验，希望 Q3 能上线采购和费用两条流程。",
    startTime: "00:00:45",
    isHighlight: true,
  },
  {
    id: "t3",
    speakerId: "p3",
    speakerName: "王五",
    text: "集成接口需要客户 IT 在周三前提供文档，否则联调会推迟一周，这是当前最大风险。",
    startTime: "00:01:20",
    isHighlight: true,
  },
  {
    id: "t4",
    speakerId: "p1",
    speakerName: "张三",
    text: "决策：先做 4 周 POC，范围锁定采购+费用，不在一期做报表中心。",
    startTime: "00:02:05",
    isHighlight: true,
  },
  {
    id: "t5",
    speakerId: "p4",
    speakerName: "赵敏",
    text: "我负责周三前催客户流程文档，并预约下周二技术评估会。",
    startTime: "00:02:40",
  },
  {
    id: "t6",
    speakerId: "p2",
    speakerName: "李四",
    text: "我周五前输出更新版方案，把 POC 里程碑写清楚。",
    startTime: "00:03:10",
  },
  {
    id: "t7",
    speakerId: "p3",
    speakerName: "王五",
    text: "研发侧下周一给出集成工作量评估，如果超过 15 人日要重新排期。",
    startTime: "00:03:45",
  },
];

export const MOCK_MEETINGS: Meeting[] = [
  {
    id: "mtg-1",
    title: "华东智造方案对齐会",
    startTime: "2025-05-28T14:00:00",
    endTime: "2025-05-28T15:05:00",
    type: "sales",
    status: "ended",
    participants: PARTICIPANTS,
    hasMinutes: false,
    transcript: SAMPLE_TRANSCRIPT,
    liveHighlights: [
      "客户关注 NC 集成与移动端",
      "POC 范围需锁定",
      "集成文档是阻塞风险",
    ],
  },
  {
    id: "mtg-2",
    title: "产品 Sprint 计划会",
    startTime: "2025-05-27T10:00:00",
    endTime: "2025-05-27T10:45:00",
    type: "planning",
    status: "ended",
    participants: [PARTICIPANTS[1], PARTICIPANTS[2], PARTICIPANTS[3]],
    hasMinutes: true,
    transcript: [],
    liveHighlights: [],
  },
  {
    id: "mtg-3",
    title: "周例会 · 交付进展",
    startTime: "2025-05-26T09:30:00",
    endTime: "2025-05-26T10:00:00",
    type: "standup",
    status: "ended",
    participants: PARTICIPANTS,
    hasMinutes: true,
    transcript: [],
    liveHighlights: [],
  },
];

export function createNewMeeting(title: string): Meeting {
  return {
    id: `mtg-${Date.now()}`,
    title: title || "新建会议记录",
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 3600000).toISOString(),
    type: "review",
    status: "ended",
    participants: PARTICIPANTS.slice(0, 3),
    hasMinutes: false,
    transcript: SAMPLE_TRANSCRIPT,
    liveHighlights: [
      "等待生成纪要…",
      "可基于转写提取待办",
    ],
  };
}
