"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Starts the CSS reveal of any .hero-copy inside once it scrolls into view. */
export function PlayOnView({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.querySelectorAll("[data-play]").forEach((n) => n.setAttribute("data-play", "true"));
        io.disconnect();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref}>{children}</div>;
}
