import { profile } from "@/content/profile";
import type { Locale } from "@/content/types";
import { copy } from "@/lib/copy";
import { FigureGap } from "@/components/figures/FigureGap";
import { HowSteps } from "./HowSteps";

/**
 * How I work, between Education and Projects. Desktop: two columns that fit
 * one screen: the title and the three steps as a vertical stepper on the
 * left, and on the right a large gap where the cloud forms the active step's
 * figure: a funnel that loose points sink into (detect), a pipeline (automate)
 * and a bar chart (measure). Phones and tablets: the steps as cards, no
 * figure. No figures of the other kind here either: those are in the
 * experience and project cards.
 */
export function HowIWork({ lang }: { lang: Locale }) {
  const t = copy.how;
  return (
    <section id="how" className="section [--pad-top:80px] md:[--pad-top:112px]">
      <div className="wrap how">
        <div>
          <header suppressHydrationWarning className="reveal reveal-rise">
            <p className="eyebrow">{t.eyebrow[lang]}</p>
            <h2 className="mt-3 text-[clamp(2.25rem,5.2vw,3.9rem)] leading-[1.04] text-fg">{t.title[lang]}</h2>
            <p className="mt-5 text-[17px] leading-relaxed text-fg md:text-[19px]">{t.intro[lang]}</p>
          </header>
          <HowSteps steps={profile.method.map((s) => ({ id: s.id, title: s.title[lang], text: s.text[lang] }))} />
        </div>
        <FigureGap figures={["funnel", "flow", "bars"]} className="how-fig" />
      </div>
    </section>
  );
}
