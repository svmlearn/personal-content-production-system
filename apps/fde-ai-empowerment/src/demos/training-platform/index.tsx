"use client";

import { TrainingProvider, useTraining } from "./training-context";
import { AppNav } from "./components/app-nav";
import { HomeView } from "./components/home-view";
import { PathView } from "./components/path-view";
import { QaView } from "./components/qa-view";
import { RoleplayView } from "./components/roleplay-view";
import { QuizView } from "./components/quiz-view";
import { ReportView } from "./components/report-view";
import { AdminView } from "./components/admin-view";

function TrainingApp() {
  const { view } = useTraining();

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
      <AppNav />
      {view === "home" && <HomeView />}
      {view === "path" && <PathView />}
      {view === "qa" && <QaView />}
      {view === "roleplay" && <RoleplayView />}
      {view === "quiz" && <QuizView />}
      {view === "report" && <ReportView />}
      {view === "admin" && <AdminView />}
    </div>
  );
}

export default function TrainingPlatformDemo() {
  return (
    <TrainingProvider>
      <TrainingApp />
    </TrainingProvider>
  );
}
