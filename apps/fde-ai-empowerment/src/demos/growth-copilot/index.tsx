"use client";

import { GrowthProvider, useGrowth } from "./growth-context";
import { AppNav } from "./components/app-nav";
import { DashboardView } from "./components/dashboard-view";
import { AnomalyView } from "./components/anomaly-view";
import { AnalysisView } from "./components/analysis-view";
import { CampaignView } from "./components/campaign-view";
import { ReviewView } from "./components/review-view";

function GrowthCopilotApp() {
  const { view } = useGrowth();

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
      <AppNav />
      {view === "dashboard" && <DashboardView />}
      {view === "anomaly" && <AnomalyView />}
      {view === "analysis" && <AnalysisView />}
      {view === "campaign" && <CampaignView />}
      {view === "review" && <ReviewView />}
    </div>
  );
}

export default function GrowthCopilotDemo() {
  return (
    <GrowthProvider>
      <GrowthCopilotApp />
    </GrowthProvider>
  );
}
