import type { CodeExplanation } from "@/lib/dev-copilot/types";

export function CodeResult({ data }: { data: CodeExplanation }) {
  return (
    <div className="space-y-4 text-sm">
      <p className="rounded-lg bg-emerald-50 p-3 text-slate-800">{data.summary}</p>
      <List title="核心逻辑" items={data.coreLogic} />
      <List title="输入" items={data.inputs} />
      <List title="输出" items={data.outputs} />
      <List title="依赖关系" items={data.dependencies} />
      <List title="潜在问题" items={data.issues} warn />
      <List title="优化建议" items={data.optimizations} />
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
    <div className={warn ? "rounded-lg border border-amber-200 bg-amber-50/40 p-3" : ""}>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <ul className="mt-1 list-disc pl-4 text-slate-600">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}
