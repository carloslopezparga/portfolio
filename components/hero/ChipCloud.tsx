"use client";

import { useEffect, useRef } from "react";
import { CLOUD_SIZE, DESKTOP_QUERY } from "@/lib/chip-config";
import { usePrefs } from "@/lib/prefs";

type IdleWindow = Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };

/** Phones wait this long after the page has loaded before loading the scene. */
const PHONE_DELAY = 4000;

/**
 * Loads the WebGL point cloud over the sphere poster, after first paint and
 * only once the chip is near the screen: on desktop as soon as the page is
 * idle; on phones 4 s after the page has loaded (three.js is a large script
 * for a mid-range phone, and a tap or the first keystroke in the agent must
 * never wait for it). The scene's first frame is the poster, so the swap is
 * invisible. Reduced motion: nothing loads and the still poster stays.
 */
export function ChipCloud() {
  const ref = useRef<HTMLCanvasElement>(null);
  const { reduced, touch } = usePrefs();

  useEffect(() => {
    if (reduced) return;
    const canvas = ref.current!;
    const stage = canvas.parentElement!;
    const w = window as IdleWindow;
    const mq = matchMedia(DESKTOP_QUERY);
    let dispose: (() => void) | undefined;
    let cancelled = false;
    let started = false;
    const pending: (() => void)[] = [];
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms);
      pending.push(() => window.clearTimeout(id));
    };
    const whenIdle = (fn: () => void, timeout: number) => {
      if (!w.requestIdleCallback) return later(fn, 200);
      const id = w.requestIdleCallback(fn, { timeout });
      pending.push(() => w.cancelIdleCallback?.(id));
    };
    const whenNear = (fn: () => void) => {
      const io = new IntersectionObserver((entries) => {
        if (!entries[entries.length - 1].isIntersecting) return;
        io.disconnect();
        fn();
      }, { rootMargin: "200px 0px" });
      io.observe(stage);
      pending.push(() => io.disconnect());
    };
    const clear = () => pending.splice(0).forEach((c) => c());

    const start = () => {
      if (started || cancelled) return;
      started = true;
      clear();
      mq.removeEventListener("change", onBreakpoint);
      const desktop = mq.matches; // the poster CSS shows follows the same query
      import("./chip-scene")
        .then(({ mountChip }) => {
          if (cancelled) return;
          dispose = mountChip(canvas, {
            n: desktop ? CLOUD_SIZE.desktop : CLOUD_SIZE.mobile,
            pointer: desktop && !touch,
            onFirstFrame: () => stage.setAttribute("data-live", ""),
            onFail: () => stage.setAttribute("data-fallback", ""),
          });
        })
        .catch(() => stage.setAttribute("data-fallback", ""));
    };
    const desktopPath = () => requestAnimationFrame(() => whenIdle(() => whenNear(start), 1500));
    const phonePath = () => {
      const afterLoad = () => later(() => whenIdle(() => whenNear(start), 2000), PHONE_DELAY);
      if (document.readyState === "complete") afterLoad();
      else {
        window.addEventListener("load", afterLoad, { once: true });
        pending.push(() => window.removeEventListener("load", afterLoad));
      }
    };
    // a tablet turned to landscape before the scene loaded takes the desktop path
    function onBreakpoint() {
      if (started || !mq.matches) return;
      clear();
      desktopPath();
    }
    mq.addEventListener("change", onBreakpoint);
    if (mq.matches) desktopPath();
    else phonePath();

    return () => {
      cancelled = true;
      clear();
      mq.removeEventListener("change", onBreakpoint);
      dispose?.();
      stage.removeAttribute("data-live");
      stage.removeAttribute("data-fallback");
    };
  }, [reduced, touch]);

  return <canvas ref={ref} className="chip-canvas" aria-hidden />;
}
