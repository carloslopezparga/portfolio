"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { SPRING } from "@/lib/motion";
import { usePrefs } from "@/lib/prefs";

/**
 * Pulls its child toward the pointer with a spring; the inner layer travels a
 * bit further for depth. Touch: a press-scale instead. No animation library,
 * so above-the-fold CTAs stay cheap to hydrate.
 */
export function Magnetic({ children, strength = 0.32, className }: { children: ReactNode; strength?: number; className?: string }) {
  const outer = useRef<HTMLSpanElement>(null);
  const inner = useRef<HTMLSpanElement>(null);
  const { reduced, touch } = usePrefs();

  useEffect(() => {
    const el = outer.current!;
    const inn = inner.current!;
    if (reduced || touch) {
      el.style.transform = "";
      inn.style.transform = "";
      return;
    }
    const { stiffness: k, damping: c, mass: m } = SPRING.magnetic;
    const s = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 };
    let raf = 0;
    let last = 0;
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.032);
      last = now;
      s.vx += ((-k * (s.x - s.tx) - c * s.vx) / m) * dt;
      s.vy += ((-k * (s.y - s.ty) - c * s.vy) / m) * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      el.style.transform = `translate3d(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px, 0)`;
      inn.style.transform = `translate3d(${(s.x * 0.45).toFixed(2)}px, ${(s.y * 0.45).toFixed(2)}px, 0)`;
      const settled = Math.abs(s.x - s.tx) < 0.05 && Math.abs(s.y - s.ty) < 0.05 && Math.abs(s.vx) < 0.05 && Math.abs(s.vy) < 0.05;
      raf = settled ? 0 : requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      s.tx = (e.clientX - (r.left - s.x + r.width / 2)) * strength;
      s.ty = (e.clientY - (r.top - s.y + r.height / 2)) * strength;
      kick();
    };
    const onLeave = () => {
      s.tx = 0;
      s.ty = 0;
      kick();
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced, touch, strength]);

  return (
    <span ref={outer} className={`magnetic inline-flex will-change-transform ${className ?? ""}`}>
      <span ref={inner} className="inline-flex">
        {children}
      </span>
    </span>
  );
}
