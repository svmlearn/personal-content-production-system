import type {
  CaseStudy,
  Customer,
  Opportunity,
  ProductModule,
} from "./types";

export const PRODUCT_MODULES: ProductModule[] = [
  {
    id: "pm-1",
    name: "智能审批与工作流",
    description: "可视化流程编排、SLA 与移动端审批",
    tags: ["审批", "流程", "效率"],
  },
  {
    id: "pm-2",
    name: "企业知识库与 AI 问答",
    description: "制度/SOP 可溯源问答与权限控制",
    tags: ["知识库", "AI", "合规"],
  },
  {
    id: "pm-3",
    name: "数据分析与经营看板",
    description: "多源数据接入、指标预警与自助分析",
    tags: ["BI", "数据", "决策"],
  },
  {
    id: "pm-4",
    name: "开放集成平台",
    description: "API、Webhook 与主流 ERP/HR 连接器",
    tags: ["集成", "API", "生态"],
  },
];

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: "cs-1",
    industry: "制造业",
    title: "某头部制造企业数字化审批项目",
    outcome: "审批周期缩短 62%，年节省人力成本约 280 万",
    modules: ["pm-1", "pm-4"],
  },
  {
    id: "cs-2",
    industry: "金融",
    title: "区域银行知识库与合规问答",
    outcome: "一线查询效率提升 3 倍，合规问询可追溯",
    modules: ["pm-2"],
  },
  {
    id: "cs-3",
    industry: "零售",
    title: "连锁零售运营数据中台",
    outcome: "门店经营指标 T+1 可视化，异常自动预警",
    modules: ["pm-3", "pm-4"],
  },
];

export const CUSTOMERS: Customer[] = [
  {
    id: "cust-a",
    name: "华东智造科技有限公司",
    industry: "先进制造",
    scale: "2000+ 人",
    region: "上海",
    currentSystems: ["用友 NC", "自研 OA", "Excel 报表"],
    painTags: ["审批慢", "系统孤岛", "数据不准"],
    stage: "proposal",
    expectedAmount: 680000,
    lastActivity: "2025-05-27",
    contacts: [
      {
        id: "ct-1",
        name: "陈建国",
        title: "CIO",
        role: "决策人",
        email: "chen.cio@eastsmart.example",
      },
      {
        id: "ct-2",
        name: "王芳",
        title: "流程管理部总监",
        role: "影响者",
        email: "wang.fang@eastsmart.example",
      },
    ],
  },
  {
    id: "cust-b",
    name: "云帆金融服务集团",
    industry: "金融科技",
    scale: "5000+ 人",
    region: "深圳",
    currentSystems: ["Salesforce", "自研核心", "钉钉"],
    painTags: ["合规压力", "知识分散", "客服成本高"],
    stage: "demo",
    expectedAmount: 1200000,
    lastActivity: "2025-05-28",
    contacts: [
      {
        id: "ct-3",
        name: "刘洋",
        title: "数字化负责人",
        role: "决策人",
        email: "liu.yang@yunfan.example",
      },
    ],
  },
  {
    id: "cust-c",
    name: "绿源连锁零售",
    industry: "零售连锁",
    scale: "800+ 门店",
    region: "杭州",
    currentSystems: ["有赞", "金蝶", "手工排班"],
    painTags: ["门店数据滞后", "补货靠经验", "培训成本高"],
    stage: "qualified",
    expectedAmount: 450000,
    lastActivity: "2025-05-26",
    contacts: [
      {
        id: "ct-4",
        name: "赵敏",
        title: "运营副总裁",
        role: "决策人",
        email: "zhao.min@lvyuan.example",
      },
    ],
  },
];

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "opp-1",
    customerId: "cust-a",
    name: "华东智造 · 智能审批一期",
    stage: "proposal",
    amount: 680000,
    probability: 65,
    owner: "张伟",
    closeDate: "2025-06-30",
  },
  {
    id: "opp-2",
    customerId: "cust-b",
    name: "云帆金融 · 知识库+客服",
    stage: "demo",
    amount: 1200000,
    probability: 45,
    owner: "张伟",
    closeDate: "2025-07-15",
  },
  {
    id: "opp-3",
    customerId: "cust-c",
    name: "绿源零售 · 数据中台 POC",
    stage: "qualified",
    amount: 450000,
    probability: 30,
    owner: "李倩",
    closeDate: "2025-08-01",
  },
];

export const DEFAULT_MEETING_TRANSCRIPT = `会议时间：2025年5月28日 14:00-15:00
参会人：我方张伟、售前李明；客户方 CIO 陈建国、流程总监王芳

陈总：我们今年重点是把审批和报表打通，现在 NC 和 OA 各走各的，月底对账很痛苦。
王芳：希望 Q3 能上线一期，覆盖采购和费用两大流程，预算大概六七十万。
陈总：竞品 A 也在跟，他们报价低但实施案例少。我们更关心上线风险和售后服务。
李明：建议先做 4 周 POC，验证与 NC 的集成和你的移动端体验。
陈总：下周安排技术评估会，请带上集成方案和制造业案例。王芳负责协调内部业务同事参会。
王芳：我周三前把现有流程文档发给你们。`;
