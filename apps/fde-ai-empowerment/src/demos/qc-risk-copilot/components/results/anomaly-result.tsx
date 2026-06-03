import type { AnomalyReviewResult } from "@/lib/qc-risk/types";

const LEVEL = {
  pass: { label: "放行", cls: "bg-emerald-100 text-emerald-800" },
  review: { label: "人工复核", cls: "bg-amber-100 text-amber-800" },
  block: { label: "拦截", cls: "bg-red-100 text-red-800" },
};

export function AnomalyResult({ data }: { data: AnomalyReviewResult }) {
  const lv = LEVEL[data.level];
  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-slate-700">{data.summary}</p>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${lv.cls}`}>
          {lv.label}
        </span>
      </div>
      <ul className="space-y-2">
        {data.riskFindings.map((f, i) => (
          <li key={i} className="rounded-lg border border-slate-200 p-3 text-xs">
            <span className="font-medium">{f.category}</span>
            <span className="ml-2 text-red-600">{f.severity}</span>
            <p className="mt-1">{f.message}</p>
            <p className="mt-1 text-amber-700">建议：{f.suggestion}</p>
          </li>
        ))}
      </ul>
      <List title="性能/促销" items={data.performanceIssues} />
      <List title="安全" items={data.securityIssues} warn />
      <List title="信息完整性" items={data.readabilityIssues} />
    </div>
  );
}

function List({
  title,
  items,
  warn,
}: {
  title: string;
  items: string[];
  warn?: boolean;
}) {
  return (
    <div className={warn ? "rounded-lg border border-red-100 bg-red-50/40 p-3" : ""}>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <ul className="mt-1 list-disc pl-4 text-slate-600">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}
