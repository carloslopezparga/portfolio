"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { StackId } from "@/content/types";
import { DUR, EASE } from "@/lib/motion";
import { StackIcon, stackColor } from "@/components/ui/icons";
import { Marquee } from "@/components/ui/Marquee";
import { Scramble } from "@/components/ui/Scramble";
import { Tone } from "@/components/ui/Tone";

export interface StackEntry {
  id: StackId;
  label: string;
  group: string;
  usedIn: { id: string; label: string }[];
}

/**
 * Stack as a marquee (crawls under the cursor) and as a dense grid. Hovering,
 * focusing or tapping any icon drives the inspector: where it was used.
 */
export function StackShowcase({ items, usedInLabel, languages }: { items: StackEntry[]; usedInLabel: string; languages: { name: string; level: string }[] }) {
  const [sel, setSel] = useState<StackId>(items[0].id);
  const current = items.find((i) => i.id === sel)!;
  const pick = (id: StackId) => () => setSel(id);

  return (
    <div className="space-y-10">
      <Marquee speed={36} className="-mx-5 py-2 sm:-mx-8 md:-mx-12">
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            onPointerEnter={pick(it.id)}
            onFocus={pick(it.id)}
            onClick={pick(it.id)}
            className="group flex h-14 shrink-0 items-center gap-3 rounded-full px-5 text-[15px] text-muted shadow-[inset_0_0_0_1px_var(--line)] transition-hover hover:text-fg hover:shadow-[inset_0_0_0_1px_rgb(var(--glow)/0.5)]"
          >
            <Tone as="span" className="grid size-6 place-items-center rounded-none !overflow-visible">
              <span style={{ color: stackColor(it.id) }}>
                <StackIcon id={it.id} className="size-5" />
              </span>
            </Tone>
            {it.label}
          </button>
        ))}
      </Marquee>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {items.map((it) => (
            <button
              key={it.id}
              type="button"
              onPointerEnter={pick(it.id)}
              onFocus={pick(it.id)}
              onClick={pick(it.id)}
              aria-pressed={sel === it.id}
              className={`group relative flex aspect-square flex-col items-center justify-center gap-3 rounded-[18px] p-3 text-center transition-hover ${
                sel === it.id ? "bg-[rgb(var(--glow)/0.07)] shadow-[inset_0_0_0_1px_rgb(var(--glow)/0.7),0_0_30px_-12px_rgb(var(--glow))]" : "shadow-[inset_0_0_0_1px_var(--line)]"
              }`}
            >
              <Tone as="span" className="grid place-items-center !overflow-visible" >
                <span style={{ color: stackColor(it.id) }} className={sel === it.id ? "[&_svg]:!filter-none" : ""}>
                  <StackIcon id={it.id} className="size-7 md:size-8" />
                </span>
              </Tone>
              <span className="text-[12px] leading-tight text-muted group-hover:text-fg">{it.label}</span>
            </button>
          ))}
        </div>

        <div className="relative min-h-[300px] overflow-hidden rounded-[var(--radius-card)] p-6 shadow-[inset_0_0_0_1px_var(--line-strong)] lg:sticky lg:top-24 lg:self-start">
          <p className="mono-label">Inspector</p>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: DUR.base, ease: EASE.out }}
              className="mt-5"
            >
              <span style={{ color: stackColor(current.id) }} className="block drop-shadow-[0_0_18px_rgb(var(--glow)/0.35)]">
                <StackIcon id={current.id} className="size-12" />
              </span>
              <h3 className="mt-5 text-[26px] leading-tight text-fg">
                <Scramble text={current.label} trigger="mount" duration={500} />
              </h3>
              <p className="mono-label mt-1">{current.group}</p>
              <p className="mono-label mt-6 !text-[10px]">{usedInLabel}</p>
              <ul className="mt-2 space-y-1.5">
                {current.usedIn.map((u, i) => (
                  <motion.li
                    key={u.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: DUR.base, ease: EASE.out, delay: 0.08 + i * 0.06 }}
                    className="flex items-center gap-2 text-[15px] text-fg"
                  >
                    <span className="h-px w-3 bg-accent" />
                    {u.label}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-6">
        {languages.map((l) => (
          <p key={l.name} className="text-[15px] text-fg">
            {l.name} <span className="mono-label ml-1">{l.level}</span>
          </p>
        ))}
      </div>
    </div>
  );
}
