"use client";

import { CheckCircle2, Circle, Lock } from "lucide-react";
import { useTraining } from "../training-context";

const ROLE_LABEL = {
  new_hire: "新员工入职",
  sales: "销售能力",
  support: "客服处理",
  manager: "管理者成长",
};

export function PathView() {
  const { allPaths, employee, setEmployeeRole, setView, startQuiz } = useTraining();

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(ROLE_LABEL) as (keyof typeof ROLE_LABEL)[]).map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => setEmployeeRole(role)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              employee.role === role
                ? "bg-violet-600 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {ROLE_LABEL[role]}
          </button>
        ))}
      </div>

      {allPaths.map((path) => (
        <div
          key={path.id}
          className={`rounded-xl border p-5 ${
            path.role === employee.role
              ? "border-violet-200 bg-violet-50/30"
              : "border-slate-200 bg-white opacity-90"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold text-slate-900">{path.title}</h3>
            <span className="text-xs text-slate-500">
              {path.progressPercent}% · {path.totalHours}h
            </span>
          </div>
          <ol className="mt-4 space-y-4">
            {path.stages.map((stage, idx) => (
              <li key={stage.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  {stage.status === "done" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : stage.status === "active" ? (
                    <Circle className="h-5 w-5 fill-violet-500 text-violet-500" />
                  ) : (
                    <Lock className="h-5 w-5 text-slate-300" />
                  )}
                  {idx < path.stages.length - 1 && (
                    <div className="my-1 w-px flex-1 bg-slate-200" />
                  )}
                </div>
                <div className="min-w-0 flex-1 pb-2">
                  <p className="font-medium text-slate-800">{stage.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    课程：{stage.courses.map((c) => c.title).join("、")}
                  </p>
                  <p className="text-xs text-slate-500">
                    练习：{stage.practice} · 测验：{stage.quiz} ·{" "}
                    {stage.estimatedHours}h
                  </p>
                  {stage.status === "active" && path.role === employee.role && (
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setView("roleplay")}
                        className="rounded-lg bg-violet-600 px-3 py-1 text-xs text-white"
                      >
                        去陪练
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          startQuiz(stage.quiz);
                          setView("quiz");
                        }}
                        className="rounded-lg border border-violet-300 px-3 py-1 text-xs text-violet-700"
                      >
                        开始测验
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
