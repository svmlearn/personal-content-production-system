"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { BUSINESS_RECORDS, DOCUMENTS, SCENARIO_CARDS, USERS } from "@/lib/tob-workbench/mock-data";
import {
  checkPermission,
  classifyIntent,
  createApproval,
  createTask,
  decomposeAgentTask,
  exportAnswerMarkdown,
  generateAnswer,
  ragSearch,
  resolveApproval,
} from "@/lib/tob-workbench/engine";
import type {
  AIAnswer,
  Approval,
  AuditLog,
  Feedback,
  Task,
  TaskIntent,
  ToolCall,
  User,
  UserRole,
  WorkbenchView,
} from "@/lib/tob-workbench/types";

interface WorkbenchContextValue {
  view: WorkbenchView;
  setView: (v: WorkbenchView) => void;
  currentUser: User;
  setUserRole: (role: UserRole) => void;
  can: (resource: string, action: "read" | "write" | "approve" | "admin") => boolean;
  input: string;
  setInput: (s: string) => void;
  activeTask: Task | null;
  activeAnswer: AIAnswer | null;
  toolCalls: ToolCall[];
  approval: Approval | null;
  runTask: (intent?: TaskIntent) => void;
  updateAnswerContent: (content: string) => void;
  submitApproval: (approved: boolean, comment: string) => void;
  submitFeedback: (rating: "up" | "down", comment?: string) => void;
  exportResult: () => void;
  history: Task[];
  auditLogs: AuditLog[];
  documents: typeof DOCUMENTS;
  scenarios: typeof SCENARIO_CARDS;
  records: typeof BUSINESS_RECORDS;
  selectedTaskId: string | null;
  openResult: (taskId: string) => void;
}

const WorkbenchContext = createContext<WorkbenchContextValue | null>(null);

export function WorkbenchProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<WorkbenchView>("workbench");
  const [currentUser, setCurrentUser] = useState<User>(USERS[0]);
  const [input, setInput] = useState("");
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeAnswer, setActiveAnswer] = useState<AIAnswer | null>(null);
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  const [approval, setApproval] = useState<Approval | null>(null);
  const [history, setHistory] = useState<Task[]>([]);
  const [answerMap, setAnswerMap] = useState<Record<string, AIAnswer>>({});
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: "log-0",
      action: "login",
      actor: "系统",
      resource: "workbench",
      detail: "用户进入 ToB AI 工作台",
      at: new Date().toISOString(),
    },
  ]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const log = useCallback((action: string, resource: string, detail: string) => {
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        action,
        actor: currentUser.name,
        resource,
        detail,
        at: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, [currentUser.name]);

  const setUserRole = useCallback((role: UserRole) => {
    const u = USERS.find((x) => x.role === role) ?? USERS[0];
    setCurrentUser({ ...u, role });
    log("switch_role", "auth", `切换角色为 ${role}`);
  }, [log]);

  const can = useCallback(
    (resource: string, action: "read" | "write" | "approve" | "admin") =>
      checkPermission(currentUser.role, resource, action),
    [currentUser.role],
  );

  const runTask = useCallback(
    (intent?: TaskIntent) => {
      const resolvedIntent = intent ?? classifyIntent(input);
      const task = createTask(input, resolvedIntent, currentUser);
      const chunks = ragSearch(input, currentUser.role);
      const answer = generateAnswer(task, chunks, currentUser);
      const tools =
        resolvedIntent === "agent_task" ? decomposeAgentTask(input) : [];
      const apv = answer.needsApproval ? createApproval(task.id) : null;

      setActiveTask(task);
      setActiveAnswer(answer);
      setToolCalls(tools);
      setApproval(apv);
      setHistory((h) => [task, ...h]);
      setAnswerMap((m) => ({ ...m, [task.id]: answer }));
      setView("result");
      log("ai_run", "task", `${resolvedIntent}: ${task.title}`);
      if (apv) log("approval_created", "approval", task.id);
    },
    [input, currentUser, log],
  );

  const updateAnswerContent = useCallback((content: string) => {
    setActiveAnswer((a) => (a ? { ...a, editableContent: content } : null));
    if (activeTask)
      setAnswerMap((m) => {
        const a = m[activeTask.id];
        return a ? { ...m, [activeTask.id]: { ...a, editableContent: content } } : m;
      });
    log("edit_result", "answer", "用户编辑 AI 输出");
  }, [activeTask, log]);

  const submitApproval = useCallback(
    (approved: boolean, comment: string) => {
      if (!approval || !can("task", "approve")) return;
      const resolved = resolveApproval(
        approval,
        approved,
        currentUser.name,
        comment,
      );
      setApproval(resolved);
      setActiveTask((t) =>
        t
          ? {
              ...t,
              status: approved ? "completed" : "rejected",
            }
          : null,
      );
      log("approval", "approval", `${approved ? "通过" : "驳回"}: ${comment}`);
    },
    [approval, can, currentUser.name, log],
  );

  const submitFeedback = useCallback(
    (rating: "up" | "down", comment?: string) => {
      const fb: Feedback = {
        id: `fb-${Date.now()}`,
        taskId: activeTask?.id ?? "",
        rating,
        comment,
      };
      void fb;
      log("feedback", "task", `${rating} ${comment ?? ""}`);
    },
    [activeTask, log],
  );

  const exportResult = useCallback(() => {
    if (!activeAnswer) return;
    const md = exportAnswerMarkdown(activeAnswer);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tob-ai-export-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    log("export", "answer", "导出 Markdown");
  }, [activeAnswer, log]);

  const openResult = useCallback(
    (taskId: string) => {
      const task = history.find((t) => t.id === taskId);
      const answer = answerMap[taskId];
      if (task && answer) {
        setSelectedTaskId(taskId);
        setActiveTask(task);
        setActiveAnswer(answer);
        setView("result");
      }
    },
    [history, answerMap],
  );

  const value = useMemo(
    () => ({
      view,
      setView,
      currentUser,
      setUserRole,
      can,
      input,
      setInput,
      activeTask,
      activeAnswer,
      toolCalls,
      approval,
      runTask,
      updateAnswerContent,
      submitApproval,
      submitFeedback,
      exportResult,
      history,
      auditLogs,
      documents: DOCUMENTS,
      scenarios: SCENARIO_CARDS,
      records: BUSINESS_RECORDS,
      selectedTaskId,
      openResult,
    }),
    [
      view,
      currentUser,
      setUserRole,
      can,
      input,
      activeTask,
      activeAnswer,
      toolCalls,
      approval,
      runTask,
      updateAnswerContent,
      submitApproval,
      submitFeedback,
      exportResult,
      history,
      auditLogs,
      selectedTaskId,
      openResult,
    ],
  );

  return (
    <WorkbenchContext.Provider value={value}>{children}</WorkbenchContext.Provider>
  );
}

export function useWorkbench() {
  const ctx = useContext(WorkbenchContext);
  if (!ctx) throw new Error("useWorkbench within WorkbenchProvider");
  return ctx;
}
