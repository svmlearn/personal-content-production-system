"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useBi } from "../bi-context";
import { BarChartSimple } from "../../growth-copilot/components/trend-chart";

export function AnalysisView() {
  const { analysis, sqlPreview, runAnalysis } = useBi();
  const [q, setQ] = useState("为什么本周新用户留存下降？");

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">智能分析</h2>
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
          className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-4 py-2 text-sm text-white"
        >
          <Sparkles className="h-4 w-4" />
          分析
        </button>
      </form>

      {!analysis ? (
        <p className="mt-12 text-center text-sm text-slate-500">输入问题开始分析</p>
      ) : (
        <div className="mt-6 space-y-4">
          <section className="rounded-xl border border-teal-100 bg-teal-50/50 p-4">
            <p className="text-xs font-medium text-teal-700">数据结论</p>
            <p className="mt-1 text-sm text-slate-800">{analysis.conclusion}</p>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold">维度图表</p>
            <div className="mt-2 h-[200px]">
              <BarChartSimple data={analysis.chartData} color="#0d9488" />
            </div>
          </section>
          {sqlPreview && (
            <section className="rounded-xl border border-slate-200 bg-slate-900 p-4">
              <p className="text-xs font-medium text-teal-400">关联 SQL 预览</p>
              <pre className="mt-2 overflow-x-auto text-xs text-slate-300">
                {sqlPreview.sql}
              </pre>
            </section>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <ListCard title="可能原因" items={analysis.causes} />
            <ListCard title="下一步" items={analysis.nextSteps} highlight />
          </div>
        </div>
      )}
    </div>
  );
}

function ListCard({
  title,
  items,
  highlight,
}: {
  title: string;
  items: string[];
  highlight?: boolean;
}) {
  return (
    <section
      className={`rounded-xl border p-4 ${
        highlight ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-white"
      }`}
    >
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-600">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </section>
  );
}
