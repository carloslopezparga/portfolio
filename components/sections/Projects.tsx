import { profile } from "@/content/profile";
import { has, type Locale } from "@/content/types";
import { photoSrc, readDemo } from "@/lib/assets";
import { copy, mediaLabels } from "@/lib/copy";
import { formatMonth } from "@/lib/i18n";
import { mediaFor, projectLoop } from "@/lib/media";
import { isSkill, metricSuffix } from "@/lib/metrics";
import { ProjectsRow, type ProjectItem } from "./ProjectsRow";
import { SectionHeader } from "./SectionHeader";

export async function Projects({ lang }: { lang: Locale }) {
  const t = copy.projects;
  const media = await Promise.all(profile.projects.map((p) => mediaFor("projects", p.id, lang)));
  const loops = await Promise.all(profile.projects.map((p) => projectLoop(p.id, lang)));
  const items: ProjectItem[] = profile.projects.map((p, i) => {
    let demo: ProjectItem["demo"] = null;
    if (p.demo?.kind === "terminal") {
      const script = readDemo(p.demo.file);
      demo = script ? { kind: "terminal", script } : null; // no recorded run → no demo
    } else if (p.demo?.kind === "mail-flow") demo = { kind: "mail" };
    else if (p.demo?.kind === "cooling") demo = { kind: "cooling" };
    return {
      id: p.id,
      domain: p.domain,
      name: p.name[lang],
      oneLiner: p.oneLiner[lang],
      status: p.status === "done" && p.date ? `${copy.status.done[lang]} · ${formatMonth(p.date, lang)}` : copy.status[p.status][lang],
      problem: p.problem[lang],
      built: p.built[lang],
      next: has(p.next) ? p.next[lang] : null,
      stack: p.stack.map((ref) => {
        if (!isSkill(ref)) return { id: null, label: ref.label, domain: null };
        const s = profile.stack.find((x) => x.id === ref)!;
        return { id: ref, label: s.label[lang], domain: s.domain };
      }),
      metrics: (p.metrics ?? []).map((m) => ({ value: m.value, prefix: m.prefix ?? "", suffix: metricSuffix(m, lang), label: m.label[lang] })),
      repo: p.repo ?? null,
      demo,
      screenshot: p.screenshot ? photoSrc(p.screenshot) : null,
      media: media[i],
      loop: loops[i],
    };
  });

  return (
    <section id="projects" className="section">
      <SectionHeader eyebrow={t.eyebrow[lang]} title={t.title[lang]} intro={t.intro[lang]} />
      <div className="mt-12 md:mt-14">
        <ProjectsRow
          lang={lang}
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
            row: t.title[lang],
            rowPrev: copy.carousel.prev[lang],
            rowNext: copy.carousel.next[lang],
            media: mediaLabels(lang),
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
