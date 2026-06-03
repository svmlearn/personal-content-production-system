import { METRIC_CATALOG } from "./catalog";
import type { FunnelStep, SqlPreview } from "./types";

export {
  detectAnomalies,
  analyzeMetric,
  generateGrowthStrategy,
  generateCampaignPlan,
  generateReviewReport,
  recommendActions,
  getAnomalyDetail,
  parseNaturalLanguage,
  DATA_HOOK,
} from "@/lib/growth-copilot/engine";

export { METRICS, CAMPAIGNS, getMetric } from "@/lib/growth-copilot/mock-data";
export type {
  Metric,
  Anomaly,
  AnalysisResult,
  CampaignPlan,
  ReviewReport,
  ActionRecommendation,
  GrowthStrategy,
} from "@/lib/growth-copilot/types";

/** 预留：接入数仓 / BI 语义层 */
export const BI_HOOK = {
  executeSQL: async (sql: string) => {
    void sql;
    return { rows: [], columns: [] };
  },
  fetchSemanticLayer: async () => METRIC_CATALOG,
};

export function getMetricCatalog() {
  return METRIC_CATALOG;
}

export function generateSQL(question: string): SqlPreview {
  const q = question.toLowerCase();
  if (q.includes("留存") || q.includes("retention")) {
    return {
      question,
      tables: ["dws_user_cohort_daily", "dim_channel"],
      estimatedRows: 12400,
      sql: `SELECT
  c.channel_name,
  AVG(r.retention_d7) AS retention_d7,
  COUNT(DISTINCT r.user_id) AS cohort_users
FROM dws_user_cohort_daily r
JOIN dim_channel c ON r.channel_id = c.channel_id
WHERE r.cohort_date BETWEEN DATE_SUB(CURRENT_DATE, 7) AND CURRENT_DATE
GROUP BY 1
ORDER BY retention_d7 ASC
LIMIT 20;`,
      explanation:
        "按渠道聚合近 7 日新客 cohort 的 7 日留存，用于定位留存下降渠道。",
    };
  }
  if (q.includes("gmv") || q.includes("成交")) {
    return {
      question,
      tables: ["dws_order_daily", "dim_category"],
      estimatedRows: 8600,
      sql: `SELECT
  dt,
  SUM(gmv) AS gmv,
  SUM(orders) AS orders
FROM dws_order_daily
WHERE dt >= DATE_SUB(CURRENT_DATE, 14)
GROUP BY 1
ORDER BY 1;`,
      explanation: "拉取近 14 日 GMV 与订单量趋势。",
    };
  }
  return {
    question,
    tables: ["dws_metric_daily"],
    estimatedRows: 4200,
    sql: `SELECT metric_name, metric_value, dim_channel, dim_os
FROM dws_metric_daily
WHERE dt = CURRENT_DATE - 1
  AND metric_name IN ('dau','new_users','conversion');`,
    explanation: "查询昨日核心指标按渠道、端拆解。",
  };
}

export function buildFunnelAnalysis(): FunnelStep[] {
  const steps = [
    { name: "访问 App", users: 128400 },
    { name: "浏览商品", users: 64200 },
    { name: "加购", users: 19260 },
    { name: "下单", users: 9640 },
    { name: "支付成功", users: 6168 },
  ];
  return steps.map((s, i) => {
    const prev = i === 0 ? s.users : steps[i - 1].users;
    const rate = i === 0 ? 100 : (s.users / steps[0].users) * 100;
    const dropoff = i === 0 ? 0 : ((prev - s.users) / prev) * 100;
    return {
      name: s.name,
      users: s.users,
      rate: Math.round(rate * 10) / 10,
      dropoff: Math.round(dropoff * 10) / 10,
    };
  });
}

export function generateBiInsight(question: string): string {
  if (question.includes("留存"))
    return "BI 洞察：留存下滑集中在信息流渠道与新版本 Android，建议联动渠道质量与产品漏斗联合看板。";
  if (question.includes("SQL") || question.includes("查询"))
    return "已生成只读 SQL 预览，生产环境需走数据权限审批。";
  return "可从指标目录确认口径，再用 NL 分析或 SQL 实验室下钻验证假设。";
}
