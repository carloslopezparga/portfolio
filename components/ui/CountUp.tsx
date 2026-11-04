"use client";

import { useEffect, useRef } from "react";
import type { Locale } from "@/content/types";
import { formatNumber } from "@/lib/metrics";
import { getPrefs } from "@/lib/prefs";

/** Long enough to read as a count, short enough to never leave a figure half-way. */
const DURATION = 900;

/**
 * A figure that counts up from 0 when it comes into view. The server renders
 * the final value (readable without JavaScript), and the final value is
 * guaranteed: if the count can't run (already on screen, a jump past it, a
 * tab in the background, reduced motion), it shows the end figure at once,
 * and a timer sets it no later than the count would have.
 */
export function CountUp({ value, prefix = "", suffix = "", lang, className }: { value: number; prefix?: string; suffix?: string; lang: Locale; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const text = (v: number) => `${prefix}${formatNumber(v, lang)}${suffix}`;
    const end = () => {
      el.textContent = text(value);
    };
    if (getPrefs().reduced || document.hidden) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return; // already visible: no flash to 0
    el.textContent = text(0);
    let raf = 0;
    let done = 0;
    const finish = () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(done);
      end();
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        if (document.hidden) return finish();
        const t0 = performance.now();
        const step = (t: number) => {
          const p = Math.min(1, (t - t0) / DURATION);
          el.textContent = text(value * (1 - Math.pow(1 - p, 3)));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        // rAF stops in background tabs: the timer makes sure the figure lands.
        done = window.setTimeout(finish, DURATION + 60);
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    const onHide = () => document.hidden && finish();
    document.addEventListener("visibilitychange", onHide);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onHide);
      finish();
    };
  }, [value, prefix, suffix, lang]);

  return (
    <span ref={ref} className={`tabular ${className ?? ""}`}>
      {`${prefix}${formatNumber(value, lang)}${suffix}`}
    </span>
  );
}
