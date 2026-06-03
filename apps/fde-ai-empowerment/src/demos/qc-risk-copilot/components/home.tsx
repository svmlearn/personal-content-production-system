"use client";

import {
  ClipboardCheck,
  FileBarChart,
  FlaskConical,
  Scale,
  ScanSearch,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import type { QcMode } from "@/lib/qc-risk/types";
import {
  SAMPLE_ANOMALY,
  SAMPLE_COMPLIANCE,
  SAMPLE_DEFECT,
  SAMPLE_RULE,
  SAMPLE_SAMPLING,
  SAMPLE_STANDARD,
} from "@/lib/qc-risk/samples";
import { useQc } from "../qc-context";

const ENTRIES: {
  mode: QcMode;
  label: string;
  desc: string;
  icon: typeof ScanSearch;
  sample: string;
}[] = [
  {
    mode: "standard",
    label: "标准解读",
    desc: "质检标准 → 指标与流程",
    icon: ScanSearch,
    sample: SAMPLE_STANDARD,
  },
  {
    mode: "defect",
    label: "缺陷分析",
    desc: "根因 · 遏制 · 升级",
    icon: FlaskConical,
    sample: SAMPLE_DEFECT,
  },
  {
    mode: "sampling",
    label: "抽检方案",
    desc: "AQL · 用例 · 回归点",
    icon: ClipboardCheck,
    sample: SAMPLE_SAMPLING,
  },
  {
    mode: "rule",
    label: "风控规则",
    desc: "场景 → 规则与测试点",
    icon: ShieldAlert,
    sample: SAMPLE_RULE,
  },
  {
    mode: "anomaly",
    label: "异常审核",
    desc: "订单风险 · 拦截建议",
    icon: Scale,
    sample: SAMPLE_ANOMALY,
  },
  {
    mode: "compliance",
    label: "合规报告",
    desc: "月报摘要与改进项",
    icon: FileBarChart,
    sample: SAMPLE_COMPLIANCE,
  },
];

export function Home() {
  const { setMode, setInput, input, run } = useQc();

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">质检风控 Copilot</h2>
          <p className="text-sm text-slate-500">质量 · 抽检 · 风控 · 合规 · Mock 引擎</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="自然语言：分析这批短射缺陷 / 生成抽检方案 / 审核异常订单…"
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
          onKeyDown={(e) => e.key === "Enter" && run()}
        />
        <button
          type="button"
          onClick={run}
          className="mt-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
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
              className="flex h-full w-full flex-col rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:border-amber-400 hover:shadow-md"
            >
              <Icon className="h-5 w-5 text-amber-600" />
              <span className="mt-2 font-semibold text-slate-900">{label}</span>
              <span className="mt-1 text-xs text-slate-500">{desc}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
