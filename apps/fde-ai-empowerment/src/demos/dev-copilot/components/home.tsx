"use client";

import {
  BookOpen,
  Bug,
  ClipboardList,
  Code2,
  FileCode,
  GitPullRequest,
  TestTube2,
} from "lucide-react";
import type { DevMode } from "@/lib/dev-copilot/types";
import {
  SAMPLE_API,
  SAMPLE_CODE,
  SAMPLE_DIFF,
  SAMPLE_LOG,
  SAMPLE_PRD,
} from "@/lib/dev-copilot/samples";
import { useDev } from "../dev-context";

const ENTRIES: {
  mode: DevMode;
  label: string;
  desc: string;
  icon: typeof Code2;
  sample: string;
}[] = [
  {
    mode: "requirement",
    label: "需求拆解",
    desc: "PRD → 任务 / 接口 / 测试点",
    icon: ClipboardList,
    sample: SAMPLE_PRD,
  },
  {
    mode: "code",
    label: "代码解释",
    desc: "读懂遗留代码逻辑",
    icon: Code2,
    sample: SAMPLE_CODE,
  },
  {
    mode: "test",
    label: "测试用例",
    desc: "正常 / 异常 / 边界",
    icon: TestTube2,
    sample: "POST /api/v1/reimbursements 创建报销单",
  },
  {
    mode: "log",
    label: "日志分析",
    desc: "ERROR 排障与修复",
    icon: Bug,
    sample: SAMPLE_LOG,
  },
  {
    mode: "review",
    label: "Code Review",
    desc: "安全 / 性能 / 可读性",
    icon: GitPullRequest,
    sample: SAMPLE_DIFF,
  },
  {
    mode: "api",
    label: "接口文档",
    desc: "生成 API 说明",
    icon: FileCode,
    sample: SAMPLE_API,
  },
];

export function Home() {
  const { setMode, setInput, input, run } = useDev();

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <BookOpen className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">研发 Copilot</h2>
          <p className="text-sm text-slate-500">DevOps AI 助手 · 本地 Mock 引擎</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="自然语言：帮我分析这段日志 / 拆解需求 / Review 代码…"
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
          onKeyDown={(e) => e.key === "Enter" && run()}
        />
        <button
          type="button"
          onClick={run}
          className="mt-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          智能路由
        </button>
      </div>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ENTRIES.map(({ mode, label, desc, icon: Icon, sample }) => (
          <li key={mode}>
            <button
              type="button"
              onClick={() => {
                setMode(mode);
                setInput(sample);
              }}
              className="flex h-full w-full flex-col rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:border-emerald-400 hover:shadow-md"
            >
              <Icon className="h-5 w-5 text-emerald-600" />
              <span className="mt-2 font-semibold text-slate-900">{label}</span>
              <span className="mt-1 text-xs text-slate-500">{desc}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
