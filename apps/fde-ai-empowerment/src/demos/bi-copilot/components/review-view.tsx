"use client";

import { CAMPAIGNS } from "@/lib/growth-copilot/mock-data";
import { useBi } from "../bi-context";

export function ReviewView() {
  const {
    reviewReport,
    selectedCampaignId,
    setSelectedCampaignId,
    generateReview,
  } = useBi();

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold text-slate-900">运营复盘报告</h2>
        <select
          value={selectedCampaignId}
          onChange={(e) => setSelectedCampaignId(e.target.value)}
          className="rounded-lg border px-2 py-1 text-sm"
        >
          {CAMPAIGNS.filter((c) => c.status === "completed").map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={generateReview}
          className="rounded-lg bg-teal-600 px-3 py-1.5 text-sm text-white"
        >
          生成复盘
        </button>
      </div>

      {reviewReport ? (
        <article className="mt-6 space-y-4 text-sm text-slate-700">
          <Section title="背景" text={reviewReport.background} />
          <Section title="达成情况" text={reviewReport.goalAchievement} />
          <div className="rounded-xl border bg-white p-4">
            <h3 className="font-semibold">核心数据</h3>
            <ul className="mt-2 space-y-1">
              {reviewReport.coreData.map((d) => (
                <li key={d.label}>
                  {d.label}：{d.value}
                </li>
              ))}
            </ul>
          </div>
          <ListSection title="亮点" items={reviewReport.highlights} />
          <ListSection title="问题" items={reviewReport.issues} />
          <ListSection title="优化建议" items={reviewReport.optimizations} />
        </article>
      ) : (
        <p className="mt-12 text-center text-sm text-slate-500">选择活动生成复盘</p>
      )}
    </div>
  );
}

function Section({ title, text }: { title: string; text: string }) {
  return (
    <section className="rounded-xl border bg-white p-4">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-2">{text}</p>
    </section>
  );
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-xl border bg-white p-4">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <ul className="mt-2 list-disc pl-4">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </section>
  );
}
