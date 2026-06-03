"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEPARTMENT_STATS, DEMO_EMPLOYEE } from "@/lib/training/mock-data";
import {
  answerTrainingQuestion,
  generateLearningPath,
  generateLearningReport,
  generateQuiz,
  getAllRolePaths,
  gradeQuiz,
  scoreRoleplay,
  simulateRoleplay,
} from "@/lib/training/engine";
import type {
  DepartmentStats,
  Employee,
  LearningPath,
  Quiz,
  QuizAnswer,
  QuizGradeResult,
  RoleplayMessage,
  RoleplayRole,
  RoleplayScore,
  ScoreReport,
  TrainingAnswer,
  TrainingView,
} from "@/lib/training/types";

interface TrainingContextValue {
  view: TrainingView;
  setView: (v: TrainingView) => void;
  employee: Employee;
  setEmployeeRole: (role: Employee["role"]) => void;
  myPath: LearningPath;
  allPaths: LearningPath[];
  qaInput: string;
  setQaInput: (s: string) => void;
  qaResult: TrainingAnswer | null;
  askQuestion: (override?: string) => void;
  roleplayRole: RoleplayRole;
  setRoleplayRole: (r: RoleplayRole) => void;
  roleplayMessages: RoleplayMessage[];
  sendRoleplay: (text: string) => void;
  resetRoleplay: () => void;
  roleplayScore: RoleplayScore | null;
  finishRoleplay: () => void;
  quiz: Quiz | null;
  startQuiz: (courseTitle: string) => void;
  quizAnswers: QuizAnswer[];
  setQuizAnswer: (questionId: string, value: string | string[]) => void;
  quizGrade: QuizGradeResult | null;
  submitQuiz: () => void;
  report: ScoreReport | null;
  refreshReport: () => void;
  deptStats: DepartmentStats[];
}

const TrainingContext = createContext<TrainingContextValue | null>(null);

export function TrainingProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<TrainingView>("home");
  const [employee, setEmployee] = useState<Employee>(DEMO_EMPLOYEE);
  const [qaInput, setQaInput] = useState("这个产品卖点怎么讲？");
  const [qaResult, setQaResult] = useState<TrainingAnswer | null>(null);
  const [roleplayRole, setRoleplayRole] = useState<RoleplayRole>("objection");
  const [roleplayMessages, setRoleplayMessages] = useState<RoleplayMessage[]>([]);
  const [roleplayScore, setRoleplayScore] = useState<RoleplayScore | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [quizGrade, setQuizGrade] = useState<QuizGradeResult | null>(null);
  const [report, setReport] = useState<ScoreReport | null>(null);

  const myPath = useMemo(
    () => generateLearningPath({ role: employee.role }),
    [employee.role],
  );
  const allPaths = useMemo(() => getAllRolePaths(), []);

  const setEmployeeRole = useCallback((role: Employee["role"]) => {
    setEmployee((e) => ({ ...e, role }));
  }, []);

  const askQuestion = useCallback((override?: string) => {
    const q = override ?? qaInput;
    if (override) setQaInput(override);
    setQaResult(answerTrainingQuestion(q));
  }, [qaInput]);

  const resetRoleplay = useCallback(() => {
    setRoleplayMessages([]);
    setRoleplayScore(null);
    const opener = simulateRoleplay(roleplayRole, "", []);
    setRoleplayMessages([
      {
        role: "assistant",
        content: opener,
        at: new Date().toISOString(),
      },
    ]);
  }, [roleplayRole]);

  const sendRoleplay = useCallback(
    (text: string) => {
      const now = new Date().toISOString();
      const userMsg: RoleplayMessage = { role: "user", content: text, at: now };
      const nextHistory = [...roleplayMessages, userMsg];
      const reply = simulateRoleplay(roleplayRole, text, nextHistory);
      setRoleplayMessages([
        ...nextHistory,
        { role: "assistant", content: reply, at: new Date().toISOString() },
      ]);
    },
    [roleplayMessages, roleplayRole],
  );

  const finishRoleplay = useCallback(() => {
    setRoleplayScore(scoreRoleplay(roleplayRole, roleplayMessages));
  }, [roleplayRole, roleplayMessages]);

  const startQuiz = useCallback((courseTitle: string) => {
    const q = generateQuiz(courseTitle);
    setQuiz(q);
    setQuizAnswers([]);
    setQuizGrade(null);
  }, []);

  const setQuizAnswer = useCallback(
    (questionId: string, value: string | string[]) => {
      setQuizAnswers((prev) => {
        const rest = prev.filter((a) => a.questionId !== questionId);
        return [...rest, { questionId, value }];
      });
    },
    [],
  );

  const submitQuiz = useCallback(() => {
    if (!quiz) return;
    setQuizGrade(gradeQuiz(quiz, quizAnswers));
  }, [quiz, quizAnswers]);

  const refreshReport = useCallback(() => {
    setReport(generateLearningReport(employee));
  }, [employee]);

  const value = useMemo(
    () => ({
      view,
      setView,
      employee,
      setEmployeeRole,
      myPath,
      allPaths,
      qaInput,
      setQaInput,
      qaResult,
      askQuestion,
      roleplayRole,
      setRoleplayRole,
      roleplayMessages,
      sendRoleplay,
      resetRoleplay,
      roleplayScore,
      finishRoleplay,
      quiz,
      startQuiz,
      quizAnswers,
      setQuizAnswer,
      quizGrade,
      submitQuiz,
      report,
      refreshReport,
      deptStats: DEPARTMENT_STATS,
    }),
    [
      view,
      employee,
      setEmployeeRole,
      myPath,
      allPaths,
      qaInput,
      qaResult,
      askQuestion,
      roleplayRole,
      roleplayMessages,
      sendRoleplay,
      resetRoleplay,
      roleplayScore,
      finishRoleplay,
      quiz,
      startQuiz,
      quizAnswers,
      setQuizAnswer,
      quizGrade,
      submitQuiz,
      report,
      refreshReport,
    ],
  );

  return (
    <TrainingContext.Provider value={value}>{children}</TrainingContext.Provider>
  );
}

export function useTraining() {
  const ctx = useContext(TrainingContext);
  if (!ctx) throw new Error("useTraining within TrainingProvider");
  return ctx;
}
