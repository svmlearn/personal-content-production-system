"use client";

import { QcProvider, useQc } from "./qc-context";
import { Home } from "./components/home";
import { Workspace } from "./components/workspace";

function QcRiskApp() {
  const { mode } = useQc();
  return (
    <>
      {mode === "home" ? <Home /> : null}
      <Workspace />
    </>
  );
}

export default function QcRiskCopilotDemo() {
  return (
    <QcProvider>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <QcRiskApp />
      </div>
    </QcProvider>
  );
}
