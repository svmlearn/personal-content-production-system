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
  analyzeLogs,
  analyzeRequirement,
  explainCode,
  generateApiDoc,
  generateTestCases,
  reviewCode,
  routeNaturalLanguage,
} from "@/lib/dev-copilot/engine";
import type {
  ApiDocument,
  CodeExplanation,
  CodeReviewResult,
  DevMode,
  LogAnalysis,
  RequirementAnalysis,
  TestCase,
} from "@/lib/dev-copilot/types";

interface DevContextValue {
  mode: DevMode;
  setMode: (m: DevMode) => void;
  input: string;
  setInput: (s: string) => void;
  run: () => void;
  analyze: () => void;
  reqResult: RequirementAnalysis | null;
  codeResult: CodeExplanation | null;
  testResult: TestCase[] | null;
  logResult: LogAnalysis | null;
  reviewResult: CodeReviewResult | null;
  apiResult: ApiDocument | null;
}

const DevContext = createContext<DevContextValue | null>(null);

export function DevProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<DevMode>("home");
  const [input, setInput] = useState("");
  const [reqResult, setReqResult] = useState<RequirementAnalysis | null>(null);
  const [codeResult, setCodeResult] = useState<CodeExplanation | null>(null);
  const [testResult, setTestResult] = useState<TestCase[] | null>(null);
  const [logResult, setLogResult] = useState<LogAnalysis | null>(null);
  const [reviewResult, setReviewResult] = useState<CodeReviewResult | null>(null);
  const [apiResult, setApiResult] = useState<ApiDocument | null>(null);

  const runForMode = useCallback((m: DevMode, text: string) => {
    switch (m) {
      case "requirement":
        setReqResult(analyzeRequirement(text));
        break;
      case "code":
        setCodeResult(explainCode(text));
        break;
      case "test":
        setTestResult(generateTestCases(text));
        break;
      case "log":
        setLogResult(analyzeLogs(text));
        break;
      case "review":
        setReviewResult(reviewCode(text));
        break;
      case "api":
        setApiResult(generateApiDoc(text));
        break;
      default:
        break;
    }
  }, []);

  const analyze = useCallback(() => {
    if (mode === "home") return;
    runForMode(mode, input);
  }, [mode, input, runForMode]);

  const run = useCallback(() => {
    const target = routeNaturalLanguage(input);
    if (target === "home") return;
    setMode(target);
    runForMode(target, input);
  }, [input, runForMode]);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      input,
      setInput,
      run,
      analyze,
      reqResult,
      codeResult,
      testResult,
      logResult,
      reviewResult,
      apiResult,
    }),
    [
      mode,
      input,
      run,
      analyze,
      reqResult,
      codeResult,
      testResult,
      logResult,
      reviewResult,
      apiResult,
    ],
  );

  return <DevContext.Provider value={value}>{children}</DevContext.Provider>;
}

export function useDev() {
  const ctx = useContext(DevContext);
  if (!ctx) throw new Error("useDev within DevProvider");
  return ctx;
}
