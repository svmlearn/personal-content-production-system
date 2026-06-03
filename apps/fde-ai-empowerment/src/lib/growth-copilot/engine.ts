import { METRICS, getMetric } from "./mock-data";
import type {
  ActionRecommendation,
  AnalysisResult,
  Anomaly,
  AnomalySeverity,
  Campaign,
  CampaignPlan,
  GrowthStrategy,
  Metric,
  MetricId,
  ReviewReport,
} from "./types";

/** 预留：接入 BI / 数仓 */
export const DATA_HOOK = {
  queryMetrics: async () => METRICS,
  runSQL: async (sql: string) => {
    void sql;
    return [];
  },
  llmAnalyze: async (prompt: string) => {
    void prompt;
    return "";
  },
};

const ANOMALY_THRESHOLDS: Record<
  MetricId,
  { dropPercent: number; severity: AnomalySeverity }
> = {
  dau: { dropPercent: 5, severity: "medium" },
  new_users: { dropPercent: 5, severity: "medium" },
  retention: { dropPercent: 3, severity: "high" },
  conversion: { dropPercent: 10, severity: "medium" },
  gmv: { dropPercent: 5, severity: "high" },
  aov: { dropPercent: 5, severity: "low" },
};

export function detectAnomalies(metrics: Metric[] = METRICS): Anomaly[] {
  const anomalies: Anomaly[] = [];

  for (const m of metrics) {
    const threshold = ANOMALY_THRESHOLDS[m.id];
    const isDrop = m.weekChangePercent < -threshold.dropPercent;
    const belowTarget = m.target !== undefined && m.value < m.target * 0.92;

    if (!isDrop && !belowTarget) continue;

    anomalies.push(buildAnomaly(m, isDrop ? threshold.severity : "medium"));
  }

  return anomalies;
}

function buildAnomaly(m: Metric, severity: AnomalySeverity): Anomaly {
  const templates: Record<
    MetricId,
    Omit<Anomaly, "metricId" | "severity">
  > = {
    retention: {
      description: `7日留存率本周 ${m.value}${m.unit}，环比下降 ${Math.abs(m.weekChangePercent).toFixed(1)}%，低于目标 ${m.target}${m.unit}`,
      possibleCauses: [
        "新用户渠道结构变化，低质流量占比上升",
        "首启引导/Aha 时刻弱化，D1 激活下降",
        "竞品促销导致用户分流",
        "版本缺陷影响核心功能使用",
      ],
      impact: "预计影响次周 DAU 约 -3%～-5%，LTV 中长期承压",
      dimensions: ["渠道", "端", "新老用户", "会员等级", "首访路径"],
      suggestedActions: [
        "按渠道拆解留存曲线，暂停低质投放",
        "优化新用户 onboarding 与 Day1 任务",
        "启动沉默用户召回小流量实验",
      ],
    },
    new_users: {
      description: `新增用户 ${m.value}，周环比 ${m.weekChangePercent.toFixed(1)}%`,
      possibleCauses: [
        "主力渠道预算缩减",
        "落地页转化下降",
        "应用商店评分波动",
      ],
      impact: "拉新漏斗上游收窄，需关注后续转化与留存",
      dimensions: ["渠道", "活动", "地域", "设备"],
      suggestedActions: [
        "复盘投放素材与落地页 A/B",
        "加大高 ROI 渠道预算",
        "联动产品优化注册流程",
      ],
    },
    dau: {
      description: `DAU 波动异常需结合留存与召回综合判断`,
      possibleCauses: ["节假日效应", "推送策略调整", "核心功能不可用"],
      impact: "影响整体活跃与广告/会员收入",
      dimensions: ["城市等级", "用户生命周期", "端"],
      suggestedActions: ["检查推送到达率", "排查服务可用性监控"],
    },
    conversion: {
      description: `转化率变化需结合流量质量判断`,
      possibleCauses: ["价格策略", "库存", "支付成功率"],
      impact: "直接影响 GMV 与 ROI",
      dimensions: ["品类", "价格带", "支付方式"],
      suggestedActions: ["分析购物车放弃节点", "优化支付链路"],
    },
    gmv: {
      description: `GMV 未达预期或增速放缓`,
      possibleCauses: ["大促后疲软", "客单价下降", "转化漏斗漏损"],
      impact: "营收目标达成风险",
      dimensions: ["品类", "商户", "会员"],
      suggestedActions: ["品类组合促销", "提升连带推荐"],
    },
    aov: {
      description: `客单价低于目标`,
      possibleCauses: ["低价 SKU 占比高", "满减门槛设置", "凑单引导不足"],
      impact: "单用户价值下降",
      dimensions: ["品类", "用户分层"],
      suggestedActions: ["满赠/加价购策略", "Bundles 推荐"],
    },
  };

  const t = templates[m.id];
  return { metricId: m.id, severity, ...t };
}

export function getAnomalyDetail(metricId: MetricId): Anomaly | null {
  const found = detectAnomalies().find((a) => a.metricId === metricId);
  return found ?? (getMetric(metricId) ? buildAnomaly(getMetric(metricId)!, "low") : null);
}

export function recommendActions(metric: Metric): ActionRecommendation[] {
  const anomaly = detectAnomalies().find((a) => a.metricId === metric.id);
  if (!anomaly) {
    return [
      {
        id: `rec-${metric.id}-ok`,
        metricId: metric.id,
        title: `持续监控${metric.name}`,
        reason: "指标处于正常波动范围",
        priority: "low",
      },
    ];
  }
  return anomaly.suggestedActions.map((action, i) => ({
    id: `rec-${metric.id}-${i}`,
    metricId: metric.id,
    title: action,
    reason: anomaly.description.slice(0, 40) + "…",
    priority: anomaly.severity === "high" ? "high" : "medium",
  }));
}

export function analyzeMetric(
  question: string,
  metrics: Metric[] = METRICS,
): AnalysisResult {
  const q = question.toLowerCase();
  const focusRetention =
    q.includes("留存") || q.includes("retention") || q.includes("下降");
  const focusCampaign =
    q.includes("活动") || q.includes("召回") || q.includes("会员");
  const focusNew = q.includes("新用户") || q.includes("新增");

  const retention = metrics.find((m) => m.id === "retention")!;

  if (focusRetention || focusNew) {
    return {
      question,
      conclusion: `本周新用户 7 日留存降至 ${retention.value}%，环比下降 ${Math.abs(retention.weekChangePercent).toFixed(1)}%。主要拖累来自信息流渠道新客（留存 -6.2pp）与 Android 端（-4.1pp）。`,
      chartData: [
        { name: "信息流", value: 28.4 },
        { name: "应用商店", value: 41.2 },
        { name: "裂变", value: 45.8 },
        { name: "品牌", value: 52.1 },
      ],
      segments: [
        { name: "iOS", value: 38.5, change: -2.1, share: 42 },
        { name: "Android", value: 31.2, change: -4.1, share: 58 },
        { name: "新用户", value: 34.2, change: -3.9, share: 100 },
      ],
      causes: [
        "信息流渠道占比从 22% 升至 31%，该渠道历史留存偏低",
        "5.21 版本引导页加载耗时增加 0.8s，D1 完成率 -1.5pp",
        "同期竞品大促，核心 SKU 价格劣势",
      ],
      nextSteps: [
        "下调信息流预算 20%，观察 3 日留存回升",
        "上线引导页性能热修 + 简化首单任务",
        "针对低留存分群推送「首单礼」实验",
      ],
    };
  }

  if (focusCampaign) {
    const gmv = metrics.find((m) => m.id === "gmv")!;
    return {
      question,
      conclusion: `结合当前 GMV ${gmv.value} 万（周环比 +${gmv.weekChangePercent}%）与沉默用户规模，建议以「权益+限时」组合召回。`,
      chartData: [
        { name: "沉默30天", value: 42 },
        { name: "沉默60天", value: 28 },
        { name: "沉默90天+", value: 18 },
      ],
      segments: [
        { name: "会员", value: 12.5, change: 0.8, share: 35 },
        { name: "非会员", value: 3.2, change: -0.5, share: 65 },
      ],
      causes: ["历史活动触达疲劳", "权益感知弱"],
      nextSteps: [
        "生成分层召回活动方案",
        "A/B 测试 push 文案与 landing",
        "设定 7 日回访率为北极星指标",
      ],
    };
  }

  const dau = metrics.find((m) => m.id === "dau")!;
  return {
    question,
    conclusion: `整体 DAU ${(dau.value / 10000).toFixed(1)} 万，周环比 +${dau.weekChangePercent}%。转化与 GMV 表现优于留存，建议优先治理留存漏斗。`,
    chartData: metrics.map((m) => ({
      name: m.name,
      value: Math.abs(m.weekChangePercent),
    })),
    segments: [
      { name: "一线", value: 45, change: 1.2, share: 40 },
      { name: "二线", value: 32, change: -0.5, share: 35 },
      { name: "三线及以下", value: 18, change: -2.1, share: 25 },
    ],
    causes: ["结构性流量变化", "季节性波动"],
    nextSteps: ["查看异常洞察模块", "选择重点指标下钻"],
  };
}

export function generateGrowthStrategy(goal: string): GrowthStrategy {
  return {
    goal,
    hypotheses: [
      "沉默用户仍对价格敏感，权益包可提升打开率",
      "7 日内二次触达可显著提升回访",
      "会员身份可放大转化效率",
    ],
    initiatives: [
      "建立沉默用户分层标签（30/60/90 天）",
      "设计阶梯权益：券 → 包邮 → 会员体验",
      "Push + 短信 + 站内信多渠道协同",
    ],
    metrics: ["7日回访率", "召回成本/人", "召回用户 GMV", "退订率"],
    timeline: [
      "T+0：方案评审与合规确认",
      "T+3：小流量 5% A/B",
      "T+7：全量 rollout",
      "T+14：中期复盘与调参",
    ],
  };
}

export function generateCampaignPlan(
  goal: string,
  audience = "沉默 30-60 天、历史有购买、近 90 天未回访用户",
): CampaignPlan {
  return {
    goal,
    targetAudience: audience,
    mechanism: [
      "分层发放「回归礼包」：满 99 减 15 + 会员 7 天体验",
      "首页弹窗 + 消息中心红点强提醒",
      "未完成领取 24h 后自动补发短信",
    ],
    pushSchedule: [
      "D0 10:00：Push「专属礼包待领取」",
      "D1 12:00：未打开用户短信提醒",
      "D3 20:00：权益即将过期倒计时",
      "D6：沉默仍无行为 → 进入人工外呼样本池（5%）",
    ],
    copyVariants: [
      "【专属回归礼】您有一张 15 元券待使用，24 小时内有效",
      "好久不见！会员体验已为您续上 7 天，点击查看精选好物",
      "最后 6 小时：礼包即将失效，戳我立即领取",
    ],
    risks: [
      "过度补贴拉低毛利，需设人均补贴上限",
      "高频 push 可能引起卸载，监控退订与投诉",
      "权益被套利，需设备/账号风控",
    ],
    estimatedMetrics: [
      { label: "触达打开率", value: "18% ~ 22%" },
      { label: "7日回访率提升", value: "+3pp ~ +5pp" },
      { label: "增量 GMV", value: "¥ 120万 ~ 150万" },
      { label: "ROI", value: "1.6 ~ 2.0" },
    ],
    checklist: [
      "人群包圈选与去重（已参与活动用户排除）",
      "券规则配置与风控白名单",
      "埋点：曝光/点击/领取/下单全链路",
      "客服 FAQ 与客诉预案",
      "上线前 QA 与灰度 5%",
    ],
  };
}

export function generateReviewReport(campaign: Campaign): ReviewReport {
  const gmvMetric = campaign.metrics.find((m) => m.label.includes("GMV"));
  const achieved = campaign.metrics.filter(
    (m) => m.actual >= m.target * 0.95,
  ).length;
  const total = campaign.metrics.length;

  return {
    campaignId: campaign.id,
    background: `${campaign.name}（${campaign.startDate} ~ ${campaign.endDate}），目标：${campaign.goal}。`,
    goalAchievement:
      achieved >= total * 0.6
        ? `核心指标 ${achieved}/${total} 项达成或接近目标，整体判定为「基本达成」。`
        : `仅 ${achieved}/${total} 项指标达标，整体判定为「部分未达成」。`,
    coreData: campaign.metrics.map((m) => ({
      label: m.label,
      value: `目标 ${m.target}${m.unit} / 实际 ${m.actual}${m.unit}（${((m.actual / m.target) * 100).toFixed(0)}%）`,
    })),
    highlights: [
      "用户参与热情高于预期，活动页 UV 完成率 112%",
      "会员分层策略有效，高价值用户核销率 +8pp",
      gmvMetric && gmvMetric.actual >= gmvMetric.target
        ? "GMV 超额完成"
        : "拉新/触达指标表现突出",
    ].filter(Boolean) as string[],
    issues: [
      gmvMetric && gmvMetric.actual < gmvMetric.target
        ? `GMV 未达目标（${gmvMetric.actual}/${gmvMetric.target}万）`
        : "部分低线市场核销率偏低",
      "活动后期疲劳，D5-D7 转化衰减明显",
      "客服咨询量峰值达日常 2.3 倍",
    ],
    rootCauses: [
      "优惠力度在低线市场感知不足，竞品同期加码",
      "Push 频次后半程未做衰减，导致打开率下滑",
      "部分 SKU 库存不足影响下单转化",
    ],
    optimizations: [
      "下次大促前锁定爆款库存与价格策略",
      "建立触达频次上限与分层衰减规则",
      "复盘期提前 48h 启动「倒计时」二次转化",
      "沉淀高 ROI 人群包用于后续召回",
    ],
  };
}

export function parseNaturalLanguage(
  input: string,
): { route: "analysis" | "campaign" | "review"; message: string } {
  const t = input.toLowerCase();
  if (t.includes("复盘") || (t.includes("总结") && t.includes("活动")))
    return { route: "review", message: "已跳转运营复盘，请选择历史活动。" };
  if (t.includes("活动") || t.includes("召回") || t.includes("方案"))
    return { route: "campaign", message: "已跳转活动方案生成。" };
  return { route: "analysis", message: "已生成数据分析结果。" };
}
