"use client";

import { ArrowRight, Sparkles, Target } from "lucide-react";
import { useTraining } from "../training-context";

const ROLE_LABEL = {
  new_hire: "新员工",
  sales: "销售",
  support: "客服",
  manager: "管理者",
};

export function HomeView() {
  const { employee, myPath, setView, askQuestion } = useTraining();

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-5 lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-violet-600">
                员工画像
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">{employee.name}</h2>
              <p className="text-sm text-slate-500">
                {employee.department} · {ROLE_LABEL[employee.role]}
              </p>
            </div>
            <span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold text-white">
              {employee.level}
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-white/80 p-3">
              <p className="text-xs text-slate-500">学习目标</p>
              <p className="mt-1 flex items-start gap-1 text-sm font-medium text-slate-800">
                <Target className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
                {employee.goal}
              </p>
            </div>
            <div className="rounded-lg bg-white/80 p-3">
              <p className="text-xs text-slate-500">能力短板</p>
              <p className="mt-1 text-sm text-amber-800">
                {employee.weakSkills.join(" · ")}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            已完成 {employee.completedCourses.length} 门：{" "}
            {employee.completedCourses.join("、")}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="flex items-center gap-1 text-xs font-medium text-violet-600">
            <Sparkles className="h-3.5 w-3.5" />
            AI 推荐路径
          </p>
          <h3 className="mt-2 font-semibold text-slate-900">{myPath.title}</h3>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-500">
              <span>进度</span>
              <span>{myPath.progressPercent}%</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-violet-500 transition-all"
                style={{ width: `${myPath.progressPercent}%` }}
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            预计 {myPath.totalHours} 小时 · 当前阶段「
            {myPath.stages.find((s) => s.status === "active")?.name}」
          </p>
          <button
            type="button"
            onClick={() => setView("path")}
            className="mt-4 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-violet-600 py-2 text-sm font-medium text-white hover:bg-violet-700"
          >
            继续学习
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          setView("qa");
          askQuestion("客户说价格贵该怎么回应？");
        }}
        className="flex w-full items-center justify-between rounded-xl border border-dashed border-violet-300 bg-violet-50/50 p-4 text-left hover:border-violet-400"
      >
        <div>
          <p className="font-semibold text-violet-900">问企业知识库</p>
          <p className="text-sm text-violet-700/80">
            产品话术、异议处理、入职指南…
          </p>
        </div>
        <ArrowRight className="h-5 w-5 text-violet-600" />
      </button>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "AI 陪练", v: "roleplay" as const },
          { label: "阶段测验", v: "quiz" as const },
          { label: "我的报告", v: "report" as const },
        ].map(({ label, v }) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className="rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-800 shadow-sm hover:border-violet-300"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
