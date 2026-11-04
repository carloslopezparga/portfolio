"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import type { DomainId, StackId } from "@/content/types";
import { link, wrap, type GraphLayout } from "@/lib/graph";
import { getPrefs } from "@/lib/prefs";
import { dispatchUI, onUI } from "@/lib/ui-bus";
import { Glyph, StackIcon, type GlyphName } from "@/components/ui/icons";

export interface GraphSkill {
  id: StackId;
  label: string;
  domain: DomainId;
  domainLabel: string;
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

const tone = (r: GraphRef) => ({ className: r.brand ? "brand" : "", style: r.brand ?? undefined, domain: r.brand ? undefined : (r.domain ?? undefined) });

/** What the inspector and the phone sheet show for the active node. */
function Details({ active, skills, refs, labels, select }: { active: Active; skills: GraphSkill[]; refs: GraphRef[]; labels: GraphLabels; select: (a: Active) => void }) {
  if (active.kind === "skill") {
    const s = skills.find((x) => x.id === active.id)!;
    return (
      <div data-domain={s.domain} className="flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
        <div className="flex items-center gap-4 md:w-[300px] md:shrink-0">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-[var(--bg)] text-[var(--d)] shadow-[inset_0_0_0_1.5px_var(--d)] dark:bg-[rgb(255_255_255/0.04)]">
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
        <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-white text-[var(--d)] shadow-[inset_0_0_0_1.5px_var(--d)]">
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
                <StackIcon id={s.id} className="size-3.5" />
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
 * Skills graph. Desktop: white nodes with an icon and a ring in their domain
 * colour, grouped by domain on both sides; projects, jobs and studies as
 * larger nodes in the middle; faint "used in" lines that light up in colour.
 * At rest a tour highlights a different skill every few seconds (it stops for
 * good once you interact); the inspector underneath always shows something.
 * Phones: a list by domain and a bottom sheet.
 */
export function SkillsGraph({ skills, refs, layout, labels }: { skills: GraphSkill[]; refs: GraphRef[]; layout: GraphLayout; labels: GraphLabels }) {
  const order = useMemo(() => skills.map((s) => s.id), [skills]);
  const [active, setActive] = useState<Active>({ kind: "skill", id: skills[0].id });
  const [touched, setTouched] = useState(false);
  const [sheet, setSheet] = useState<Active | null>(null);
  const [show, setShow] = useState(false);
  const graphRef = useRef<HTMLDivElement>(null);

  // The SVG graph is desktop-only: it mounts when its (visible) box nears the
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

  // The tour: one skill after another while the graph is on screen and untouched.
  useEffect(() => {
    if (touched || getPrefs().reduced) return;
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
  }, [touched, order]);

  // The agent (or a click elsewhere) highlighting a skill selects it here too.
  useEffect(
    () =>
      onUI("highlight", ({ targetId }) => {
        if (skills.some((s) => s.id === targetId)) pick({ kind: "skill", id: targetId });
        else if (refs.some((r) => r.id === targetId)) pick({ kind: "ref", id: targetId });
      }),
    [skills, refs, pick],
  );

  const pos = new Map([...layout.skills, ...layout.refs].map((p) => [p.id, p]));
  const lit = new Set<string>([active.id]);
  if (active.kind === "skill") skills.find((s) => s.id === active.id)?.usedIn.forEach((u) => lit.add(u.id));
  else skills.forEach((s) => s.usedIn.some((u) => u.id === active.id) && lit.add(s.id));
  const isOn = (skill: string, ref: string) => (active.kind === "skill" ? active.id === skill : active.id === ref);
  const keys = (a: Active) => (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick(a);
    }
  };

  return (
    <>
      {/* desktop: the graph and its inspector */}
      <div ref={graphRef} className="hidden lg:block">
        {show ? (
          <svg viewBox={`0 0 ${layout.w} ${layout.h}`} className="skills-graph block h-auto w-full" role="group" aria-label={labels.tour}>
            <g aria-hidden>
              {skills.flatMap((s) =>
                s.usedIn.map((u) => {
                  const a = pos.get(s.id)!;
                  const b = pos.get(u.id)!;
                  const on = isOn(s.id, u.id);
                  return <path key={`${s.id}-${u.id}`} d={link(a, b)} data-domain={s.domain} className={`g-link ${on ? "is-on" : ""}`} style={{ strokeWidth: on ? 1.2 + u.w * 0.6 : 1 }} />;
                }),
              )}
            </g>

            {layout.clusters.map((c) => (
              <text key={c.id} x={c.x} y={c.y} textAnchor={c.anchor} data-domain={c.id} className="fill-[var(--d)] text-[13px] font-semibold" aria-hidden>
                {skills.find((s) => s.domain === c.id)?.domainLabel}
              </text>
            ))}

            {refs.map((r) => {
              const p = pos.get(r.id)!;
              const on = lit.has(r.id);
              const t = tone(r);
              return (
                <g
                  key={r.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${r.label} · ${r.kindLabel}`}
                  aria-pressed={active.id === r.id}
                  data-target-id={r.card ? undefined : r.id}
                  className={`g-node g-ref ${t.className} ${on ? "is-lit" : ""} ${active.id === r.id ? "is-active" : ""}`}
                  style={t.style}
                  data-domain={t.domain}
                  onPointerEnter={() => pick({ kind: "ref", id: r.id })}
                  onFocus={() => pick({ kind: "ref", id: r.id })}
                  onClick={() => (r.card ? dispatchUI({ type: "highlight", targetId: r.card }) : pick({ kind: "ref", id: r.id }))}
                  onKeyDown={keys({ kind: "ref", id: r.id })}
                >
                  <circle cx={p.x} cy={p.y} r={34} fill="transparent" />
                  <circle cx={p.x} cy={p.y} r={27} className="g-disc" />
                  {r.logo ? (
                    <>
                      <clipPath id={`clip-${r.id}`}>
                        <circle cx={p.x} cy={p.y} r={21} />
                      </clipPath>
                      <image href={r.logo} x={p.x - 21} y={p.y - 21} width={42} height={42} clipPath={`url(#clip-${r.id})`} preserveAspectRatio="xMidYMid meet" />
                    </>
                  ) : r.glyph ? (
                    <g transform={`translate(${p.x - 11} ${p.y - 11})`} className="text-[var(--d)]">
                      <Glyph name={r.glyph} size={22} />
                    </g>
                  ) : r.monogram ? (
                    <text x={p.x} y={p.y + 5} textAnchor="middle" className="fill-[var(--d)] text-[14px] font-bold">
                      {r.monogram}
                    </text>
                  ) : null}
                  {wrap(r.label, 18).map((line, i) => (
                    <text key={i} x={p.x} y={p.y + 46 + i * 15} textAnchor="middle" className="g-label text-[12.5px] font-semibold">
                      {line}
                    </text>
                  ))}
                </g>
              );
            })}

            {skills.map((s) => {
              const p = pos.get(s.id)!;
              return (
                <g
                  key={s.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${s.label} · ${s.domainLabel}`}
                  aria-pressed={active.id === s.id}
                  data-target-id={s.id}
                  data-domain={s.domain}
                  className={`g-node g-skill ${lit.has(s.id) ? "is-lit" : ""} ${active.id === s.id ? "is-active" : ""}`}
                  onPointerEnter={() => pick({ kind: "skill", id: s.id })}
                  onFocus={() => pick({ kind: "skill", id: s.id })}
                  onClick={() => pick({ kind: "skill", id: s.id })}
                  onKeyDown={keys({ kind: "skill", id: s.id })}
                >
                  <circle cx={p.x} cy={p.y} r={30} fill="transparent" />
                  <circle cx={p.x} cy={p.y} r={29} className="g-halo" />
                  <circle cx={p.x} cy={p.y} r={21} className="g-disc" />
                  <g transform={`translate(${p.x - 9} ${p.y - 9})`} className="text-[var(--d)]">
                    <StackIcon id={s.id} size={18} />
                  </g>
                  {wrap(s.label).map((line, i) => (
                    <text key={i} x={p.x} y={p.y + 38 + i * 14} textAnchor="middle" className="g-label text-[12px] font-medium">
                      {line}
                    </text>
                  ))}
                </g>
              );
            })}
          </svg>
        ) : (
          <div style={{ aspectRatio: `${layout.w} / ${layout.h}` }} />
        )}

        <div className="card mt-6 min-h-[132px] p-6 md:p-7" aria-live="polite">
          <Details active={active} skills={skills} refs={refs} labels={labels} select={pick} />
        </div>
      </div>

      {/* phones and tablets: a list by domain, details in a bottom sheet */}
      <div className="space-y-8 lg:hidden">
        {[...new Set(skills.map((s) => s.domain))].map((d) => (
          <div key={d} data-domain={d}>
            <p className="text-[14px] font-semibold text-[var(--d)]">{skills.find((s) => s.domain === d)?.domainLabel}</p>
            <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {skills
                .filter((s) => s.domain === d)
                .map((s) => (
                  <li key={s.id}>
                    <button type="button" data-target-id={s.id} onClick={() => setSheet({ kind: "skill", id: s.id })} className="card flex w-full items-center gap-3 p-3 text-left">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--bg)] text-[var(--d)] shadow-[inset_0_0_0_1.5px_var(--d)] dark:bg-[rgb(255_255_255/0.04)]">
                        <StackIcon id={s.id} className="size-4" />
                      </span>
                      <span className="min-w-0 text-[14px] font-medium leading-tight text-fg">{s.label}</span>
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
