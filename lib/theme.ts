"use client";

import { useSyncExternalStore } from "react";

export type Theme = "dark" | "light";

function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}

export function useTheme(): Theme {
  return useSyncExternalStore(
    subscribe,
    () => (document.documentElement.dataset.theme === "light" ? "light" : "dark"),
    () => "dark",
  );
}

export function applyTheme(next: Theme) {
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {}
}

/** Circular reveal from (x, y) using the View Transitions API; instant fallback. */
export function switchTheme(next: Theme, x: number, y: number, reduced: boolean) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
  if (!doc.startViewTransition || reduced) {
    applyTheme(next);
    return;
  }
  const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const vt = doc.startViewTransition(() => applyTheme(next));
  vt.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 800, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    })
    .catch(() => {});
}
