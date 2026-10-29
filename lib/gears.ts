/**
 * Planetary gearbox geometry shared by the 3D scene and the 2D drawings.
 * Ring fixed, sun input: carrier turns at sun/4, planets spin at -sun/2
 * (absolute) with Z_sun = Z_planet = 12, Z_ring = 36.
 */
export const GEAR = {
  module: 0.0833,
  zSun: 12,
  zPlanet: 12,
  zRing: 36,
  get rSun() {
    return (this.module * this.zSun) / 2;
  },
  get rPlanet() {
    return (this.module * this.zPlanet) / 2;
  },
  get rRing() {
    return (this.module * this.zRing) / 2;
  },
  get orbit() {
    return this.rSun + this.rPlanet;
  },
  planetAngles: [Math.PI / 2, Math.PI / 2 + (Math.PI * 2) / 3, Math.PI / 2 + (Math.PI * 4) / 3],
};

/** Planet order matches the domains on the satellites. */
export const PLANET_DOMAINS = ["automation", "data", "ops"] as const;

/** Points of a toothed outline (trapezoid teeth), in gear units. */
export function toothPoints(z: number, rp: number, inward = false): [number, number][] {
  const m = GEAR.module;
  const tip = inward ? rp - m : rp + m;
  const root = inward ? rp + 1.25 * m : rp - 1.25 * m;
  const step = (Math.PI * 2) / z;
  const pts: [number, number][] = [];
  for (let i = 0; i < z; i++) {
    const a = i * step;
    for (const [r, f] of [
      [root, 0],
      [tip, 0.2],
      [tip, 0.42],
      [root, 0.62],
    ] as const) {
      pts.push([Math.cos(a + step * f) * r, Math.sin(a + step * f) * r]);
    }
  }
  return pts;
}

/** SVG path for a toothed outline, scaled and centred. */
export function toothPath(z: number, rp: number, scale: number, cx: number, cy: number, inward = false) {
  return (
    toothPoints(z, rp, inward)
      .map(([x, y], i) => `${i ? "L" : "M"}${(cx + x * scale).toFixed(2)} ${(cy + y * scale).toFixed(2)}`)
      .join(" ") + " Z"
  );
}

/** Deterministic "neural mesh" inside a circle: nodes + nearest-neighbour edges. */
export function neuralMesh(n: number, r: number, cx: number, cy: number, seed = 7) {
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  const nodes: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    // sunflower distribution with jitter
    const t = (i + 0.5) / n;
    const rad = Math.sqrt(t) * r * (0.85 + rand() * 0.15);
    const a = i * 2.399963 + rand() * 0.3;
    nodes.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
  }
  const edges: [number, number][] = [];
  nodes.forEach((p, i) => {
    const near = nodes
      .map((q, j) => ({ j, d: Math.hypot(p[0] - q[0], p[1] - q[1]) }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    near.forEach(({ j }) => {
      if (!edges.some(([a, b]) => (a === i && b === j) || (a === j && b === i))) edges.push([i, j]);
    });
  });
  return { nodes, edges };
}
