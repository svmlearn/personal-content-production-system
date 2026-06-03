"use client";

import { Search } from "lucide-react";
import { CATEGORY_LABEL } from "@/lib/industry-expert/engine";
import { useExpert } from "../expert-context";

export function KnowledgeView() {
  const { knowledge, searchQuery, setSearchQuery, searchKnowledge } = useExpert();

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex gap-2">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchKnowledge()}
          placeholder="检索法规、案例、制度…"
          className="flex-1 rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white"
        />
        <button
          type="button"
          onClick={searchKnowledge}
          className="inline-flex items-center gap-1 rounded-md bg-slate-700 px-3 py-2 text-sm text-white"
        >
          <Search className="h-4 w-4" />
          检索
        </button>
      </div>

      <ul className="space-y-2">
        {knowledge.map((k) => (
          <li
            key={k.id}
            className="rounded-lg border border-slate-700 bg-slate-800/30 p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-sky-400">{k.id}</span>
              <span className="rounded bg-slate-700 px-1.5 py-0.5 text-xs text-slate-300">
                {CATEGORY_LABEL[k.category]}
              </span>
              {k.effectiveDate && (
                <span className="text-xs text-slate-500">生效 {k.effectiveDate}</span>
              )}
            </div>
            <h3 className="mt-2 font-medium text-white">{k.title}</h3>
            <p className="mt-1 text-sm text-slate-400">{k.summary}</p>
            <p className="mt-2 text-xs text-slate-500">{k.tags.join(" · ")}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
