import { DOCUMENTS } from "./mock-data";
import type {
  AIAnswer,
  Approval,
  Chunk,
  Task,
  TaskIntent,
  ToolCall,
  User,
  UserRole,
} from "./types";

/** 预留：LLM / 向量库 / 企业 API / 权限系统 */
export const WORKBENCH_HOOK = {
  llmChat: async (messages: unknown[]) => {
    void messages;
    return "";
  },
  vectorDb: async (query: string) => {
    void query;
    return [] as Chunk[];
  },
  erpApi: async (path: string) => {
    void path;
    return null;
  },
  authz: async (userId: string, resource: string, action: string) => {
    void userId;
    void resource;
    void action;
    return true;
  },
};

export function checkPermission(
  role: UserRole,
  resource: string,
  action: "read" | "write" | "approve" | "admin",
): boolean {
  const map: Record<UserRole, Record<string, string[]>> = {
    employee: { knowledge: ["read"], task: ["read", "write"] },
    manager: { knowledge: ["read"], task: ["read", "write", "approve"] },
    admin: {
      knowledge: ["read", "write", "admin"],
      task: ["read", "write", "approve", "admin"],
      audit: ["read", "admin"],
    },
  };
  return map[role][resource]?.includes(action) ?? false;
}

export function classifyIntent(input: string): TaskIntent {
  const t = input.toLowerCase();
  if (t.includes("风险") || t.includes("审核") || t.includes("授信"))
    return "risk_review";
  if (t.includes("生成") || t.includes("文档") || t.includes("纪要") || t.includes("方案"))
    return "doc_gen";
  if (t.includes("分析") || t.includes("gmv") || t.includes("指标") || t.includes("数据"))
    return "data_analysis";
  if (t.includes("开通") || t.includes("流程") || t.includes("分配") || t.includes("agent"))
    return "agent_task";
  return "knowledge_qa";
}

export function ragSearch(query: string, role: UserRole): Chunk[] {
  const chunks: Chunk[] = [
    {
      id: "c1",
      documentId: "d1",
      content: "国内出差住宿标准：一线城市 600 元/晚，二线城市 450 元/晚，需关联已批准出差申请。",
      score: 0.92,
    },
    {
      id: "c2",
      documentId: "d2",
      content: "Q2 GMV 目标同比 +15%，重点关注新客转化与复购率，周报需拆解渠道贡献。",
      score: 0.85,
    },
    {
      id: "c3",
      documentId: "d3",
      content: "单笔授信超过 300 万需风控委员会审议，须完成现场尽调与关联交易披露。",
      score: 0.88,
    },
  ];
  const filtered = chunks.filter((c) => {
    const doc = DOCUMENTS.find((d) => d.id === c.documentId);
    if (!doc) return true;
    if (doc.sensitivity === "confidential" && role === "employee") return false;
    return true;
  });
  const q = query.toLowerCase();
  if (q.includes("报销") || q.includes("出差"))
    return filtered.filter((c) => c.documentId === "d1");
  if (q.includes("gmv") || q.includes("运营"))
    return filtered.filter((c) => c.documentId === "d2");
  if (q.includes("授信") || q.includes("风险"))
    return filtered.filter((c) => c.documentId === "d3");
  return filtered.slice(0, 2);
}

export function generateAnswer(
  task: Task,
  chunks: Chunk[],
  user: User,
): AIAnswer {
  const intent = task.intent;
  let summary = "已根据企业知识库与业务规则生成建议。";
  const sections: { title: string; body: string }[] = [];
  let needsApproval = false;
  let riskLevel = task.riskLevel;

  switch (intent) {
    case "knowledge_qa":
      summary = chunks[0]?.content.slice(0, 80) ?? "未检索到足够依据，建议联系主管部门。";
      sections.push(
        { title: "结论", body: summary },
        {
          title: "操作步骤",
          body: "1. 在 OA 提交出差申请\n2. 保留合规发票\n3. 30 日内完成报销",
        },
      );
      break;
    case "doc_gen":
      summary = "已生成文档草稿，可编辑后导出。";
      sections.push(
        { title: "文档标题", body: `【草稿】${task.input.slice(0, 30)}` },
        {
          title: "正文大纲",
          body: "一、背景\n二、客户诉求\n三、方案要点\n四、下一步计划",
        },
      );
      break;
    case "data_analysis":
      summary = "GMV 环比下降 8%，主因新客转化 -12% 与大促后复购回落。";
      sections.push(
        { title: "关键指标", body: "GMV · 新客 CAC · 复购率 · 客单价" },
        { title: "归因", body: "渠道：信息流 ROI 下降；产品：主力 SKU 缺货 3 天" },
        { title: "建议", body: "加大高 ROI 渠道预算；补货并推送复购券" },
      );
      break;
    case "agent_task":
      summary = "Agent 已拆解 4 步子任务，其中 2 步需人工确认。";
      sections.push(
        { title: "子任务", body: "创建账号 → 分配角色 → 绑定课程 → 发送通知" },
        { title: "待确认", body: "权限包「销售-标准」需主管审批" },
      );
      needsApproval = true;
      riskLevel = "medium";
      break;
    case "risk_review":
      summary = "识别 3 项中高风险，建议暂缓批复。";
      sections.push(
        { title: "风险摘要", body: "客户集中度偏高；关联交易未完整披露" },
        { title: "建议动作", body: "补充尽调 · 风控委员会审议" },
      );
      needsApproval = true;
      riskLevel = "high";
      break;
  }

  if (user.role === "employee" && intent === "risk_review") {
    summary = "权限不足：机密风控文档不可直接生成结论，已转主管复核队列。";
    needsApproval = true;
  }

  return {
    id: `ans-${Date.now()}`,
    taskId: task.id,
    summary,
    sections,
    citations: chunks,
    confidence: chunks.length ? 0.86 : 0.55,
    recommendations: getRecommendations(intent),
    editableContent: sections.map((s) => `## ${s.title}\n${s.body}`).join("\n\n"),
    needsApproval: needsApproval || riskLevel === "high",
  };
}

export function decomposeAgentTask(input: string): ToolCall[] {
  void input;
  return [
    {
      id: "t1",
      tool: "hr.createUser",
      input: { email: "newhire@corp.com", dept: "销售" },
      output: "用户 uid=8821 已创建",
      status: "success",
    },
    {
      id: "t2",
      tool: "iam.assignRole",
      input: { uid: "8821", role: "sales-standard" },
      output: "等待审批",
      status: "pending",
    },
    {
      id: "t3",
      tool: "lms.enrollCourse",
      input: { uid: "8821", course: "入职路径" },
      output: "已加入学习路径",
      status: "success",
    },
    {
      id: "t4",
      tool: "notify.sendEmail",
      input: { to: "newhire@corp.com" },
      output: "欢迎邮件已排队",
      status: "success",
    },
  ];
}

export function detectRisks(content: string): { title: string; level: string }[] {
  const risks: { title: string; level: string }[] = [];
  if (content.includes("500") || content.includes("授信"))
    risks.push({ title: "大额授信超权限阈值", level: "high" });
  if (content.includes("关联"))
    risks.push({ title: "关联交易披露不完整", level: "high" });
  if (content.includes("折扣") || content.includes("价格"))
    risks.push({ title: "折扣突破价政红线", level: "medium" });
  if (!risks.length) risks.push({ title: "未识别显性风险", level: "low" });
  return risks;
}

export function getRecommendations(intent: TaskIntent): string[] {
  const map: Record<TaskIntent, string[]> = {
    knowledge_qa: ["查看完整制度 PDF", "发起合规咨询工单"],
    doc_gen: ["提交法务审核", "同步至项目空间"],
    data_analysis: ["下钻渠道明细", "创建增长实验"],
    agent_task: ["主管审批权限包", "查看审计日志"],
    risk_review: ["安排现场尽调", "录入风控委员会议程"],
  };
  return map[intent];
}

export function createTask(
  input: string,
  intent: TaskIntent,
  user: User,
): Task {
  const risks = detectRisks(input);
  const riskLevel = risks.some((r) => r.level === "high")
    ? "high"
    : risks.some((r) => r.level === "medium")
      ? "medium"
      : "low";
  return {
    id: `task-${Date.now()}`,
    intent,
    title: input.slice(0, 48) + (input.length > 48 ? "…" : ""),
    input,
    status: riskLevel === "high" ? "pending_approval" : "draft",
    createdAt: new Date().toISOString(),
    createdBy: user.name,
    riskLevel,
  };
}

export function createApproval(taskId: string): Approval {
  return {
    id: `apv-${Date.now()}`,
    taskId,
    status: "pending",
  };
}

export function resolveApproval(
  approval: Approval,
  approved: boolean,
  approver: string,
  comment: string,
): Approval {
  return {
    ...approval,
    status: approved ? "approved" : "rejected",
    approver,
    comment,
    at: new Date().toISOString(),
  };
}

export function exportAnswerMarkdown(answer: AIAnswer): string {
  const cites = answer.citations
    .map((c) => `- [${c.documentId}] ${c.content}`)
    .join("\n");
  return `# ${answer.summary}\n\n${answer.editableContent ?? ""}\n\n## 引用\n${cites}\n\n> 数据安全提示：导出内容仍受企业 DLP 策略约束。`;
}
