"use client";

import { Bot, User } from "lucide-react";
import { INTENT_COLORS, INTENT_LABELS } from "@/lib/customer-service/constants";
import type { Message } from "@/lib/customer-service/types";

export function MessageBubble({ message }: { message: Message }) {
  if (message.role === "system") {
    return (
      <p className="text-center text-xs text-slate-400">{message.content}</p>
    );
  }

  const isUser = message.role === "user";

  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-600"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={`max-w-[85%] ${isUser ? "text-right" : ""}`}>
        {message.intent && !isUser && (
          <span
            className={`mb-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${INTENT_COLORS[message.intent]}`}
          >
            {INTENT_LABELS[message.intent]}
          </span>
        )}
        <div
          className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
            isUser
              ? "rounded-tr-sm bg-indigo-600 text-white"
              : "rounded-tl-sm border border-slate-200 bg-white text-slate-800"
          }`}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>
        <p className="mt-0.5 text-[10px] text-slate-400">
          {new Date(message.timestamp).toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
