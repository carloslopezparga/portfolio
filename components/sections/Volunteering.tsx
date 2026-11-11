import Image from "next/image";
import { profile } from "@/content/profile";
import type { Locale } from "@/content/types";
import { copy, mediaLabels } from "@/lib/copy";
import { formatMonth, formatRange } from "@/lib/i18n";
import { mediaFor } from "@/lib/media";
import { metricSuffix } from "@/lib/metrics";
import { MediaStrip } from "@/components/media/MediaStrip";
import { SectionBackdrop } from "@/components/media/SectionBackdrop";
import { Carousel } from "@/components/ui/Carousel";
import { CountUp } from "@/components/ui/CountUp";
import { Glyph, type GlyphName } from "@/components/ui/icons";
import { has, isTodo } from "@/content/types";
import { SectionHeader } from "./SectionHeader";

const HOBBY_ICON: Record<string, GlyphName> = { drums: "drums", dj: "vinyl", golf: "golf", sailing: "sail" };

/**
 * Volunteering: one row of cards that scrolls sideways (arrows, scroll-snap,
 * a swipe on phones). Entries with a photo in public/media/volunteering/<id>/
 * are photo cards (full-bleed photo, bottom gradient, title on top) and go
 * first; the rest are typographic cards. Behind everything, very faint, the
 * video found directly in public/media/volunteering/ (none: no backdrop).
 * "Off the clock" underneath.
 */
export async function Volunteering({ lang }: { lang: Locale }) {
  const t = copy.volunteering;
  const cards = await Promise.all(
    profile.volunteering.map(async (l) => {
      const media = await mediaFor("volunteering", l.id, lang);
      const photo = media.find((m) => m.kind === "image");
      const when = has(l.start) ? (l.end === undefined || isTodo(l.end) ? formatMonth(l.start, lang) : formatRange(l.start, l.end, lang)) : null;
      return { ...l, media, photo: photo && photo.kind === "image" ? photo : null, when };
    }),
  );
  const ordered = [...cards.filter((c) => c.photo), ...cards.filter((c) => !c.photo)];
  const width = "w-[min(82vw,340px)] md:w-[380px]";

  return (
    <section id="volunteering" className="section">
      <SectionBackdrop section="volunteering" />
      <SectionHeader eyebrow={t.eyebrow[lang]} title={t.title[lang]} intro={t.intro[lang]} />
      <Carousel label={t.title[lang]} labels={{ prev: copy.carousel.prev[lang], next: copy.carousel.next[lang] }} className="mt-10 md:mt-12">
        {ordered.map((c, i) => {
          const metric = c.metric ? (
            <p className="mt-5 flex items-baseline gap-2">
              <span className="font-display text-[clamp(2rem,3.4vw,2.6rem)] font-bold leading-none tracking-[-0.035em] text-[var(--d)]">
                <CountUp value={c.metric.value} prefix={c.metric.prefix} suffix={metricSuffix(c.metric, lang)} lang={lang} />
              </span>
              <span className="text-[15px]">{c.metric.label[lang]}</span>
            </p>
          ) : null;
          return c.photo ? (
            <article key={c.id} id={`vol-${c.id}`} data-target-id={c.id} data-accent={c.accent} suppressHydrationWarning className={`photo-card reveal flex min-h-[400px] flex-col justify-end ${width}`} style={{ ["--rd" as string]: `${Math.min(i, 3) * 80}ms` }}>
              <Image src={c.photo.src} alt={c.photo.caption ?? c.title[lang]} fill sizes="380px" className="object-cover" />
              <div className="relative z-10 p-6 md:p-8 [--d:#fff]">
                {c.when ? <p className="text-[13px] font-semibold text-white/80">{c.when}</p> : null}
                <h3 className="mt-2 text-[clamp(1.4rem,2.4vw,1.75rem)] leading-tight">{c.title[lang]}</h3>
                <p className="mt-2 text-[15.5px] leading-relaxed text-white/85">{c.description[lang]}</p>
                {metric}
                {c.media.length > 1 ? <MediaStrip items={c.media} alt={c.title[lang]} labels={mediaLabels(lang)} variant="pill" className="mt-5" /> : null}
              </div>
            </article>
          ) : (
            <article key={c.id} id={`vol-${c.id}`} data-target-id={c.id} data-accent={c.accent} suppressHydrationWarning className={`card reveal flex min-h-[250px] flex-col p-6 md:p-8 ${width}`} style={{ ["--rd" as string]: `${Math.min(i, 3) * 80}ms` }}>
              {c.when ? <p className="mb-1.5 text-[13px] font-semibold text-muted">{c.when}</p> : null}
              <h3 className="text-[clamp(1.2rem,1.9vw,1.45rem)] leading-snug text-fg">{c.title[lang]}</h3>
              <p className="mt-2 text-[15.5px] leading-relaxed text-fg">{c.description[lang]}</p>
              {metric ? <div className="mt-auto text-muted">{metric}</div> : null}
            </article>
          );
        })}
      </Carousel>

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
