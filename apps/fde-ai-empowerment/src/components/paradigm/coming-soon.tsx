import Link from "next/link";
import { FileText, Home } from "lucide-react";
import type { Paradigm } from "@/lib/paradigms";
import { CATEGORY_LABELS } from "@/lib/paradigms";

interface ComingSoonProps {
  paradigm: Paradigm;
}

export function ComingSoon({ paradigm }: ComingSoonProps) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center sm:p-12">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <FileText className="h-6 w-6 text-muted-foreground" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">Demo 待接入</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        「{paradigm.title}」的提示词与交互 Demo 尚未配置。发送对应提示词后，
        将在此展示完整 Agent 指引与可体验界面。
      </p>
      <p className="mt-4 text-xs text-muted-foreground">
        分类：{CATEGORY_LABELS[paradigm.category]} · slug:{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono">
          {paradigm.slug}
        </code>
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        <Home className="h-4 w-4" />
        返回首页
      </Link>
    </div>
  );
}
