import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Cpu,
  FileText,
  Layers,
  Play,
  Sparkles,
  Target,
} from "lucide-react";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  type Paradigm,
} from "@/lib/paradigms";
import type { ParadigmGuide } from "@/lib/paradigms/guide-types";
import { getPrdPreview, getParadigmPrd } from "@/lib/paradigms/prd";
import { hasParadigmDemo } from "@/demos/registry";

interface ParadigmGuideViewProps {
  paradigm: Paradigm;
  guide: ParadigmGuide;
}

export function ParadigmGuideView({ paradigm, guide }: ParadigmGuideViewProps) {
  const colors = CATEGORY_COLORS[paradigm.category];
  const hasDemo = hasParadigmDemo(paradigm.slug);
  const prdDoc = getParadigmPrd(paradigm.slug);
  const preview = prdDoc ? getPrdPreview(prdDoc) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link
            href={`/paradigms/${paradigm.slug}`}
            className="text-sm text-slate-500 hover:text-slate-900"
          >
            ← 返回 Demo
          </Link>
          <div className="flex gap-2">
            {hasDemo && (
              <Link
                href={`/paradigms/${paradigm.slug}`}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
              >
                <Play className="h-3.5 w-3.5" />
                体验 Demo
              </Link>
            )}
            {prdDoc && (
              <Link
                href={`/paradigms/${paradigm.slug}/prd`}
                className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white"
              >
                <FileText className="h-3.5 w-3.5" />
                打开 PRD
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <header className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full opacity-40 blur-3xl"
            style={{ background: "var(--hero-glow, #818cf8)" }}
          />
          <div className="relative flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text} ${colors.border}`}
            >
              {CATEGORY_LABELS[paradigm.category]}
            </span>
            <span className="font-mono text-xs text-slate-400">
              #{String(paradigm.order).padStart(2, "0")}
            </span>
          </div>
          <h1 className="relative mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {paradigm.title}
          </h1>
          <p className="relative mt-2 text-slate-600">{paradigm.subtitle}</p>
          <p className="relative mt-4 max-w-2xl text-sm leading-relaxed text-slate-500">
            {guide.introduction}
          </p>
        </header>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {guide.highlights.slice(0, 3).map((h) => (
            <div
              key={h}
              className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
              <p className="text-sm text-slate-700">{h}</p>
            </div>
          ))}
        </div>

        {preview && (
          <section className="mt-8 overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-white shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-indigo-100/80 px-5 py-4 sm:px-6">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  <BookOpen className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                    PRD 预览摘要
                  </p>
                  <h2 className="mt-0.5 font-semibold text-slate-900">{preview.productName}</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    共 {preview.chapterCount} 章 · AI Agent 产品需求文档
                  </p>
                </div>
              </div>
              <Link
                href={`/paradigms/${paradigm.slug}/prd`}
                className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                编辑完整 PRD
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
              <div className="rounded-lg bg-white/70 p-4">
                <p className="flex items-center gap-1 text-xs font-medium text-slate-500">
                  <Target className="h-3.5 w-3.5" />
                  一句话定位
                </p>
                <p className="mt-2 text-sm text-slate-800">{preview.positioning}</p>
              </div>
              <div className="rounded-lg bg-white/70 p-4">
                <p className="flex items-center gap-1 text-xs font-medium text-slate-500">
                  <Cpu className="h-3.5 w-3.5" />
                  Agent 能力摘要
                </p>
                <p className="mt-2 text-sm text-slate-800">{preview.agentSnippet}</p>
              </div>
            </div>
            <p className="border-t border-indigo-100/80 px-5 py-3 text-sm leading-relaxed text-slate-600 sm:px-6">
              {preview.backgroundSnippet}
              {preview.backgroundSnippet.length >= 180 ? "…" : ""}
            </p>
            <div className="flex flex-wrap gap-1.5 border-t border-indigo-100/80 px-5 py-3 sm:px-6">
              {preview.toc.slice(0, 6).map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500 ring-1 ring-slate-200"
                >
                  {t}
                </span>
              ))}
              {preview.toc.length > 6 && (
                <span className="text-xs text-slate-400">+{preview.toc.length - 6} 章</span>
              )}
            </div>
          </section>
        )}

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 font-semibold text-slate-900">
              <Layers className="h-4 w-4 text-slate-400" />
              Demo 逻辑架构
            </h3>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-600">
              {guide.logic.flow.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {guide.logic.mockFunctions?.map((fn) => (
                <code
                  key={fn}
                  className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-700"
                >
                  {fn}
                </code>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900">大模型作用</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {guide.llmRole.map((r) => (
                <li key={r} className="flex gap-2">
                  <span className="text-indigo-400">·</span>
                  {r}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">适合项目</h3>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              {guide.suitableProjects.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">适合行业</h3>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              {guide.suitableIndustries.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </section>
        </div>

        <p className="mt-10 text-center text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-600">
            返回范式目录
          </Link>
        </p>
      </div>
    </div>
  );
}
