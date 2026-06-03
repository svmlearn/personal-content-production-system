import { callMockTool } from "./tools";
import type {
  AgentTask,
  AuditLogEntry,
  BusinessForm,
  Confirmation,
  ParsedGoal,
  TaskGoalType,
  TaskStep,
  ToolCall,
  ToolName,
} from "./types";

/** 预留：接入真实 Agent 框架 */
export const AGENT_HOOK = {
  runAgent: async (input: string) => {
    void input;
    return { taskId: "" };
  },
  invokeOA: async (payload: unknown) => {
    void payload;
    return {};
  },
};

const CONFIRM_ACTIONS = new Set([
  "提交审批",
  "创建采购单",
  "开通权限",
  "发送通知",
]);

export function parseTaskGoal(input: string): ParsedGoal {
  const text = input.trim();
  let type: TaskGoalType = "generic";
  const entities: Record<string, string> = {};

  if (
    text.includes("差旅") ||
    text.includes("报销") ||
    text.includes("出差")
  ) {
    type = "reimbursement";
    const dest = text.match(/去([\u4e00-\u9fa5]{2,})/);
    if (dest) entities.destination = dest[1];
    if (text.includes("下周三")) entities.date = "下周三";
    if (text.includes("上海")) entities.destination = "上海";
  } else if (text.includes("采购")) {
    type = "procurement";
  } else if (
    text.includes("权限") ||
    text.includes("入职") ||
    text.includes("新员工")
  ) {
    type = "hr_onboarding";
  } else if (
    text.includes("IT") ||
    text.includes("工单") ||
    text.includes("故障")
  ) {
    type = "it_ticket";
  }

  return {
    type,
    summary: text.slice(0, 120),
    entities,
  };
}

export function planSteps(goal: ParsedGoal): TaskStep[] {
  const base = [
    step("s1", "理解需求", "解析用户目标与关键实体", false),
    step("s2", "补充必要信息", "校验必填字段是否齐全", false),
    step("s3", "查询制度", "检索相关政策与限额", false),
    step("s4", "调用业务系统", "对接 OA/ERP/HRM 模拟接口", false),
    step("s5", "生成表单", "自动填充业务单据", false),
    step("s6", "等待确认", "高风险操作需人工确认", true),
    step("s7", "提交审批", "发起审批流", true),
    step("s8", "完成记录", "通知相关人并写入审计", false),
  ];

  if (goal.type === "it_ticket") {
    return [
      step("s1", "理解需求", "识别 IT 问题类型与优先级", false),
      step("s2", "补充必要信息", "收集环境与报错信息", false),
      step("s3", "查询制度", "匹配 SLA 与处理规范", false),
      step("s4", "调用业务系统", "创建 IT 服务台工单", false),
      step("s5", "生成表单", "填充工单字段", false),
      step("s6", "等待确认", "确认是否提交工单", true),
      step("s7", "提交审批", "分派处理人", true),
      step("s8", "完成记录", "发送受理通知", false),
    ];
  }

  return base;
}

function step(
  id: string,
  name: string,
  description: string,
  requiresConfirmation: boolean,
): TaskStep {
  return {
    id,
    name,
    description,
    status: "pending",
    toolCalls: [],
    requiresConfirmation,
  };
}

export function requireConfirmation(step: TaskStep): boolean {
  if (step.requiresConfirmation) return true;
  return CONFIRM_ACTIONS.has(step.name);
}

export function buildForm(goal: ParsedGoal, toolData?: Record<string, unknown>): BusinessForm {
  switch (goal.type) {
    case "reimbursement":
      return {
        type: "reimbursement",
        title: "差旅报销单",
        fields: [
          { key: "destination", label: "出差目的地", value: String(goal.entities.destination ?? toolData?.destination ?? "上海"), editable: true },
          { key: "date", label: "出差日期", value: String(goal.entities.date ?? toolData?.travelDate ?? "下周三"), editable: true },
          { key: "amount", label: "报销金额（元）", value: String(toolData?.amount ?? 2680), editable: true },
          { key: "reason", label: "事由", value: "客户拜访与方案交流", editable: true },
          { key: "project", label: "项目编码", value: "PRJ-2025-018", editable: true },
        ],
      };
    case "procurement":
      return {
        type: "procurement",
        title: "采购申请单",
        fields: [
          { key: "item", label: "采购物品", value: "笔记本电脑 × 5", editable: true },
          { key: "amount", label: "预算金额", value: "45000", editable: true },
          { key: "vendor", label: "建议供应商", value: "某某科技", editable: true },
        ],
      };
    case "hr_onboarding":
      return {
        type: "hr_onboarding",
        title: "入职权限申请",
        fields: [
          { key: "name", label: "员工姓名", value: goal.entities.employeeName ?? "李明", editable: true },
          { key: "dept", label: "部门", value: "产品部", editable: true },
          { key: "systems", label: "系统清单", value: "OA, 邮箱, VPN, 知识库", editable: true },
        ],
      };
    case "it_ticket":
      return {
        type: "it_ticket",
        title: "IT 服务工单",
        fields: [
          { key: "title", label: "问题标题", value: goal.summary.slice(0, 40), editable: true },
          { key: "priority", label: "优先级", value: "P2", editable: true },
          { key: "desc", label: "问题描述", value: goal.summary, editable: true },
        ],
      };
    default:
      return {
        type: "generic",
        title: "通用申请表",
        fields: [{ key: "note", label: "说明", value: goal.summary, editable: true }],
      };
  }
}

export function buildConfirmation(
  step: TaskStep,
  task: AgentTask,
): Confirmation {
  const form = task.form;
  if (task.goal.type === "reimbursement") {
    const amount = form?.fields.find((f) => f.key === "amount")?.value ?? "2680";
    return {
      stepId: step.id,
      action: "提交差旅报销审批",
      impact: "将创建审批单并通知直属主管与财务初审",
      keyInfo: {
        目的地: form?.fields.find((f) => f.key === "destination")?.value ?? "上海",
        金额: `${amount} 元`,
        申请人: "当前用户",
      },
      risks: ["提交后不可撤回", "超标部分需补充说明附件"],
    };
  }
  if (task.goal.type === "procurement") {
    return {
      stepId: step.id,
      action: "创建采购申请单",
      impact: "将进入采购审批链并占用部门预算",
      keyInfo: {
        金额: form?.fields.find((f) => f.key === "amount")?.value ?? "—",
        物品: form?.fields.find((f) => f.key === "item")?.value ?? "—",
      },
      risks: ["请确认预算科目正确", "大额采购需招标流程"],
    };
  }
  if (task.goal.type === "hr_onboarding") {
    return {
      stepId: step.id,
      action: "开通系统权限",
      impact: "将为新员工开通所列系统访问权限",
      keyInfo: {
        员工: form?.fields.find((f) => f.key === "name")?.value ?? "—",
        系统: form?.fields.find((f) => f.key === "systems")?.value ?? "—",
      },
      risks: ["敏感系统需信息安全部复核", "权限变更将记录审计"],
    };
  }
  return {
    stepId: step.id,
    action: step.name,
    impact: "将执行流程后续步骤",
    keyInfo: { 任务: task.goal.summary.slice(0, 50) },
    risks: ["请确认信息无误后再提交"],
  };
}

export interface ExecuteStepResult {
  step: TaskStep;
  toolCalls: ToolCall[];
  form?: BusinessForm;
  confirmation?: Confirmation;
  approvalId?: string;
  pauseForConfirmation: boolean;
}

export function executeStep(
  step: TaskStep,
  task: AgentTask,
): ExecuteStepResult {
  const now = new Date().toISOString();
  const updated: TaskStep = {
    ...step,
    status: "running",
    startedAt: now,
    toolCalls: [...step.toolCalls],
  };
  const newTools: ToolCall[] = [];
  let form = task.form;
  let confirmation: Confirmation | undefined;
  let pauseForConfirmation = false;

  const addTool = (
    toolName: ToolName,
    input: Record<string, unknown>,
    start: number,
  ) => {
    const result = callMockTool(toolName, input);
    newTools.push({
      id: `tc-${toolName}-${Date.now()}`,
      toolName,
      input,
      output: result.data,
      status: result.success ? "success" : "error",
      durationMs: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
    return result;
  };

  switch (step.id) {
    case "s1":
      updated.input = task.userInput;
      updated.output = `已识别目标类型：${task.goal.type}；实体：${JSON.stringify(task.goal.entities)}`;
      break;
    case "s2":
      updated.output = "必填信息已齐全，可继续执行";
      break;
    case "s3": {
      const start = Date.now();
      const topic =
        task.goal.type === "reimbursement"
          ? "差旅"
          : task.goal.type === "procurement"
            ? "采购"
            : task.goal.type === "hr_onboarding"
              ? "权限"
              : "IT";
      const r = addTool("policySearchTool", { topic }, start);
      updated.output = String(r.data.excerpt);
      break;
    }
    case "s4": {
      const start = Date.now();
      if (task.goal.type === "reimbursement") {
        addTool(
          "reimbursementTool",
          {
            destination: task.goal.entities.destination,
            date: task.goal.entities.date,
            amount: 2680,
          },
          start,
        );
      } else if (task.goal.type === "procurement") {
        addTool("procurementTool", { amount: 12000 }, start);
      } else if (task.goal.type === "hr_onboarding") {
        addTool("hrOnboardingTool", { employeeName: "新员工" }, start);
      } else if (task.goal.type === "it_ticket") {
        addTool("itTicketTool", { title: task.goal.summary }, start);
      }
      updated.output = "业务系统调用成功";
      break;
    }
    case "s5": {
      const lastTool = task.steps
        .flatMap((s) => s.toolCalls)
        .slice(-1)[0]?.output as Record<string, unknown> | undefined;
      form = buildForm(task.goal, lastTool);
      updated.output = `已生成「${form.title}」，可编辑后提交`;
      break;
    }
    case "s6":
      confirmation = buildConfirmation(step, { ...task, form });
      updated.status = "needs_confirmation";
      pauseForConfirmation = true;
      updated.output = "等待用户确认";
      break;
    case "s7": {
      if (requireConfirmation(step)) {
        const start = Date.now();
        addTool(
          "approvalTool",
          {
            formId: task.id,
            title: form?.title ?? "流程申请",
            approvers: ["直属主管", "部门负责人"],
          },
          start,
        );
        updated.output = "审批已提交，状态：审批中";
      }
      break;
    }
    case "s8": {
      const start = Date.now();
      addTool(
        "notificationTool",
        {
          channel: "email",
          recipient: "申请人",
          message: `您的${form?.title ?? "流程"}已提交成功`,
        },
        start,
      );
      updated.output = "流程执行完毕，审计日志已归档";
      break;
    }
    default:
      updated.output = "步骤完成";
  }

  if (!pauseForConfirmation) {
    updated.status = "completed";
    updated.completedAt = new Date().toISOString();
  }

  updated.toolCalls = [...updated.toolCalls, ...newTools];

  return {
    step: updated,
    toolCalls: newTools,
    form,
    confirmation,
    pauseForConfirmation,
  };
}

export function submitApproval(task: AgentTask): AgentTask["approval"] {
  return {
    id: `APR-${task.id}`,
    title: task.form?.title ?? "审批单",
    approvers: ["直属主管", "财务初审"],
    status: "pending",
    submittedAt: new Date().toISOString(),
  };
}

export function generateAuditLog(task: AgentTask): AuditLogEntry[] {
  const entries: AuditLogEntry[] = [
    {
      id: "a1",
      type: "user_input",
      message: "用户提交任务",
      detail: task.userInput,
      timestamp: task.createdAt,
    },
    {
      id: "a2",
      type: "plan",
      message: `拆解为 ${task.steps.length} 个步骤`,
      detail: task.steps.map((s) => s.name).join(" → "),
      timestamp: task.createdAt,
    },
  ];

  for (const step of task.steps) {
    for (const tc of step.toolCalls) {
      entries.push({
        id: `a-tc-${tc.id}`,
        type: "tool_call",
        message: `调用 ${tc.toolName}`,
        detail: JSON.stringify(tc.output).slice(0, 200),
        timestamp: tc.timestamp,
      });
    }
    if (step.status === "completed" || step.status === "needs_confirmation") {
      entries.push({
        id: `a-step-${step.id}`,
        type: "result",
        message: `步骤「${step.name}」${step.status}`,
        detail: step.output,
        timestamp: step.completedAt ?? step.startedAt ?? task.createdAt,
      });
    }
  }

  if (task.confirmation?.decision) {
    entries.push({
      id: "a-conf",
      type: "confirmation",
      message: `用户${task.confirmation.decision}`,
      detail: task.confirmation.action,
      timestamp: task.confirmation.resolvedAt ?? task.createdAt,
    });
  }

  return entries.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
}

export function createTask(userInput: string): AgentTask {
  const goal = parseTaskGoal(userInput);
  const steps = planSteps(goal);
  const now = new Date().toISOString();
  const task: AgentTask = {
    id: `task-${Date.now()}`,
    userInput,
    goal,
    status: "running",
    steps,
    auditLog: [],
    createdAt: now,
  };
  task.auditLog = generateAuditLog(task);
  return task;
}

export const EXAMPLE_TASKS = [
  "帮我申请下周三去上海出差的差旅报销流程，并检查报销标准",
  "帮我提交差旅报销",
  "帮新员工开通系统权限",
  "帮我创建采购申请",
  "帮我创建一个 IT 工单",
];
