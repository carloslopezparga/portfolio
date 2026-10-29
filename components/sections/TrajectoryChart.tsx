"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { DomainId } from "@/content/types";
import { AXIS, brownianBridges } from "@/lib/timeline";

export interface TItem {
  id: string;
  lane: "education" | "work" | "leadership";
  domain: DomainId;
  start: number;
  /** null = present (drawn to now, then fading). */
  end: number | null;
  future: boolean;
  label: string;
  title: string;
  org: string;
  period: string;
  status: string | null;
  summary: string | null;
  bullets: string[];
  chips: string[];
  logo: string | null;
  monogram: string;
  photo: string | null;
}

export interface TLabels {
  lanes: Record<TItem["lane"], string>;
  now: string;
  nowDate: string;
  fullTime: string;
  erasmus: string;
  thesis: string;
  paths: string;
  close: string;
}

const W = 1200;
const LEFT = 118;
const RIGHT = 150;
const ROW = 34;
const BAR = 24;
const TOP = 40;
const LANE_GAP = 18;
const PX_PER_MONTH = (W - LEFT - RIGHT) / AXIS.months;
const x = (m: number) => LEFT + m * PX_PER_MONTH;
const textWidth = (label: string) => label.length * 6.8;
/** Bars too short for their label get it outside, to the right. */
const labelInside = (it: TItem, barW: number) => barW >= textWidth(it.label) + 34;

/** Greedy rows; a label drawn outside its bar takes room in the row too. */
function layoutRows(items: TItem[], now: number) {
  const rows: number[] = [];
  const pos = new Map<string, number>();
  [...items]
    .sort((a, b) => a.start - b.start)
    .forEach((it) => {
      const barEnd = it.end ?? now + 40 / PX_PER_MONTH;
      const barW = Math.max((barEnd - it.start) * PX_PER_MONTH, 26);
      const end = labelInside(it, barW) ? barEnd : it.start + (barW + 8 + textWidth(it.label) + 12) / PX_PER_MONTH;
      let r = rows.findIndex((free) => free <= it.start + 0.01);
      if (r < 0) {
        r = rows.length;
        rows.push(0);
      }
      rows[r] = end;
      pos.set(it.id, r);
    });
  return { pos, count: Math.max(1, rows.length) };
}

/**
 * 2023 → 2028 on one screen: one lane each for education, work and
 * leadership. Each milestone is a bar with its logo and domain colour;
 * hover/focus/tap opens its card. The future is a fan of Monte Carlo paths
 * (Brownian bridges) that converge on "Full-time · Jan 2028".
 */
export function TrajectoryChart({ items, now, erasmus, fullTime, labels }: { items: TItem[]; now: number; erasmus: { start: number; end: number }; fullTime: number; labels: TLabels }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [pinned, setPinned] = useState(false);
  const [scale, setScale] = useState(1);

  const lanes = useMemo(() => {
    let y = TOP;
    return (["education", "work", "leadership"] as const).map((lane) => {
      const li = items.filter((i) => i.lane === lane);
      const { pos, count } = layoutRows(li, now);
      const top = y;
      const h = count * ROW + 12;
      y += h + LANE_GAP;
      return { lane, items: li, pos, top, h };
    });
  }, [items, now]);
  const H = lanes[lanes.length - 1].top + lanes[lanes.length - 1].h + 24;
  const coneMid = lanes[1].top + 6 + ROW / 2;
  const coneSpread = (H - TOP) * 0.3;

  const paths = useMemo(() => {
    const x0 = x(now);
    const x1 = x(fullTime);
    return brownianBridges(26, 14).map((b) => smoothPath(b.map((v, i) => [x0 + ((x1 - x0) * i) / (b.length - 1), coneMid + v * coneSpread])));
  }, [now, fullTime, coneMid, coneSpread]);

  useEffect(() => {
    const el = ref.current!;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / W));
    ro.observe(el);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActive(null);
        setPinned(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const activeItem = items.find((i) => i.id === active) ?? null;
  const geom = (it: TItem) => {
    const lane = lanes.find((l) => l.lane === it.lane)!;
    const r = lane.pos.get(it.id) ?? 0;
    const y = lane.top + 6 + r * ROW + (ROW - BAR) / 2;
    const x1 = x(it.start);
    const x2 = x(it.end ?? now);
    return { x1, x2, y };
  };

  let cardStyle: React.CSSProperties | undefined;
  if (activeItem) {
    const g = geom(activeItem);
    const left = Math.min(Math.max(8, g.x1 * scale), W * scale - 348);
    const below = g.y * scale + BAR * scale + 10;
    const flip = g.y > H * 0.55;
    cardStyle = flip ? { left, bottom: (H - g.y) * scale + 10 } : { left, top: below };
  }

  return (
    <div ref={ref} className={`relative ${on ? "is-on" : ""}`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full overflow-visible" role="group" aria-label="Trajectory 2023–2028">
        {/* year axis */}
        {Array.from({ length: 6 }, (_, i) => {
          const xx = x(i * 12);
          const underNow = xx > x(now) - 44 && xx < x(now) + 150; // the "now" label sits there
          return (
            <g key={i}>
              <line x1={xx} x2={xx} y1={TOP - 14} y2={H - 16} className="stroke-line" strokeDasharray="2 5" />
              {underNow ? null : (
                <text x={xx + 4} y={TOP - 18} className="fill-dim font-mono text-[11px] tracking-[0.1em]">
                  {AXIS.startYear + i}
                </text>
              )}
            </g>
          );
        })}

        {/* lanes */}
        {lanes.map((l) => (
          <g key={l.lane}>
            <line x1={LEFT - 8} x2={W - RIGHT + 30} y1={l.top + l.h + LANE_GAP / 2} y2={l.top + l.h + LANE_GAP / 2} className="stroke-line" />
            <text x={0} y={l.top + 6 + ROW / 2 + 4} className="fill-dim font-mono text-[11px] uppercase tracking-[0.12em]">
              {labels.lanes[l.lane]}
            </text>
          </g>
        ))}

        {/* future: Erasmus band + Monte Carlo cone */}
        <g data-domain="data" className="mc">
          <rect x={x(erasmus.start)} y={TOP - 6} width={x(erasmus.end) - x(erasmus.start)} height={H - TOP - 10} className="fill-[rgb(var(--d-rgb)/0.06)]" />
          {paths.map((d, i) => (
            <path key={i} d={d} pathLength={1} fill="none" className="mc-path stroke-[var(--d)]" strokeWidth={1} strokeOpacity={0.2} style={{ "--dl": `${(i % 10) * 0.06}s` } as React.CSSProperties} />
          ))}
          <path d={`M${x(now)} ${coneMid} L${x(fullTime)} ${coneMid}`} pathLength={1} className="mc-path stroke-[var(--d)]" strokeWidth={1.5} strokeOpacity={0.8} fill="none" style={{ "--dl": "0.5s" } as React.CSSProperties} />
          <text x={x(erasmus.start) + 4} y={TOP + 4} className="fill-[var(--d)] font-mono text-[10px] uppercase tracking-[0.12em]">
            {labels.erasmus}
          </text>
          <g data-target-id="full-time">
            <circle cx={x(fullTime)} cy={coneMid} r={5} className="fill-[var(--d)]" style={{ filter: "drop-shadow(0 0 6px rgb(var(--d-rgb)))" }} />
            <text x={x(fullTime) - 10} y={coneMid - 14} textAnchor="end" className="fill-muted font-mono text-[10px] uppercase tracking-[0.12em]">
              {labels.thesis} →
            </text>
            <text x={x(fullTime) + 12} y={coneMid + 4} className="fill-fg text-[13px] font-medium">
              {labels.fullTime}
            </text>
          </g>
          <text x={x(now) + (x(fullTime) - x(now)) / 2} y={H - 4} textAnchor="middle" className="fill-dim font-mono text-[10px] uppercase tracking-[0.12em]">
            {labels.paths}
          </text>
        </g>

        {/* bars */}
        {items.map((it) => {
          const { x1, x2, y } = geom(it);
          const w = Math.max(x2 - x1, 26);
          const inside = labelInside(it, it.end === null ? x(now) + 40 - x1 : w);
          const gid = `fade-${it.id}`;
          const on = active === it.id;
          return (
            <g
              key={it.id}
              data-target-id={it.id}
              data-domain={it.domain}
              className="tr-bar cursor-pointer outline-none"
              role="button"
              tabIndex={0}
              aria-description={`${it.title} · ${it.period}`}
              aria-expanded={on}
              onPointerEnter={() => !pinned && setActive(it.id)}
              onPointerLeave={() => !pinned && setActive(null)}
              onFocus={() => setActive(it.id)}
              onBlur={() => !pinned && setActive(null)}
              onClick={() => {
                setActive(it.id);
                setPinned((p) => (active === it.id ? !p : true));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActive(it.id);
                  setPinned(true);
                }
              }}
            >
              {it.end === null ? (
                <defs>
                  <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1={x(now) - 30} x2={x(now) + 40} y1="0" y2="0">
                    <stop offset="0" stopColor="rgb(var(--d-rgb))" stopOpacity="0.16" />
                    <stop offset="1" stopColor="rgb(var(--d-rgb))" stopOpacity="0" />
                  </linearGradient>
                </defs>
              ) : null}
              <rect
                x={x1}
                y={y}
                width={it.end === null ? x(now) + 40 - x1 : w}
                height={BAR}
                rx={BAR / 2}
                fill={it.end === null ? `url(#${gid})` : "rgb(var(--d-rgb) / 0.13)"}
                className="tr-rect stroke-[var(--d)]"
                strokeOpacity={on ? 1 : 0.6}
                strokeWidth={on ? 1.5 : 1}
                strokeDasharray={it.future ? "4 3" : undefined}
              />
              <circle cx={x1 + BAR / 2} cy={y + BAR / 2} r={BAR / 2 - 2.5} className="fill-surface stroke-[var(--d)]" strokeWidth={1} />
              {it.logo ? (
                <image href={it.logo} x={x1 + 5} y={y + 5} width={BAR - 10} height={BAR - 10} preserveAspectRatio="xMidYMid meet" />
              ) : (
                <text x={x1 + BAR / 2} y={y + BAR / 2 + 3} textAnchor="middle" className="fill-[var(--d)] font-mono text-[7.5px] font-semibold" aria-hidden>
                  {it.monogram}
                </text>
              )}
              <text
                x={inside ? x1 + BAR + 6 : x1 + (it.end === null ? x(now) + 40 - x1 : Math.max(w, BAR)) + 8}
                y={y + BAR / 2 + 4}
                className={`tr-label text-[12.5px] ${on ? "fill-fg" : "fill-muted"}`}
              >
                {it.label}
              </text>
            </g>
          );
        })}

        {/* now: a small gear on the axis */}
        <g>
          <line x1={x(now)} x2={x(now)} y1={TOP - 10} y2={H - 16} className="stroke-fg" strokeOpacity="0.55" strokeDasharray="3 3" />
          <g transform={`translate(${x(now)} ${TOP - 22})`}>
            <g className="gear-spin" style={{ "--period": "14s" } as React.CSSProperties}>
              <path d={gearPath(7, 8, 5.6)} className="fill-bg stroke-fg" strokeWidth="1" />
              <circle r="2" className="fill-fg" />
            </g>
          </g>
          <text x={x(now) + 12} y={TOP - 18} className="fill-fg font-mono text-[11px] uppercase tracking-[0.12em]">
            {labels.now} · {labels.nowDate}
          </text>
        </g>
      </svg>

      {/* detail card */}
      {activeItem ? (
        <div
          role="dialog"
          aria-label={activeItem.title}
          data-domain={activeItem.domain}
          className="panel-blur absolute z-20 w-[340px] rounded-[18px] p-4 shadow-[0_0_0_1px_rgb(var(--d-rgb)/0.55),0_24px_70px_-24px_rgb(0_0_0/0.7),0_0_40px_-14px_rgb(var(--d-rgb)/0.7)]"
          style={cardStyle}
          onPointerEnter={() => setPinned(true)}
          onPointerLeave={() => {
            setPinned(false);
            setActive(null);
          }}
        >
          {activeItem.photo ? (
            <div className="relative mb-3 aspect-[16/9] overflow-hidden rounded-[12px]">
              <Image src={activeItem.photo} alt="" fill sizes="340px" className="object-cover" />
            </div>
          ) : null}
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-surface-2 shadow-[inset_0_0_0_1px_rgb(var(--d-rgb)/0.6)]">
              {activeItem.logo ? (
                <Image src={activeItem.logo} alt="" width={28} height={28} unoptimized={activeItem.logo.endsWith(".svg")} className="size-7 object-contain" />
              ) : (
                <span className="font-mono text-[10px] font-semibold text-[var(--d)]">{activeItem.monogram}</span>
              )}
            </span>
            <div className="min-w-0">
              <p className="text-[15px] font-medium leading-tight text-fg">{activeItem.title}</p>
              <p className="text-[13px] text-muted">{activeItem.org}</p>
              <p className="mono-label mt-1 !text-[10px]">
                {activeItem.period}
                {activeItem.status ? <span className="!text-[var(--d)]"> · {activeItem.status}</span> : null}
              </p>
            </div>
          </div>
          {activeItem.summary ? <p className="mt-3 text-[13.5px] leading-relaxed text-muted">{activeItem.summary}</p> : null}
          {activeItem.bullets.length ? (
            <ul className="mt-2 space-y-1 text-[13px] leading-snug text-muted">
              {activeItem.bullets.map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="mt-[0.6em] h-px w-2.5 shrink-0 bg-[var(--d)]" />
                  {b}
                </li>
              ))}
            </ul>
          ) : null}
          {activeItem.chips.length ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {activeItem.chips.map((c) => (
                <span key={c} className="mono-label rounded-full px-2 py-1 !text-[9.5px] shadow-[inset_0_0_0_1px_var(--line-strong)]">
                  {c}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** Smooth polyline through points (quadratic segments via midpoints). */
function smoothPath(pts: number[][]) {
  const f = (n: number) => n.toFixed(1);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2;
    const my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += ` Q${f(pts[i][0])} ${f(pts[i][1])} ${f(mx)} ${f(my)}`;
  }
  const last = pts[pts.length - 1];
  return `${d} L${f(last[0])} ${f(last[1])}`;
}

/** Small gear outline for the "now" marker. */
function gearPath(teeth: number, ro: number, ri: number) {
  const pts: string[] = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    [
      [ri, 0],
      [ro, 0.18],
      [ro, 0.45],
      [ri, 0.62],
    ].forEach(([r, f], j) => pts.push(`${i === 0 && j === 0 ? "M" : "L"}${(Math.cos(a + step * f) * r).toFixed(2)} ${(Math.sin(a + step * f) * r).toFixed(2)}`));
  }
  return pts.join(" ") + " Z";
}
