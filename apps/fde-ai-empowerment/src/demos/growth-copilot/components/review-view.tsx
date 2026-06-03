"use client";

import { CAMPAIGNS } from "@/lib/growth-copilot/mock-data";
import { useGrowth } from "../growth-context";

export function ReviewView() {
  const {
    reviewReport,
    selectedCampaignId,
    setSelectedCampaignId,
    generateReview,
  } = useGrowth();

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold text-slate-900">运营复盘报告</h2>
        <select
          value={selectedCampaignId}
          onChange={(e) => setSelectedCampaignId(e.target.value)}
          className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
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
          className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm text-white"
        >
          生成复盘
        </button>
      </div>

      {!reviewReport ? (
        <p className="mt-12 text-center text-sm text-slate-500">
          选择历史活动并生成 AI 复盘
        </p>
      ) : (
        <article className="mt-6 space-y-4">
          <Section title="活动背景" text={reviewReport.background} />
          <Section title="目标达成" text={reviewReport.goalAchievement} />
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold">核心数据</h3>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              {reviewReport.coreData.map((d) => (
                <li key={d.label}>
                  <span className="font-medium text-slate-800">{d.label}：</span>
                  {d.value}
                </li>
              ))}
            </ul>
          </div>
          <TwoCol title="亮点" items={reviewReport.highlights} positive />
          <TwoCol title="问题" items={reviewReport.issues} />
          <ListSection title="原因分析" items={reviewReport.rootCauses} />
          <ListSection
            title="后续优化"
            items={reviewReport.optimizations}
            highlight
          />
        </article>
      )}
    </div>
  );
}

function Section({ title, text }: { title: string; text: string }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
    </section>
  );
}

function TwoCol({
  title,
  items,
  positive,
}: {
  title: string;
  items: string[];
  positive?: boolean;
}) {
  return (
    <section
      className={`rounded-xl border p-4 ${
        positive
          ? "border-emerald-200 bg-emerald-50/40"
          : "border-red-100 bg-red-50/30"
      }`}
    >
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-700">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </section>
  );
}

function ListSection({
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
        highlight ? "border-violet-200 bg-violet-50/40" : "border-slate-200 bg-white"
      }`}
    >
      <h3 className="text-sm font-semibold">{title}</h3>
      <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-slate-600">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ol>
    </section>
  );
}
