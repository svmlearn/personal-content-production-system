"use client";

import { MeetingProvider, useMeeting } from "./meeting-context";
import { MeetingList } from "./components/meeting-list";
import { MeetingDetail } from "./components/meeting-detail";

function MeetingCopilotApp() {
  const { view } = useMeeting();
  return view === "list" ? <MeetingList /> : <MeetingDetail />;
}

export default function MeetingCopilotDemo() {
  return (
    <MeetingProvider>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
        <MeetingCopilotApp />
      </div>
    </MeetingProvider>
  );
}
