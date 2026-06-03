"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { buildFunnelAnalysis } from "@/lib/bi-copilot/engine";

const COLORS = ["#0d9488", "#14b8a6", "#2dd4bf", "#5eead4", "#99f6e4"];

export function FunnelChart() {
  const data = buildFunnelAnalysis();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">转化漏斗（本周）</h3>
      <div className="mt-3 h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 72 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis type="number" tick={{ fontSize: 10 }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11 }}
              width={68}
            />
            <Tooltip
              formatter={(v, name) => {
                if (name === "users") return [v, "人数"];
                return [v, name];
              }}
              contentStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="users" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-500">
        {data.slice(1).map((s) => (
          <li key={s.name}>
            {s.name} 流失 {s.dropoff}%
          </li>
        ))}
      </ul>
    </div>
  );
}
