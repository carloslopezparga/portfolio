import { profile } from "@/content/profile";
import { has, type Locale } from "@/content/types";
import { brandOf, logoSrc } from "@/lib/assets";
import { brandStyle } from "@/lib/brand";
import { copy, fill } from "@/lib/copy";
import { formatDay, formatRange, studyYear, timeStatus } from "@/lib/i18n";
import { LogoMark } from "@/components/ui/LogoMark";
import { SectionHeader, sheetOf } from "./SectionHeader";
import { TargetLink } from "./TargetLink";

const arrow = (
  <svg viewBox="0 0 16 16" className="link-nudge size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

/** Where I work and what I study, right now: two big cards in their brand colours. */
export async function Now({ lang, now }: { lang: Locale; now: Date }) {
  const t = copy.now;
  const job = profile.experience.find((e) => e.featured)!;
  const school = profile.education.find((e) => e.featured)!;
  const [jobTone, schoolTone] = await Promise.all([brandOf(job.brand.logo, job.brand.color), brandOf(school.brand.logo, school.brand.color)]);
  const jobStatus = timeStatus(job.start, job.end, now);
  const year = studyYear(school.start!, school.end, now);

  return (
    <section id="now" data-sheet={sheetOf("now")} className="relative scroll-mt-20 py-14 md:py-20">
      <SectionHeader id="now" title={t.title[lang]} />
      <div className="mx-auto mt-8 grid max-w-[1200px] gap-4 px-5 sm:px-8 md:grid-cols-2 md:gap-5">
        {/* work */}
        <TargetLink targetId={job.id} href={`#exp-${job.id}`} className="now-card brand group" style={brandStyle(jobTone)}>
          <div className="flex items-center justify-between gap-3">
            <p className="mono-label">{t.work[lang]}</p>
            {jobStatus === "current" ? (
              <span className="badge">
                <span className="pulse-dot" aria-hidden />
                {t.current[lang]}
              </span>
            ) : jobStatus === "upcoming" ? (
              <span className="badge">
                <span className="pulse-dot" aria-hidden />
                {fill(t.starts[lang], formatDay(job.start, lang))}
              </span>
            ) : null}
          </div>
          <div className="mt-6 flex items-center gap-4">
            <LogoMark src={logoSrc(job.brand.logo)} monogram={job.brand.monogram} size={56} />
            <div className="min-w-0">
              <h3 className="text-[clamp(1.35rem,2.4vw,1.75rem)] leading-tight text-fg">{job.company}</h3>
              <p className="mt-0.5 text-[15px] font-medium text-[var(--d)]">{job.role[lang]}</p>
            </div>
          </div>
          {has(job.summary) ? <p className="mt-5 text-[15px] leading-relaxed text-muted">{job.summary[lang]}</p> : null}
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6 text-[13.5px] text-dim">
            <span>
              {formatRange(job.start, job.end, lang)}
              {has(job.location) ? ` · ${job.location[lang]}` : ""}
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-fg">
              {t.more[lang]} {arrow}
            </span>
          </div>
        </TargetLink>

        {/* studies */}
        <TargetLink targetId={school.id} href={`#edu-${school.id}`} className="now-card brand group" style={brandStyle(schoolTone)}>
          <div className="flex items-center justify-between gap-3">
            <p className="mono-label">{t.study[lang]}</p>
            {year ? <span className="badge">{fill(t.year[lang], String(year))}</span> : null}
          </div>
          <div className="mt-6 flex items-center gap-4">
            <LogoMark src={logoSrc(school.brand.logo)} monogram={school.brand.monogram} size={56} />
            <div className="min-w-0">
              <h3 className="text-[clamp(1.35rem,2.4vw,1.75rem)] leading-tight text-fg">{school.short}</h3>
              <p className="mt-0.5 text-[15px] font-medium text-[var(--d)]">{school.degree[lang]}</p>
            </div>
          </div>
          {school.specialisation ? (
            <p className="mt-5 text-[15px] leading-relaxed text-muted">
              {t.specialisation[lang]}: <span className="text-fg">{school.specialisation[lang]}</span>
            </p>
          ) : null}
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6 text-[13.5px] text-dim">
            <span>
              {formatRange(school.start, school.end, lang)} · {profile.location[lang]}
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-fg">
              {t.moreStudy[lang]} {arrow}
            </span>
          </div>
        </TargetLink>
      </div>
    </section>
  );
}
