"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  formatMinutesMarkdown,
  processMeeting,
  sendMinutesEmail,
  syncToCalendar,
  syncToProjectTool,
} from "@/lib/meeting-copilot/engine";
import { MOCK_MEETINGS, createNewMeeting } from "@/lib/meeting-copilot/mock-data";
import type { ActionItem, Meeting } from "@/lib/meeting-copilot/types";

type MeetingTab = "transcript" | "minutes" | "actions" | "decisions" | "quality";

interface MeetingContextValue {
  meetings: Meeting[];
  activeMeeting: Meeting | null;
  view: "list" | "detail";
  tab: MeetingTab;
  setTab: (t: MeetingTab) => void;
  openMeeting: (id: string) => void;
  createMeeting: (title: string) => void;
  backToList: () => void;
  generateMinutes: () => void;
  updateActionItem: (id: string, patch: Partial<ActionItem>) => void;
  syncProject: () => string;
  syncCalendar: () => string;
  sendEmail: () => string;
  copyMinutes: () => string;
  syncToast: string | null;
  clearSyncToast: () => void;
  transcriptVisibleCount: number;
  isSimulatingLive: boolean;
}

const MeetingContext = createContext<MeetingContextValue | null>(null);

export function MeetingProvider({ children }: { children: ReactNode }) {
  const [meetings, setMeetings] = useState<Meeting[]>(MOCK_MEETINGS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "detail">("list");
  const [tab, setTab] = useState<MeetingTab>("transcript");
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const [transcriptVisibleCount, setTranscriptVisibleCount] = useState(0);
  const [isSimulatingLive, setIsSimulatingLive] = useState(false);

  const activeMeeting = useMemo(
    () => meetings.find((m) => m.id === activeId) ?? null,
    [meetings, activeId],
  );

  const updateMeeting = useCallback((id: string, updater: (m: Meeting) => Meeting) => {
    setMeetings((prev) => prev.map((m) => (m.id === id ? updater(m) : m)));
  }, []);

  const openMeeting = useCallback((id: string) => {
    setActiveId(id);
    setView("detail");
    setTab("transcript");
    setTranscriptVisibleCount(0);
    setIsSimulatingLive(true);
    const meeting = meetings.find((m) => m.id === id);
    const total = meeting?.transcript.length ?? 0;
    let count = 0;
    const timer = setInterval(() => {
      count += 1;
      setTranscriptVisibleCount(count);
      if (count >= total) {
        clearInterval(timer);
        setIsSimulatingLive(false);
      }
    }, 400);
  }, [meetings]);

  const createMeeting = useCallback((title: string) => {
    const m = createNewMeeting(title);
    setMeetings((prev) => [m, ...prev]);
    setActiveId(m.id);
    setView("detail");
    setTab("transcript");
    setTranscriptVisibleCount(m.transcript.length);
  }, []);

  const backToList = useCallback(() => {
    setView("list");
    setActiveId(null);
    setIsSimulatingLive(false);
  }, []);

  const generateMinutes = useCallback(() => {
    if (!activeId) return;
    updateMeeting(activeId, (m) => processMeeting(m));
    setTab("minutes");
  }, [activeId, updateMeeting]);

  const updateActionItem = useCallback(
    (id: string, patch: Partial<ActionItem>) => {
      if (!activeId) return;
      updateMeeting(activeId, (m) => ({
        ...m,
        actionItems: m.actionItems?.map((a) =>
          a.id === id ? { ...a, ...patch } : a,
        ),
      }));
    },
    [activeId, updateMeeting],
  );

  const syncProject = useCallback(() => {
    if (!activeMeeting?.actionItems) return "";
    const r = syncToProjectTool(activeMeeting.actionItems);
    setSyncToast(r.message);
    return r.message;
  }, [activeMeeting]);

  const syncCalendar = useCallback(() => {
    if (!activeMeeting) return "";
    const msg = syncToCalendar(activeMeeting);
    setSyncToast(msg);
    return msg;
  }, [activeMeeting]);

  const sendEmail = useCallback(() => {
    if (!activeMeeting) return "";
    const msg = sendMinutesEmail(activeMeeting);
    setSyncToast(msg);
    return msg;
  }, [activeMeeting]);

  const copyMinutes = useCallback(() => {
    if (!activeMeeting) return "";
    return formatMinutesMarkdown(activeMeeting);
  }, [activeMeeting]);

  const value = useMemo(
    () => ({
      meetings,
      activeMeeting,
      view,
      tab,
      setTab,
      openMeeting,
      createMeeting,
      backToList,
      generateMinutes,
      updateActionItem,
      syncProject,
      syncCalendar,
      sendEmail,
      copyMinutes,
      syncToast,
      clearSyncToast: () => setSyncToast(null),
      transcriptVisibleCount,
      isSimulatingLive,
    }),
    [
      meetings,
      activeMeeting,
      view,
      tab,
      openMeeting,
      createMeeting,
      backToList,
      generateMinutes,
      updateActionItem,
      syncProject,
      syncCalendar,
      sendEmail,
      copyMinutes,
      syncToast,
      transcriptVisibleCount,
      isSimulatingLive,
    ],
  );

  return (
    <MeetingContext.Provider value={value}>{children}</MeetingContext.Provider>
  );
}

export function useMeeting() {
  const ctx = useContext(MeetingContext);
  if (!ctx) throw new Error("useMeeting within MeetingProvider");
  return ctx;
}
