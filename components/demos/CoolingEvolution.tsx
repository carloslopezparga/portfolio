"use client";

import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useEffect, useMemo, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { usePrefs } from "@/lib/prefs";

if (typeof window !== "undefined") gsap.registerPlugin(DrawSVGPlugin);

const W = 640;
const H = 360;
const PAD = { l: 52, r: 24, t: 44, b: 52 };
const GENS = 10;
const N = 90;

/** Deterministic PRNG so server and client draw the same curves. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Synthetic data: each generation lowers and smooths the energy curve. */
function buildCurves() {
  const rand = mulberry32(42);
  const load = (x: number) => 0.62 + 0.14 * Math.sin(x * Math.PI * 2 * 1.1 + 0.4) + 0.08 * Math.sin(x * Math.PI * 2 * 3.3 + 1.2);
  const curves: number[][] = [];
  for (let g = 0; g <= GENS; g++) {
    const gain = 1 - 0.34 * (1 - Math.exp(-g / 3.2));
    const noiseAmp = 0.075 * Math.exp(-g / 3.6) + 0.006;
    const phase = rand() * 10;
    const pts: number[] = [];
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      const n = Math.sin(x * 37 + phase) * 0.5 + Math.sin(x * 83 + phase * 2) * 0.3 + (rand() - 0.5) * 0.4;
      pts.push(load(x) * gain + n * noiseAmp);
    }
    curves.push(pts);
  }
  return curves;
}

function toPath(pts: number[]) {
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  return pts
    .map((v, i) => {
      const x = PAD.l + (i / (pts.length - 1)) * iw;
      const y = PAD.t + (1 - (v - 0.2) / 0.75) * ih;
      return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

/**
 * Generations of controllers improving an energy curve. Synthetic data, always
 * labelled "Illustrative" until real simulator results replace it.
 */
export function CoolingEvolution({ labels }: { labels: { illustrative: string; x: string; y: string; baseline: string; best: string; gen: string } }) {
  const ref = useRef<SVGSVGElement>(null);
  const genRef = useRef<SVGTSpanElement>(null);
  const { reduced } = usePrefs();
  const paths = useMemo(() => buildCurves().map(toPath), []);
  const areaFor = (d: string) => `${d} L${W - PAD.r} ${H - PAD.b} L${PAD.l} ${H - PAD.b} Z`;

  useEffect(() => {
    const svg = ref.current!;
    const gens = Array.from(svg.querySelectorAll<SVGPathElement>("[data-gen]"));
    const areas = Array.from(svg.querySelectorAll<SVGPathElement>("[data-area]"));
    const setGen = (g: number) => {
      if (genRef.current) genRef.current.textContent = String(g).padStart(2, "0");
    };

    if (reduced) {
      gens.forEach((p, i) => gsap.set(p, { drawSVG: "100%", opacity: i === gens.length - 1 ? 1 : 0.22 }));
      gsap.set(areas[areas.length - 1], { opacity: 1 });
      setGen(GENS);
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(gens, { drawSVG: "0%", opacity: 1 });
      gsap.set(areas, { opacity: 0 });
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6, paused: true });
      gens.forEach((p, i) => {
        tl.call(() => setGen(i + 1));
        tl.to(p, { drawSVG: "100%", duration: i === 0 ? 1.1 : 0.85, ease: "site.inOut" });
        tl.to(areas[i], { opacity: 1, duration: 0.5 }, "<0.4");
        if (i > 0) {
          tl.to(gens[i - 1], { opacity: 0.2, duration: 0.5 }, "<");
          tl.to(areas[i - 1], { opacity: 0, duration: 0.5 }, "<");
        }
        tl.to({}, { duration: 0.15 });
      });
      tl.to({}, { duration: 2.2 });
      tl.to([...gens, ...areas], { opacity: 0, duration: 0.6, ease: "site.in" });
      tl.set(gens, { drawSVG: "0%", opacity: 1 });

      const io = new IntersectionObserver(([e]) => (e.isIntersecting ? tl.play() : tl.pause()), { threshold: 0.3 });
      io.observe(svg);
      return () => io.disconnect();
    }, svg);
    return () => ctx.revert();
  }, [reduced]);

  const yTicks = [0.25, 0.5, 0.75];
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${labels.illustrative}: ${labels.y} / ${labels.x}`}>
      <defs>
        <linearGradient id="cool-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgb(var(--glow))" stopOpacity="0.18" />
          <stop offset="1" stopColor="rgb(var(--glow))" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* plot frame + grid */}
      {yTicks.map((t) => (
        <line key={t} x1={PAD.l} x2={W - PAD.r} y1={PAD.t + t * ih} y2={PAD.t + t * ih} className="stroke-line" strokeDasharray="2 4" />
      ))}
      {[0.25, 0.5, 0.75].map((t) => (
        <line key={t} y1={PAD.t} y2={H - PAD.b} x1={PAD.l + t * iw} x2={PAD.l + t * iw} className="stroke-line" strokeDasharray="2 4" />
      ))}
      <path d={`M${PAD.l} ${PAD.t - 8} V${H - PAD.b} H${W - PAD.r + 8}`} className="stroke-line-strong" fill="none" />
      <text x={W - PAD.r} y={H - PAD.b + 26} textAnchor="end" className="fill-dim font-mono text-[9.5px] uppercase tracking-[0.12em]">
        {labels.x} →
      </text>
      <text transform={`translate(${PAD.l - 18} ${PAD.t + ih}) rotate(-90)`} className="fill-dim font-mono text-[9.5px] uppercase tracking-[0.12em]">
        {labels.y} →
      </text>

      {/* generation counter */}
      <text x={PAD.l + 12} y={PAD.t + 6} className="fill-fg font-mono text-[11px] tracking-[0.12em]">
        {labels.gen} <tspan ref={genRef}>00</tspan>
        <tspan className="fill-dim"> / {String(GENS).padStart(2, "0")}</tspan>
      </text>

      {/* illustrative badge — always visible */}
      <g transform={`translate(${W - PAD.r - 112} ${PAD.t - 30})`}>
        <rect width="112" height="22" rx="11" className="fill-bg stroke-ice" strokeDasharray="3 3" />
        <text x="56" y="14.5" textAnchor="middle" className="fill-ice font-mono text-[9px] uppercase tracking-[0.16em]">
          {labels.illustrative}
        </text>
      </g>

      {/* baseline (generation 0) stays as reference */}
      <path d={paths[0]} className="stroke-subtle" strokeDasharray="4 4" strokeWidth="1.2" fill="none" />

      {paths.slice(1).map((d, i) => (
        <g key={i}>
          <path data-area d={areaFor(d)} fill="url(#cool-area)" opacity="0" />
          <path
            data-gen
            d={d}
            fill="none"
            className={i === paths.length - 2 ? "stroke-ice" : "stroke-accent"}
            strokeWidth="1.6"
            strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 0 5px rgb(var(--glow) / 0.7))" }}
          />
        </g>
      ))}

      {/* legend */}
      <g transform={`translate(${PAD.l + 12} ${H - PAD.b - 14})`} className="font-mono text-[9px] uppercase tracking-[0.12em]">
        <line x1="0" x2="18" y1="0" y2="0" className="stroke-subtle" strokeDasharray="4 4" />
        <text x="24" y="3" className="fill-dim">
          {labels.baseline}
        </text>
        <line x1="120" x2="138" y1="0" y2="0" className="stroke-accent" strokeWidth="1.6" />
        <text x="144" y="3" className="fill-dim">
          {labels.best}
        </text>
      </g>
    </svg>
  );
}
