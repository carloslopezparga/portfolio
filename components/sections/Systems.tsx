import { profile } from "@/content/profile";
import { has, type Locale } from "@/content/types";
import { photoSrc, readDemo } from "@/lib/assets";
import { copy } from "@/lib/copy";
import { SectionHeader } from "./SectionHeader";
import { SystemsSwitcher, type SystemItem } from "./SystemsSwitcher";

export function Systems({ lang }: { lang: Locale }) {
  const stackLabel = Object.fromEntries(profile.stack.map((s) => [s.id, s.label[lang]]));
  const items: SystemItem[] = profile.projects.map((p) => {
    let demo: SystemItem["demo"] = null;
    if (p.demo.kind === "terminal") {
      const script = readDemo(p.demo.file);
      demo = script ? { kind: "terminal", script, sample: false } : null; // no file → no demo
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
      stack: p.stack.map((id) => ({ id, label: stackLabel[id] })),
      repo: p.repo ?? null,
      demo,
      screenshot: p.screenshot ? photoSrc(p.screenshot) : null,
    };
  });

  const s = copy.systems;
  return (
    <section id="systems" data-sheet="2" className="relative scroll-mt-16 py-20 md:flex md:min-h-[100svh] md:flex-col md:justify-center md:py-16">
      <SectionHeader index={2} title={s.title[lang]} intro={s.intro[lang]} />
      <div className="mt-8 md:mt-10">
        <SystemsSwitcher
          items={items}
          labels={{
            problem: s.problem[lang],
            built: s.built[lang],
            next: s.next[lang],
            stack: s.stack[lang],
            repoSoon: s.repoSoon[lang],
            realFlow: s.realFlow[lang],
            animated: s.animated[lang],
            view: copy.cursor.view[lang],
            mail: {
              gmail: s.mail.gmail[lang],
              claude: s.mail.claude[lang],
              digest: s.mail.digest[lang],
              inbox: s.mail.inbox[lang],
              search: s.mail.search[lang],
              telegram: s.mail.telegram[lang],
              tailored: s.mail.tailored[lang],
              building: s.mail.building[lang],
              steps: s.mail.steps[lang] as [string, string, string, string],
            },
            cooling: {
              illustrative: s.illustrative[lang],
              x: s.cooling.x[lang],
              y: s.cooling.y[lang],
              baseline: s.cooling.baseline[lang],
              best: s.cooling.best[lang],
              gen: "GEN",
            },
          }}
        />
      </div>
    </section>
  );
}
