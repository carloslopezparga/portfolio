/*
 * Geometry of the hero's AI chip, exploded into four layers (top to bottom):
 * heat sink, die with its cores, interposer with traces, and the substrate
 * with its BGA solder balls. Units are arbitrary "mm"; z is up. The hero's
 * point cloud (lib/chip-cloud.ts) is sampled from these shapes.
 */

export interface Slab {
  /** half width (x) and half depth (y) */
  w: number;
  d: number;
  /** bottom of the slab and its thickness */
  z: number;
  h: number;
}

/** Gaps between layers in the exploded view. The sink rides higher so the die and its cores show underneath. */
export const GAPS = { interposer: 46, die: 40, sink: 100 };

export const LAYERS = {
  substrate: { w: 100, d: 100, z: 0, h: 7 },
  interposer: { w: 76, d: 76, z: 7 + GAPS.interposer, h: 5 },
  die: { w: 50, d: 50, z: 7 + GAPS.interposer + 5 + GAPS.die, h: 6 },
  sink: { w: 84, d: 84, z: 7 + GAPS.interposer + 5 + GAPS.die + 6 + GAPS.sink, h: 6 },
} satisfies Record<string, Slab>;

export const FIN = { count: 11, t: 2.2, h: 30 };

/** Cores on the die's top face: 2 rows × 4. */
export const CORES = Array.from({ length: 8 }, (_, i) => {
  const col = i % 4;
  const row = Math.floor(i / 4);
  const s = 18;
  const gap = 4;
  const x0 = -(4 * s + 3 * gap) / 2 + col * (s + gap);
  const y0 = -(2 * s + gap) / 2 + row * (s + gap);
  return { x0, y0, x1: x0 + s, y1: y0 + s };
});

/** BGA balls under the substrate: a 9 × 9 grid without the centre 3 × 3. */
export const BALLS = (() => {
  const out: [number, number][] = [];
  const n = 9;
  const step = 20;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      if (i >= 3 && i <= 5 && j >= 3 && j <= 5) continue;
      out.push([(i - (n - 1) / 2) * step, (j - (n - 1) / 2) * step]);
    }
  return out;
})();

/**
 * Traces on the interposer's top face: from the die's footprint out to the
 * edge, as polylines (each one is a path a data pulse runs along).
 */
export const TRACES: [number, number][][] = (() => {
  const e = LAYERS.interposer.w - 6;
  const f = LAYERS.die.w + 4;
  const out: [number, number][][] = [];
  for (const k of [-36, -18, 0, 18, 36]) {
    out.push([[f, k], [f + 10, k], [f + 14, k + Math.sign(k || 1) * 6], [e, k + Math.sign(k || 1) * 6]]);
    out.push([[-f, k], [-f - 10, k], [-f - 14, k - Math.sign(k || 1) * 6], [-e, k - Math.sign(k || 1) * 6]]);
    out.push([[k, f], [k, f + 10], [k + Math.sign(k || 1) * 6, f + 14], [k + Math.sign(k || 1) * 6, e]]);
    out.push([[k, -f], [k, -f - 10], [k - Math.sign(k || 1) * 6, -f - 14], [k - Math.sign(k || 1) * 6, -e]]);
  }
  return out;
})();
