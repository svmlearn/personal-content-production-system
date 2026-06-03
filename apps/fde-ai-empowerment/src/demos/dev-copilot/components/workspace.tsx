"use client";

import { ArrowLeft, Play } from "lucide-react";
import { useDev } from "../dev-context";
import { CodeBlock } from "./code-block";
import { RequirementResult } from "./results/requirement-result";
import { CodeResult } from "./results/code-result";
import { TestResult } from "./results/test-result";
import { LogResult } from "./results/log-result";
import { ReviewResult } from "./results/review-result";
import { ApiResult } from "./results/api-result";

const MODE_LABEL: Record<string, string> = {
  requirement: "需求拆解",
  code: "代码解释",
  test: "测试用例生成",
  log: "日志分析",
  review: "Code Review",
  api: "接口文档生成",
};

const USE_CODE_BLOCK = new Set(["code", "log", "review"]);

export function Workspace() {
  const {
    mode,
    setMode,
    input,
    setInput,
    analyze,
    reqResult,
    codeResult,
    testResult,
    logResult,
    reviewResult,
    apiResult,
  } = useDev();

  if (mode === "home") return null;

  return (
    <div className="flex min-h-[560px] flex-col lg:flex-row">
      <aside className="w-full shrink-0 border-b border-slate-200 bg-slate-50 p-3 lg:w-48 lg:border-b-0 lg:border-r">
        <button
          type="button"
          onClick={() => setMode("home")}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          工作台
        </button>
        <p className="mt-2 text-sm font-semibold text-emerald-800">
          {MODE_LABEL[mode]}
        </p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:flex-row">
        <div className="border-b border-slate-200 p-4 lg:w-1/2 lg:border-b-0 lg:border-r">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={14}
            className="w-full resize-y rounded-lg border border-slate-200 bg-white p-3 font-mono text-xs leading-relaxed outline-none focus:border-emerald-500"
            placeholder="粘贴 PRD、代码、日志或接口描述…"
          />
          {USE_CODE_BLOCK.has(mode) && input && (
            <div className="mt-3 hidden sm:block">
              <CodeBlock code={input} />
            </div>
          )}
          <button
            type="button"
            onClick={analyze}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <Play className="h-4 w-4" />
            分析
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {mode === "requirement" && reqResult && (
            <RequirementResult data={reqResult} />
          )}
          {mode === "code" && codeResult && <CodeResult data={codeResult} />}
          {mode === "test" && testResult && <TestResult data={testResult} />}
          {mode === "log" && logResult && <LogResult data={logResult} />}
          {mode === "review" && reviewResult && (
            <ReviewResult data={reviewResult} />
          )}
          {mode === "api" && apiResult && <ApiResult data={apiResult} />}
          {!reqResult &&
            !codeResult &&
            !testResult &&
            !logResult &&
            !reviewResult &&
            !apiResult && (
              <p className="py-12 text-center text-sm text-slate-400">
                输入内容后点击「分析」
              </p>
            )}
        </div>
      </div>
    </div>
  );
}
