import type { ParadigmCategory } from "./types";

export const CATEGORY_LABELS: Record<ParadigmCategory, string> = {
  strategy: "战略与定位",
  product: "产品与交付",
  operations: "运营与流程",
  sales: "销售与客户成功",
  engineering: "研发与数据",
  organization: "组织与人才",
};

export const CATEGORY_COLORS: Record<
  ParadigmCategory,
  { bg: string; text: string; border: string }
> = {
  strategy: {
    bg: "bg-violet-500/10",
    text: "text-violet-700 dark:text-violet-300",
    border: "border-violet-500/20",
  },
  product: {
    bg: "bg-sky-500/10",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-500/20",
  },
  operations: {
    bg: "bg-amber-500/10",
    text: "text-amber-800 dark:text-amber-300",
    border: "border-amber-500/20",
  },
  sales: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-500/20",
  },
  engineering: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-700 dark:text-cyan-300",
    border: "border-cyan-500/20",
  },
  organization: {
    bg: "bg-rose-500/10",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-500/20",
  },
};
