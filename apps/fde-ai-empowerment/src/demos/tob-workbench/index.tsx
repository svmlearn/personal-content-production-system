"use client";

import { WorkbenchProvider, useWorkbench } from "./workbench-context";
import { AppShell } from "./components/app-shell";
import { WorkbenchView } from "./components/workbench-view";
import { TaskView } from "./components/task-view";
import { ResultView } from "./components/result-view";
import { HistoryView } from "./components/history-view";
import { AdminView } from "./components/admin-view";

function TobWorkbenchApp() {
  const { view } = useWorkbench();

  return (
    <AppShell>
      {view === "workbench" && <WorkbenchView />}
      {view === "task" && <TaskView />}
      {view === "result" && <ResultView />}
      {view === "history" && <HistoryView />}
      {view === "admin" && <AdminView />}
    </AppShell>
  );
}

export default function TobWorkbenchDemo() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
      <WorkbenchProvider>
        <TobWorkbenchApp />
      </WorkbenchProvider>
    </div>
  );
}
