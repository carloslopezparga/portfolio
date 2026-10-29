"use client";

import { motion, useSpring } from "motion/react";
import { useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";
import { registerFxCard } from "@/lib/fxcards";
import { SPRING } from "@/lib/motion";
import { usePrefs } from "@/lib/prefs";

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  children: ReactNode;
  /** Max tilt in degrees. */
  max?: number;
  contentClassName?: string;
}

/**
 * Card with 3D tilt, interior spotlight and a border that lights up at the
 * point nearest the cursor. Touch: gyro / scroll tilt, scan-line spotlight
 * and a ripple on tap.
 */
export function TiltCard({ children, max = 6, className, contentClassName, ...rest }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced, touch } = usePrefs();
  const rx = useSpring(0, SPRING.tilt);
  const ry = useSpring(0, SPRING.tilt);

  useEffect(() => {
    if (reduced) return;
    return registerFxCard(ref.current!, {
      touch,
      onTilt: touch
        ? (x, y) => {
            rx.set(x);
            ry.set(y);
          }
        : undefined,
    });
  }, [reduced, touch, rx, ry]);

  return (
    <motion.div
      ref={ref}
      {...rest}
      className={`fx-card ${className ?? ""}`}
      style={reduced ? undefined : { rotateX: rx, rotateY: ry, transformPerspective: 1100 }}
      whileTap={touch && !reduced ? { scale: 0.985 } : undefined}
      onPointerMove={(e) => {
        if (reduced || e.pointerType !== "mouse") return;
        const el = ref.current!;
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        el.style.setProperty("--mx", `${x}px`);
        el.style.setProperty("--my", `${y}px`);
        el.style.setProperty("--spot", "1");
        rx.set(-(y / r.height - 0.5) * 2 * max);
        ry.set((x / r.width - 0.5) * 2 * max);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        ref.current!.style.setProperty("--spot", "0");
        rx.set(0);
        ry.set(0);
      }}
      onPointerDown={(e) => {
        if (reduced || e.pointerType === "mouse") return;
        const el = ref.current!;
        const r = el.getBoundingClientRect();
        const dot = document.createElement("span");
        dot.className = "fx-ripple";
        dot.style.left = `${e.clientX - r.left}px`;
        dot.style.top = `${e.clientY - r.top}px`;
        el.appendChild(dot);
        dot.addEventListener("animationend", () => dot.remove(), { once: true });
      }}
    >
      <span className="fx-bloom" aria-hidden />
      <div className={`fx-content ${contentClassName ?? ""}`}>{children}</div>
    </motion.div>
  );
}
