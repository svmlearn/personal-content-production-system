"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MOCK_USERS } from "@/lib/knowledge/mock-data";
import { askKnowledgeBase, getFeedback, openCitation, submitFeedback } from "@/lib/knowledge/rag";
import type {
  AIAnswer,
  FeedbackType,
  KnowledgeChunk,
  User,
} from "@/lib/knowledge/types";

type View = "home" | "qa" | "admin";

interface KnowledgeContextValue {
  user: User;
  setUserByRole: (role: User["role"]) => void;
  view: View;
  setView: (view: View) => void;
  question: string;
  setQuestion: (q: string) => void;
  currentAnswer: AIAnswer | null;
  ask: (text: string) => void;
  feedbackForAnswer: (answerId: string) => FeedbackType | null;
  submitAnswerFeedback: (answerId: string, type: FeedbackType) => void;
  citationChunk: KnowledgeChunk | null;
  openCitationDrawer: (chunkId: string) => void;
  closeCitationDrawer: () => void;
}

const KnowledgeContext = createContext<KnowledgeContextValue | null>(null);

export function KnowledgeProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(MOCK_USERS[0]);
  const [view, setView] = useState<View>("home");
  const [question, setQuestion] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState<AIAnswer | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, FeedbackType>>({});
  const [citationChunk, setCitationChunk] = useState<KnowledgeChunk | null>(null);

  const setUserByRole = useCallback((role: User["role"]) => {
    const next = MOCK_USERS.find((u) => u.role === role);
    if (next) setUser(next);
  }, []);

  const ask = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setQuestion(trimmed);
      const answer = askKnowledgeBase(trimmed, user);
      setCurrentAnswer(answer);
      setView("qa");
    },
    [user],
  );

  const submitAnswerFeedback = useCallback(
    (answerId: string, type: FeedbackType) => {
      submitFeedback(answerId, type);
      setFeedbackMap((prev) => ({ ...prev, [answerId]: type }));
    },
    [],
  );

  const feedbackForAnswer = useCallback(
    (answerId: string) => {
      if (feedbackMap[answerId]) return feedbackMap[answerId];
      const stored = getFeedback(answerId);
      return stored?.type ?? null;
    },
    [feedbackMap],
  );

  const openCitationDrawer = useCallback((chunkId: string) => {
    const chunk = openCitation(chunkId);
    setCitationChunk(chunk);
  }, []);

  const closeCitationDrawer = useCallback(() => setCitationChunk(null), []);

  const value = useMemo(
    () => ({
      user,
      setUserByRole,
      view,
      setView,
      question,
      setQuestion,
      currentAnswer,
      ask,
      feedbackForAnswer,
      submitAnswerFeedback,
      citationChunk,
      openCitationDrawer,
      closeCitationDrawer,
    }),
    [
      user,
      setUserByRole,
      view,
      question,
      currentAnswer,
      ask,
      feedbackForAnswer,
      submitAnswerFeedback,
      citationChunk,
      openCitationDrawer,
      closeCitationDrawer,
    ],
  );

  return (
    <KnowledgeContext.Provider value={value}>{children}</KnowledgeContext.Provider>
  );
}

export function useKnowledge() {
  const ctx = useContext(KnowledgeContext);
  if (!ctx) throw new Error("useKnowledge must be used within KnowledgeProvider");
  return ctx;
}
