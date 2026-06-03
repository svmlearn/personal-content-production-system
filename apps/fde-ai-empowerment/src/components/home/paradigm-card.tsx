import Link from "next/link";
import { ArrowRight, BookOpen, Clock, FileText, Sparkles } from "lucide-react";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  type Paradigm,
} from "@/lib/paradigms";

interface ParadigmCardProps {
  paradigm: Paradigm;
}

export function ParadigmCard({ paradigm }: ParadigmCardProps) {
  const colors = CATEGORY_COLORS[paradigm.category];
  const isLive = paradigm.status === "live";

  return (
    <article className="group relative flex flex-col rounded-xl border border-border/80 bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-2">
        <span
          className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text} ${colors.border}`}
        >
          {CATEGORY_LABELS[paradigm.category]}
        </span>
        {isLive ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" />
            可体验
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            待接入
          </span>
        )}
      </div>

      <h3 className="text-lg font-semibold tracking-tight group-hover:text-primary">
        {paradigm.title}
      </h3>
      <p className="mt-0.5 text-sm text-muted-foreground">{paradigm.subtitle}</p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
        {paradigm.description}
      </p>

      {paradigm.tags && paradigm.tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {paradigm.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link
          href={`/paradigms/${paradigm.slug}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary"
        >
          {isLive ? "进入 Demo" : "查看详情"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
        {isLive && (
          <>
            <Link
              href={`/paradigms/${paradigm.slug}/guide`}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <BookOpen className="h-3.5 w-3.5" />
              项目指南
            </Link>
            <Link
              href={`/paradigms/${paradigm.slug}/prd`}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-indigo-600"
            >
              <FileText className="h-3.5 w-3.5" />
              PRD
            </Link>
          </>
        )}
      </div>

      <span className="absolute bottom-5 right-5 text-xs font-mono text-muted-foreground/50">
        {String(paradigm.order).padStart(2, "0")}
      </span>
    </article>
  );
}
