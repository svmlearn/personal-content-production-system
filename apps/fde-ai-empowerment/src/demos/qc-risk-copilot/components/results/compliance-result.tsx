import type { ComplianceReport } from "@/lib/qc-risk/types";

export function ComplianceResult({ data }: { data: ComplianceReport }) {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{data.title}</h3>
        <p className="text-xs text-slate-500">{data.period}</p>
      </div>
      <p className="rounded-lg bg-amber-50 p-3 text-slate-800">{data.summary}</p>
      <List title="主要发现" items={data.findings} />
      <List title="改进建议" items={data.recommendations} />
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <ul className="mt-1 list-disc pl-4 text-slate-600">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}
