"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useIsTouch } from "@/lib/prefs";

/**
 * Grayscale → colour (+ slight zoom) on hover. On touch there is no hover, so
 * the element turns colour while it crosses the middle band of the viewport.
 */
export function Tone({ children, className, as: Tag = "div" }: { children: ReactNode; className?: string; as?: "div" | "span" }) {
  const ref = useRef<HTMLDivElement>(null);
  const touch = useIsTouch();

  useEffect(() => {
    const el = ref.current!;
    if (!touch) {
      el.removeAttribute("data-active");
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? el.setAttribute("data-active", "") : el.removeAttribute("data-active")),
      { rootMargin: "-38% 0px -38% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [touch]);

  return (
    <Tag ref={ref} className={`img-tone ${className ?? ""}`}>
      {children}
    </Tag>
  );
}
