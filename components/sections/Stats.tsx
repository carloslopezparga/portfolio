import type { CSSProperties } from "react";
import { profile } from "@/content/profile";
import type { Locale, StatIcon } from "@/content/types";
import { brandOf } from "@/lib/assets";
import { brandStyle } from "@/lib/brand";
import { copy } from "@/lib/copy";
import { metricSuffix } from "@/lib/metrics";
import { CountUp } from "@/components/ui/CountUp";
import { Glyph, type GlyphName } from "@/components/ui/icons";
import { SectionHeader } from "./SectionHeader";
import { TargetLink } from "./TargetLink";

const ICON: Record<StatIcon, GlyphName> = { calendar: "calendar", search: "search", people: "people", clock: "clock" };

/** Where each figure comes from, and its colour: a brand, a domain or an accent. */
async function source(target: string): Promise<{ href: string; className: string; style?: CSSProperties; attrs: Record<string, string> }> {
  const xp = profile.experience.find((e) => e.id === target);
  if (xp) return { href: `#exp-${xp.id}`, className: "brand", style: brandStyle(await brandOf(xp.brand)), attrs: {} };
  const pr = profile.projects.find((p) => p.id === target);
  if (pr) return { href: "#projects", className: "", attrs: { "data-domain": pr.domain } };
  const ld = profile.leadership.find((l) => l.id === target);
  return { href: `#lead-${target}`, className: "", attrs: ld ? { "data-accent": ld.accent } : {} };
}

/** Four figure cards (Evolve-style): line icon, a big number that counts up, a label. Each links to its source. */
export async function Stats({ lang }: { lang: Locale }) {
  const t = copy.stats;
  const items = await Promise.all(profile.impact.map(async (s) => ({ s, src: await source(s.target) })));
  return (
    <section id="numbers" className="section [--pad-top:80px] md:[--pad-top:112px]">
      <SectionHeader eyebrow={t.eyebrow[lang]} title={t.title[lang]} />
      <ul className="wrap mt-12 grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
        {items.map(({ s, src }, i) => (
          <li key={s.id} className="reveal" style={{ ["--rd" as string]: `${i * 80}ms` }}>
            <TargetLink targetId={s.target} href={src.href} className={`card card-hover group flex h-full flex-col p-5 md:p-7 ${src.className}`} style={src.style} {...src.attrs}>
              <span className="grid size-11 place-items-center rounded-full bg-[var(--bg)] text-[var(--d)] md:size-12">
                <Glyph name={ICON[s.icon]} className="size-[22px]" strokeWidth={1.8} />
              </span>
              <span className="mt-8 block font-display text-[clamp(2.1rem,4.6vw,3.4rem)] font-bold leading-none tracking-[-0.04em] text-fg md:mt-12">
                <CountUp value={s.value} prefix={s.prefix} suffix={metricSuffix(s, lang)} lang={lang} />
              </span>
              <span className="mt-3 block text-[15px] leading-snug text-muted md:text-[16px]">{s.label[lang]}</span>
              <span className="mt-auto flex justify-end pt-5 text-[var(--d)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden>
                <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 11 11 5M6 5h5v5" />
                </svg>
              </span>
            </TargetLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
