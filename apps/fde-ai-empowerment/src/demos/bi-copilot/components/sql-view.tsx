"use client";

import { useState } from "react";
import { Copy, Play } from "lucide-react";
import { useBi } from "../bi-context";

export function SqlView() {
  const { sqlPreview, runSql } = useBi();
  const [q, setQ] = useState("按渠道查看近7日留存");
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!sqlPreview) return;
    await navigator.clipboard.writeText(sqlPreview.sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">SQL 实验室</h2>
      <p className="mt-1 text-sm text-slate-500">
        自然语言生成只读查询预览（预留数仓执行接口）
      </p>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          runSql(q);
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="描述你想查的数据…"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-4 py-2 text-sm text-white"
        >
          <Play className="h-4 w-4" />
          生成 SQL
        </button>
      </form>

      {sqlPreview ? (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-slate-600">{sqlPreview.explanation}</p>
          <p className="text-xs text-slate-500">
            涉及表：{sqlPreview.tables.join(" · ")} · 预估行数 ~
            {sqlPreview.estimatedRows.toLocaleString()}
          </p>
          <div className="rounded-xl border border-slate-200 bg-slate-900">
            <div className="flex justify-end border-b border-slate-700 px-3 py-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white"
              >
                <Copy className="h-3.5 w-3.5" />
                {copied ? "已复制" : "复制 SQL"}
              </button>
            </div>
            <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-teal-300">
              {sqlPreview.sql}
            </pre>
          </div>
        </div>
      ) : (
        <p className="mt-12 text-center text-sm text-slate-500">
          输入问题后生成 SQL 预览
        </p>
      )}
    </div>
  );
}
