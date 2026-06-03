"use client";

import { BiProvider, useBi } from "./bi-context";
import { AppNav } from "./components/app-nav";
import { DashboardView } from "./components/dashboard-view";
import { CatalogView } from "./components/catalog-view";
import { AnomalyView } from "./components/anomaly-view";
import { AnalysisView } from "./components/analysis-view";
import { SqlView } from "./components/sql-view";
import { CampaignView } from "./components/campaign-view";
import { ReviewView } from "./components/review-view";

function BiCopilotApp() {
  const { view } = useBi();

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
      <AppNav />
      {view === "dashboard" && <DashboardView />}
      {view === "catalog" && <CatalogView />}
      {view === "anomaly" && <AnomalyView />}
      {view === "analysis" && <AnalysisView />}
      {view === "sql" && <SqlView />}
      {view === "campaign" && <CampaignView />}
      {view === "review" && <ReviewView />}
    </div>
  );
}

export default function BiCopilotDemo() {
  return (
    <BiProvider>
      <BiCopilotApp />
    </BiProvider>
  );
}
