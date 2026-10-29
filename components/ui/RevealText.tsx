"use client";

import { SplitText } from "gsap/SplitText";
import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useIsoLayoutEffect } from "@/lib/gsap";
import { DUR, STAGGER } from "@/lib/motion";
import { getPrefs } from "@/lib/prefs";

if (typeof window !== "undefined") gsap.registerPlugin(SplitText);

type Mode = "lines" | "words" | "chars";

/**
 * Headline revealed by lines, words or characters rising out of a mask when it
 * enters the viewport. Re-splits on resize/font load (autoSplit). The element
 * keeps an aria-label with the full text.
 */
export function RevealText({
  children,
  as: Tag = "h2",
  mode = "lines",
  className,
  delay = 0,
  start = "top 85%",
}: {
  children: ReactNode;
  as?: ElementType;
  mode?: Mode;
  className?: string;
  delay?: number;
  start?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const splitRef = useRef<HTMLSpanElement>(null);
  // aria-label is only valid on headings; other tags keep an sr-only copy instead.
  const heading = typeof Tag === "string" && /^h[1-6]$/.test(Tag);

  useIsoLayoutEffect(() => {
    const el = ref.current!;
    const target = heading ? el : splitRef.current!;
    if (getPrefs().reduced) {
      el.setAttribute("data-revealed", "");
      return;
    }
    let split: SplitText | undefined;
    const ctx = gsap.context(() => {
      split = SplitText.create(target, {
        type: mode === "chars" ? "words,chars" : mode === "words" ? "words" : "lines",
        mask: mode,
        autoSplit: true,
        aria: heading ? "auto" : "none",
        onSplit(self) {
          el.setAttribute("data-revealed", "");
          const targets = mode === "lines" ? self.lines : mode === "words" ? self.words : self.chars;
          return gsap.from(targets, {
            yPercent: 118,
            rotate: mode === "chars" ? 4 : 0,
            duration: mode === "lines" ? DUR.reveal * 1.2 : DUR.reveal,
            ease: "site.out",
            stagger: STAGGER[mode === "lines" ? "line" : mode === "words" ? "word" : "char"],
            delay,
            scrollTrigger: { trigger: el, start, once: true },
          });
        },
      });
    }, el);
    return () => {
      ctx.revert();
      split?.revert();
    };
  }, [mode, delay, start, heading]);

  return (
    <Tag ref={ref} data-reveal="" className={className}>
      {heading ? (
        children
      ) : (
        <>
          <span className="sr-only">{children}</span>
          <span ref={splitRef} aria-hidden className="block">
            {children}
          </span>
        </>
      )}
    </Tag>
  );
}
