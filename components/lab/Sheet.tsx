import type { ReactNode } from "react";
import { DimensionLine } from "@/components/ui/DimensionLine";
import { RevealText } from "@/components/ui/RevealText";

/**
 * One "lámina" of the lab: drawing code, title, title block (cajetín),
 * a live dimension line and a spec table of how it behaves per context.
 */
export function Sheet({
  id,
  code,
  index,
  total,
  title,
  description,
  notes,
  children,
  bleed,
}: {
  id: string;
  code: string;
  index: number;
  total: number;
  title: string;
  description: string;
  notes?: { desktop: string; mobile: string; reduced: string };
  children: ReactNode;
  bleed?: boolean;
}) {
  return (
    <section id={id} className="relative scroll-mt-20 py-24 md:py-32">
      <header className="mx-auto max-w-[1280px] px-5 sm:px-8 md:px-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[760px]">
            <p className="mono-label">
              <span className="text-accent">{code}</span> · Lámina {String(index).padStart(2, "0")}
            </p>
            <RevealText as="h2" className="mt-3 text-[clamp(2rem,4.6vw,3.6rem)] leading-[1.02] text-fg">
              {title}
            </RevealText>
            <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-muted md:text-base">{description}</p>
          </div>
          <dl className="mono-label grid shrink-0 grid-cols-3 overflow-hidden rounded-[10px] text-[10px] shadow-[inset_0_0_0_1px_var(--line-strong)] md:w-[300px]">
            {[
              ["Sheet", `${String(index).padStart(2, "0")}/${String(total).padStart(2, "0")}`],
              ["Rev", "A"],
              ["Scale", "1:1"],
            ].map(([k, v], i) => (
              <div key={k} className={`px-3 py-2.5 ${i ? "border-l border-line" : ""}`}>
                <dt className="!text-[9px]">{k}</dt>
                <dd className="mt-0.5 text-fg">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <DimensionLine className="mt-8" />
        {notes ? (
          <div className="mt-6 grid gap-px overflow-hidden rounded-[12px] bg-line text-[13.5px] leading-relaxed md:grid-cols-3">
            {[
              ["Desktop", notes.desktop],
              ["Móvil", notes.mobile],
              ["Reduced motion", notes.reduced],
            ].map(([k, v]) => (
              <div key={k} className="bg-bg px-4 py-3.5">
                <p className="mono-label !text-[10px]">{k}</p>
                <p className="mt-1.5 text-muted">{v}</p>
              </div>
            ))}
          </div>
        ) : null}
      </header>
      <div className={bleed ? "mt-14" : "mx-auto mt-14 max-w-[1280px] px-5 sm:px-8 md:px-12"}>{children}</div>
    </section>
  );
}
