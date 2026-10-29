"use client";

import { useEffect, useRef } from "react";
import { damp } from "@/lib/motion";
import { gyro, pointer } from "@/lib/pointer";
import { usePrefs } from "@/lib/prefs";

type Star = {
  x: number;
  y: number;
  r: number;
  a: number;
  tw: number;
  ph: number;
  layer: 0 | 1 | 2;
  ice: boolean;
  delay: number;
};

/** depth: pointer/gyro parallax strength · scroll: fraction of scroll speed */
const LAYERS = [
  { density: 0.00016, rMin: 0.35, rMax: 0.8, aMin: 0.25, aMax: 0.55, depth: 0.2, scroll: 0.025 },
  { density: 0.00005, rMin: 0.6, rMax: 1.2, aMin: 0.4, aMax: 0.8, depth: 0.5, scroll: 0.07 },
  { density: 0.000014, rMin: 1.0, rMax: 1.8, aMin: 0.6, aMax: 1, depth: 1, scroll: 0.16 },
] as const;

const MARGIN = 60;

function rgb(name: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || "225 233 255";
}

function makeSprite(color: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 32;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, `rgb(${color} / 1)`);
  grad.addColorStop(0.18, `rgb(${color} / 0.85)`);
  grad.addColorStop(0.45, `rgb(${color} / 0.18)`);
  grad.addColorStop(1, `rgb(${color} / 0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 32, 32);
  return c;
}

/**
 * Fixed backdrop: nebula glows, a three-layer starfield (canvas) with
 * pointer / gyro / scroll parallax, and a static blueprint grid.
 * One rAF loop; paused when the tab is hidden.
 */
export function Backdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { reduced, touch } = usePrefs();

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    let W = 0;
    let H = 0;
    let dpr = 1;
    let stars: Star[] = [];
    let starColor = rgb("--star");
    let iceColor = rgb("--ice-rgb");
    let sprite = makeSprite(starColor);
    let iceSprite = makeSprite(iceColor);
    let light = document.documentElement.dataset.theme === "light";
    let introStart = document.documentElement.dataset.intro ? performance.now() : -1;
    const off = { x: 0, y: 0 };
    let raf = 0;
    let last = performance.now();
    let lastDraw = 0;
    let started = false;

    const seed = () => {
      stars = [];
      const area = (W + MARGIN * 2) * (H + MARGIN * 2);
      const boost = touch ? 1.25 : 1;
      LAYERS.forEach((L, layer) => {
        const n = Math.round(area * L.density * boost);
        for (let i = 0; i < n; i++) {
          stars.push({
            x: Math.random() * (W + MARGIN * 2) - MARGIN,
            y: Math.random() * (H + MARGIN * 2) - MARGIN,
            r: L.rMin + Math.random() * (L.rMax - L.rMin),
            a: L.aMin + Math.random() * (L.aMax - L.aMin),
            tw: 0.6 + Math.random() * 1.8,
            ph: Math.random() * Math.PI * 2,
            layer: layer as 0 | 1 | 2,
            ice: Math.random() < 0.22,
            delay: Math.random() * 0.55,
          });
        }
      });
    };

    const resize = () => {
      const w = window.innerWidth;
      const h = Math.max(window.innerHeight, document.documentElement.clientHeight);
      // Ignore mobile URL-bar height jitter.
      if (w === W && Math.abs(h - H) < 120 && stars.length) return;
      W = w;
      H = h;
      dpr = Math.min(window.devicePixelRatio || 1, touch ? 1.5 : 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      seed();
      if (reduced) draw(performance.now());
    };

    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const t = now / 1000;
      const scrollY = reduced ? 0 : window.scrollY;
      const intro = introStart < 0 ? -1 : (now - introStart) / 1000;
      const fieldW = W + MARGIN * 2;
      const fieldH = H + MARGIN * 2;
      const lightK = light ? 0.55 : 1;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const L = LAYERS[s.layer];
        let x = s.x + off.x * L.depth * 24;
        let y = s.y + off.y * L.depth * 16 - scrollY * L.scroll;
        x = ((((x + MARGIN) % fieldW) + fieldW) % fieldW) - MARGIN;
        y = ((((y + MARGIN) % fieldH) + fieldH) % fieldH) - MARGIN;

        let a = s.a * lightK;
        if (!reduced && s.layer > 0) a *= 0.72 + 0.28 * Math.sin(t * s.tw + s.ph);
        if (intro >= 0) a *= Math.min(1, Math.max(0, (intro - s.delay) / 0.3));
        if (a <= 0.01) continue;

        ctx.globalAlpha = a;
        if (s.layer === 2 && !light) {
          const size = s.r * 7;
          ctx.drawImage(s.ice ? iceSprite : sprite, x - size / 2, y - size / 2, size, size);
        } else {
          ctx.fillStyle = `rgb(${s.ice ? iceColor : starColor})`;
          const d = s.r * 1.6;
          ctx.fillRect(x - d / 2, y - d / 2, d, d);
        }
      }
      ctx.globalAlpha = 1;
      if (intro > 1.2) introStart = -1;
    };

    const loop = (now: number) => {
      // phones: ~30 fps is plenty for slow stars and halves the main-thread cost
      if (touch && now - lastDraw < 30) {
        raf = requestAnimationFrame(loop);
        return;
      }
      lastDraw = now;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const tx = touch ? (gyro.active ? -gyro.gx : 0) : pointer.inside ? -pointer.nx : 0;
      const ty = touch ? (gyro.active ? -gyro.gy : 0) : pointer.inside ? -pointer.ny : 0;
      const k = damp(3.2, dt);
      off.x += (tx - off.x) * k;
      off.y += (ty - off.y) * k;
      draw(now);
      raf = requestAnimationFrame(loop);
    };

    const startLoop = () => {
      cancelAnimationFrame(raf);
      if (reduced) {
        draw(performance.now());
        return;
      }
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };

    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (started) startLoop();
    };
    const onTheme = () => {
      light = document.documentElement.dataset.theme === "light";
      starColor = rgb("--star");
      iceColor = rgb("--ice-rgb");
      sprite = makeSprite(starColor);
      iceSprite = makeSprite(iceColor);
      if (reduced) draw(performance.now());
    };
    const onReplay = () => {
      introStart = performance.now();
    };
    const mo = new MutationObserver(onTheme);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    // Stars start once the page is idle, so they never compete with hydration;
    // on a first visit the intro fade-in runs from that moment.
    const begin = () => {
      started = true;
      if (introStart >= 0) introStart = performance.now();
      resize();
      startLoop();
    };
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    const idleId = w.requestIdleCallback ? w.requestIdleCallback(begin, { timeout: 1200 }) : window.setTimeout(begin, 300);
    const onResize = () => started && resize();
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("intro:replay", onReplay);
    return () => {
      if (w.cancelIdleCallback) w.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
      cancelAnimationFrame(raf);
      mo.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("intro:replay", onReplay);
    };
  }, [reduced, touch]);

  return (
    <div aria-hidden>
      <div className="nebula" />
      <canvas ref={canvasRef} className="starfield pointer-events-none fixed left-0 top-0 -z-[2]" />
      <div className="bp-grid bp-grid--h" />
      <div className="bp-grid bp-grid--v" />
    </div>
  );
}
