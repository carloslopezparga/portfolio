"use client";

import type Lenis from "lenis";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/prefs";

const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

const idle = (cb: () => void) => {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
  if (w.requestIdleCallback) w.requestIdleCallback(cb, { timeout: 1500 });
  else window.setTimeout(cb, 300);
};

/**
 * Lenis smooth scroll, loaded after the page is idle so it never competes
 * with the first paint or hydration. It scrolls the window natively, so any
 * ScrollTrigger (lab) keeps working without a shared ticker.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    let instance: Lenis | null = null;
    idle(async () => {
      const { default: LenisCtor } = await import("lenis");
      if (cancelled) return;
      instance = new LenisCtor({
        autoRaf: true,
        lerp: 0.12,
        anchors: { offset: -64, duration: 1.1 },
        prevent: (node) => node.closest("[data-lenis-prevent]") !== null,
      });
      setLenis(instance);
    });
    return () => {
      cancelled = true;
      instance?.destroy();
      setLenis(null);
    };
  }, [reduced]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
