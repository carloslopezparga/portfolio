"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { DomainId, Locale, ProjectId, StackId } from "@/content/types";
import { StackIcon, stackColor } from "@/components/ui/icons";
import { CountUp } from "@/components/ui/CountUp";
import { LazyCooling, LazyMailFlow, LazyTerminal } from "@/components/demos/lazy";
import { MediaStrip, type MediaLabels } from "@/components/media/MediaStrip";
import { Carousel } from "@/components/ui/Carousel";
import type { Clip, MediaItem } from "@/lib/media";
import { formatNumber } from "@/lib/metrics";
import { onUI } from "@/lib/ui-bus";
import { ProjectLoop } from "./ProjectLoop";

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
  /** the looping clip behind the card (null: a plain background with the domain's tint) */
  loop: Clip | null;
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
  row: string;
  rowPrev: string;
  rowNext: string;
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
 * The projects as a row of small, tall cards (2:3), dark in both themes like
 * the photo cards: the project's looping clip edge to edge, pills on top
 * (status and, when there are figures, the first one) and the name and its
 * line at the bottom, over a dark gradient. From 1024 px the four fit in the
 * row; below, the row scrolls sideways (scroll-snap, a swipe on phones).
 *
 * A whole card is one button: it unfolds the project's panel under the row,
 * with its figures, stack, demo, case study and media. The panels' text is
 * always in the page (and all of it shows without JavaScript); the demo is
 * only mounted while its panel is open.
 */
export function ProjectsRow({ items, labels, lang }: { items: ProjectItem[]; labels: ProjectLabels; lang: Locale }) {
  const [open, setOpen] = useState<ProjectId | null>(null);
  const row = useRef<HTMLDivElement>(null);
  const panels = useRef<HTMLDivElement>(null);

  useEffect(() => onUI("open_project", (a) => setOpen(a.projectId)), []);

  const toggle = (id: ProjectId) => {
    const opening = open !== id;
    setOpen(opening ? id : null);
    if (opening) window.setTimeout(() => panels.current?.querySelector(`#project-panel-${CSS.escape(id)}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" }), 60);
  };
  /** Closing from inside the panel: the focus goes back to the card that opened it. */
  const close = (id: ProjectId) => {
    setOpen(null);
    row.current?.querySelector<HTMLButtonElement>(`[data-target-id="${CSS.escape(id)}"] button`)?.focus({ preventScroll: true });
  };

  return (
    <>
      <div ref={row} className="project-row">
        <Carousel label={labels.row} labels={{ prev: labels.rowPrev, next: labels.rowNext }} arrows="desktop">
          {items.map((it, i) => {
            const on = it.id === open;
            const first = it.metrics[0];
            return (
              <article
                key={it.id}
                data-target-id={it.id}
                data-domain={it.domain}
                data-theme="dark"
                data-open={on ? "" : undefined}
                suppressHydrationWarning
                className="project-card reveal"
                style={{ ["--rd" as string]: `${Math.min(i, 3) * 80}ms` }}
              >
                {it.loop ? <ProjectLoop clip={it.loop} /> : null}
                <p className="project-pills">
                  <span className="project-pill">
                    <i aria-hidden />
                    {it.status}
                  </span>
                  {first ? (
                    <span className="project-pill">
                      <b>
                        {first.prefix}
                        {formatNumber(first.value, lang)}
                        {first.suffix}
                      </b>
                      {` ${first.label}`}
                    </span>
                  ) : null}
                </p>
                <div className="project-text">
                  <h3>
                    <button type="button" aria-expanded={on} aria-controls={`project-panel-${it.id}`} data-glow-card onClick={() => toggle(it.id)}>
                      {it.name}
                      <span className="sr-only">. {on ? labels.close : it.demo ? labels.open : labels.openNoDemo}</span>
                    </button>
                  </h3>
                  <div className="mt-1.5 flex items-end gap-3">
                    <p className="min-w-0 flex-1 text-[14.5px] font-semibold leading-snug text-white/85">{it.oneLiner}</p>
                    <span className="project-more" aria-hidden>
                      <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                        <path d="M4 6l4 4 4-4" />
                      </svg>
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </Carousel>
      </div>

      <div ref={panels} className="wrap">
        {items.map((item) => {
          const on = item.id === open;
          return (
            <div key={item.id} id={`project-panel-${item.id}`} role="region" aria-labelledby={`project-title-${item.id}`} data-domain={item.domain} data-open={on ? "" : undefined} className="project-panel mt-4 scroll-mt-nav">
              <div className="clip-up p-5 md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 id={`project-title-${item.id}`} className="text-[clamp(1.5rem,2.4vw,1.9rem)] leading-tight text-fg">
                      {item.name}
                    </h3>
                    <p className="mt-1.5 text-[15px] font-semibold text-[var(--d)]">{item.oneLiner}</p>
                  </div>
                  <button type="button" onClick={() => close(item.id)} className="project-close btn btn-secondary btn-sm shrink-0">
                    {labels.close}
                    <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
                      <path d="M4 4l8 8M12 4l-8 8" />
                    </svg>
                  </button>
                </div>
                {item.metrics.length ? (
                  <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
                    {item.metrics.map((m) => (
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
                  {item.stack.map((s) => (
                    <li key={s.label} data-domain={s.domain ?? undefined} className="chip">
                      {s.id ? (
                        <span style={{ color: stackColor(s.id) }}>
                          <StackIcon id={s.id} className="size-3.5" />
                        </span>
                      ) : null}
                      {s.label}
                    </li>
                  ))}
                </ul>
                <div className="mt-7 grid gap-6 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:gap-10">
                  {item.demo ? <div className="project-demo h-[300px] md:h-[400px]">{on ? <Demo item={item} labels={labels} /> : null}</div> : null}
                  <div className={item.demo ? "" : "md:col-span-2"}>
                    <dl className={`space-y-6 ${item.demo ? "" : "md:grid md:grid-cols-2 md:gap-10 md:space-y-0"}`}>
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
                    </dl>
                    {item.repo || (!item.demo && item.id === "job-hunt-copilot") ? (
                      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                        {item.repo ? (
                          item.repo.public ? (
                            <a href={item.repo.url} target="_blank" rel="noreferrer noopener" className="btn btn-secondary btn-sm">
                              GitHub ↗
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--bg)] px-3.5 py-2 text-[13px] font-medium text-muted">
                              <span className="size-1.5 rounded-full bg-subtle" />
                              {labels.repoSoon}
                            </span>
                          )
                        ) : null}
                        {!item.demo && item.id === "job-hunt-copilot" ? <p className="text-[14px] text-muted">{labels.demoSoon}</p> : null}
                      </div>
                    ) : null}
                  </div>
                </div>
                {item.media.length ? <MediaStrip items={item.media} alt={item.name} labels={labels.media} className="mt-7" /> : null}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
