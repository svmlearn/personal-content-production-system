"use client";

import { DevProvider, useDev } from "./dev-context";
import { Home } from "./components/home";
import { Workspace } from "./components/workspace";

function DevCopilotApp() {
  const { mode } = useDev();
  return (
    <>
      {mode === "home" ? <Home /> : null}
      <Workspace />
    </>
  );
}

export default function DevCopilotDemo() {
  return (
    <DevProvider>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <DevCopilotApp />
      </div>
    </DevProvider>
  );
}
