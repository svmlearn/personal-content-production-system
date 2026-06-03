"use client";

import { Search, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";

interface QuestionInputProps {
  onSubmit: (question: string) => void;
  defaultValue?: string;
  large?: boolean;
}

export function QuestionInput({
  onSubmit,
  defaultValue = "",
  large = false,
}: QuestionInputProps) {
  const [value, setValue] = useState(defaultValue);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(value);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={`flex items-center gap-2 rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100 ${
          large ? "px-4 py-3" : "px-3 py-2"
        }`}
      >
        <Search className={`shrink-0 text-slate-400 ${large ? "h-5 w-5" : "h-4 w-4"}`} />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="输入问题，基于企业知识库获取可溯源回答…"
          className={`min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400 ${
            large ? "text-base" : "text-sm"
          }`}
        />
        <button
          type="submit"
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-sky-600 font-medium text-white transition-colors hover:bg-sky-700 ${
            large ? "px-4 py-2 text-sm" : "px-3 py-1.5 text-xs"
          }`}
        >
          <Sparkles className={large ? "h-4 w-4" : "h-3.5 w-3.5"} />
          提问
        </button>
      </div>
    </form>
  );
}
