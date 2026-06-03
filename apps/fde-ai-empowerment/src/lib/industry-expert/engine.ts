import { KNOWLEDGE_BASE } from "./mock-data";
import type {
  ExpertAnswer,
  ExpertReview,
  IndustryKnowledge,
  ProfessionalReport,
  ReportType,
  RiskItem,
  RiskLevel,
} from "./types";

/** 预留：行业知识库 / RAG / 规则引擎 / LLM / 专家审核流 */
export const EXPERT_HOOK = {
  vectorSearch: async (q: string) => {
    void q;
    return [] as IndustryKnowledge[];
  },
  ruleEngine: async (content: string) => {
    void content;
    return [] as RiskItem[];
  },
  llm: async (prompt: string) => {
    void prompt;
    return "";
  },
  workflow: async (review: ExpertReview) => {
    void review;
    return true;
  },
};

export function searchIndustryKnowledge(question: string): IndustryKnowledge[] {
  const q = question.toLowerCase();
  const scored = KNOWLEDGE_BASE.map((k) => {
    let score = 0;
    if (q.includes("合同") || q.includes("授信"))
      score += k.tags.some((t) => ["授信", "合规"].includes(t)) ? 2 : 0;
    if (q.includes("尽调") || q.includes("客户"))
      score += k.id === "k5" || k.id === "k3" ? 3 : 0;
    if (q.includes("政策") || q.includes("法规") || q.includes("新规"))
      score += k.category === "regulation" ? 2 : 0;
    if (q.includes("风险") || q.includes("aml") || q.includes("洗钱"))
      score += k.id === "k2" ? 3 : 0;
    if (q.includes("关联")) score += k.id === "k6" ? 3 : 0;
    if (q.includes("保理") || q.includes("应收")) score += k.id === "k4" ? 2 : 0;
    k.tags.forEach((t) => {
      if (q.includes(t.toLowerCase())) score += 1;
    });
    return { k, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.k)
    .slice(0, 4);
}

export function generateExpertAnswer(
  question: string,
  sources: IndustryKnowledge[],
): ExpertAnswer {
  const q = question.toLowerCase();
  let conclusion = "建议结合授信指引与最新监管要求进一步核实。";
  let riskLevel: RiskLevel = "medium";
  const analysis: string[] = [];
  const basis: string[] = [];
  const actions: string[] = [];

  if (q.includes("合同") || q.includes("风险")) {
    conclusion = "合同/授信文本存在信用结构与披露类中等偏高风险，建议补充尽调与法律意见。";
    riskLevel = "high";
    analysis.push(
      "担保覆盖与现金流匹配度需复核，关注交叉违约与财务承诺条款。",
      "应收账款质押需核实债务人确认与登记完整性。",
    );
    basis.push("本行对公授信尽职调查操作指引 V4", "商业银行资本管理办法信息披露要求");
    actions.push("法律合规部出具合同条款审查意见", "现场核实质押应收账款真实性");
  } else if (q.includes("尽调") || q.includes("客户")) {
    conclusion = "尽调应聚焦集中度、关联交易披露与应收账款质量三大主线。";
    riskLevel = "high";
    analysis.push(
      "前两大客户收入占比超 60% 触发集中度预警。",
      "未披露关联应付需穿透核查定价公允性。",
      "营收下滑与周转天数上升提示营运资金压力。",
    );
    basis.push("2025 年中小银行信用风险展望", "专家经验：关联交易识别与公允性判断");
    actions.push("获取前五大销售合同与回款流水", "补充关联关系清单并访谈财务负责人");
  } else if (q.includes("政策") || q.includes("新规") || q.includes("适用")) {
    conclusion = "新规主要适用于依法设立的银行业金融机构及特定非银机构，需对照业务范围。";
    riskLevel = "low";
    analysis.push("区分吸收存款类机构与消费金融、保理等牌照边界。", "关注过渡期安排与报送义务。");
    basis.push("反洗钱法及金融机构客户尽职调查办法");
    actions.push("合规部完成适用性清单", "更新客户尽调模板");
  } else {
    analysis.push("已检索行业知识库，建议明确业务场景（授信/投资/合规）。");
    basis.push(...sources.map((s) => s.title));
    actions.push("补充具体交易结构与金额区间");
  }

  const references = (sources.length ? sources : KNOWLEDGE_BASE.slice(0, 3)).map(
    (s) => ({
      id: s.id,
      title: s.title,
      excerpt: s.summary,
    }),
  );

  return {
    conclusion,
    analysis,
    basis,
    riskLevel,
    references,
    actions,
    disclaimer:
      "本回答由 AI 基于知识库生成，不构成法律意见或投资决策，须经持证专家复核后方可作为业务依据。",
    needsReview: requireExpertReview(riskLevel),
  };
}

export function detectProfessionalRisks(content: string): RiskItem[] {
  const risks: RiskItem[] = [];
  const add = (
    id: string,
    title: string,
    level: RiskLevel,
    description: string,
    basis: string,
    recommendation: string,
  ) => risks.push({ id, title, level, description, basis, recommendation });

  if (content.includes("下滑") || content.includes("126"))
    add(
      "r1",
      "营运与偿债能力恶化",
      "high",
      "营收下滑且应收账款周转显著拉长，现金流覆盖贷款本息存在压力。",
      "2025 年中小银行信用风险展望 · 财务指标恶化预警",
      "要求提供 13 周现金流预测与银行流水交叉验证",
    );
  if (content.includes("61") || content.includes("集中"))
    add(
      "r2",
      "客户集中度风险",
      "high",
      "前两大客户占收入过高，单一客户违约将显著冲击还款来源。",
      "本行对公授信尽职调查操作指引 · 集中度管理",
      "获取前五大客户合同、账期与历史回款记录",
    );
  if (content.includes("关联") || content.includes("未披露"))
    add(
      "r3",
      "关联交易与信息披露",
      "critical",
      "存在未披露关联应付，可能涉及利益输送或表外负债。",
      "专家经验：关联交易识别 · 反洗钱尽调办法",
      "暂停审批，完成关联图谱穿透与独立评估",
    );
  if (content.includes("质押") || content.includes("应收"))
    add(
      "r4",
      "质押品真实性",
      "medium",
      "应收账款质押需防范虚构贸易与重复质押。",
      "案例：应收账款保理违约",
      "中登网查询 + 债务人书面确认 + 抽样发票验真",
    );
  if (risks.length === 0)
    add(
      "r0",
      "一般性合规提示",
      "low",
      "未识别到关键词风险，建议结合完整材料运行规则引擎。",
      "行业专家系统默认规则集",
      "补充完整合同与财务报表后重新分析",
    );
  return risks;
}

export function generateIndustryReport(input: string): ProfessionalReport {
  const t = input.toLowerCase();
  let type: ReportType = "due_diligence";
  let title = "对公授信尽职调查摘要";

  if (t.includes("合同")) {
    type = "contract";
    title = "授信合同风险分析报告";
  } else if (t.includes("政策")) {
    type = "policy";
    title = "监管政策适配分析报告";
  } else if (t.includes("供应链") || t.includes("库存")) {
    type = "supply_chain";
    title = "供应链金融风险报告";
  } else if (t.includes("设备") || t.includes("故障")) {
    type = "equipment";
    title = "资产/设备相关风险分析报告";
  }

  const risks = detectProfessionalRisks(input);

  return {
    id: `rpt-${Date.now()}`,
    type,
    title,
    background: input.slice(0, 200) + (input.length > 200 ? "…" : ""),
    findings: [
      "主体为新能源制造链条，行业周期与价格竞争加剧。",
      "财务指标显示收入增长放缓、营运资本占用上升。",
      "担保结构以关联人保证与应收账款质押为主。",
    ],
    risks,
    basis: [
      "本行对公授信尽职调查操作指引 V4",
      "2025 年中小银行信用风险展望",
      "反洗钱法及客户尽职调查办法",
    ],
    recommendations: [
      "建议授信额度压缩 30% 或增加实物资产抵押",
      "贷款资金实行受托支付并锁定用途",
      "设置财务 covenant：资产负债率、应收账款周转天数",
    ],
    nextActions: [
      "风控委员会审议",
      "法律合规审查合同文本",
      "客户经理完成现场尽调报告",
    ],
    generatedAt: new Date().toISOString(),
    reviewStatus: requireExpertReview(
      risks.some((r) => r.level === "critical" || r.level === "high")
        ? "high"
        : "medium",
    )
      ? "pending"
      : "approved",
  };
}

export function requireExpertReview(riskLevel: RiskLevel): boolean {
  return riskLevel === "high" || riskLevel === "critical" || riskLevel === "medium";
}

export function createReviewFromAnswer(answer: ExpertAnswer): ExpertReview {
  return {
    id: `rev-${Date.now()}`,
    status: "pending",
    aiSuggestion: answer.conclusion,
  };
}

export function submitExpertReview(
  review: ExpertReview,
  expertComment: string,
  approved: boolean,
): ExpertReview {
  return {
    ...review,
    status: approved ? "approved" : "rejected",
    expertComment,
    finalConclusion: approved
      ? `【专家确认】${review.aiSuggestion}`
      : `【专家驳回】${expertComment}`,
    reviewedBy: "王专家 · 授信审批部",
    reviewedAt: new Date().toISOString(),
  };
}

export const CATEGORY_LABEL: Record<string, string> = {
  regulation: "法规标准",
  report: "行业报告",
  case: "历史案例",
  policy: "企业制度",
  expert: "专家经验",
};
