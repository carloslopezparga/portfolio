"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "@/components/providers/SmoothScroll";
import { CLOUD_SIZE, DESKTOP_QUERY } from "@/lib/chip-config";
import { usePrefs } from "@/lib/prefs";
import type { SceneHandle } from "./scene";

/**
 * Loads the page's point cloud (one WebGL context) over the chip's sphere
 * poster. Nothing here waits for the browser to be idle (the agent's bar
 * types all the time, so it may never be) or for a first touch: on desktop
 * the scene starts loading as soon as this mounts; on phones, as soon as the
 * page has loaded (three.js is a large script: the content goes first). Until
 * it draws, nothing reacts to the pointer, so sooner is better. The scene's
 * first frame is the poster, so the swap is invisible, and it sets itself up
 * in small steps, so no tap or keystroke waits long for it.
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
    const mq = matchMedia(DESKTOP_QUERY);
    let cancelled = false;
    let run = 0;
    let layer: HTMLCanvasElement | null = null;
    const pending: (() => void)[] = [];
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
      if (mq.matches || document.readyState === "complete") start();
      else {
        window.addEventListener("load", start, { once: true });
        pending.push(() => window.removeEventListener("load", start));
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
