"use client";

import { CAMPAIGN_GOAL_EXAMPLES } from "@/lib/growth-copilot/constants";
import { useBi } from "../bi-context";

export function CampaignView() {
  const {
    campaignPlan,
    growthStrategy,
    campaignGoal,
    setCampaignGoal,
    generateCampaign,
  } = useBi();

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">增长策略 & 活动方案</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        <input
          value={campaignGoal}
          onChange={(e) => setCampaignGoal(e.target.value)}
          className="min-w-[200px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={generateCampaign}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm text-white"
        >
          生成
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {CAMPAIGN_GOAL_EXAMPLES.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setCampaignGoal(g)}
            className="rounded-full border px-2.5 py-1 text-[11px] text-slate-600"
          >
            {g}
          </button>
        ))}
      </div>

      {!growthStrategy && !campaignPlan ? (
        <p className="mt-12 text-center text-sm text-slate-500">输入目标后生成</p>
      ) : (
        <div className="mt-6 space-y-4">
          {growthStrategy && (
            <section className="rounded-xl border border-teal-100 bg-teal-50/40 p-4">
              <h3 className="text-sm font-semibold text-teal-900">增长策略</h3>
              <p className="mt-1 text-sm text-slate-700">{growthStrategy.goal}</p>
              <ul className="mt-2 list-disc pl-4 text-sm text-slate-600">
                {growthStrategy.initiatives.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </section>
          )}
          {campaignPlan && (
            <>
              <Block title="目标人群" text={campaignPlan.targetAudience} />
              <ListBlock title="活动机制" items={campaignPlan.mechanism} />
              <ListBlock title="推送节奏" items={campaignPlan.pushSchedule} />
              <ListBlock title="执行 Checklist" items={campaignPlan.checklist} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Block({ title, text }: { title: string; text: string }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{text}</p>
    </section>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-2 list-disc pl-4 text-sm text-slate-600">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </section>
  );
}
