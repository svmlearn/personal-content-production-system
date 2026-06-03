import type { BusinessRecord, Document, Role, User } from "./types";

export const ROLES: Role[] = [
  {
    id: "employee",
    name: "业务人员",
    permissions: [
      { resource: "knowledge", actions: ["read"] },
      { resource: "task", actions: ["read", "write"] },
    ],
  },
  {
    id: "manager",
    name: "部门主管",
    permissions: [
      { resource: "knowledge", actions: ["read"] },
      { resource: "task", actions: ["read", "write", "approve"] },
    ],
  },
  {
    id: "admin",
    name: "管理员",
    permissions: [
      { resource: "knowledge", actions: ["read", "write", "admin"] },
      { resource: "task", actions: ["read", "write", "approve", "admin"] },
      { resource: "audit", actions: ["read", "admin"] },
    ],
  },
];

export const USERS: User[] = [
  { id: "u1", name: "李业务", department: "运营中心", role: "employee" },
  { id: "u2", name: "王主管", department: "运营中心", role: "manager" },
  { id: "u3", name: "陈管理员", department: "数字化部", role: "admin" },
];

export const DOCUMENTS: Document[] = [
  {
    id: "d1",
    title: "差旅报销管理制度 2025",
    category: "制度",
    sensitivity: "internal",
    updatedAt: "2025-03-01",
  },
  {
    id: "d2",
    title: "Q2 运营增长 OKR 指引",
    category: "运营",
    sensitivity: "internal",
    updatedAt: "2025-04-15",
  },
  {
    id: "d3",
    title: "大客户授信审批办法",
    category: "风控",
    sensitivity: "confidential",
    updatedAt: "2025-02-20",
  },
  {
    id: "d4",
    title: "产品定价与折扣政策",
    category: "销售",
    sensitivity: "confidential",
    updatedAt: "2025-01-10",
  },
];

export const BUSINESS_RECORDS: BusinessRecord[] = [
  {
    id: "br1",
    type: "contract",
    title: "华东制造 · 年度框架协议",
    owner: "销售一部",
    meta: { amount: "320万", status: "审批中" },
  },
  {
    id: "br2",
    type: "ticket",
    title: "工单 #8821 SLA 超时",
    owner: "客户成功",
    meta: { priority: "P1", customer: "某零售集团" },
  },
];

export const SCENARIO_CARDS = [
  {
    intent: "knowledge_qa" as const,
    title: "企业知识库",
    desc: "RAG 问答 · 引用溯源",
    example: "出差报销标准是什么？",
  },
  {
    intent: "doc_gen" as const,
    title: "文档生成",
    desc: "方案 / 报告 / 纪要",
    example: "生成一份客户拜访纪要模板",
  },
  {
    intent: "data_analysis" as const,
    title: "运营分析",
    desc: "指标解读 · NL 分析",
    example: "分析本月 GMV 下降原因",
  },
  {
    intent: "agent_task" as const,
    title: "流程 Agent",
    desc: "任务拆解 · 工具调用",
    example: "为新员工开通账号并分配课程",
  },
  {
    intent: "risk_review" as const,
    title: "风控审核",
    desc: "风险识别 · 人工确认",
    example: "审核这笔 500 万授信申请风险",
  },
];
