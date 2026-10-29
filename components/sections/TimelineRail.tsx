"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { getPrefs } from "@/lib/prefs";

/**
 * Vertical timeline: the line draws itself as the section scrolls past the
 * reading line (62 % of the viewport) and each milestone lights up in its
 * colour when the line reaches it. Reduced motion: drawn from the start.
 */
export function TimelineRail({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const markers = Array.from(el.querySelectorAll<HTMLElement>("[data-tl-marker]"));
    if (getPrefs().reduced) {
      el.style.setProperty("--tl", "1");
      markers.forEach((m) => (m.dataset.on = ""));
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const reach = window.innerHeight * 0.62 - r.top;
      el.style.setProperty("--tl", Math.min(1, Math.max(0, reach / r.height)).toFixed(4));
      markers.forEach((m) => {
        const y = m.getBoundingClientRect().top - r.top + 6;
        if (y <= reach) m.dataset.on = "";
        else delete m.dataset.on;
      });
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, []);

  return (
    <div ref={ref} className={`tl ${className ?? ""}`}>
      {children}
    </div>
  );
}
