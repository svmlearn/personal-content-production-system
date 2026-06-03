"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createInitialConversation,
  createSeedConversations,
  createSeedTickets,
  createTicket,
  processUserMessage,
} from "@/lib/customer-service/engine";
import type { Conversation, Ticket } from "@/lib/customer-service/types";

export type ServiceView = "customer" | "agent" | "supervisor";

interface ServiceContextValue {
  view: ServiceView;
  setView: (v: ServiceView) => void;
  conversations: Conversation[];
  activeConversationId: string;
  setActiveConversationId: (id: string) => void;
  activeConversation: Conversation;
  tickets: Ticket[];
  sendMessage: (text: string) => void;
  confirmTicket: () => void;
  adoptReply: (ticketId: string) => void;
  resolveTicket: (ticketId: string) => void;
  startNewConversation: () => void;
}

const ServiceContext = createContext<ServiceContextValue | null>(null);

export function ServiceProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<ServiceView>("customer");
  const [conversations, setConversations] = useState<Conversation[]>(() => [
    createInitialConversation(),
    ...createSeedConversations(),
  ]);
  const [activeConversationId, setActiveConversationId] = useState(
    () => conversations[0].id,
  );
  const [tickets, setTickets] = useState<Ticket[]>(() => createSeedTickets());

  const activeConversation = useMemo(
    () =>
      conversations.find((c) => c.id === activeConversationId) ??
      conversations[0],
    [conversations, activeConversationId],
  );

  const updateConversation = useCallback(
    (id: string, updater: (c: Conversation) => Conversation) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? updater(c) : c)),
      );
    },
    [],
  );

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      updateConversation(activeConversationId, (conv) => {
        const { messages: newMsgs, conversationPatch } = processUserMessage(
          conv,
          trimmed,
        );
        return {
          ...conv,
          ...conversationPatch,
          messages: [...conv.messages, ...newMsgs],
        };
      });
    },
    [activeConversationId, updateConversation],
  );

  const confirmTicket = useCallback(() => {
    updateConversation(activeConversationId, (c) => {
      const ticket = createTicket(c);
      setTickets((prev) => [ticket, ...prev]);
      return {
        ...c,
        ticketId: ticket.id,
        status: "escalated" as const,
        transferredToHuman: true,
        messages: [
          ...c.messages,
          {
            id: `msg-${Date.now()}-sys`,
            role: "system" as const,
            content: `工单 ${ticket.id} 已创建，分类：${ticket.category}，优先级：${ticket.priority}。人工客服将尽快联系您。`,
            timestamp: new Date().toISOString(),
          },
        ],
      };
    });
  }, [activeConversationId, updateConversation]);

  const adoptReply = useCallback((ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: "in_progress",
            }
          : t,
      ),
    );
  }, []);

  const resolveTicket = useCallback((ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId ? { ...t, status: "resolved" } : t,
      ),
    );
  }, []);

  const startNewConversation = useCallback(() => {
    const conv = createInitialConversation();
    setConversations((prev) => [conv, ...prev]);
    setActiveConversationId(conv.id);
  }, []);

  const value = useMemo(
    () => ({
      view,
      setView,
      conversations,
      activeConversationId,
      setActiveConversationId,
      activeConversation,
      tickets,
      sendMessage,
      confirmTicket,
      adoptReply,
      resolveTicket,
      startNewConversation,
    }),
    [
      view,
      conversations,
      activeConversationId,
      activeConversation,
      tickets,
      sendMessage,
      confirmTicket,
      adoptReply,
      resolveTicket,
      startNewConversation,
    ],
  );

  return (
    <ServiceContext.Provider value={value}>{children}</ServiceContext.Provider>
  );
}

export function useService() {
  const ctx = useContext(ServiceContext);
  if (!ctx) throw new Error("useService must be used within ServiceProvider");
  return ctx;
}
