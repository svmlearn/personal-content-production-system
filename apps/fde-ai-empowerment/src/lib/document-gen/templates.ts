import type { DocumentTemplate, DocumentType, FormFieldDef } from "./types";

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    type: "presales_proposal",
    label: "售前方案",
    description: "面向客户的解决方案与价值阐述",
    requiresApproval: false,
  },
  {
    type: "bid_response",
    label: "标书响应",
    description: "招标技术/商务响应文件",
    requiresApproval: true,
  },
  {
    type: "industry_report",
    label: "行业分析报告",
    description: "行业趋势、竞争与机会分析",
    requiresApproval: false,
  },
  {
    type: "contract_summary",
    label: "合同风险摘要",
    description: "合同条款风险点提炼",
    requiresApproval: true,
  },
  {
    type: "meeting_minutes",
    label: "会议纪要",
    description: "会议结论、待办与责任人",
    requiresApproval: false,
  },
  {
    type: "weekly_report",
    label: "项目周报",
    description: "本周进展、风险与下周计划",
    requiresApproval: false,
  },
  {
    type: "activity_review",
    label: "活动复盘",
    description: "活动目标达成与优化建议",
    requiresApproval: false,
  },
];

const FORM_FIELDS: Record<DocumentType, FormFieldDef[]> = {
  presales_proposal: [
    { key: "customer", label: "客户名称", type: "text", required: true },
    { key: "industry", label: "所属行业", type: "text", required: true },
    { key: "pains", label: "客户痛点", type: "textarea", required: true },
    {
      key: "modules",
      label: "推荐产品模块",
      type: "textarea",
      placeholder: "如：智能审批、知识库",
    },
    { key: "goal", label: "项目目标", type: "text" },
    { key: "duration", label: "实施周期", type: "text", placeholder: "如：8 周" },
    { key: "referenceCase", label: "参考案例", type: "text" },
    {
      key: "style",
      label: "输出风格",
      type: "select",
      options: ["正式", "咨询风", "销售风", "简洁"],
    },
  ],
  bid_response: [
    { key: "customer", label: "招标方", type: "text", required: true },
    { key: "project", label: "项目名称", type: "text", required: true },
    { key: "deadline", label: "投标截止", type: "text" },
    { key: "requirements", label: "关键需求条款", type: "textarea" },
    { key: "differentiator", label: "差异化优势", type: "textarea" },
  ],
  industry_report: [
    { key: "industry", label: "行业", type: "text", required: true },
    { key: "scope", label: "分析范围", type: "text" },
    { key: "focus", label: "重点议题", type: "textarea" },
  ],
  contract_summary: [
    { key: "contractName", label: "合同名称", type: "text", required: true },
    { key: "party", label: "签约方", type: "text" },
    { key: "focusClauses", label: "关注条款", type: "textarea" },
  ],
  meeting_minutes: [
    { key: "meetingTitle", label: "会议主题", type: "text", required: true },
    { key: "attendees", label: "参会人", type: "text" },
    { key: "rawNotes", label: "会议记录/raw", type: "textarea", required: true },
  ],
  weekly_report: [
    { key: "project", label: "项目名称", type: "text", required: true },
    { key: "week", label: "周期", type: "text" },
    { key: "highlights", label: "本周亮点", type: "textarea" },
    { key: "risks", label: "风险项", type: "textarea" },
  ],
  activity_review: [
    { key: "activityName", label: "活动名称", type: "text", required: true },
    { key: "goal", label: "活动目标", type: "text" },
    { key: "metrics", label: "核心数据", type: "textarea" },
  ],
};

export function getFormFields(type: DocumentType): FormFieldDef[] {
  return FORM_FIELDS[type] ?? [];
}

export function defaultFormValues(type: DocumentType): Record<string, string> {
  const defaults: Partial<Record<DocumentType, Record<string, string>>> = {
    presales_proposal: {
      customer: "华东智造科技有限公司",
      industry: "先进制造",
      pains: "审批慢、系统孤岛、数据不准",
      modules: "智能审批与工作流、开放集成平台",
      goal: "一期上线采购与费用流程",
      duration: "8 周",
      referenceCase: "制造业龙头 A 公司",
      style: "咨询风",
    },
    meeting_minutes: {
      meetingTitle: "华东智造方案交流纪要",
      attendees: "我方售前、客户 CIO 与流程总监",
      rawNotes: "客户关注集成周期与移动端体验，要求下周技术评估会。",
    },
  };
  return defaults[type] ?? {};
}
