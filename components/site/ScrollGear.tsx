"use client";

import { useEffect, useRef } from "react";
import { toothPath } from "@/lib/gears";

const PATH = toothPath(12, 1, 9.2, 12, 12);

/** A small gear that turns with page scroll: two full turns from top to bottom. */
export function ScrollGear({ className }: { className?: string }) {
  const ref = useRef<SVGGElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      ref.current?.setAttribute("transform", `rotate(${(p * 720).toFixed(1)} 12 12)`);
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
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden>
      <g ref={ref}>
        <path d={PATH} strokeLinejoin="round" />
        <circle cx="12" cy="12" r="2.6" />
        <path d="M12 9.4V5.5" />
      </g>
    </svg>
  );
}
