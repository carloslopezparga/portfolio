import { profile } from "@/content/profile";
import type { Locale } from "@/content/types";
import { copy } from "@/lib/copy";
import { CV_URL } from "@/lib/site";
import { PromptBar } from "@/components/agent/PromptBar";
import { Figures } from "@/components/figures/Figures";
import { MotionToggle } from "./MotionToggle";

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
 * Hero. Desktop: the name on one line, centred over the full width, the
 * availability right under it, then two columns: tagline, summary, the agent
 * and the actions on the left, and the chip (a point cloud, ~500 px) on the
 * right, centred on the text column and reaching a little above and below
 * it. The whole hero fits the first screen. Phones: everything centred and
 * the chip, compact, under the buttons.
 */
export function Hero({ lang }: { lang: Locale }) {
  // «Open to internships 2027 · Full-time from Jan 2028»: the first part in ink, the rest grey
  const [now, ...rest] = profile.availability[lang].split(" · ");
  const later = rest.join(" · ");
  return (
    <section id="top" className="relative overflow-x-clip pt-24 sm:pt-[clamp(96px,12vh,124px)]">
      <div className="wrap">
        <h1 className="text-center text-[clamp(2.75rem,min(10.5vw,10.5vh),6rem)] leading-[0.98] tracking-[-0.045em] text-fg lg:whitespace-nowrap">{profile.name}</h1>
        <p className="mt-4 text-center text-[14px] leading-snug md:text-[15px] lg:mt-6">
          <span className="pulse-dot mr-2" data-accent="green" aria-hidden />
          <span className="font-medium text-fg">{now}</span>
          {later ? (
            <>
              <span className="text-muted max-sm:hidden"> · </span>
              <span className="text-muted max-sm:mt-0.5 max-sm:block">{later}</span>
            </>
          ) : null}
        </p>

        <div className="hero-grid mt-7 grid gap-y-8 md:mt-9 lg:mt-[clamp(20px,4vh,40px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.78fr)] lg:gap-x-12">
          <div className="relative z-[1] text-center lg:self-center lg:text-left">
            <Tagline text={profile.tagline[lang]} className="mx-auto max-w-[24ch] text-balance font-display text-[clamp(1.5rem,min(3vw,4.4vh),2.4rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-fg lg:mx-0" />
            <p className="mx-auto mt-4 max-w-[62ch] text-[16px] leading-relaxed text-fg md:text-[17px] lg:mx-0">{profile.summary[lang]}</p>

            <div className="mx-auto mt-7 w-full max-w-[600px] text-left md:mt-8 lg:mx-0">
              <PromptBar label={copy.agent.name[lang]} examples={copy.agent.examples[lang]} sendLabel={copy.agent.send[lang]} />
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
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

          {/* The chip: a box of its own on phones (≤ 40 % of the screen height); on desktop a square centred on the row (globals.css, .hero-grid). */}
          <div className="relative h-[min(40svh,340px)] lg:h-auto">
            <div className="chip-cell">
              <div className="chip-square">
                <div className="chip-stage" data-figure="chip" role="img" aria-label={copy.hero.chip[lang]}>
                  <span className="chip-poster chip-poster-live" aria-hidden />
                  <span className="chip-poster chip-poster-still" aria-hidden />
                  <span className="chip-poster chip-poster-cores" aria-hidden />
                  <Figures />
                  {/* what the pointer touches: hover, drag and click (the canvas itself takes no events) */}
                  <span className="fig-zone chip-zone" data-figure-zone aria-hidden />
                </div>
                <MotionToggle label={copy.hero.pause[lang]} className="chip-pause" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
