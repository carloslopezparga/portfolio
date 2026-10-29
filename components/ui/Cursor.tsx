"use client";

import { useEffect, useRef } from "react";
import { usePrefs } from "@/lib/prefs";

const INTERACTIVE = 'a, button, [role="button"], [role="tab"], summary, select, [data-cursor-morph]';
const TEXT = 'input:not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]';
const DOT = 10;
/** Elements larger than this keep the dot (a highlight that big reads as a flash). */
const MAX_MORPH = { w: 520, h: 220 };

/**
 * iPadOS-style pointer. A dot that tracks the mouse with zero lag (positioned
 * inside the pointermove handler, no smoothing). Over an interactive element
 * it becomes that element's highlighted background — same box, same radius —
 * in 150 ms. Demos and images can show a short label via data-cursor="…".
 * Touch devices and reduced motion keep the native cursor.
 */
export function Cursor() {
  const { reduced, touch } = usePrefs();
  const enabled = !reduced && !touch;
  const ref = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current!;
    const label = labelRef.current!;
    const html = document.documentElement;
    html.dataset.customCursor = "";

    let x = -100;
    let y = -100;
    let mode: "free" | "morph" | "text" | "label" = "free";
    let target: HTMLElement | null = null;
    let labelW = 0;

    const setBox = (w: number, h: number, r: number, tx: number, ty: number) => {
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
      el.style.borderRadius = `${r}px`;
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    };

    const place = () => {
      if (mode === "morph" && target) {
        const r = target.getBoundingClientRect();
        const pad = Number(target.dataset.cursorPad ?? 6);
        const w = r.width + pad * 2;
        const h = r.height + pad * 2;
        const cs = getComputedStyle(target);
        const base = parseFloat(cs.borderTopLeftRadius) || 10;
        const radius = Math.min(h / 2, base + pad);
        // A hint of parallax toward the pointer, like iPadOS.
        const dx = ((x - (r.left + r.width / 2)) / Math.max(r.width, 1)) * 5;
        const dy = ((y - (r.top + r.height / 2)) / Math.max(r.height, 1)) * 4;
        setBox(w, h, radius, r.left - pad + dx, r.top - pad + dy);
      } else if (mode === "text") {
        setBox(2, 22, 2, x - 1, y - 11);
      } else if (mode === "label") {
        setBox(labelW, 28, 14, x - labelW / 2, y - 14);
      } else {
        setBox(DOT, DOT, DOT, x - DOT / 2, y - DOT / 2);
      }
    };

    const resolve = (t: Element | null) => {
      if (!t || !t.closest) return;
      const textEl = t.closest(TEXT);
      const labelled = t.closest<HTMLElement>("[data-cursor]");
      const inter = t.closest<HTMLElement>(INTERACTIVE);
      let next: typeof mode = "free";
      let nextTarget: HTMLElement | null = null;
      if (textEl) next = "text";
      else if (labelled?.dataset.cursor) {
        next = "label";
        if (label.textContent !== labelled.dataset.cursor) {
          label.textContent = labelled.dataset.cursor;
          labelW = Math.max(56, labelled.dataset.cursor.length * 7.4 + 26);
        }
      } else if (inter && inter.dataset.cursorMorph !== "false") {
        const r = inter.getBoundingClientRect();
        if (r.width <= MAX_MORPH.w && r.height <= MAX_MORPH.h) {
          next = "morph";
          nextTarget = inter;
        }
      }
      if (next !== mode || nextTarget !== target) {
        mode = next;
        target = nextTarget;
        el.dataset.mode = mode;
        place();
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      el.style.opacity = "1";
      place();
    };
    const onOver = (e: PointerEvent) => resolve(e.target as Element);
    const onLeave = () => (el.style.opacity = "0");
    const onScroll = () => {
      if (mode === "morph") {
        // The element moved under a still pointer: re-evaluate what is below it.
        resolve(document.elementFromPoint(x, y));
        place();
      }
    };
    const onDown = () => {
      if (mode === "free") el.style.transform += " scale(0.8)";
    };
    const onUp = () => place();

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      delete html.dataset.customCursor;
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div ref={ref} className="ipad-cursor" data-mode="free" aria-hidden>
      <span ref={labelRef} />
    </div>
  );
}
