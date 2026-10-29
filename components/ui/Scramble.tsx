"use client";

import { useEffect, useRef, type ElementType } from "react";
import { getPrefs, useReducedMotion } from "@/lib/prefs";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const DIGIT = "0123456789";
const SYMBOL = "/<>_-+=*#";

function glyphFor(ch: string) {
  if (/[A-ZÁÉÍÓÚÑ]/.test(ch)) return UPPER[(Math.random() * UPPER.length) | 0];
  if (/[a-záéíóúñ]/.test(ch)) return LOWER[(Math.random() * LOWER.length) | 0];
  if (/\d/.test(ch)) return DIGIT[(Math.random() * DIGIT.length) | 0];
  if (ch.trim() === "") return ch;
  return SYMBOL[(Math.random() * SYMBOL.length) | 0];
}

type Trigger = "mount" | "view" | "hover" | "view-hover";

interface Props {
  text: string;
  as?: ElementType;
  className?: string;
  trigger?: Trigger;
  /** ms */
  delay?: number;
  /** ms for the whole string to resolve */
  duration?: number;
  /**
   * decode: starts hidden and resolves left → right.
   * sweep: the final text is visible from the first paint (safe for LCP) and a
   * band of glyphs sweeps through it once.
   */
  mode?: "decode" | "sweep";
}

/**
 * Decode effect. The final text always reserves the layout (invisible copy),
 * the scrambled glyphs are painted on an overlay, so nothing ever shifts.
 */
export function Scramble({ text, as: Tag = "span", className, trigger = "view", delay = 0, duration = 900, mode = "decode" }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const hidesUntilRun = mode === "decode" && (trigger === "mount" || trigger === "view" || trigger === "view-hover");

  useEffect(() => {
    const root = rootRef.current!;
    const overlay = overlayRef.current!;
    let raf = 0;
    let timer = 0;
    let running = false;

    const reveal = () => root.setAttribute("data-scramble", "done");

    const run = (wait: number) => {
      if (getPrefs().reduced) {
        overlay.textContent = text;
        reveal();
        return;
      }
      if (running) return;
      running = true;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        reveal();
        const chars = Array.from(text);
        const span = Math.max(1, chars.length - 1);
        const begin = chars.map((_, i) => (mode === "sweep" ? (i / span) * duration * 0.8 : 0));
        const settle = chars.map((_, i) =>
          mode === "sweep" ? begin[i] + 90 + Math.random() * 90 : (i / span) * duration * 0.75 + Math.random() * duration * 0.25,
        );
        const current = chars.map((c) => glyphFor(c));
        const start = performance.now();
        let lastSwap = 0;
        const frame = (now: number) => {
          const elapsed = now - start;
          const swap = now - lastSwap > 45;
          if (swap) lastSwap = now;
          let done = true;
          let out = "";
          for (let i = 0; i < chars.length; i++) {
            if (elapsed >= settle[i] || elapsed < begin[i]) {
              out += chars[i];
              if (elapsed < begin[i]) done = false;
            }
            else {
              done = false;
              if (swap) current[i] = glyphFor(chars[i]);
              out += current[i];
            }
          }
          overlay.textContent = out;
          if (!done) raf = requestAnimationFrame(frame);
          else running = false;
        };
        raf = requestAnimationFrame(frame);
      }, wait);
    };

    if (reduced) {
      overlay.textContent = text;
      reveal();
      return;
    }

    let io: IntersectionObserver | undefined;
    if (trigger === "mount") run(delay);
    if (trigger === "view" || trigger === "view-hover") {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            run(delay);
            io?.disconnect();
          }
        },
        { rootMargin: "0px 0px -10% 0px" },
      );
      io.observe(root);
    }
    const onEnter = () => run(0);
    if (trigger === "hover" || trigger === "view-hover") root.addEventListener("pointerenter", onEnter);

    return () => {
      io?.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      root.removeEventListener("pointerenter", onEnter);
    };
  }, [text, trigger, delay, duration, reduced, mode]);

  return (
    <Tag ref={rootRef} className={`relative inline-block ${className ?? ""}`} data-scramble={hidesUntilRun ? "pending" : "done"}>
      <span className="invisible" aria-hidden>
        {text}
      </span>
      <span ref={overlayRef} className="absolute inset-0" aria-hidden>
        {text}
      </span>
      <span className="sr-only">{text}</span>
    </Tag>
  );
}
