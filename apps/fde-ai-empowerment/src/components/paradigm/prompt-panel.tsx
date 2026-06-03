"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface PromptPanelProps {
  prompt: string;
  title?: string;
}

export function PromptPanel({ prompt, title = "Agent 提示词" }: PromptPanelProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <aside className="flex flex-col rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-primary" />
              已复制
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              复制
            </>
          )}
        </button>
      </div>
      <pre className="max-h-[min(70vh,480px)] flex-1 overflow-auto p-4 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap font-mono">
        {prompt}
      </pre>
    </aside>
  );
}
