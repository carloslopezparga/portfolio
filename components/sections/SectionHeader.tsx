import type { ReactNode } from "react";
import { Cota } from "@/components/ui/Cota";

/** Sheet number, title, one-line intro and a live dimension line. */
export function SectionHeader({ index, title, intro, aside }: { index: number; title: string; intro?: ReactNode; aside?: ReactNode }) {
  return (
    <header className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 md:px-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-[760px]">
          <p className="mono-label">
            <span className="text-fg">{String(index).padStart(2, "0")}</span> / 06
          </p>
          <h2 className="mt-2 text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.02] text-fg">{title}</h2>
          {intro ? <p className="mt-3 max-w-[64ch] text-[15px] leading-relaxed text-muted">{intro}</p> : null}
        </div>
        {aside}
      </div>
      <Cota className="mt-6" />
    </header>
  );
}
