"use client";

import { useEffect, useRef, useState } from "react";

/** The figure the cloud forms for each step, in order (the section's gap lists the same three). */
const FIGURE = ["funnel", "flow", "bars"];

/**
 * The three steps. One is active: the one under the mouse or, with no mouse
 * on them, the one the scroll picks: stacked (phones), the step nearest the
 * middle of the screen; in a row (desktop), the first as the row comes in,
 * then the second and the third as it climbs past the middle. The active
 * step names the figure of the section's gap (data-figure), which the cloud
 * follows.
 */
export function HowSteps({ steps }: { steps: { id: string; title: string; text: string }[] }) {
  const list = useRef<HTMLOListElement>(null);
  const hovered = useRef<number | null>(null);
  const pick = useRef(() => {});
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = list.current!;
    const items = Array.from(el.children) as HTMLElement[];
    let raf = 0;
    const choose = () => {
      raf = 0;
      if (hovered.current !== null) return setActive(hovered.current);
      const vh = window.innerHeight;
      const rects = items.map((it) => it.getBoundingClientRect());
      const centre = (r: DOMRect) => r.top + r.height / 2;
      if (rects[1].top > rects[0].top + 8) {
        let best = 0;
        rects.forEach((r, i) => Math.abs(centre(r) - vh / 2) < Math.abs(centre(rects[best]) - vh / 2) && (best = i));
        setActive(best);
      } else {
        const climbed = Math.min(0.999, Math.max(0, (vh * 0.78 - centre(rects[0])) / (vh * 0.42)));
        setActive(Math.floor(climbed * items.length));
      }
    };
    pick.current = () => {
      if (!raf) raf = requestAnimationFrame(choose);
    };
    // only while the steps are near the screen
    const io = new IntersectionObserver(
      ([e]) => {
        window.removeEventListener("scroll", pick.current);
        if (e.isIntersecting) {
          window.addEventListener("scroll", pick.current, { passive: true });
          pick.current();
        }
      },
      { rootMargin: "20% 0px" },
    );
    io.observe(el);
    window.addEventListener("resize", pick.current);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", pick.current);
      window.removeEventListener("resize", pick.current);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const gap = list.current?.closest("section")?.querySelector<HTMLElement>("[data-figure-set]");
    if (gap) gap.dataset.figure = FIGURE[active];
  }, [active]);

  return (
    <ol ref={list} className="wrap mt-12 grid gap-3 md:mt-14 md:grid-cols-3 md:gap-5">
      {steps.map((s, i) => (
        <li
          key={s.id}
          suppressHydrationWarning
          data-active={i === active ? "" : undefined}
          className="step card reveal flex flex-col p-6 md:p-8"
          style={{ ["--rd" as string]: `${i * 80}ms` }}
          onPointerEnter={(e) => {
            if (e.pointerType !== "mouse") return;
            hovered.current = i;
            setActive(i);
          }}
          onPointerLeave={() => {
            hovered.current = null;
            pick.current();
          }}
        >
          <span className="step-n tabular font-display text-[15px] font-bold" aria-hidden>
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className="mt-6 text-[clamp(1.6rem,2.6vw,2.1rem)] leading-tight text-fg md:mt-10">{s.title}</h3>
          <p className="mt-2 text-[16px] leading-relaxed text-fg md:text-[17px]">{s.text}</p>
        </li>
      ))}
    </ol>
  );
}
