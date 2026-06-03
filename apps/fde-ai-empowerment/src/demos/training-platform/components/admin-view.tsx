"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTraining } from "../training-context";

export function AdminView() {
  const { deptStats } = useTraining();

  const chartData = deptStats.map((d) => ({
    name: d.department.replace("华东", "").slice(0, 6),
    completion: d.completionRate,
    score: d.avgScore,
  }));

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <p className="text-sm text-slate-600">
        HR / 管理者视图 · Mock 部门数据，可对接 HR 学习系统。
      </p>

      <div className="h-56 min-w-0 rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="mb-2 text-sm font-semibold">部门完成率 & 均分</h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="completion" name="完成率%" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="score" name="均分" fill="#c4b5fd" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {deptStats.map((dept) => (
        <div key={dept.department} className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap justify-between gap-2">
            <h3 className="font-semibold text-slate-900">{dept.department}</h3>
            <span className="text-sm text-slate-500">
              完成率 {dept.completionRate}% · 均分 {dept.avgScore}
            </span>
          </div>
          <p className="mt-2 text-xs text-amber-800">
            高频薄弱：{dept.weakTopics.join("、")}
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-emerald-700">优秀学员</p>
              <ul className="mt-1 text-sm text-slate-600">
                {dept.topLearners.map((l) => (
                  <li key={l.name}>
                    {l.name} — {l.score} 分
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium text-red-700">需跟进</p>
              <ul className="mt-1 text-sm text-slate-600">
                {dept.followUp.map((f) => (
                  <li key={f.name}>
                    {f.name}：{f.reason}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
