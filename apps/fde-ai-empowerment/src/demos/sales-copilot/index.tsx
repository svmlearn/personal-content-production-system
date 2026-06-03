"use client";

import { SalesProvider, useSales } from "./sales-context";
import { AppNav } from "./components/app-nav";
import { DashboardView } from "./components/dashboard-view";
import { Customer360View } from "./components/customer-360-view";
import { VisitView } from "./components/visit-view";
import { ProposalView } from "./components/proposal-view";
import { MeetingView } from "./components/meeting-view";
import { EmailView } from "./components/email-view";

function SalesCopilotApp() {
  const { view } = useSales();

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
      <AppNav />
      {view === "dashboard" && <DashboardView />}
      {view === "customer360" && <Customer360View />}
      {view === "visit" && <VisitView />}
      {view === "proposal" && <ProposalView />}
      {view === "meeting" && <MeetingView />}
      {view === "email" && <EmailView />}
    </div>
  );
}

export default function SalesCopilotDemo() {
  return (
    <SalesProvider>
      <SalesCopilotApp />
    </SalesProvider>
  );
}
