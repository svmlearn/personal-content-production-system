import type { RiskLevel } from "@/lib/industry-expert/types";

const STYLE: Record<RiskLevel, string> = {
  low: "bg-slate-100 text-slate-700 border-slate-200",
  medium: "bg-amber-50 text-amber-800 border-amber-200",
  high: "bg-orange-50 text-orange-800 border-orange-200",
  critical: "bg-red-50 text-red-800 border-red-200",
};

const LABEL: Record<RiskLevel, string> = {
  low: "低",
  medium: "中",
  high: "高",
  critical: "严重",
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span
      className={`inline-flex rounded border px-2 py-0.5 text-xs font-semibold ${STYLE[level]}`}
    >
      风险 {LABEL[level]}
    </span>
  );
}
