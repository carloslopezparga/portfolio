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
 * Lenis driven by GSAP's ticker so ScrollTrigger and smooth scroll share one
 * clock. Both libraries are loaded after the page is idle, so they never
 * compete with the first paint or hydration.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    let cleanup = () => {};
    idle(async () => {
      const [{ default: LenisCtor }, { gsap, ScrollTrigger }] = await Promise.all([import("lenis"), import("@/lib/gsap")]);
      if (cancelled) return;
      const instance = new LenisCtor({
        autoRaf: false,
        lerp: 0.1,
        anchors: { offset: -72, duration: 1.2 },
        prevent: (node) => node.closest("[data-lenis-prevent]") !== null,
      });
      instance.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => instance.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      setLenis(instance);
      cleanup = () => {
        gsap.ticker.remove(tick);
        instance.destroy();
      };
    });
    return () => {
      cancelled = true;
      cleanup();
      setLenis(null);
    };
  }, [reduced]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
