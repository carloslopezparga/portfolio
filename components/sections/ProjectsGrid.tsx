"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { DomainId, Locale, ProjectId, StackId } from "@/content/types";
import { StackIcon } from "@/components/ui/icons";
import { CountUp } from "@/components/ui/CountUp";
import { LazyCooling, LazyMailFlow, LazyTerminal } from "@/components/demos/lazy";
import { MediaStrip, type MediaLabels } from "@/components/media/MediaStrip";
import type { MediaItem } from "@/lib/media";
import { onUI } from "@/lib/ui-bus";
import { ProjectArt } from "./ProjectArt";

export interface ProjectItem {
  id: ProjectId;
  domain: DomainId;
  name: string;
  oneLiner: string;
  status: string;
  problem: string;
  built: string;
  next: string | null;
  stack: { id: StackId | null; label: string; domain: DomainId | null }[];
  metrics: { value: number; prefix: string; suffix: string; label: string }[];
  repo: { url: string; public: boolean } | null;
  demo: { kind: "terminal"; script: string } | { kind: "mail" } | { kind: "cooling" } | null;
  screenshot: string | null;
  media: MediaItem[];
}

export interface ProjectLabels {
  open: string;
  openNoDemo: string;
  close: string;
  problem: string;
  built: string;
  next: string;
  repoSoon: string;
  demoSoon: string;
  realFlow: string;
  animated: string;
  media: MediaLabels;
  mail: { gmail: string; claude: string; digest: string; inbox: string; search: string; telegram: string; tailored: string; building: string; steps: [string, string, string, string] };
  cooling: { illustrative: string; x: string; y: string; baseline: string; best: string; gen: string };
}

function Demo({ item, labels }: { item: ProjectItem; labels: ProjectLabels }) {
  const [real, setReal] = useState(false);
  if (!item.demo) return null;
  if (item.demo.kind === "terminal") return <LazyTerminal script={item.demo.script} title={`${item.name} — zsh`} badge="Replay" />;
  if (item.demo.kind === "cooling")
    return (
      <div className="grid h-full place-items-center p-2">
        <LazyCooling labels={labels.cooling} />
      </div>
    );
  return (
    <div className="relative grid h-full place-items-center p-2">
      {item.screenshot ? (
        <div className="absolute right-2 top-2 z-10 flex gap-1 rounded-full bg-[var(--bg)] p-1 shadow-[inset_0_0_0_1px_var(--line)]" role="group">
          {([false, true] as const).map((v) => (
            <button key={String(v)} type="button" aria-pressed={real === v} onClick={() => setReal(v)} className={`rounded-full px-3 py-1 text-[12px] font-medium ${real === v ? "bg-[var(--btn)] text-[var(--btn-fg)]" : "text-muted"}`}>
              {v ? labels.realFlow : labels.animated}
            </button>
          ))}
        </div>
      ) : null}
      {real && item.screenshot ? (
        <div className="relative size-full overflow-hidden rounded-[12px]">
          <Image src={item.screenshot} alt={labels.realFlow} fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-contain" />
        </div>
      ) : (
        <LazyMailFlow labels={labels.mail} />
      )}
    </div>
  );
}

/**
 * Four large cards (illustration, status, name, problem, figures, stack).
 * Opening one unfolds its demo and case study in a panel under its row on
 * desktop, right under the card on phones (CSS `order`, one panel in the DOM).
 */
export function ProjectsGrid({ items, labels, lang }: { items: ProjectItem[]; labels: ProjectLabels; lang: Locale }) {
  const [open, setOpen] = useState<ProjectId | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const index = items.findIndex((i) => i.id === open);
  const item = index >= 0 ? items[index] : null;

  useEffect(() => onUI("open_project", (a) => setOpen(a.projectId)), []);

  return (
    <div className="wrap grid gap-4 md:grid-cols-2 md:gap-5">
      {items.map((it, i) => {
        const on = it.id === open;
        return (
          <article
            key={it.id}
            data-target-id={it.id}
            data-domain={it.domain}
            className={`card card-hover reveal flex flex-col ${on ? "shadow-[var(--shadow)]" : ""}`}
            style={{ order: i * 2 + 1, ["--rd" as string]: `${(i % 2) * 90}ms` } as CSSProperties}
          >
            <ProjectArt id={it.id} lang={lang} />
            <div className="flex flex-1 flex-col px-6 pb-6 pt-5 md:px-8 md:pb-8">
              <span className="badge self-start">{it.status}</span>
              <h3 className="mt-4 text-[clamp(1.5rem,2.4vw,1.9rem)] leading-tight text-fg">{it.name}</h3>
              <p className="mt-1.5 text-[15px] font-semibold text-[var(--d)]">{it.oneLiner}</p>
              <p className="mt-3 text-[16px] leading-relaxed text-fg">{it.problem}</p>
              {it.metrics.length ? (
                <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
                  {it.metrics.map((m) => (
                    <div key={m.label} className="flex flex-col-reverse">
                      <dt className="mt-1 text-[13.5px] text-muted">{m.label}</dt>
                      <dd className="font-display text-[clamp(1.6rem,2.6vw,2rem)] font-bold leading-none tracking-[-0.035em] text-fg">
                        <CountUp value={m.value} prefix={m.prefix} suffix={m.suffix} lang={lang} />
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              <ul className="mt-5 flex flex-wrap gap-1.5">
                {it.stack.map((s) => (
                  <li key={s.label} data-domain={s.domain ?? undefined} className="chip">
                    {s.id ? <StackIcon id={s.id} className="size-3.5 text-[var(--d)]" /> : null}
                    {s.label}
                  </li>
                ))}
              </ul>
              {it.media.length ? <MediaStrip items={it.media} alt={it.name} labels={labels.media} className="mt-5" /> : null}
              <button
                type="button"
                aria-expanded={on}
                aria-controls="project-panel"
                onClick={() => {
                  setOpen(on ? null : it.id);
                  if (!on) window.setTimeout(() => panelRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }), 60);
                }}
                className="btn btn-secondary btn-sm mt-6 self-start"
              >
                {on ? labels.close : it.demo ? labels.open : labels.openNoDemo}
                <svg viewBox="0 0 16 16" className={`size-3.5 transition-transform duration-300 ${on ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </button>
            </div>
          </article>
        );
      })}

      <div
        id="project-panel"
        ref={panelRef}
        className="project-panel md:col-span-2 md:[order:var(--row-end)]"
        style={{ order: index * 2 + 2, "--row-end": (Math.floor(index / 2) * 2 + 1) * 2 + 2, display: item ? undefined : "none" } as CSSProperties}
        data-domain={item?.domain}
      >
        {item ? (
          <div key={item.id} className="clip-up grid gap-6 p-5 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:gap-10 md:p-8">
            {item.demo ? (
              <div className="h-[300px] md:h-[400px]">
                <Demo item={item} labels={labels} />
              </div>
            ) : null}
            <dl className={`space-y-6 ${item.demo ? "" : "md:col-span-2 md:grid md:grid-cols-2 md:gap-10 md:space-y-0"}`}>
              <div>
                <dt className="eyebrow">{labels.problem}</dt>
                <dd className="mt-2 text-[16px] leading-relaxed text-fg">{item.problem}</dd>
              </div>
              <div>
                <dt className="eyebrow">{labels.built}</dt>
                <dd className="mt-2 text-[16px] leading-relaxed text-fg">{item.built}</dd>
              </div>
              {item.next ? (
                <div>
                  <dt className="eyebrow">{labels.next}</dt>
                  <dd className="mt-2 text-[16px] leading-relaxed text-fg">{item.next}</dd>
                </div>
              ) : null}
              {item.repo ? (
                <div>
                  {item.repo.public ? (
                    <a href={item.repo.url} target="_blank" rel="noreferrer noopener" className="btn btn-secondary btn-sm">
                      GitHub ↗
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full bg-[var(--bg)] px-3.5 py-2 text-[13px] font-medium text-muted">
                      <span className="size-1.5 rounded-full bg-subtle" />
                      {labels.repoSoon}
                    </span>
                  )}
                </div>
              ) : null}
              {!item.demo && item.id === "job-hunt-copilot" ? <p className="text-[14px] text-muted">{labels.demoSoon}</p> : null}
            </dl>
          </div>
        ) : null}
      </div>
    </div>
  );
}
