import type { ReactNode } from "react";
import { FigureGap } from "@/components/figures/FigureGap";

/**
 * Small grey label, a big title and an optional one-line intro. With a
 * figure (desktop): the gap for it sits to the right, on the header's
 * baseline, reaching up into the section's top padding; the text keeps clear
 * of it.
 */
export function SectionHeader({ eyebrow, title, intro, center = false, figure }: { eyebrow: string; title: string; intro?: ReactNode; center?: boolean; figure?: "bars" | "gears" }) {
  const header = (
    <header suppressHydrationWarning className={`reveal reveal-rise ${figure ? "fig-beside" : "wrap"} ${center ? "text-center" : ""}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className={`mt-3 text-[clamp(2.25rem,5.2vw,3.9rem)] leading-[1.04] text-fg ${center ? "mx-auto" : ""} max-w-[18ch]`}>{title}</h2>
      {intro ? <p className={`mt-5 max-w-[60ch] text-[17px] leading-relaxed text-fg md:text-[19px] ${center ? "mx-auto" : ""}`}>{intro}</p> : null}
    </header>
  );
  if (!figure) return header;
  return (
    <div className={`wrap fig-row fig-row-${figure} relative`}>
      {header}
      <FigureGap figure={figure} className="fig-gap-head" />
    </div>
  );
}
