"use client";

import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Expand,
  Palette,
  PenLine,
  Sparkles,
  X,
} from "lucide-react";
import {
  SELECTION_ACTION_LABEL,
  runPrdSelectionAgent,
  type PrdSelectionAction,
} from "@/lib/paradigms/prd/prd-agent";

export interface TextSelectionState {
  text: string;
  start: number;
  end: number;
  x: number;
  y: number;
}

const ACTIONS: {
  id: PrdSelectionAction;
  icon: typeof Sparkles;
}[] = [
  { id: "changeStyle", icon: Palette },
  { id: "expand", icon: Expand },
  { id: "rewrite", icon: PenLine },
  { id: "professionalize", icon: Sparkles },
  { id: "explain", icon: BookOpen },
];

interface PrdChapterEditorProps {
  value: string;
  onChange: (value: string) => void;
  productName: string;
  chapterTitle: string;
  onAgentMessage?: (msg: string) => void;
}

export function PrdChapterEditor({
  value,
  onChange,
  productName,
  chapterTitle,
  onAgentMessage,
}: PrdChapterEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selection, setSelection] = useState<TextSelectionState | null>(null);
  const [processing, setProcessing] = useState<PrdSelectionAction | null>(null);

  const readSelection = (clientX: number, clientY: number) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    if (start === end) {
      setSelection(null);
      return;
    }
    const text = value.slice(start, end);
    if (text.trim().length < 1) {
      setSelection(null);
      return;
    }
    setSelection({ text, start, end, x: clientX, y: clientY });
  };

  const applyAction = (action: PrdSelectionAction) => {
    if (!selection) return;
    setProcessing(action);
    const { replacement, tip } = runPrdSelectionAgent(
      action,
      selection.text,
      productName,
      chapterTitle,
    );
    const next =
      value.slice(0, selection.start) + replacement + value.slice(selection.end);
    onChange(next);
    onAgentMessage?.(`「${SELECTION_ACTION_LABEL[action]}」：${tip}`);
    setSelection(null);
    setProcessing(null);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  useEffect(() => {
    const dismiss = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        target instanceof Element &&
        target.closest("[data-prd-selection-toolbar]")
      ) {
        return;
      }
      if (textareaRef.current?.contains(target)) return;
      setSelection(null);
    };
    document.addEventListener("mousedown", dismiss);
    return () => document.removeEventListener("mousedown", dismiss);
  }, []);

  const menuTop = selection ? Math.min(selection.y + 12, window.innerHeight - 120) : 0;
  const menuLeft = selection
    ? Math.min(Math.max(selection.x - 140, 8), window.innerWidth - 300)
    : 0;

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onMouseUp={(e) => readSelection(e.clientX, e.clientY)}
        onKeyUp={(e) => {
          if (e.shiftKey && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
            const rect = textareaRef.current?.getBoundingClientRect();
            readSelection(rect?.left ?? 0, (rect?.top ?? 0) + 40);
          }
        }}
        className="min-h-[520px] w-full resize-y border-0 px-4 py-4 font-mono text-sm leading-relaxed text-slate-800 outline-none selection:bg-indigo-200 selection:text-indigo-950 sm:px-6"
        spellCheck={false}
        placeholder="圈选文字后可使用 AI 快捷改写…"
      />

      {selection && (
        <div
          data-prd-selection-toolbar
          className="fixed z-50 shadow-xl"
          style={{ top: menuTop, left: menuLeft }}
        >
          <div className="rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5">
            <div className="mb-1 flex items-center justify-between gap-2 border-b border-slate-100 px-2 pb-1">
              <span className="text-[10px] font-medium text-indigo-600">
                AI 改写选区 · {selection.text.length} 字
              </span>
              <button
                type="button"
                onClick={() => setSelection(null)}
                className="rounded p-0.5 text-slate-400 hover:bg-slate-100"
                aria-label="关闭"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1 max-w-[280px]">
              {ACTIONS.map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  disabled={!!processing}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyAction(id)}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-800 disabled:opacity-50"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                  {processing === id ? "处理中…" : SELECTION_ACTION_LABEL[id]}
                </button>
              ))}
            </div>
            <p className="mt-1 max-w-[280px] truncate px-2 text-[10px] text-slate-400">
              「{selection.text.slice(0, 36)}
              {selection.text.length > 36 ? "…" : ""}」
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
