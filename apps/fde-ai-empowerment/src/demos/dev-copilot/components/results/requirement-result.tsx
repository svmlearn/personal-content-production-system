import type { RequirementAnalysis } from "@/lib/dev-copilot/types";

export function RequirementResult({ data }: { data: RequirementAnalysis }) {
  return (
    <div className="space-y-4 text-sm">
      <Badge>预估复杂度 {data.complexity}</Badge>
      <Section title="功能点" items={data.features} />
      <TaskSection title="前端任务" tasks={data.frontendTasks} />
      <TaskSection title="后端任务" tasks={data.backendTasks} />
      <Section title="数据库变更" items={data.dbChanges} />
      <div>
        <h3 className="font-semibold text-slate-900">接口需求</h3>
        <ul className="mt-2 space-y-1 text-slate-600">
          {data.apiNeeds.map((a) => (
            <li key={a.path} className="font-mono text-xs">
              <span className="text-emerald-700">{a.method}</span> {a.path} —{" "}
              {a.description}
            </li>
          ))}
        </ul>
      </div>
      <Section title="测试点" items={data.testPoints} />
      <div>
        <h3 className="font-semibold text-slate-900">风险点</h3>
        <ul className="mt-2 space-y-2">
          {data.risks.map((r) => (
            <li key={r.id} className="rounded-lg border border-amber-100 bg-amber-50/50 p-2 text-xs">
              <p className="font-medium text-amber-900">{r.description}</p>
              <p className="mt-1 text-slate-600">缓解：{r.mitigation}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
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

function TaskSection({
  title,
  tasks,
}: {
  title: string;
  tasks: RequirementAnalysis["frontendTasks"];
}) {
  return (
    <div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <ul className="mt-1 space-y-1">
        {tasks.map((t) => (
          <li key={t.id} className="flex justify-between text-xs text-slate-600">
            <span>{t.title}</span>
            <span className="rounded bg-slate-100 px-1.5">{t.complexity}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
      {children}
    </span>
  );
}
