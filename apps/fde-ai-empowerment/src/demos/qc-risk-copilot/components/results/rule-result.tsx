import type { RuleDiagnosis } from "@/lib/qc-risk/types";

export function RuleResult({ data }: { data: RuleDiagnosis }) {
  return (
    <div className="space-y-4 text-sm">
      <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
        复杂度 {data.complexity}
      </span>
      <List title="功能点" items={data.features} />
      <div>
        <h3 className="font-semibold text-slate-900">规则建议</h3>
        <ul className="mt-2 space-y-2">
          {data.ruleSuggestions.map((r) => (
            <li
              key={r.id}
              className="rounded-lg border border-slate-200 p-3 text-xs"
            >
              <div className="flex justify-between">
                <span className="font-medium">{r.name}</span>
                <span className="text-amber-700">{r.priority}</span>
              </div>
              <p className="mt-1 text-slate-600">条件：{r.condition}</p>
              <p className="text-slate-600">动作：{r.action}</p>
            </li>
          ))}
        </ul>
      </div>
      <List title="数据字段" items={data.dataFields} mono />
      <List title="测试点" items={data.testPoints} />
      <div>
        <h3 className="font-semibold">风险点</h3>
        <ul className="mt-2 space-y-2">
          {data.risks.map((r) => (
            <li key={r.id} className="rounded-lg border border-amber-100 p-2 text-xs">
              {r.description} — 缓解：{r.mitigation}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function List({
  title,
  items,
  mono,
}: {
  title: string;
  items: string[];
  mono?: boolean;
}) {
  return (
    <div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <ul className={`mt-1 list-disc pl-4 text-slate-600 ${mono ? "font-mono text-xs" : ""}`}>
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}
