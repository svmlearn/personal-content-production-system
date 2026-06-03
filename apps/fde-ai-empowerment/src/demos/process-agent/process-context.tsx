"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  createTask,
  executeStep,
  generateAuditLog,
  submitApproval,
} from "@/lib/process-agent/engine";
import { RECENT_TASKS } from "@/lib/process-agent/mock-data";
import type { AgentTask, BusinessForm } from "@/lib/process-agent/types";

interface ProcessContextValue {
  recentTasks: AgentTask[];
  activeTask: AgentTask | null;
  isRunning: boolean;
  startTask: (input: string) => void;
  confirmAction: (decision: "confirmed" | "modified" | "cancelled") => void;
  updateFormField: (key: string, value: string) => void;
  cancelTask: () => void;
}

const ProcessContext = createContext<ProcessContextValue | null>(null);

const STEP_DELAY_MS = 700;

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function ProcessProvider({ children }: { children: ReactNode }) {
  const [recentTasks, setRecentTasks] = useState<AgentTask[]>(RECENT_TASKS);
  const [activeTask, setActiveTask] = useState<AgentTask | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const runningRef = useRef(false);
  const stepIndexRef = useRef(0);

  const runFromStep = useCallback(async (task: AgentTask, fromIndex: number) => {
    if (runningRef.current) return;
    runningRef.current = true;
    setIsRunning(true);

    let current = { ...task };

    for (let i = fromIndex; i < current.steps.length; i++) {
      stepIndexRef.current = i;
      const steps = current.steps.map((s, idx) =>
        idx === i ? { ...s, status: "running" as const } : s,
      );
      current = { ...current, steps, status: "running" };
      setActiveTask({ ...current });
      await delay(STEP_DELAY_MS);

      const step = current.steps[i];
      const result = executeStep(step, current);

      const updatedSteps = current.steps.map((s, idx) =>
        idx === i ? result.step : s,
      );
      current = {
        ...current,
        steps: updatedSteps,
        form: result.form ?? current.form,
        confirmation: result.confirmation ?? current.confirmation,
        auditLog: generateAuditLog({
          ...current,
          steps: updatedSteps,
          form: result.form ?? current.form,
          confirmation: result.confirmation ?? current.confirmation,
        }),
      };

      if (result.pauseForConfirmation) {
        current.status = "awaiting_confirmation";
        setActiveTask({ ...current });
        runningRef.current = false;
        setIsRunning(false);
        return;
      }

      if (result.step.id === "s7") {
        current.approval = submitApproval(current);
      }

      setActiveTask({ ...current });
    }

    current.status = "completed";
    current.completedAt = new Date().toISOString();
    current.auditLog = generateAuditLog(current);
    setActiveTask({ ...current });
    setRecentTasks((prev) => [current, ...prev].slice(0, 8));
    runningRef.current = false;
    setIsRunning(false);
  }, []);

  const startTask = useCallback(
    (input: string) => {
      const task = createTask(input);
      setActiveTask(task);
      stepIndexRef.current = 0;
      void runFromStep(task, 0);
    },
    [runFromStep],
  );

  const confirmAction = useCallback(
    (decision: "confirmed" | "modified" | "cancelled") => {
      if (!activeTask) return;

      if (decision === "cancelled") {
        const cancelled = {
          ...activeTask,
          status: "failed" as const,
          confirmation: activeTask.confirmation
            ? {
                ...activeTask.confirmation,
                decision,
                resolvedAt: new Date().toISOString(),
              }
            : undefined,
        };
        cancelled.auditLog = generateAuditLog(cancelled);
        setActiveTask(cancelled);
        setIsRunning(false);
        runningRef.current = false;
        return;
      }

      const confirmIdx = activeTask.steps.findIndex(
        (s) => s.status === "needs_confirmation",
      );
      const steps = activeTask.steps.map((s, idx) =>
        idx === confirmIdx
          ? {
              ...s,
              status: "completed" as const,
              completedAt: new Date().toISOString(),
              output: decision === "modified" ? "用户修改后确认" : "用户已确认",
            }
          : s,
      );

      const updated: AgentTask = {
        ...activeTask,
        steps,
        status: "running",
        confirmation: activeTask.confirmation
          ? {
              ...activeTask.confirmation,
              decision,
              resolvedAt: new Date().toISOString(),
            }
          : undefined,
      };
      updated.auditLog = generateAuditLog(updated);
      setActiveTask(updated);
      void runFromStep(updated, confirmIdx + 1);
    },
    [activeTask, runFromStep],
  );

  const updateFormField = useCallback((key: string, value: string) => {
    setActiveTask((prev) => {
      if (!prev?.form) return prev;
      const form: BusinessForm = {
        ...prev.form,
        fields: prev.form.fields.map((f) =>
          f.key === key ? { ...f, value } : f,
        ),
      };
      const next = { ...prev, form };
      next.auditLog = [
        ...prev.auditLog,
        {
          id: `a-edit-${Date.now()}`,
          type: "form_edit",
          message: `编辑字段 ${key}`,
          detail: value,
          timestamp: new Date().toISOString(),
        },
      ];
      return next;
    });
  }, []);

  const cancelTask = useCallback(() => {
    runningRef.current = false;
    setIsRunning(false);
    setActiveTask(null);
  }, []);

  const value = useMemo(
    () => ({
      recentTasks,
      activeTask,
      isRunning,
      startTask,
      confirmAction,
      updateFormField,
      cancelTask,
    }),
    [
      recentTasks,
      activeTask,
      isRunning,
      startTask,
      confirmAction,
      updateFormField,
      cancelTask,
    ],
  );

  return (
    <ProcessContext.Provider value={value}>{children}</ProcessContext.Provider>
  );
}

export function useProcess() {
  const ctx = useContext(ProcessContext);
  if (!ctx) throw new Error("useProcess must be used within ProcessProvider");
  return ctx;
}
