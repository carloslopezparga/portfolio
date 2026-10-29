import { profile } from "@/content/profile";
import { has, type Locale } from "@/content/types";
import { photoSrc, readDemo } from "@/lib/assets";
import { copy } from "@/lib/copy";
import { ProjectsGrid, type ProjectItem } from "./ProjectsGrid";
import { SectionHeader, sheetOf } from "./SectionHeader";

export function Projects({ lang }: { lang: Locale }) {
  const t = copy.projects;
  const items: ProjectItem[] = profile.projects.map((p) => {
    let demo: ProjectItem["demo"] = null;
    if (p.demo.kind === "terminal") {
      const script = readDemo(p.demo.file);
      demo = script ? { kind: "terminal", script } : null; // no recorded run → no demo
    } else if (p.demo.kind === "mail-flow") demo = { kind: "mail" };
    else demo = { kind: "cooling" };
    return {
      id: p.id,
      domain: p.domain,
      name: p.name[lang],
      oneLiner: p.oneLiner[lang],
      status: copy.status[p.status][lang],
      problem: p.problem[lang],
      built: p.built[lang],
      next: has(p.next) ? p.next[lang] : null,
      stack: p.stack.map((id) => {
        const s = profile.stack.find((x) => x.id === id)!;
        return { id, label: s.label[lang], domain: s.domain };
      }),
      repo: p.repo ?? null,
      demo,
      screenshot: p.screenshot ? photoSrc(p.screenshot) : null,
    };
  });

  return (
    <section id="projects" data-sheet={sheetOf("projects")} className="relative scroll-mt-20 py-14 md:py-20">
      <SectionHeader id="projects" title={t.title[lang]} intro={t.intro[lang]} />
      <div className="mt-8">
        <ProjectsGrid
          items={items}
          labels={{
            open: t.open[lang],
            openNoDemo: t.openNoDemo[lang],
            close: t.close[lang],
            problem: t.problem[lang],
            built: t.built[lang],
            next: t.next[lang],
            repoSoon: t.repoSoon[lang],
            demoSoon: t.demoSoon[lang],
            realFlow: t.realFlow[lang],
            animated: t.animated[lang],
            view: copy.cursor.view[lang],
            mail: {
              gmail: t.mail.gmail[lang],
              claude: t.mail.claude[lang],
              digest: t.mail.digest[lang],
              inbox: t.mail.inbox[lang],
              search: t.mail.search[lang],
              telegram: t.mail.telegram[lang],
              tailored: t.mail.tailored[lang],
              building: t.mail.building[lang],
              steps: t.mail.steps[lang] as [string, string, string, string],
            },
            cooling: {
              illustrative: t.illustrative[lang],
              x: t.cooling.x[lang],
              y: t.cooling.y[lang],
              baseline: t.cooling.baseline[lang],
              best: t.cooling.best[lang],
              gen: "GEN",
            },
          }}
        />
      </div>
    </section>
  );
}
