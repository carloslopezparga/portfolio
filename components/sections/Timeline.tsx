"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useIsoLayoutEffect } from "@/lib/gsap";
import { getPrefs } from "@/lib/prefs";

export interface TimelineItem {
  id: string;
  period: string;
  status?: string;
  title: string;
  org: string;
  meta?: string;
  body?: string;
  bullets?: string[];
  chips?: string[];
  logo: ReactNode;
}

/**
 * Vertical rail that draws itself with the scroll (scaleY, scrubbed). Each
 * milestone lights up — logo to colour, node glow — when the rail reaches it.
 */
export function Timeline({ items }: { items: TimelineItem[] }) {
  const ref = useRef<HTMLOListElement>(null);

  useIsoLayoutEffect(() => {
    const root = ref.current!;
    const rail = root.querySelector<HTMLElement>("[data-rail]")!;
    const rows = Array.from(root.querySelectorAll<HTMLElement>("[data-row]"));
    if (getPrefs().reduced) {
      gsap.set(rail, { scaleY: 1 });
      rows.forEach((r) => r.setAttribute("data-lit", ""));
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        rail,
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: root, start: "top 62%", end: "bottom 62%", scrub: 0.6 } },
      );
      rows.forEach((row) => {
        ScrollTrigger.create({
          trigger: row,
          start: "top 62%",
          onEnter: () => row.setAttribute("data-lit", ""),
          onLeaveBack: () => row.removeAttribute("data-lit"),
        });
        gsap.from(row.querySelectorAll("[data-fade]"), {
          y: 24,
          opacity: 0,
          duration: 0.8,
          stagger: 0.07,
          scrollTrigger: { trigger: row, start: "top 80%", once: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, [items.length]);

  return (
    <ol ref={ref} className="relative">
      {/* rail: base hairline + scrubbed glowing progress */}
      <span className="absolute bottom-0 left-[22px] top-0 w-px bg-line md:left-[246px]" aria-hidden />
      <span
        data-rail
        className="absolute bottom-0 left-[22px] top-0 w-px origin-top bg-accent shadow-[0_0_12px_rgb(var(--glow))] md:left-[246px]"
        aria-hidden
      />
      {items.map((it) => (
        <li key={it.id} data-row className="tl-row relative grid grid-cols-[44px_1fr] gap-x-6 pb-16 last:pb-0 md:grid-cols-[200px_44px_1fr]">
          <div className="hidden pt-3 text-right md:block" data-fade>
            <p className="mono-label tabular">{it.period}</p>
            {it.status ? <p className="tl-status mono-label mt-1.5 !text-accent">{it.status}</p> : null}
          </div>
          <div className="tl-node relative z-10 rounded-full">{it.logo}</div>
          <div className="min-w-0 pt-1.5">
            <div className="md:hidden" data-fade>
              <p className="mono-label tabular">
                {it.period}
                {it.status ? <span className="ml-2 !text-accent">· {it.status}</span> : null}
              </p>
            </div>
            <h3 className="mt-1 text-[clamp(1.25rem,2vw,1.6rem)] leading-tight text-fg md:mt-0" data-fade>
              {it.title}
            </h3>
            <p className="mt-1 text-[15px] text-muted" data-fade>
              {it.org}
              {it.meta ? <span className="text-dim"> · {it.meta}</span> : null}
            </p>
            {it.body ? (
              <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-muted" data-fade>
                {it.body}
              </p>
            ) : null}
            {it.bullets?.length ? (
              <ul className="mt-3 max-w-[62ch] space-y-1.5 text-[15px] leading-relaxed text-muted" data-fade>
                {it.bullets.map((b) => (
                  <li key={b} className="relative pl-4 before:absolute before:left-0 before:top-[0.7em] before:h-px before:w-2 before:bg-subtle">
                    {b}
                  </li>
                ))}
              </ul>
            ) : null}
            {it.chips?.length ? (
              <div className="mt-4 flex flex-wrap gap-2" data-fade>
                {it.chips.map((c) => (
                  <span key={c} className="mono-label rounded-full px-2.5 py-1 !text-[10px] shadow-[inset_0_0_0_1px_var(--line-strong)]">
                    {c}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
