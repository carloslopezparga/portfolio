import type { CSSProperties } from "react";
import { brownianBridges, smoothPath } from "@/lib/timeline";

const W = 600;
const H = 120;
const PAD = 14;
const paths = brownianBridges(18, 12, 23).map((b) => smoothPath(b.map((v, i) => [PAD + ((W - PAD * 2) * i) / (b.length - 1), H / 2 + v * H * 0.36])));

/**
 * The end of the education timeline, as a small detail: many possible paths
 * (Brownian bridges, fixed seed) from now to one destination.
 */
export function FutureCone({ from, to }: { from: string; to: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H + 22}`} className="cone block h-auto w-full" aria-hidden>
      <defs>
        <linearGradient id="cone-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" style={{ stopColor: "var(--blue)" }} />
          <stop offset="0.55" style={{ stopColor: "var(--purple)" }} />
          <stop offset="1" style={{ stopColor: "var(--pink)" }} />
        </linearGradient>
      </defs>
      {paths.map((d, i) => (
        <path key={i} d={d} pathLength={1} fill="none" stroke="url(#cone-grad)" strokeWidth="1" strokeOpacity="0.45" className="cone-path" style={{ "--dl": `${(i % 6) * 0.08}s` } as CSSProperties} />
      ))}
      <circle cx={PAD} cy={H / 2} r="3.5" className="fill-muted" />
      <circle cx={W - PAD} cy={H / 2} r="5" style={{ fill: "var(--pink)", filter: "drop-shadow(0 0 6px var(--pink))" }} />
      <text x={PAD} y={H + 16} className="fill-dim font-mono text-[11px] uppercase tracking-[0.1em]">
        {from}
      </text>
      <text x={W - PAD} y={H + 16} textAnchor="end" className="fill-fg text-[12.5px] font-medium">
        {to}
      </text>
    </svg>
  );
}
