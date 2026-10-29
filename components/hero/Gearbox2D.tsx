import type { CSSProperties } from "react";
import { GEAR, neuralMesh, PLANET_DOMAINS, toothPath } from "@/lib/gears";

const S = 100; // px per gear unit (in a 400 × 400 drawing)
const C = 200; // centre
const SUN_PERIOD = 22; // seconds per sun revolution
const P = 62; // half-size of a planet's box

const ring = toothPath(GEAR.zRing, GEAR.rRing, S, C, C, true);
const sun = toothPath(GEAR.zSun, GEAR.rSun, S, C, C);
const planet = toothPath(GEAR.zPlanet, GEAR.rPlanet, S, 0, 0);
const mesh = neuralMesh(11, 22, C, C);
const planetCentres = GEAR.planetAngles.map((a) => [C + Math.cos(a) * GEAR.orbit * S, C - Math.sin(a) * GEAR.orbit * S]);
const pct = (v: number) => `${(v / 400) * 100}%`;
const layer = "absolute inset-0 size-full";

/**
 * The assembled gearbox seen from above, as decoration. Each moving part is
 * its own layer turned with a CSS animation on an HTML element, so the
 * compositor does the work (no repaint per frame); paused with reduced
 * motion. The neural core pulses faster while the agent answers.
 * Server-rendered: no JavaScript of its own.
 */
export function Gearbox2D({ className }: { className?: string }) {
  return (
    <div className={`relative ${className ?? ""}`} aria-hidden>
      {/* ring gear (fixed) */}
      <svg viewBox="0 0 400 400" className={layer}>
        <circle cx={C} cy={C} r={(GEAR.rRing + 0.42) * S} fill="none" className="stroke-muted" strokeOpacity="0.4" strokeWidth="1" />
        <path d={ring} fill="none" className="stroke-muted" strokeWidth="1" strokeOpacity="0.7" />
      </svg>

      {/* carrier: planets orbit at sun/4 and spin backwards at 3/4 of the sun's rate */}
      <div className={`gear-spin ${layer}`} style={{ "--period": `${SUN_PERIOD * 4}s` } as CSSProperties}>
        <svg viewBox="0 0 400 400" className={layer}>
          {planetCentres.map(([x, y], i) => (
            <line key={i} x1={C} y1={C} x2={x} y2={y} className="stroke-subtle" strokeDasharray="2 4" />
          ))}
        </svg>
        {planetCentres.map(([x, y], i) => (
          <div
            key={i}
            data-domain={PLANET_DOMAINS[i]}
            className="gear-spin-rev absolute"
            style={{ left: pct(x - P), top: pct(y - P), width: pct(P * 2), height: pct(P * 2), "--period": `${(SUN_PERIOD / 0.75).toFixed(2)}s` } as CSSProperties}
          >
            <svg viewBox={`${-P} ${-P} ${P * 2} ${P * 2}`} className="size-full overflow-visible">
              <path d={planet} fill="rgb(var(--d-rgb) / 0.08)" className="stroke-[rgb(var(--d-rgb))]" strokeWidth="1.3" />
              <circle r="9" fill="none" className="stroke-[rgb(var(--d-rgb))]" strokeOpacity="0.7" />
              <line x1="-9" x2="9" className="stroke-[rgb(var(--d-rgb))]" strokeOpacity="0.5" />
            </svg>
          </div>
        ))}
      </div>

      {/* sun gear: the AI core */}
      <div data-domain="ai" className={`gear-spin ${layer}`} style={{ "--period": `${SUN_PERIOD}s` } as CSSProperties}>
        <svg viewBox="0 0 400 400" className={layer}>
          <path d={sun} fill="rgb(var(--d-rgb) / 0.08)" className="stroke-[rgb(var(--d-rgb))]" strokeWidth="1.3" />
        </svg>
      </div>
      <div data-domain="ai" className={`neural-pulse ${layer}`}>
        <svg viewBox="0 0 400 400" className={layer}>
          <circle cx={C} cy={C} r="28" fill="none" className="stroke-[rgb(var(--d-rgb))]" strokeOpacity="0.6" />
          {mesh.edges.map(([a, b], i) => (
            <line key={i} x1={mesh.nodes[a][0]} y1={mesh.nodes[a][1]} x2={mesh.nodes[b][0]} y2={mesh.nodes[b][1]} className="stroke-[rgb(var(--d-rgb))]" strokeOpacity="0.65" strokeWidth="0.8" />
          ))}
          {mesh.nodes.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 3 ? 1.6 : 2.4} className="fill-[rgb(var(--d-rgb))]" />
          ))}
        </svg>
      </div>
    </div>
  );
}
