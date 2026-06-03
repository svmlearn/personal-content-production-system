import type { AgentTask, User } from "./types";
import { createTask, generateAuditLog } from "./engine";

export const CURRENT_USER: User = {
  id: "u1",
  name: "王芳",
  department: "产品部",
  role: "普通员工",
};

function seedCompletedTask(input: string, completedAt: string): AgentTask {
  const task = createTask(input);
  task.status = "completed";
  task.completedAt = completedAt;
  task.steps = task.steps.map((s) => ({
    ...s,
    status: "completed" as const,
    completedAt,
    output: s.output ?? "已完成",
  }));
  task.auditLog = generateAuditLog(task);
  return task;
}

export const RECENT_TASKS: AgentTask[] = [
  seedCompletedTask("帮我提交上月交通费报销", "2025-05-27T16:30:00Z"),
  seedCompletedTask("帮新员工张三开通 OA 和邮箱权限", "2025-05-26T11:00:00Z"),
];
