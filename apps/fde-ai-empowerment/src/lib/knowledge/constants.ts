import type { KnowledgeCategory } from "./types";

export const CATEGORY_META: Record<
  KnowledgeCategory,
  { label: string; description: string; color: string }
> = {
  hr: {
    label: "HR 制度",
    description: "入职、考勤、福利与员工手册",
    color: "bg-violet-500/10 text-violet-700 border-violet-200",
  },
  finance: {
    label: "财务制度",
    description: "报销、预算、采购与费用标准",
    color: "bg-amber-500/10 text-amber-800 border-amber-200",
  },
  it: {
    label: "IT 支持",
    description: "账号、VPN、设备与安全规范",
    color: "bg-cyan-500/10 text-cyan-800 border-cyan-200",
  },
  product: {
    label: "产品文档",
    description: "功能说明、业务规则与版本记录",
    color: "bg-sky-500/10 text-sky-800 border-sky-200",
  },
  project: {
    label: "项目资料",
    description: "里程碑、交付物与协作约定",
    color: "bg-emerald-500/10 text-emerald-800 border-emerald-200",
  },
  faq: {
    label: "FAQ",
    description: "高频问题与标准答复",
    color: "bg-slate-500/10 text-slate-700 border-slate-200",
  },
};

export const EXAMPLE_QUESTIONS = [
  "差旅报销标准是多少？",
  "新员工入职流程有哪些？",
  "VPN 连不上应该怎么处理？",
  "这个产品功能的业务规则是什么？",
];
