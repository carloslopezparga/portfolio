"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import type { DomainId, RefId, StackId } from "@/content/types";
import { StackIcon, stackColor } from "@/components/ui/icons";
import type { Cluster, Layout } from "@/lib/constellation";
import { usePrefs } from "@/lib/prefs";
import { dispatchUI, onUI } from "@/lib/ui-bus";

export interface CStar {
  id: string;
  label: string;
  cluster: Cluster;
  kind: "skill" | "language";
  sub?: string;
}
export interface CNode {
  id: RefId;
  label: string;
  domain: DomainId;
  kind: "project" | "work" | "other";
}
export interface CLink {
  skill: StackId;
  ref: RefId;
  w: number;
}
export interface CLabels {
  usedIn: string;
  uses: string;
  filter: string;
  clear: string;
  inspector: string;
  pick: string;
  go: string;
  close: string;
  clusters: Record<Cluster, string>;
  list: string;
}

type Sel = { kind: "star"; id: string } | { kind: "node"; id: RefId } | null;

/**
 * Skills as a constellation. Stars cluster by domain; projects and jobs are
 * the larger nodes. Hovering a star draws "attention" lines to where it was
 * used (thickness = weight) and dims the rest; hovering a node lights its
 * skills. Keyboard focus behaves like hover; Enter selects / navigates.
 */
export function Constellation({
  landscape,
  portrait,
  stars,
  nodes,
  links,
  labels,
}: {
  landscape: Layout;
  portrait: Layout;
  stars: CStar[];
  nodes: CNode[];
  links: CLink[];
  labels: CLabels;
}) {
  const [hover, setHover] = useState<Sel>(null);
  const [pinned, setPinned] = useState<Sel>(null);
  const [filter, setFilter] = useState<DomainId | null>(null);
  const [sheet, setSheet] = useState(false);
  const { touch, reduced } = usePrefs();
  const driftRefs = useRef<(SVGGElement | null)[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const sel = hover ?? pinned;

  useEffect(() => onUI("filter_domain", (a) => setFilter(a.domain)), []);

  // Gentle drift with the cursor.
  useEffect(() => {
    if (touch || reduced) return;
    const el = wrapRef.current!;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      driftRefs.current.forEach((g) => g && (g.style.transform = `translate(${(nx * 7).toFixed(1)}px, ${(ny * 5).toFixed(1)}px)`));
    };
    const onLeave = () => driftRefs.current.forEach((g) => g && (g.style.transform = ""));
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [touch, reduced]);

  const lit = useMemo(() => {
    const s = new Set<string>();
    if (!sel) return s;
    s.add(sel.id);
    links.forEach((l) => {
      if (sel.kind === "star" && l.skill === sel.id) s.add(l.ref);
      if (sel.kind === "node" && l.ref === sel.id) s.add(l.skill);
    });
    return s;
  }, [sel, links]);

  const activeLinks = sel ? links.filter((l) => (sel.kind === "star" ? l.skill === sel.id : l.ref === sel.id)) : [];
  const maxW = Math.max(1, ...links.map((l) => l.w));
  const domainOfStar = (s: CStar) => s.cluster;
  const dimmed = (id: string, domain: string) => (sel ? !lit.has(id) : filter ? domain !== filter : false);

  const select = (next: Sel, open = false) => {
    setPinned(next);
    if (touch && open) setSheet(true);
  };
  const activateNode = (n: CNode) => {
    if (n.kind === "project") {
      dispatchUI({ type: "open_project", projectId: n.id as never });
      window.setTimeout(() => dispatchUI({ type: "highlight", targetId: n.id }), 700);
    } else dispatchUI({ type: "highlight", targetId: n.id });
  };
  const keyAct = (fn: () => void) => (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn();
    }
  };

  const renderSvg = (L: Layout, idx: number, className: string) => {
    const pos = (id: string) => L.stars.find((s) => s.id === id) ?? L.nodes.find((n) => n.id === id);
    const fs = L.w > 900 ? 1 : 1.25;
    return (
      <svg viewBox={`0 0 ${L.w} ${L.h}`} className={className} role="group" aria-label={labels.list}>
        <g
          ref={(el) => {
            driftRefs.current[idx] = el;
          }}
          style={{ transition: "transform 900ms var(--ease-out)" }}
        >
          {/* cluster labels + constellation lines */}
          {L.clusters.map((c) => {
            const members = L.stars.filter((s) => s.cluster === c.id).sort((a, b) => Math.atan2(a.y - c.y, a.x - c.x) - Math.atan2(b.y - c.y, b.x - c.x));
            const pts = members.map((m) => `${m.x},${m.y}`).join(" ");
            return (
              <g key={c.id} data-domain={c.id} opacity={filter && filter !== c.id && !sel ? 0.25 : 1} style={{ transition: "opacity 400ms" }}>
                {members.length > 2 && c.id !== "languages" ? <polygon points={pts} fill="none" className="stroke-[var(--d)]" strokeOpacity="0.16" strokeDasharray="2 4" /> : null}
                {c.id === "languages" && members.length > 1 ? <polyline points={pts} fill="none" className="stroke-[var(--d)]" strokeOpacity="0.16" strokeDasharray="2 4" /> : null}
                <text x={c.x} y={c.id === "languages" ? c.y - 22 : c.y + 4} textAnchor="middle" className="fill-[var(--d)] font-mono uppercase tracking-[0.16em]" style={{ fontSize: 10.5 * fs }} opacity="0.85">
                  {labels.clusters[c.id]}
                </text>
              </g>
            );
          })}

          {/* attention lines */}
          {activeLinks.map((l) => {
            const a = pos(l.skill);
            const b = pos(l.ref);
            if (!a || !b) return null;
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2 - 30;
            const star = stars.find((s) => s.id === l.skill)!;
            return (
              <path
                key={`${l.skill}-${l.ref}`}
                data-domain={domainOfStar(star)}
                d={`M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}`}
                pathLength={1}
                fill="none"
                className="attn stroke-[var(--d)]"
                strokeWidth={1 + (l.w / maxW) * 2.5}
                strokeOpacity={0.4 + (l.w / maxW) * 0.45}
                strokeLinecap="round"
              />
            );
          })}

          {/* big nodes */}
          {nodes.map((n) => {
            const p = L.nodes.find((x) => x.id === n.id)!;
            const on = sel ? lit.has(n.id) : false;
            return (
              <g
                key={n.id}
                data-domain={n.domain}
                data-target-id={idx === 0 ? n.id : undefined}
                role="button"
                tabIndex={0}
                aria-label={`${n.label}: ${links.filter((l) => l.ref === n.id).map((l) => stars.find((s) => s.id === l.skill)?.label).join(", ")}`}
                className="c-node cursor-pointer outline-none"
                opacity={dimmed(n.id, n.domain) ? 0.22 : 1}
                style={{ transition: "opacity 300ms" }}
                onPointerEnter={() => !touch && setHover({ kind: "node", id: n.id })}
                onPointerLeave={() => !touch && setHover(null)}
                onFocus={() => setHover({ kind: "node", id: n.id })}
                onBlur={() => setHover(null)}
                onClick={() => (touch ? select({ kind: "node", id: n.id }, true) : activateNode(n))}
                onKeyDown={keyAct(() => activateNode(n))}
              >
                <circle cx={p.x} cy={p.y} r={18} fill="transparent" />
                <circle cx={p.x} cy={p.y} r={on ? 9 : 7} className="fill-bg stroke-[var(--d)]" strokeWidth={1.4} style={{ transition: "r 200ms" }} />
                <circle cx={p.x} cy={p.y} r={2.6} className="fill-[var(--d)]" />
                <text x={p.x} y={p.y + 22 * fs} textAnchor="middle" className={on ? "fill-fg" : "fill-muted"} style={{ fontSize: 12 * fs }}>
                  {n.label}
                </text>
              </g>
            );
          })}

          {/* stars */}
          {L.stars.map((p, i) => {
            const s = stars.find((x) => x.id === p.id)!;
            const on = sel?.id === s.id || (sel?.kind === "node" && lit.has(s.id));
            const isSkill = s.kind === "skill";
            const color = isSkill ? stackColor(s.id as StackId) : "var(--d)";
            const ic = 16 * fs;
            return (
              <g
                key={p.id}
                data-domain={s.cluster}
                data-target-id={idx === 0 ? s.id : undefined}
                role="button"
                tabIndex={0}
                aria-label={`${s.label}${s.sub ? ` ${s.sub}` : ""}`}
                className="c-star cursor-pointer outline-none"
                opacity={dimmed(s.id, s.cluster) ? 0.2 : 1}
                style={{ transition: "opacity 300ms" }}
                onPointerEnter={() => !touch && setHover({ kind: "star", id: s.id })}
                onPointerLeave={() => !touch && setHover(null)}
                onFocus={() => setHover({ kind: "star", id: s.id })}
                onBlur={() => setHover(null)}
                onClick={() => select({ kind: "star", id: s.id }, true)}
                onKeyDown={keyAct(() => select({ kind: "star", id: s.id }, true))}
              >
                <circle cx={p.x} cy={p.y} r={22} fill="transparent" />
                <circle cx={p.x} cy={p.y} r={on ? 16 : 11} className="fill-[rgb(var(--d-rgb)/0.08)]" style={{ transition: "r 250ms" }} />
                {isSkill ? (
                  <g transform={`translate(${p.x - ic / 2} ${p.y - ic / 2})`} style={{ color: on ? color : undefined }} className={on ? "" : "text-dim"}>
                    <svg width={ic} height={ic} viewBox="0 0 24 24" overflow="visible">
                      <StackIcon id={s.id as StackId} />
                    </svg>
                  </g>
                ) : (
                  <circle cx={p.x} cy={p.y} r={p.r} className="twinkle fill-[var(--d)]" style={{ "--tw": `${3 + (i % 4)}s`, "--tw-d": `${(i * 0.37) % 2}s` } as CSSProperties} />
                )}
                <text
                  x={p.labelSide === "r" ? p.x + 20 : p.x - 20}
                  y={p.y + 4}
                  textAnchor={p.labelSide === "r" ? "start" : "end"}
                  className={on ? "fill-fg" : "fill-muted"}
                  style={{ fontSize: 12.5 * fs }}
                >
                  {s.label}
                  {s.sub ? <tspan className="fill-dim font-mono" style={{ fontSize: 10 * fs }}>{` ${s.sub}`}</tspan> : null}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    );
  };

  /* ---------------------------- inspector ---------------------------- */
  const inspector = () => {
    if (!sel) return <p className="mono-label">{labels.pick}</p>;
    if (sel.kind === "star") {
      const s = stars.find((x) => x.id === sel.id)!;
      const used = links.filter((l) => l.skill === s.id);
      return (
        <div data-domain={s.cluster}>
          {s.kind === "skill" ? (
            <span className="block" style={{ color: stackColor(s.id as StackId) }}>
              <StackIcon id={s.id as StackId} className="size-10" />
            </span>
          ) : null}
          <p className="mt-3 text-[22px] font-medium leading-tight text-fg">{s.label}</p>
          <p className="mono-label mt-1 !text-[var(--d)]">
            {labels.clusters[s.cluster]}
            {s.sub ? ` · ${s.sub}` : ""}
          </p>
          {used.length ? (
            <>
              <p className="mono-label mt-5 !text-[10px]">{labels.usedIn}</p>
              <ul className="mt-2 space-y-2">
                {used.map((l) => {
                  const n = nodes.find((x) => x.id === l.ref)!;
                  return (
                    <li key={l.ref} data-domain={n.domain}>
                      <button type="button" onClick={() => activateNode(n)} className="group flex w-full items-center gap-3 text-left text-[14.5px] text-fg">
                        <span className="h-[3px] shrink-0 rounded-full bg-[var(--d)]" style={{ width: 10 + (l.w / maxW) * 22 }} />
                        <span className="link-draw">{n.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : null}
        </div>
      );
    }
    const n = nodes.find((x) => x.id === sel.id)!;
    const used = links.filter((l) => l.ref === n.id);
    return (
      <div data-domain={n.domain}>
        <p className="text-[22px] font-medium leading-tight text-fg">{n.label}</p>
        <p className="mono-label mt-1 !text-[var(--d)]">{labels.clusters[n.domain]}</p>
        <p className="mono-label mt-5 !text-[10px]">{labels.uses}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {used.map((l) => {
            const s = stars.find((x) => x.id === l.skill)!;
            return (
              <span key={l.skill} className="flex items-center gap-2 rounded-full py-1 pl-2 pr-3 text-[13px] text-muted shadow-[inset_0_0_0_1px_var(--line)]">
                <span style={{ color: stackColor(l.skill) }}>
                  <StackIcon id={l.skill} className="size-4" />
                </span>
                {s.label}
              </span>
            );
          })}
        </div>
        <button type="button" onClick={() => activateNode(n)} className="group mt-5 inline-flex items-center gap-1.5 text-[14px] text-fg">
          <span className="link-draw">{labels.go}</span> →
        </button>
      </div>
    );
  };

  return (
    <div className="mx-auto grid max-w-[1400px] gap-6 px-5 sm:px-8 md:px-12 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div ref={wrapRef} className="relative" onPointerLeave={() => setHover(null)}>
        {filter ? (
          <button
            type="button"
            data-domain={filter}
            onClick={() => setFilter(null)}
            className="absolute left-0 top-0 z-10 flex items-center gap-2 rounded-full px-3 py-1.5 text-[12.5px] text-fg shadow-[inset_0_0_0_1px_rgb(var(--d-rgb)/0.6)]"
          >
            <span className="size-1.5 rounded-full bg-[var(--d)]" />
            {labels.filter}: {labels.clusters[filter]} <span className="text-dim">× {labels.clear}</span>
          </button>
        ) : null}
        {renderSvg(landscape, 0, "hidden h-auto w-full overflow-visible md:block")}
        {renderSvg(portrait, 1, "block h-auto w-full overflow-visible md:hidden")}

        {/* screen-reader equivalent */}
        <div className="sr-only">
          <h3>{labels.list}</h3>
          {(Object.keys(labels.clusters) as Cluster[]).map((c) => {
            const members = stars.filter((s) => s.cluster === c);
            if (!members.length) return null;
            return (
              <div key={c}>
                <h4>{labels.clusters[c]}</h4>
                <ul>
                  {members.map((s) => (
                    <li key={s.id}>
                      {s.label}
                      {s.sub ? ` (${s.sub})` : ""}
                      {links.some((l) => l.skill === s.id)
                        ? ` — ${labels.usedIn}: ${links
                            .filter((l) => l.skill === s.id)
                            .map((l) => nodes.find((n) => n.id === l.ref)?.label)
                            .join(", ")}`
                        : ""}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* inspector: side panel on desktop */}
      <aside className="hidden self-center rounded-[var(--radius-card)] p-5 shadow-[inset_0_0_0_1px_var(--line-strong)] lg:block" aria-live="polite">
        <p className="mono-label mb-4 !text-[10px]">{labels.inspector}</p>
        {inspector()}
      </aside>

      {/* inspector: bottom sheet on touch */}
      {touch && sheet && sel ? (
        <div className="panel-blur fixed inset-x-2 bottom-2 z-[170] max-h-[60svh] overflow-y-auto rounded-[20px] p-5 shadow-[0_0_0_1px_var(--line-strong),0_30px_80px_-20px_rgb(0_0_0/0.7)] lg:hidden" role="dialog" aria-label={labels.inspector}>
          <button
            type="button"
            onClick={() => {
              setSheet(false);
              setPinned(null);
            }}
            className="mono-label absolute right-4 top-4 rounded-full px-2.5 py-1 !text-fg shadow-[inset_0_0_0_1px_var(--line-strong)]"
          >
            {labels.close}
          </button>
          {inspector()}
        </div>
      ) : null}
    </div>
  );
}
