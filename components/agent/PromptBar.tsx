"use client";

import { useEffect, useRef, useState } from "react";
import { Magnetic } from "@/components/ui/Magnetic";
import { askAgent, preloadConsole } from "@/lib/agent/store";
import { useReducedMotion } from "@/lib/prefs";

const TYPE_MS = 42;
const DELETE_MS = 22;
const HOLD_MS = 2200;
const GAP_MS = 350;

/** Examples that fit the bar at its current width (the shortest one if none does). */
function fitting(examples: string[], input: HTMLInputElement | null, room: number): number[] {
  if (!input || room <= 0) return examples.map((_, i) => i);
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return examples.map((_, i) => i);
  const cs = getComputedStyle(input);
  ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const widths = examples.map((e) => ctx.measureText(e).width);
  const ok = examples.map((_, i) => i).filter((i) => widths[i] <= room);
  if (ok.length) return ok;
  return [widths.indexOf(Math.min(...widths))];
}

/**
 * The prompt to the agent: a small label above and, inside an Apple
 * Intelligence-style edge, one example question that types itself, waits,
 * deletes itself and gives way to the next. Only examples that fit whole are
 * used. Submitting opens the agent console (an empty submit asks the example
 * on screen).
 */
export function PromptBar({ label, examples, sendLabel }: { label: string; examples: string[]; sendLabel: string }) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [pool, setPool] = useState<number[]>(() => examples.map((_, i) => i));
  const [current, setCurrent] = useState(0);
  const [shown, setShown] = useState("");
  const [visible, setVisible] = useState(true);
  const reduced = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const idle = !value && !focused;
  const example = examples[pool[current % pool.length]] ?? examples[0];

  // Which examples fit, recomputed when the bar changes width.
  useEffect(() => {
    const field = fieldRef.current!;
    const update = () => {
      const next = fitting(examples, inputRef.current, field.clientWidth - 12);
      setPool((prev) => (prev.join() === next.join() ? prev : next));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(field);
    document.fonts?.ready.then(update);
    return () => ro.disconnect();
  }, [examples]);

  // The bar (and its glow) only animate while on screen.
  useEffect(() => {
    const el = glowRef.current!;
    const io = new IntersectionObserver(([e]) => {
      setVisible(e.isIntersecting);
      if (e.isIntersecting) delete el.dataset.paused;
      else el.dataset.paused = "";
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Type → hold → delete → next.
  useEffect(() => {
    if (!idle || !visible) return;
    if (reduced) {
      const t = window.setTimeout(() => setCurrent((n) => n + 1), 4000);
      return () => window.clearTimeout(t);
    }
    let i = 0;
    let t = 0;
    const type = () => {
      i += 1;
      setShown(example.slice(0, i));
      t = window.setTimeout(i < example.length ? type : erase, i < example.length ? TYPE_MS : HOLD_MS);
    };
    const erase = () => {
      i -= 1;
      setShown(example.slice(0, Math.max(0, i)));
      if (i > 0) t = window.setTimeout(erase, DELETE_MS);
      else t = window.setTimeout(() => setCurrent((n) => n + 1), GAP_MS);
    };
    t = window.setTimeout(type, GAP_MS);
    return () => window.clearTimeout(t);
  }, [idle, visible, reduced, example]);

  return (
    <div>
      <label htmlFor="agent-prompt" className="mb-2.5 flex items-center justify-center gap-2 text-[13px] font-medium text-muted lg:justify-start">
        <span className="ai-dot size-2 rounded-full" aria-hidden />
        {label}
      </label>
      <div ref={glowRef} className="ai-glow rounded-full p-[1.5px]">
        <form
          className="relative flex h-14 items-center gap-3 rounded-full bg-[var(--material-strong)] pl-5 pr-2"
          onSubmit={(e) => {
            e.preventDefault();
            askAgent(value || example);
            setValue("");
            inputRef.current?.blur();
          }}
          onPointerEnter={() => void preloadConsole()}
        >
          <div ref={fieldRef} className="relative min-w-0 flex-1">
            <input
              ref={inputRef}
              id="agent-prompt"
              name="q"
              autoComplete="off"
              maxLength={500}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => {
                setFocused(true);
                void preloadConsole();
              }}
              onBlur={() => setFocused(false)}
              placeholder={focused ? example : ""}
              className="h-14 w-full bg-transparent text-[15px] text-fg outline-none placeholder:text-dim"
            />
            {idle ? (
              <span className="pointer-events-none absolute inset-0 flex items-center whitespace-nowrap text-[15px] text-muted" aria-hidden>
                {reduced ? example : shown}
                <span className="type-caret" />
              </span>
            ) : null}
          </div>
          <Magnetic strength={0.4}>
            <button
              type="submit"
              aria-label={sendLabel}
              className="grid size-10 shrink-0 place-items-center rounded-full bg-fg text-bg transition-shadow duration-300 hover:shadow-[0_0_0_1px_rgb(var(--purple-rgb)/0.7),0_8px_30px_-6px_rgb(var(--purple-rgb)/0.7)]"
            >
              <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </button>
          </Magnetic>
        </form>
      </div>
    </div>
  );
}
