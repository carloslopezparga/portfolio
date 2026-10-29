"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import type { Locale } from "@/content/types";
import { agentUI } from "@/lib/agent/store";

const AgentConsole = dynamic(() => import("./AgentConsole"), { ssr: false });

/** Mounts the console only after it is first opened, so it costs nothing until then. */
export function AgentHost({ lang }: { lang: Locale }) {
  const opened = useSyncExternalStore(
    agentUI.subscribe,
    () => agentUI.get().seq > 0,
    () => false,
  );
  return opened ? <AgentConsole lang={lang} /> : null;
}
