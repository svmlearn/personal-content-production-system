"use client";

import { KnowledgeProvider, useKnowledge } from "./knowledge-context";
import { AppNav } from "./components/app-nav";
import { RoleSwitcher } from "./components/role-switcher";
import { HomeView } from "./components/home-view";
import { QaView } from "./components/qa-view";
import { AdminView } from "./components/admin-view";
import { CitationDrawer } from "./components/citation-drawer";

function EnterpriseKnowledgeApp() {
  const { view } = useKnowledge();

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50 shadow-sm">
      <header className="flex flex-col gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <AppNav />
        <RoleSwitcher />
      </header>

      <div className="min-h-[480px] bg-gradient-to-b from-white to-slate-50/80">
        {view === "home" && <HomeView />}
        {view === "qa" && <QaView />}
        {view === "admin" && <AdminView />}
      </div>

      <CitationDrawer />
    </div>
  );
}

export default function EnterpriseKnowledgeDemo() {
  return (
    <KnowledgeProvider>
      <EnterpriseKnowledgeApp />
    </KnowledgeProvider>
  );
}
