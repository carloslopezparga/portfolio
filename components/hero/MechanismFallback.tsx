/**
 * Static isometric drawing of the exploded gearbox. Shown while the 3D scene
 * loads, without WebGL, and with reduced motion.
 */
const K = 0.36; // ellipse squash for the isometric view

function Disc({ cx, cy, rx, t, inner, teeth, hot }: { cx: number; cy: number; rx: number; t: number; inner?: number; teeth?: boolean; hot?: boolean }) {
  const ry = rx * K;
  return (
    <g className={hot ? "stroke-ice" : "stroke-accent"} fill="none" strokeWidth="1">
      <path d={`M${cx - rx} ${cy} v${t} A${rx} ${ry} 0 0 0 ${cx + rx} ${cy + t} v${-t}`} opacity="0.7" />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} strokeDasharray={teeth ? "3 2.5" : undefined} />
      {inner ? <ellipse cx={cx} cy={cy} rx={inner} ry={inner * K} opacity="0.8" strokeDasharray={teeth ? "3 2.5" : undefined} /> : null}
    </g>
  );
}

export function MechanismFallback({ labels, className }: { labels: string[]; className?: string }) {
  const cx = 300;
  const planets = [0, 1, 2].map((i) => {
    const a = Math.PI / 2 + (i * Math.PI * 2) / 3;
    return { x: cx + Math.cos(a) * 92, y: 262 - Math.sin(a) * 92 * K };
  });
  const rows = [
    { y: 478, label: labels[0] },
    { y: 372, label: labels[1] },
    { y: 262, label: labels[2] },
    { y: 186, label: labels[3] },
    { y: 118, label: labels[4] },
    { y: 44, label: labels[5] },
  ];
  return (
    <svg viewBox="0 0 780 560" className={className} aria-hidden>
      <line x1={cx} x2={cx} y1="20" y2="540" className="stroke-subtle" strokeDasharray="4 5" />
      <Disc cx={cx} cy={478} rx={200} t={14} inner={22} />
      <Disc cx={cx} cy={372} rx={176} t={34} inner={132} teeth />
      {planets.map((p, i) => (
        <Disc key={i} cx={p.x} cy={p.y} rx={46} t={26} inner={10} teeth />
      ))}
      <Disc cx={cx} cy={186} rx={48} t={34} inner={13} teeth hot />
      <Disc cx={cx} cy={118} rx={118} t={11} inner={18} />
      <g className="stroke-ice" fill="none">
        <path d={`M${cx - 12} 44 v150 M${cx + 12} 44 v150`} opacity="0.8" />
        <ellipse cx={cx} cy={44} rx={12} ry={12 * K} />
      </g>
      {rows.map((r, i) => (
        <g key={i} transform={`translate(${cx + 212} ${r.y})`}>
          <circle r="2.5" className="fill-ice" />
          <line x1="6" x2="40" className="stroke-line-strong" />
          <text x="48" y="3.5" className="fill-dim font-mono text-[10px] uppercase tracking-[0.12em]">
            <tspan className="fill-ice">{String(i + 1).padStart(2, "0")}</tspan> · {r.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
