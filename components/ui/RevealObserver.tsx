"use client";

import { useEffect } from "react";
import { getPrefs } from "@/lib/prefs";

type IdleWindow = Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };

/**
 * Reveals .reveal elements once they come into view (section titles rise a
 * little, everything else only fades in: see globals.css). Nothing can stay
 * hidden: when a scroll settles (a jump from the nav, ⌘K or the agent, a fast
 * fling) or the tab comes back, everything in view or above it is shown at
 * once. Watches the DOM, so client components that mount later are picked up
 * too. Reduced motion: CSS shows everything immediately.
 *
 * It starts once the browser is idle: by then React has hydrated every
 * section, so marking an element as revealed never races its hydration.
 */
export function RevealObserver() {
  useEffect(() => {
    const w = window as IdleWindow;
    const idle = typeof w.requestIdleCallback === "function";
    let stop: (() => void) | undefined;
    let cancelled = false;
    const go = () => {
      if (!cancelled) stop = observe();
    };
    const id = idle ? w.requestIdleCallback!(go, { timeout: 800 }) : window.setTimeout(go, 150);
    return () => {
      cancelled = true;
      if (idle) w.cancelIdleCallback?.(id);
      else window.clearTimeout(id);
      stop?.();
    };
  }, []);
  return null;
}

function observe(): () => void {
  const show = (el: Element) => el.setAttribute("data-in", "");
  if (getPrefs().reduced || !("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach(show);
    return () => {};
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries)
        if (e.isIntersecting) {
          show(e.target);
          io.unobserve(e.target);
        }
    },
    { rootMargin: "0px 0px -6% 0px", threshold: 0.05 },
  );
  const watch = (root: ParentNode) => root.querySelectorAll(".reveal:not([data-in])").forEach((el) => io.observe(el));
  watch(document);
  const mo = new MutationObserver((records) => {
    for (const r of records) r.addedNodes.forEach((n) => n instanceof Element && (n.matches(".reveal:not([data-in])") ? io.observe(n) : watch(n)));
  });
  mo.observe(document.body, { childList: true, subtree: true });

  const settle = () => {
    document.querySelectorAll(".reveal:not([data-in])").forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) {
        show(el);
        io.unobserve(el);
      }
    });
  };
  let t = 0;
  const onScroll = () => {
    window.clearTimeout(t);
    t = window.setTimeout(settle, 120);
  };
  const onVisible = () => !document.hidden && settle();
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onVisible);
  const first = window.setTimeout(settle, 300); // a #hash landing mid-page
  return () => {
    io.disconnect();
    mo.disconnect();
    window.clearTimeout(t);
    window.clearTimeout(first);
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("visibilitychange", onVisible);
  };
}
