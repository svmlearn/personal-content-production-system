"use client";

import { useMemo, useState } from "react";
import { Upload } from "lucide-react";
import { CATEGORY_META } from "@/lib/knowledge/constants";
import { KNOWLEDGE_DOCUMENTS, ROLES } from "@/lib/knowledge/mock-data";
import type { KnowledgeCategory } from "@/lib/knowledge/types";
import { useKnowledge } from "../knowledge-context";

export function AdminView() {
  const { user } = useKnowledge();
  const [category, setCategory] = useState<KnowledgeCategory | "all">("all");
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  const visibleDocs = useMemo(() => {
    const role = ROLES[user.role];
    return KNOWLEDGE_DOCUMENTS.filter((doc) => {
      if (doc.permissionLevel > role.maxPermissionLevel) return false;
      if (category !== "all" && doc.category !== category) return false;
      return true;
    });
  }, [user.role, category]);

  function handleUpload() {
    setUploadMsg("已模拟上传：文档进入待索引队列（Demo 无真实后端）");
    setTimeout(() => setUploadMsg(null), 4000);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">知识库管理</h2>
          <p className="mt-1 text-sm text-slate-500">
            按当前角色「{ROLES[user.role].label}」过滤可见文档
          </p>
        </div>
        <button
          type="button"
          onClick={handleUpload}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
        >
          <Upload className="h-4 w-4" />
          上传文档
        </button>
      </div>

      {uploadMsg && (
        <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {uploadMsg}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
          全部分类
        </FilterChip>
        {(Object.keys(CATEGORY_META) as KnowledgeCategory[]).map((cat) => (
          <FilterChip
            key={cat}
            active={category === cat}
            onClick={() => setCategory(cat)}
          >
            {CATEGORY_META[cat].label}
          </FilterChip>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-xs text-slate-500">
              <th className="px-4 py-3 font-medium">标题</th>
              <th className="px-4 py-3 font-medium">类型</th>
              <th className="px-4 py-3 font-medium">分类</th>
              <th className="px-4 py-3 font-medium">更新</th>
              <th className="px-4 py-3 font-medium">负责人</th>
              <th className="px-4 py-3 font-medium">可访问部门</th>
              <th className="px-4 py-3 font-medium">索引</th>
            </tr>
          </thead>
          <tbody>
            {visibleDocs.map((doc) => (
              <tr key={doc.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-900">{doc.title}</td>
                <td className="px-4 py-3 text-slate-600">{doc.type}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded border px-1.5 py-0.5 text-xs ${CATEGORY_META[doc.category].color}`}
                  >
                    {CATEGORY_META[doc.category].label}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{doc.updatedAt}</td>
                <td className="px-4 py-3 text-slate-600">{doc.owner}</td>
                <td className="max-w-[140px] truncate px-4 py-3 text-slate-600">
                  {doc.accessibleDepartments.join("、")}
                </td>
                <td className="px-4 py-3">
                  <IndexBadge status={doc.indexStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visibleDocs.length === 0 && (
          <p className="p-8 text-center text-sm text-slate-500">
            当前角色无可查看文档
          </p>
        )}
      </div>

      <p className="mt-4 text-xs text-slate-400">
        提示：切换为「普通员工」后，主管级文档（如产品规则、预算流程）将不可见；
        在问答页询问相关产品规则可体验权限拦截。
      </p>
    </div>
  );
}

function FilterChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-sky-600 bg-sky-50 text-sky-700"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
      }`}
    >
      {children}
    </button>
  );
}

function IndexBadge({ status }: { status: "indexed" | "pending" | "failed" }) {
  const map = {
    indexed: "bg-emerald-50 text-emerald-700",
    pending: "bg-amber-50 text-amber-700",
    failed: "bg-red-50 text-red-700",
  };
  const label = { indexed: "已索引", pending: "待索引", failed: "失败" };
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${map[status]}`}>
      {label[status]}
    </span>
  );
}
