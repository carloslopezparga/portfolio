"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { DomainId, ProjectId, StackId } from "@/content/types";
import { StackIcon, stackColor } from "@/components/ui/icons";
import { TiltCard } from "@/components/ui/TiltCard";
import { LazyCooling, LazyMailFlow, LazyTerminal } from "@/components/demos/lazy";
import { onUI } from "@/lib/ui-bus";

export interface SystemItem {
  id: ProjectId;
  domain: DomainId;
  name: string;
  oneLiner: string;
  status: string;
  problem: string;
  built: string;
  next: string | null;
  stack: { id: StackId; label: string }[];
  repo: { url: string; public: boolean } | null;
  demo: { kind: "terminal"; script: string; sample: boolean } | { kind: "mail" } | { kind: "cooling" } | null;
  screenshot: string | null;
}

export interface SystemsLabels {
  problem: string;
  built: string;
  next: string;
  stack: string;
  repoSoon: string;
  realFlow: string;
  animated: string;
  view: string;
  mail: { gmail: string; claude: string; digest: string; inbox: string; search: string; telegram: string; tailored: string; building: string; steps: [string, string, string, string] };
  cooling: { illustrative: string; x: string; y: string; baseline: string; best: string; gen: string };
}

function Demo({ item, labels, live }: { item: SystemItem; labels: SystemsLabels; live: boolean }) {
  const [real, setReal] = useState(false);
  if (!item.demo || !live) return <div className="size-full" />;
  if (item.demo.kind === "terminal") return <LazyTerminal script={item.demo.script} title={`${item.name} — zsh`} badge={item.demo.sample ? "Sample" : "Replay"} />;
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
          {[
            [false, labels.animated],
            [true, labels.realFlow],
          ].map(([v, l]) => (
            <button
              key={String(v)}
              type="button"
              aria-pressed={real === v}
              onClick={() => setReal(v as boolean)}
              className={`rounded-full px-2.5 py-1 text-[11px] ${real === v ? "bg-fg text-bg" : "text-muted"}`}
            >
              {l as string}
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
 * Projects in one screen: the list on one side, the selected project's live
 * demo and case study on the other (tabs on mobile). Switching projects
 * reveals the panel with the clip "up" transition, in the project's colour.
 */
export function SystemsSwitcher({ items, labels }: { items: SystemItem[]; labels: SystemsLabels }) {
  const [active, setActive] = useState<ProjectId>(items[0].id);
  const [live, setLive] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const item = items.find((i) => i.id === active)!;

  useEffect(() => onUI("open_project", (a) => setActive(a.projectId)), []);

  // Demos mount once the section is about to be seen.
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setLive(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(rootRef.current!);
    return () => io.disconnect();
  }, []);

  const onKey = (e: KeyboardEvent, i: number) => {
    const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (i + d + items.length) % items.length;
    setActive(items[n].id);
    tabs.current[n]?.focus();
  };

  return (
    <div ref={rootRef} className="mx-auto grid max-w-[1400px] gap-5 px-5 sm:px-8 md:px-12 lg:grid-cols-[minmax(0,330px)_minmax(0,1fr)] lg:gap-8">
      {/* list / tabs */}
      <div role="tablist" aria-orientation="vertical" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0" data-lenis-prevent>
        {items.map((it, i) => {
          const on = it.id === active;
          return (
            <button
              key={it.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              role="tab"
              id={`tab-${it.id}`}
              aria-selected={on}
              aria-controls="system-panel"
              tabIndex={on ? 0 : -1}
              data-domain={it.domain}
              data-target-id={it.id}
              onClick={() => setActive(it.id)}
              onKeyDown={(e) => onKey(e, i)}
              className={`group relative shrink-0 rounded-[16px] px-4 py-3 text-left transition-colors duration-300 lg:py-4 ${
                on ? "bg-[rgb(var(--d-rgb)/0.08)] shadow-[inset_0_0_0_1px_rgb(var(--d-rgb)/0.55)]" : "shadow-[inset_0_0_0_1px_var(--line)] hover:bg-[rgb(var(--d-rgb)/0.04)]"
              }`}
            >
              <span className={`absolute inset-y-3 left-0 w-[2px] rounded-full bg-[var(--d)] transition-transform duration-300 ${on ? "scale-y-100" : "scale-y-0"}`} aria-hidden />
              <span className="mono-label flex items-center gap-2 !text-[10px]">
                <span className="size-1.5 rounded-full bg-[var(--d)]" aria-hidden />
                P-{String(i + 1).padStart(2, "0")} · {it.status}
              </span>
              <span className="mt-1 block whitespace-nowrap text-[16px] font-medium text-fg lg:whitespace-normal lg:text-[18px]">{it.name}</span>
              <span className="mt-0.5 hidden text-[13.5px] text-muted lg:block">{it.oneLiner}</span>
            </button>
          );
        })}
      </div>

      {/* panel */}
      <div id="system-panel" role="tabpanel" aria-labelledby={`tab-${active}`} data-domain={item.domain}>
        <TiltCard max={2.5} className="domain-scope" contentClassName="p-3 md:p-4">
          <div key={active} className="clip-up">
            {item.demo ? <div className="h-[280px] md:h-[330px]">{<Demo item={item} labels={labels} live={live} />}</div> : null}
            <div className={`grid gap-5 px-2 pb-2 md:grid-cols-2 md:gap-8 ${item.demo ? "pt-5" : "pt-3"}`}>
              <dl className="space-y-4">
                <div>
                  <dt className="mono-label">{labels.problem}</dt>
                  <dd className="mt-1 text-[14.5px] leading-relaxed text-muted">{item.problem}</dd>
                </div>
                <div>
                  <dt className="mono-label">{labels.built}</dt>
                  <dd className="mt-1 text-[14.5px] leading-relaxed text-fg">{item.built}</dd>
                </div>
              </dl>
              <div className="space-y-4">
                {item.next ? (
                  <div>
                    <p className="mono-label">{labels.next}</p>
                    <p className="mt-1 text-[14.5px] leading-relaxed text-muted">{item.next}</p>
                  </div>
                ) : null}
                <div>
                  <p className="mono-label">{labels.stack}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.stack.map((s) => (
                      <span key={s.id} className="flex items-center gap-2 rounded-full py-1 pl-2 pr-3 text-[13px] text-muted shadow-[inset_0_0_0_1px_var(--line)]">
                        <span style={{ color: stackColor(s.id) }}>
                          <StackIcon id={s.id} className="size-4" />
                        </span>
                        {s.label}
                      </span>
                    ))}
                  </div>
                </div>
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
        </TiltCard>
      </div>
    </div>
  );
}
