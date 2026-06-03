"use client";

import { getMetricCatalog } from "@/lib/bi-copilot/engine";

export function CatalogView() {
  const catalog = getMetricCatalog();

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">指标语义目录</h2>
      <p className="mt-1 text-sm text-slate-500">
        统一口径定义 · 对接数仓语义层（Mock）
      </p>
      <ul className="mt-6 space-y-4">
        {catalog.map((m) => (
          <li
            key={m.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-slate-900">{m.name}</h3>
              <span className="text-xs text-slate-500">
                {m.owner} · {m.refreshCycle}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{m.definition}</p>
            <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-teal-300">
              {m.formula}
            </pre>
            <p className="mt-2 text-xs text-slate-500">
              可分析维度：{m.dimensions.join(" · ")}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
