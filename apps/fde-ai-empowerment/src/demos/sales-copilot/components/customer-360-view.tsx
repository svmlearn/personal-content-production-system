"use client";

import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { STAGE_COLORS, STAGE_LABELS } from "@/lib/sales-copilot/constants";
import { useSales } from "../sales-context";
import { CustomerPicker } from "./customer-picker";
import { InsightPanel } from "./insight-panel";

export function Customer360View() {
  const { customer, generateVisit, generateProposal } = useSales();

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900">客户 360</h2>
        <CustomerPicker compact />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">{customer.name}</h3>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <Item label="行业" value={customer.industry} />
            <Item label="规模" value={customer.scale} />
            <Item label="地区" value={customer.region} />
            <Item label="商机阶段">
              <span
                className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${STAGE_COLORS[customer.stage]}`}
              >
                {STAGE_LABELS[customer.stage]}
              </span>
            </Item>
            <Item
              label="预计金额"
              value={`¥${(customer.expectedAmount / 10000).toFixed(0)} 万`}
            />
            <Item label="最近跟进" value={customer.lastActivity} />
            <Item
              label="当前系统"
              value={customer.currentSystems.join("、")}
            />
            <Item label="痛点标签">
              <div className="flex flex-wrap gap-1">
                {customer.painTags.map((t) => (
                  <span
                    key={t}
                    className="rounded bg-red-50 px-2 py-0.5 text-xs text-red-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Item>
          </dl>

          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold uppercase text-slate-500">
              关键联系人
            </p>
            <ul className="mt-2 space-y-2">
              {customer.contacts.map((c) => (
                <li
                  key={c.id}
                  className="flex justify-between text-sm text-slate-700"
                >
                  <span>
                    {c.name} · {c.title}
                  </span>
                  <span className="text-xs text-slate-500">{c.role}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={generateVisit}
              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Sparkles className="h-4 w-4" />
              生成拜访准备
            </button>
            <button
              type="button"
              onClick={generateProposal}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              生成售前方案
            </button>
          </div>
        </div>

        <InsightPanel />
      </div>
    </div>
  );
}

function Item({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-800">
        {children ?? value}
      </dd>
    </div>
  );
}
