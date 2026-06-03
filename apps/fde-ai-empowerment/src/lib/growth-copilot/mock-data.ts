import type { Campaign, Metric, MetricId } from "./types";

function weekTrend(base: number, drift: number, variance = 0.05): Metric["trend"] {
  const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  const wobble = [-0.02, 0.01, -0.01, 0.02, 0, -0.015, 0.01];
  return days.map((date, i) => ({
    date,
    value: Math.round(base * (1 + drift * i + wobble[i] * variance * 10)),
  }));
}

export const METRICS: Metric[] = [
  {
    id: "dau",
    name: "DAU",
    unit: "",
    value: 128400,
    previousValue: 125200,
    weekChange: 3200,
    weekChangePercent: 2.6,
    trend: weekTrend(120000, 0.012),
    target: 130000,
  },
  {
    id: "new_users",
    name: "新增用户",
    unit: "",
    value: 8420,
    previousValue: 9100,
    weekChange: -680,
    weekChangePercent: -7.5,
    trend: weekTrend(8800, -0.02),
    target: 9000,
  },
  {
    id: "retention",
    name: "7日留存率",
    unit: "%",
    value: 34.2,
    previousValue: 38.1,
    weekChange: -3.9,
    weekChangePercent: -10.2,
    trend: weekTrend(38, -0.008, 0.02).map((t) => ({
      ...t,
      value: Math.round(t.value * 10) / 10,
    })),
    target: 40,
  },
  {
    id: "conversion",
    name: "转化率",
    unit: "%",
    value: 4.8,
    previousValue: 4.6,
    weekChange: 0.2,
    weekChangePercent: 4.3,
    trend: weekTrend(4.5, 0.005, 0.02).map((t) => ({
      ...t,
      value: Math.round(t.value * 100) / 100,
    })),
    target: 5,
  },
  {
    id: "gmv",
    name: "GMV",
    unit: "万",
    value: 286,
    previousValue: 272,
    weekChange: 14,
    weekChangePercent: 5.1,
    trend: weekTrend(270, 0.008),
    target: 300,
  },
  {
    id: "aov",
    name: "客单价",
    unit: "元",
    value: 186,
    previousValue: 182,
    weekChange: 4,
    weekChangePercent: 2.2,
    trend: weekTrend(180, 0.003),
    target: 190,
  },
];

export const CAMPAIGNS: Campaign[] = [
  {
    id: "camp-1",
    name: "五一会员满减周",
    startDate: "2025-05-01",
    endDate: "2025-05-07",
    goal: "提升会员 GMV 15%",
    status: "completed",
    metrics: [
      { label: "参与人数", target: 50000, actual: 52800, unit: "人" },
      { label: "GMV", target: 320, actual: 298, unit: "万" },
      { label: "核销率", target: 35, actual: 31, unit: "%" },
    ],
  },
  {
    id: "camp-2",
    name: "新用户首单礼",
    startDate: "2025-05-15",
    endDate: "2025-05-21",
    goal: "首单转化率 +2pp",
    status: "completed",
    metrics: [
      { label: "新客覆盖", target: 8000, actual: 8420, unit: "人" },
      { label: "首单转化", target: 12, actual: 11.2, unit: "%" },
      { label: "ROI", target: 1.8, actual: 1.5, unit: "" },
    ],
  },
  {
    id: "camp-3",
    name: "沉默用户召回",
    startDate: "2025-05-25",
    endDate: "2025-06-01",
    goal: "7日回访率 +5pp",
    status: "running",
    metrics: [
      { label: "触达用户", target: 100000, actual: 62000, unit: "人" },
      { label: "回访率", target: 8, actual: 5.2, unit: "%" },
    ],
  },
];

export function getMetric(id: MetricId): Metric | undefined {
  return METRICS.find((m) => m.id === id);
}
