import { paradigms } from "@/lib/paradigms";
import { ParadigmCard } from "./paradigm-card";

export function ParadigmGrid() {
  const sorted = [...paradigms].sort((a, b) => a.order - b.order);

  return (
    <section id="paradigms" className="scroll-mt-20">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">转型范式目录</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            点击卡片进入对应 Demo；提示词接入后将自动标记为「可体验」。
          </p>
        </div>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((paradigm) => (
          <li key={paradigm.id}>
            <ParadigmCard paradigm={paradigm} />
          </li>
        ))}
      </ul>
    </section>
  );
}
