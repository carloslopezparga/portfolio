import Image from "next/image";
import { profile } from "@/content/profile";
import type { Locale } from "@/content/types";
import { copy, mediaLabels } from "@/lib/copy";
import { formatMonth, formatRange } from "@/lib/i18n";
import { mediaFor } from "@/lib/media";
import { metricSuffix } from "@/lib/metrics";
import { MediaStrip } from "@/components/media/MediaStrip";
import { CountUp } from "@/components/ui/CountUp";
import { Glyph, type GlyphName } from "@/components/ui/icons";
import { has, isTodo } from "@/content/types";
import { SectionHeader } from "./SectionHeader";

const HOBBY_ICON: Record<string, GlyphName> = { drums: "drums", dj: "vinyl", golf: "golf", sailing: "sail" };

/**
 * Leadership and impact. Entries with a photo in public/media/leadership/<id>/
 * become photo cards (full-bleed photo, bottom gradient, title on top); the
 * rest are typographic cards. "Off the clock" underneath.
 */
export async function Leadership({ lang }: { lang: Locale }) {
  const t = copy.leadership;
  const cards = await Promise.all(
    profile.leadership.map(async (l) => {
      const media = await mediaFor("leadership", l.id, lang);
      const photo = media.find((m) => m.kind === "image");
      const when = has(l.start) ? (l.end === undefined || isTodo(l.end) ? formatMonth(l.start, lang) : formatRange(l.start, l.end, lang)) : null;
      return { ...l, media, photo: photo && photo.kind === "image" ? photo : null, when };
    }),
  );
  // Photo cards first; the first two cards take the wide slots.
  const ordered = [...cards.filter((c) => c.photo), ...cards.filter((c) => !c.photo)];

  return (
    <section id="leadership" className="section">
      <SectionHeader eyebrow={t.eyebrow[lang]} title={t.title[lang]} intro={t.intro[lang]} />
      <div className="wrap mt-12 grid gap-4 sm:grid-cols-2 md:mt-14 md:grid-cols-6 md:gap-5">
        {ordered.map((c, i) => {
          const span = i < 2 ? "md:col-span-3" : "md:col-span-2";
          const metric = c.metric ? (
            <p className="mt-5 flex items-baseline gap-2">
              <span className="font-display text-[clamp(2rem,3.4vw,2.6rem)] font-bold leading-none tracking-[-0.035em] text-[var(--d)]">
                <CountUp value={c.metric.value} prefix={c.metric.prefix} suffix={metricSuffix(c.metric, lang)} lang={lang} />
              </span>
              <span className="text-[15px]">{c.metric.label[lang]}</span>
            </p>
          ) : null;
          return c.photo ? (
            <article
              key={c.id}
              id={`lead-${c.id}`}
              data-target-id={c.id}
              data-accent={c.accent}
              className={`photo-card reveal scroll-mt-nav flex min-h-[420px] flex-col justify-end ${span}`}
              style={{ ["--rd" as string]: `${(i % 3) * 80}ms` }}
            >
              <Image src={c.photo.src} alt={c.photo.caption ?? c.title[lang]} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
              <div className="relative z-10 p-6 md:p-8 [--d:#fff]">
                {c.when ? <p className="text-[13px] font-semibold text-white/80">{c.when}</p> : null}
                <h3 className="mt-2 text-[clamp(1.4rem,2.4vw,1.9rem)] leading-tight">{c.title[lang]}</h3>
                <p className="mt-2 max-w-[48ch] text-[15.5px] leading-relaxed text-white/85">{c.description[lang]}</p>
                {metric}
                {c.media.length > 1 ? <MediaStrip items={c.media} alt={c.title[lang]} labels={mediaLabels(lang)} variant="pill" className="mt-5" /> : null}
              </div>
            </article>
          ) : (
            <article
              key={c.id}
              id={`lead-${c.id}`}
              data-target-id={c.id}
              data-accent={c.accent}
              className={`card reveal scroll-mt-nav flex flex-col p-6 md:p-8 ${span}`}
              style={{ ["--rd" as string]: `${(i % 3) * 80}ms` }}
            >
              {c.when ? <p className="mb-1.5 text-[13px] font-semibold text-muted">{c.when}</p> : null}
              <h3 className="text-[clamp(1.2rem,1.9vw,1.45rem)] leading-snug text-fg">{c.title[lang]}</h3>
              <p className="mt-2 text-[15.5px] leading-relaxed text-muted">{c.description[lang]}</p>
              {metric ? <div className="mt-auto text-muted">{metric}</div> : null}
            </article>
          );
        })}
      </div>

      <div className="wrap mt-6">
        <p className="card flex flex-wrap items-center gap-x-6 gap-y-2 px-6 py-4 text-[15px] text-muted">
          <span className="font-semibold text-fg">{t.offTheClock[lang]}</span>
          {profile.offTheClock.map((h) => (
            <span key={h.id} className="inline-flex items-center gap-2">
              <Glyph name={HOBBY_ICON[h.id]} className="size-[18px]" />
              {h.label[lang]}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
