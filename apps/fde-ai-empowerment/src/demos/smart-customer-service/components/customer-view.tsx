"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Send } from "lucide-react";
import { EXAMPLE_QUESTIONS } from "@/lib/customer-service/constants";
import { MOCK_CUSTOMER } from "@/lib/customer-service/mock-data";
import { searchFAQ } from "@/lib/customer-service/engine";
import { INTENT_LABELS } from "@/lib/customer-service/constants";
import { useService } from "../service-context";
import { MessageBubble } from "./message-bubble";
import { TicketCard } from "./ticket-card";

export function CustomerView() {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    activeConversation,
    sendMessage,
    confirmTicket,
    startNewConversation,
  } = useService();
  const [input, setInput] = useState("");
  const [ticketConfirmed, setTicketConfirmed] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const lastAiWithTicket = [...activeConversation.messages]
    .reverse()
    .find((m) => m.role === "ai" && m.pendingTicket);

  const intent = activeConversation.currentIntent;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation.messages]);

  useEffect(() => {
    setTicketConfirmed(Boolean(activeConversation.ticketId));
  }, [activeConversation.id, activeConversation.ticketId]);

  function handleSend(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg) return;
    sendMessage(msg);
    setInput("");
  }

  function handleConfirmTicket() {
    confirmTicket();
    setTicketConfirmed(true);
  }

  return (
    <div className="flex h-[min(720px,85vh)] flex-col lg:flex-row">
      {/* 左侧会话列表 */}
      <aside className="hidden w-52 shrink-0 flex-col border-r border-slate-200 bg-slate-50/80 lg:flex">
        <div className="flex items-center justify-between border-b border-slate-200 p-3">
          <span className="text-xs font-semibold text-slate-700">会话</span>
          <button
            type="button"
            onClick={startNewConversation}
            className="rounded p-1 text-slate-500 hover:bg-slate-200"
            title="新会话"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <ul className="flex-1 overflow-y-auto p-2">
          {conversations.slice(0, 6).map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setActiveConversationId(c.id)}
                className={`mb-1 w-full rounded-lg px-2 py-2 text-left text-xs transition-colors ${
                  c.id === activeConversationId
                    ? "bg-indigo-100 text-indigo-900"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <p className="truncate font-medium">
                  {c.messages.find((m) => m.role === "user")?.content ??
                    "新会话"}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  {c.status === "resolved"
                    ? "已解决"
                    : c.transferredToHuman
                      ? "已转人工"
                      : "进行中"}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* 中间聊天 */}
      <div className="flex min-w-0 flex-1 flex-col bg-slate-100/50">
        <div className="border-b border-slate-200 bg-white px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">在线客服</h3>
          <p className="text-xs text-slate-500">AI 客服小智 · 7×24 响应</p>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {activeConversation.messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
          {lastAiWithTicket?.pendingTicket && (
            <div className="max-w-md">
              <TicketCard
                draft={lastAiWithTicket.pendingTicket}
                onConfirm={handleConfirmTicket}
                confirmed={ticketConfirmed}
              />
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-slate-200 bg-white p-3">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {EXAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSend(q)}
                className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] text-slate-600 hover:border-indigo-300 hover:text-indigo-700"
              >
                {q}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="描述您的问题…"
              className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
            />
            <button
              type="submit"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* 右侧客户信息与知识推荐 */}
      <aside className="hidden w-56 shrink-0 flex-col border-l border-slate-200 bg-white p-4 xl:flex">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          客户信息
        </h4>
        <dl className="mt-2 space-y-2 text-xs">
          <div>
            <dt className="text-slate-400">姓名</dt>
            <dd className="font-medium text-slate-800">{MOCK_CUSTOMER.name}</dd>
          </div>
          <div>
            <dt className="text-slate-400">企业</dt>
            <dd className="text-slate-700">{MOCK_CUSTOMER.company}</dd>
          </div>
          <div>
            <dt className="text-slate-400">套餐</dt>
            <dd>
              <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-indigo-700">
                {MOCK_CUSTOMER.tier}
              </span>
            </dd>
          </div>
        </dl>

        {intent && (
          <>
            <h4 className="mt-6 text-xs font-semibold uppercase tracking-wide text-slate-500">
              当前意图
            </h4>
            <p className="mt-1 text-sm font-medium text-indigo-700">
              {INTENT_LABELS[intent]}
            </p>
          </>
        )}

        <h4 className="mt-6 text-xs font-semibold uppercase tracking-wide text-slate-500">
          知识推荐
        </h4>
        <ul className="mt-2 space-y-2">
          {(intent
            ? searchFAQ(
                intent,
                [...activeConversation.messages]
                  .reverse()
                  .find((m) => m.role === "user")?.content ?? "",
              )
            : []
          )
            .slice(0, 3)
            .map((f) => (
              <li
                key={f.id}
                className="rounded-lg border border-slate-100 bg-slate-50 p-2 text-[11px] text-slate-600"
              >
                {f.question}
              </li>
            ))}
        </ul>
      </aside>
    </div>
  );
}
