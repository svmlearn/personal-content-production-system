"use client";

import { useWorkbench } from "../workbench-context";
import { PageHeader } from "./app-shell";

export function AdminView() {
  const { documents, auditLogs, can, currentUser } = useWorkbench();

  if (!can("audit", "read") && currentUser.role !== "admin") {
    return (
      <>
        <PageHeader title="管理后台" />
        <p className="p-8 text-center text-sm text-slate-500">
          需要管理员权限查看审计与知识库配置
        </p>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="管理后台"
        desc="知识库、权限策略、审计日志 — Mock 配置面板"
      />
      <div className="grid gap-6 p-4 lg:grid-cols-2 lg:p-6">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold text-slate-900">知识库文档</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {documents.map((d) => (
              <li
                key={d.id}
                className="flex justify-between rounded-lg border border-slate-100 p-2"
              >
                <span>{d.title}</span>
                <span className="text-xs text-slate-500">{d.sensitivity}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">
            接入：向量库索引 · 文档同步管道 · 字段级权限
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold text-slate-900">审计日志</h3>
          <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto text-xs">
            {auditLogs.map((l) => (
              <li key={l.id} className="rounded-lg bg-slate-50 p-2 font-mono">
                <span className="text-indigo-600">{l.action}</span> · {l.actor} ·{" "}
                {l.resource}
                <p className="mt-0.5 text-slate-600">{l.detail}</p>
                <p className="text-slate-400">{l.at.slice(0, 19).replace("T", " ")}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 lg:col-span-2">
          <h3 className="font-semibold text-slate-900">工程化接入清单</h3>
          <ul className="mt-2 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
            <li>· WORKBENCH_HOOK.llmChat — 大模型网关</li>
            <li>· WORKBENCH_HOOK.vectorDb — RAG 检索</li>
            <li>· WORKBENCH_HOOK.erpApi — CRM/OA/ERP</li>
            <li>· WORKBENCH_HOOK.authz — 统一权限</li>
            <li>· 审批流 BPMN / 飞书审批</li>
            <li>· OpenTelemetry 审计上报</li>
          </ul>
        </div>
      </div>
    </>
  );
}
