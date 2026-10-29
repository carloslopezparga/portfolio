import type { CSSProperties } from "react";
import { profile } from "@/content/profile";
import type { Locale } from "@/content/types";
import { ui } from "@/lib/i18n";
import { ArrowDown, ArrowRight } from "@/components/ui/FancyLink";
import { Magnetic } from "@/components/ui/Magnetic";
import { Scramble } from "@/components/ui/Scramble";
import { SplitChars } from "@/components/ui/SplitChars";

/**
 * Hero text block, bottom-left. Name reveals with pure CSS; tagline and the
 * status line decode; subtitle and CTAs rise in. `play={false}` holds the CSS
 * reveal until a parent flips data-play (used by /lab).
 */
export function HeroCopy({ lang, play = true, projectsHref = "#projects" }: { lang: Locale; play?: boolean; projectsHref?: string }) {
  const [first, ...rest] = profile.name.split(" ");
  const status = `${profile.location[lang]} · ${profile.coordinates} · ${profile.availability[lang]}`.toUpperCase();
  const statusShort = `${profile.location[lang]} · ${profile.availability[lang]}`.toUpperCase();

  return (
    <div data-play={play ? "true" : "false"} className="hero-copy pointer-events-none relative z-10 flex min-h-[100svh] flex-col justify-between px-5 pb-10 pt-24 sm:px-8 md:px-12 md:pb-14">
      <div className="mono-label flex items-center gap-2.5">
        <span className="relative flex size-1.5" aria-hidden>
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60 reduced:hidden" />
          <span className="relative inline-flex size-1.5 rounded-full bg-accent shadow-[0_0_10px_rgb(var(--glow))]" />
        </span>
        <Scramble text={status} trigger="mount" delay={250} duration={1100} className="!hidden md:!inline-block" />
        <Scramble text={statusShort} trigger="mount" delay={250} duration={1100} className="md:!hidden" />
      </div>

      <div className="max-w-[min(100%,1200px)]">
        <h1
          aria-label={profile.name}
          className="font-display text-[clamp(3.1rem,10.5vw,9.75rem)] leading-[0.9] text-fg"
        >
          <SplitChars lines={[first, rest.join(" ")]} />
        </h1>

        <p className="mt-6 max-w-[34ch] text-[clamp(1.25rem,2.4vw,2rem)] font-medium leading-[1.15] tracking-[-0.02em] text-fg md:mt-8">
          <Scramble text={profile.tagline[lang]} trigger="mount" mode="sweep" delay={200} duration={1100} />
        </p>
        <p className="rise mt-4 max-w-[60ch] text-[15px] leading-relaxed text-muted md:text-base" style={{ "--d": "380ms" } as CSSProperties}>
          {profile.subtitle[lang]}
        </p>

        <div className="rise pointer-events-auto mt-8 flex flex-wrap items-center gap-3" style={{ "--d": "520ms" } as CSSProperties}>
          <Magnetic>
            <a href={projectsHref} className="btn btn-primary" data-cursor={ui.cursor.view[lang]}>
              {ui.viewProjects[lang]}
              <ArrowDown className="size-4" />
            </a>
          </Magnetic>
          <Magnetic>
            <button type="button" data-action="chat" className="btn btn-ghost" data-cursor={ui.cursor.open[lang]}>
              <span className="size-1.5 rounded-full bg-accent shadow-[0_0_8px_rgb(var(--glow))]" aria-hidden />
              {ui.talkToAI[lang]}
            </button>
          </Magnetic>
          <Magnetic>
            <a href={`/api/cv?lang=${lang}`} data-action="cv" className="btn btn-ghost" data-cursor="PDF">
              {ui.downloadCV[lang]}
              <ArrowRight className="size-4 rotate-90" />
            </a>
          </Magnetic>
        </div>
      </div>
    </div>
  );
}
