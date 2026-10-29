import { profile } from "@/content/profile";
import type { Locale } from "@/content/types";
import { copy } from "@/lib/copy";
import { PromptBar } from "@/components/agent/PromptBar";
import { Gearbox2D } from "./Gearbox2D";
import { HeroVisual } from "./HeroVisual";

const arrow = (d: string) => (
  <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);

/** Straight to the point: who, what, and three ways to go further. The gearbox is decoration. */
export function Hero({ lang }: { lang: Locale }) {
  return (
    <section id="top" className="relative scroll-mt-16 pb-14 pt-24 md:pb-20 md:pt-32 lg:min-h-[min(100svh,880px)] lg:pt-28">
      <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-5 sm:px-8 lg:min-h-[calc(min(100svh,880px)-12rem)] lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)] lg:gap-6">
        <div>
          <p className="material inline-flex items-center gap-2.5 rounded-full py-1.5 pl-3 pr-4 text-[13px] text-muted">
            <span className="pulse-dot" data-accent="green" aria-hidden />
            {profile.availability[lang]}
          </p>
          <h1 className="mt-6 text-[clamp(2.7rem,7vw,5.4rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-fg">{profile.name}</h1>
          <p className="text-gradient mt-4 text-[clamp(1.2rem,2.2vw,1.6rem)] font-medium leading-snug tracking-[-0.02em]">{profile.tagline[lang]}</p>
          <p className="mt-4 max-w-[62ch] text-[16px] leading-relaxed text-muted md:text-[17px]">{profile.summary[lang]}</p>

          <div className="mt-8 max-w-[620px]">
            <PromptBar label={copy.agent.prompt[lang]} examples={copy.agent.examples[lang]} sendLabel={copy.agent.send[lang]} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href="#experience" className="btn btn-ghost btn-sm">
              {copy.hero.experience[lang]} {arrow("M8 3v9M4.5 8.5 8 12l3.5-3.5")}
            </a>
            <a href={`/api/cv?lang=${lang}`} download className="btn btn-ghost btn-sm">
              {copy.hero.cv[lang]} {arrow("M8 3v9M4.5 8.5 8 12l3.5-3.5")}
            </a>
            <a href={profile.links.linkedin} target="_blank" rel="noreferrer noopener" className="btn btn-ghost btn-sm">
              LinkedIn {arrow("M5 11 11 5M6 5h5v5")}
            </a>
          </div>
        </div>

        <HeroVisual>
          <Gearbox2D className="size-full" />
        </HeroVisual>
      </div>
    </section>
  );
}
