import { profile } from "@/content/profile";
import { has, type Locale } from "@/content/types";
import { brandOf } from "@/lib/assets";
import { brandStyle } from "@/lib/brand";
import { copy, fill } from "@/lib/copy";
import { formatDay, formatRange, timeStatus } from "@/lib/i18n";
import { metricSuffix } from "@/lib/metrics";
import { CardMedia } from "@/components/media/CardMedia";
import { CountUp } from "@/components/ui/CountUp";
import { LogoMark } from "@/components/ui/LogoMark";
import { SectionHeader } from "./SectionHeader";
import { SkillChips } from "./SkillChips";
import { TimelineRail } from "./TimelineRail";

/** Every role on a vertical timeline whose milestones are the logos; PropHero first and larger. */
export async function Experience({ lang, now }: { lang: Locale; now: Date }) {
  const t = copy.experience;
  const tones = await Promise.all(profile.experience.map((e) => brandOf(e.brand)));

  return (
    <section id="experience" className="section">
      <SectionHeader eyebrow={t.eyebrow[lang]} title={t.title[lang]} intro={t.intro[lang]} figures={["gears"]} />
      <TimelineRail className="wrap mt-14 space-y-6 md:mt-16">
        {profile.experience.map((e, i) => {
          const status = timeStatus(e.start, e.end, now);
          const range = formatRange(e.start, e.end, lang);
          const where = [e.mode && has(e.mode) ? e.mode[lang] : null, has(e.location) ? e.location[lang] : null].filter(Boolean).join(" · ");
          const bullets = e.bullets.filter(has);
          return (
            <div key={e.id} className="tl-row brand" style={brandStyle(tones[i])}>
              <span className="tl-marker" data-tl-marker>
                <LogoMark brand={e.brand} size={44} />
              </span>
              <div className="tl-when">
                <p className="text-[15px] font-semibold text-fg">{range}</p>
                {where ? <p className="mt-1 text-[14px] text-muted">{where}</p> : null}
              </div>
              <article id={`exp-${e.id}`} data-target-id={e.id} suppressHydrationWarning className={`card reveal scroll-mt-nav p-5 sm:p-6 md:p-9 ${e.featured ? "card-tint" : ""}`}>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <h3 className={`${e.featured ? "text-[clamp(1.5rem,2.6vw,2rem)]" : "text-[clamp(1.25rem,2vw,1.5rem)]"} leading-tight text-fg`}>{e.role[lang]}</h3>
                  {status === "current" ? (
                    <span className="badge">
                      {e.featured ? <span className="pulse-dot" aria-hidden /> : null}
                      {t.current[lang]}
                    </span>
                  ) : status === "upcoming" ? (
                    <span className="badge">{fill(copy.now.starts[lang], formatDay(e.start, lang))}</span>
                  ) : null}
                </div>
                <p className="mt-1.5 text-[16px]">
                  <span className="font-semibold text-[var(--d)]">{e.company}</span>
                  {e.context ? <span className="text-muted"> · {e.context[lang]}</span> : null}
                </p>
                <p className="mt-1 text-[14px] text-muted lg:hidden">
                  {range}
                  {where ? ` · ${where}` : ""}
                </p>
                {bullets.length ? (
                  <ul className="xp-bullets mt-5 space-y-2 text-[16px] leading-relaxed text-fg">
                    {bullets.map((b) => (
                      <li key={b.en}>{b[lang]}</li>
                    ))}
                  </ul>
                ) : null}
                {e.metrics?.length ? (
                  <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
                    {e.metrics.map((m) => (
                      <div key={m.label.en} className="flex flex-col-reverse">
                        <dt className="mt-1.5 text-[14px] text-muted">{m.label[lang]}</dt>
                        <dd className="font-display text-[clamp(1.9rem,3.4vw,2.6rem)] font-bold leading-none tracking-[-0.035em] text-[var(--d)]">
                          <CountUp value={m.value} prefix={m.prefix} suffix={metricSuffix(m, lang)} lang={lang} />
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                <SkillChips lang={lang} refId={e.id} ids={e.skills} className="mt-6" />
                <CardMedia section="experience" folder={e.id} lang={lang} alt={e.company} className="mt-6" />
              </article>
            </div>
          );
        })}
      </TimelineRail>
    </section>
  );
}
