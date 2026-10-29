import type { ReactNode } from "react";
import type { Locale, Project } from "@/content/types";
import { t, ui } from "@/lib/i18n";
import { FancyLink } from "@/components/ui/FancyLink";
import { StackIcon, stackColor } from "@/components/ui/icons";
import { TiltCard } from "@/components/ui/TiltCard";

const STATUS_DOT = { live: "bg-[#3ddc97]", building: "bg-accent", rnd: "bg-ice" } as const;

/** Case study: problem → what I built → stack → status, next to a live demo. */
export function ProjectPanel({
  project,
  index,
  lang,
  demo,
  labels,
  stackLabels,
}: {
  project: Project;
  index: number;
  lang: Locale;
  demo: ReactNode | null;
  labels: { problem: string; built: string; next: string; stack: string };
  stackLabels: Record<string, string>;
}) {
  const next = t(project.next, lang);
  return (
    <article className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-14">
      <div>
        <p className="mono-label flex items-center gap-3">
          <span className="text-accent">P-{String(index).padStart(2, "0")}</span>
          <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 shadow-[inset_0_0_0_1px_var(--line-strong)]">
            <span className={`size-1.5 rounded-full ${STATUS_DOT[project.status]} shadow-[0_0_8px_currentColor]`} />
            {ui.status[project.status][lang]}
          </span>
        </p>
        <h3 className="mt-4 text-[clamp(1.9rem,3.4vw,2.9rem)] leading-[1.02] text-fg">{project.name[lang]}</h3>
        <dl className="mt-7 space-y-5">
          <div>
            <dt className="mono-label">{labels.problem}</dt>
            <dd className="mt-1.5 max-w-[56ch] text-[15px] leading-relaxed text-muted">{project.problem[lang]}</dd>
          </div>
          <div>
            <dt className="mono-label">{labels.built}</dt>
            <dd className="mt-1.5 max-w-[56ch] text-[15px] leading-relaxed text-fg">{project.built[lang]}</dd>
          </div>
          {next ? (
            <div>
              <dt className="mono-label">{labels.next}</dt>
              <dd className="mt-1.5 max-w-[56ch] text-[15px] leading-relaxed text-muted">{next}</dd>
            </div>
          ) : null}
        </dl>
        <div className="mt-7 flex flex-wrap items-center gap-2">
          {project.stack.map((s) => (
            <span key={s} className="flex items-center gap-2 rounded-full py-1.5 pl-2 pr-3 text-[13px] text-muted shadow-[inset_0_0_0_1px_var(--line)]">
              <span style={{ color: stackColor(s) }}>
                <StackIcon id={s} className="size-4" />
              </span>
              {stackLabels[s]}
            </span>
          ))}
        </div>
        {project.repo ? (
          <div className="mt-6 text-[14px]">
            {project.repo.public ? (
              <FancyLink href={project.repo.url} external cursor={ui.cursor.open[lang]}>
                GitHub
              </FancyLink>
            ) : (
              <span className="mono-label inline-flex items-center gap-2 rounded-full px-3 py-1.5 shadow-[inset_0_0_0_1px_var(--line)]">
                <span className="size-1.5 rounded-full bg-subtle" />
                {ui.repoSoon[lang]}
              </span>
            )}
          </div>
        ) : null}
      </div>
      {demo ? (
        <TiltCard max={2.5} contentClassName="p-3 md:p-4">
          {demo}
        </TiltCard>
      ) : null}
    </article>
  );
}
