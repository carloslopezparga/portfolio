import { profile, refLabels, refTone } from "@/content/profile";
import type { Locale, RefId } from "@/content/types";
import { brandOf, logoSrc } from "@/lib/assets";
import { brandStyle } from "@/lib/brand";
import { copy } from "@/lib/copy";
import { graphLayout } from "@/lib/graph";
import { stackColor, type GlyphName } from "@/components/ui/icons";
import { SectionHeader } from "./SectionHeader";
import { SkillsGraph, type GraphRef, type GraphSkill } from "./SkillsGraph";

/** Where a node's click leads: its card elsewhere on the page. */
const CARD: Partial<Record<RefId, string>> = { giti: "upm", cs50: "cs50" };
const GLYPH: Partial<Record<RefId, GlyphName>> = {
  "job-hunt-copilot": "briefcase",
  "mail-autopilot": "mail",
  "cooling-agent": "fan",
  "cs50-ai": "chip",
  "this-site": "globe",
};

export async function Skills({ lang }: { lang: Locale }) {
  const t = copy.skills;
  const domainLabel = Object.fromEntries(profile.domains.map((d) => [d.id, d.label[lang]])) as Record<string, string>;
  const skills: GraphSkill[] = profile.stack.map((s) => ({
    id: s.id,
    label: s.label[lang],
    domain: s.domain,
    domainLabel: domainLabel[s.domain],
    color: stackColor(s.id),
    usedIn: s.usedIn.map((u) => (typeof u === "string" ? { id: u, w: 1 } : { id: u.id, w: u.w })),
  }));
  const projectIds = profile.projects.map((p) => p.id as RefId);
  const workIds = profile.experience.map((e) => e.id as RefId);
  const refIds = (Object.keys(refLabels) as RefId[]).filter((id) => skills.some((s) => s.usedIn.some((u) => u.id === id)));
  const refs: GraphRef[] = await Promise.all(
    refIds.map(async (id) => {
      const tone = refTone[id];
      const kind = projectIds.includes(id) ? "project" : workIds.includes(id) ? "work" : id === "giti" || id === "cs50" ? "study" : "other";
      return {
        id,
        label: refLabels[id][lang],
        kindLabel: kind === "work" ? copy.experience.title[lang] : kind === "study" ? copy.education.title[lang] : kind === "project" ? copy.projects.title[lang] : t.site[lang],
        logo: "brand" in tone ? logoSrc(tone.brand.logo) : null,
        monogram: "brand" in tone ? tone.brand.monogram : null,
        glyph: GLYPH[id] ?? null,
        domain: "domain" in tone ? tone.domain : null,
        brand: "brand" in tone ? brandStyle(await brandOf(tone.brand)) : null,
        card: kind === "work" || kind === "project" ? id : (CARD[id] ?? null),
      };
    }),
  );

  return (
    <section id="skills" className="section section-alt">
      <SectionHeader
        eyebrow={t.eyebrow[lang]}
        title={t.title[lang]}
        intro={
          <>
            <span className="touch:hidden">{t.intro[lang]}</span>
            <span className="hidden touch:inline">{t.introTouch[lang]}</span>
          </>
        }
      />
      <div className="wrap mt-10 md:mt-12">
        <SkillsGraph skills={skills} refs={refs} layout={graphLayout(skills, refIds)} labels={{ usedIn: t.usedIn[lang], uses: t.uses[lang], close: copy.projects.close[lang], tour: t.title[lang] }} />

        <div className="mt-6">
          <p className="mono-label">{t.languages[lang]}</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {profile.languages.map((l) => (
              <li key={l.id} data-target-id={`lang-${l.id}`} className="chip">
                <span className="font-semibold">{l.name[lang]}</span>
                <span className="text-muted">{l.level[lang]}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
