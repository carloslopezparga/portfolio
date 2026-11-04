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

/** The tagline in solid ink; only the word «automated / automatizados» takes the accent colour. */
function Tagline({ text, className }: { text: string; className: string }) {
  const parts = text.split(/(automat\p{L}*)/iu);
  return <p className={className}>{parts.map((p, i) => (i % 2 ? <span key={i} className="text-[var(--accent)]">{p}</span> : p))}</p>;
}

/**
 * Asymmetric hero. Desktop: the text on the left (name, availability as a
 * quiet line of metadata, tagline, summary, the agent and three actions) and
 * the AI chip on the right, at the height of the text and whole within the
 * first screen. Phones and tablets: the chip underneath.
 */
export function Hero({ lang }: { lang: Locale }) {
  return (
    <section id="top" className="relative overflow-hidden pt-24 sm:pt-[clamp(104px,14vh,136px)]">
      <div className="wrap grid items-center gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:gap-x-14">
        <div>
          <h1 className="text-[clamp(2.75rem,min(7.2vw,11vh),5.75rem)] leading-[0.96] tracking-[-0.045em] text-fg">{profile.name}</h1>
          <p className="mt-4 text-[14px] font-medium text-muted md:text-[15px]">
            <span className="mr-2 inline-block size-1.5 rounded-full bg-[rgb(var(--green-rgb))] align-[0.15em]" aria-hidden />
            {profile.availability[lang]}
          </p>
          <Tagline text={profile.tagline[lang]} className="mt-6 max-w-[24ch] font-display text-[clamp(1.5rem,min(3vw,4.4vh),2.4rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-fg md:mt-8" />
          <p className="mt-4 max-w-[62ch] text-[16px] leading-relaxed text-fg md:text-[17px]">{profile.summary[lang]}</p>

          <div className="mt-7 w-full max-w-[600px] md:mt-8">
            <PromptBar label={copy.agent.name[lang]} examples={copy.agent.examples[lang]} sendLabel={copy.agent.send[lang]} />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
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

        {/* The chip, on one flat, very soft disc instead of a coloured glow. */}
        <div className="relative mx-auto w-full max-w-[min(78vw,330px)] sm:max-w-[380px] lg:max-w-[min(100%,52vh)]">
          <div className="chip-plate" aria-hidden />
          <ChipStage>
            <ChipArt title={copy.hero.chip[lang]} className="relative block w-full" />
          </ChipStage>
        </div>
      </div>
    </section>
  );
}
