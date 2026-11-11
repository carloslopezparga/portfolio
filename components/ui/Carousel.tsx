"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { getPrefs } from "@/lib/prefs";
import { onUI } from "@/lib/ui-bus";

const arrow = (d: string) => (
  <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);

/**
 * One row of cards that scrolls sideways: scroll-snap, a swipe on touch
 * screens, and ← → buttons that move it one card (`arrows`: on every screen,
 * or from tablets up). The row runs to the edges of the screen and its first
 * card lines up with the page's column. When the agent, ⌘K or a link points
 * at one of its cards (data-target-id), the row brings it into view.
 */
export function Carousel({ children, label, labels, arrows = "always", className = "" }: { children: ReactNode; label: string; labels: { prev: string; next: string }; arrows?: "always" | "desktop"; className?: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false, fits: true });

  useEffect(() => {
    const el = track.current!;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setEdge((e) => {
        const next = { start: el.scrollLeft <= 2, end: el.scrollLeft >= max - 2, fits: max <= 2 };
        return next.start === e.start && next.end === e.end && next.fits === e.fits ? e : next;
      });
    };
    const show = (id: string) => {
      const card = el.querySelector<HTMLElement>(`[data-target-id="${CSS.escape(id)}"]`);
      if (!card) return;
      const pad = parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;
      el.scrollTo({ left: card.offsetLeft - pad, behavior: getPrefs().reduced ? "auto" : "smooth" });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    const offs = [onUI("highlight", (a) => show(a.targetId)), onUI("open_project", (a) => show(a.projectId))];
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
      offs.forEach((off) => off());
    };
  }, []);

  const step = (dir: 1 | -1) => {
    const el = track.current!;
    const card = el.firstElementChild as HTMLElement | null;
    if (!card) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({ left: dir * (card.offsetWidth + gap), behavior: getPrefs().reduced ? "auto" : "smooth" });
  };

  return (
    <div className={`carousel ${className}`}>
      <div ref={track} className="carousel-track" role="region" aria-label={label} tabIndex={0}>
        {children}
      </div>
      <div className={`wrap mt-2 justify-end gap-2 ${edge.fits ? "hidden" : arrows === "desktop" ? "hidden md:flex" : "flex"}`}>
        <button type="button" className="carousel-btn" aria-label={labels.prev} disabled={edge.start} onClick={() => step(-1)}>
          {arrow("M13 8H3M7 4 3 8l4 4")}
        </button>
        <button type="button" className="carousel-btn" aria-label={labels.next} disabled={edge.end} onClick={() => step(1)}>
          {arrow("M3 8h10M9 4l4 4-4 4")}
        </button>
      </div>
    </div>
  );
}
