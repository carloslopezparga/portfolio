import { profile, refLabels } from "@/content/profile";
import type { Locale, RefId } from "@/content/types";
import { copy } from "@/lib/copy";
import { constellationLayout, links } from "@/lib/constellation";
import { Constellation, type CNode, type CStar } from "./Constellation";
import { SectionHeader } from "./SectionHeader";

export function Toolkit({ lang }: { lang: Locale }) {
  const t = copy.toolkit;
  const domainLabel = Object.fromEntries(profile.domains.map((d) => [d.id, d.label[lang]]));
  const stars: CStar[] = [
    ...profile.stack.map((s) => ({ id: s.id, label: s.label[lang], cluster: s.domain, kind: "skill" as const })),
    ...profile.languages.map((l) => ({ id: `lang-${l.id}`, label: l.name[lang], sub: l.level[lang], cluster: "languages" as const, kind: "language" as const })),
  ];
  const projectIds = profile.projects.map((p) => p.id as RefId);
  const workIds = profile.experience.map((e) => e.id as RefId);
  const nodes: CNode[] = (Object.keys(refLabels) as RefId[]).map((id) => ({
    id,
    label: refLabels[id][lang],
    domain: constellationLayout("landscape").nodes.find((n) => n.id === id)!.domain,
    kind: projectIds.includes(id) ? "project" : workIds.includes(id) ? "work" : "other",
  }));

  return (
    <section id="toolkit" data-sheet="4" className="relative scroll-mt-16 py-20 md:flex md:min-h-[100svh] md:flex-col md:justify-center md:py-16">
      <SectionHeader
        index={4}
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
            close: copy.trajectory.close[lang],
            list: t.list[lang],
            clusters: {
              ai: domainLabel.ai,
              automation: domainLabel.automation,
              data: domainLabel.data,
              ops: domainLabel.ops,
              engineering: domainLabel.engineering,
              languages: t.languages[lang],
            },
          }}
        />
      </div>
    </section>
  );
}
