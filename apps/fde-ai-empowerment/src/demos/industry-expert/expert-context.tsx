"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { KNOWLEDGE_BASE } from "@/lib/industry-expert/mock-data";
import {
  createReviewFromAnswer,
  detectProfessionalRisks,
  generateExpertAnswer,
  generateIndustryReport,
  searchIndustryKnowledge,
  submitExpertReview,
} from "@/lib/industry-expert/engine";
import type {
  ExpertAnswer,
  ExpertReview,
  ExpertView,
  IndustryKnowledge,
  ProfessionalReport,
  RiskItem,
} from "@/lib/industry-expert/types";

interface ExpertContextValue {
  view: ExpertView;
  setView: (v: ExpertView) => void;
  question: string;
  setQuestion: (s: string) => void;
  answer: ExpertAnswer | null;
  askExpert: (q?: string) => void;
  knowledge: IndustryKnowledge[];
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  searchKnowledge: () => void;
  riskInput: string;
  setRiskInput: (s: string) => void;
  risks: RiskItem[];
  analyzeRisks: () => void;
  reportInput: string;
  setReportInput: (s: string) => void;
  report: ProfessionalReport | null;
  generateReport: () => void;
  review: ExpertReview | null;
  submitReview: (comment: string, approved: boolean) => void;
}

const ExpertContext = createContext<ExpertContextValue | null>(null);

export function ExpertProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<ExpertView>("home");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<ExpertAnswer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [knowledge, setKnowledge] = useState<IndustryKnowledge[]>(KNOWLEDGE_BASE);
  const [riskInput, setRiskInput] = useState("");
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [reportInput, setReportInput] = useState("");
  const [report, setReport] = useState<ProfessionalReport | null>(null);
  const [review, setReview] = useState<ExpertReview | null>(null);

  const askExpert = useCallback(
    (q?: string) => {
      const text = q ?? question;
      if (q) setQuestion(q);
      const sources = searchIndustryKnowledge(text);
      const ans = generateExpertAnswer(text, sources);
      setAnswer(ans);
      if (ans.needsReview) setReview(createReviewFromAnswer(ans));
      setView("qa");
    },
    [question],
  );

  const searchKnowledge = useCallback(() => {
    const q = searchQuery.trim();
    setKnowledge(
      q ? searchIndustryKnowledge(q) : KNOWLEDGE_BASE,
    );
  }, [searchQuery]);

  const analyzeRisks = useCallback(() => {
    const found = detectProfessionalRisks(riskInput);
    setRisks(found);
    const maxLevel = found.some((r) => r.level === "critical")
      ? "critical"
      : found.some((r) => r.level === "high")
        ? "high"
        : "medium";
    if (maxLevel === "critical" || maxLevel === "high") {
      setReview({
        id: `rev-risk-${Date.now()}`,
        status: "pending",
        aiSuggestion: `识别 ${found.length} 项风险，最高等级 ${maxLevel}，建议专家复核后采取授信措施。`,
      });
    }
  }, [riskInput]);

  const generateReport = useCallback(() => {
    const rpt = generateIndustryReport(reportInput);
    setReport(rpt);
    if (rpt.reviewStatus === "pending") {
      setReview({
        id: `rev-rpt-${Date.now()}`,
        status: "pending",
        aiSuggestion: rpt.recommendations[0] ?? "报告已生成，需专家复核。",
      });
    }
  }, [reportInput]);

  const submitReview = useCallback(
    (comment: string, approved: boolean) => {
      if (!review) return;
      setReview(submitExpertReview(review, comment, approved));
      if (report) {
        setReport({
          ...report,
          reviewStatus: approved ? "approved" : "rejected",
        });
      }
    },
    [review, report],
  );

  const value = useMemo(
    () => ({
      view,
      setView,
      question,
      setQuestion,
      answer,
      askExpert,
      knowledge,
      searchQuery,
      setSearchQuery,
      searchKnowledge,
      riskInput,
      setRiskInput,
      risks,
      analyzeRisks,
      reportInput,
      setReportInput,
      report,
      generateReport,
      review,
      submitReview,
    }),
    [
      view,
      question,
      answer,
      askExpert,
      knowledge,
      searchQuery,
      searchKnowledge,
      riskInput,
      risks,
      analyzeRisks,
      reportInput,
      report,
      generateReport,
      review,
      submitReview,
    ],
  );

  return <ExpertContext.Provider value={value}>{children}</ExpertContext.Provider>;
}

export function useExpert() {
  const ctx = useContext(ExpertContext);
  if (!ctx) throw new Error("useExpert within ExpertProvider");
  return ctx;
}
