import type { ReactNode } from "react";
import { SECTIONS } from "@/content/profile";
import type { SectionId } from "@/content/types";

const pad = (n: number) => String(n).padStart(2, "0");

/** Sheet number (the only blueprint detail left), title and a one-line intro. */
export function SectionHeader({ id, title, intro }: { id: SectionId; title: string; intro?: ReactNode }) {
  return (
    <header className="mx-auto w-full max-w-[1200px] px-5 sm:px-8">
      <p className="mono-label">
        <span className="text-fg">{pad(SECTIONS.indexOf(id) + 1)}</span> / {pad(SECTIONS.length)}
      </p>
      <h2 className="mt-2 text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.04] text-fg">{title}</h2>
      {intro ? <p className="mt-3 max-w-[62ch] text-[15.5px] leading-relaxed text-muted">{intro}</p> : null}
    </header>
  );
}

/** data-sheet for a section (the header's progress gear reads it). */
export const sheetOf = (id: SectionId) => SECTIONS.indexOf(id) + 1;
