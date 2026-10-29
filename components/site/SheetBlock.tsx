"use client";

import { useEffect } from "react";
import { currentSheet, useSheet } from "@/lib/sheet";
import { ScrollGear } from "./ScrollGear";

/**
 * Tracks which sheet (section) is under the middle of the viewport and, on
 * desktop, shows a miniature of the hero's title block in the corner: the
 * gear turns with scroll, the sheet number follows the section. Hidden over
 * the hero, which carries the full title block.
 */
export function SheetBlock({ titles, sheetLabel }: { titles: Record<number, string>; sheetLabel: string }) {
  const sheet = useSheet();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) currentSheet.set(Number((e.target as HTMLElement).dataset.sheet) || 1);
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    document.querySelectorAll<HTMLElement>("[data-sheet]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div
      aria-hidden
      data-on={sheet > 1 || undefined}
      className="tb pointer-events-none fixed bottom-5 left-5 z-40 hidden translate-y-3 items-stretch opacity-0 transition-[opacity,transform] duration-500 data-[on]:translate-y-0 data-[on]:opacity-100 lg:flex"
    >
      <span className="tb-cell grid place-items-center border-r px-2.5">
        <ScrollGear className="size-5 text-muted" />
      </span>
      <span className="tb-cell flex flex-col justify-center border-r px-3 py-1.5">
        <span className="mono-label !text-[9px]">{sheetLabel}</span>
        <span className="font-mono text-[11px] text-fg">{String(sheet).padStart(2, "0")} / 06</span>
      </span>
      <span className="tb-cell flex min-w-[118px] items-center px-3 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
        <span key={sheet} className="clip-up">
          {titles[sheet]}
        </span>
      </span>
    </div>
  );
}
