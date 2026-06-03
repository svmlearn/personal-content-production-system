"use client";

import { ExpertProvider, useExpert } from "./expert-context";
import { AppNav } from "./components/app-nav";
import { HomeView } from "./components/home-view";
import { QaView } from "./components/qa-view";
import { KnowledgeView } from "./components/knowledge-view";
import { RiskView } from "./components/risk-view";
import { ReportView } from "./components/report-view";
import { ReviewView } from "./components/review-view";

function IndustryExpertApp() {
  const { view } = useExpert();

  return (
    <div className="min-h-[600px] overflow-hidden rounded-xl border border-slate-700 bg-slate-950 text-slate-200 shadow-xl">
      <AppNav />
      {view === "home" && <HomeView />}
      {view === "qa" && <QaView />}
      {view === "knowledge" && <KnowledgeView />}
      {view === "risk" && <RiskView />}
      {view === "report" && <ReportView />}
      {view === "review" && <ReviewView />}
    </div>
  );
}

export default function IndustryExpertDemo() {
  return (
    <ExpertProvider>
      <IndustryExpertApp />
    </ExpertProvider>
  );
}
