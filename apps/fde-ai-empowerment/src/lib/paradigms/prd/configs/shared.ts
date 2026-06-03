export const TEN_STEP_FLOW = [
  "用户输入任务或问题",
  "Agent 识别意图与所需权限",
  "Agent 追问或补充关键信息（若缺失）",
  "Agent 制定执行计划（检索/工具/生成）",
  "Agent 调用向量库、业务 API 或工具",
  "Agent 生成中间结果（草稿、引用列表）",
  "Agent 判断风险等级与是否需人工确认",
  "用户/主管确认后执行落库或对外动作",
  "Agent 输出结构化结果与下一步建议",
  "记录反馈、审计日志并用于优化",
];

export function defaultDataSchema(product: string): string[][] {
  return [
    ["users", "id", "uuid", "用户 ID", "是", "u_001"],
    ["users", "role", "enum", "角色权限", "是", "employee"],
    ["tasks", "id", "uuid", "任务 ID", "是", "task_8821"],
    ["tasks", "intent", "string", "任务意图", "是", "knowledge_qa"],
    ["tasks", "status", "enum", "任务状态", "是", "completed"],
    ["conversations", "task_id", "uuid", "关联任务", "是", "task_8821"],
    ["conversations", "content", "text", "对话内容", "是", "出差标准？"],
    ["agent_runs", "task_id", "uuid", "执行记录", "是", "run_001"],
    ["agent_runs", "steps", "jsonb", "步骤轨迹", "是", "[{step:retrieve}]"],
    ["tool_calls", "tool_name", "string", "工具名", "是", "search_kb"],
    ["tool_calls", "status", "enum", "调用状态", "是", "success"],
    ["knowledge", "doc_id", "string", "文档 ID", "是", "d_102"],
    ["knowledge", "chunk", "text", "切片内容", "是", "制度原文…"],
    ["feedback", "rating", "enum", "评价", "否", "up"],
    ["audit_logs", "action", "string", "审计动作", "是", `${product} 查询`],
  ];
}

export function defaultSecurity(product: string): string[] {
  return [
    "对外发送邮件、创建工单、修改权限、审批通过等动作必须用户确认",
    "机密/受限文档切片不得越权注入 Prompt；先 RBAC 过滤再检索",
    "工具调用失败：重试 1 次 → 降级为纯文本建议 → 提示人工处理",
    "禁止 Agent 自动执行未在计划中单列的高风险动作；计划需用户可见",
    "按角色控制知识库、工具、审批按钮可见性",
    `全链路 audit_logs（${product}）：谁、何时、问了什么、引用了哪些文档`,
    "回答必须附带引用片段与置信度，支持点击查看原文",
    "无引用或低置信度时明确提示「建议人工核实」，禁止编造制度条款",
  ];
}

export function defaultAcceptance(): string[][] {
  return [
    ["功能验收", "核心路径可完成提问→回答→引用→反馈；权限场景可复现"],
    ["Agent 能力", "意图识别准确率 PoC ≥85%；引用命中率可人工抽检"],
    ["数据准确性", "答案关键数字/条款与引用原文一致率 ≥95%"],
    ["响应速度", "P95 首 token <3s（检索+生成，视模型而定）"],
    ["用户体验", "结构化输出，非纯聊天流；移动端可读"],
    ["异常处理", "无权限、无结果、工具失败均有明确提示与降级"],
  ];
}

export function defaultTechStack(): string[][] {
  return [
    ["推荐架构", "Next.js 前端 + API Gateway + Agent Orchestrator + 向量库 + 业务微服务"],
    ["前端", "React、任务工作台、引用侧栏、审批组件"],
    ["后端", "任务/会话/审计服务、权限中间件"],
    ["模型层", "企业私有化 LLM 或云 API；按意图路由模型"],
    ["工具层", "Function Calling / MCP；统一工具注册表"],
    ["数据库", "PostgreSQL 业务数据；Redis 会话缓存"],
    ["知识库/RAG", "文档切片 + Embedding + 混合检索 + Rerank"],
    ["工作流", "Temporal / 自研状态机；人工确认节点"],
    ["日志监控", "OpenTelemetry + 审计表 + 质量看板"],
    ["可选栈", "LangGraph、LlamaIndex、Milvus、Pgvector"],
  ];
}

export function defaultMvp(must: string[], later: string[]): string[][] {
  return [
    ["MVP 必须做", must.join("；")],
    ["第一阶段不做", later.join("；")],
    ["后续扩展", "多模态、多语言、个性化、主动推送"],
    ["P0", "核心问答/任务 + 引用 + 权限 + 审计"],
    ["P1", "审批流、导出、管理后台"],
    ["P2", "自动优化、A/B Prompt、细粒度分析"],
    ["开发复杂度", "M ～ L（视工具与系统集成数量）"],
    ["关键风险", "幻觉、越权检索、工具误调用；需评审与沙箱"],
  ];
}

export function promptPack(role: string, domain: string) {
  return {
    system: `你是${role}。仅基于检索到的企业${domain}资料回答；无依据时明确说明。输出 JSON：{summary, steps[], citations[], confidence, needs_review}。禁止编造。`,
    intent: `分类用户输入为：query | action | clarify | chitchat。提取实体：部门、产品、时间、金额。输出 intent + slots。`,
    planning: `根据 intent 生成计划：[{step, tool, input}]。检索优先；高风险步骤标记 needs_confirm:true。`,
    tool: `在工具列表中选择唯一工具。输入必须符合 schema。失败时返回 error_code 与 user_message。`,
    result: `合并工具结果为结构化回答。每条结论绑定 citation_id。使用简洁中文。`,
    error: `向用户说明失败原因与建议操作，不暴露堆栈。提供人工入口。`,
    confirm: `生成待确认摘要：将执行的动作、影响范围、回滚方式。等待用户 approve/reject。`,
  };
}
