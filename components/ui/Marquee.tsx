"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { damp } from "@/lib/motion";
import { usePrefs } from "@/lib/prefs";

/**
 * Infinite row that eases to a crawl under the cursor (fine pointer) and can
 * be held / dragged with a finger (touch). Reduced motion: a static,
 * horizontally scrollable row.
 */
export function Marquee({ children, speed = 40, className }: { children: ReactNode; speed?: number; className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { reduced, touch } = usePrefs();

  useEffect(() => {
    if (reduced) return;
    const root = rootRef.current!;
    const track = trackRef.current!;
    let x = 0;
    let v = 1;
    let target = 1;
    let half = track.scrollWidth / 2;
    let raf = 0;
    let last = performance.now();
    let visible = false;
    let dragging = false;
    let dragX = 0;

    const ro = new ResizeObserver(() => (half = track.scrollWidth / 2));
    ro.observe(track);

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      v += (target - v) * damp(dragging ? 20 : 3.5, dt);
      if (!dragging) x -= speed * v * dt;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      track.style.transform = `translate3d(${x}px,0,0)`;
      if (visible) raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(root);

    const slow = () => (target = 0.08);
    const resume = () => (target = 1);
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      dragging = true;
      dragX = e.clientX;
      target = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      x += e.clientX - dragX;
      dragX = e.clientX;
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      target = 1;
    };
    if (!touch) {
      root.addEventListener("pointerenter", slow);
      root.addEventListener("pointerleave", resume);
    } else {
      root.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    }
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      root.removeEventListener("pointerenter", slow);
      root.removeEventListener("pointerleave", resume);
      root.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      track.style.transform = "";
    };
  }, [reduced, touch, speed]);

  if (reduced) {
    return (
      <div className={`overflow-x-auto ${className ?? ""}`} data-lenis-prevent>
        <div className="flex w-max gap-3">{children}</div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className={`marquee-mask overflow-hidden touch-pan-y ${className ?? ""}`}>
      <div ref={trackRef} className="flex w-max gap-3 will-change-transform">
        <div className="flex gap-3">{children}</div>
        <div className="flex gap-3" aria-hidden inert>
          {children}
        </div>
      </div>
    </div>
  );
}
