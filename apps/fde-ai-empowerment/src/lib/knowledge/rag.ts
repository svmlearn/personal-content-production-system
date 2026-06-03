import { KNOWLEDGE_CHUNKS, ROLES } from "./mock-data";
import type {
  AIAnswer,
  Citation,
  Feedback,
  FeedbackType,
  KnowledgeChunk,
  User,
} from "./types";

/** 预留：接入真实向量检索时替换此实现 */
export const RAG_PIPELINE_HOOK = {
  embedQuery: async (question: string) => {
    void question;
    /* TODO: call embedding API */
    return [] as number[];
  },
  vectorSearch: async (embedding: number[], topK: number) => {
    void embedding;
    void topK;
    /* TODO: query vector DB */
    return [] as KnowledgeChunk[];
  },
};

function tokenize(text: string): string[] {
  const normalized = text.toLowerCase().replace(/[？?。，、；；]/g, " ");
  const latin = normalized.match(/[a-z0-9]+/g) ?? [];
  const cjk = text.match(/[\u4e00-\u9fff]{2,}/g) ?? [];
  return [...new Set([...latin, ...cjk.map((s) => s.toLowerCase())])];
}

export function checkPermission(user: User, chunk: KnowledgeChunk): boolean {
  const role = ROLES[user.role];
  if (!role) return false;
  return chunk.permissionLevel <= role.maxPermissionLevel;
}

export function searchKnowledgeChunks(
  question: string,
  user: User,
): { accessible: KnowledgeChunk[]; denied: KnowledgeChunk[] } {
  const tokens = tokenize(question);
  const scored = KNOWLEDGE_CHUNKS.map((chunk) => {
    let score = 0;
    for (const kw of chunk.keywords) {
      const kwLower = kw.toLowerCase();
      if (question.includes(kw)) score += 3;
      for (const t of tokens) {
        if (kwLower.includes(t) || t.includes(kwLower)) score += 1;
      }
    }
    for (const t of tokens) {
      if (chunk.content.includes(t)) score += 0.5;
    }
    return { chunk, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const accessible: KnowledgeChunk[] = [];
  const denied: KnowledgeChunk[] = [];

  for (const { chunk } of scored) {
    if (checkPermission(user, chunk)) {
      accessible.push(chunk);
    } else {
      denied.push(chunk);
    }
  }

  return { accessible: accessible.slice(0, 5), denied };
}

function chunksToCitations(chunks: KnowledgeChunk[]): Citation[] {
  return chunks.map((c) => ({
    chunkId: c.id,
    documentTitle: c.documentTitle,
    category: c.category,
    excerpt: c.content,
    updatedAt: c.updatedAt,
    section: c.section,
  }));
}

/** 预留：接入真实 LLM 时替换此实现 */
export function generateKnowledgeAnswer(
  question: string,
  matchedChunks: KnowledgeChunk[],
  options?: { deniedCount?: number },
): AIAnswer {
  const answerId = `ans-${Date.now()}`;
  const questionId = `q-${Date.now()}`;

  if (matchedChunks.length === 0) {
    if ((options?.deniedCount ?? 0) > 0) {
      return {
        id: answerId,
        questionId,
        summary: "当前账号无权访问相关资料",
        explanation:
          "系统检索到可能相关的内部文档，但您的角色权限不足，无法查看原文或生成基于该内容的回答。请联系部门主管或 IT 管理员申请权限，或通过 IT 服务台提交工单。",
        steps: [
          "确认您当前登录的角色是否正确",
          "如需访问主管级文档，请联系直属主管",
          "在 IT 服务台提交「知识库权限申请」工单",
        ],
        cautions: ["请勿通过非授权渠道获取受限文档"],
        citations: [],
        confidence: "low",
        confidenceLabel: "无法基于受限内容作答",
        noAccess: true,
        createdAt: new Date().toISOString(),
      };
    }

    return {
      id: answerId,
      questionId,
      summary: "当前知识库中未找到可靠依据",
      explanation:
        "未能在您有权限访问的知识库范围内，匹配到与问题足够相关且可溯源的内容。建议换个说法、补充关键词，或联系对应文档负责人确认是否已入库。",
      steps: [
        "检查问题是否包含制度/产品/流程等关键词",
        "在知识库管理页确认相关文档是否已索引",
        "仍无法解决时，点击「需要人工补充」反馈",
      ],
      cautions: ["请勿将未经验证的推测当作制度依据"],
      citations: [],
      confidence: "low",
      confidenceLabel: "无匹配依据 · 不建议采信",
      notFound: true,
      createdAt: new Date().toISOString(),
    };
  }

  const citations = chunksToCitations(matchedChunks);
  const primary = matchedChunks[0];
  const confidence =
    matchedChunks.length >= 2 ? "high" : matchedChunks.length === 1 ? "medium" : "low";

  const confidenceLabel =
    confidence === "high"
      ? "高置信度 · 多段来源交叉印证"
      : confidence === "medium"
        ? "中置信度 · 建议结合引用原文确认"
        : "低置信度 · 来源有限";

  return {
    id: answerId,
    questionId,
    summary: buildSummary(question, primary),
    explanation: buildExplanation(matchedChunks),
    steps: buildSteps(question, primary),
    cautions: buildCautions(primary.category),
    citations,
    confidence,
    confidenceLabel,
    createdAt: new Date().toISOString(),
  };
}

function buildSummary(question: string, chunk: KnowledgeChunk): string {
  if (question.includes("报销") || question.includes("差旅")) {
    return "国内差旅住宿与交通有明确上限，超标须主管审批；报销须在行程结束后 30 日内提交并关联 OA 出差单。";
  }
  if (question.includes("入职")) {
    return "新员工入职首周需完成合同签署、账号开通、安全培训与制度测验；试用期一般为 3 个月。";
  }
  if (question.includes("VPN") || question.includes("vpn")) {
    return "VPN 连接需使用企业客户端与 SSO+MFA；认证失败可重置密码，超时请切换备用节点或提交 IT 工单。";
  }
  if (question.includes("产品") || question.includes("功能") || question.includes("规则")) {
    return "智能审批模块对差旅报销设有自动通过与风控规则，金额阈值与异常标记会影响审批路径。";
  }
  return `根据《${chunk.documentTitle}》相关章节，已为您整理可溯源的答复要点。`;
}

function buildExplanation(chunks: KnowledgeChunk[]): string {
  return chunks
    .map(
      (c, i) =>
        `【来源 ${i + 1}：${c.documentTitle} · ${c.section}】\n${c.content}`,
    )
    .join("\n\n");
}

function buildSteps(question: string, chunk: KnowledgeChunk): string[] {
  if (chunk.category === "it" && question.includes("VPN")) {
    return [
      "安装/升级企业 VPN 客户端至 5.2 及以上版本",
      "使用 SSO 登录并完成 MFA，检查系统时间与防火墙设置",
      "认证失败：重置密码后等待 15 分钟；超时：切换 cn-east-2 节点",
      "仍失败：导出客户端诊断日志并在 IT 服务台提交工单",
    ];
  }
  if (chunk.category === "hr" && question.includes("入职")) {
    return [
      "入职首日完成合同、工卡、安全培训与账号开通",
      "第 2-5 天完成部门导师辅导与公司级新人培训",
      "试用期满前 15 日由导师与 HRBP 发起转正评估",
    ];
  }
  if (chunk.category === "hr") {
    return [
      "出差前在 OA 提交出差申请并获批准",
      "按城市级别控制住宿与交通标准，保留合规发票",
      "行程结束后 30 日内在费控系统提交报销并关联申请单",
    ];
  }
  if (chunk.category === "product") {
    return [
      "确认申请类型与金额是否满足自动通过条件",
      "检查发票验真与出差单状态",
      "若触发风控规则，按提示补充说明或等待复核",
    ];
  }
  return [
    "阅读下方引用原文核对细节",
    "如有歧义，联系文档负责人或主管部门",
    "通过反馈按钮标记答案质量以便知识库优化",
  ];
}

function buildCautions(category: KnowledgeChunk["category"]): string[] {
  const common = ["本回答基于知识库检索结果生成，制度变更以最新发布文档为准"];
  if (category === "finance" || category === "hr") {
    return [...common, "涉及金额与审批的事项，请以 OA/费控系统实际配置为准"];
  }
  if (category === "it") {
    return [...common, "请勿将账号密码或 MFA 设备告知他人"];
  }
  return common;
}

const feedbackStore = new Map<string, Feedback>();

export function submitFeedback(
  answerId: string,
  feedback: FeedbackType,
): Feedback {
  const record: Feedback = {
    answerId,
    type: feedback,
    submittedAt: new Date().toISOString(),
  };
  feedbackStore.set(answerId, record);
  return record;
}

export function getFeedback(answerId: string): Feedback | undefined {
  return feedbackStore.get(answerId);
}

export function openCitation(chunkId: string): KnowledgeChunk | null {
  return KNOWLEDGE_CHUNKS.find((c) => c.id === chunkId) ?? null;
}

export function askKnowledgeBase(question: string, user: User): AIAnswer {
  const { accessible, denied } = searchKnowledgeChunks(question, user);
  return generateKnowledgeAnswer(question, accessible, {
    deniedCount: denied.length,
  });
}
