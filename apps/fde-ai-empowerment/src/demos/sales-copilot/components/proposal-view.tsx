"use client";

import { PROPOSAL_SCENARIOS } from "@/lib/sales-copilot/constants";
import { useSales } from "../sales-context";
import { CustomerPicker } from "./customer-picker";

export function ProposalView() {
  const {
    proposal,
    generateProposal,
    proposalScenario,
    setProposalScenario,
  } = useSales();

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900">售前方案生成</h2>
        <div className="flex flex-wrap items-center gap-2">
          <CustomerPicker compact />
          <select
            value={proposalScenario}
            onChange={(e) => setProposalScenario(e.target.value)}
            className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
          >
            {PROPOSAL_SCENARIOS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={generateProposal}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white"
          >
            生成方案
          </button>
        </div>
      </div>

      {!proposal ? (
        <p className="py-12 text-center text-sm text-slate-500">
          选择客户与场景后点击「生成方案」
        </p>
      ) : (
        <div className="space-y-4">
          <Section title="项目背景" text={proposal.background} />
          <Section title="客户痛点" list={proposal.pains} />
          <Section title="解决方案架构" list={proposal.architecture} />
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold">产品能力匹配</h3>
            <ul className="mt-2 space-y-2">
              {proposal.productMatch.map((m) => (
                <li key={m.module} className="text-sm text-slate-600">
                  <span className="font-medium text-slate-800">{m.module}</span>
                  — {m.fit}
                </li>
              ))}
            </ul>
          </div>
          <Section title="实施路径" list={proposal.implementation} />
          <Section title="预期收益" list={proposal.expectedBenefits} />
          <Section title="成功案例" list={proposal.caseStudies} />
          <Section title="下一步计划" list={proposal.nextPlan} />
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  text,
  list,
}: {
  title: string;
  text?: string;
  list?: string[];
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {text && (
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
      )}
      {list && (
        <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-600">
          {list.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
