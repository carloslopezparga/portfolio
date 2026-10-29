import Image from "next/image";
import { profile } from "@/content/profile";
import { has, type Locale } from "@/content/types";
import { photoSrc } from "@/lib/assets";
import { copy } from "@/lib/copy";
import { Glyph, type GlyphName } from "@/components/ui/icons";
import { SectionHeader } from "./SectionHeader";

const HOBBY_ICON: Record<string, GlyphName> = { drums: "drums", dj: "vinyl", golf: "golf", sailing: "sail" };

/** Compact bento of leadership and impact, plus the one-line "off the clock". */
export function Beyond({ lang }: { lang: Locale }) {
  const t = copy.beyond;
  const cards = profile.leadership.map((l) => ({ ...l, src: l.photo ? photoSrc(l.photo) : null }));
  return (
    <section id="beyond" data-sheet="5" className="relative scroll-mt-16 py-20 md:py-24">
      <SectionHeader index={5} title={t.title[lang]} intro={t.intro[lang]} />
      <div className="mx-auto mt-8 grid max-w-[1400px] gap-3 px-5 sm:grid-cols-2 sm:px-8 md:grid-cols-6 md:px-12">
        {cards.map((c, i) => {
          const wide = !!c.src || i < 2;
          return (
            <article
              key={c.id}
              data-target-id={c.id}
              data-domain={c.domain}
              className={`group flex flex-col overflow-hidden rounded-[var(--radius-card)] bg-surface/50 shadow-[inset_0_0_0_1px_var(--line)] transition-shadow duration-300 hover:shadow-[inset_0_0_0_1px_rgb(var(--d-rgb)/0.5)] ${wide ? "md:col-span-3" : "md:col-span-2"}`}
            >
              {c.src ? (
                <div className="relative aspect-[16/9] overflow-hidden" data-cursor={copy.cursor.view[lang]}>
                  <Image src={c.src} alt={c.title[lang]} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                </div>
              ) : null}
              <div className="flex flex-1 flex-col p-5">
                <p className="mono-label flex items-center gap-2 !text-[10px]">
                  <span className="size-1.5 rounded-full bg-[var(--d)]" aria-hidden />B-{String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-[18px] font-medium leading-snug text-fg">{c.title[lang]}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{c.description[lang]}</p>
                {has(c.metric) ? <p className="mono-label mt-auto pt-4 !text-[var(--d)]">{c.metric[lang]}</p> : null}
              </div>
            </article>
          );
        })}
      </div>

      <div className="mx-auto mt-6 max-w-[1400px] px-5 sm:px-8 md:px-12">
        <p className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-5 text-[14px] text-muted">
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
