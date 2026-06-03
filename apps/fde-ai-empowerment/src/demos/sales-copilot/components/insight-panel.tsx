"use client";

import { Brain } from "lucide-react";
import { useSales } from "../sales-context";

export function InsightPanel() {
  const { insight } = useSales();

  const sections = [
    { title: "可能需求", items: insight.possibleNeeds },
    { title: "决策链风险", items: insight.decisionRisks },
    { title: "推荐切入点", items: insight.entryPoints },
    { title: "竞品风险", items: insight.competitorRisks },
    { title: "下一步建议", items: insight.nextSteps },
  ];

  return (
    <aside className="rounded-xl border border-blue-100 bg-gradient-to-b from-blue-50/80 to-white p-4 shadow-sm">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-blue-900">
        <Brain className="h-4 w-4" />
        AI 客户洞察
      </h3>
      <div className="mt-4 space-y-4">
        {sections.map((s) => (
          <div key={s.title}>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700/80">
              {s.title}
            </p>
            <ul className="mt-1.5 space-y-1">
              {s.items.map((item) => (
                <li
                  key={item}
                  className="text-xs leading-relaxed text-slate-700 before:mr-1.5 before:text-blue-500 before:content-['•']"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
