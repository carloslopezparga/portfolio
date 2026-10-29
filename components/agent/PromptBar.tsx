"use client";

import { useEffect, useRef, useState } from "react";
import { Magnetic } from "@/components/ui/Magnetic";
import { askAgent, preloadConsole } from "@/lib/agent/store";
import { useReducedMotion } from "@/lib/prefs";

/**
 * The prompt to the agent, with an Apple Intelligence-style multicolour edge.
 * The placeholder cycles through example questions; submitting opens the
 * agent console with the answer (an empty submit asks the example on screen).
 */
export function PromptBar({ label, examples, sendLabel }: { label: string; examples: string[]; sendLabel: string }) {
  const [value, setValue] = useState("");
  const [i, setI] = useState(0);
  const [focused, setFocused] = useState(false);
  const reduced = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const showExample = !value && !focused;

  useEffect(() => {
    if (reduced || !showExample) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % examples.length), 3600);
    return () => window.clearInterval(t);
  }, [reduced, showExample, examples.length]);

  // The glow only animates while the bar is on screen.
  useEffect(() => {
    const el = glowRef.current!;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) delete el.dataset.paused;
      else el.dataset.paused = "";
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={glowRef} className="ai-glow rounded-full p-[1.5px]">
      <form
        className="relative flex h-14 items-center gap-3 rounded-full bg-[var(--material-strong)] pl-5 pr-2"
        onSubmit={(e) => {
          e.preventDefault();
          askAgent(value || examples[i]);
          setValue("");
          inputRef.current?.blur();
        }}
        onPointerEnter={() => void preloadConsole()}
      >
        <span className="ai-dot size-2.5 shrink-0 rounded-full" aria-hidden />
        <label htmlFor="agent-prompt" className="sr-only">
          {label}
        </label>
        <div className="relative min-w-0 flex-1">
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
            placeholder={focused ? label : ""}
            className="h-14 w-full bg-transparent text-[15px] text-fg outline-none placeholder:text-dim"
          />
          {showExample ? (
            <span className="pointer-events-none absolute inset-0 flex items-center overflow-hidden text-[15px]" aria-hidden>
              <span className="truncate text-fg">{label}</span>
              <span className="mx-2 hidden shrink-0 text-subtle sm:inline">›</span>
              <span key={i} className="clip-up hidden truncate text-dim sm:inline">
                {examples[i]}
              </span>
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
  );
}
