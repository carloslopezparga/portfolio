"use client";

import { useEffect, useRef, useState } from "react";
import { brownianBridges, smoothPath } from "@/lib/timeline";
import { getPrefs } from "@/lib/prefs";

const W = 600;
const H = 150;
const PAD = 16;
const MID = H / 2;
const STEPS = 14;
const PER_BATCH = 14;
const EVERY = 4000; // a new batch every 4 s
const DRAW = 1500; // each batch draws itself in 1.5 s
const LIFE = 3; // batches on screen (the older ones fade)
const COLORS = ["#0a84ff", "#bf5af2", "#ff375f"];

type Pt = [number, number];
const toPts = (b: number[]): Pt[] => b.map((v, i) => [PAD + ((W - PAD * 2) * i) / (b.length - 1), MID + v * H * 0.36]);
const batch = (seed: number) => brownianBridges(PER_BATCH, STEPS, seed).map(toPts);

/** Point at fraction t along a polyline (by index; the steps are evenly spaced in x). */
function at(p: Pt[], t: number): Pt {
  const f = t * (p.length - 1);
  const i = Math.min(p.length - 2, Math.floor(f));
  const k = f - i;
  return [p[i][0] + (p[i + 1][0] - p[i][0]) * k, p[i][1] + (p[i + 1][1] - p[i][1]) * k];
}

/** Quadratic smoothing through midpoints, up to fraction t of the path. */
function trace(ctx: CanvasRenderingContext2D, p: Pt[], t: number) {
  const n = Math.max(1, Math.floor(t * (p.length - 1)));
  ctx.beginPath();
  ctx.moveTo(p[0][0], p[0][1]);
  for (let i = 1; i < n; i++) ctx.quadraticCurveTo(p[i][0], p[i][1], (p[i][0] + p[i + 1][0]) / 2, (p[i][1] + p[i + 1][1]) / 2);
  const end = at(p, t);
  ctx.lineTo(end[0], end[1]);
  ctx.stroke();
}

/**
 * The end of the education timeline: many possible paths from now to one
 * destination. Every ~4 s a new batch of trajectories (Brownian bridges)
 * draws itself in the Apple Intelligence gradient while the previous ones
 * fade; a dot always travels one of them. Paused off screen. Without
 * JavaScript or with reduced motion: a still frame with one batch.
 */
export function MonteCarlo({ from, to }: { from: string; to: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);
  const still = batch(23).map((p) => smoothPath(p));

  useEffect(() => {
    if (getPrefs().reduced) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let scale = 1;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      scale = w / W;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(H * scale * dpr);
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const grad = ctx.createLinearGradient(PAD, 0, W - PAD, 0);
    COLORS.forEach((c, i) => grad.addColorStop(i / (COLORS.length - 1), c));

    let seed = 101;
    const batches: { paths: Pt[][]; born: number }[] = [];
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    let raf = 0;
    let clock = 0; // only advances while visible
    let last = performance.now();
    let nextAt = 0;
    let started = false;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = now - last;
      last = now;
      if (!visible || document.hidden) return;
      clock += Math.min(dt, 64);
      if (clock >= nextAt) {
        batches.push({ paths: batch((seed = (seed * 48271) % 2147483647)), born: clock });
        if (batches.length > LIFE) batches.shift();
        nextAt = clock + EVERY;
        if (!started) {
          started = true;
          setLive(true);
        }
      }
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1.1;
      ctx.lineCap = "round";
      ctx.strokeStyle = grad;
      batches.forEach((b, bi) => {
        const age = clock - b.born;
        const newest = bi === batches.length - 1;
        ctx.globalAlpha = newest ? 0.55 : 0.55 * Math.max(0, 1 - (age - EVERY) / (EVERY * (LIFE - 1)));
        const t = Math.min(1, age / DRAW);
        const eased = 1 - Math.pow(1 - t, 3);
        b.paths.forEach((p, i) => trace(ctx, p, Math.min(1, eased * (1 + (i % 4) * 0.04))));
      });
      // the travelling dot, on the newest batch
      const cur = batches[batches.length - 1];
      if (cur) {
        const t = ((clock - cur.born) % EVERY) / EVERY;
        const [x, y] = at(cur.paths[0], t);
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#bf5af2";
        ctx.shadowColor = "rgba(191, 90, 242, 0.8)";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(x, y, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" aria-hidden>
        <defs>
          <linearGradient id="mc-grad" x1="0" x2="1" y1="0" y2="0">
            {COLORS.map((c, i) => (
              <stop key={c} offset={i / (COLORS.length - 1)} stopColor={c} />
            ))}
          </linearGradient>
        </defs>
        <g style={{ opacity: live ? 0 : 1, transition: "opacity 600ms" }}>
          {still.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="url(#mc-grad)" strokeWidth="1.1" strokeOpacity="0.5" />
          ))}
        </g>
        <circle cx={PAD} cy={MID} r="4" className="fill-[var(--subtle)]" />
        <circle cx={W - PAD} cy={MID} r="5.5" fill="#ff375f" style={{ filter: "drop-shadow(0 0 6px #ff375f)" }} />
      </svg>
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-x-0 top-0 w-full" style={{ aspectRatio: `${W} / ${H}` }} aria-hidden />
      {/* HTML labels: they keep their size on phones, where the drawing shrinks */}
      <div className="mt-2 flex items-start justify-between gap-4 text-[13px] font-semibold leading-snug">
        <span className="text-muted">{from}</span>
        <span className="text-right text-fg">{to}</span>
      </div>
    </div>
  );
}
