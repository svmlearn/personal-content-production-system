"use client";

import type { BusinessForm } from "@/lib/process-agent/types";

interface FormEditorProps {
  form: BusinessForm;
  onChange: (key: string, value: string) => void;
}

export function FormEditor({ form, onChange }: FormEditorProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">{form.title}</h3>
      <p className="mt-0.5 text-xs text-slate-500">Agent 已自动填充，可编辑</p>
      <div className="mt-4 space-y-3">
        {form.fields.map((field) => (
          <label key={field.key} className="block text-sm">
            <span className="text-xs font-medium text-slate-600">
              {field.label}
            </span>
            <input
              value={field.value}
              disabled={!field.editable}
              onChange={(e) => onChange(field.key, e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 disabled:bg-slate-50"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
