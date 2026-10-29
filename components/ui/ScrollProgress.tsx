"use client";

import { useEffect, useRef } from "react";
import { damp } from "@/lib/motion";

/** Hairline at the very top of the viewport. Pure transform, no layout, no library. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current!;
    let shown = 0;
    let raf = 0;
    let last = performance.now();
    const target = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = target();
      shown += (t - shown) * damp(14, dt);
      el.style.transform = `scaleX(${shown.toFixed(4)})`;
      raf = Math.abs(t - shown) > 0.0005 ? requestAnimationFrame(frame) : 0;
    };
    const kick = () => {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    kick();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="fixed inset-x-0 top-0 z-[150] h-px origin-left scale-x-0 bg-accent"
      style={{ boxShadow: "0 0 10px rgb(var(--glow) / 0.8)" }}
    />
  );
}
