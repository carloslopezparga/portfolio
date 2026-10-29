"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Dimension line ("cota") that reads its own live width and extends from the
 * centre when it enters the viewport. CSS-only animation, no library.
 */
export function Cota({ className, label }: { className?: string; label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current!;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className={`cota relative flex h-5 items-center ${on ? "is-on" : ""} ${className ?? ""}`} aria-hidden>
      <span className="cota-tick left-0" />
      <span className="cota-tick right-0" />
      <span className="cota-line absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center text-subtle">
        <svg viewBox="0 0 8 8" className="size-2 shrink-0" fill="currentColor">
          <path d="M0 4 8 0v8z" />
        </svg>
        <span className="h-px flex-1 bg-current" />
        <svg viewBox="0 0 8 8" className="size-2 shrink-0" fill="currentColor">
          <path d="M8 4 0 0v8z" />
        </svg>
      </span>
      <span className="mono-label tabular relative mx-auto bg-bg px-2">{label ?? (w ? `${w.toLocaleString("en-US")} px` : "")}</span>
    </div>
  );
}
