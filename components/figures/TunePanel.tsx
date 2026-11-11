"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { SimState } from "./scene";
import { PARTICLE_SLIDERS, particleConfig, tuneParticles, type ParticleConfig } from "@/lib/particle-config";

/**
 * The tuning panel (?tune=1 in the address): a slider for each number of the
 * points' physics, felt at once (the scene reads lib/particle-config.ts on
 * every frame), and a button that copies the values as JSON, ready to paste
 * into PARTICLE_DEFAULTS. Carlos's own tool, so it speaks Spanish. It also
 * leaves `__particles` on the window for the tests: the live values and the
 * simulation's state.
 */
export default function TunePanel({ state }: { state: () => SimState | null }) {
  const [values, setValues] = useState<ParticleConfig>({ ...particleConfig });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const w = window as unknown as { __particles?: unknown };
    w.__particles = { config: particleConfig, state };
    return () => {
      delete w.__particles;
      tuneParticles();
    };
  }, [state]);

  const set = (values?: Partial<ParticleConfig>) => {
    setValues(tuneParticles(values));
    setCopied(false);
  };

  return createPortal(
    <form className="tune" aria-label="Ajuste de las partículas" onSubmit={(e) => e.preventDefault()}>
      <p className="font-semibold text-fg">Partículas</p>
      {PARTICLE_SLIDERS.map(({ key, label, min, max, step }) => (
        <label key={key}>
          <span className="flex justify-between gap-3">
            <span>{label}</span>
            <output className="tabular font-medium text-fg">{values[key]}</output>
          </span>
          <input type="range" min={min} max={max} step={step} value={values[key]} onChange={(e) => set({ [key]: Number(e.target.value) })} />
        </label>
      ))}
      <div className="mt-1 flex gap-2">
        <button
          type="button"
          className="btn btn-primary btn-sm flex-1"
          onClick={async () => {
            const json = JSON.stringify(values, null, 2);
            try {
              await navigator.clipboard.writeText(json);
              setCopied(true);
            } catch {
              window.prompt("Valores", json); // no clipboard (http, permissions): select and copy by hand
            }
          }}
        >
          {copied ? "Copiado" : "Copiar valores"}
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => set()}>
          Restablecer
        </button>
      </div>
    </form>,
    document.body,
  );
}
