import { profile, refLabels, refTone } from "@/content/profile";
import type { Locale, RefId } from "@/content/types";
import { brandOf } from "@/lib/assets";
import { copy } from "@/lib/copy";
import { constellationLayout, links } from "@/lib/constellation";
import { Constellation, type CNode, type CStar } from "./Constellation";
import { SectionHeader, sheetOf } from "./SectionHeader";

/** Where a node's click leads: its card elsewhere on the page. */
const CARD: Partial<Record<RefId, string>> = { giti: "upm", cs50: "cs50" };

export async function Skills({ lang }: { lang: Locale }) {
  const t = copy.skills;
  const domainLabel = Object.fromEntries(profile.domains.map((d) => [d.id, d.label[lang]])) as Record<string, string>;
  const stars: CStar[] = [
    ...profile.stack.map((s) => ({ id: s.id, label: s.label[lang], cluster: s.domain, kind: "skill" as const })),
    ...profile.languages.map((l) => ({ id: `lang-${l.id}`, label: l.name[lang], sub: l.level[lang], cluster: "languages" as const, kind: "language" as const })),
  ];
  const projectIds = profile.projects.map((p) => p.id as RefId);
  const workIds = profile.experience.map((e) => e.id as RefId);
  const nodes: CNode[] = await Promise.all(
    (Object.keys(refLabels) as RefId[]).map(async (id) => {
      const tone = refTone[id];
      const kind: CNode["kind"] = projectIds.includes(id) ? "project" : workIds.includes(id) ? "work" : id === "giti" || id === "cs50" ? "study" : "other";
      return {
        id,
        label: refLabels[id][lang],
        domain: "domain" in tone ? tone.domain : null,
        tone: "brand" in tone ? await brandOf(tone.brand, tone.fallback) : null,
        kind,
        kindLabel: kind === "work" ? copy.experience.title[lang] : kind === "study" ? copy.education.title[lang] : "domain" in tone ? domainLabel[tone.domain] : "",
        card: kind === "work" ? id : (CARD[id] ?? null),
      };
    }),
  );

  return (
    <section id="skills" data-sheet={sheetOf("skills")} className="relative scroll-mt-20 py-14 md:py-20">
      <SectionHeader
        id="skills"
        title={t.title[lang]}
        intro={
          <>
            <span className="touch:hidden">{t.intro[lang]}</span>
            <span className="hidden touch:inline">{t.introTouch[lang]}</span>
          </>
        }
      />
      <div className="mt-6">
        <Constellation
          landscape={constellationLayout("landscape")}
          portrait={constellationLayout("portrait")}
          stars={stars}
          nodes={nodes}
          links={links()}
          labels={{
            usedIn: t.usedIn[lang],
            uses: t.uses[lang],
            filter: t.filter[lang],
            clear: t.clear[lang],
            inspector: t.inspector[lang],
            pick: t.pick[lang],
            go: t.go[lang],
            close: copy.projects.close[lang],
            list: t.list[lang],
            clusters: {
              ai: domainLabel.ai,
              automation: domainLabel.automation,
              data: domainLabel.data,
              ops: domainLabel.ops,
              software: domainLabel.software,
              languages: t.languages[lang],
            },
          }}
        />
      </div>
    </section>
  );
}
