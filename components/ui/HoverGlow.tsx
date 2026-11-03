"use client";

import { useEffect, useRef } from "react";
import { CONTROLS, shapeOf } from "@/lib/hover";
import { usePrefs } from "@/lib/prefs";

/** Small things that light up: controls, plus chips, logos and constellation nodes. */
const CONTROL = `${CONTROLS}, .chip, .logo-mark, .media-thumb, .c-node, .c-star, [data-glow]`;
/** Cards: a wider, softer light. */
const SURFACE = ".now-card, .xp-card:not(.xp-card--quiet), .project-card, .lead-card, .project-panel, [data-glow-surface]";
/** Buttons and featured cards also get a faint outer halo. */
const HALO = ".btn, .now-card, .xp-card--featured, .project-card";
/** Bigger than this, a control lights up like a card. */
const MAX_CONTROL = { w: 720, h: 220 };

interface Layer {
  node: HTMLDivElement;
  el: Element | null;
}

/**
 * visionOS-style hover light. A soft radial light in the element's accent
 * colour (brand or domain; white on neutral elements) follows the pointer
 * inside buttons, links, chips, logos, cards, constellation nodes and menu
 * options, and lifts the element's brightness a touch; buttons and featured
 * cards add a faint halo. Two overlays (one for the card, one for the control
 * under the pointer) are drawn over the element, so nothing in the page
 * changes. On touch the same light appears where the finger lands.
 */
export function HoverGlow() {
  const { touch } = usePrefs();
  const surfaceRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const surface: Layer = { node: surfaceRef.current!, el: null };
    const control: Layer = { node: controlRef.current!, el: null };
    const html = document.documentElement;
    let x = 0;
    let y = 0;
    let raf = 0;
    let fadeTimer = 0;

    const neutral = () => getComputedStyle(html).getPropertyValue("--d-rgb").trim();
    const header = () => document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 0;

    const set = (layer: Layer, el: Element | null) => {
      if (el === layer.el) return;
      layer.el = el;
      const n = layer.node;
      if (!el) {
        n.style.opacity = "0";
        return;
      }
      const rgb = getComputedStyle(el).getPropertyValue("--d-rgb").trim();
      n.dataset.neutral = String(!rgb || rgb === neutral());
      n.style.setProperty("--g", n.dataset.neutral === "true" ? "255 255 255" : rgb);
      n.toggleAttribute("data-halo", el.matches(HALO));
      n.style.opacity = "1";
    };

    const draw = () => {
      raf = 0;
      const top = header();
      for (const layer of [surface, control]) {
        const el = layer.el;
        if (!el) continue;
        if (!el.isConnected) {
          set(layer, null);
          continue;
        }
        const s = layer === control ? shapeOf(el) : (() => {
          const r = el.getBoundingClientRect();
          return { left: r.left, top: r.top, width: r.width, height: r.height, radius: parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0 };
        })();
        const n = layer.node.style;
        n.transform = `translate3d(${s.left}px, ${s.top}px, 0)`;
        n.width = `${s.width}px`;
        n.height = `${s.height}px`;
        n.borderRadius = `${s.radius}px`;
        n.setProperty("--gx", `${x - s.left}px`);
        n.setProperty("--gy", `${y - s.top}px`);
        n.setProperty("--gr", `${layer === control ? Math.round(clamp(Math.max(s.width, s.height) * 0.9, 70, 240)) : 460}px`);
        // Never paint over the fixed header when a card slides under it.
        const hidden = el.closest(".site-header") ? 0 : Math.max(0, top - s.top);
        n.clipPath = hidden ? `inset(${hidden}px 0 0 0)` : "";
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };

    const pick = (t: Element | null) => {
      if (!t?.closest || t.closest("dialog, [data-no-glow]")) {
        set(control, null);
        set(surface, null);
        return;
      }
      let c = t.closest(CONTROL);
      let s = t.closest(SURFACE);
      if (c) {
        const r = c.getBoundingClientRect();
        if (r.width > MAX_CONTROL.w || r.height > MAX_CONTROL.h) {
          s = s ?? c;
          c = null;
        }
      }
      set(control, c);
      set(surface, s);
      schedule();
    };

    const clear = () => {
      set(control, null);
      set(surface, null);
    };

    if (!touch) {
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        x = e.clientX;
        y = e.clientY;
        if (control.el || surface.el) schedule();
      };
      const onOver = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        x = e.clientX;
        y = e.clientY;
        pick(e.target as Element);
      };
      const onOut = (e: MouseEvent) => {
        if (!e.relatedTarget) clear();
      };
      const onScroll = () => {
        if (control.el || surface.el) pick(document.elementFromPoint(x, y));
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerover", onOver, { passive: true });
      document.addEventListener("mouseout", onOut);
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerover", onOver);
        document.removeEventListener("mouseout", onOut);
        window.removeEventListener("scroll", onScroll);
      };
    }

    // Touch: the light appears where the finger lands and fades after lifting it.
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      clearTimeout(fadeTimer);
      x = e.clientX;
      y = e.clientY;
      pick(e.target as Element);
    };
    const onUp = () => {
      clearTimeout(fadeTimer);
      fadeTimer = window.setTimeout(clear, 260);
    };
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", clear, { passive: true });
    window.addEventListener("scroll", clear, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fadeTimer);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", clear);
      window.removeEventListener("scroll", clear);
    };
  }, [touch]);

  return (
    <>
      <div ref={surfaceRef} className="hover-glow hover-glow--surface" aria-hidden />
      <div ref={controlRef} className="hover-glow" aria-hidden />
    </>
  );
}

function clamp(v: number, a: number, b: number) {
  return Math.min(b, Math.max(a, v));
}
