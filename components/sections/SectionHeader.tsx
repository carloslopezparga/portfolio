import type { ReactNode } from "react";

/** Small grey label, a big title and an optional one-line intro. */
export function SectionHeader({ eyebrow, title, intro, center = false }: { eyebrow: string; title: string; intro?: ReactNode; center?: boolean }) {
  return (
    <header className={`wrap reveal reveal-rise ${center ? "text-center" : ""}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className={`mt-3 text-[clamp(2.25rem,5.2vw,3.9rem)] leading-[1.04] text-fg ${center ? "mx-auto" : ""} max-w-[18ch]`}>{title}</h2>
      {intro ? <p className={`mt-5 max-w-[60ch] text-[17px] leading-relaxed text-muted md:text-[19px] ${center ? "mx-auto" : ""}`}>{intro}</p> : null}
    </header>
  );
}
