import type { CodeReviewResult } from "@/lib/dev-copilot/types";

const LEVEL_STYLE = {
  approve: "bg-emerald-100 text-emerald-800",
  comment: "bg-amber-100 text-amber-800",
  request_changes: "bg-red-100 text-red-800",
};

const LEVEL_LABEL = {
  approve: "Approve",
  comment: "Comment",
  request_changes: "Request Changes",
};

const CAT_LABEL = {
  risk: "风险",
  performance: "性能",
  security: "安全",
  readability: "可读性",
};

export function ReviewResult({ data }: { data: CodeReviewResult }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center justify-between">
        <p className="text-slate-700">{data.summary}</p>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${LEVEL_STYLE[data.level]}`}
        >
          {LEVEL_LABEL[data.level]}
        </span>
      </div>
      <ul className="space-y-2">
        {data.findings.map((f, i) => (
          <li
            key={i}
            className="rounded-lg border border-slate-200 bg-white p-3 text-xs"
          >
            <div className="flex gap-2">
              <span className="font-medium text-slate-700">
                {CAT_LABEL[f.category]}
              </span>
              <span
                className={
                  f.severity === "high"
                    ? "text-red-600"
                    : f.severity === "medium"
                      ? "text-amber-600"
                      : "text-slate-500"
                }
              >
                {f.severity}
              </span>
            </div>
            <p className="mt-1 text-slate-800">{f.message}</p>
            <p className="mt-1 text-emerald-700">建议：{f.suggestion}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
