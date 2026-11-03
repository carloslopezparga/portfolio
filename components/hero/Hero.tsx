import { profile } from "@/content/profile";
import type { Locale } from "@/content/types";
import { copy } from "@/lib/copy";
import { CV_URL } from "@/lib/site";
import { PromptBar } from "@/components/agent/PromptBar";
import { ChipArt } from "./ChipArt";

const icon = (d: string) => (
  <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);

/**
 * Centred hero, Apple style: availability, the name, the tagline in the Apple
 * Intelligence gradient, two lines of summary, the agent and three actions.
 * Underneath, like a product shot, the AI chip.
 */
export function Hero({ lang }: { lang: Locale }) {
  return (
    <section id="top" className="relative overflow-hidden pt-28 sm:pt-36">
      <div className="wrap flex flex-col items-center text-center">
        <p className="inline-flex items-center gap-2.5 rounded-full bg-[var(--card)] py-2 pl-3.5 pr-4 text-[13.5px] font-medium text-fg">
          <span className="pulse-dot" data-accent="green" aria-hidden />
          {profile.availability[lang]}
        </p>
        <h1 className="mt-7 text-[clamp(3rem,10.5vw,6rem)] leading-[0.98] tracking-[-0.045em] text-fg">{profile.name}</h1>
        <p className="text-ai mt-5 max-w-[22ch] pb-1 font-display text-[clamp(1.55rem,3.6vw,2.6rem)] font-semibold leading-[1.12] tracking-[-0.03em]">{profile.tagline[lang]}</p>
        <p className="mt-5 max-w-[640px] text-[17px] leading-relaxed text-muted md:text-[19px]">{profile.summary[lang]}</p>

        <div className="mt-9 w-full max-w-[600px] text-left">
          <PromptBar label={copy.agent.name[lang]} examples={copy.agent.examples[lang]} sendLabel={copy.agent.send[lang]} />
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <a href="#experience" className="btn btn-primary">
            {copy.hero.experience[lang]} {icon("M8 3v9M4.5 8.5 8 12l3.5-3.5")}
          </a>
          <a href={CV_URL} download className="btn btn-secondary">
            {copy.hero.cv[lang]} {icon("M8 3v9M4.5 8.5 8 12l3.5-3.5M3.5 13.5h9")}
          </a>
          <a href={profile.links.linkedin} target="_blank" rel="noreferrer noopener" className="btn btn-secondary">
            LinkedIn {icon("M5 11 11 5M6 5h5v5")}
          </a>
        </div>
      </div>

      <div className="relative mx-auto mt-14 w-full max-w-[560px] px-6 pb-10 md:mt-20">
        <div className="ai-haze" aria-hidden />
        <ChipArt title={copy.hero.chip[lang]} className="relative w-full" />
      </div>
    </section>
  );
}
