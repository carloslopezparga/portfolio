"use client";

import { useEffect, useRef } from "react";
import { CLOUD_SIZE, DESKTOP_QUERY } from "@/lib/chip-cloud";
import { usePrefs } from "@/lib/prefs";

type IdleWindow = Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };

/** Phones wait this long after the page has loaded (or for the first touch or scroll) before loading the scene. */
const PHONE_DELAY = 4000;

/**
 * Loads the WebGL point cloud over the sphere poster, after first paint and
 * never competing with it: on desktop as soon as the page is idle; on
 * phones once the page has settled (or on the first touch or scroll), since
 * three.js is a large script for a mid-range phone. The scene's first frame
 * is the poster, so the swap is invisible. Reduced motion: nothing loads and
 * the still poster stays.
 */
export function ChipCloud() {
  const ref = useRef<HTMLCanvasElement>(null);
  const { reduced, touch } = usePrefs();

  useEffect(() => {
    if (reduced) return;
    const canvas = ref.current!;
    const stage = canvas.parentElement!;
    const w = window as IdleWindow;
    const desktop = matchMedia(DESKTOP_QUERY).matches;
    let dispose: (() => void) | undefined;
    let cancelled = false;
    let started = false;
    let timer = 0;
    let idle = 0;
    const triggers = ["pointerdown", "touchstart", "scroll", "keydown"] as const;

    const clear = () => {
      window.clearTimeout(timer);
      if (idle) w.cancelIdleCallback?.(idle);
      window.removeEventListener("load", onLoad);
      triggers.forEach((t) => window.removeEventListener(t, start));
    };
    function start() {
      if (started || cancelled) return;
      started = true;
      clear();
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
    }
    const whenIdle = (fn: () => void, timeout: number) => {
      if (w.requestIdleCallback) idle = w.requestIdleCallback(fn, { timeout });
      else timer = window.setTimeout(fn, 200);
    };
    function onLoad() {
      timer = window.setTimeout(() => whenIdle(start, 2000), PHONE_DELAY);
    }

    if (desktop) {
      // after the first paint, when the main thread is free
      requestAnimationFrame(() => whenIdle(start, 1500));
    } else {
      triggers.forEach((t) => window.addEventListener(t, start, { once: true, passive: true }));
      if (document.readyState === "complete") onLoad();
      else window.addEventListener("load", onLoad, { once: true });
    }

    return () => {
      cancelled = true;
      clear();
      dispose?.();
      stage.removeAttribute("data-live");
      stage.removeAttribute("data-fallback");
    };
  }, [reduced, touch]);

  return <canvas ref={ref} className="chip-canvas" aria-hidden />;
}
