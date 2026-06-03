import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  type Paradigm,
} from "@/lib/paradigms";
import { ComingSoon } from "./coming-soon";
import { ParadigmGuideLink } from "./paradigm-guide-link";
import { ParadigmPrdLink } from "./paradigm-prd-link";
import { PromptPanel } from "./prompt-panel";
import { getParadigmDemo, hasParadigmDemo } from "@/demos/registry";

interface ParadigmShellProps {
  paradigm: Paradigm;
}

export function ParadigmShell({ paradigm }: ParadigmShellProps) {
  const colors = CATEGORY_COLORS[paradigm.category];
  const Demo = getParadigmDemo(paradigm.slug);
  const hasDemo = hasParadigmDemo(paradigm.slug);
  const showPrompt = Boolean(paradigm.prompt);
  const immersive = paradigm.demoLayout === "immersive";

  if (immersive && hasDemo && Demo) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            返回范式目录
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <ParadigmGuideLink slug={paradigm.slug} />
            <ParadigmPrdLink slug={paradigm.slug} />
            <span
              className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text} ${colors.border}`}
            >
              {paradigm.title}
            </span>
          </div>
        </div>
        <div
          className={
            showPrompt
              ? "grid gap-6 xl:grid-cols-[1fr_minmax(260px,320px)]"
              : ""
          }
        >
          <Demo />
          {showPrompt && paradigm.prompt && (
            <PromptPanel prompt={paradigm.prompt} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        返回范式目录
      </Link>

      <header className="mb-8 border-b border-border pb-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text} ${colors.border}`}
            >
              {CATEGORY_LABELS[paradigm.category]}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              #{String(paradigm.order).padStart(2, "0")}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ParadigmGuideLink slug={paradigm.slug} />
            <ParadigmPrdLink slug={paradigm.slug} />
          </div>
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
          {paradigm.title}
        </h1>
        <p className="mt-1 text-muted-foreground">{paradigm.subtitle}</p>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {paradigm.description}
        </p>
      </header>

      <div
        className={
          showPrompt
            ? "grid gap-6 lg:grid-cols-[1fr_minmax(280px,360px)]"
            : "grid gap-6"
        }
      >
        <div className="min-w-0">
          {hasDemo && Demo ? (
            <Demo />
          ) : (
            <ComingSoon paradigm={paradigm} />
          )}
        </div>
        {showPrompt && paradigm.prompt && (
          <PromptPanel prompt={paradigm.prompt} />
        )}
      </div>
    </div>
  );
}
