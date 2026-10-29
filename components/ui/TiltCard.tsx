"use client";

import { useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";
import { registerFxCard } from "@/lib/fxcards";
import { SPRING } from "@/lib/motion";
import { usePrefs } from "@/lib/prefs";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Max tilt in degrees. */
  max?: number;
  contentClassName?: string;
}

/**
 * Card with 3D tilt, interior spotlight and a border that lights up at the
 * point nearest the cursor. Touch: gyro / scroll tilt, scan-line spotlight
 * and a ripple on tap. The tilt is a small hand-rolled spring (no animation
 * library), so the projects panel stays cheap to hydrate.
 */
export function TiltCard({ children, max = 6, className, contentClassName, ...rest }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced, touch } = usePrefs();

  useEffect(() => {
    const el = ref.current!;
    if (reduced) {
      el.style.transform = "";
      return;
    }
    const { stiffness: k, damping: c, mass: m } = SPRING.tilt;
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
      el.style.transform = `perspective(1100px) rotateX(${s.x.toFixed(3)}deg) rotateY(${s.y.toFixed(3)}deg)`;
      const settled = Math.abs(s.x - s.tx) < 0.01 && Math.abs(s.y - s.ty) < 0.01 && Math.abs(s.vx) < 0.01 && Math.abs(s.vy) < 0.01;
      raf = settled ? 0 : requestAnimationFrame(frame);
    };
    const tilt = (x: number, y: number) => {
      s.tx = x;
      s.ty = y;
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
      el.style.setProperty("--spot", "1");
      tilt(-(y / r.height - 0.5) * 2 * max, (x / r.width - 0.5) * 2 * max);
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      el.style.setProperty("--spot", "0");
      tilt(0, 0);
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      const r = el.getBoundingClientRect();
      const dot = document.createElement("span");
      dot.className = "fx-ripple";
      dot.style.left = `${e.clientX - r.left}px`;
      dot.style.top = `${e.clientY - r.top}px`;
      el.appendChild(dot);
      dot.addEventListener("animationend", () => dot.remove(), { once: true });
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerdown", onDown);
    const off = registerFxCard(el, { touch, onTilt: touch ? tilt : undefined });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerdown", onDown);
      off();
    };
  }, [reduced, touch, max]);

  return (
    <div ref={ref} {...rest} className={`fx-card ${className ?? ""}`}>
      <span className="fx-bloom" aria-hidden />
      <div className={`fx-content ${contentClassName ?? ""}`}>{children}</div>
    </div>
  );
}
