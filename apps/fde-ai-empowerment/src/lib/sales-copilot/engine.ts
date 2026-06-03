import { CASE_STUDIES, CUSTOMERS, OPPORTUNITIES, PRODUCT_MODULES } from "./mock-data";
import { STAGE_LABELS } from "./constants";
import type {
  Customer,
  CustomerInsight,
  FollowUpEmail,
  MeetingNote,
  NextAction,
  Opportunity,
  Proposal,
  VisitBrief,
  EmailTone,
} from "./types";

/** 预留：接入 CRM / LLM */
export const INTEGRATION_HOOK = {
  fetchCRMCustomer: async (id: string) =>
    CUSTOMERS.find((c) => c.id === id) ?? null,
  llmComplete: async (prompt: string) => {
    void prompt;
    return "";
  },
  exportProposal: async (proposal: Proposal) => {
    void proposal;
    return { url: "" };
  },
};

export function getCustomer(id: string): Customer | undefined {
  return CUSTOMERS.find((c) => c.id === id);
}

export function analyzeCustomer(customer: Customer): CustomerInsight {
  const modules = matchModules(customer);
  const competitors =
    customer.industry === "金融科技"
      ? ["竞品 B（合规套件）", "自研团队"]
      : ["竞品 A（低价方案）", "传统 OA 厂商"];

  return {
    possibleNeeds: [
      `解决「${customer.painTags[0]}」相关的${customer.industry}场景痛点`,
      modules.length > 0 ? `评估 ${modules.map((m) => m.name).join("、")}` : "流程数字化与数据打通",
      customer.stage === "proposal" ? "商务条款与实施风险澄清" : "POC 范围与成功标准对齐",
    ],
    decisionRisks: [
      customer.contacts.length < 2
        ? "决策链接触不足，建议补充业务侧影响人"
        : "已识别多角色，需分别维护技术/业务诉求",
      customer.expectedAmount > 800000
        ? "大额项目可能触发采购委员会，需提前准备 ROI"
        : "金额适中，关注实施周期与分期付款",
    ],
    entryPoints: [
      `从 ${customer.painTags.join("、")} 切入，对标 ${customer.currentSystems[0]} 替换/集成`,
      `引用 ${customer.industry} 行业案例建立信任`,
      customer.stage === "demo" || customer.stage === "proposal"
        ? "推动技术评估会，锁定集成与上线里程碑"
        : "安排 Discovery 访谈，沉淀需求清单",
    ],
    competitorRisks: competitors.map(
      (c) => `${c}：需强调实施经验、SLA 与总拥有成本而非单纯比价`,
    ),
    nextSteps: [
      `确认 ${STAGE_LABELS[customer.stage]} 阶段关键里程碑与决策人`,
      "发送拜访准备/方案摘要供客户内部传阅",
      "预约下次会议并明确待办责任人",
    ],
  };
}

function matchModules(customer: Customer): typeof PRODUCT_MODULES {
  const scores = PRODUCT_MODULES.map((m) => {
    let s = 0;
    for (const tag of customer.painTags) {
      if (m.tags.some((t) => tag.includes(t) || t.includes(tag.slice(0, 2))))
        s += 2;
    }
    if (customer.painTags.some((p) => p.includes("审批")) && m.id === "pm-1")
      s += 3;
    if (customer.painTags.some((p) => p.includes("知识")) && m.id === "pm-2")
      s += 3;
    if (customer.painTags.some((p) => p.includes("数据")) && m.id === "pm-3")
      s += 3;
    return { m, s };
  });
  return scores
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.m)
    .slice(0, 3);
}

export function generateVisitBrief(customer: Customer): VisitBrief {
  const modules = matchModules(customer);
  const industryCase = CASE_STUDIES.find((c) =>
    c.industry.includes(customer.industry.slice(0, 2)),
  ) ?? CASE_STUDIES[0];

  return {
    background: `${customer.name} 位于${customer.region}，${customer.scale}，主营${customer.industry}。当前使用 ${customer.currentSystems.join("、")}，商机阶段：${STAGE_LABELS[customer.stage]}，预计金额 ¥${(customer.expectedAmount / 10000).toFixed(0)} 万。`,
    industryTrends: [
      `${customer.industry} 行业 2025 年持续推进数字化与合规双轨建设`,
      "头部客户倾向「平台+场景」分批建设，Q3 为常见上线窗口",
      "集成能力与移动端体验成为选型关键差异点",
    ],
    likelyPains: customer.painTags.map(
      (p) => `客户已表露「${p}」，建议准备对标数据与流程图`,
    ),
    recommendedModules: modules.map((m) => `${m.name}：${m.description}`),
    questionList: [
      "本期项目必须上线的业务流程 TOP3 是什么？",
      "与现有核心系统的集成接口由谁提供、周期多久？",
      "内部验收标准与成功指标如何定义？",
      "预算审批流程与预计决策时间节点？",
      "竞品评估的权重维度（价格/品牌/实施）各占多少？",
    ],
    meetingGoals: [
      "确认 POC/一期范围与里程碑",
      "识别决策链未覆盖角色并约定引入方式",
      "获得技术评估会时间与参会名单",
    ],
    risks: [
      "竞品低价策略可能干扰商务节奏，提前准备 TCO 对比",
      customer.contacts.some((c) => c.role === "决策人")
        ? "决策人已参会，需会后 24h 内发送纪要巩固共识"
        : "决策人未到场，避免过度承诺",
      `参考案例：${industryCase.title}`,
    ],
  };
}

export function generateSolutionProposal(
  customer: Customer,
  scenario: string,
): Proposal {
  const modules = matchModules(customer);
  const cases = CASE_STUDIES.filter(
    (c) =>
      c.industry.includes(customer.industry.slice(0, 2)) ||
      modules.some((m) => c.modules.includes(m.id)),
  ).slice(0, 2);

  const scenarioPains: Record<string, string[]> = {
    digital: ["系统孤岛", "流程手工", "数据滞后"],
    security: ["合规审计", "权限分散", "操作不可追溯"],
    efficiency: ["审批慢", "重复劳动", "决策缺数据"],
  };

  return {
    background: `${customer.name} 正推进${scenario === "digital" ? "数字化转型" : scenario === "security" ? "安全合规升级" : "运营效率提升"}，处于${STAGE_LABELS[customer.stage]}阶段。`,
    pains: scenarioPains[scenario] ?? customer.painTags,
    architecture: [
      "接入层：统一门户 / 移动端 / 开放 API",
      "能力层：" + modules.map((m) => m.name).join(" + "),
      "数据层：主数据同步、审计日志、指标仓库",
      `集成层：与 ${customer.currentSystems.join("、")} 双向同步`,
    ],
    productMatch: modules.map((m) => ({
      module: m.name,
      fit: `匹配客户「${customer.painTags.find((p) => m.tags.some((t) => p.includes(t.slice(0, 2)))) ?? "核心诉求"}」`,
    })),
    implementation: [
      "第 1-2 周：需求调研与集成方案设计",
      "第 3-6 周：POC/一期开发与联调",
      "第 7-8 周：UAT、培训与灰度上线",
      "第 9 周起：运维支持与迭代路线图",
    ],
    expectedBenefits: [
      "核心流程周期缩短 40%+",
      "人工对账/查询成本显著下降",
      "管理可视化与合规可追溯",
    ],
    caseStudies: cases.map((c) => `${c.title} — ${c.outcome}`),
    nextPlan: [
      "本周：提交正式方案与报价",
      "下周：技术评估会 + 商务条款澄清",
      "两周内：确认 POC 范围与合同流程",
    ],
  };
}

export function summarizeMeeting(transcript: string): MeetingNote {
  const needs: string[] = [];
  const objections: string[] = [];
  const dms: string[] = [];
  const actions: MeetingNote["actionItems"] = [];

  if (transcript.includes("审批") || transcript.includes("报表"))
    needs.push("审批与报表系统打通，解决对账痛苦");
  if (transcript.includes("Q3") || transcript.includes("上线"))
    needs.push("Q3 上线一期，覆盖采购与费用流程");
  if (transcript.includes("预算") || transcript.includes("六七十万"))
    needs.push("预算规模约 60-70 万，需匹配分期付款方案");

  if (transcript.includes("竞品"))
    objections.push("竞品 A 报价更低，客户关注价格对比");
  if (transcript.includes("风险") || transcript.includes("实施"))
    objections.push("更关注上线风险与售后服务能力");

  const nameMatches = transcript.match(/[\u4e00-\u9fa5]{2,3}(?=：)/g);
  if (nameMatches) {
    const unique = [...new Set(nameMatches)].filter(
      (n) => !["我方", "会议", "参会"].includes(n),
    );
    dms.push(...unique.slice(0, 4).map((n) => `${n}（客户方）`));
  }

  if (transcript.includes("周三") && transcript.includes("文档"))
    actions.push({
      task: "客户提供现有流程文档",
      owner: "王芳",
      due: "周三前",
    });
  if (transcript.includes("下周") && transcript.includes("技术评估"))
    actions.push({
      task: "安排技术评估会，准备集成方案与案例",
      owner: "我方售前",
      due: "下周",
    });
  if (transcript.includes("POC"))
    actions.push({
      task: "输出 4 周 POC 方案",
      owner: "李明",
      due: "3 个工作日内",
    });

  return {
    customerNeeds: needs.length ? needs : ["待从纪要中进一步结构化需求"],
    objections: objections.length ? objections : ["暂无明确异议记录"],
    decisionMakers: dms.length ? dms : ["需补充决策人信息"],
    actionItems: actions.length
      ? actions
      : [{ task: "发送会议纪要与下一步计划", owner: "销售", due: "24h 内" }],
    followUpSuggestion:
      "24 小时内发送纪要确认邮件，附 POC 范围草案与制造业案例一页纸；推动技术评估会排期。",
  };
}

export function generateFollowUpEmail(
  customer: Customer,
  meeting: MeetingNote,
  tone: EmailTone = "formal",
): FollowUpEmail {
  const contact = customer.contacts.find((c) => c.role === "决策人") ?? customer.contacts[0];
  const greeting =
    tone === "friendly"
      ? `您好 ${contact?.name ?? ""}：`
      : tone === "concise"
        ? `${contact?.name ?? "负责人"} 您好：`
        : `尊敬的 ${contact?.name ?? "负责人"}：`;

  const needsList = meeting.customerNeeds.map((n) => `· ${n}`).join("\n");
  const actionsList = meeting.actionItems
    .map((a) => `· ${a.task}（${a.owner}，${a.due}）`)
    .join("\n");

  const closing =
    tone === "friendly"
      ? "期待下次碰面，随时微信沟通～\n张伟 | 客户成功团队"
      : tone === "concise"
        ? "张伟\n高级客户经理"
        : "如有补充或调整，欢迎随时指正。\n\n此致\n敬礼\n\n张伟\n高级客户经理 | 某某科技";

  const body = `${greeting}

感谢今日与 ${customer.name} 团队的交流。纪要要点如下：

【需求共识】
${needsList}

【后续安排】
${actionsList}

【建议下一步】
${meeting.followUpSuggestion}

${closing}`;

  const subject =
    tone === "concise"
      ? `【跟进】${customer.name} 会议纪要`
      : `【${customer.name}】会议纪要确认与下一步安排 — ${new Date().toLocaleDateString("zh-CN")}`;

  return { subject, body, tone };
}

export function recommendNextAction(opportunity: Opportunity): NextAction[] {
  const customer = CUSTOMERS.find((c) => c.id === opportunity.customerId);
  const actions: NextAction[] = [];

  switch (opportunity.stage) {
    case "proposal":
      actions.push({
        id: `act-${opportunity.id}-1`,
        opportunityId: opportunity.id,
        customerName: customer?.name ?? "",
        title: "发送正式方案与 ROI 测算",
        reason: "商机已进入报价阶段，需推动商务决策",
        priority: "high",
        dueDate: "今日",
      });
      break;
    case "demo":
      actions.push({
        id: `act-${opportunity.id}-1`,
        opportunityId: opportunity.id,
        customerName: customer?.name ?? "",
        title: "确认技术评估会时间与参会人",
        reason: "演示后需锁定技术认可",
        priority: "high",
        dueDate: "今日",
      });
      break;
    default:
      actions.push({
        id: `act-${opportunity.id}-1`,
        opportunityId: opportunity.id,
        customerName: customer?.name ?? "",
        title: "安排 Discovery 需求访谈",
        reason: "早期商机需沉淀痛点与预算",
        priority: "medium",
        dueDate: "3 日内",
      });
  }

  if (opportunity.probability < 50) {
    actions.push({
      id: `act-${opportunity.id}-2`,
      opportunityId: opportunity.id,
      customerName: customer?.name ?? "",
      title: "补充决策链联系人",
      reason: "赢率偏低，需扩大覆盖",
      priority: "medium",
      dueDate: "本周",
    });
  }

  return actions;
}

export function recommendAllActions(): NextAction[] {
  return OPPORTUNITIES.flatMap(recommendNextAction).slice(0, 6);
}

export function parseNaturalLanguage(
  input: string,
  customer: Customer,
): { route: "insight" | "proposal" | "email"; message: string } {
  const t = input.toLowerCase();
  if (t.includes("方案") || t.includes("售前"))
    return { route: "proposal", message: "已为您跳转方案生成，并预选当前客户。" };
  if (t.includes("邮件") || t.includes("纪要") || t.includes("跟进"))
    return { route: "email", message: "已跳转跟进邮件，请先确认会议纪要。" };
  return {
    route: "insight",
    message: `已为 ${customer.name} 刷新 AI 客户洞察。`,
  };
}
