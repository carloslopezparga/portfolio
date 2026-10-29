"use client";

import { createStore } from "@/lib/ui-bus";

/** Whether the console is open, and a question waiting to be sent when it mounts. */
export const agentUI = createStore<{ open: boolean; pending: string | null; seq: number }>({ open: false, pending: null, seq: 0 });

export function askAgent(question?: string) {
  agentUI.set((s) => ({ open: true, pending: question?.trim() || null, seq: s.seq + 1 }));
}

export const preloadConsole = () => import("@/components/agent/AgentConsole");
