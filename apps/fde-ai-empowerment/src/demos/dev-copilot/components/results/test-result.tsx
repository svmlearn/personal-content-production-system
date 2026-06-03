import type { TestCase } from "@/lib/dev-copilot/types";

export function TestResult({ data }: { data: TestCase[] }) {
  const groups = [...new Set(data.map((t) => t.category))];
  return (
    <div className="space-y-4">
      {groups.map((cat) => (
        <div key={cat}>
          <h3 className="text-sm font-semibold text-slate-900">{cat}</h3>
          <ul className="mt-2 space-y-2">
            {data
              .filter((t) => t.category === cat)
              .map((t) => (
                <li
                  key={t.id}
                  className="rounded-lg border border-slate-200 bg-white p-3 text-xs"
                >
                  <p className="font-medium text-slate-800">{t.title}</p>
                  <p className="mt-1 text-slate-500">步骤：{t.steps}</p>
                  <p className="mt-0.5 text-emerald-700">预期：{t.expected}</p>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
