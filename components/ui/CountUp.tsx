"use client";

import { useEffect, useRef } from "react";
import type { Locale } from "@/content/types";
import { formatNumber } from "@/lib/metrics";
import { getPrefs } from "@/lib/prefs";

/**
 * A figure that counts up from 0 when it comes into view. The server renders
 * the final value (readable without JavaScript); the count only plays once.
 */
export function CountUp({ value, prefix = "", suffix = "", lang, className, duration = 1400 }: { value: number; prefix?: string; suffix?: string; lang: Locale; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const text = (v: number) => `${prefix}${formatNumber(v, lang)}${suffix}`;
    if (getPrefs().reduced) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return; // already visible: no flash to 0
    el.textContent = text(0);
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const step = (t: number) => {
          const p = Math.min(1, (t - t0) / duration);
          el.textContent = text(value * (1 - Math.pow(1 - p, 3)));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.textContent = text(value);
    };
  }, [value, prefix, suffix, lang, duration]);

  return (
    <span ref={ref} className={`tabular ${className ?? ""}`}>
      {`${prefix}${formatNumber(value, lang)}${suffix}`}
    </span>
  );
}
