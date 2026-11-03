"use client";

import { useEffect, useRef } from "react";
import { CONTROLS, shapeOf } from "@/lib/hover";
import { usePrefs } from "@/lib/prefs";

/** Text fields: the pointer becomes an I-beam. */
const FIELD = 'input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]):not([type="range"]), textarea, [contenteditable="true"]';
/** Embeds (Cal.com, video players): only the native cursor works there. */
const NATIVE = "iframe, [data-native-cursor]";
const RING = 18;
/** Elements larger than this keep the ring (a highlight that big reads as a flash). */
const MAX_MORPH = { w: 720, h: 180 };
/** How far a highlighted element leans toward the pointer, in px. */
const LIFT = 2;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

type Mode = "ring" | "morph" | "label" | "ibeam";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Height of the line of text under the pointer, or 0 when it isn't over text. */
function textLine(x: number, y: number): number {
  const d = document as Document & {
    caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node } | null;
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
  };
  const node = d.caretPositionFromPoint ? d.caretPositionFromPoint(x, y)?.offsetNode : d.caretRangeFromPoint?.(x, y)?.startContainer;
  if (!node || node.nodeType !== Node.TEXT_NODE || !node.textContent?.trim()) return 0;
  if (node.parentElement?.closest("svg, [aria-hidden='true']")) return 0;
  const range = document.createRange();
  range.selectNodeContents(node);
  for (const r of range.getClientRects()) if (x >= r.left - 1 && x <= r.right + 1 && y >= r.top && y <= r.bottom) return r.height;
  return 0;
}

/**
 * iPadOS-style pointer that never disappears:
 * - at rest, an 18 px translucent ring with vibrancy that follows the mouse
 *   with zero lag; a click shrinks it from its centre, it never moves;
 * - over buttons, links, chips and menu options it melts into the element
 *   and becomes its highlight (same shape and radius); the element leans
 *   1–2 px toward the pointer and a centre dot stays visible;
 * - over text and text fields, a thin I-beam sized to the text;
 * - over images and demos, a contextual label (data-cursor="View");
 * - the native cursor is hidden only while this one is painted: before the
 *   first move, outside the window, over iframes and while a modal dialog
 *   is open, the native one shows.
 * Touch devices and reduced motion keep the native cursor.
 */
export function Cursor() {
  const { reduced, touch } = usePrefs();
  const enabled = !reduced && !touch;
  const rootRef = useRef<HTMLDivElement>(null);
  const shapeRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const root = rootRef.current!;
    const shape = shapeRef.current!;
    const label = labelRef.current!;
    const dot = dotRef.current!;
    const html = document.documentElement;

    let x = -100;
    let y = -100;
    let shown = false;
    let native = false;
    let mode: Mode = "ring";
    /** What the element under the pointer asks for; "ring" may still become an I-beam over text. */
    let want: Mode = "ring";
    let target: Element | null = null;
    let lifted: HTMLElement | null = null;
    let lx = 0;
    let ly = 0;
    let liftIntro = false;
    let beam = 18;
    let raf = 0;
    let snapTimer = 0;

    const sync = () => {
      const on = shown && !native && !document.querySelector("dialog[open]");
      root.style.opacity = on ? "1" : "0";
      dot.style.opacity = on && mode === "morph" ? "1" : "0";
      if (on) html.dataset.customCursor = "";
      else delete html.dataset.customCursor;
    };

    // Morphing in or out glides for a moment; otherwise the pointer is exact.
    const snap = () => {
      root.dataset.snap = "";
      clearTimeout(snapTimer);
      snapTimer = window.setTimeout(() => delete root.dataset.snap, 180);
    };

    const drop = () => {
      if (!lifted) return;
      const el = lifted;
      const from = el.style.translate;
      el.style.translate = "";
      if (from) el.animate([{ translate: from }, { translate: "0px 0px" }], { duration: 180, easing: EASE });
      lifted = null;
      lx = ly = 0;
    };

    const setMode = (m: Mode) => {
      if (m === mode) return;
      if ((m === "morph") !== (mode === "morph")) snap();
      if (m !== "morph") drop();
      mode = m;
      root.dataset.mode = m;
      sync();
    };

    const size = (w: number, h: number, r: number) => {
      shape.style.width = `${w}px`;
      shape.style.height = `${h}px`;
      shape.style.borderRadius = `${r}px`;
    };

    const place = () => {
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      let cx = x;
      let cy = y;
      if (mode === "morph" && target) {
        const s = shapeOf(target);
        // The box without the lean, so the lean doesn't feed back into itself.
        const w0 = s.width / 2;
        const h0 = s.height / 2;
        const mx = s.left - lx + w0;
        const my = s.top - ly + h0;
        const tx = clamp((x - mx) / w0, -1, 1) * LIFT;
        const ty = clamp((y - my) / h0, -1, 1) * LIFT;
        if (lifted) {
          const v = `${tx.toFixed(2)}px ${ty.toFixed(2)}px`;
          if (liftIntro) lifted.animate([{ translate: "0px 0px" }, { translate: v }], { duration: 160, easing: EASE });
          liftIntro = false;
          lifted.style.translate = v;
          lx = tx;
          ly = ty;
        }
        cx = mx + tx;
        cy = my + ty;
        size(s.width, s.height, s.radius);
      } else if (mode === "ibeam") size(2, beam, 1);
      else if (mode === "label") size(label.offsetWidth + 22, 30, 15);
      else size(RING, RING, RING / 2);
      root.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    };

    /** Decide between ring and I-beam (text under a bare pointer); once per frame. */
    const settle = () => {
      raf = 0;
      if (want !== "ring") return;
      const h = textLine(x, y);
      if (h) beam = clamp(Math.round(h * 0.82), 14, 44);
      setMode(h ? "ibeam" : "ring");
      place();
    };

    const resolve = (t: Element | null) => {
      if (!t?.closest) return;
      native = !!t.closest(NATIVE);
      const labelled = native ? null : t.closest<HTMLElement>("[data-cursor]");
      const control = native ? null : t.closest(CONTROLS);
      const field = native ? null : t.closest<HTMLElement>(FIELD);
      let next: Mode = "ring";
      let nextTarget: Element | null = null;
      if (labelled?.dataset.cursor) {
        next = "label";
        label.textContent = labelled.dataset.cursor;
      } else if (control && (control as HTMLElement).dataset.cursorMorph !== "false" && !field) {
        const r = control.getBoundingClientRect();
        if (r.width <= MAX_MORPH.w && r.height <= MAX_MORPH.h) {
          next = "morph";
          nextTarget = control;
        }
      } else if (field) {
        next = "ibeam";
        beam = clamp(Math.round(parseFloat(getComputedStyle(field).fontSize) * 1.35), 16, 40);
      }
      if (nextTarget !== target) {
        drop();
        target = nextTarget;
        if (
          target instanceof HTMLElement &&
          !target.closest(".magnetic, [data-no-lift]") &&
          getComputedStyle(target).translate === "none" &&
          getComputedStyle(target).position !== "fixed"
        ) {
          lifted = target;
          liftIntro = true;
        }
      }
      want = next;
      setMode(next);
      if (next === "ring") settle();
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
        return;
      }
      place();
      if (want === "ring" && !raf) raf = requestAnimationFrame(settle);
    };
    const onOver = (e: PointerEvent) => {
      if (e.pointerType === "mouse") resolve(e.target as Element);
    };
    // Leaving the window (or entering an iframe, whose events we no longer get).
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget || (e.relatedTarget as Element).nodeName === "IFRAME") {
        shown = false;
        drop();
        target = null;
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
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") root.dataset.down = "";
    };
    const onUp = () => delete root.dataset.down;
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
      cancelAnimationFrame(raf);
      clearTimeout(snapTimer);
      drop();
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
      <div ref={rootRef} className="cursor" data-mode="ring" aria-hidden>
        <div ref={shapeRef} className="cursor-shape" />
        <span ref={labelRef} className="cursor-label" />
      </div>
      <div ref={dotRef} className="cursor-dot" aria-hidden>
        <span />
      </div>
    </>
  );
}
