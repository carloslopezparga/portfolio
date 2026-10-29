"use client";

import { useEffect, useRef } from "react";
import { damp } from "@/lib/motion";
import { pointer } from "@/lib/pointer";
import { usePrefs } from "@/lib/prefs";

type Mode = "idle" | "hover" | "label" | "text";

const INTERACTIVE = 'a, button, [role="button"], label, summary, select, [data-cursor-hover]';
const TEXT = 'input, textarea, [contenteditable="true"]';

/**
 * Dot + ring (mix-blend difference). Over interactive elements the ring grows;
 * over elements with data-cursor="Label" it morphs into a labelled pill.
 * Disabled on touch and with reduced motion (native cursor stays).
 */
export function Cursor() {
  const { reduced, touch } = usePrefs();
  const enabled = !reduced && !touch;
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const labelTextRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current!;
    const ring = ringRef.current!;
    const label = labelRef.current!;
    const labelText = labelTextRef.current!;
    const html = document.documentElement;
    html.dataset.customCursor = "";

    let mode: Mode = "idle";
    let rx = pointer.x;
    let ry = pointer.y;
    const s = { ring: 1, dot: 1, label: 0, alpha: 0 };
    let last = performance.now();
    let raf = 0;

    const onOver = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (!t || !t.closest) return;
      if (t.closest(TEXT)) {
        mode = "text";
        return;
      }
      const labelled = t.closest<HTMLElement>("[data-cursor]");
      if (labelled?.dataset.cursor) {
        if (labelText.textContent !== labelled.dataset.cursor) labelText.textContent = labelled.dataset.cursor;
        mode = "label";
        return;
      }
      mode = t.closest(INTERACTIVE) ? "hover" : "idle";
    };
    document.addEventListener("pointerover", onOver, { passive: true });

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (rx < -1000) {
        rx = pointer.x;
        ry = pointer.y;
      }
      const follow = damp(mode === "label" ? 16 : 20, dt);
      rx += (pointer.x - rx) * follow;
      ry += (pointer.y - ry) * follow;

      const press = pointer.down ? 0.82 : 1;
      const target =
        mode === "hover"
          ? { ring: 1.75 * press, dot: 0.35, label: 0 }
          : mode === "label"
            ? { ring: 2.4, dot: 0, label: press }
            : mode === "text"
              ? { ring: 0.4, dot: 0, label: 0 }
              : { ring: press, dot: 1, label: 0 };
      const k = damp(16, dt);
      s.ring += (target.ring - s.ring) * k;
      s.dot += (target.dot - s.dot) * k;
      s.label += (target.label - s.label) * damp(mode === "label" ? 18 : 24, dt);
      s.alpha += ((pointer.inside && pointer.moved ? 1 : 0) - s.alpha) * damp(12, dt);

      dot.style.transform = `translate3d(${pointer.x}px,${pointer.y}px,0) scale(${s.dot})`;
      dot.style.opacity = String(s.alpha);
      ring.style.transform = `translate3d(${rx}px,${ry}px,0) scale(${s.ring})`;
      ring.style.opacity = String(s.alpha * (mode === "label" ? Math.max(0, 1 - s.label * 1.6) : mode === "text" ? 0 : 1));
      label.style.transform = `translate3d(${rx}px,${ry}px,0) scale(${s.label})`;
      label.style.opacity = String(s.alpha * Math.min(1, s.label * 1.4));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointerover", onOver);
      delete html.dataset.customCursor;
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <div ref={ringRef} className="cursor-el cursor-ring" style={{ opacity: 0 }} aria-hidden />
      <div ref={dotRef} className="cursor-el cursor-dot" style={{ opacity: 0 }} aria-hidden />
      <div ref={labelRef} className="cursor-el" style={{ width: 0, height: 0, opacity: 0 }} aria-hidden>
        <span ref={labelTextRef} className="cursor-label absolute left-0 top-0" />
      </div>
    </>
  );
}
