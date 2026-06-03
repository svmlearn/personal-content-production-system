"use client";

import { SAMPLE_REPORT_INPUT } from "@/lib/industry-expert/mock-data";
import { useExpert } from "../expert-context";
import { RiskBadge } from "./risk-badge";

const REPORT_TYPES = [
  { label: "尽调摘要", sample: SAMPLE_REPORT_INPUT },
  { label: "合同风险", sample: "授信合同：连带保证 + 应收账款质押，请生成风险报告" },
  { label: "政策适配", sample: "反洗钱新规适用于哪些机构？政策适配分析" },
];

export function ReportView() {
  const { reportInput, setReportInput, report, generateReport, setView } = useExpert();

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex flex-wrap gap-2">
        {REPORT_TYPES.map(({ label, sample }) => (
          <button
            key={label}
            type="button"
            onClick={() => setReportInput(sample)}
            className="rounded-md border border-slate-600 px-2 py-1 text-xs text-slate-300 hover:border-sky-500"
          >
            {label}
          </button>
        ))}
      </div>
      <textarea
        value={reportInput}
        onChange={(e) => setReportInput(e.target.value)}
        rows={5}
        className="w-full rounded-md border border-slate-600 bg-slate-950 p-3 text-sm text-white"
        placeholder="描述报告背景与对象…"
      />
      <button
        type="button"
        onClick={generateReport}
        className="rounded-md bg-sky-600 px-6 py-2 text-sm text-white"
      >
        生成报告
      </button>

      {report && (
        <article className="space-y-4 rounded-lg border border-slate-600 bg-slate-800/50 p-5 text-sm">
          <div className="flex flex-wrap justify-between gap-2">
            <h3 className="text-lg font-semibold text-white">{report.title}</h3>
            <span className="text-xs text-slate-500">
              复核：{report.reviewStatus === "pending" ? "待专家" : report.reviewStatus}
            </span>
          </div>
          <Block title="背景" text={report.background} />
          <div>
            <h4 className="font-medium text-slate-300">关键发现</h4>
            <ul className="mt-1 list-disc pl-4 text-slate-400">
              {report.findings.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-slate-300">风险点</h4>
            <ul className="mt-2 space-y-2">
              {report.risks.map((r) => (
                <li key={r.id} className="flex items-center gap-2 text-slate-400">
                  <RiskBadge level={r.level} />
                  {r.title}
                </li>
              ))}
            </ul>
          </div>
          <ListBlock title="依据" items={report.basis} />
          <ListBlock title="建议" items={report.recommendations} />
          <ListBlock title="后续行动" items={report.nextActions} />
          {report.reviewStatus === "pending" && (
            <button
              type="button"
              onClick={() => setView("review")}
              className="text-sm text-sky-400 underline"
            >
              提交专家复核
            </button>
          )}
        </article>
      )}
    </div>
  );
}

function Block({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h4 className="font-medium text-slate-300">{title}</h4>
      <p className="mt-1 text-slate-400">{text}</p>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="font-medium text-slate-300">{title}</h4>
      <ul className="mt-1 list-disc pl-4 text-slate-400">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}
