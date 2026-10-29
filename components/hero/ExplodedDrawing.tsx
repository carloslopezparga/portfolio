import type { DomainId } from "@/content/types";

/**
 * Static exploded view of the gearbox, drawn like a parts sheet: discs along
 * the axis, balloons with leader lines and an overall height dimension.
 * Shown while the 3D scene loads, without WebGL, and with reduced motion.
 */
const K = 0.36; // isometric squash

function Disc({ cx, cy, rx, t, inner, teeth, domain, opacity = 1 }: { cx: number; cy: number; rx: number; t: number; inner?: number; teeth?: boolean; domain?: DomainId; opacity?: number }) {
  const ry = rx * K;
  return (
    <g data-domain={domain} className={domain ? "stroke-[var(--d)]" : "stroke-subtle"} fill="none" strokeWidth="1" opacity={opacity}>
      <path d={`M${cx - rx} ${cy} v${t} A${rx} ${ry} 0 0 0 ${cx + rx} ${cy + t} v${-t}`} opacity="0.7" />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} strokeDasharray={teeth ? "3 2.5" : undefined} fill={domain ? "rgb(var(--d-rgb) / 0.04)" : "none"} />
      {inner ? <ellipse cx={cx} cy={cy} rx={inner} ry={inner * K} opacity="0.8" strokeDasharray={teeth ? "3 2.5" : undefined} /> : null}
    </g>
  );
}

export function ExplodedDrawing({ labels, className }: { labels: { id: DomainId; label: string }[]; className?: string }) {
  const cx = 330;
  const planetDomains: DomainId[] = ["automation", "data", "ops"];
  const planets = [0, 1, 2].map((i) => {
    const a = Math.PI / 2 + (i * Math.PI * 2) / 3;
    return { x: cx + Math.cos(a) * 108, y: 290 - Math.sin(a) * 108 * K, d: planetDomains[i] };
  });
  const anchor: Record<DomainId, [number, number]> = {
    ai: [cx + 50, 205],
    automation: [planets[0].x + 46, planets[0].y],
    data: [planets[1].x - 46, planets[1].y],
    ops: [planets[2].x + 46, planets[2].y],
    engineering: [cx + 180, 410],
  };
  const rows: [DomainId, number][] = [
    ["ai", 150],
    ["automation", 230],
    ["data", 300],
    ["ops", 370],
    ["engineering", 450],
  ];
  return (
    <svg viewBox="0 0 800 560" className={className} aria-hidden>
      {/* axis */}
      <line x1={cx} x2={cx} y1="18" y2="520" className="stroke-subtle" strokeDasharray="4 5" />

      {/* overall height dimension */}
      <g className="stroke-subtle" fill="none">
        <path d="M118 36 h28 M118 470 h28" />
        <path d="M132 40 V466" />
        <path d="M132 36 l-4 9 h8 z M132 470 l-4 -9 h8 z" className="fill-[var(--subtle)]" />
      </g>
      <text transform="translate(120 268) rotate(-90)" textAnchor="middle" className="fill-dim font-mono text-[10px] uppercase tracking-[0.14em]">
        H 412
      </text>

      {/* parts, top to bottom */}
      <g className="stroke-subtle" fill="none" opacity="0.7">
        <path d={`M${cx - 11} 36 v120 M${cx + 11} 36 v120`} />
        <ellipse cx={cx} cy={36} rx={11} ry={11 * K} />
      </g>
      <Disc cx={cx} cy={118} rx={122} t={10} inner={18} opacity={0.75} />
      <Disc cx={cx} cy={200} rx={50} t={30} inner={30} teeth domain="ai" />
      <g data-domain="ai" className="neural-pulse">
        {[[-12, -3], [8, -5], [-2, 6], [14, 4], [-15, 5], [4, -9]].map(([dx, dy], i) => (
          <circle key={i} cx={cx + dx} cy={200 + dy} r="1.8" className="fill-[var(--d)]" />
        ))}
        <path d={`M${cx - 12} 197 L${cx + 8} 195 L${cx - 2} 206 L${cx + 14} 204 M${cx - 15} 205 L${cx - 2} 206 M${cx + 4} 191 L${cx + 8} 195`} className="stroke-[var(--d)]" strokeWidth="0.8" fill="none" opacity="0.7" />
      </g>
      {planets.map((p, i) => (
        <Disc key={i} cx={p.x} cy={p.y} rx={46} t={26} inner={10} teeth domain={p.d} />
      ))}
      <Disc cx={cx} cy={402} rx={180} t={34} inner={140} teeth domain="engineering" />

      {/* balloons */}
      {rows.map(([d, y], i) => {
        const [ax, ay] = anchor[d];
        const lx = 600;
        const l = labels.find((x) => x.id === d)?.label ?? d;
        return (
          <g key={d} data-domain={d}>
            <circle cx={ax} cy={ay} r="2.5" className="fill-[var(--d)]" />
            <path d={`M${ax} ${ay} L${lx - 24} ${y} H${lx - 6}`} fill="none" className="stroke-[var(--line-strong)]" />
            <text x={lx} y={y + 3.5} className="fill-dim font-mono text-[10px] uppercase tracking-[0.12em]">
              <tspan className="fill-[var(--d)]">{String(i + 1).padStart(2, "0")}</tspan> · {l}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
