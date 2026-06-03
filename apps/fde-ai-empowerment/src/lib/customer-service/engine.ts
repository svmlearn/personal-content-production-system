import { FAQ_ITEMS, MOCK_CUSTOMER } from "./mock-data";
import { INTENT_LABELS } from "./constants";
import type {
  Conversation,
  FAQItem,
  Intent,
  IntentType,
  Message,
  PendingTicketDraft,
  QualityReport,
  StructuredReply,
  Ticket,
  TicketPriority,
} from "./types";

/** 预留：接入真实 LLM 意图分类 */
export const LLM_HOOK = {
  classifyIntent: async (message: string) => detectIntent(message),
  generateReply: async (message: string, intent: Intent) => {
    const faqs = searchFAQ(intent.type, message);
    return generateCustomerServiceReply(message, intent, faqs);
  },
};

const INTENT_RULES: { type: IntentType; patterns: string[]; weight: number }[] = [
  { type: "transfer_human", patterns: ["人工", "转人工", "真人", "客服"], weight: 1 },
  { type: "complaint", patterns: ["投诉", "不满", "差评", "维权", "太差"], weight: 0.95 },
  { type: "refund", patterns: ["退款", "退货", "售后", "取消订单"], weight: 0.9 },
  { type: "order", patterns: ["订单", "发货", "物流", "配送", "到货"], weight: 0.88 },
  { type: "technical", patterns: ["登录", "登不上", "故障", "报错", "崩溃", "慢"], weight: 0.88 },
  { type: "presales", patterns: ["价格", "收费", "报价", "企业版", "试用", "购买"], weight: 0.85 },
  { type: "account", patterns: ["账号", "密码", "权限", "子账号", "重置"], weight: 0.85 },
];

export function detectIntent(message: string): Intent {
  const text = message.toLowerCase();
  let best: IntentType = "presales";
  let bestScore = 0.3;

  for (const rule of INTENT_RULES) {
    let hits = 0;
    for (const p of rule.patterns) {
      if (message.includes(p) || text.includes(p)) hits++;
    }
    const score = hits > 0 ? rule.weight * Math.min(1, hits * 0.5 + 0.5) : 0;
    if (score > bestScore) {
      bestScore = score;
      best = rule.type;
    }
  }

  return {
    type: best,
    label: INTENT_LABELS[best],
    confidence: Math.round(bestScore * 100) / 100,
  };
}

export function searchFAQ(intent: IntentType, message: string): FAQItem[] {
  const scored = FAQ_ITEMS.map((faq) => {
    let score = faq.intent === intent ? 2 : 0;
    for (const kw of faq.keywords) {
      if (message.includes(kw)) score += 2;
    }
    return { faq, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((x) => x.faq).slice(0, 3);
}

export function shouldTransferToHuman(
  intent: IntentType,
  confidence: number,
): boolean {
  if (intent === "transfer_human" || intent === "complaint") return true;
  if (confidence < 0.55) return true;
  if (intent === "refund" && confidence < 0.75) return true;
  return false;
}

function needsFollowUp(message: string, intent: IntentType): string | null {
  if (intent === "refund" && !message.match(/\d{6,}/)) {
    return "为加快处理，请提供您的订单号（可在订单中心复制）。";
  }
  if (intent === "technical" && message.length < 12) {
    return "请补充具体报错提示或截图描述，以便精准排查。";
  }
  if (intent === "complaint") {
    return "请简要说明发生时间与涉及的产品/订单，我们将优先升级处理。";
  }
  return null;
}

export function generateCustomerServiceReply(
  message: string,
  intent: Intent,
  faqs: FAQItem[],
): {
  structured: StructuredReply;
  followUp: string | null;
  knowledgeHits: string[];
  riskFlags: string[];
  ticketDraft: PendingTicketDraft | null;
} {
  const primary = faqs[0];
  const knowledgeHits = faqs.map((f) => f.id);
  const riskFlags: string[] = [];

  if (intent.type === "complaint") riskFlags.push("客户情绪敏感");
  if (message.includes("紧急") || message.includes("马上"))
    riskFlags.push("用户表达时效诉求");

  const transfer = shouldTransferToHuman(intent.type, intent.confidence);
  const followUp = needsFollowUp(message, intent.type);

  if (!primary && !transfer) {
    return {
      structured: {
        understanding: `您的问题可能与「${intent.label}」相关，但知识库暂未命中精确条目。`,
        solution: "建议转接人工客服进一步核实，或补充更多问题细节后重试。",
        steps: ["点击「转人工」或填写下方工单", "保留相关订单号与截图"],
        policy: "—",
        needsHuman: true,
        humanReason: "知识库未命中",
      },
      followUp: "请用一句话描述您遇到的具体情况，例如订单号或报错信息。",
      knowledgeHits: [],
      riskFlags: ["低置信回答风险"],
      ticketDraft: buildTicketDraft(message, intent, "知识库未命中，需人工核实"),
    };
  }

  const understanding = primary
    ? `我理解您正在咨询【${intent.label}】相关问题：「${message.slice(0, 40)}${message.length > 40 ? "…" : ""}」`
    : `已识别为【${intent.label}】，正在为您处理。`;

  const structured: StructuredReply = {
    understanding,
    solution: primary?.answer ?? "该问题需要人工客服介入处理。",
    steps: buildSteps(intent.type, primary),
    policy: primary?.policy ?? "请参阅官网帮助中心最新政策",
    needsHuman: transfer,
    humanReason: transfer ? getHumanReason(intent.type, intent.confidence) : undefined,
  };

  const ticketDraft =
    transfer || followUp
      ? buildTicketDraft(
          message,
          intent,
          structured.solution.slice(0, 120),
        )
      : null;

  return {
    structured,
    followUp,
    knowledgeHits,
    riskFlags,
    ticketDraft,
  };
}

function buildSteps(intent: IntentType, faq?: FAQItem): string[] {
  switch (intent) {
    case "order":
      return [
        "登录控制台 → 订单中心",
        "找到对应订单查看「物流状态」",
        "若超承诺时效未发货，可一键催单或联系客户经理",
      ];
    case "refund":
      return [
        "订单中心选择需退款订单",
        "点击「申请售后」并选择退款原因",
        "提交后可在售后单跟踪审核进度",
      ];
    case "technical":
      return [
        "按 FAQ 完成缓存清理与浏览器检查",
        "企业版用户确认 VPN 已连接",
        "仍未解决则导出诊断日志并提交工单",
      ];
    case "presales":
      return [
        "留下公司与预估席位数",
        "销售顾问 1 个工作日内联系",
        "可预约产品演示与 POC 方案",
      ];
    default:
      return faq
        ? ["参考上述方案操作", "如有疑问继续在本窗口提问"]
        : ["等待人工客服接入"];
  }
}

function getHumanReason(intent: IntentType, confidence: number): string {
  if (intent === "transfer_human") return "用户主动要求人工";
  if (intent === "complaint") return "投诉类问题需主管跟进";
  if (confidence < 0.55) return "意图置信度较低";
  return "售后退款需人工审核";
}

function buildTicketDraft(
  message: string,
  intent: Intent,
  summary: string,
): PendingTicketDraft {
  const priority: TicketPriority =
    intent.type === "complaint"
      ? "urgent"
      : intent.type === "refund" || intent.type === "technical"
        ? "high"
        : "medium";

  return {
    summary: `【${intent.label}】${summary}`,
    category: intent.label,
    priority,
    contact: `${MOCK_CUSTOMER.contact} / ${MOCK_CUSTOMER.email}`,
  };
}

let ticketCounter = 1000;

export function createTicket(conversation: Conversation): Ticket {
  ticketCounter += 1;
  const lastUser = [...conversation.messages]
    .reverse()
    .find((m) => m.role === "user");
  const lastAi = [...conversation.messages]
    .reverse()
    .find((m) => m.role === "ai" && m.pendingTicket);

  const draft = lastAi?.pendingTicket;
  const intent =
    conversation.currentIntent ?? detectIntent(lastUser?.content ?? "").type;

  return {
    id: `TK-${ticketCounter}`,
    conversationId: conversation.id,
    userQuestion: lastUser?.content ?? "",
    category: draft?.category ?? INTENT_LABELS[intent],
    priority: draft?.priority ?? "medium",
    contact: draft?.contact ?? MOCK_CUSTOMER.contact,
    aiSummary: draft?.summary ?? "AI 会话摘要待补充",
    intent,
    status: "open",
    recommendedReply: generateRecommendedReply(intent, lastUser?.content ?? ""),
    createdAt: new Date().toISOString(),
  };
}

function generateRecommendedReply(intent: IntentType, question: string): string {
  const faqs = searchFAQ(intent, question);
  const base = faqs[0]?.answer ?? "您好，已收到您的问题，我们正在核实。";
  return `${base}\n\n我是人工客服小王，将继续为您跟进，预计 30 分钟内回复进展。`;
}

export function generateQualityReport(conversation: Conversation): QualityReport {
  const msgCount = conversation.messages.length;
  const hasHits = conversation.knowledgeHits.length > 0;
  const transferred = conversation.transferredToHuman;

  let score = 75;
  if (conversation.resolved) score += 10;
  if (hasHits) score += 8;
  if (transferred && conversation.resolved) score += 5;
  if (conversation.riskFlags.length > 0) score -= 5;
  if (!hasHits) score -= 15;
  score = Math.max(40, Math.min(98, score));

  const dimensions = [
    {
      label: "意图识别",
      score: conversation.currentIntent ? 85 : 60,
      comment: conversation.currentIntent
        ? `正确识别为${INTENT_LABELS[conversation.currentIntent]}`
        : "意图未明确标注",
    },
    {
      label: "知识命中",
      score: hasHits ? 88 : 45,
      comment: hasHits
        ? `命中 ${conversation.knowledgeHits.length} 条 FAQ`
        : "建议补充知识库条目",
    },
    {
      label: "解决效率",
      score: conversation.resolved ? 90 : 55,
      comment: conversation.resolved ? "会话已标记解决" : "未闭环",
    },
    {
      label: "转人工时机",
      score: transferred ? 82 : 78,
      comment: transferred
        ? "已升级人工，符合复杂场景策略"
        : "纯 AI 闭环，可降低人工成本",
    },
  ];

  const improvements: string[] = [];
  if (!hasHits)
    improvements.push("将高频未命中问题沉淀为 FAQ 并关联意图标签");
  if (conversation.riskFlags.includes("客户情绪敏感"))
    improvements.push("投诉类会话建议首响模板增加共情话术");
  if (msgCount > 8 && !conversation.resolved)
    improvements.push("多轮未解决应更早触发工单或主管介入");
  if (improvements.length === 0)
    improvements.push("保持当前话术，定期抽检 AI 推荐回复采纳率");

  return {
    conversationId: conversation.id,
    score,
    dimensions,
    improvements,
    summary: `共 ${msgCount} 条消息，${transferred ? "已转人工" : "AI 全程接待"}，${conversation.resolved ? "问题已解决" : "待跟进"}。`,
  };
}

export function processUserMessage(
  conversation: Conversation,
  userText: string,
): { messages: Message[]; conversationPatch: Partial<Conversation> } {
  const intent = detectIntent(userText);
  const faqs = searchFAQ(intent.type, userText);
  const { structured, followUp, knowledgeHits, riskFlags, ticketDraft } =
    generateCustomerServiceReply(userText, intent, faqs);

  const now = new Date().toISOString();
  const userMsg: Message = {
    id: `msg-${Date.now()}-u`,
    role: "user",
    content: userText,
    timestamp: now,
    intent: intent.type,
  };

  let aiContent = formatStructuredReply(structured);
  if (followUp) {
    aiContent += `\n\n---\n**需要您补充：** ${followUp}`;
  }

  const aiMsg: Message = {
    id: `msg-${Date.now()}-a`,
    role: "ai",
    content: aiContent,
    timestamp: new Date(Date.now() + 1).toISOString(),
    intent: intent.type,
    structuredReply: structured,
    followUp: followUp ?? undefined,
    pendingTicket: ticketDraft ?? undefined,
  };

  const transfer = shouldTransferToHuman(intent.type, intent.confidence);

  return {
    messages: [userMsg, aiMsg],
    conversationPatch: {
      currentIntent: intent.type,
      knowledgeHits: [
        ...new Set([...conversation.knowledgeHits, ...knowledgeHits]),
      ],
      riskFlags: [...new Set([...conversation.riskFlags, ...riskFlags])],
      transferredToHuman:
        conversation.transferredToHuman || transfer || intent.type === "transfer_human",
      updatedAt: now,
    },
  };
}

function formatStructuredReply(s: StructuredReply): string {
  const parts = [
    `**问题理解**\n${s.understanding}`,
    `**解决方案**\n${s.solution}`,
    `**操作步骤**\n${s.steps.map((x, i) => `${i + 1}. ${x}`).join("\n")}`,
    `**相关政策**\n${s.policy}`,
    `**人工处理**\n${s.needsHuman ? `是 — ${s.humanReason}` : "否，AI 可继续为您服务"}`,
  ];
  return parts.join("\n\n");
}

export function createInitialConversation(): Conversation {
  const now = new Date().toISOString();
  return {
    id: `conv-${Date.now()}`,
    customerId: MOCK_CUSTOMER.id,
    status: "active",
    messages: [
      {
        id: "msg-welcome",
        role: "system",
        content:
          "您好！我是智能客服小智，可解答订单、售后、技术与售前问题。复杂问题将为您创建工单或转接人工。",
        timestamp: now,
      },
    ],
    resolved: false,
    transferredToHuman: false,
    knowledgeHits: [],
    riskFlags: [],
    createdAt: now,
    updatedAt: now,
  };
}

/** 预置历史会话供主管质检 */
export function createSeedConversations(): Conversation[] {
  return [
    {
      id: "conv-seed-1",
      customerId: MOCK_CUSTOMER.id,
      status: "resolved",
      currentIntent: "order",
      satisfaction: 5,
      resolved: true,
      transferredToHuman: false,
      knowledgeHits: ["faq-order-1"],
      riskFlags: [],
      createdAt: "2025-05-20T10:00:00Z",
      updatedAt: "2025-05-20T10:08:00Z",
      messages: [
        {
          id: "s1-u",
          role: "user",
          content: "订单什么时候发货？",
          timestamp: "2025-05-20T10:01:00Z",
        },
        {
          id: "s1-a",
          role: "ai",
          content: "已告知 1-2 工作日发货政策，用户表示满意。",
          timestamp: "2025-05-20T10:02:00Z",
        },
      ],
    },
    {
      id: "conv-seed-2",
      customerId: MOCK_CUSTOMER.id,
      status: "escalated",
      currentIntent: "complaint",
      satisfaction: 2,
      resolved: false,
      transferredToHuman: true,
      ticketId: "TK-1001",
      knowledgeHits: ["faq-complaint-1"],
      riskFlags: ["客户情绪敏感"],
      createdAt: "2025-05-21T14:00:00Z",
      updatedAt: "2025-05-21T14:20:00Z",
      messages: [
        {
          id: "s2-u",
          role: "user",
          content: "你们客服态度太差了，我要投诉！",
          timestamp: "2025-05-21T14:01:00Z",
        },
        {
          id: "s2-a",
          role: "ai",
          content: "已致歉并创建 urgent 工单，转主管回访。",
          timestamp: "2025-05-21T14:03:00Z",
        },
      ],
    },
  ];
}

export function createSeedTickets(): Ticket[] {
  return [
    {
      id: "TK-1001",
      conversationId: "conv-seed-2",
      userQuestion: "你们客服态度太差了，我要投诉！",
      category: "投诉建议",
      priority: "urgent",
      contact: MOCK_CUSTOMER.contact,
      aiSummary: "【投诉建议】客户情绪敏感，需主管 4 小时内回访",
      intent: "complaint",
      status: "in_progress",
      recommendedReply:
        "陈先生您好，非常抱歉给您带来不好的体验。我是客服主管，已升级处理您的投诉，请问方便告知具体沟通时间与订单号吗？",
      createdAt: "2025-05-21T14:05:00Z",
    },
  ];
}
