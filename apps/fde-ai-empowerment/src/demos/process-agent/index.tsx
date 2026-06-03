"use client";

import { ProcessProvider } from "./process-context";
import { Workbench } from "./components/workbench";

export default function ProcessAgentDemo() {
  return (
    <ProcessProvider>
      <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
        <Workbench />
      </div>
    </ProcessProvider>
  );
}
