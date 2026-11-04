"use client";

import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { usePrefs } from "@/lib/prefs";

const Chip3D = lazy(() => import("./Chip3D"));

/**
 * Holds the hero chip. The SVG (children) is always rendered and animates
 * with CSS (pulses, cores), paused while off screen. On desktop, once the
 * page is idle, the 3D chip loads on top and the SVG fades out under it.
 * Phones, reduced motion and browsers without WebGL keep the SVG.
 */
export function ChipStage({ children }: { children: ReactNode }) {
  const { reduced, touch } = usePrefs();
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const onReady = useCallback(() => setReady(true), []);

  // The 2D chip starts animating once the page is idle (never competing with
  // the first render), and pauses while off screen.
  useEffect(() => {
    const el = ref.current!;
    const io = new IntersectionObserver(([e]) => el.toggleAttribute("data-paused", !e.isIntersecting));
    io.observe(el);
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    const play = () => el.setAttribute("data-play", "");
    let t = 0;
    let id = 0;
    if (w.requestIdleCallback) id = w.requestIdleCallback(() => (t = window.setTimeout(play, 800)), { timeout: 3000 });
    else t = window.setTimeout(play, 2000);
    return () => {
      io.disconnect();
      window.clearTimeout(t);
      if (id) w.cancelIdleCallback?.(id);
    };
  }, []);

  useEffect(() => {
    if (reduced || touch || window.innerWidth < 1024) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    const go = () => setLoad(true);
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(go, { timeout: 2500 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(go, 1500);
    return () => window.clearTimeout(t);
  }, [reduced, touch]);

  return (
    <div ref={ref} className="chip-stage relative" data-3d={ready || undefined}>
      {children}
      {load ? (
        <Suspense fallback={null}>
          <Chip3D onReady={onReady} />
        </Suspense>
      ) : null}
    </div>
  );
}
