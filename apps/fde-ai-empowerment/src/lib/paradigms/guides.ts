import type { ParadigmGuide } from "./guide-types";

const guides: ParadigmGuide[] = [
  {
    slug: "paradigm-01",
    highlights: [
      "RAG 检索增强，答案可引用原文",
      "三角色权限模拟（员工/主管/管理员）",
      "结构化回答：结论、步骤、引用、置信度",
      "知识库管理与引用抽屉",
    ],
    introduction:
      "企业知识库 AI 问答将分散在制度、SOP、产品手册与 FAQ 中的知识统一检索，让员工用自然语言快速获得可溯源、可审计的答案，降低对资深同事和人工检索的依赖。",
    logic: {
      flow: ["用户提问", "权限校验", "向量检索 Chunk", "拼装 Prompt", "生成结构化回答", "展示引用"],
      modules: ["工作台提问", "回答面板", "引用抽屉", "知识库列表", "权限模拟"],
      mockFunctions: ["searchKnowledgeChunks", "generateKnowledgeAnswer", "checkPermission"],
    },
    llmRole: [
      "理解自然语言问题并改写检索 query",
      "基于检索片段生成简洁结论与操作步骤",
      "避免幻觉，强制引用来源",
      "评估回答置信度",
    ],
    suitableProjects: ["企业内网知识门户", "制度合规助手", "IT/HR 智能问答"],
    suitableIndustries: ["制造业", "金融", "互联网", "大型集团", "政府与事业单位"],
  },
  {
    slug: "paradigm-02",
    highlights: [
      "客户/坐席/主管三视图",
      "意图识别 + FAQ 检索",
      "转人工与工单创建",
      "质检评分与复盘",
    ],
    introduction:
      "ToB 智能客服在 AI 自动应答与人工坐席之间建立协同：AI 处理高频标准问题，复杂场景转人工，主管侧完成质检与知识回流，形成服务闭环。",
    logic: {
      flow: ["消息入站", "detectIntent", "FAQ 检索", "生成回复", "转人工判断", "工单/质检"],
      modules: ["客户聊天", "坐席工作台", "主管质检", "工单卡片"],
      mockFunctions: ["detectIntent", "searchFAQ", "generateCustomerServiceReply", "shouldTransferToHuman", "createTicket"],
    },
    llmRole: [
      "多轮对话理解与意图分类",
      "基于 FAQ 生成礼貌、专业的回复",
      "判断何时转人工",
      "从会话生成质检要点",
    ],
    suitableProjects: ["B2B SaaS 客服", "设备厂商售后", "运营商/云厂商工单"],
    suitableIndustries: ["软件/SaaS", "硬件制造", "电信", "企业服务"],
  },
  {
    slug: "paradigm-03",
    highlights: [
      "客户 360 洞察",
      "拜访准备与方案生成",
      "会议纪要解析",
      "跟进邮件与下一步推荐",
    ],
    introduction:
      "销售 Copilot 贯穿售前全流程：会前准备、方案撰写、会后跟进一体化，让销售把时间花在客户关系而非重复文档劳动上。",
    logic: {
      flow: ["选择客户", "analyzeCustomer", "生成拜访 brief", "会后纪要", "跟进邮件", "推荐 next action"],
      modules: ["工作台导航", "客户 360", "拜访/方案/纪要/邮件视图"],
      mockFunctions: ["analyzeCustomer", "generateVisitBrief", "generateSolutionProposal", "summarizeMeeting", "generateFollowUpEmail"],
    },
    llmRole: [
      "从客户数据提炼洞察与风险",
      "生成个性化方案叙事",
      "会议纪要结构化抽取",
      "撰写符合语气的跟进邮件",
    ],
    suitableProjects: ["CRM 嵌入式 Copilot", "售前知识助手", "渠道销售赋能"],
    suitableIndustries: ["企业软件", "工业品", "云服务", "专业服务"],
  },
  {
    slug: "paradigm-04",
    highlights: [
      "核心指标看板",
      "异常自动发现",
      "自然语言指标分析",
      "活动方案与复盘报告",
    ],
    introduction:
      "运营增长 Copilot 将数据看板与自然语言分析结合，帮助运营人员快速定位异常、制定活动策略并输出复盘，缩短从数据到决策的路径。",
    logic: {
      flow: ["拉取指标", "detectAnomalies", "用户 NL 提问", "analyzeMetric", "生成活动/复盘"],
      modules: ["Dashboard", "异常", "分析", "活动", "复盘"],
      mockFunctions: ["detectAnomalies", "analyzeMetric", "generateCampaignPlan", "generateReviewReport"],
    },
    llmRole: [
      "解读指标变化与可能原因",
      "生成活动创意与预算分配建议",
      "撰写结构化复盘报告",
    ],
    suitableProjects: ["增长中台", "电商运营后台", "市场自动化平台"],
    suitableIndustries: ["电商", "本地生活", "游戏", "订阅制 SaaS"],
  },
  {
    slug: "paradigm-05",
    highlights: [
      "指标语义层 / 指标目录",
      "NL2SQL 实验室",
      "漏斗与趋势分析",
      "复用增长分析引擎",
    ],
    introduction:
      "BI Copilot 面向数据分析师与运营：在统一指标语义层上支持自然语言查数、SQL 生成与可视化解读，降低取数门槛并保证口径一致。",
    logic: {
      flow: ["指标目录", "NL 问题", "generateSQL/语义查询", "执行", "图表+解读"],
      modules: ["看板", "目录", "SQL Lab", "漏斗", "分析/复盘"],
      mockFunctions: ["generateSQL", "analyzeMetric", "generateGrowthStrategy"],
    },
    llmRole: [
      "将自然语言映射到指标与维度",
      "生成可审查的 SQL",
      "对查询结果做业务解读",
    ],
    suitableProjects: ["嵌入式 BI", "数据中台", "运营驾驶舱"],
    suitableIndustries: ["零售", "金融", "互联网", "连锁品牌"],
  },
  {
    slug: "paradigm-06",
    highlights: [
      "自然语言目标 → 任务拆解",
      "Mock 工具调用（OA/ERP）",
      "高风险人工确认",
      "审计日志全留痕",
    ],
    introduction:
      "流程自动化 Agent 让用户用一句话描述业务目标，由 Agent 规划步骤、调用企业系统工具，并在关键节点要求人工确认，兼顾效率与合规。",
    logic: {
      flow: ["parseTaskGoal", "planSteps", "executeStep", "callMockTool", "人工确认", "审计"],
      modules: ["工作台", "时间线", "确认卡", "表单", "审计面板"],
      mockFunctions: ["parseTaskGoal", "planSteps", "executeStep", "callMockTool"],
    },
    llmRole: [
      "理解目标并拆解为可执行步骤",
      "选择合适工具与参数",
      "生成表单字段填充建议",
      "向用户解释每步风险",
    ],
    suitableProjects: ["企业超级自动化", "RPA+LLM", "飞书/钉钉工作流增强"],
    suitableIndustries: ["集团总部", "制造业", "金融", "政务"],
  },
  {
    slug: "paradigm-07",
    highlights: [
      "7 类企业文档模板",
      "大纲 → 分节生成",
      "引用溯源",
      "导出与审批流",
    ],
    introduction:
      "AI 文档生成面向标书、方案、合同、纪要等高频文档，从结构化输入到大纲、正文、引用与审批，形成企业级内容生产流水线。",
    logic: {
      flow: ["选类型", "填表单", "generateOutline", "逐节 generateSection", "引用", "审批/导出"],
      modules: ["类型选择", "表单", "大纲", "编辑器", "来源抽屉"],
      mockFunctions: ["generateDocumentOutline", "generateSectionContent"],
    },
    llmRole: [
      "根据输入生成逻辑清晰的大纲",
      "按企业文风撰写章节",
      "标注引用来源",
      "润色与格式统一",
    ],
    suitableProjects: ["投标平台", "合同管理系统", "知识写作中台"],
    suitableIndustries: ["软件", "工程咨询", "医药", "政府采购"],
  },
  {
    slug: "paradigm-08",
    highlights: [
      "说话人分离转写",
      "纪要 / 待办 / 决策提取",
      "会议质量分析",
      "项目与日程同步模拟",
    ],
    introduction:
      "会议 Copilot 将录音或实时转写转化为可执行的纪要、待办与决策记录，并评估会议效率，减少会后整理时间。",
    logic: {
      flow: ["录音/转写", "summarizeMeeting", "extractActionItems", "质量分析", "同步"],
      modules: ["会议列表", "转写", "纪要", "待办", "决策", "质量"],
      mockFunctions: ["transcribeMeeting", "summarizeMeeting", "extractActionItems", "extractDecisions"],
    },
    llmRole: [
      "长文本摘要与结构化",
      "识别决策与责任人",
      "生成待办与截止日期建议",
      "评估会议议题覆盖度",
    ],
    suitableProjects: ["视频会议插件", "项目协作工具", "CRM 活动记录"],
    suitableIndustries: ["互联网", "咨询", "金融", "研发型企业"],
  },
  {
    slug: "paradigm-09",
    highlights: [
      "六模块：需求/代码/测试/日志/CR/API",
      "自然语言智能路由",
      "结构化研发输出",
      "DEV_HOOK 预留 CI/仓库/LLM",
    ],
    introduction:
      "研发 Copilot 覆盖需求拆解、代码理解、测试用例、日志排障、Code Review 与接口文档，帮助研发团队降低上下文切换成本。",
    logic: {
      flow: ["选模块/NL 路由", "输入材料", "engine 函数", "结构化结果面板"],
      modules: ["工作台", "分屏输入/输出", "6 类 Result 组件"],
      mockFunctions: ["analyzeRequirement", "explainCode", "generateTestCases", "analyzeLogs", "reviewCode", "generateApiDoc"],
    },
    llmRole: [
      "理解代码与日志上下文",
      "拆解需求为任务与接口",
      "生成测试点与 CR 意见",
      "输出可执行的排障步骤",
    ],
    suitableProjects: ["IDE 插件", "DevOps 平台", "研发门户"],
    suitableIndustries: ["软件", "互联网", "金融科技", "嵌入式"],
  },
  {
    slug: "paradigm-10",
    highlights: [
      "质检标准解读",
      "缺陷根因分析",
      "抽检方案生成",
      "风控规则与异常审核",
    ],
    introduction:
      "质检风控 Copilot 服务制造与电商风控场景：从标准、缺陷、抽检到规则诊断与异常单审核，将老师傅经验产品化。",
    logic: {
      flow: ["选模块", "输入标准/缺陷/订单", "Mock 分析", "结构化报告", "升级提示"],
      modules: ["标准", "缺陷", "抽检", "规则", "异常", "合规"],
      mockFunctions: ["interpretStandard", "analyzeDefect", "generateSamplingPlan", "diagnoseRiskRule", "reviewAnomaly"],
    },
    llmRole: [
      "解读复杂标准条文",
      "关联历史缺陷模式",
      "生成抽检与测试点",
      "多信号风险综合判断",
    ],
    suitableProjects: ["MES 质量模块", "电商风控中台", "合规报告系统"],
    suitableIndustries: ["制造", "消费电子", "跨境电商", "汽车零部件"],
  },
  {
    slug: "paradigm-11",
    highlights: [
      "岗位学习路径",
      "培训知识问答",
      "四角色 AI 陪练",
      "测验生成与能力雷达",
      "HR 管理看板",
    ],
    introduction:
      "企业 AI 培训平台将课程、陪练、测验与报告打通，按岗位推送学习路径，用场景化陪练替代纯阅读，管理者可见学习效果。",
    logic: {
      flow: ["画像", "generateLearningPath", "学/问/练/测", "generateLearningReport", "管理看板"],
      modules: ["首页", "路径", "问答", "陪练", "测验", "报告", "Admin"],
      mockFunctions: ["generateLearningPath", "answerTrainingQuestion", "simulateRoleplay", "scoreRoleplay", "generateQuiz", "gradeQuiz"],
    },
    llmRole: [
      "个性化路径推荐",
      "扮演客户/面试官对话",
      "陪练多维评分与反馈",
      "自动出题与解析",
    ],
    suitableProjects: ["企业大学", "销售赋能平台", "客服培训中心"],
    suitableIndustries: ["零售", "金融", "连锁服务", "大型集团"],
  },
  {
    slug: "paradigm-12",
    highlights: [
      "可引用专业问答",
      "风险识别与报告",
      "金融终端风 UI",
      "专家人机协同复核",
    ],
    introduction:
      "行业专家系统（本 Demo 为金融场景）将法规、案例、制度与专家经验整合，输出可解释的专业意见，高风险结论必须经专家复核。",
    logic: {
      flow: ["检索知识", "generateExpertAnswer", "detectProfessionalRisks", "报告", "requireExpertReview", "submitExpertReview"],
      modules: ["问答", "知识库", "风险", "报告", "复核"],
      mockFunctions: ["searchIndustryKnowledge", "generateExpertAnswer", "detectProfessionalRisks", "generateIndustryReport"],
    },
    llmRole: [
      "专业领域推理与归纳",
      "多文档交叉引用",
      "风险点识别与等级",
      "报告结构化生成（非终审）",
    ],
    suitableProjects: ["授信审批助手", "法务研究平台", "医疗质控", "政务政策库"],
    suitableIndustries: ["银行/保险", "法律", "医疗", "政务", "能源"],
  },
  {
    slug: "paradigm-13",
    highlights: [
      "统一工作台编排多范式",
      "意图识别路由",
      "RAG + Agent + 风控一体",
      "权限/审批/审计/导出",
    ],
    introduction:
      "ToB 通用 AI 工作台是可复用的企业 LLM 应用壳：一个入口覆盖知识问答、文档、分析、Agent、风控，内置权限、引用、审批与审计，便于快速定制行业方案。",
    logic: {
      flow: ["输入", "classifyIntent", "ragSearch/generateAnswer/Agent", "审批", "审计"],
      modules: ["工作台", "任务", "结果", "历史", "管理"],
      mockFunctions: ["classifyIntent", "ragSearch", "generateAnswer", "decomposeAgentTask", "detectRisks"],
    },
    llmRole: [
      "意图分类与任务路由",
      "各范式能力的统一调度",
      "结构化输出与用户可编辑草稿",
    ],
    suitableProjects: ["企业 AI 门户", "行业方案 PoC", "多租户 SaaS 底座"],
    suitableIndustries: ["全行业 ToB", "制造", "金融", "零售", "政务"],
  },
];

export function getParadigmGuide(slug: string): ParadigmGuide | undefined {
  return guides.find((g) => g.slug === slug);
}

export function getAllParadigmGuides(): ParadigmGuide[] {
  return guides;
}
