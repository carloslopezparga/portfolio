"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/lib/theme";

/**
 * Dark theme only: a very subtle, still starfield drawn once per resize.
 * The light theme has no backdrop at all.
 */
export function Backdrop() {
  const ref = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();

  useEffect(() => {
    if (theme !== "dark") return;
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      // Deterministic, so a resize doesn't reshuffle the sky.
      let seed = 7;
      const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      const n = Math.round((w * h) / 5200);
      for (let i = 0; i < n; i++) {
        const r = rand() < 0.92 ? 0.5 + rand() * 0.5 : 1 + rand() * 0.6;
        ctx.fillStyle = `rgba(255,255,255,${0.15 + rand() * 0.45})`;
        ctx.beginPath();
        ctx.arc(rand() * w, rand() * h, r, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    draw();
    let t = 0;
    const onResize = () => {
      clearTimeout(t);
      t = window.setTimeout(draw, 150);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, [theme]);

  if (theme !== "dark") return null;
  return <canvas ref={ref} className="starfield" aria-hidden />;
}
