import type { Paradigm } from "./types";

/**
 * 范式注册表：每收到一段提示词，在此追加一条并设置 status: "live"，
 * 同时在 src/demos/ 下实现对应 demo 组件。
 */
export const paradigms: Paradigm[] = [
  {
    id: "p01",
    slug: "paradigm-01",
    title: "企业知识库",
    subtitle: "可溯源的 AI 知识问答",
    description:
      "面向企业员工的 AI 知识助手：基于制度、SOP、产品文档与 FAQ 进行自然语言问答，答案附带引用来源与权限控制模拟。",
    category: "product",
    status: "live",
    order: 1,
    tags: ["RAG", "知识库", "权限", "ToB"],
    demoLayout: "immersive",
    prompt:
      "开发「企业知识库 AI 问答系统」Web Demo：工作台提问、结构化回答（结论/步骤/引用/置信度）、引用抽屉、知识库管理、三角色权限模拟、本地 Mock RAG（searchKnowledgeChunks / generateKnowledgeAnswer / checkPermission 等）。",
  },
  {
    id: "p02",
    slug: "paradigm-02",
    title: "智能客服",
    subtitle: "ToB 服务支持 AI 与坐席协同",
    description:
      "AI 客服聊天、意图识别、FAQ 检索、工单创建、坐席工作台与主管质检一体化 Demo，模拟转人工与质检评分逻辑。",
    category: "operations",
    status: "live",
    order: 2,
    tags: ["客服", "工单", "意图识别", "质检"],
    demoLayout: "immersive",
    prompt:
      "开发 ToB 智能客服 Demo：客户咨询三栏布局、结构化 AI 回答、意图识别、工单卡片、坐席工作台、主管质检；Mock 函数 detectIntent / searchFAQ / generateCustomerServiceReply / shouldTransferToHuman / createTicket / generateQualityReport。",
  },
  {
    id: "p03",
    slug: "paradigm-03",
    title: "销售 Copilot",
    subtitle: "售前拜访 · 方案 · 纪要 · 跟进",
    description:
      "面向 ToB 销售与售前的 AI 工作台：客户 360 洞察、拜访准备、方案生成、会议纪要解析与跟进邮件，一站式 mock 销售协同流程。",
    category: "sales",
    status: "live",
    order: 3,
    tags: ["销售", "售前", "CRM", "Copilot"],
    demoLayout: "immersive",
    prompt:
      "开发销售/售前 AI Copilot：工作台、客户360、拜访准备、方案生成、会议纪要、跟进邮件；Mock 函数 analyzeCustomer / generateVisitBrief / generateSolutionProposal / summarizeMeeting / generateFollowUpEmail / recommendNextAction。",
  },
  {
    id: "p04",
    slug: "paradigm-04",
    title: "运营增长 Copilot",
    subtitle: "指标洞察 · 活动方案 · 复盘",
    description:
      "面向运营与增长团队的 AI 分析助手：核心指标看板、异常归因、自然语言分析、活动方案与复盘报告生成。",
    category: "operations",
    status: "live",
    order: 4,
    tags: ["增长", "运营", "数据分析", "活动"],
    demoLayout: "immersive",
    prompt:
      "开发运营 Copilot Demo：指标看板、异常洞察、NL 分析、活动方案、复盘报告；Mock detectAnomalies / analyzeMetric / generateCampaignPlan / generateReviewReport 等。",
  },
  {
    id: "p05",
    slug: "paradigm-05",
    title: "数据分析 BI Copilot",
    subtitle: "指标语义层 · NL2SQL · 增长分析",
    description:
      "面向数据与运营团队的 BI Copilot：指标目录、异常诊断、智能分析、SQL 实验室、漏斗看板，并覆盖活动策略与复盘（含 generateGrowthStrategy）。",
    category: "engineering",
    status: "live",
    order: 5,
    tags: ["BI", "数据分析", "SQL", "指标"],
    demoLayout: "immersive",
    prompt:
      "运营/BI Copilot：指标看板、异常洞察、NL 分析、活动方案、复盘；BI 扩展指标语义层、generateSQL、漏斗分析；复用 growth-copilot 分析引擎。",
  },
  {
    id: "p06",
    slug: "paradigm-06",
    title: "流程自动化 Agent",
    subtitle: "任务拆解 · 工具调用 · 人工确认",
    description:
      "企业流程执行 Agent：自然语言下达目标，自动拆解步骤、调用模拟 OA/ERP 工具、表单填充、高风险确认与审计日志。",
    category: "operations",
    status: "live",
    order: 6,
    tags: ["Agent", "流程", "审批", "自动化"],
    demoLayout: "immersive",
    prompt:
      "企业流程自动化 Agent：工作台、任务拆解、执行时间线、mock tools、人工确认、表单填充、审计日志；parseTaskGoal / planSteps / executeStep / callMockTool 等。",
  },
  {
    id: "p07",
    slug: "paradigm-07",
    title: "AI 文档生成",
    subtitle: "模板 · 大纲 · 正文 · 引用 · 审批",
    description:
      "企业 AI 文档生产工具：多类型模板、结构化输入、大纲生成、分节正文、引用溯源、导出模拟与标书/合同审批流。",
    category: "product",
    status: "live",
    order: 7,
    tags: ["文档", "写作", "模板", "审批"],
    demoLayout: "immersive",
    prompt:
      "企业 AI 文档生成：7 类文档、表单、大纲调整、章节生成与润色、引用来源、Word/PPT/PDF 导出模拟、审批流程；generateDocumentOutline / generateSectionContent 等。",
  },
  {
    id: "p08",
    slug: "paradigm-08",
    title: "会议 Copilot",
    subtitle: "转写 · 纪要 · 待办 · 决策",
    description:
      "会议智能助手：说话人转写、AI 纪要、Action Items、决策记录、质量分析与项目/日程同步模拟。",
    category: "product",
    status: "live",
    order: 8,
    tags: ["会议", "纪要", "待办", "协作"],
    demoLayout: "immersive",
    prompt:
      "AI 会议 Copilot：会议列表、转写、纪要生成、待办/决策提取、质量分析、同步模拟；transcribeMeeting / summarizeMeeting / extractActionItems 等。",
  },
  {
    id: "p09",
    slug: "paradigm-09",
    title: "研发 Copilot",
    subtitle: "需求 · 代码 · 测试 · 日志 · Review",
    description:
      "研发 DevOps AI 助手：需求拆解、代码解释、测试用例、日志排障、Code Review 与接口文档生成，结构化输出可接入仓库与 CI。",
    category: "engineering",
    status: "live",
    order: 9,
    tags: ["研发", "DevOps", "测试", "CR"],
    demoLayout: "immersive",
    prompt:
      "研发 Copilot：六模块 + NL 路由；analyzeRequirement / explainCode / generateTestCases / analyzeLogs / reviewCode / generateApiDoc。",
  },
  {
    id: "p10",
    slug: "paradigm-10",
    title: "质检风控 Copilot",
    subtitle: "标准 · 缺陷 · 抽检 · 规则 · 审核",
    description:
      "面向质检与风控团队：标准解读、缺陷根因、抽检方案、风控规则诊断、异常单审核与合规报告，可对接 MES 与风控引擎。",
    category: "operations",
    status: "live",
    order: 10,
    tags: ["质检", "风控", "合规", "抽检"],
    demoLayout: "immersive",
    prompt:
      "质检风控：interpretStandard / analyzeDefect / generateSamplingPlan / diagnoseRiskRule / reviewAnomaly / generateComplianceReport。",
  },
  {
    id: "p11",
    slug: "paradigm-11",
    title: "AI 培训成长平台",
    subtitle: "路径 · 问答 · 陪练 · 测验 · 报告",
    description:
      "企业 AI 学习与陪练：岗位路径、知识问答、场景陪练、自动出题评分、个人报告与 HR 管理看板，形成学习闭环。",
    category: "organization",
    status: "live",
    order: 11,
    tags: ["培训", "陪练", "L&D", "成长"],
    demoLayout: "immersive",
    prompt:
      "培训平台：generateLearningPath / answerTrainingQuestion / simulateRoleplay / scoreRoleplay / generateQuiz / gradeQuiz / generateLearningReport。",
  },
  {
    id: "p12",
    slug: "paradigm-12",
    title: "金融 AI 专家系统",
    subtitle: "问答 · 知识库 · 风险 · 报告 · 复核",
    description:
      "垂直行业专家助手：可引用知识库的专业问答、风险识别、尽调/合同等报告生成，以及中高风险必经的专家人机协同复核。",
    category: "product",
    status: "live",
    order: 12,
    tags: ["金融", "风控", "专家系统", "合规"],
    demoLayout: "immersive",
    prompt:
      "行业专家：searchIndustryKnowledge / generateExpertAnswer / detectProfessionalRisks / generateIndustryReport / requireExpertReview / submitExpertReview。",
  },
  {
    id: "p13",
    slug: "paradigm-13",
    title: "ToB 通用 AI 工作台",
    subtitle: "范式编排 · 权限 · 审计 · 审批",
    description:
      "跨行业可配置的 ToB LLM 应用模板：统一工作台嵌入业务流程，集成 RAG、文档、分析、Agent、风控与人工审批、引用溯源及审计日志。",
    category: "strategy",
    status: "live",
    order: 13,
    tags: ["通用范式", "SaaS", "Agent", "合规"],
    demoLayout: "immersive",
    prompt:
      "ToB 通用：classifyIntent / ragSearch / generateAnswer / decomposeAgentTask / detectRisks / 审批与 WORKBENCH_HOOK。",
  },
];

export function getParadigmBySlug(slug: string): Paradigm | undefined {
  return paradigms.find((p) => p.slug === slug);
}

export function getLiveParadigmCount(): number {
  return paradigms.filter((p) => p.status === "live").length;
}
