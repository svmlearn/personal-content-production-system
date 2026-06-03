"use client";

import { useSales } from "../sales-context";
import { CustomerPicker } from "./customer-picker";

export function VisitView() {
  const { visitBrief, generateVisit, customer } = useSales();

  if (!visitBrief) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <p className="text-sm text-slate-500">请先在客户 360 点击「生成拜访准备」</p>
        <button
          type="button"
          onClick={generateVisit}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
        >
          为 {customer.name} 生成
        </button>
      </div>
    );
  }

  const sections = [
    { title: "客户背景摘要", content: visitBrief.background, type: "text" as const },
    { title: "行业趋势", items: visitBrief.industryTrends },
    { title: "可能痛点", items: visitBrief.likelyPains },
    { title: "推荐产品模块", items: visitBrief.recommendedModules },
    { title: "提问清单", items: visitBrief.questionList },
    { title: "会议目标", items: visitBrief.meetingGoals },
    { title: "风险提醒", items: visitBrief.risks },
  ];

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">拜访准备</h2>
        <CustomerPicker compact />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((s) => (
          <section
            key={s.title}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <h3 className="text-sm font-semibold text-slate-900">{s.title}</h3>
            {"content" in s && s.type === "text" ? (
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {s.content}
              </p>
            ) : (
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-600">
                {"items" in s &&
                  s.items?.map((item) => <li key={item}>{item}</li>)}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
