"use client";

import type { DomainId, Locale, ProjectId, SectionId } from "@/content/types";

/**
 * Every interface action the agent (and the rest of the page) can trigger.
 * The agent's tools map 1:1 to these; ids are validated against
 * `registry` in content/profile.ts on the server before they get here.
 */
export type UIAction =
  | { type: "scroll_to"; sectionId: SectionId }
  | { type: "highlight"; targetId: string }
  | { type: "open_project"; projectId: ProjectId }
  | { type: "download_cv"; lang: Locale }
  | { type: "open_booking" }
  | { type: "focus_part"; part: DomainId }
  | { type: "filter_domain"; domain: DomainId | null };

const EVENT = "ui:action";

export function dispatchUI(action: UIAction) {
  window.dispatchEvent(new CustomEvent<UIAction>(EVENT, { detail: action }));
}

export function onUI<T extends UIAction["type"]>(type: T, handler: (a: Extract<UIAction, { type: T }>) => void) {
  const listener = (e: Event) => {
    const a = (e as CustomEvent<UIAction>).detail;
    if (a.type === type) handler(a as Extract<UIAction, { type: T }>);
  };
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}

/* ------------------------- tiny shared stores -------------------------- */

type Listener = () => void;

/** A minimal external store usable from React (useSyncExternalStore) and plain code. */
export function createStore<T>(initial: T) {
  let value = initial;
  const listeners = new Set<Listener>();
  return {
    get: () => value,
    set: (next: T | ((prev: T) => T)) => {
      value = typeof next === "function" ? (next as (p: T) => T)(value) : next;
      listeners.forEach((l) => l());
    },
    subscribe: (l: Listener) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

/** True while the agent is generating — the gearbox's neural core pulses faster. */
export const agentBusy = createStore(false);
agentBusy.subscribe(() => {
  if (typeof document === "undefined") return;
  if (agentBusy.get()) document.documentElement.dataset.agentBusy = "";
  else delete document.documentElement.dataset.agentBusy;
});
