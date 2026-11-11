import { profile } from "@/content/profile";
import { has, type Locale } from "@/content/types";
import { brandOf } from "@/lib/assets";
import { brandStyle } from "@/lib/brand";
import { copy, fill } from "@/lib/copy";
import { formatDay, formatRange, studyYear, timeStatus } from "@/lib/i18n";
import { LogoMark } from "@/components/ui/LogoMark";
import { SectionHeader } from "./SectionHeader";
import { TargetLink } from "./TargetLink";

const arrow = (
  <svg viewBox="0 0 16 16" className="link-nudge size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

/** Where I work and what I study, right now: two large cards in their brand colours. */
export async function Now({ lang, now }: { lang: Locale; now: Date }) {
  const t = copy.now;
  const job = profile.experience.find((e) => e.featured)!;
  const school = profile.education.find((e) => e.featured)!;
  const [jobTone, schoolTone] = await Promise.all([brandOf(job.brand), brandOf(school.brand)]);
  const jobStatus = timeStatus(job.start, job.end, now);
  const year = studyYear(school.start!, school.end, now);

  const card = "card card-tint card-hover brand group reveal flex min-h-[340px] flex-col p-7 md:p-10";
  return (
    <section id="now" className="section section-alt">
      <SectionHeader eyebrow={t.eyebrow[lang]} title={t.title[lang]} />
      <div className="wrap mt-12 grid gap-4 md:grid-cols-2 md:gap-5">
        <TargetLink targetId={job.id} href={`#exp-${job.id}`} suppressHydrationWarning className={card} style={brandStyle(jobTone)}>
          <div className="flex items-center justify-between gap-3">
            <p className="mono-label">{t.work[lang]}</p>
            {jobStatus === "current" ? (
              <span className="badge">
                <span className="pulse-dot" aria-hidden />
                {t.current[lang]}
              </span>
            ) : jobStatus === "upcoming" ? (
              <span className="badge">{fill(t.starts[lang], formatDay(job.start, lang))}</span>
            ) : null}
          </div>
          <LogoMark brand={job.brand} size={64} className="mt-8" />
          <h3 className="mt-5 text-[clamp(1.75rem,3vw,2.25rem)] leading-tight text-fg">{job.company}</h3>
          <p className="mt-1 text-[16px] font-semibold text-[var(--d)]">{job.role[lang]}</p>
          {has(job.summary) ? <p className="mt-4 text-[16px] leading-relaxed text-fg">{job.summary[lang]}</p> : null}
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-8 text-[14px] text-muted">
            <span>
              {formatRange(job.start, job.end, lang)}
              {has(job.location) ? ` · ${job.location[lang]}` : ""}
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-fg">
              {t.more[lang]} {arrow}
            </span>
          </div>
        </TargetLink>

        <TargetLink targetId={school.id} href={`#edu-${school.id}`} suppressHydrationWarning className={card} style={{ ...brandStyle(schoolTone), ["--rd" as string]: "90ms" }}>
          <div className="flex items-center justify-between gap-3">
            <p className="mono-label">{t.study[lang]}</p>
            {year ? <span className="badge">{fill(t.year[lang], String(year))}</span> : null}
          </div>
          <LogoMark brand={school.brand} size={64} className="mt-8" />
          <h3 className="mt-5 text-[clamp(1.75rem,3vw,2.25rem)] leading-tight text-fg">{school.short}</h3>
          <p className="mt-1 text-[16px] font-semibold text-[var(--d)]">{school.degree[lang]}</p>
          <p className="mt-4 text-[16px] leading-relaxed text-fg">{school.institution[lang]}</p>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-8 text-[14px] text-muted">
            <span>
              {formatRange(school.start, school.end, lang)} · {profile.location[lang]}
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-fg">
              {t.moreStudy[lang]} {arrow}
            </span>
          </div>
        </TargetLink>
      </div>
    </section>
  );
}
