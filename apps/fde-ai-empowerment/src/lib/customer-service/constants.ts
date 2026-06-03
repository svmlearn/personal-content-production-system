import type { IntentType } from "./types";

export const INTENT_LABELS: Record<IntentType, string> = {
  presales: "售前咨询",
  order: "订单查询",
  refund: "退款售后",
  technical: "技术故障",
  complaint: "投诉建议",
  account: "账号问题",
  transfer_human: "转人工",
};

export const INTENT_COLORS: Record<IntentType, string> = {
  presales: "bg-violet-100 text-violet-800",
  order: "bg-sky-100 text-sky-800",
  refund: "bg-amber-100 text-amber-800",
  technical: "bg-cyan-100 text-cyan-800",
  complaint: "bg-red-100 text-red-800",
  account: "bg-slate-100 text-slate-800",
  transfer_human: "bg-rose-100 text-rose-800",
};

export const EXAMPLE_QUESTIONS = [
  "我的订单什么时候发货？",
  "怎么申请退款？",
  "系统登录不上怎么办？",
  "你们的企业版怎么收费？",
];
