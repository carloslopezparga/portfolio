"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { DomainId, ProjectId, StackId } from "@/content/types";
import { StackIcon } from "@/components/ui/icons";
import { LazyCooling, LazyMailFlow, LazyTerminal } from "@/components/demos/lazy";
import { onUI } from "@/lib/ui-bus";

export interface ProjectItem {
  id: ProjectId;
  domain: DomainId;
  name: string;
  oneLiner: string;
  status: string;
  problem: string;
  built: string;
  next: string | null;
  stack: { id: StackId; label: string; domain: DomainId }[];
  repo: { url: string; public: boolean } | null;
  demo: { kind: "terminal"; script: string } | { kind: "mail" } | { kind: "cooling" } | null;
  screenshot: string | null;
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
  view: string;
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
        <div className="absolute right-2 top-2 z-10 flex gap-1 rounded-full p-0.5 shadow-[inset_0_0_0_1px_var(--line-strong)]" role="group">
          {([false, true] as const).map((v) => (
            <button key={String(v)} type="button" aria-pressed={real === v} onClick={() => setReal(v)} className={`rounded-full px-2.5 py-1 text-[11px] ${real === v ? "bg-fg text-bg" : "text-muted"}`}>
              {v ? labels.realFlow : labels.animated}
            </button>
          ))}
        </div>
      ) : null}
      {real && item.screenshot ? (
        <div className="relative size-full overflow-hidden rounded-[12px]" data-cursor={labels.view}>
          <Image src={item.screenshot} alt={labels.realFlow} fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-contain" />
        </div>
      ) : (
        <LazyMailFlow labels={labels.mail} />
      )}
    </div>
  );
}

/**
 * Three compact cards (problem, stack, status). Opening one unfolds its demo
 * and case study in a panel — under the row on desktop, right under the card
 * on phones (CSS `order`, one panel in the DOM).
 */
export function ProjectsGrid({ items, labels }: { items: ProjectItem[]; labels: ProjectLabels }) {
  const [open, setOpen] = useState<ProjectId | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const index = items.findIndex((i) => i.id === open);
  const item = index >= 0 ? items[index] : null;

  useEffect(
    () =>
      onUI("open_project", (a) => {
        setOpen(a.projectId);
      }),
    [],
  );

  return (
    <div className="mx-auto grid max-w-[1200px] gap-4 px-5 sm:px-8 md:grid-cols-3">
      {items.map((it, i) => {
        const on = it.id === open;
        return (
          <article
            key={it.id}
            data-target-id={it.id}
            data-domain={it.domain}
            className={`project-card ${on ? "is-open" : ""}`}
            style={{ order: i * 2 + 1 } as CSSProperties}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="badge badge-domain">{it.status}</span>
              <span className="size-2 rounded-full bg-[rgb(var(--d-rgb))] shadow-[0_0_10px_rgb(var(--d-rgb)/0.8)]" aria-hidden />
            </div>
            <h3 className="mt-4 text-[19px] leading-tight text-fg">{it.name}</h3>
            <p className="mt-1 text-[13.5px] font-medium text-[var(--d)]">{it.oneLiner}</p>
            <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{it.problem}</p>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {it.stack.map((s) => (
                <li key={s.id} data-domain={s.domain} className="chip">
                  <StackIcon id={s.id} className="size-3.5 text-[var(--d)]" />
                  {s.label}
                </li>
              ))}
            </ul>
            <button
              type="button"
              aria-expanded={on}
              aria-controls="project-panel"
              onClick={() => {
                setOpen(on ? null : it.id);
                if (!on) window.setTimeout(() => panelRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }), 60);
              }}
              className="btn btn-ghost btn-sm mt-5 w-full justify-center"
            >
              {on ? labels.close : it.demo ? labels.open : labels.openNoDemo}
              <svg viewBox="0 0 16 16" className={`size-3.5 transition-transform duration-300 ${on ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
                <path d="M4 6l4 4 4-4" />
              </svg>
            </button>
          </article>
        );
      })}

      <div
        id="project-panel"
        ref={panelRef}
        className="project-panel md:col-span-3 md:!order-[99]"
        style={{ order: index * 2 + 2, display: item ? undefined : "none" } as CSSProperties}
        data-domain={item?.domain}
      >
        {item ? (
          <div key={item.id} className="clip-up domain-scope">
            {item.demo ? (
              <div className="mx-auto h-[260px] max-w-[820px] overflow-hidden md:h-[330px]">
                <Demo item={item} labels={labels} />
              </div>
            ) : null}
            <div className={`grid gap-5 px-1 md:grid-cols-2 md:gap-8 ${item.demo ? "pt-5" : ""}`}>
              <dl className="space-y-4">
                <div>
                  <dt className="mono-label">{labels.built}</dt>
                  <dd className="mt-1 text-[14.5px] leading-relaxed text-fg">{item.built}</dd>
                </div>
                {!item.demo ? <p className="text-[13.5px] text-dim">{labels.demoSoon}</p> : null}
              </dl>
              <div className="space-y-4">
                {item.next ? (
                  <div>
                    <p className="mono-label">{labels.next}</p>
                    <p className="mt-1 text-[14.5px] leading-relaxed text-muted">{item.next}</p>
                  </div>
                ) : null}
                {item.repo ? (
                  item.repo.public ? (
                    <a href={item.repo.url} target="_blank" rel="noreferrer noopener" className="group inline-flex items-center gap-1.5 text-[14px] text-fg">
                      <span className="link-draw">GitHub</span> ↗
                    </a>
                  ) : (
                    <span className="mono-label inline-flex items-center gap-2 rounded-full px-3 py-1.5 shadow-[inset_0_0_0_1px_var(--line)]">
                      <span className="size-1.5 rounded-full bg-subtle" />
                      {labels.repoSoon}
                    </span>
                  )
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
