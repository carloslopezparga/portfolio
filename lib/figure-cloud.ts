/*
 * The figures the hero's cloud forms further down the page, out of the same
 * points: a bar chart (Figures), a gear train (Experience) and a globe
 * (Contact). Pure and deterministic, shared by the WebGL scene
 * (components/figures/scene.ts) and the still posters (app/chip/[file]).
 *
 * Every figure lives in the chip's world (same camera, lib/chip-cloud.ts) and
 * has a frame: the box of its projection at rest, which the page maps onto
 * the figure's gap.
 */
import { AI, BLEED, buildCloud, CAM, type Cloud, dotsSVG, FOCAL, look, type Look, mulberry32, pick, project, type SvgDot } from "./chip-cloud";

export type FigureId = "chip" | "bars" | "gears" | "globe";
/** The order is the figure's index in the shaders. */
export const FIGURES: FigureId[] = ["chip", "bars", "gears", "globe"];

/** Dot diameters for a figure drawn at about `px` pixels per world unit: the same hierarchy as the chip's (lib/chip-cloud.ts DOT). */
const dots = (px: number) => ({ xs: 1.7 / px, s: 2.6 / px, m: 4.2 / px, l: 6.6 / px, xl: 9.4 / px });

/* ------------------------------- bar chart ------------------------------ */

/** Six bars in a row along z (so, in the chip's 3/4 view, they climb to the right) on a base plate. y = 0 is the plate's top. */
export const BARS = {
  count: 6,
  /** distance between bar centres, and half a bar's footprint */
  pitch: 0.56,
  half: 0.19,
  plate: { x: 0.4, z: 1.78, h: 0.07 },
  /** heights at rest (the posters draw these) */
  rest: [0.36, 0.56, 0.48, 0.78, 0.7, 1.02],
  /** the tallest a bar gets, the cursor's lift included */
  max: 1.45,
  /** how far over the bars the trend line runs */
  lift: 0.22,
};
export const barZ = (i: number) => ((BARS.count - 1) / 2 - i) * BARS.pitch;
/** The trend line's nodes: a smoothed copy of the bars' heights, lifted over them. */
export function trendOf(h: ArrayLike<number>, out: number[] | Float32Array) {
  const last = BARS.count - 1;
  for (let i = 0; i <= last; i++) out[i] = 0.25 * h[Math.max(i - 1, 0)] + 0.5 * h[i] + 0.25 * h[Math.min(i + 1, last)] + BARS.lift;
  return out;
}

/**
 * A point of a figure: four numbers the shader turns into a position, plus
 * its look. Bars: x, t, z, code. code 0..5 → bar i, y = t · height;
 * 10..14 → trend line between nodes i and i + 1, at fraction t; 20..25 →
 * trend node i; -1 → fixed point, y = t; -2 → dust, y = t. Gears: radius,
 * angle, z, gear (or x, y, z, -1 for dust).
 */
interface Slot {
  v: [number, number, number, number];
  s: number;
  a: number;
  /** colour index (AI), or -1 for ink */
  tint: number;
}

function barsSlots(rnd: () => number): Slot[] {
  const d = dots(104);
  const EDGE = look([[d.s, 0.64], [d.m, 0.36]]);
  const RIM = look([[d.s, 0.5], [d.m, 0.5]]);
  const LOW = look([[d.xs, 0.5], [d.s, 0.5]]);
  const CAP = look([[d.m, 1]]);
  const CORNER = look([[d.l, 1]]);
  const FACE = look([[d.xs, 0.86], [d.s, 0.14]], [[0.6, 0.25], [1, 0.75]]);
  const LINE = look([[d.s, 1]]);
  const DUST = look([[d.xs, 0.7], [d.s, 0.24], [d.m, 0.06]], [[0.6, 0.5], [1, 0.5]]);
  const gap = 0.044;
  const out: Slot[] = [];
  const add = (x: number, t: number, z: number, code: number, lk: Look, tint = -1) => out.push({ v: [x, t, z, code], s: pick(rnd, lk.sizes), a: pick(rnd, lk.alphas), tint });
  const jit = (span: number) => (rnd() - 0.5) * span;
  const { half, plate, rest } = BARS;

  for (let i = 0; i < BARS.count; i++) {
    const z = barZ(i);
    const rise = Math.max(3, Math.round(rest[i] / gap));
    const across = Math.round((half * 2) / gap);
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        // the four uprights, and a large dot on each top corner
        for (let j = 0; j < rise; j++) add(sx * half, (j + 0.5 + jit(0.3)) / rise, z + sz * half, i, EDGE);
        add(sx * half, 1, z + sz * half, i, CORNER);
      }
    // the rim of the top and a few dots on it: the part that reads as «a bar»
    for (let j = 0; j < across; j++) {
      const u = -half + ((j + 0.5 + jit(0.3)) / across) * half * 2;
      add(u, 1, z - half, i, RIM);
      add(u, 1, z + half, i, RIM);
      add(-half, 1, z + u, i, RIM);
      add(half, 1, z + u, i, RIM);
    }
    for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) add(-half + ((a + 0.5) / 3) * half * 2 + jit(0.02), 1, z - half + ((b + 0.5) / 3) * half * 2 + jit(0.02), i, CAP);
    // the two faces that look at the camera, as a fine, even grain
    const rows = Math.max(2, Math.round(rest[i] / (gap * 1.45)));
    for (let a = 0; a < 5; a++)
      for (let b = 0; b < rows; b++) {
        add(half, (b + 0.5 + jit(0.35)) / rows, z - half + ((a + 0.5 + jit(0.35)) / 5) * half * 2, i, FACE);
        add(-half + ((a + 0.5 + jit(0.35)) / 5) * half * 2, (b + 0.5 + jit(0.35)) / rows, z + half, i, FACE);
      }
  }

  // the base plate: its upper rim crisp, the lower one finer, the corners, and a grain on top around the bars
  const px = Math.round((plate.x * 2) / gap);
  const pz = Math.round((plate.z * 2) / gap);
  for (const y of [0, -plate.h]) {
    const lk = y === 0 ? RIM : LOW;
    for (let j = 0; j < px; j++) for (const sz of [-1, 1]) add(-plate.x + ((j + 0.5) / px) * plate.x * 2, y, sz * plate.z, -1, lk);
    for (let j = 0; j < pz; j++) for (const sx of [-1, 1]) add(sx * plate.x, y, -plate.z + ((j + 0.5) / pz) * plate.z * 2, -1, lk);
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(sx * plate.x, 0, sz * plate.z, -1, CORNER);
  for (let a = 0; a < 6; a++)
    for (let b = 0; b < 30; b++) {
      const x = -plate.x + ((a + 0.5 + jit(0.7)) / 6) * plate.x * 2;
      const z = -plate.z + ((b + 0.5 + jit(0.7)) / 30) * plate.z * 2;
      const under = Math.abs(x) < half && Array.from({ length: BARS.count }, (_, i) => Math.abs(z - barZ(i)) < half).some(Boolean);
      if (!under) add(x, 0, z, -1, FACE);
    }

  // the trend line: small dots between the nodes, and one large coloured dot per node
  for (let i = 0; i < BARS.count - 1; i++) {
    const steps = 11;
    for (let j = 0; j < steps; j++) {
      const f = 0.15 + ((j + 0.5) / steps) * 0.7;
      add(0, f, barZ(i) + (barZ(i + 1) - barZ(i)) * f, 10 + i, LINE);
    }
  }
  for (let i = 0; i < BARS.count; i++) out.push({ v: [0, 0, barZ(i), 20 + i], s: d.xl * 1.15, a: 1, tint: i % AI.length });

  // a little dust in the air over the chart (code -2: the scene lets it drift)
  for (let i = 0; i < 90; i++) add(jit(1.5), 0.25 + rnd() * 1.3, jit(3.6), -2, DUST);
  return out;
}

/* ------------------------------ gear train ------------------------------ */

/**
 * Three meshed gears in the xy plane, facing the camera. Same module (tooth
 * size) for all, so pitch radius = module · teeth / 2 and neighbours sit a
 * sum of radii apart; each turns against its neighbour by the ratio of their
 * teeth, and starts with a tooth in the neighbour's gap.
 */
export const GEARS = (() => {
  const mod = 0.1;
  const teeth = [18, 12, 9];
  const r = teeth.map((n) => (mod * n) / 2);
  /** direction from each gear's centre to the next one's */
  const dirs = [(17 * Math.PI) / 180, (-44 * Math.PI) / 180];
  const c: [number, number][] = [[-1.0, -0.14]];
  for (let i = 0; i < 2; i++) c.push([c[i][0] + (r[i] + r[i + 1]) * Math.cos(dirs[i]), c[i][1] + (r[i] + r[i + 1]) * Math.sin(dirs[i])]);
  const ratio = [1, -teeth[0] / teeth[1], teeth[0] / teeth[2]];
  // A tooth is centred on local angle 0. On the line of centres, gear i shows the tooth phase u_i and gear j must show a gap: u_i + u_j ≡ ½.
  const phase = [0];
  for (let j = 1; j < 3; j++) {
    const i = j - 1;
    const ui = ((dirs[i] - phase[i]) * teeth[i]) / (2 * Math.PI);
    phase[j] = dirs[i] + Math.PI - ((0.5 - ui) * 2 * Math.PI) / teeth[j];
  }
  return { mod, teeth, r, c, ratio, phase, thick: 0.17 };
})();

function gearsSlots(rnd: () => number): Slot[] {
  const d = dots(100);
  const RIM = look([[d.s, 0.5], [d.m, 0.43], [d.l, 0.07]]);
  const BACK = look([[d.xs, 0.55], [d.s, 0.45]], [[0.6, 1]]);
  const HUB = look([[d.s, 0.35], [d.m, 0.65]]);
  const FACE = look([[d.xs, 0.8], [d.s, 0.2]], [[0.55, 0.4], [1, 0.6]]);
  const DUST = look([[d.xs, 0.75], [d.s, 0.2], [d.m, 0.05]], [[0.45, 0.5], [0.8, 0.5]]);
  const gap = 0.03;
  const out: Slot[] = [];
  const { mod: m, teeth, r, thick } = GEARS;
  const zf = thick / 2;
  const add = (x: number, y: number, z: number, g: number, lk: Look) => out.push({ v: [Math.hypot(x, y), Math.atan2(y, x), z, g], s: pick(rnd, lk.sizes), a: pick(rnd, lk.alphas), tint: -1 });
  const circle = (g: number, cx: number, cy: number, rad: number, lk: Look, z = zf, step = gap) => {
    const count = Math.max(6, Math.round((2 * Math.PI * rad) / step));
    const turn = rnd() * Math.PI * 2;
    for (let j = 0; j < count; j++) add(cx + rad * Math.cos(turn + (j / count) * Math.PI * 2), cy + rad * Math.sin(turn + (j / count) * Math.PI * 2), z, g, lk);
  };

  teeth.forEach((N, g) => {
    const rp = r[g];
    const ra = rp + m;
    const rr = rp - 1.25 * m;
    const tau = (2 * Math.PI) / N;
    // one tooth, as fractions of the pitch angle: root, flank, tip, flank, root
    const profile: [number, number][] = [[-0.5, rr], [-0.29, rr], [-0.16, ra], [0.16, ra], [0.29, rr], [0.5, rr]];
    for (let k = 0; k < N; k++)
      for (let s = 0; s < profile.length - 1; s++) {
        const [f0, r0] = profile[s];
        const [f1, r1] = profile[s + 1];
        const a = [r0 * Math.cos((k + f0) * tau), r0 * Math.sin((k + f0) * tau)];
        const b = [r1 * Math.cos((k + f1) * tau), r1 * Math.sin((k + f1) * tau)];
        const count = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / gap));
        for (let j = 0; j < count; j++) {
          const t = (j + 0.5 + (rnd() - 0.5) * 0.3) / count;
          const x = a[0] + (b[0] - a[0]) * t;
          const y = a[1] + (b[1] - a[1]) * t;
          add(x, y, zf, g, RIM);
          if ((j + s + k) % 2 === 0) add(x, y, -zf, g, BACK); // the far face, lighter: it gives the gear its thickness
        }
      }
    // hub, axle, and the lightening holes of the two larger gears
    const hub = Math.max(0.12, rp * 0.22);
    circle(g, 0, 0, hub, HUB);
    out.push({ v: [0, 0, zf, g], s: d.xl * 1.25, a: 1, tint: -1 });
    const holes = g === 0 ? 6 : g === 1 ? 4 : 0;
    const holeAt = (rr + hub) / 2;
    const holeR = g === 0 ? 0.15 : 0.11;
    for (let h = 0; h < holes; h++) circle(g, holeAt * Math.cos(((h + 0.5) / holes) * Math.PI * 2), holeAt * Math.sin(((h + 0.5) / holes) * Math.PI * 2), holeR, RIM, zf, gap * 1.15);
    // grain on the face, clear of the holes
    const grains = Math.round(rp * rp * 520);
    for (let j = 0; j < grains; j++) {
      const rad = Math.sqrt(hub * hub + rnd() * ((rr - 0.04) ** 2 - hub * hub));
      const th = rnd() * Math.PI * 2;
      const x = rad * Math.cos(th);
      const y = rad * Math.sin(th);
      let inHole = false;
      for (let h = 0; h < holes; h++) inHole ||= Math.hypot(x - holeAt * Math.cos(((h + 0.5) / holes) * Math.PI * 2), y - holeAt * Math.sin(((h + 0.5) / holes) * Math.PI * 2)) < holeR + 0.03;
      if (!inHole) add(x, y, zf, g, FACE);
    }
  });

  // dust around the train (fixed points)
  for (let i = 0; i < 110; i++) out.push({ v: [(rnd() - 0.5) * 4.0, (rnd() - 0.5) * 2.3, (rnd() - 0.5) * 0.9, -1], s: pick(rnd, DUST.sizes), a: pick(rnd, DUST.alphas), tint: -1 });
  return out;
}

/* --------------------------------- globe -------------------------------- */

/** The globe's radius: the cloud's own sphere, drawn on its surface. */
export const GLOBE_R = 1.02;

/** How the globe shades a point by how much it faces the camera (the scene and the poster share it): size and opacity factors. */
export const globeShade = (facing: number): [number, number] => {
  const t = Math.min(1, Math.max(0, (facing + 0.75) / 1.3));
  const front = t * t * (3 - 2 * t);
  return [0.6 + 0.4 * front, 0.14 + 0.86 * front];
};

/* --------------------------------- frames ------------------------------- */

export interface Frame {
  /** the figure's rotation at rest: v' = Rx(tilt) · Ry(yaw) · v */
  tilt: number;
  yaw: number;
  /** half extents and centre of the figure's projection, in frame units (1 = half the chip's frame) */
  w: number;
  h: number;
  cx: number;
  cy: number;
}

const ndc = (p: number[], tilt: number, yaw: number): [number, number] => {
  const [u, v] = project(p, yaw, tilt);
  return [2 * u - 1, 1 - 2 * v];
};
function fit(points: number[][], tilt: number, yaw: number, pad: number): Frame {
  let x0 = Infinity;
  let x1 = -Infinity;
  let y0 = Infinity;
  let y1 = -Infinity;
  for (const p of points) {
    const [x, y] = ndc(p, tilt, yaw);
    x0 = Math.min(x0, x);
    x1 = Math.max(x1, x);
    y0 = Math.min(y0, y);
    y1 = Math.max(y1, y);
  }
  return { tilt, yaw, w: ((x1 - x0) / 2) * pad, h: ((y1 - y0) / 2) * pad, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
}

const barsBounds = () => {
  const { plate, half } = BARS;
  const pts: number[][] = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (const y of [0, -plate.h]) pts.push([sx * plate.x, y, sz * plate.z]);
  // room for the bars to grow a good way past their rest heights, and for the trend line over them
  for (let i = 0; i < BARS.count; i++) for (const sx of [-1, 1]) for (const sz of [-1, 1]) pts.push([sx * half, BARS.rest[i] * 1.12 + BARS.lift + 0.06, barZ(i) + sz * half]);
  return pts;
};
const gearsBounds = () => {
  const pts: number[][] = [];
  GEARS.c.forEach(([cx, cy], g) => {
    const ra = GEARS.r[g] + GEARS.mod;
    for (let k = 0; k < 24; k++) for (const z of [-GEARS.thick / 2, GEARS.thick / 2]) pts.push([cx + ra * Math.cos((k / 24) * Math.PI * 2), cy + ra * Math.sin((k / 24) * Math.PI * 2), z]);
  });
  return pts;
};
const globeHalf = Math.tan(Math.asin(GLOBE_R / CAM.dist)) * FOCAL * 1.1;

export const FRAMES: Record<FigureId, Frame> = {
  chip: { tilt: CAM.tilt, yaw: CAM.yaw, w: 1 / (1 + 2 * BLEED), h: 1 / (1 + 2 * BLEED), cx: 0, cy: 0 },
  bars: fit(barsBounds(), CAM.tilt, CAM.yaw, 1.04),
  gears: fit(gearsBounds(), 0.16, -0.38, 1.05),
  globe: { tilt: 0.32, yaw: 0, w: globeHalf, h: globeHalf, cx: 0, cy: 0 },
};

/* ------------------------------- the cloud ------------------------------ */

export interface Particles extends Cloud {
  /** per point: the bar chart's and the gears' four numbers (see Slot) */
  bars: Float32Array;
  gears: Float32Array;
  /** per point: diameter and opacity in each figure, in FIGURES order */
  sizes: Float32Array;
  alphas: Float32Array;
  /** per point: its colour index in the bar chart (the trend's nodes), or -1 */
  tint: Float32Array;
}

/** Pads a figure's points up to n with hidden ones (near its middle), shuffles them, and leaves the coloured ones last so they draw on top. */
function assign(slots: Slot[], n: number, rnd: () => number, hidden: () => [number, number, number, number]): Slot[] {
  const tinted = slots.filter((s) => s.tint >= 0);
  const plain = slots.filter((s) => s.tint < 0).slice(0, n - tinted.length);
  while (plain.length < n - tinted.length) plain.push({ v: hidden(), s: 0.01, a: 0, tint: -1 });
  for (let i = plain.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [plain[i], plain[j]] = [plain[j], plain[i]];
  }
  return [...plain, ...tinted];
}

/**
 * The cloud with every figure it can form. `all` false (phones): only the
 * chip, the other figures' data left empty.
 */
export function buildParticles(n: number, all: boolean): Particles {
  const c = buildCloud(n);
  const p: Particles = { ...c, bars: new Float32Array(n * 4), gears: new Float32Array(n * 4), sizes: new Float32Array(n * 4), alphas: new Float32Array(n * 4), tint: new Float32Array(n).fill(-1) };
  for (let i = 0; i < n; i++) {
    p.sizes[i * 4] = c.size[i];
    p.alphas[i * 4] = c.alpha[i];
  }
  if (!all) return p;

  const rnd = mulberry32(4421 + n);
  const bars = assign(barsSlots(rnd), n, rnd, () => [(rnd() - 0.5) * 0.6, 0.2 + rnd() * 0.9, (rnd() - 0.5) * 3, -1]);
  const gears = assign(gearsSlots(rnd), n, rnd, () => [(rnd() - 0.5) * 3.2, (rnd() - 0.5) * 1.6, 0, -1]);
  // the globe: a few strong dots of very different sizes over a fine grain; the rest of the points rest
  const g = dots(178);
  const STRONG = look([[g.s, 0.5], [g.m, 0.3], [g.l, 0.14], [g.xl, 0.06]]);
  const GRAIN = look([[g.xs, 1]], [[0.45, 0.5], [0.8, 0.5]]);
  for (let i = 0; i < n; i++) {
    p.bars.set(bars[i].v, i * 4);
    p.gears.set(gears[i].v, i * 4);
    p.tint[i] = bars[i].tint;
    const u = rnd();
    const lk = u < 0.15 ? STRONG : u < 0.5 ? GRAIN : null;
    p.sizes.set([bars[i].s, gears[i].s, lk ? pick(rnd, lk.sizes) : g.xs], i * 4 + 1);
    p.alphas.set([bars[i].a, gears[i].a, lk ? pick(rnd, lk.alphas) : 0], i * 4 + 1);
  }
  return p;
}

/* -------------------------------- posters ------------------------------- */

/**
 * A figure at rest as an SVG over its frame: its ink (black dots on
 * transparent, used as a CSS mask) or, for the bar chart, its coloured dots.
 * What reduced motion, no JavaScript and no WebGL show in the figure's gap.
 */
export function figureSVG(id: Exclude<FigureId, "chip">, n: number, part: "ink" | "colour"): string {
  const p = buildParticles(n, true);
  const f = FRAMES[id];
  const k = FIGURES.indexOf(id);
  const V = 1000;
  const scale = V / (2 * f.w);
  const height = Math.round(2 * f.h * scale);
  const trend = trendOf(BARS.rest, []);
  const ct = Math.cos(f.tilt);
  const st = Math.sin(f.tilt);
  const cy = Math.cos(f.yaw);
  const sy = Math.sin(f.yaw);
  const dotList: SvgDot[] = [];
  for (let i = 0; i < n; i++) {
    let size = p.sizes[i * 4 + k];
    let alpha = p.alphas[i * 4 + k];
    let pos: [number, number, number];
    let tint = -1;
    if (id === "bars") {
      const [x, t, z, code] = p.bars.subarray(i * 4, i * 4 + 4);
      const y = code >= 20 ? trend[code - 20] : code >= 10 ? trend[code - 10] + (trend[code - 9] - trend[code - 10]) * t : code >= 0 ? t * BARS.rest[code] : t;
      pos = [x, y, z];
      tint = p.tint[i];
    } else if (id === "gears") {
      const [a, b, z, gear] = p.gears.subarray(i * 4, i * 4 + 4);
      pos = gear < 0 ? [a, b, z] : [GEARS.c[gear][0] + a * Math.cos(b + GEARS.phase[gear]), GEARS.c[gear][1] + a * Math.sin(b + GEARS.phase[gear]), z];
    } else {
      const [x, y, z] = p.sphere.subarray(i * 3, i * 3 + 3);
      const len = Math.hypot(x, y, z);
      pos = [(x / len) * GLOBE_R, (y / len) * GLOBE_R, (z / len) * GLOBE_R];
      // how much the point faces the camera, after the frame's rotation
      const z1 = -sy * pos[0] + cy * pos[2];
      const [ks, ka] = globeShade((st * pos[1] + ct * z1) / GLOBE_R);
      size *= ks;
      alpha *= ka;
    }
    if ((part === "colour") !== tint >= 0) continue;
    const [u, v, depth] = project(pos, f.yaw, f.tilt);
    dotList.push({ x: (2 * u - 1 - f.cx + f.w) * scale, y: (f.h - (1 - 2 * v - f.cy)) * scale, d: ((size * FOCAL) / depth) * scale, alpha, colour: tint >= 0 ? AI[tint] : "#000" });
  }
  return dotsSVG(dotList, V, height);
}
