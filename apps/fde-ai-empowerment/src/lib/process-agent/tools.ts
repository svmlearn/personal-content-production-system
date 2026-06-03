import type { ToolName } from "./types";

export interface ToolResult {
  success: boolean;
  data: Record<string, unknown>;
}

export function policySearchTool(params: {
  topic: string;
  department?: string;
}): ToolResult {
  const policies: Record<string, string> = {
    差旅:
      "国内一线城市住宿上限 600 元/晚；经济舱/二等座；超标需主管审批。报销须 30 日内提交并关联出差申请。",
    采购: "单笔 5000 元以下部门主管审批；5000-50000 需财务复核；50000 以上招标流程。",
    权限: "新员工默认标准权限包；敏感系统需信息安全部二次审批。",
    IT: "P2 故障 4 小时响应；变更窗口工作日 22:00-06:00。",
  };
  const key = Object.keys(policies).find((k) => params.topic.includes(k)) ?? "差旅";
  return {
    success: true,
    data: {
      policyId: `POL-${key}`,
      excerpt: policies[key],
      version: "2025-Q2",
      source: "企业制度库",
    },
  };
}

export function reimbursementTool(params: {
  destination?: string;
  date?: string;
  amount?: number;
}): ToolResult {
  const amount = params.amount ?? 2680;
  const limit = 3000;
  return {
    success: true,
    data: {
      formType: "travel_reimbursement",
      destination: params.destination ?? "上海",
      travelDate: params.date ?? "下周三",
      amount,
      withinLimit: amount <= limit,
      limit,
      validationMessage:
        amount <= limit
          ? "金额在差旅标准内，可进入审批"
          : "金额超出标准，需附加超标说明",
    },
  };
}

export function procurementTool(params: {
  item?: string;
  amount?: number;
}): ToolResult {
  return {
    success: true,
    data: {
      prId: `PR-${Date.now().toString().slice(-6)}`,
      item: params.item ?? "办公设备采购",
      amount: params.amount ?? 12000,
      approvalChain: ["部门主管", "财务复核"],
    },
  };
}

export function hrOnboardingTool(params: {
  employeeName?: string;
  systems?: string[];
}): ToolResult {
  return {
    success: true,
    data: {
      requestId: `HR-${Date.now().toString().slice(-6)}`,
      employee: params.employeeName ?? "新员工",
      systems: params.systems ?? ["OA", "邮箱", "VPN"],
      status: "pending_security_review",
    },
  };
}

export function itTicketTool(params: {
  title?: string;
  priority?: string;
}): ToolResult {
  return {
    success: true,
    data: {
      ticketId: `IT-${Date.now().toString().slice(-6)}`,
      title: params.title ?? "系统访问异常",
      priority: params.priority ?? "P2",
      assignee: "IT 服务台",
      sla: "4 小时内响应",
    },
  };
}

export function approvalTool(params: {
  formId: string;
  title: string;
  approvers: string[];
}): ToolResult {
  return {
    success: true,
    data: {
      approvalId: `APR-${Date.now().toString().slice(-6)}`,
      formId: params.formId,
      title: params.title,
      approvers: params.approvers,
      status: "pending",
    },
  };
}

export function notificationTool(params: {
  channel: string;
  recipient: string;
  message: string;
}): ToolResult {
  return {
    success: true,
    data: {
      messageId: `NTF-${Date.now().toString().slice(-6)}`,
      channel: params.channel,
      recipient: params.recipient,
      delivered: true,
      preview: params.message.slice(0, 80),
    },
  };
}

const TOOL_MAP: Record<
  ToolName,
  (params: Record<string, unknown>) => ToolResult
> = {
  policySearchTool: (p) =>
    policySearchTool({
      topic: String(p.topic ?? ""),
      department: p.department as string | undefined,
    }),
  reimbursementTool: (p) =>
    reimbursementTool({
      destination: p.destination as string | undefined,
      date: p.date as string | undefined,
      amount: p.amount as number | undefined,
    }),
  procurementTool: (p) =>
    procurementTool({
      item: p.item as string | undefined,
      amount: p.amount as number | undefined,
    }),
  hrOnboardingTool: (p) =>
    hrOnboardingTool({
      employeeName: p.employeeName as string | undefined,
      systems: p.systems as string[] | undefined,
    }),
  itTicketTool: (p) =>
    itTicketTool({
      title: p.title as string | undefined,
      priority: p.priority as string | undefined,
    }),
  approvalTool: (p) =>
    approvalTool({
      formId: String(p.formId ?? ""),
      title: String(p.title ?? ""),
      approvers: (p.approvers as string[]) ?? [],
    }),
  notificationTool: (p) =>
    notificationTool({
      channel: String(p.channel ?? "email"),
      recipient: String(p.recipient ?? ""),
      message: String(p.message ?? ""),
    }),
};

export function callMockTool(
  toolName: ToolName,
  params: Record<string, unknown>,
): ToolResult {
  const fn = TOOL_MAP[toolName];
  return fn(params);
}
