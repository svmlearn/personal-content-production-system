import type { SamplingPlanResult } from "@/lib/qc-risk/types";

export function SamplingResult({ data }: { data: SamplingPlanResult }) {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <h3 className="font-semibold text-slate-900">{data.planName}</h3>
        <p className="mt-1 text-amber-800">抽样率：{data.sampleRate}</p>
      </div>
      <div>
        <h3 className="font-semibold">抽检任务</h3>
        <ul className="mt-2 space-y-2">
          {data.tasks.map((t) => (
            <li
              key={t.id}
              className="flex justify-between rounded-lg border border-slate-200 p-2 text-xs"
            >
              <span>{t.title}</span>
              <span className="text-slate-500">
                n={t.sampleSize} · {t.frequency} · {t.owner}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <List title="检验节点" items={data.checkpoints} />
      <List title="正常流程" items={data.normalCases} />
      <List title="边界条件" items={data.edgeCases} />
      <List title="回归测试点" items={data.regressionPoints} />
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
