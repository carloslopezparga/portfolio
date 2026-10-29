import Image from "next/image";
import { profile } from "@/content/profile";
import { has, type Locale } from "@/content/types";
import { photoSrc } from "@/lib/assets";
import { copy } from "@/lib/copy";
import { Glyph, type GlyphName } from "@/components/ui/icons";
import { SectionHeader, sheetOf } from "./SectionHeader";

const HOBBY_ICON: Record<string, GlyphName> = { drums: "drums", dj: "vinyl", golf: "golf", sailing: "sail" };

/** Compact bento of leadership and impact, plus the one-line "off the clock". */
export function Leadership({ lang }: { lang: Locale }) {
  const t = copy.leadership;
  const cards = profile.leadership.map((l) => ({ ...l, src: l.photo ? photoSrc(l.photo) : null }));
  return (
    <section id="leadership" data-sheet={sheetOf("leadership")} className="relative scroll-mt-20 py-14 md:py-20">
      <SectionHeader id="leadership" title={t.title[lang]} intro={t.intro[lang]} />
      <div className="mx-auto mt-8 grid max-w-[1200px] gap-3 px-5 sm:grid-cols-2 sm:px-8 md:grid-cols-6">
        {cards.map((c, i) => (
          <article
            key={c.id}
            id={`lead-${c.id}`}
            data-target-id={c.id}
            data-accent={c.accent}
            className={`lead-card group scroll-mt-24 ${c.src || i < 2 ? "md:col-span-3" : "md:col-span-2"}`}
          >
            {c.src ? (
              <div className="relative aspect-[16/9] overflow-hidden" data-cursor={copy.cursor.view[lang]}>
                <Image src={c.src} alt={c.title[lang]} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
              </div>
            ) : null}
            <div className="flex flex-1 flex-col p-5">
              <span className="grid size-8 place-items-center rounded-[10px] bg-[rgb(var(--d-rgb)/0.16)]" aria-hidden>
                <span className="size-2 rounded-full bg-[rgb(var(--d-rgb))] shadow-[0_0_10px_rgb(var(--d-rgb)/0.8)]" />
              </span>
              <h3 className="mt-4 text-[17px] font-medium leading-snug text-fg">{c.title[lang]}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{c.description[lang]}</p>
              {has(c.metric) ? <p className="mt-auto pt-4 text-[14px] font-medium text-[var(--d)]">{c.metric[lang]}</p> : null}
            </div>
          </article>
        ))}
      </div>

      <div className="mx-auto mt-5 max-w-[1200px] px-5 sm:px-8">
        <p className="material flex flex-wrap items-center gap-x-5 gap-y-2 rounded-[18px] px-5 py-3.5 text-[14px] text-muted">
          <span className="mono-label">{t.offTheClock[lang]}</span>
          {profile.offTheClock.map((h) => (
            <span key={h.id} className="inline-flex items-center gap-2">
              <Glyph name={HOBBY_ICON[h.id]} className="size-4 text-dim" />
              {h.label[lang]}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
