import { profile } from "@/content/profile";
import type { Locale } from "@/content/types";
import { copy } from "@/lib/copy";
import { CV_URL } from "@/lib/site";
import { PromptBar } from "@/components/agent/PromptBar";
import { ChipArt } from "./ChipArt";
import { ChipStage } from "./ChipStage";

const icon = (d: string) => (
  <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);

/**
 * Centred hero, Apple style: availability, the name, the tagline in the Apple
 * Intelligence gradient, the summary, the agent and three actions. Right
 * underneath, like a product shot, the AI chip: it already shows in the first
 * screen and the whole hero stays around 1.3 screens tall (sizes follow the
 * viewport height on desktop).
 */
export function Hero({ lang }: { lang: Locale }) {
  return (
    <section id="top" className="relative overflow-hidden pt-20 sm:pt-[clamp(96px,12vh,124px)]">
      <div className="wrap flex flex-col items-center text-center">
        <p className="inline-flex items-center gap-2.5 rounded-full bg-[var(--card)] py-2 pl-3.5 pr-4 text-[13.5px] font-medium text-fg">
          <span className="pulse-dot" data-accent="green" aria-hidden />
          {profile.availability[lang]}
        </p>
        <h1 className="mt-5 text-[clamp(2.75rem,min(10.5vw,10.5vh),6rem)] leading-[0.98] tracking-[-0.045em] text-fg md:mt-6">{profile.name}</h1>
        <p className="text-ai mt-3 max-w-[22ch] pb-1 font-display text-[clamp(1.5rem,min(3.4vw,4.6vh),2.5rem)] font-semibold leading-[1.12] tracking-[-0.03em] md:mt-4">{profile.tagline[lang]}</p>
        <p className="mt-3 max-w-[680px] text-[16px] leading-relaxed text-fg md:mt-4 md:max-w-[800px] md:text-[17px]">{profile.summary[lang]}</p>

        <div className="mt-6 w-full max-w-[600px] text-left md:mt-8">
          <PromptBar label={copy.agent.name[lang]} examples={copy.agent.examples[lang]} sendLabel={copy.agent.send[lang]} />
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <a href="#experience" className="btn btn-primary max-sm:!h-11">
            {copy.hero.experience[lang]} {icon("M8 3v9M4.5 8.5 8 12l3.5-3.5")}
          </a>
          <a href={CV_URL} download className="btn btn-secondary max-sm:!h-11">
            {copy.hero.cv[lang]} {icon("M8 3v9M4.5 8.5 8 12l3.5-3.5M3.5 13.5h9")}
          </a>
          <a href={profile.links.linkedin} target="_blank" rel="noreferrer noopener" className="btn btn-secondary max-sm:!h-11">
            LinkedIn {icon("M5 11 11 5M6 5h5v5")}
          </a>
        </div>
      </div>

      {/* The chip, like a product shot: it starts within the first screen. */}
      <div className="relative mx-auto mt-6 w-full max-w-[min(78vw,330px)] sm:max-w-[min(420px,46vh)] md:mt-8">
        <div className="ai-haze" aria-hidden />
        <ChipStage>
          <ChipArt title={copy.hero.chip[lang]} className="relative block w-full" />
        </ChipStage>
      </div>
    </section>
  );
}
