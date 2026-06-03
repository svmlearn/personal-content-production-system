"use client";

import { ServiceProvider, useService } from "./service-context";
import { AppNav } from "./components/app-nav";
import { CustomerView } from "./components/customer-view";
import { AgentView } from "./components/agent-view";
import { SupervisorView } from "./components/supervisor-view";

function SmartCustomerServiceApp() {
  const { view } = useService();

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <AppNav />
      {view === "customer" && <CustomerView />}
      {view === "agent" && <AgentView />}
      {view === "supervisor" && <SupervisorView />}
    </div>
  );
}

export default function SmartCustomerServiceDemo() {
  return (
    <ServiceProvider>
      <SmartCustomerServiceApp />
    </ServiceProvider>
  );
}
