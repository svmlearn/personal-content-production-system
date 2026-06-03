import type {
  ApiDocument,
  CodeExplanation,
  CodeReviewResult,
  DevMode,
  LogAnalysis,
  RequirementAnalysis,
  ReviewFinding,
  TaskComplexity,
  TestCase,
} from "./types";

/** 预留：Git / CI / 日志平台 / LLM */
export const DEV_HOOK = {
  fetchRepo: async (repo: string) => {
    void repo;
    return null;
  },
  queryLogs: async (query: string) => {
    void query;
    return "";
  },
  llm: async (prompt: string) => {
    void prompt;
    return "";
  },
};

function estimateComplexity(count: number): TaskComplexity {
  if (count <= 3) return "S";
  if (count <= 6) return "M";
  if (count <= 10) return "L";
  return "XL";
}

export function analyzeRequirement(prd: string): RequirementAnalysis {
  const hasMobile = prd.includes("移动") || prd.includes("拍照");
  const hasApproval = prd.includes("审批");
  const taskCount = 4 + (hasMobile ? 2 : 0) + (hasApproval ? 1 : 0);

  return {
    features: [
      "差旅报销单提交与 OA 出差单关联",
      "发票附件上传与验真",
      "金额阈值自动审批与超标说明",
      hasMobile ? "移动端拍照上传发票" : "Web 端附件上传",
      "财务月度报销汇总导出",
    ].filter(Boolean) as string[],
    frontendTasks: [
      { id: "fe-1", title: "报销表单与校验", owner: "frontend", complexity: "M" },
      { id: "fe-2", title: "附件上传组件", owner: "frontend", complexity: hasMobile ? "L" : "M" },
      { id: "fe-3", title: "审批状态展示", owner: "frontend", complexity: "S" },
    ],
    backendTasks: [
      { id: "be-1", title: "报销单 CRUD 与审批流对接", owner: "backend", complexity: "L" },
      { id: "be-2", title: "OA 出差单校验集成", owner: "backend", complexity: "M" },
      { id: "be-3", title: "发票验真服务封装", owner: "backend", complexity: "M" },
      { id: "be-4", title: "自动通过规则引擎", owner: "backend", complexity: "M" },
    ],
    dbChanges: [
      "新增 reimbursement 表（user_id, trip_id, amount, status）",
      "新增 reimbursement_item、invoice_attachment 表",
      "approval_instance 增加 biz_type=reimbursement",
    ],
    apiNeeds: [
      { method: "POST", path: "/api/v1/reimbursements", description: "创建报销单" },
      { method: "GET", path: "/api/v1/reimbursements/:id", description: "查询详情" },
      { method: "POST", path: "/api/v1/reimbursements/:id/submit", description: "提交审批" },
      { method: "GET", path: "/api/v1/reimbursements/export", description: "财务导出" },
    ],
    testPoints: [
      "出差单未批准时提交失败",
      "金额>3000 无超标说明拦截",
      "≤3000 且验真通过走自动审批",
      "附件格式与大小限制",
      "并发提交幂等",
    ],
    risks: [
      {
        id: "r1",
        description: "OA 接口不稳定可能导致提交失败",
        mitigation: "增加重试与降级提示",
      },
      {
        id: "r2",
        description: "发票验真第三方 SLA",
        mitigation: "异步验真 + 状态机",
      },
    ],
    complexity: estimateComplexity(taskCount),
  };
}

export function explainCode(code: string): CodeExplanation {
  void code;
  const isReimburse = code.includes("Reimbursement") || code.includes("reimbursement");
  return {
    summary: isReimburse
      ? "异步提交差旅报销：校验 OA 出差单 → 汇总金额 → 发票验真 → 自动审批或走人工审批流。"
      : "对用户提交的代码进行结构分析与逻辑说明（Demo 模板）。",
    coreLogic: [
      "通过 tripId 拉取 OA 出差单并校验状态为 APPROVED",
      "累加明细金额，超过 3000 需 overLimitReason",
      "批量发票验真 invoiceService.verifyBatch",
      "满足条件调用 workflow.autoApprove，否则 startApproval",
    ],
    inputs: ["userId", "payload: { tripId, items[], invoices[], overLimitReason? }"],
    outputs: ["审批实例 ID / 自动通过结果"],
    dependencies: ["oaClient", "invoiceService", "workflow", "BizError"],
    issues: [
      "items 为空时 reduce 可能需默认值",
      "verifyBatch 失败时未区分部分失败",
    ],
    optimizations: [
      "金额计算抽取 domain 服务便于单测",
      "审批策略可配置化（阈值、角色）",
      "增加结构化日志与 metrics",
    ],
  };
}

export function generateTestCases(input: string): TestCase[] {
  const isApi = input.includes("/api") || input.includes("接口");
  const base = isApi ? "接口" : "需求";

  return [
    {
      id: "tc-1",
      category: "正常流程",
      title: `${base}-成功提交并进入审批`,
      steps: "合法 token、已批准出差单、金额 2000、有效发票",
      expected: "返回 201，status=pending 或 auto_approved",
    },
    {
      id: "tc-2",
      category: "异常流程",
      title: "出差单未批准",
      steps: "trip.status != APPROVED",
      expected: "400 TRIP_NOT_APPROVED",
    },
    {
      id: "tc-3",
      category: "异常流程",
      title: "超标无说明",
      steps: "amount=5000, overLimitReason 为空",
      expected: "400 OVER_LIMIT",
    },
    {
      id: "tc-4",
      category: "边界条件",
      title: "金额恰好 3000",
      steps: "total=3000, 发票验真通过",
      expected: "走 autoApprove",
    },
    {
      id: "tc-5",
      category: "权限场景",
      title: "非本人出差单",
      steps: "trip 归属其他用户",
      expected: "403 Forbidden",
    },
    {
      id: "tc-6",
      category: "数据校验",
      title: "items 为空",
      steps: "items=[]",
      expected: "400 校验失败",
    },
    {
      id: "tc-7",
      category: "回归测试点",
      title: "原报销导出接口不受影响",
      steps: "调用 GET /export",
      expected: "仍返回 CSV/Excel",
    },
  ];
}

export function analyzeLogs(logs: string): LogAnalysis {
  const tripError = logs.includes("TRIP_NOT_APPROVED");
  const sql = logs.includes("SQLException") || logs.includes("Connection");

  return {
    summary: tripError
      ? "提交报销时业务校验失败：关联出差单未批准；底层伴随数据库连接重置。"
      : "检测到应用 ERROR 日志，需结合堆栈定位根因。",
    causes: [
      tripError ? "OA 出差单状态非 APPROVED" : "未知业务异常",
      sql ? "数据库连接池连接被重置，可能网络抖动或 DB 重启" : "非 DB 类错误",
      "高并发下 OA 查询超时未重试",
    ],
    impact: "用户无法完成报销提交，影响财务结算时效",
    steps: [
      "根据 traceId 14:32:01 查 reimbursement 提交链路",
      "核对 payload.tripId 在 OA 侧状态",
      "检查 Hikari 连接池与 DB 监控",
      "复现：用未批准 tripId 调用 POST /reimbursements",
    ],
    fixes: [
      "前端提交前增加出差单状态预检",
      "OA 客户端增加指数退避重试",
      "区分 BizError 与系统异常的错误码返回",
    ],
    escalate: sql,
    escalateReason: sql ? "若连接重置持续，需运维介入检查 DB/网络" : undefined,
  };
}

export function reviewCode(code: string): CodeReviewResult {
  const findings: ReviewFinding[] = [];

  if (code.includes("SELECT") && code.includes("+")) {
    findings.push({
      category: "security",
      severity: "high",
      message: "疑似 SQL 拼接，存在注入风险",
      suggestion: "使用参数化查询或 ORM 绑定变量",
    });
  }
  if (code.includes("password") && code.includes("req.body")) {
    findings.push({
      category: "security",
      severity: "medium",
      message: "敏感字段命名易混淆，且未脱敏日志",
      suggestion: "重命名变量，禁止记录明文",
    });
  }
  if (code.includes("raw(")) {
    findings.push({
      category: "risk",
      severity: "high",
      message: "db.raw 绕过 ORM 保护",
      suggestion: "改用 query builder 预编译语句",
    });
  }
  if (findings.length === 0) {
    findings.push({
      category: "readability",
      severity: "low",
      message: "整体结构清晰，异步错误处理完整",
      suggestion: "可补充单元测试覆盖边界分支",
    });
  }

  const hasHigh = findings.some((f) => f.severity === "high");
  return {
    findings,
    level: hasHigh ? "request_changes" : findings.length > 2 ? "comment" : "approve",
    summary: hasHigh
      ? "存在高危安全问题，必须修改后再合并"
      : "建议小幅优化后可合并",
  };
}

export function generateApiDoc(apiInfo: string): ApiDocument {
  return {
    title: "创建报销单",
    method: "POST",
    path: "/api/v1/reimbursements",
    description:
      apiInfo ||
      "创建差旅报销单并触发审批流程。需关联已批准的 OA 出差申请。",
    requestBody: `{
  "tripId": "string",
  "items": [{ "type": "transport", "amount": 1200 }],
  "invoices": [{ "fileId": "inv-001" }],
  "overLimitReason": "string | optional"
}`,
    responseBody: `{
  "id": "reimb-uuid",
  "status": "pending | auto_approved",
  "approvalId": "apr-uuid"
}`,
    errors: [
      { code: 400, message: "TRIP_NOT_APPROVED" },
      { code: 400, message: "OVER_LIMIT" },
      { code: 403, message: "Forbidden" },
    ],
  };
}

export function routeNaturalLanguage(input: string): DevMode {
  const t = input.toLowerCase();
  if (t.includes("需求") || t.includes("prd") || t.includes("拆解"))
    return "requirement";
  if (t.includes("日志") || t.includes("error") || t.includes("排障"))
    return "log";
  if (t.includes("测试") || t.includes("用例")) return "test";
  if (t.includes("review") || t.includes("审查") || t.includes("diff"))
    return "review";
  if (t.includes("接口") || t.includes("api") || t.includes("文档"))
    return "api";
  if (t.includes("代码") || t.includes("解释")) return "code";
  return "home";
}
