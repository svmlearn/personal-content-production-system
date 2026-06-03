import type { MetricId } from "./types";

export const METRIC_LABELS: Record<MetricId, string> = {
  dau: "DAU",
  new_users: "新增用户",
  retention: "7日留存率",
  conversion: "转化率",
  gmv: "GMV",
  aov: "客单价",
};

export const NL_EXAMPLES = [
  "为什么本周新用户留存下降？",
  "帮我生成一套会员召回活动方案",
  "总结上次活动复盘",
];

export const CAMPAIGN_GOAL_EXAMPLES = [
  "提升沉默用户 7 日回访率",
  "提高新用户首单转化率",
  "促进会员复购 GMV",
];
