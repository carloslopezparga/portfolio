"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import type { DomainId } from "@/content/types";
import { GEAR, neuralMesh, PLANET_DOMAINS, toothPath } from "@/lib/gears";
import { onUI } from "@/lib/ui-bus";

export interface PartInfo {
  id: DomainId;
  label: string;
  part: string;
  highlights: string[];
}

const S = 100; // px per gear unit
const C = 200; // centre
const SUN_PERIOD = 22; // seconds per sun revolution

const ring = toothPath(GEAR.zRing, GEAR.rRing, S, C, C, true);
const sun = toothPath(GEAR.zSun, GEAR.rSun, S, C, C);
const planet = toothPath(GEAR.zPlanet, GEAR.rPlanet, S, 0, 0);
const mesh = neuralMesh(11, 22, C, C);
const planetCentres = GEAR.planetAngles.map((a) => [C + Math.cos(a) * GEAR.orbit * S, C - Math.sin(a) * GEAR.orbit * S]);

/**
 * Assembled gearbox seen from above. Turns on its own (pure CSS); tapping a
 * part shows what it stands for. Used on phones/tablets, and paused with
 * reduced motion.
 */
export function Gearbox2D({ parts, hint, className }: { parts: PartInfo[]; hint: string; className?: string }) {
  const [sel, setSel] = useState<DomainId | null>(null);
  const info = parts.find((p) => p.id === sel);

  useEffect(() => onUI("focus_part", (a) => setSel(a.part)), []);

  const partProps = (id: DomainId) => ({
    "data-domain": id,
    role: "button",
    tabIndex: 0,
    "aria-label": parts.find((p) => p.id === id)?.label,
    "aria-pressed": sel === id,
    onClick: () => setSel((s) => (s === id ? null : id)),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setSel((s) => (s === id ? null : id));
      }
    },
    className: `cursor-pointer outline-none transition-opacity duration-300 ${sel && sel !== id ? "opacity-30" : "opacity-100"}`,
    style: sel === id ? { filter: "drop-shadow(0 0 8px rgb(var(--d-rgb) / 0.9))" } : undefined,
  });

  return (
    <div className={className}>
      <svg viewBox="0 0 400 400" className="mx-auto block aspect-square w-full max-w-[min(420px,38svh)]" aria-label="Gearbox">
        {/* ring gear — engineering */}
        <g {...partProps("engineering")}>
          <circle cx={C} cy={C} r={(GEAR.rRing + 0.42) * S} fill="transparent" className="stroke-[var(--d)]" strokeOpacity="0.55" strokeWidth="1" />
          <path d={ring} fill="none" className="stroke-[var(--d)]" strokeWidth="1" strokeOpacity="0.85" />
        </g>

        {/* carrier: planets orbit at sun/4 */}
        <g className="gear-spin" style={{ "--period": `${SUN_PERIOD * 4}s`, transformBox: "view-box", transformOrigin: `${C}px ${C}px` } as React.CSSProperties}>
          {planetCentres.map(([x, y], i) => (
            <line key={i} x1={C} y1={C} x2={x} y2={y} className="stroke-subtle" strokeDasharray="2 4" />
          ))}
          {planetCentres.map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`} {...partProps(PLANET_DOMAINS[i])}>
              {/* planets spin backwards at 3/4 of the sun's rate relative to the carrier */}
              <g className="gear-spin-rev" style={{ "--period": `${(SUN_PERIOD / 0.75).toFixed(2)}s` } as React.CSSProperties}>
                <path d={planet} fill="rgb(var(--d-rgb) / 0.05)" className="stroke-[var(--d)]" strokeWidth="1.2" />
                <circle r="9" fill="none" className="stroke-[var(--d)]" strokeOpacity="0.7" />
                <line x1="-9" x2="9" className="stroke-[var(--d)]" strokeOpacity="0.5" />
              </g>
            </g>
          ))}
        </g>

        {/* sun gear — AI core with a neural mesh inside */}
        <g {...partProps("ai")}>
          <g className="gear-spin" style={{ "--period": `${SUN_PERIOD}s` } as React.CSSProperties}>
            <path d={sun} fill="rgb(var(--d-rgb) / 0.05)" className="stroke-[var(--d)]" strokeWidth="1.2" />
          </g>
          <circle cx={C} cy={C} r="28" fill="none" className="stroke-[var(--d)]" strokeOpacity="0.6" />
          <g className="neural-pulse">
            {mesh.edges.map(([a, b], i) => (
              <line key={i} x1={mesh.nodes[a][0]} y1={mesh.nodes[a][1]} x2={mesh.nodes[b][0]} y2={mesh.nodes[b][1]} className="stroke-[var(--d)]" strokeOpacity="0.6" strokeWidth="0.8" />
            ))}
            {mesh.nodes.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={i % 3 ? 1.6 : 2.4} className="fill-[var(--d)]" />
            ))}
          </g>
        </g>
      </svg>

      <div className="mx-auto mt-3 min-h-[92px] max-w-[420px] px-1" aria-live="polite">
        {info ? (
          <div data-domain={info.id} className="clip-up">
            <p className="mono-label !text-[var(--d)]">{info.part}</p>
            <ul className="mt-2 space-y-1 text-[14px] leading-snug text-muted">
              {info.highlights.map((h) => (
                <li key={h} className="flex gap-2">
                  <span className="mt-[0.55em] h-px w-2.5 shrink-0 bg-[var(--d)]" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mono-label text-center">{hint}</p>
        )}
      </div>
    </div>
  );
}
