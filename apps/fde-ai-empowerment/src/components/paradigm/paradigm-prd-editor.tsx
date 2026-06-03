"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Bot,
  ChevronLeft,
  Download,
  FileText,
  RotateCcw,
  Sparkles,
  Wand2,
} from "lucide-react";
import type { Paradigm } from "@/lib/paradigms";
import {
  documentToEditable,
  downloadBlob,
  exportPrdToDocx,
  getParadigmPrd,
  runPrdAgent,
  storageKey,
  type EditablePrd,
  type PrdAgentAction,
} from "@/lib/paradigms/prd";
import { PrdChapterEditor } from "./prd-selection-toolbar";

interface ParadigmPrdEditorProps {
  paradigm: Paradigm;
}

export function ParadigmPrdEditor({ paradigm }: ParadigmPrdEditorProps) {
  const doc = getParadigmPrd(paradigm.slug);
  const [prd, setPrd] = useState<EditablePrd | null>(null);
  const [activeId, setActiveId] = useState("ch-0");
  const [agentMsg, setAgentMsg] = useState("");
  const [agentInput, setAgentInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!doc) return;
    const base = documentToEditable(doc);
    try {
      const raw = localStorage.getItem(storageKey(paradigm.slug));
      if (raw) {
        setPrd(JSON.parse(raw) as EditablePrd);
        return;
      }
    } catch {
      /* ignore */
    }
    setPrd(base);
  }, [doc, paradigm.slug]);

  const persist = useCallback(
    (next: EditablePrd) => {
      setPrd(next);
      localStorage.setItem(storageKey(paradigm.slug), JSON.stringify(next));
    },
    [paradigm.slug],
  );

  const activeChapter = prd?.chapters.find((c) => c.id === activeId) ?? prd?.chapters[0];

  const updateChapterBody = (body: string) => {
    if (!prd || !activeChapter) return;
    persist({
      ...prd,
      chapters: prd.chapters.map((c) =>
        c.id === activeChapter.id ? { ...c, body } : c,
      ),
    });
  };

  const updateProductName = (productName: string) => {
    if (!prd) return;
    persist({ ...prd, productName });
  };

  const resetPrd = () => {
    if (!doc || !confirm("确定恢复为初始 PRD？本地修改将丢失。")) return;
    const base = documentToEditable(doc);
    localStorage.removeItem(storageKey(paradigm.slug));
    setPrd(base);
    setAgentMsg("已恢复为系统初始版本。");
  };

  const runAgent = (action: PrdAgentAction) => {
    if (!prd || !activeChapter) return;
    const result = runPrdAgent(
      action,
      activeChapter.title,
      activeChapter.body,
      prd.productName,
      action === "custom" ? agentInput : undefined,
    );
    setAgentMsg(result.suggestion);
  };

  const applyAgentRevision = () => {
    if (!prd || !activeChapter) return;
    const result = runPrdAgent(
      agentInput.trim() ? "custom" : "polish",
      activeChapter.title,
      activeChapter.body,
      prd.productName,
      agentInput || undefined,
    );
    updateChapterBody(result.revisedBody);
    setAgentMsg("已应用 Agent 修订到当前章节，可继续手动微调。");
  };

  const handleExport = async () => {
    if (!prd) return;
    setExporting(true);
    try {
      const blob = await exportPrdToDocx(prd);
      const safe = prd.productName.replace(/[/\\?%*:|"<>]/g, "-").slice(0, 40);
      downloadBlob(blob, `${safe}-PRD.docx`);
      setAgentMsg("Word 文档已下载。");
    } finally {
      setExporting(false);
    }
  };

  const handleSave = () => {
    if (!prd) return;
    setSaving(true);
    localStorage.setItem(storageKey(paradigm.slug), JSON.stringify(prd));
    setTimeout(() => {
      setSaving(false);
      setAgentMsg("已保存到浏览器本地。");
    }, 300);
  };

  if (!doc || !prd) {
    return <p className="p-8 text-center text-muted-foreground">PRD 加载中…</p>;
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href={`/paradigms/${paradigm.slug}/guide`}
              className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
            >
              <ChevronLeft className="h-4 w-4" />
              项目指南
            </Link>
            <span className="hidden h-4 w-px bg-slate-200 sm:block" />
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-xs text-slate-500">PRD 工作台</p>
                <p className="text-sm font-semibold text-slate-900">{paradigm.title}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resetPrd}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              恢复初始
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              {saving ? "保存中…" : "保存本地"}
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
            >
              <Download className="h-3.5 w-3.5" />
              {exporting ? "导出中…" : "下载 Word"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-4 p-4 lg:grid-cols-[220px_1fr_300px] lg:p-6">
        <nav className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
          <p className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            章节目录
          </p>
          <ul className="mt-2 space-y-0.5">
            {prd.chapters.map((ch) => (
              <li key={ch.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(ch.id)}
                  className={`w-full rounded-lg px-2 py-2 text-left text-xs leading-snug ${
                    activeId === ch.id
                      ? "bg-indigo-50 font-medium text-indigo-800"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {ch.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3 sm:px-6">
            <label className="text-xs text-slate-500">产品名称</label>
            <input
              value={prd.productName}
              onChange={(e) => updateProductName(e.target.value)}
              className="mt-1 w-full border-0 border-b border-transparent bg-transparent text-lg font-semibold text-slate-900 outline-none focus:border-indigo-300"
            />
            <p className="mt-2 text-sm font-medium text-slate-700">
              {activeChapter?.title}
            </p>
          </div>
          <PrdChapterEditor
            value={activeChapter?.body ?? ""}
            onChange={updateChapterBody}
            productName={prd.productName}
            chapterTitle={activeChapter?.title ?? ""}
            onAgentMessage={setAgentMsg}
          />
        </main>

        <aside className="space-y-4 lg:sticky lg:top-[4.5rem]">
          <div className="rounded-xl border border-indigo-100 bg-gradient-to-b from-indigo-50 to-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Bot className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">PRD Agent</p>
                <p className="text-xs text-slate-500">圈选改写 · 章节润色</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(
                [
                  ["polish", "润色", Wand2],
                  ["expand", "扩写", Sparkles],
                  ["simplify", "精简", FileText],
                ] as const
              ).map(([action, label, Icon]) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => runAgent(action)}
                  className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-white px-2 py-1 text-xs text-indigo-700 hover:bg-indigo-50"
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </button>
              ))}
            </div>
            <textarea
              value={agentInput}
              onChange={(e) => setAgentInput(e.target.value)}
              placeholder="自定义指令，如：补充权限与审计章节…"
              rows={3}
              className="mt-3 w-full rounded-lg border border-slate-200 px-2 py-2 text-xs outline-none focus:border-indigo-400"
            />
            <button
              type="button"
              onClick={() => runAgent("custom")}
              className="mt-2 w-full rounded-lg border border-indigo-200 py-1.5 text-xs text-indigo-700 hover:bg-indigo-50"
            >
              生成建议
            </button>
            <button
              type="button"
              onClick={applyAgentRevision}
              className="mt-2 w-full rounded-lg bg-indigo-600 py-2 text-xs font-medium text-white hover:bg-indigo-700"
            >
              应用修订到当前章
            </button>
            {agentMsg && (
              <p className="mt-3 rounded-lg bg-white/80 p-2 text-xs leading-relaxed text-slate-600">
                {agentMsg}
              </p>
            )}
          </div>
          <p className="text-xs leading-relaxed text-slate-500">
            在正文中<strong className="text-slate-700">鼠标圈选</strong>
            文字，可使用修改风格、扩写、改写等快捷操作。修改仅存于本机；接入 LLM 请替换{" "}
            <code className="rounded bg-slate-100 px-1">PRD_AGENT_HOOK</code>。
          </p>
        </aside>
      </div>
    </div>
  );
}
