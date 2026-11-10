"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "@/components/providers/SmoothScroll";
import { CLOUD_SIZE, DESKTOP_QUERY } from "@/lib/chip-config";
import { usePrefs } from "@/lib/prefs";
import type { SceneHandle } from "./scene";

type IdleWindow = Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };

/** Phones wait this long after the page has loaded before loading the scene. */
const PHONE_DELAY = 4000;

/**
 * Loads the page's point cloud (one WebGL context) over the chip's sphere
 * poster, after first paint and only once a figure's gap is near the screen:
 * on desktop as soon as the page is idle; on phones 4 s after the page has
 * loaded (three.js is a large script for a mid-range phone, and a tap or the
 * first keystroke in the agent must never wait for it). The scene's first
 * frame is the poster, so the swap is invisible.
 *
 * Desktop (≥ 1024 px): a fixed, full-screen canvas that takes no clicks, on
 * which the cloud travels from figure to figure. Phones and tablets: only
 * the chip, on the canvas inside its own stage, so it scrolls with the page.
 * Reduced motion (or the pause button): nothing loads and every gap shows
 * its still poster.
 */
export function Figures() {
  const ref = useRef<HTMLCanvasElement>(null);
  const handle = useRef<SceneHandle | null>(null);
  const { reduced, touch } = usePrefs();
  const lenis = useLenis();

  // the smooth scroll starts later than the scene: draw after it in each frame, never a frame behind
  useEffect(() => handle.current?.rearm(), [lenis]);

  useEffect(() => {
    if (reduced) return;
    const inline = ref.current!;
    const stage = inline.parentElement!;
    const gaps = () => document.querySelectorAll<HTMLElement>("[data-figure]");
    const w = window as IdleWindow;
    const mq = matchMedia(DESKTOP_QUERY);
    let cancelled = false;
    let run = 0;
    let layer: HTMLCanvasElement | null = null;
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
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        fn();
      }, { rootMargin: "200px 0px" });
      // phones only ever show the chip
      if (mq.matches) gaps().forEach((el) => io.observe(el));
      else io.observe(stage);
      pending.push(() => io.disconnect());
    };
    const clear = () => pending.splice(0).forEach((c) => c());
    const stop = () => {
      run++;
      clear();
      handle.current?.dispose();
      handle.current = null;
      layer?.remove();
      layer = null;
      stage.removeAttribute("data-live");
      gaps().forEach((el) => el.removeAttribute("data-fallback"));
    };
    const fail = () => gaps().forEach((el) => el.setAttribute("data-fallback", ""));

    const start = () => {
      clear();
      const mine = ++run;
      const desktop = mq.matches; // the posters CSS shows follow the same query
      import("./scene")
        .then(({ mountFigures }) => {
          if (cancelled || mine !== run) return;
          let canvas = inline;
          if (desktop) {
            layer = document.createElement("canvas");
            layer.className = "fig-layer";
            layer.setAttribute("aria-hidden", "true");
            document.body.append(layer);
            canvas = layer;
          }
          handle.current = mountFigures(canvas, {
            n: desktop ? CLOUD_SIZE.desktop : CLOUD_SIZE.mobile,
            layer: desktop,
            pointer: desktop && !touch,
            onFirstFrame: () => stage.setAttribute("data-live", ""),
            onFail: fail,
          });
        })
        .catch(fail);
    };
    const boot = () => {
      if (mq.matches) requestAnimationFrame(() => whenIdle(() => whenNear(start), 1500));
      else {
        const afterLoad = () => later(() => whenIdle(() => whenNear(start), 2000), PHONE_DELAY);
        if (document.readyState === "complete") afterLoad();
        else {
          window.addEventListener("load", afterLoad, { once: true });
          pending.push(() => window.removeEventListener("load", afterLoad));
        }
      }
    };
    // crossing the breakpoint (a tablet turned, a window resized) changes canvas and cloud: start over
    const onBreakpoint = () => {
      stop();
      boot();
    };
    mq.addEventListener("change", onBreakpoint);
    boot();

    return () => {
      cancelled = true;
      mq.removeEventListener("change", onBreakpoint);
      stop();
    };
  }, [reduced, touch]);

  return <canvas ref={ref} className="chip-canvas" aria-hidden />;
}
