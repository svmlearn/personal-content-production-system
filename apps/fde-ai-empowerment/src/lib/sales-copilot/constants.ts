import type { OpportunityStage } from "./types";

export const STAGE_LABELS: Record<OpportunityStage, string> = {
  lead: "线索",
  qualified: "需求确认",
  demo: "方案演示",
  proposal: "商务报价",
  negotiation: "谈判签约",
  closed_won: "已签约",
};

export const STAGE_COLORS: Record<OpportunityStage, string> = {
  lead: "bg-slate-100 text-slate-700",
  qualified: "bg-sky-100 text-sky-800",
  demo: "bg-violet-100 text-violet-800",
  proposal: "bg-amber-100 text-amber-800",
  negotiation: "bg-orange-100 text-orange-800",
  closed_won: "bg-emerald-100 text-emerald-800",
};

export const NL_EXAMPLES = [
  "帮我分析这个客户",
  "帮我生成一版售前方案",
  "根据会议纪要生成跟进邮件",
];

export const PROPOSAL_SCENARIOS = [
  { id: "digital", label: "数字化转型" },
  { id: "security", label: "安全合规升级" },
  { id: "efficiency", label: "运营效率提升" },
];
