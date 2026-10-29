import { profile } from "@/content/profile";
import type { Locale } from "@/content/types";
import { copy } from "@/lib/copy";
import { PromptBar } from "@/components/agent/PromptBar";
import { Scramble } from "@/components/ui/Scramble";

/** Borders of the 4 metadata cells: one row on mobile, 2×2 from md. */
const CELL = ["md:border-b", "border-l md:border-b", "border-l md:border-l-0", "border-l"];

/**
 * The hero's title block, drawn like the cajetín of an engineering sheet:
 * name, tagline (decodes once), subtitle, REV / SHEET / SCALE / DATE, and the
 * prompt to the agent in place of a row of buttons.
 */
export function HeroTitleBlock({ lang, date }: { lang: Locale; date: string }) {
  const meta = [
    [copy.sheet.rev[lang], "A"],
    [copy.sheet.sheet[lang], "01 / 06"],
    [copy.sheet.scale[lang], "1:1"],
    [lang === "en" ? "Date" : "Fecha", date],
  ];
  return (
    <div className="px-4 pb-4 sm:px-6 md:px-8 md:pb-6">
      <div className="tb mx-auto grid max-w-[1400px] overflow-hidden md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_auto]">
        {/* identity */}
        <div className="tb-cell border-b p-4 md:border-b-0 md:border-r md:p-5">
          <p className="mono-label">{lang === "en" ? "Title" : "Título"}</p>
          <h1 className="mt-1.5 text-[clamp(1.55rem,2.4vw,2.3rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-fg">{profile.name}</h1>
          <p className="mono-label mt-2 flex items-center gap-2">
            <span className="size-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_8px_rgb(var(--glow))]" aria-hidden />
            <span>
              {profile.location[lang]} · {profile.availability[lang]}
            </span>
          </p>
        </div>
        {/* statement */}
        <div className="tb-cell border-b p-4 md:border-b-0 md:border-r md:p-5">
          <p className="text-[clamp(1.15rem,1.65vw,1.55rem)] font-medium leading-[1.2] tracking-[-0.02em] text-fg">
            <Scramble text={profile.tagline[lang]} trigger="mount" mode="sweep" delay={250} duration={1100} />
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">{profile.subtitle[lang]}</p>
        </div>
        {/* sheet metadata */}
        <dl className="grid grid-cols-4 md:w-[230px] md:grid-cols-2">
          {meta.map(([k, v], i) => (
            <div key={k} className={`tb-cell px-3 py-2.5 md:px-4 ${CELL[i]}`}>
              <dt className="mono-label !text-[9.5px]">{k}</dt>
              <dd className="mt-0.5 font-mono text-[12px] text-fg">{v}</dd>
            </div>
          ))}
        </dl>
        {/* prompt row */}
        <div className="tb-cell flex flex-col gap-3 border-t p-3 sm:flex-row sm:items-center md:col-span-3 md:p-3.5">
          <div className="min-w-0 flex-1">
            <PromptBar label={copy.agent.prompt[lang]} examples={copy.agent.examples[lang]} sendLabel={copy.agent.send[lang]} />
          </div>
          <a
            href={`/api/cv?lang=${lang}`}
            download
            className="group mono-label inline-flex shrink-0 items-center justify-center gap-1.5 self-center rounded-full px-4 py-2.5 !text-fg"
          >
            {copy.hero.cv[lang]}
            <svg viewBox="0 0 16 16" className="size-3.5 transition-transform duration-300 group-hover:translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M8 3v9M4.5 8.5 8 12l3.5-3.5" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
