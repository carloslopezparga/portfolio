import { profile } from "@/content/profile";
import { has, type Locale } from "@/content/types";
import { brandOf, logoSrc } from "@/lib/assets";
import { brandStyle } from "@/lib/brand";
import { copy, fill } from "@/lib/copy";
import { formatMonth, formatRange, studyYear } from "@/lib/i18n";
import { Glyph } from "@/components/ui/icons";
import { LogoMark } from "@/components/ui/LogoMark";
import { FutureCone } from "./FutureCone";
import { SectionHeader, sheetOf } from "./SectionHeader";
import { SkillChips } from "./SkillChips";
import { TargetLink } from "./TargetLink";
import { TimelineRail } from "./TimelineRail";

/** ETSII-UPM first and larger; school and CS50 as complementary; a small cone to close. */
export async function Education({ lang, now }: { lang: Locale; now: Date }) {
  const t = copy.education;
  const [upm, retamar] = profile.education;
  const cs50 = profile.courses[0];
  const { erasmus } = profile.future;
  const [upmTone, retamarTone, csTone] = await Promise.all([
    brandOf(upm.brand.logo, upm.brand.color),
    brandOf(retamar.brand.logo, retamar.brand.color),
    brandOf(cs50.brand.logo, cs50.brand.color),
  ]);
  const year = studyYear(upm.start!, upm.end, now);
  const upmChips = upm.chips.filter(has);

  return (
    <section id="education" data-sheet={sheetOf("education")} className="relative scroll-mt-20 py-14 md:py-20">
      <SectionHeader id="education" title={t.title[lang]} intro={t.intro[lang]} />
      <TimelineRail className="mx-auto mt-10 max-w-[1200px] space-y-5 px-5 sm:px-8">
        {/* ETSII-UPM */}
        <div className="tl-row brand" style={brandStyle(upmTone)}>
          <span className="tl-marker" data-tl-marker aria-hidden />
          <div className="tl-when">
            <p className="text-[14px] font-medium text-fg">{formatRange(upm.start, upm.end, lang)}</p>
            <p className="mt-0.5 text-[13px] text-dim">{profile.location[lang]}</p>
          </div>
          <article id={`edu-${upm.id}`} data-target-id={upm.id} className="xp-card xp-card--featured scroll-mt-24">
            <div className="flex items-start gap-4">
              <LogoMark src={logoSrc(upm.brand.logo)} monogram={upm.brand.monogram} size={52} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] leading-tight text-fg">{upm.degree[lang]}</h3>
                  {year ? <span className="badge">{fill(t.year[lang], String(year))}</span> : null}
                </div>
                <p className="mt-1 text-[15px]">
                  <span className="font-medium text-[var(--d)]">{upm.short}</span>
                  <span className="text-muted"> · Universidad Politécnica de Madrid</span>
                </p>
                <p className="mt-0.5 text-[13px] text-dim lg:hidden">{formatRange(upm.start, upm.end, lang)}</p>
              </div>
            </div>
            {upm.specialisation ? (
              <p className="mt-4 text-[14.5px] text-muted">
                {t.specialisation[lang]}: <span className="font-medium text-fg">{upm.specialisation[lang]}</span>
              </p>
            ) : null}
            {upmChips.length ? (
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {upmChips.map((c) => (
                  <li key={c.label.en}>
                    {c.target ? (
                      <TargetLink targetId={c.target} href={`#lead-${c.target}`} className="chip chip-link">
                        {c.label[lang]}
                        <span aria-hidden>↗</span>
                      </TargetLink>
                    ) : (
                      <span className="chip chip-brand">{c.label[lang]}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : null}
            <div data-target-id="erasmus" className="mt-4 flex items-center gap-3 rounded-[14px] bg-[rgb(var(--d-rgb)/0.07)] px-3.5 py-2.5 text-[14px]">
              <Glyph name="globe" className="size-4 shrink-0 text-[var(--d)]" />
              <span className="text-fg">
                {t.erasmus[lang]}
                {has(erasmus.destination) ? ` · ${erasmus.destination[lang]}` : ""}
              </span>
              <span className="ml-auto text-[13px] text-dim">
                {formatMonth(erasmus.start, lang)} – {formatMonth(erasmus.end, lang)}
              </span>
            </div>
          </article>
        </div>

        {/* school */}
        <div className="tl-row brand" style={brandStyle(retamarTone)}>
          <span className="tl-marker" data-tl-marker aria-hidden />
          <div className="tl-when">
            <p className="text-[14px] font-medium text-fg">{formatRange(retamar.start, retamar.end, lang)}</p>
            <p className="mt-0.5 text-[13px] text-dim">{t.school[lang]}</p>
          </div>
          <article id={`edu-${retamar.id}`} data-target-id={retamar.id} className="xp-card scroll-mt-24">
            <div className="flex items-start gap-4">
              <LogoMark src={logoSrc(retamar.brand.logo)} monogram={retamar.brand.monogram} size={44} />
              <div className="min-w-0 flex-1">
                <h3 className="text-[17px] leading-tight text-fg">{retamar.degree[lang]}</h3>
                <p className="mt-1 text-[14.5px] font-medium text-[var(--d)]">{retamar.institution[lang]}</p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {retamar.chips.filter(has).map((c) => (
                    <li key={c.label.en} className="chip chip-brand">
                      {c.label[lang]}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        </div>

        {/* CS50 */}
        <div className="tl-row brand" style={brandStyle(csTone)}>
          <span className="tl-marker" data-tl-marker aria-hidden />
          <div className="tl-when">
            <p className="text-[14px] font-medium text-fg">{t.course[lang]}</p>
            <p className="mt-0.5 text-[13px] text-dim">{cs50.provider}</p>
          </div>
          <article id="edu-cs50" data-target-id="cs50" className="xp-card scroll-mt-24">
            <div className="flex items-start gap-4">
              <LogoMark src={logoSrc(cs50.brand.logo)} monogram={cs50.brand.monogram} size={44} />
              <div className="min-w-0 flex-1">
                <h3 className="text-[17px] leading-tight text-fg">{cs50.name}</h3>
                <p className="mt-1 text-[14.5px]">
                  <span className="font-medium text-[var(--d)]">{cs50.provider}</span>
                  <span className="text-muted"> · {cs50.detail[lang]}</span>
                </p>
                <SkillChips lang={lang} refId="cs50" className="mt-3" />
              </div>
            </div>
          </article>
        </div>

        {/* what comes next */}
        <div className="tl-row" data-accent="pink">
          <span className="tl-marker" data-tl-marker aria-hidden />
          <div className="tl-when">
            <p className="text-[14px] font-medium text-fg">2027 → 2028</p>
          </div>
          <div data-target-id="full-time" className="xp-card xp-card--quiet">
            <FutureCone from={lang === "en" ? "Now" : "Ahora"} to={t.cone[lang]} />
            <p className="mt-2 text-[13.5px] text-dim">{t.coneNote[lang]}</p>
          </div>
        </div>
      </TimelineRail>
    </section>
  );
}
