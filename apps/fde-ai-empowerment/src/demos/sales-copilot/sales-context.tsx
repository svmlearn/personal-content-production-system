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
  analyzeCustomer,
  generateFollowUpEmail,
  generateSolutionProposal,
  generateVisitBrief,
  parseNaturalLanguage,
  recommendAllActions,
  summarizeMeeting,
} from "@/lib/sales-copilot/engine";
import { CUSTOMERS, DEFAULT_MEETING_TRANSCRIPT } from "@/lib/sales-copilot/mock-data";
import type {
  CustomerInsight,
  EmailTone,
  FollowUpEmail,
  MeetingNote,
  NextAction,
  Proposal,
  VisitBrief,
} from "@/lib/sales-copilot/types";

export type SalesView =
  | "dashboard"
  | "customer360"
  | "visit"
  | "proposal"
  | "meeting"
  | "email";

interface SalesContextValue {
  view: SalesView;
  setView: (v: SalesView) => void;
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
  customer: (typeof CUSTOMERS)[0];
  insight: CustomerInsight;
  visitBrief: VisitBrief | null;
  proposal: Proposal | null;
  meetingNote: MeetingNote | null;
  followUpEmail: FollowUpEmail | null;
  transcript: string;
  setTranscript: (t: string) => void;
  proposalScenario: string;
  setProposalScenario: (s: string) => void;
  emailTone: EmailTone;
  setEmailTone: (t: EmailTone) => void;
  setEmailToneAndRegenerate: (t: EmailTone) => void;
  nextActions: NextAction[];
  nlMessage: string | null;
  runNlCommand: (input: string) => void;
  generateVisit: () => void;
  generateProposal: () => void;
  parseMeeting: () => void;
  generateEmail: () => void;
  regenerateEmail: () => void;
}

const SalesContext = createContext<SalesContextValue | null>(null);

export function SalesProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<SalesView>("dashboard");
  const [selectedCustomerId, setSelectedCustomerId] = useState(CUSTOMERS[0].id);
  const [visitBrief, setVisitBrief] = useState<VisitBrief | null>(null);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [meetingNote, setMeetingNote] = useState<MeetingNote | null>(null);
  const [followUpEmail, setFollowUpEmail] = useState<FollowUpEmail | null>(null);
  const [transcript, setTranscript] = useState(DEFAULT_MEETING_TRANSCRIPT);
  const [proposalScenario, setProposalScenario] = useState("digital");
  const [emailTone, setEmailTone] = useState<EmailTone>("formal");
  const [nlMessage, setNlMessage] = useState<string | null>(null);

  const customer = useMemo(
    () => CUSTOMERS.find((c) => c.id === selectedCustomerId) ?? CUSTOMERS[0],
    [selectedCustomerId],
  );

  const insight = useMemo(() => analyzeCustomer(customer), [customer]);
  const nextActions = useMemo(() => recommendAllActions(), []);

  const generateVisit = useCallback(() => {
    setVisitBrief(generateVisitBrief(customer));
    setView("visit");
  }, [customer]);

  const generateProposal = useCallback(() => {
    setProposal(generateSolutionProposal(customer, proposalScenario));
    setView("proposal");
  }, [customer, proposalScenario]);

  const parseMeeting = useCallback(() => {
    setMeetingNote(summarizeMeeting(transcript));
    setView("meeting");
  }, [transcript]);

  const generateEmail = useCallback(() => {
    const meeting = meetingNote ?? summarizeMeeting(transcript);
    setMeetingNote(meeting);
    setFollowUpEmail(generateFollowUpEmail(customer, meeting, emailTone));
    setView("email");
  }, [customer, meetingNote, transcript, emailTone]);

  const regenerateEmail = useCallback(() => {
    const meeting = meetingNote ?? summarizeMeeting(transcript);
    setFollowUpEmail(generateFollowUpEmail(customer, meeting, emailTone));
  }, [customer, meetingNote, transcript, emailTone]);

  const setEmailToneAndRegenerate = useCallback(
    (t: EmailTone) => {
      setEmailTone(t);
      const meeting = meetingNote ?? summarizeMeeting(transcript);
      if (meetingNote || transcript) {
        setFollowUpEmail(generateFollowUpEmail(customer, meeting, t));
      }
    },
    [customer, meetingNote, transcript],
  );

  const runNlCommand = useCallback(
    (input: string) => {
      const { route, message } = parseNaturalLanguage(input, customer);
      setNlMessage(message);
      if (route === "proposal") generateProposal();
      else if (route === "email") generateEmail();
      else setView("customer360");
    },
    [customer, generateProposal, generateEmail],
  );

  const value = useMemo(
    () => ({
      view,
      setView,
      selectedCustomerId,
      setSelectedCustomerId,
      customer,
      insight,
      visitBrief,
      proposal,
      meetingNote,
      followUpEmail,
      transcript,
      setTranscript,
      proposalScenario,
      setProposalScenario,
      emailTone,
      setEmailTone,
      setEmailToneAndRegenerate,
      nextActions,
      nlMessage,
      runNlCommand,
      generateVisit,
      generateProposal,
      parseMeeting,
      generateEmail,
      regenerateEmail,
    }),
    [
      view,
      selectedCustomerId,
      customer,
      insight,
      visitBrief,
      proposal,
      meetingNote,
      followUpEmail,
      transcript,
      proposalScenario,
      emailTone,
      setEmailToneAndRegenerate,
      nextActions,
      nlMessage,
      runNlCommand,
      generateVisit,
      generateProposal,
      parseMeeting,
      generateEmail,
      regenerateEmail,
    ],
  );

  return (
    <SalesContext.Provider value={value}>{children}</SalesContext.Provider>
  );
}

export function useSales() {
  const ctx = useContext(SalesContext);
  if (!ctx) throw new Error("useSales must be used within SalesProvider");
  return ctx;
}
