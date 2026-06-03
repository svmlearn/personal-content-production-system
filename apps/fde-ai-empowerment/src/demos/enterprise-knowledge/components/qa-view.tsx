"use client";

import { ArrowLeft } from "lucide-react";
import { useKnowledge } from "../knowledge-context";
import { AnswerPanel } from "./answer-panel";
import { QuestionInput } from "./question-input";

export function QaView() {
  const { question, currentAnswer, ask, setView } = useKnowledge();

  if (!currentAnswer) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-sm text-slate-500">请先在工作台输入问题</p>
        <button
          type="button"
          onClick={() => setView("home")}
          className="mt-4 text-sm font-medium text-sky-600 hover:underline"
        >
          前往工作台
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
      <button
        type="button"
        onClick={() => setView("home")}
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        返回工作台
      </button>

      <QuestionInput onSubmit={ask} defaultValue={question} />

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <AnswerPanel answer={currentAnswer} question={question} />
      </div>
    </div>
  );
}
