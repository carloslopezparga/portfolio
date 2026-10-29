"use client";

import { useEffect, useRef, useState } from "react";
import { Magnetic } from "@/components/ui/Magnetic";
import { askAgent, preloadConsole } from "@/lib/agent/store";
import { useReducedMotion } from "@/lib/prefs";

/**
 * The hero's only call to action: a prompt to the agent. The placeholder
 * cycles through example questions; submitting opens the agent console
 * with the answer (an empty submit asks the example on screen).
 */
export function PromptBar({ label, examples, sendLabel }: { label: string; examples: string[]; sendLabel: string }) {
  const [value, setValue] = useState("");
  const [i, setI] = useState(0);
  const [focused, setFocused] = useState(false);
  const reduced = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const showExample = !value && !focused;

  useEffect(() => {
    if (reduced || !showExample) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % examples.length), 3600);
    return () => window.clearInterval(t);
  }, [reduced, showExample, examples.length]);

  return (
    <form
      className="group relative flex h-14 items-center gap-3 rounded-full bg-surface/70 pl-5 pr-2 shadow-[inset_0_0_0_1px_var(--line-strong)] transition-shadow duration-300 focus-within:shadow-[inset_0_0_0_1px_rgb(var(--ai-rgb)/0.8),0_0_40px_-12px_rgb(var(--ai-rgb)/0.7)]"
      onSubmit={(e) => {
        e.preventDefault();
        askAgent(value || examples[i]);
        setValue("");
        inputRef.current?.blur();
      }}
      onPointerEnter={() => void preloadConsole()}
    >
      <span className="relative flex size-2 shrink-0" aria-hidden>
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--ai)] opacity-50 reduced:hidden" />
        <span className="relative inline-flex size-2 rounded-full bg-[var(--ai)] shadow-[0_0_10px_rgb(var(--ai-rgb))]" />
      </span>
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
            <span className="truncate text-muted">{label}</span>
            <span className="mx-2 shrink-0 text-subtle">›</span>
            <span key={i} className="clip-up truncate text-dim">
              {examples[i]}
            </span>
          </span>
        ) : null}
      </div>
      <Magnetic strength={0.4}>
        <button
          type="submit"
          aria-label={sendLabel}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-fg text-bg transition-shadow duration-300 hover:shadow-[0_0_0_1px_rgb(var(--ai-rgb)/0.7),0_8px_30px_-6px_rgb(var(--ai-rgb)/0.7)]"
        >
          <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </button>
      </Magnetic>
    </form>
  );
}
