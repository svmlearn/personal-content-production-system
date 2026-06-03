"use client";

import { CAMPAIGN_GOAL_EXAMPLES } from "@/lib/growth-copilot/constants";
import { useGrowth } from "../growth-context";

export function CampaignView() {
  const { campaignPlan, campaignGoal, setCampaignGoal, generateCampaign } =
    useGrowth();

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">活动方案生成</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        <input
          value={campaignGoal}
          onChange={(e) => setCampaignGoal(e.target.value)}
          className="min-w-[200px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="输入活动目标…"
        />
        <button
          type="button"
          onClick={generateCampaign}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white"
        >
          生成方案
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {CAMPAIGN_GOAL_EXAMPLES.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setCampaignGoal(g)}
            className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] text-slate-600 hover:border-violet-300"
          >
            {g}
          </button>
        ))}
      </div>

      {!campaignPlan ? (
        <p className="mt-12 text-center text-sm text-slate-500">
          输入目标后点击生成
        </p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <PlanBlock title="活动目标" text={campaignPlan.goal} />
          <PlanBlock title="目标人群" text={campaignPlan.targetAudience} />
          <ListBlock title="活动机制" items={campaignPlan.mechanism} />
          <ListBlock title="推送节奏" items={campaignPlan.pushSchedule} />
          <ListBlock title="内容话术" items={campaignPlan.copyVariants} />
          <ListBlock title="风险点" items={campaignPlan.risks} />
          <div className="rounded-xl border border-slate-200 bg-white p-4 md:col-span-2">
            <h3 className="text-sm font-semibold">预估指标</h3>
            <dl className="mt-2 grid gap-2 sm:grid-cols-2">
              {campaignPlan.estimatedMetrics.map((m) => (
                <div key={m.label} className="flex justify-between text-sm">
                  <dt className="text-slate-500">{m.label}</dt>
                  <dd className="font-medium text-violet-700">{m.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <ListBlock
            title="执行 Checklist"
            items={campaignPlan.checklist}
            full
          />
        </div>
      )}
    </div>
  );
}

function PlanBlock({ title, text }: { title: string; text: string }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{text}</p>
    </section>
  );
}

function ListBlock({
  title,
  items,
  full,
}: {
  title: string;
  items: string[];
  full?: boolean;
}) {
  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white p-4 ${full ? "md:col-span-2" : ""}`}
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
