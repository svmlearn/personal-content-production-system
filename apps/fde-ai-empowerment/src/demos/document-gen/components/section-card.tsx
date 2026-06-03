"use client";

import { RefreshCw } from "lucide-react";
import type { DocumentSection, OutputStyle } from "@/lib/document-gen/types";
import { useDocument } from "../document-context";

const STYLES: { id: OutputStyle; label: string }[] = [
  { id: "formal", label: "正式" },
  { id: "consulting", label: "咨询" },
  { id: "sales", label: "销售" },
  { id: "concise", label: "简洁" },
];

interface SectionCardProps {
  section: DocumentSection;
}

export function SectionCard({ section }: SectionCardProps) {
  const { updateSection, rewriteSection, regenerateSection, openSource } =
    useDocument();

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">{section.title}</h3>
      <textarea
        value={section.content}
        onChange={(e) => updateSection(section.id, e.target.value)}
        rows={5}
        className="mt-3 w-full resize-y rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-sm leading-relaxed outline-none focus:border-violet-300"
      />
      {section.citations.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {section.citations.map((c) => (
            <button
              key={c.sourceId}
              type="button"
              onClick={() => openSource(c.sourceId)}
              className="rounded border border-violet-100 bg-violet-50 px-2 py-0.5 text-[10px] text-violet-700 hover:bg-violet-100"
            >
              [{c.label}]
            </button>
          ))}
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => regenerateSection(section.id)}
          className="inline-flex items-center gap-1 rounded border px-2 py-1 text-[11px] hover:bg-slate-50"
        >
          <RefreshCw className="h-3 w-3" />
          重新生成
        </button>
        <ActionBtn label="扩写" onClick={() => rewriteSection(section.id, "expand")} />
        <ActionBtn label="缩写" onClick={() => rewriteSection(section.id, "shorten")} />
        <ActionBtn label="润色" onClick={() => rewriteSection(section.id, "polish")} />
        {STYLES.map((s) => (
          <ActionBtn
            key={s.id}
            label={s.label}
            onClick={() => rewriteSection(section.id, s.id)}
          />
        ))}
      </div>
    </article>
  );
}

function ActionBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded border border-slate-200 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-50"
    >
      {label}
    </button>
  );
}
