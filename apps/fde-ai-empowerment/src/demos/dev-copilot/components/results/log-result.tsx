import { AlertTriangle } from "lucide-react";
import type { LogAnalysis } from "@/lib/dev-copilot/types";

export function LogResult({ data }: { data: LogAnalysis }) {
  return (
    <div className="space-y-4 text-sm">
      <p className="rounded-lg bg-red-50 p-3 font-medium text-red-900">
        {data.summary}
      </p>
      <List title="可能原因" items={data.causes} />
      <p>
        <span className="font-semibold">影响范围：</span>
        {data.impact}
      </p>
      <List title="排查步骤" items={data.steps} />
      <List title="修复建议" items={data.fixes} />
      {data.escalate && (
        <p className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          需升级：{data.escalateReason}
        </p>
      )}
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <ol className="mt-1 list-decimal pl-4 text-slate-600">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ol>
    </div>
  );
}
