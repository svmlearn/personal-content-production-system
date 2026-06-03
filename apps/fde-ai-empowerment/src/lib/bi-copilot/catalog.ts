import type { SemanticMetric } from "./types";

export const METRIC_CATALOG: SemanticMetric[] = [
  {
    id: "dau",
    name: "DAU",
    definition: "日活跃用户数，去重 device_id",
    formula: "COUNT(DISTINCT device_id) WHERE event_date = ${date}",
    dimensions: ["渠道", "端", "城市等级", "用户生命周期"],
    owner: "数据产品",
    refreshCycle: "T+1 02:00",
  },
  {
    id: "retention_d7",
    name: "7日留存率",
    definition: "新用户在第7日仍活跃的比例",
    formula: "retained_d7 / cohort_new_users",
    dimensions: ["渠道", "端", "品类首购"],
    owner: "增长分析",
    refreshCycle: "T+1 06:00",
  },
  {
    id: "gmv",
    name: "GMV",
    definition: "成交订单金额总和（含退款前）",
    formula: "SUM(order_amount) WHERE pay_status = 'paid'",
    dimensions: ["品类", "商户", "价格带", "会员等级"],
    owner: "商业分析",
    refreshCycle: "准实时 5min",
  },
  {
    id: "conversion",
    name: "转化率",
    definition: "下单用户数 / 访问用户数",
    formula: "buyers / visitors",
    dimensions: ["落地页", "活动", "端"],
    owner: "运营分析",
    refreshCycle: "T+1 02:00",
  },
];
