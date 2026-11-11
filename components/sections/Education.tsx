import { profile } from "@/content/profile";
import { has, type Locale } from "@/content/types";
import { brandOf } from "@/lib/assets";
import { brandStyle } from "@/lib/brand";
import { copy, fill } from "@/lib/copy";
import { formatMonth, formatRange, studyYear } from "@/lib/i18n";
import { CardMedia } from "@/components/media/CardMedia";
import { SectionBackdrop } from "@/components/media/SectionBackdrop";
import { Glyph } from "@/components/ui/icons";
import { LogoMark } from "@/components/ui/LogoMark";
import { SectionHeader } from "./SectionHeader";
import { SkillChips } from "./SkillChips";
import { TimelineRail } from "./TimelineRail";

/**
 * Same language as Experience: ETSII-UPM first and larger (its programmes and
 * the Erasmus as lines of the card), then Retamar and CS50. Beside the title,
 * on desktop, the cloud forms an open book. Behind everything, very faint,
 * the video or photos found in public/media/education/ (none: no backdrop).
 */
export async function Education({ lang, now }: { lang: Locale; now: Date }) {
  const t = copy.education;
  const [upm, retamar] = profile.education;
  const cs50 = profile.courses[0];
  const { erasmus } = profile.future;
  const [upmTone, retamarTone, csTone] = await Promise.all([brandOf(upm.brand), brandOf(retamar.brand), brandOf(cs50.brand)]);
  const year = studyYear(upm.start!, upm.end, now);

  const when = (top: string, sub?: string) => (
    <div className="tl-when">
      <p className="text-[15px] font-semibold text-fg">{top}</p>
      {sub ? <p className="mt-1 text-[14px] text-muted">{sub}</p> : null}
    </div>
  );

  return (
    <section id="education" className="section section-alt">
      <SectionBackdrop section="education" />
      <SectionHeader eyebrow={t.eyebrow[lang]} title={t.title[lang]} intro={t.intro[lang]} figures={["book"]} />
      <TimelineRail className="wrap mt-14 space-y-6 md:mt-16">
        {/* ETSII-UPM */}
        <div className="tl-row brand" style={brandStyle(upmTone)}>
          <span className="tl-marker" data-tl-marker>
            <LogoMark brand={upm.brand} size={44} />
          </span>
          {when(formatRange(upm.start, upm.end, lang), profile.location[lang])}
          <article id={`edu-${upm.id}`} data-target-id={upm.id} suppressHydrationWarning className="card card-tint reveal scroll-mt-nav p-5 sm:p-6 md:p-9">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h3 className="text-[clamp(1.5rem,2.6vw,2rem)] leading-tight text-fg">{upm.degree[lang]}</h3>
              {year ? <span className="badge">{fill(t.year[lang], String(year))}</span> : null}
            </div>
            <p className="mt-1.5 text-[16px]">
              <span className="font-semibold text-[var(--d)]">{upm.short}</span>
              <span className="text-muted"> · Universidad Politécnica de Madrid</span>
            </p>
            <p className="mt-1 text-[14px] text-muted lg:hidden">{formatRange(upm.start, upm.end, lang)}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {upm.chips.filter(has).map((c) => (
                <li key={c.label.en} className="chip">
                  {c.label[lang]}
                </li>
              ))}
            </ul>
            {(upm.notes ?? []).map((n) => (
              <div key={n.id} data-target-id={n.id} className="mt-6 flex items-start gap-x-3 border-t border-[var(--line)] pt-5 text-[15px]">
                <Glyph name="people" className="mt-0.5 size-[18px] shrink-0 text-[var(--d)]" />
                <p className="text-pretty text-fg">
                  <span className="font-medium">{n.label[lang]}</span>
                  <span className="text-muted"> · </span>
                  {n.detail[lang]}
                </p>
              </div>
            ))}
            <div data-target-id="erasmus" className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-0.5 border-t border-[var(--line)] pt-5 text-[15px]">
              <Glyph name="globe" className="size-[18px] shrink-0 text-[var(--d)]" />
              <span className="font-medium text-fg">
                {t.erasmus[lang]}
                {has(erasmus.destination) ? ` · ${erasmus.destination[lang]}` : ""}
              </span>
              <span className="whitespace-nowrap text-[14px] text-muted max-sm:basis-full max-sm:pl-[30px] sm:ml-auto">
                {formatMonth(erasmus.start, lang)} – {formatMonth(erasmus.end, lang)}
              </span>
            </div>
            <CardMedia section="education" folder="etsii" lang={lang} alt={upm.short} className="mt-6" />
          </article>
        </div>

        {/* school */}
        <div className="tl-row brand" style={brandStyle(retamarTone)}>
          <span className="tl-marker" data-tl-marker>
            <LogoMark brand={retamar.brand} size={44} />
          </span>
          {when(formatRange(retamar.start, retamar.end, lang), t.school[lang])}
          <article id={`edu-${retamar.id}`} data-target-id={retamar.id} suppressHydrationWarning className="card reveal scroll-mt-nav p-5 sm:p-6 md:p-9">
            <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] leading-tight text-fg">{retamar.degree[lang]}</h3>
            <p className="mt-1.5 text-[16px] font-semibold text-[var(--d)]">{retamar.institution[lang]}</p>
            <p className="mt-1 text-[14px] text-muted lg:hidden">{formatRange(retamar.start, retamar.end, lang)}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {retamar.chips.filter(has).map((c) => (
                <li key={c.label.en} className="chip">
                  {c.label[lang]}
                </li>
              ))}
            </ul>
            <CardMedia section="education" folder="retamar" lang={lang} alt={retamar.institution[lang]} className="mt-6" />
          </article>
        </div>

        {/* CS50 */}
        <div className="tl-row brand" style={brandStyle(csTone)}>
          <span className="tl-marker" data-tl-marker>
            <LogoMark brand={cs50.brand} size={44} />
          </span>
          {when(formatMonth(cs50.date, lang), cs50.provider)}
          <article id="edu-cs50" data-target-id="cs50" suppressHydrationWarning className="card reveal scroll-mt-nav p-5 sm:p-6 md:p-9">
            <h3 className="text-[clamp(1.2rem,1.9vw,1.4rem)] leading-snug text-fg">{cs50.detail[lang]}</h3>
            <p className="mt-1.5 text-[16px]">
              <span className="font-semibold text-[var(--d)]">{cs50.provider}</span>
              <span className="text-muted"> · {formatMonth(cs50.date, lang)}</span>
            </p>
            <SkillChips lang={lang} refId="cs50" className="mt-5" />
            <CardMedia section="education" folder="cs50" lang={lang} alt={cs50.name} className="mt-6" />
          </article>
        </div>

      </TimelineRail>
    </section>
  );
}
