"use client";

import { DOCUMENT_TEMPLATES, getFormFields } from "@/lib/document-gen/templates";
import { useDocument } from "../document-context";

export function FormView() {
  const { document, updateForm, generateOutline, setView } = useDocument();
  if (!document) return null;

  const fields = getFormFields(document.type);
  const label = DOCUMENT_TEMPLATES.find((t) => t.type === document.type)?.label;

  return (
    <div className="mx-auto max-w-2xl p-6">
      <button
        type="button"
        onClick={() => setView("picker")}
        className="text-sm text-slate-500 hover:text-slate-800"
      >
        ← 返回类型选择
      </button>
      <h2 className="mt-2 text-lg font-semibold">{label} · 结构化输入</h2>
      <div className="mt-6 space-y-4">
        {fields.map((f) => (
          <label key={f.key} className="block text-sm">
            <span className="font-medium text-slate-700">
              {f.label}
              {f.required && <span className="text-red-500"> *</span>}
            </span>
            {f.type === "textarea" ? (
              <textarea
                value={document.form[f.key] ?? ""}
                onChange={(e) => updateForm(f.key, e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            ) : f.type === "select" ? (
              <select
                value={document.form[f.key] ?? ""}
                onChange={(e) => updateForm(f.key, e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                {f.options?.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={document.form[f.key] ?? ""}
                onChange={(e) => updateForm(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            )}
          </label>
        ))}
      </div>
      <button
        type="button"
        onClick={generateOutline}
        className="mt-8 w-full rounded-xl bg-violet-600 py-3 text-sm font-medium text-white hover:bg-violet-700"
      >
        生成文档大纲
      </button>
    </div>
  );
}
