"use client";

import { useRef, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger, useIsoLayoutEffect } from "@/lib/gsap";
import { usePrefs } from "@/lib/prefs";

/**
 * Desktop: the section pins and its panels scroll horizontally, scrubbed by
 * vertical scroll. Mobile / reduced motion: a plain vertical stack.
 */
export function ProjectsRail({ panels, id }: { panels: ReactNode[]; id?: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const { reduced } = usePrefs();

  useIsoLayoutEffect(() => {
    if (reduced) return;
    const section = sectionRef.current!;
    const track = trackRef.current!;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const distance = () => track.scrollWidth - window.innerWidth;
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (barRef.current) barRef.current.style.transform = `scaleX(${self.progress})`;
            setActive(Math.min(panels.length - 1, Math.round(self.progress * (panels.length - 1))));
          },
        },
      });
      return () => tween.scrollTrigger?.kill();
    });
    // Fonts/images can change widths after first layout.
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => {
      window.clearTimeout(t);
      mm.revert();
    };
  }, [reduced, panels.length]);

  return (
    <section ref={sectionRef} id={id} className="relative lg:h-[100svh] lg:overflow-hidden">
      <div
        ref={trackRef}
        className={`flex flex-col gap-24 px-5 sm:px-8 md:px-12 ${reduced ? "" : "lg:h-full lg:w-max lg:flex-row lg:items-center lg:gap-[8vw] lg:px-[8vw] lg:will-change-transform"}`}
      >
        {panels.map((p, i) => (
          <div key={i} className={reduced ? "" : "lg:w-[min(1180px,82vw)] lg:shrink-0"}>
            {p}
          </div>
        ))}
      </div>
      {!reduced ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-8 hidden items-center gap-4 px-[8vw] lg:flex" aria-hidden>
          <span className="mono-label tabular !text-fg">{String(active + 1).padStart(2, "0")}</span>
          <span className="relative h-px flex-1 bg-line">
            <span ref={barRef} className="absolute inset-0 origin-left scale-x-0 bg-accent shadow-[0_0_10px_rgb(var(--glow))]" />
          </span>
          <span className="mono-label tabular">{String(panels.length).padStart(2, "0")}</span>
        </div>
      ) : null}
    </section>
  );
}
