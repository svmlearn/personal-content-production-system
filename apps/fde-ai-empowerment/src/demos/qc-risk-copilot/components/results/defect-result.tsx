import { AlertTriangle } from "lucide-react";
import type { DefectAnalysis } from "@/lib/qc-risk/types";

export function DefectResult({ data }: { data: DefectAnalysis }) {
  return (
    <div className="space-y-4 text-sm">
      <p className="rounded-lg bg-red-50 p-3 font-medium text-red-900">{data.summary}</p>
      <List title="可能根因" items={data.rootCauses} />
      <p>
        <span className="font-semibold">影响范围：</span>
        {data.impact}
      </p>
      <List title="排查步骤" items={data.investigationSteps} ordered />
      <List title="纠正措施" items={data.correctiveActions} />
      <List title="预防复发" items={data.preventRecurrence} />
      {data.escalate && (
        <p className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          需升级：{data.escalateReason}
        </p>
      )}
    </div>
  );
}

function List({
  title,
  items,
  ordered,
}: {
  title: string;
  items: string[];
  ordered?: boolean;
}) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <Tag className="mt-1 list-decimal pl-4 text-slate-600">
        {items.map((i) => (
          <li key={i} className={ordered ? "" : "list-disc"}>
            {i}
          </li>
        ))}
      </Tag>
    </div>
  );
}
