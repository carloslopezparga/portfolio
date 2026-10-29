"use client";

import { animate, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { DUR, EASE } from "@/lib/motion";

/**
 * Engineering dimension line ("cota"). It measures its own live width and
 * extends from the centre outward when it enters the viewport.
 */
export function DimensionLine({ className, label, unit = "px" }: { className?: string; label?: string; unit?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const [width, setWidth] = useState(0);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current!;
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || !width || label || !numRef.current) return;
    if (counted.current) {
      numRef.current.textContent = width.toLocaleString("en-US");
      return;
    }
    counted.current = true;
    const ctrl = animate(0, width, {
      duration: DUR.slow,
      ease: EASE.out,
      onUpdate: (v) => {
        if (numRef.current) numRef.current.textContent = Math.round(v).toLocaleString("en-US");
      },
    });
    return () => ctrl.stop();
  }, [inView, width, label]);

  return (
    <div ref={ref} className={`relative flex h-5 items-center ${className ?? ""}`} aria-hidden>
      <motion.span
        className="absolute left-0 top-0 h-full w-px bg-[var(--line-strong)]"
        initial={{ opacity: 0, scaleY: 0 }}
        animate={inView ? { opacity: 1, scaleY: 1 } : undefined}
        transition={{ duration: DUR.base, ease: EASE.out }}
      />
      <motion.span
        className="absolute right-0 top-0 h-full w-px bg-[var(--line-strong)]"
        initial={{ opacity: 0, scaleY: 0 }}
        animate={inView ? { opacity: 1, scaleY: 1 } : undefined}
        transition={{ duration: DUR.base, ease: EASE.out }}
      />
      <motion.span
        className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center text-subtle"
        initial={{ clipPath: "inset(0 50% 0 50%)" }}
        animate={inView ? { clipPath: "inset(0 0% 0 0%)" } : undefined}
        transition={{ duration: DUR.slow, ease: EASE.out, delay: 0.1 }}
      >
        <svg viewBox="0 0 8 8" className="size-2 shrink-0" fill="currentColor">
          <path d="M0 4 8 0v8z" />
        </svg>
        <span className="h-px flex-1 bg-current" />
        <svg viewBox="0 0 8 8" className="size-2 shrink-0" fill="currentColor">
          <path d="M8 4 0 0v8z" />
        </svg>
      </motion.span>
      <motion.span
        className="mono-label relative mx-auto bg-bg px-2 tabular"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : undefined}
        transition={{ duration: DUR.base, delay: 0.2 }}
      >
        {label ?? (
          <>
            <span ref={numRef}>0</span> {unit}
          </>
        )}
      </motion.span>
    </div>
  );
}
