"use client";

import type { PrdBlock, PrdChapter } from "@/lib/paradigms/prd/prd-types";

function PrdTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="mt-3 overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[480px] text-left text-xs sm:text-sm">
        <thead className="bg-muted/60">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 font-medium text-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-border">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 align-top text-muted-foreground">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Block({ block }: { block: PrdBlock }) {
  switch (block.type) {
    case "h3":
      return <h3 className="mt-5 text-sm font-semibold text-foreground">{block.text}</h3>;
    case "h4":
      return <h4 className="mt-4 text-sm font-medium text-foreground">{block.text}</h4>;
    case "p":
      return <p className="mt-2 leading-relaxed">{block.text}</p>;
    case "ul":
      return (
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      );
    case "table":
      return <PrdTable headers={block.headers} rows={block.rows} />;
    case "code":
      return (
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs leading-relaxed text-foreground">
          {block.text}
        </pre>
      );
    default:
      return null;
  }
}

function Chapter({ chapter, defaultOpen }: { chapter: PrdChapter; defaultOpen?: boolean }) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-xl border border-border bg-card"
    >
      <summary className="cursor-pointer list-none px-5 py-4 font-semibold text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-2">
          {chapter.title}
          <span className="text-xs font-normal text-muted-foreground group-open:hidden">
            展开
          </span>
        </span>
      </summary>
      <div className="border-t border-border px-5 pb-5 pt-2 text-sm leading-relaxed text-muted-foreground">
        {chapter.blocks.map((block, i) => (
          <Block key={i} block={block} />
        ))}
      </div>
    </details>
  );
}

interface ParadigmPrdViewProps {
  productName: string;
  chapters: PrdChapter[];
}

export function ParadigmPrdView({ productName, chapters }: ParadigmPrdViewProps) {
  return (
    <section className="space-y-3">
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">
          AI Agent 产品 PRD
        </p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">{productName}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          按资深 AI 产品经理 / Agent 架构师模板生成，共十四节，可直接用于立项与研发评审。
        </p>
      </div>
      {chapters.map((chapter, i) => (
        <Chapter key={chapter.title} chapter={chapter} defaultOpen={i < 2} />
      ))}
    </section>
  );
}
