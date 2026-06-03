import type { CaseStudy, IndustryKnowledge, Regulation } from "./types";

export const KNOWLEDGE_BASE: IndustryKnowledge[] = [
  {
    id: "k1",
    title: "商业银行资本管理办法（试行）节选",
    category: "regulation",
    summary: "对资本充足率、杠杆率及信息披露提出要求。",
    effectiveDate: "2024-01-01",
    tags: ["资本", "合规"],
  },
  {
    id: "k2",
    title: "反洗钱法及金融机构客户尽职调查办法",
    category: "regulation",
    summary: "客户身份识别、可疑交易报告与记录保存义务。",
    effectiveDate: "2025-01-01",
    tags: ["AML", "KYC"],
  },
  {
    id: "k3",
    title: "2025 年中小银行信用风险展望",
    category: "report",
    summary: "区域集中、房地产敞口与弱资质借款人压力。",
    tags: ["信用风险", "展望"],
  },
  {
    id: "k4",
    title: "案例：某科技公司应收账款保理违约",
    category: "case",
    summary: "核心债务人集中，虚构贸易背景导致二次违约。",
    tags: ["保理", "贸易背景"],
  },
  {
    id: "k5",
    title: "本行对公授信尽职调查操作指引 V4",
    category: "policy",
    summary: "尽调清单、现场走访、财务核实与审批权限。",
    tags: ["尽调", "授信"],
  },
  {
    id: "k6",
    title: "专家经验：关联交易识别与公允性判断",
    category: "expert",
    summary: "关注隐性关联、定价偏离与市场可比。",
    tags: ["关联交易", "定价"],
  },
];

export const REGULATIONS: Regulation[] = KNOWLEDGE_BASE.filter(
  (k): k is Regulation => k.category === "regulation",
).map((k) => ({
  ...k,
  issuer: k.id === "k1" ? "金融监管总局" : "全国人大常委会",
}));

export const CASES: CaseStudy[] = [
  {
    id: "k4",
    title: "案例：某科技公司应收账款保理违约",
    category: "case",
    summary: "核心债务人集中，虚构贸易背景导致二次违约。",
    tags: ["保理", "贸易背景"],
    outcome: "重组失败，进入司法清收",
    year: 2023,
  },
];

export const SAMPLE_QUESTIONS = [
  "这份授信合同有哪些风险？",
  "这个客户的尽调重点是什么？",
  "该笔并购贷款合规要点有哪些？",
  "这项新规适用于哪些机构？",
];

export const SAMPLE_RISK_INPUT = `借款企业：华东某新能源组件有限公司
授信申请：流动资金贷款 8000 万元，期限 1 年
担保：实际控制人连带责任保证 + 应收账款质押
情况：2024 年营收下滑 18%，应收账款周转天数升至 126 天；前两大客户占收入 61%；存在对关联贸易公司的应付账款 2200 万元未披露。`;

export const SAMPLE_REPORT_INPUT =
  "对华东某新能源组件有限公司申请 8000 万流动资金贷款进行尽调摘要，关注关联交易与应收账款质量。";
