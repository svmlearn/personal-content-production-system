import type { StandardInterpretation } from "@/lib/qc-risk/types";

export function StandardResult({ data }: { data: StandardInterpretation }) {
  return (
    <div className="space-y-4 text-sm">
      <p className="rounded-lg bg-amber-50 p-3 text-slate-800">{data.summary}</p>
      <List title="关键指标" items={data.keyMetrics} />
      <List title="检验流程" items={data.procedures} />
      <List title="放行标准" items={data.acceptanceCriteria} />
      <List title="工具设备" items={data.tools} />
      <div>
        <h3 className="font-semibold text-slate-900">风险点</h3>
        <ul className="mt-2 space-y-2">
          {data.risks.map((r) => (
            <li
              key={r.id}
              className="rounded-lg border border-amber-100 bg-amber-50/50 p-2 text-xs"
            >
              <p className="font-medium text-amber-900">{r.description}</p>
              <p className="mt-1 text-slate-600">缓解：{r.mitigation}</p>
            </li>
          ))}
        </ul>
      </div>
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
