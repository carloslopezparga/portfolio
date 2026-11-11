"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import type { DomainId, StackId } from "@/content/types";
import { camera, NET, type NetLayout } from "@/lib/graph";
import { usePrefs } from "@/lib/prefs";
import { useTheme } from "@/lib/theme";
import { dispatchUI, onUI } from "@/lib/ui-bus";
import { Glyph, StackIcon, type GlyphName } from "@/components/ui/icons";
import { mountNet, type NetHandle } from "./skillsNet";

export interface GraphSkill {
  id: StackId;
  label: string;
  domain: DomainId;
  domainLabel: string;
  /** the colour of its mark: the tool's own, or the domain's for a glyph */
  color: string;
  usedIn: { id: string; w: number }[];
}
export interface GraphRef {
  id: string;
  label: string;
  kindLabel: string;
  logo: string | null;
  /** shown when an organisation has no logo file yet */
  monogram: string | null;
  glyph: GlyphName | null;
  domain: DomainId | null;
  /** brand colour vars (organisations) */
  brand: CSSProperties | null;
  /** data-target-id of its card on the page, if it has one */
  card: string | null;
}
export interface GraphLabels {
  usedIn: string;
  uses: string;
  close: string;
  tour: string;
}

type Active = { kind: "skill" | "ref"; id: string };
const TOUR_MS = 3200;
const ARROWS: Record<string, [number, number]> = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] };

/** The nearest node in an arrow's direction (within ~60° of it, favouring the axis), or null at the edge. */
function nearest(pos: Map<string, { x: number; y: number }>, from: string, [dx, dy]: [number, number]): string | null {
  const a = pos.get(from)!;
  let best: string | null = null;
  let score = Infinity;
  for (const [id, p] of pos) {
    const along = (p.x - a.x) * dx + (p.y - a.y) * dy;
    const across = Math.abs((p.x - a.x) * dy - (p.y - a.y) * dx);
    if (id === from || along <= 0 || across > along * 1.8) continue;
    if (along + across * 2 < score) {
      score = along + across * 2;
      best = id;
    }
  }
  return best;
}

const tone = (r: GraphRef) => ({ className: r.brand ? "brand" : "", style: r.brand ?? undefined, domain: r.brand ? undefined : (r.domain ?? undefined) });

/** What the inspector and the phone sheet show for the active node. */
function Details({ active, skills, refs, labels, select }: { active: Active; skills: GraphSkill[]; refs: GraphRef[]; labels: GraphLabels; select: (a: Active) => void }) {
  if (active.kind === "skill") {
    const s = skills.find((x) => x.id === active.id)!;
    return (
      <div data-domain={s.domain} className="flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
        <div className="flex items-center gap-4 md:w-[300px] md:shrink-0">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--bg)] shadow-[inset_0_0_0_1.5px_var(--d)] dark:bg-[rgb(255_255_255/0.04)]" style={{ color: s.color }}>
            <StackIcon id={s.id} className="size-6" />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[var(--d)]">{s.domainLabel}</p>
            <h3 className="text-[22px] leading-tight text-fg">{s.label}</h3>
          </div>
        </div>
        <div className="min-w-0">
          <p className="mono-label">{labels.usedIn}</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {s.usedIn.map((u) => {
              const r = refs.find((x) => x.id === u.id)!;
              return (
                <li key={u.id}>
                  <button type="button" onClick={() => (r.card ? dispatchUI({ type: "highlight", targetId: r.card }) : select({ kind: "ref", id: r.id }))} className={`chip chip-link ${tone(r).className}`} style={tone(r).style} data-domain={tone(r).domain}>
                    {r.label}
                    {r.card ? <span aria-hidden>↗</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }
  const r = refs.find((x) => x.id === active.id)!;
  const used = skills.filter((s) => s.usedIn.some((u) => u.id === r.id));
  return (
    <div className={`flex flex-col gap-5 md:flex-row md:items-center md:gap-8 ${tone(r).className}`} style={tone(r).style} data-domain={tone(r).domain}>
      <div className="flex items-center gap-4 md:w-[300px] md:shrink-0">
        <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-white text-[var(--d)] shadow-[inset_0_0_0_1.5px_var(--d)]">
          {r.logo ? (
            <Image src={r.logo} alt="" width={36} height={36} className="size-9 object-contain" />
          ) : r.glyph ? (
            <Glyph name={r.glyph} className="size-6" />
          ) : (
            <span className="text-[15px] font-bold">{r.monogram}</span>
          )}
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[var(--d)]">{r.kindLabel}</p>
          <h3 className="text-[22px] leading-tight text-fg">{r.label}</h3>
        </div>
      </div>
      <div className="min-w-0">
        <p className="mono-label">{labels.uses}</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {used.map((s) => (
            <li key={s.id}>
              <button type="button" data-domain={s.domain} onClick={() => select({ kind: "skill", id: s.id })} className="chip chip-link">
                <span style={{ color: s.color }}>
                  <StackIcon id={s.id} className="size-3.5" />
                </span>
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * The skills as a network in three layers, in depth: the skills (input), the
 * projects (hidden) and the jobs and studies (output), joined by "used in"
 * links. Desktop: the nodes are buttons (the tool's real logo or a glyph of
 * our own, in a ring of their domain's colour) placed on every frame where
 * the camera sees them, over a canvas with the links and their pulses
 * (skillsNet.ts): nearer nodes larger, further ones smaller and fainter. The
 * view sways, leans towards the cursor and can be orbited with a drag. At
 * rest a tour lights a different skill every few seconds (it stops for good
 * once you interact); the inspector underneath always shows something. Graph
 * and inspector together stay within about 60 % of the screen's height.
 * One tab stop for the whole network; arrow keys move between nodes. Phones:
 * a list by domain and a bottom sheet.
 */
export function SkillsGraph({ skills, refs, layout, labels }: { skills: GraphSkill[]; refs: GraphRef[]; layout: NetLayout; labels: GraphLabels }) {
  const order = useMemo(() => skills.map((s) => s.id), [skills]);
  const [active, setActive] = useState<Active>({ kind: "skill", id: skills[0].id });
  const [touched, setTouched] = useState(false);
  const [sheet, setSheet] = useState<Active | null>(null);
  const [show, setShow] = useState(false);
  const { reduced } = usePrefs();
  const theme = useTheme();
  const graphRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const net = useRef<NetHandle | null>(null);
  // One tab stop for the whole network (the last node focused); arrow keys move between nodes.
  const [stop, setStop] = useState<string>(skills[0].id);
  const nodes = useRef(new Map<string, HTMLButtonElement>());
  const nodeRef = (id: string) => (el: HTMLButtonElement | null) => {
    if (el) nodes.current.set(id, el);
    else nodes.current.delete(id);
  };

  // The network is desktop-only: it mounts when its (visible) box nears the
  // viewport, so phones never build it and the first load stays light.
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setShow(true);
        io.disconnect();
      },
      { rootMargin: "800px 0px" },
    );
    io.observe(graphRef.current!);
    return () => io.disconnect();
  }, []);

  const pick = useCallback((a: Active) => {
    setTouched(true);
    setActive(a);
  }, []);

  // The tour: one skill after another while the network is on screen and untouched.
  useEffect(() => {
    if (touched || reduced) return;
    const el = graphRef.current!;
    let visible = false;
    let i = 0;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    const t = window.setInterval(() => {
      if (!visible || document.hidden) return;
      i = (i + 1) % order.length;
      setActive({ kind: "skill", id: order[i] });
    }, TOUR_MS);
    return () => {
      io.disconnect();
      window.clearInterval(t);
    };
  }, [touched, reduced, order]);

  // The agent (or a click elsewhere) highlighting a skill selects it here too.
  useEffect(
    () =>
      onUI("highlight", ({ targetId }) => {
        if (skills.some((s) => s.id === targetId)) pick({ kind: "skill", id: targetId });
        else if (refs.some((r) => r.id === targetId)) pick({ kind: "ref", id: targetId });
      }),
    [skills, refs, pick],
  );

  // what is lit: the active node and the nodes it is linked to
  const lit = useMemo(() => {
    const ids = new Set<string>([active.id]);
    if (active.kind === "skill") skills.find((s) => s.id === active.id)?.usedIn.forEach((u) => ids.add(u.id));
    else skills.forEach((s) => s.usedIn.some((u) => u.id === active.id) && ids.add(s.id));
    return { active: active.id, ids, on: (from: string, to: string) => (active.kind === "skill" ? active.id === from : active.id === to) };
  }, [active, skills]);
  const litRef = useRef(lit);

  // the engine places the nodes and draws the links; it reads what is lit on every frame
  useEffect(() => {
    if (!show) return;
    const handle = mountNet(stageRef.current!, canvasRef.current!, {
      layout,
      els: nodes.current,
      links: skills.flatMap((s) => s.usedIn.map((u) => ({ from: s.id, to: u.id }))),
      reduced,
      lit: () => litRef.current,
    });
    net.current = handle;
    return () => {
      handle.dispose();
      net.current = null;
    };
  }, [show, reduced, layout, skills]);
  useEffect(() => {
    litRef.current = lit;
    net.current?.refresh();
  }, [lit, theme]);

  // where the nodes are in the view at rest: what the arrow keys go by
  const pos = useMemo(() => {
    const see = camera(NET.yaw, NET.pitch);
    return new Map(layout.nodes.map((n) => [n.id, { x: see(n.x, n.y, n.z)[0], y: see(n.x, n.y, n.z)[1] }]));
  }, [layout]);
  const focusNode = (a: Active) => {
    pick(a);
    setStop(a.id);
  };
  const keys = (a: Active) => (e: KeyboardEvent) => {
    const all = [...order, ...refs.map((r) => r.id)];
    const to = ARROWS[e.key] ? nearest(pos, a.id, ARROWS[e.key]) : e.key === "Home" ? all[0] : e.key === "End" ? all[all.length - 1] : null;
    if (!to) return;
    e.preventDefault();
    nodes.current.get(to)?.focus();
  };

  return (
    <>
      {/* desktop: the network and its inspector */}
      <div ref={graphRef} className="skills-desktop hidden lg:block">
        <div ref={stageRef} className="net" role="toolbar" aria-label={labels.tour} style={{ aspectRatio: `${NET.w} / ${NET.h}` }}>
          {show ? (
            <>
              <canvas ref={canvasRef} className="net-links" aria-hidden />
              {skills.map((s) => (
                <button
                  key={s.id}
                  ref={nodeRef(s.id)}
                  type="button"
                  tabIndex={stop === s.id ? 0 : -1}
                  aria-label={`${s.label} · ${s.domainLabel}`}
                  aria-pressed={active.id === s.id}
                  data-target-id={s.id}
                  data-domain={s.domain}
                  className={`net-node ${lit.ids.has(s.id) ? "is-lit" : ""} ${active.id === s.id ? "is-active" : ""}`}
                  onPointerEnter={() => pick({ kind: "skill", id: s.id })}
                  onFocus={() => focusNode({ kind: "skill", id: s.id })}
                  onClick={() => pick({ kind: "skill", id: s.id })}
                  onKeyDown={keys({ kind: "skill", id: s.id })}
                >
                  <span className="net-disc" style={{ color: s.color }}>
                    <StackIcon id={s.id} className="size-[22px]" />
                  </span>
                  <span className="net-label">{s.label}</span>
                </button>
              ))}
              {refs.map((r) => {
                const t = tone(r);
                return (
                  <button
                    key={r.id}
                    ref={nodeRef(r.id)}
                    type="button"
                    tabIndex={stop === r.id ? 0 : -1}
                    aria-label={`${r.label} · ${r.kindLabel}`}
                    aria-pressed={active.id === r.id}
                    data-target-id={r.card ? undefined : r.id}
                    data-domain={t.domain}
                    className={`net-node net-ref ${r.logo ? "net-logo" : ""} ${t.className} ${lit.ids.has(r.id) ? "is-lit" : ""} ${active.id === r.id ? "is-active" : ""}`}
                    style={t.style}
                    onPointerEnter={() => pick({ kind: "ref", id: r.id })}
                    onFocus={() => focusNode({ kind: "ref", id: r.id })}
                    onClick={() => (r.card ? dispatchUI({ type: "highlight", targetId: r.card }) : pick({ kind: "ref", id: r.id }))}
                    onKeyDown={keys({ kind: "ref", id: r.id })}
                  >
                    {/* A monogram stands in for a missing logo, so it is drawn like one (generated content): as text it
                        would be part of the node's visible label ("IF Induforum 2027"), which its aria-label has to contain. */}
                    <span className="net-disc" data-mono={!r.logo && !r.glyph ? (r.monogram ?? undefined) : undefined}>
                      {r.logo ? <Image src={r.logo} alt="" width={40} height={40} sizes="64px" className="size-full rounded-full object-contain" /> : r.glyph ? <Glyph name={r.glyph} className="size-[22px]" /> : null}
                    </span>
                    <span className="net-label">{r.label}</span>
                  </button>
                );
              })}
            </>
          ) : null}
        </div>

        <div className="card mt-4 flex min-h-[100px] flex-col justify-center px-6 py-4 md:px-7" aria-live="polite">
          <Details active={active} skills={skills} refs={refs} labels={labels} select={pick} />
        </div>
      </div>

      {/* phones and tablets: a list by domain, details in a bottom sheet */}
      <div className="skills-list space-y-8 lg:hidden">
        {[...new Set(skills.map((s) => s.domain))].map((d) => (
          <div key={d} data-domain={d}>
            <p className="text-[14px] font-semibold text-[var(--d)]">{skills.find((s) => s.domain === d)?.domainLabel}</p>
            <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {skills
                .filter((s) => s.domain === d)
                .map((s) => (
                  <li key={s.id}>
                    <button type="button" data-target-id={s.id} onClick={() => setSheet({ kind: "skill", id: s.id })} className="card flex w-full items-center gap-3 p-3 text-left">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--bg)] shadow-[inset_0_0_0_1.5px_var(--d)] dark:bg-[rgb(255_255_255/0.04)]" style={{ color: s.color }}>
                        <StackIcon id={s.id} className="size-4" />
                      </span>
                      <span className="min-w-0 text-[14px] font-medium leading-tight text-fg [overflow-wrap:anywhere]">{s.label}</span>
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        ))}
        {sheet
          ? createPortal(
              <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label={labels.usedIn} onKeyDown={(e) => e.key === "Escape" && setSheet(null)}>
                <button type="button" aria-label={labels.close} className="absolute inset-0 bg-[rgb(0_0_0/0.3)]" onClick={() => setSheet(null)} />
                <div className="sheet absolute inset-x-0 bottom-0 rounded-t-[24px] bg-[var(--bg)] p-6 pb-[max(28px,env(safe-area-inset-bottom))] shadow-[var(--shadow-lg)]">
                  <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-[var(--line-strong)]" aria-hidden />
                  <Details active={sheet} skills={skills} refs={refs} labels={labels} select={(a) => setSheet(a)} />
                  <button type="button" autoFocus onClick={() => setSheet(null)} className="btn btn-secondary btn-sm mt-6 w-full">
                    {labels.close}
                  </button>
                </div>
              </div>,
              document.body,
            )
          : null}
      </div>
    </>
  );
}
