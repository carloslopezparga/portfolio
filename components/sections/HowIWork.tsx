import { profile } from "@/content/profile";
import type { Locale } from "@/content/types";
import { copy } from "@/lib/copy";
import { HowSteps } from "./HowSteps";
import { SectionHeader } from "./SectionHeader";

/**
 * How I work, right under the hero: three steps in a row (a column on
 * phones). On desktop the cloud forms a figure for the active step beside the
 * title: a funnel of loose points (detect), a pipeline (automate) and a bar
 * chart (measure). No figures here: those are in the experience and project cards.
 */
export function HowIWork({ lang }: { lang: Locale }) {
  const t = copy.how;
  return (
    <section id="how" className="section [--pad-top:80px] md:[--pad-top:112px]">
      <SectionHeader eyebrow={t.eyebrow[lang]} title={t.title[lang]} intro={t.intro[lang]} figures={["funnel", "flow", "bars"]} wide />
      <HowSteps steps={profile.method.map((s) => ({ id: s.id, title: s.title[lang], text: s.text[lang] }))} />
    </section>
  );
}
