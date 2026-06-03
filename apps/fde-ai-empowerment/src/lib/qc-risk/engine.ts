import type {
  AnomalyReviewResult,
  ComplianceReport,
  DefectAnalysis,
  QcMode,
  RuleDiagnosis,
  SamplingPlanResult,
  StandardInterpretation,
} from "./types";

/** 预留：MES / 风控引擎 / 质检设备 / LLM */
export const QC_HOOK = {
  fetchMesBatch: async (batch: string) => {
    void batch;
    return null;
  },
  queryRiskEngine: async (caseId: string) => {
    void caseId;
    return null;
  },
  llm: async (prompt: string) => {
    void prompt;
    return "";
  },
};

export function interpretStandard(text: string): StandardInterpretation {
  const hasAql = text.includes("AQL") || text.includes("抽检");
  return {
    summary:
      "本标准定义外观与尺寸的 A/B 分级规则，并结合 GB/T 2828.1 确定批量抽检方案，用于产线终检放行判定。",
    keyMetrics: [
      "划痕：单处 ≤0.5mm，累计 ≤2 处",
      "色差 ΔE ≤1.5",
      "关键尺寸 ±0.1mm",
      hasAql ? "抽检：一般检验水平 II，AQL 1.0" : "抽检：按批量档位执行",
    ],
    procedures: [
      "来料核对批次与标准色板",
      "首件确认后按频次巡检",
      "终检全检关键尺寸 + 按 AQL 抽检外观",
      "B 级品隔离并触发 MRB 评审",
    ],
    acceptanceCriteria: [
      "A 级：全部指标在允差内",
      "B 级：外观缺陷超限但可返工",
      "拒收：关键尺寸超差或色差超标",
    ],
    tools: ["色差仪", "三坐标/卡尺", "标准色板", "缺陷图谱"],
    risks: [
      {
        id: "r1",
        description: "巡检频次不足导致批量漏检",
        level: "high",
        mitigation: "绑定产量节拍自动提醒巡检",
      },
      {
        id: "r2",
        description: "色板老化导致 ΔE 误判",
        level: "medium",
        mitigation: "季度校准与双人复核",
      },
    ],
  };
}

export function analyzeDefect(text: string): DefectAnalysis {
  const highRate = text.includes("2.8") || text.includes("不良率");
  return {
    summary: highRate
      ? "注塑短射导致外壳缺口，批次不良率 2.8% 超过 1.5% 阈值，建议停线排查模具与原料。"
      : "检测到产线质量异常，需按缺陷类型执行根因分析与遏制措施。",
    rootCauses: [
      "模具磨损或排气不良导致短射",
      "原料含水率/干燥不足",
      "注塑温度、压力、保压参数漂移",
      text.includes("IM-07") ? "设备 #IM-07 近期保养周期可能超期" : "设备参数未锁定",
    ],
    impact: "当前批次 B20250528-17 需冻结库存；同模具连续 3 批追溯",
    investigationSteps: [
      "保留不良样件并拍照建档",
      "核对注塑曲线与模具温度记录",
      "对比原料批次 R-8821 进料检验报告",
      "检查模具 M-449 最近 48h 保养与换模记录",
    ],
    correctiveActions: [
      "调整保压与射速，复模首件确认",
      "对原料复测含水率并重新干燥",
      "模具抛光/清排气槽（如需）",
    ],
    preventRecurrence: [
      "短射缺陷加入 SPC 预警",
      "模具寿命计数与自动保养工单",
    ],
    escalate: highRate,
    escalateReason: highRate ? "不良率超阈值且可能影响已发货批次，需质量总监与客服联动" : undefined,
  };
}

export function generateSamplingPlan(input: string): SamplingPlanResult {
  const exportEu = input.includes("欧盟") || input.includes("CE");
  return {
    planName: "电源适配器出厂抽检方案",
    sampleRate: "按 ISO 2859-1 / 客户协议：正常 2.5%，加严 5%",
    tasks: [
      { id: "t1", title: "电气安全抽检", sampleSize: 13, frequency: "每批", owner: "QC" },
      { id: "t2", title: "外观与标签", sampleSize: 32, frequency: "每批", owner: "QC" },
      { id: "t3", title: "跌落与温升", sampleSize: 5, frequency: "每日首批", owner: "实验室" },
    ],
    checkpoints: ["来料 RoHS", "过程首件", "终检 AQL", "OBA 出货"],
    normalCases: [
      "批量 12000 标准抽检通过放行",
      "标签与铭牌参数与证书一致",
      exportEu ? "CE 符合性声明随货" : "内销 3C 标识齐全",
    ],
    edgeCases: [
      "换线后首批加严检验",
      "客户加严 AQL 0.65 场景",
      "混批发货禁止",
    ],
    regressionPoints: [
      "上月客诉缺陷点加抽",
      "供应商变更后全尺寸复核",
    ],
  };
}

export function diagnoseRiskRule(scenario: string): RuleDiagnosis {
  const hasUsd = scenario.includes("USD") || scenario.includes("$");
  return {
    features: [
      "大额订单人工复核",
      "同设备高频下单拦截",
      "新用户首单增强验证",
      "支付失败重试异常监测",
    ],
    ruleSuggestions: [
      {
        id: "ru1",
        name: "大额复核",
        condition: hasUsd ? "单笔金额 > 5000 USD" : "单笔金额 > 阈值",
        action: "转人工审核 + 延迟发货",
        priority: "P0",
      },
      {
        id: "ru2",
        name: "设备聚集",
        condition: "24h 同 device_id 下单 ≥3",
        action: "验证码 + 风控评分降级",
        priority: "P1",
      },
      {
        id: "ru3",
        name: "新户首单",
        condition: "注册 <7 天且首单 >2000",
        action: "KYC 轻量核验",
        priority: "P1",
      },
    ],
    dataFields: ["user_id", "device_id", "ip_country", "amount", "pay_retry_count", "coupon_rate"],
    testPoints: [
      "边界金额 4999/5001",
      "设备 ID 第 3/4 次下单",
      "注册第 6/7 天首单",
      "3DS 失败后的支付成功",
    ],
    risks: [
      {
        id: "rk1",
        description: "规则误杀导致转化率下降",
        level: "medium",
        mitigation: "灰度发布 + 误杀率日报",
      },
      {
        id: "rk2",
        description: "跨境 IP 与收货地不一致误报",
        level: "low",
        mitigation: "白名单 + 历史行为画像",
      },
    ],
    complexity: "M",
  };
}

export function reviewAnomaly(caseText: string): AnomalyReviewResult {
  const suspicious =
    caseText.includes("注册 2 天") ||
    caseText.includes("越南") ||
    caseText.includes("3DS 失败");
  return {
    summary: suspicious
      ? "新注册用户、跨境 IP 与收货地分离、大额多件采购及支付 retry 成功，综合风险偏高。"
      : "案例存在若干弱信号，建议结合历史行为与设备指纹复核。",
    riskFindings: [
      {
        category: "风险",
        message: "注册 2 天 + 单笔 $6240 大额",
        severity: "high",
        suggestion: "人工审核身份证明与收货电话回访",
      },
      {
        category: "风险",
        message: "IP 国家与收货国不一致",
        severity: "medium",
        suggestion: "校验代理/VPN 与历史登录地",
      },
      {
        category: "风险",
        message: "支付 3DS 失败 2 次后成功",
        severity: "high",
        suggestion: "延迟发货至支付稳定 24h",
      },
    ],
    performanceIssues: ["优惠券 -30% 叠加多件，检查促销滥用规则"],
    securityIssues: ["信用卡盗刷风险", "批量采购转售嫌疑"],
    readabilityIssues: ["订单备注为空，缺少采购用途说明"],
    level: suspicious ? "block" : "review",
  };
}

export function generateComplianceReport(info: string): ComplianceReport {
  return {
    title: info.includes("月报") ? "质检与风控合规月报" : "质检风控合规报告",
    period: "2025年5月",
    summary:
      "本月 RoHS 抽检合格率 99.2%，客诉 PPM 下降 12%；风控误杀率 0.8%，大额拦截准确率 94%。",
    findings: [
      "L3 线短射缺陷导致一次批次遏制",
      "2 笔跨境大额订单经人工复核放行",
      "AQL 加严检验 3 批次，无拒收",
    ],
    recommendations: [
      "注塑模具预防性保养周期缩短 10%",
      "新市场 IP 风控规则增加收货国白名单配置",
      "下月开展 RoHS 供应商飞行检查",
    ],
  };
}

export function routeNaturalLanguage(text: string): QcMode {
  const t = text.toLowerCase();
  if (t.includes("缺陷") || t.includes("不良") || t.includes("短射")) return "defect";
  if (t.includes("抽检") || t.includes("aql") || t.includes("抽样")) return "sampling";
  if (t.includes("风控") || t.includes("规则") || t.includes("订单")) return "rule";
  if (t.includes("异常") || t.includes("审核") || t.includes("ord-")) return "anomaly";
  if (t.includes("合规") || t.includes("月报") || t.includes("rohs")) return "compliance";
  if (t.includes("标准") || t.includes("质检")) return "standard";
  return "defect";
}
