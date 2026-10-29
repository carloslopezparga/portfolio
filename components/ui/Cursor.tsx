"use client";

import { useEffect, useRef } from "react";
import { usePrefs } from "@/lib/prefs";

const INTERACTIVE = 'a, button, [role="button"], [role="tab"], summary, select, label[for], [data-cursor-morph]';
/** Where the native cursor works better (I-beam, the embed's own cursor). */
const NATIVE = 'input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]), textarea, [contenteditable="true"], iframe, [data-native-cursor]';
const DOT = 10;
/** Elements larger than this keep the plain dot (a highlight that big reads as a flash). */
const MAX_MORPH = { w: 520, h: 220 };

/**
 * iPadOS-style pointer that never disappears:
 * - the dot follows the mouse with zero lag and sits above everything
 *   (canvas, panels, the agent console) at the maximum z-index;
 * - over interactive elements a highlight takes the element's shape and
 *   radius, and the dot stays visible inside it;
 * - the native cursor is hidden only while the dot is actually painted at the
 *   pointer: before the first move, outside the window, over text fields,
 *   iframes (Cal.com) and while a modal dialog is open, the native one shows.
 * Touch devices and reduced motion keep the native cursor.
 */
export function Cursor() {
  const { reduced, touch } = usePrefs();
  const enabled = !reduced && !touch;
  const hlRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const hl = hlRef.current!;
    const dot = dotRef.current!;
    const label = labelRef.current!;
    const html = document.documentElement;

    let x = -100;
    let y = -100;
    let shown = false;
    let native = false;
    let mode: "free" | "morph" | "label" = "free";
    let target: HTMLElement | null = null;

    /** The custom cursor is drawn → hide the native one; otherwise show it. */
    const sync = () => {
      const on = shown && !native && !document.querySelector("dialog[open]");
      dot.style.opacity = on ? "1" : "0";
      hl.style.opacity = on && mode !== "free" ? "1" : "0";
      if (on) html.dataset.customCursor = "";
      else delete html.dataset.customCursor;
    };

    const place = () => {
      dot.style.transform = `translate3d(${x - DOT / 2}px, ${y - DOT / 2}px, 0)`;
      if (mode === "morph" && target) {
        const r = target.getBoundingClientRect();
        const pad = Number(target.dataset.cursorPad ?? 6);
        const w = r.width + pad * 2;
        const h = r.height + pad * 2;
        const base = parseFloat(getComputedStyle(target).borderTopLeftRadius) || 10;
        // A hint of parallax toward the pointer, like iPadOS.
        const dx = ((x - (r.left + r.width / 2)) / Math.max(r.width, 1)) * 5;
        const dy = ((y - (r.top + r.height / 2)) / Math.max(r.height, 1)) * 4;
        hl.style.width = `${w}px`;
        hl.style.height = `${h}px`;
        hl.style.borderRadius = `${Math.min(h / 2, base + pad)}px`;
        hl.style.transform = `translate3d(${r.left - pad + dx}px, ${r.top - pad + dy}px, 0)`;
      } else if (mode === "label") {
        const w = Math.max(56, (label.textContent?.length ?? 0) * 7.4 + 26);
        hl.style.width = `${w}px`;
        hl.style.height = "28px";
        hl.style.borderRadius = "14px";
        hl.style.transform = `translate3d(${x + 14}px, ${y + 14}px, 0)`;
      }
    };

    const resolve = (t: Element | null) => {
      if (!t || !t.closest) return;
      native = !!t.closest(NATIVE);
      const labelled = t.closest<HTMLElement>("[data-cursor]");
      const inter = t.closest<HTMLElement>(INTERACTIVE);
      let next: typeof mode = "free";
      let nextTarget: HTMLElement | null = null;
      if (!native && labelled?.dataset.cursor) {
        next = "label";
        label.textContent = labelled.dataset.cursor;
      } else if (!native && inter && inter.dataset.cursorMorph !== "false") {
        const r = inter.getBoundingClientRect();
        if (r.width <= MAX_MORPH.w && r.height <= MAX_MORPH.h) {
          next = "morph";
          nextTarget = inter;
        }
      }
      if (next !== mode || nextTarget !== target) {
        mode = next;
        target = nextTarget;
        hl.dataset.mode = mode;
      }
      place();
      sync();
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      if (!shown) {
        shown = true;
        resolve(e.target as Element);
      } else place();
      sync();
    };
    const onOver = (e: PointerEvent) => {
      if (e.pointerType === "mouse") resolve(e.target as Element);
    };
    // Leaving the window (or entering an iframe, whose events we no longer get).
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget || (e.relatedTarget as Element).nodeName === "IFRAME") {
        shown = false;
        sync();
      }
    };
    const onBlur = () => {
      shown = false;
      sync();
    };
    // The page moved under a still pointer: re-evaluate what is below it.
    const onScroll = () => {
      if (shown) resolve(document.elementFromPoint(x, y));
    };
    const onDown = () => dot.classList.add("is-down");
    const onUp = () => dot.classList.remove("is-down");
    // A modal dialog lives in the top layer, above any z-index: use the native cursor meanwhile.
    const mo = new MutationObserver(sync);
    mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open"] });

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("mouseout", onOut);
    window.addEventListener("blur", onBlur);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    return () => {
      mo.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("mouseout", onOut);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      delete html.dataset.customCursor;
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <div ref={hlRef} className="cursor-hl" data-mode="free" aria-hidden>
        <span ref={labelRef} />
      </div>
      <div ref={dotRef} className="cursor-dot" aria-hidden />
    </>
  );
}
