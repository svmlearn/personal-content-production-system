import { getLiveParadigmCount, paradigms } from "@/lib/paradigms";

export function Hero() {
  const total = paradigms.length;
  const live = getLiveParadigmCount();

  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -20%, var(--hero-glow), transparent)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-primary">
          Enterprise AI Transformation
        </p>
        <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          toB 大模型转型
          <span className="text-primary"> 范式集合</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          面向 toB 企业的可复用转型范式：每一段提示词对应一个可体验的 Demo，
          帮助团队从战略、产品、运营到研发，系统性地落地大模型能力。
        </p>
        <dl className="mt-8 flex flex-wrap gap-6 text-sm">
          <div>
            <dt className="text-muted-foreground">已规划范式</dt>
            <dd className="mt-0.5 text-2xl font-semibold tabular-nums">{total}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">已上线 Demo</dt>
            <dd className="mt-0.5 text-2xl font-semibold tabular-nums text-primary">
              {live}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">待接入</dt>
            <dd className="mt-0.5 text-2xl font-semibold tabular-nums">
              {total - live}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
