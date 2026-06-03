"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useGrowth } from "../growth-context";
import { BarChartSimple } from "./trend-chart";

export function AnalysisView() {
  const { analysis, runAnalysis } = useGrowth();
  const [q, setQ] = useState("为什么本周新用户留存下降？");

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">自然语言分析</h2>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          runAnalysis(q);
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-4 py-2 text-sm text-white"
        >
          <Sparkles className="h-4 w-4" />
          分析
        </button>
      </form>

      {!analysis ? (
        <p className="mt-12 text-center text-sm text-slate-500">
          输入业务问题后生成分析
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          <section className="rounded-xl border border-violet-100 bg-violet-50/50 p-4">
            <p className="text-xs text-violet-600">数据结论</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-800">
              {analysis.conclusion}
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">维度拆解</p>
            <div className="mt-3 h-[200px]">
              <BarChartSimple data={analysis.chartData} />
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <Card title="分群表现" list={analysis.segments.map(
              (s) =>
                `${s.name}：${s.value}${s.share ? `（占比${s.share}%）` : ""}，变化 ${s.change > 0 ? "+" : ""}${s.change}`,
            )} />
            <Card title="可能原因" list={analysis.causes} />
          </div>

          <Card title="下一步建议" list={analysis.nextSteps} highlight />
        </div>
      )}
    </div>
  );
}

function Card({
  title,
  list,
  highlight,
}: {
  title: string;
  list: string[];
  highlight?: boolean;
}) {
  return (
    <section
      className={`rounded-xl border p-4 ${
        highlight
          ? "border-emerald-200 bg-emerald-50/50"
          : "border-slate-200 bg-white"
      }`}
    >
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-600">
        {list.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
