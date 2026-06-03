import type { DepartmentStats, Employee } from "./types";

export const DEMO_EMPLOYEE: Employee = {
  id: "e1",
  name: "张明",
  department: "华东销售一部",
  role: "sales",
  level: "L2 · 销售代表",
  goal: "Q2 完成大客户方案型销售认证",
  completedCourses: ["产品基础 P101", "CRM 使用入门", "合规与信息安全"],
  weakSkills: ["异议处理", "方案呈现", "竞品对比"],
  skills: [
    { id: "s1", name: "产品知识", score: 78, maxScore: 100 },
    { id: "s2", name: "销售话术", score: 62, maxScore: 100 },
    { id: "s3", name: "客户沟通", score: 70, maxScore: 100 },
    { id: "s4", name: "合规意识", score: 88, maxScore: 100 },
    { id: "s5", name: "数据分析", score: 55, maxScore: 100 },
    { id: "s6", name: "协作协同", score: 72, maxScore: 100 },
  ],
};

export const KNOWLEDGE_SNIPPETS: { keys: string[]; answer: string; cite: string }[] = [
  {
    keys: ["卖点", "怎么讲", "产品"],
    answer:
      "核心卖点建议用「价值三角」：①降本：自动化替代 30% 人工；②增效：上线周期从 6 周缩至 2 周；③合规：通过等保与行业审计模板。开场先问客户当前最痛的是成本还是交付速度。",
    cite: "《产品话术手册》第 2 章",
  },
  {
    keys: ["价格贵", "贵", "预算"],
    answer:
      "先认同再探因：「理解您对投入的关注」。用 TCO 对比 3 年总拥有成本；提供分期或按席位阶梯报价；若仍超预算，建议 pilot 单部门验证 ROI 后再扩面。",
    cite: "《销售异议处理》场景 4",
  },
  {
    keys: ["新员工", "第一周", "入职"],
    answer:
      "第一周：Day1 文化+安全合规；Day2-3 产品 P101 + CRM；Day4 跟访 shadow；Day5 小测验 + 导师 1:1。第二周起每周 2 次陪练。",
    cite: "《新员工入职路径》",
  },
  {
    keys: ["投诉", "生气", "愤怒"],
    answer:
      "投诉处理四步：倾听复述 → 致歉共情（不认错产品）→ 给时间节点与方案 → 24h 内回访。升级阈值：涉及人身/法律/媒体曝光立即转二线。",
    cite: "《客服 SOP》V3",
  },
];

export const DEPARTMENT_STATS: DepartmentStats[] = [
  {
    department: "华东销售一部",
    completionRate: 72,
    avgScore: 81,
    weakTopics: ["异议处理", "竞品对比", "方案呈现"],
    topLearners: [
      { name: "李婷", score: 94 },
      { name: "王浩", score: 91 },
    ],
    followUp: [
      { name: "赵磊", reason: "连续 2 次测验 <60" },
      { name: "陈雪", reason: "陪练「投诉模拟」未达标" },
    ],
  },
  {
    department: "客户成功中心",
    completionRate: 85,
    avgScore: 86,
    weakTopics: ["升级工单话术", "SLA 解释"],
    topLearners: [{ name: "刘洋", score: 96 }],
    followUp: [{ name: "周敏", reason: "入职路径第 2 阶段逾期" }],
  },
];
