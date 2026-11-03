import { profile } from "@/content/profile";
import { has, type Locale } from "@/content/types";
import { brandOf } from "@/lib/assets";
import { brandStyle } from "@/lib/brand";
import { copy, fill } from "@/lib/copy";
import { formatDay, formatRange, timeStatus } from "@/lib/i18n";
import { formatMetric } from "@/lib/metrics";
import { CardMedia } from "@/components/media/CardMedia";
import { LogoMark } from "@/components/ui/LogoMark";
import { SectionHeader, sheetOf } from "./SectionHeader";
import { SkillChips } from "./SkillChips";
import { TimelineRail } from "./TimelineRail";

/** Every role as a compact card on a vertical timeline; PropHero first and larger. */
export async function Experience({ lang, now }: { lang: Locale; now: Date }) {
  const t = copy.experience;
  const tones = await Promise.all(profile.experience.map((e) => brandOf(e.brand)));

  return (
    <section id="experience" data-sheet={sheetOf("experience")} className="relative scroll-mt-20 py-14 md:py-20">
      <SectionHeader id="experience" title={t.title[lang]} intro={t.intro[lang]} />
      <TimelineRail className="mx-auto mt-10 max-w-[1200px] space-y-5 px-5 sm:px-8">
        {profile.experience.map((e, i) => {
          const status = timeStatus(e.start, e.end, now);
          const range = formatRange(e.start, e.end, lang);
          const where = [e.mode && has(e.mode) ? e.mode[lang] : null, has(e.location) ? e.location[lang] : null].filter(Boolean).join(" · ");
          const bullets = e.bullets.filter(has);
          return (
            <div key={e.id} className="tl-row brand" style={brandStyle(tones[i])}>
              <span className="tl-marker" data-tl-marker aria-hidden />
              <div className="tl-when">
                <p className="text-[14px] font-medium text-fg">{range}</p>
                {where ? <p className="mt-0.5 text-[13px] text-dim">{where}</p> : null}
              </div>
              <article id={`exp-${e.id}`} data-target-id={e.id} className={`xp-card scroll-mt-24 ${e.featured ? "xp-card--featured" : ""}`}>
                <div className="flex items-start gap-4">
                  <LogoMark brand={e.brand} size={e.featured ? 52 : 44} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <h3 className={`${e.featured ? "text-[clamp(1.25rem,2vw,1.5rem)]" : "text-[18px]"} leading-tight text-fg`}>{e.role[lang]}</h3>
                      {status === "current" ? (
                        <span className="badge">
                          {e.featured ? <span className="pulse-dot" aria-hidden /> : null}
                          {t.current[lang]}
                        </span>
                      ) : status === "upcoming" ? (
                        <span className="badge">
                          <span className="pulse-dot" aria-hidden />
                          {fill(copy.now.starts[lang], formatDay(e.start, lang))}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-[15px]">
                      <span className="font-medium text-[var(--d)]">{e.company}</span>
                      {e.context ? <span className="text-muted"> · {e.context[lang]}</span> : null}
                    </p>
                    <p className="mt-0.5 text-[13px] text-dim lg:hidden">
                      {range}
                      {where ? ` · ${where}` : ""}
                    </p>
                  </div>
                </div>
                {bullets.length ? (
                  <ul className="xp-bullets mt-4 space-y-1.5 text-[14.5px] leading-snug text-muted">
                    {bullets.map((b) => (
                      <li key={b.en}>{b[lang]}</li>
                    ))}
                  </ul>
                ) : null}
                {e.metrics?.length ? (
                  <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                    {e.metrics.map((m) => (
                      <div key={m.label.en}>
                        <dt className="sr-only">{m.label[lang]}</dt>
                        <dd className="text-[22px] font-semibold leading-none text-[var(--d)]">{formatMetric(m, lang)}</dd>
                        <dd className="mt-1 text-[13px] text-dim">{m.label[lang]}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                <SkillChips lang={lang} refId={e.id} className="mt-4" />
                <CardMedia section="experience" folder={e.id} lang={lang} alt={e.company} className="mt-4" />
              </article>
            </div>
          );
        })}
      </TimelineRail>
    </section>
  );
}
