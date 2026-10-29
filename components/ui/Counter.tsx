"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef } from "react";
import { EASE } from "@/lib/motion";
import { getPrefs } from "@/lib/prefs";

/** Counts up once in view. The final value reserves the width: no layout shift. */
export function Counter({ value, decimals = 0, suffix = "", prefix = "", className }: { value: number; decimals?: number; suffix?: string; prefix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const fmt = (v: number) => v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  useEffect(() => {
    if (!inView) return;
    if (getPrefs().reduced) {
      numRef.current!.textContent = fmt(value);
      return;
    }
    const ctrl = animate(0, value, {
      duration: 1.8,
      ease: EASE.out,
      onUpdate: (v) => {
        if (numRef.current) numRef.current.textContent = fmt(v);
      },
    });
    return () => ctrl.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value, decimals]);

  return (
    <span ref={ref} className={`relative inline-grid tabular ${className ?? ""}`}>
      <span className="invisible col-start-1 row-start-1" aria-hidden>
        {prefix}
        {fmt(value)}
        {suffix}
      </span>
      <span className="col-start-1 row-start-1" aria-hidden>
        {prefix}
        <span ref={numRef}>{fmt(0)}</span>
        {suffix}
      </span>
      <span className="sr-only">
        {prefix}
        {fmt(value)}
        {suffix}
      </span>
    </span>
  );
}
