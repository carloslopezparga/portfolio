"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefs } from "@/lib/prefs";

/** The figure the cloud forms for each step, in order (the section's gap lists the same three). */
const FIGURE = ["funnel", "flow", "bars"];

/**
 * The three steps, one of them active: it names the figure of the section's
 * gap (data-figure), which the cloud follows. Nothing here depends on the
 * scroll. While at least half the section is on screen the steps advance by
 * themselves, in a loop: the active step's stretch of the progress line fills
 * (a CSS animation, --how-step long) and its end moves on to the next. The
 * mouse over a step, or the keyboard's focus on it, selects it and holds the
 * advance until it leaves; a click or a tap just selects. Reduced motion (or
 * the pause control): no advance; the first step, and whichever is selected.
 */
export function HowSteps({ steps }: { steps: { id: string; title: string; text: string }[] }) {
  const list = useRef<HTMLOListElement>(null);
  const { reduced } = usePrefs();
  const [active, setActive] = useState(0);
  const [seen, setSeen] = useState(false);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setSeen(e.intersectionRatio >= 0.5), { threshold: 0.5 });
    io.observe(list.current!.closest("section")!);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const gap = list.current?.closest("section")?.querySelector<HTMLElement>("[data-figure-set]");
    if (gap) gap.dataset.figure = FIGURE[active];
  }, [active]);

  return (
    <ol
      ref={list}
      suppressHydrationWarning
      className="how-steps reveal"
      data-run={seen && !hover && !focus && !reduced ? "" : undefined}
      onAnimationEnd={(e) => e.animationName === "how-fill" && setActive((a) => (a + 1) % steps.length)}
    >
      {steps.map((s, i) => (
        <li
          key={s.id}
          tabIndex={0}
          aria-current={i === active ? "step" : undefined}
          data-state={i === active ? "active" : i < active ? "done" : "todo"}
          className="how-step"
          onPointerEnter={(e) => {
            if (e.pointerType !== "mouse") return;
            setActive(i);
            setHover(true);
          }}
          onPointerLeave={() => setHover(false)}
          onFocus={(e) => {
            setActive(i);
            // (a click focuses the step too: only the keyboard's focus holds the advance)
            setFocus(e.currentTarget.matches(":focus-visible"));
          }}
          onBlur={() => setFocus(false)}
          onClick={() => setActive(i)}
        >
          <span className="how-rail" aria-hidden>
            <span className="how-dot" />
            <span className="how-track">
              <span className="how-fill" />
            </span>
          </span>
          <div className="how-body">
            <span className="step-n tabular font-display text-[15px] font-bold" aria-hidden>
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="how-title text-fg">{s.title}</h3>
            <p className="mt-2 text-[16px] leading-relaxed text-fg md:text-[17px]">{s.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
