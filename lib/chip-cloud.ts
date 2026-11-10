/*
 * The hero chip as a cloud of points (exploded view: heat sink with fins, die
 * with its cores, interposer with traces, substrate with BGA balls), plus the
 * sphere the points start from. Pure and deterministic (seeded), shared by
 * the WebGL scene (components/figures/scene.ts), the SVG posters that stand
 * in for its first frame (app/chip/[file]/route.ts) and the social card.
 *
 * World units: the chip's "mm" / 100, y up. The chip's own y axis (depth)
 * becomes world z.
 */
import { BALLS, CORES, FIN, LAYERS, TRACES } from "./chip";

export { CLOUD_SIZE, DESKTOP_QUERY } from "./chip-config";

/**
 * Camera: perspective, at (0, 0, dist) looking at the origin. The chip is
 * turned (yaw, about y) and then tipped towards the viewer (tilt, about x):
 * v' = Rx(tilt) · Ry(yaw) · v.
 */
export const CAM = { fov: 30, dist: 7.9, tilt: 0.55, yaw: -1.05 };

/**
 * The chip's slow turn: a sway of ±amp radians about the 3/4 view (a full
 * turn passes angles where the fins face the camera and the chip stops
 * reading). yaw(t) = CAM.yaw + amp · sin(speed · t), so at t = 0 it is CAM.yaw.
 */
export const SWAY = { amp: 0.16, speed: 0.17 };

/**
 * The chip's frame (what the posters cover, and where the scene maps ±1) is
 * its square plus this margin on each side, as a fraction of the square.
 */
export const BLEED = 0.15;

/** Apple accent colours for the data packets and the cores. */
export const AI = ["#0a84ff", "#bf5af2", "#ff375f", "#ff9f0a"];

/**
 * Dot diameters in world units: many tiny ones, some medium, a few large
 * (the hierarchy of evolve.es's sphere). At the desktop size one unit is
 * about 157 px, so these are roughly 1.7, 2.6, 4.2, 6.6 and 9 px.
 */
export const DOT = { xs: 0.0108, s: 0.0166, m: 0.027, l: 0.042, xl: 0.058 };

/** How a part is drawn: its mix of dot sizes and of opacities, as [value, weight] pairs. */
export interface Look {
  sizes: [number, number][];
  alphas: [number, number][];
}
export const look = (sizes: [number, number][], alphas: [number, number][] = [[1, 1]]): Look => ({ sizes, alphas });
export function pick(rnd: () => number, pairs: [number, number][]) {
  let r = rnd() * pairs.reduce((s, p) => s + p[1], 0);
  for (const [v, w] of pairs) if ((r -= w) < 0) return v;
  return pairs[pairs.length - 1][0];
}

export interface Cloud {
  n: number;
  /** assembled position, xyz per point */
  chip: Float32Array;
  /** starting position on the sphere, xyz per point */
  sphere: Float32Array;
  /** world-space diameter */
  size: Float32Array;
  alpha: Float32Array;
  /** four random numbers per point (stagger, headings, twinkle) */
  seed: Float32Array;
  /** layer: 0 substrate, 1 interposer, 2 die, 3 heat sink, -1 dust */
  layer: Float32Array;
  /** core index 0..7, or -1 (the cores are the last points, so they draw on top) */
  core: Float32Array;
  /** die and traces: distance from the chip's axis, for the wave of light that crosses them; -1 elsewhere */
  ring: Float32Array;
}

export interface Packets {
  n: number;
  /** four control points of the trace, xyz each (12 floats per packet point) */
  path: Float32Array;
  /** cumulative length fractions at the 2nd and 3rd control points */
  marks: Float32Array;
  /** speed (laps per clock unit), phase offset, tail index (0 head, then the tail) */
  motion: Float32Array;
  color: Float32Array;
}

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const { substrate: S, interposer: I, die: D, sink: H } = LAYERS;
const Z_MIN = S.z - 5 - 3.6;
const Z_MAX = H.z + H.h + FIN.h;
const ZC = (Z_MIN + Z_MAX) / 2;
/** Lifts the chip so that, tipped towards the viewer, it sits in the middle of its square. */
const LIFT = 0.16;
/** chip "mm" (x right, y depth, z up) → world */
export const toWorld = (x: number, y: number, z: number): [number, number, number] => [x / 100, (z - ZC) / 100 + LIFT, y / 100];

// Edges crisp and opaque, faces a fine grain, a few large dots where the eye
// should land (corners, cores, solder balls): the hierarchy that makes it read.
const EDGE = look([[DOT.s, 0.56], [DOT.m, 0.38], [DOT.l, 0.06]]);
/** a slab's lower rim and the fins' ends: finer, so thin slabs do not turn into one thick line */
const EDGE_LOW = look([[DOT.xs, 0.45], [DOT.s, 0.55]]);
const CORNER = look([[DOT.l, 1]]);
const FACE = look([[DOT.xs, 0.74], [DOT.s, 0.22], [DOT.m, 0.04]], [[0.6, 0.22], [1, 0.78]]);
const FIN_TOP = look([[DOT.s, 0.6], [DOT.m, 0.35], [DOT.l, 0.05]]);
const FIN_FACE = look([[DOT.xs, 0.82], [DOT.s, 0.18]], [[0.6, 0.25], [1, 0.75]]);
const LINE = look([[DOT.s, 0.82], [DOT.m, 0.18]]);
const PAD = look([[DOT.m, 1]]);
const CORE = look([[DOT.m, 1]]);
const BALL = look([[DOT.l, 0.3], [DOT.xl, 0.7]]);
const DUST = look([[DOT.xs, 0.6], [DOT.s, 0.27], [DOT.m, 0.11], [DOT.l, 0.02]], [[0.6, 0.4], [1, 0.6]]);

interface Pt {
  p: [number, number, number];
  s: number;
  a: number;
  layer: number;
  core: number;
  ring: number;
}

/**
 * The chip's parts as dots `pitch` mm apart along the edges (faces are
 * sparser). Returns the ink points and, apart, the cores.
 */
function sample(rnd: () => number, pitch: number, k: number, coreSide: number): [Pt[], Pt[]] {
  const ink: Pt[] = [];
  const cores: Pt[] = [];
  const add = (x: number, y: number, z: number, lk: Look, layer: number, ring = false, core = -1) =>
    (core >= 0 ? cores : ink).push({ p: toWorld(x, y, z), s: pick(rnd, lk.sizes) * k, a: pick(rnd, lk.alphas), layer, core, ring: ring ? Math.max(Math.abs(x), Math.abs(y)) / 100 : -1 });

  type V = [number, number, number];
  const line = (a: V, b: V, lk: Look, layer: number, gap = pitch, ring = false) => {
    const count = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / gap));
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5 + (rnd() - 0.5) * 0.3) / count;
      add(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, lk, layer, ring);
    }
  };
  /** a slab's twelve edges, with a large dot on each corner */
  const box = (s: { w: number; d: number; z: number; h: number }, layer: number, ring = false) => {
    const z0 = s.z;
    const z1 = s.z + s.h;
    for (const z of [z0, z1]) {
      const lk = z === z1 ? EDGE : EDGE_LOW;
      const gap = z === z1 ? pitch : pitch * 1.25;
      line([-s.w, -s.d, z], [s.w, -s.d, z], lk, layer, gap, ring);
      line([s.w, -s.d, z], [s.w, s.d, z], lk, layer, gap, ring);
      line([s.w, s.d, z], [-s.w, s.d, z], lk, layer, gap, ring);
      line([-s.w, s.d, z], [-s.w, -s.d, z], lk, layer, gap, ring);
    }
    for (const x of [-s.w, s.w])
      for (const y of [-s.d, s.d]) {
        add(x, y, z1, CORNER, layer, ring);
        add(x, y, z0, EDGE, layer, ring);
      }
  };
  /** a face as a loose grid: regular enough to read as a plane, never ruled */
  const grid = (x0: number, x1: number, y0: number, y1: number, z: number, gap: number, lk: Look, layer: number, skip?: (x: number, y: number) => boolean) => {
    const nx = Math.max(1, Math.round((x1 - x0) / gap));
    const ny = Math.max(1, Math.round((y1 - y0) / gap));
    for (let i = 0; i < nx; i++)
      for (let j = 0; j < ny; j++) {
        const x = x0 + ((i + 0.5 + (rnd() - 0.5) * 0.7) / nx) * (x1 - x0);
        const y = y0 + ((j + 0.5 + (rnd() - 0.5) * 0.7) / ny) * (y1 - y0);
        if (!skip?.(x, y)) add(x, y, z, lk, layer);
      }
  };

  // substrate (layer 0): slab, grain on top, and one fat dot per solder ball underneath
  box(S, 0);
  grid(-S.w + 5, S.w - 5, -S.d + 5, S.d - 5, S.z + S.h, pitch * 2.5, FACE, 0);
  for (const [bx, by] of BALLS) add(bx, by, S.z - 5, BALL, 0);

  // interposer (layer 1): slab, grain around the die's footprint, and the traces fanning out to their pads
  box(I, 1);
  grid(-I.w + 4, I.w - 4, -I.d + 4, I.d - 4, I.z + I.h, pitch * 3.4, FACE, 1, (x, y) => Math.abs(x) < D.w + 3 && Math.abs(y) < D.d + 3);
  const zt = I.z + I.h + 0.4;
  for (const t of TRACES) {
    for (let i = 0; i < t.length - 1; i++) line([t[i][0], t[i][1], zt], [t[i + 1][0], t[i + 1][1], zt], LINE, 1, pitch * 0.95, true);
    const end = t[t.length - 1];
    add(end[0], end[1], zt, PAD, 1, true);
  }

  // die (layer 2): a crisp slab and its eight cores, each a small block of dots
  box(D, 2, true);
  CORES.forEach((c, ci) => {
    for (let i = 0; i < coreSide; i++)
      for (let j = 0; j < coreSide; j++) {
        const x = c.x0 + ((i + 0.5) / coreSide) * (c.x1 - c.x0) + (rnd() - 0.5) * 0.3;
        const y = c.y0 + ((j + 0.5) / coreSide) * (c.y1 - c.y0) + (rnd() - 0.5) * 0.3;
        add(x, y, D.z + D.h + 0.3, CORE, 2, true, ci);
      }
  });

  // heat sink (layer 3): plate and fins. Each fin is its top edge (dense), its two ends, and a light face.
  box(H, 3);
  const finStep = (H.d * 2 - FIN.t) / (FIN.count - 1);
  const fz0 = H.z + H.h;
  const fz1 = fz0 + FIN.h;
  const x0 = -H.w + 4;
  const x1 = H.w - 4;
  for (let f = 0; f < FIN.count; f++) {
    const y = -H.d + f * finStep + FIN.t / 2;
    line([x0, y, fz1], [x1, y, fz1], FIN_TOP, 3, pitch * 0.9);
    line([x0, y, fz0], [x0, y, fz1], EDGE_LOW, 3);
    line([x1, y, fz0], [x1, y, fz1], EDGE_LOW, 3);
    const nx = Math.max(2, Math.round((x1 - x0) / (pitch * 3)));
    const nz = Math.max(2, Math.round(FIN.h / (pitch * 3.2)));
    for (let i = 0; i < nx; i++)
      for (let j = 0; j < nz; j++) add(x0 + ((i + 0.5 + (rnd() - 0.5) * 0.7) / nx) * (x1 - x0), y, fz0 + ((j + 0.5 + (rnd() - 0.5) * 0.6) / nz) * FIN.h, FIN_FACE, 3);
  }
  return [ink, cores];
}

/** The point cloud for n points (same n → same cloud, always). */
export function buildCloud(n: number): Cloud {
  const phone = n < 4000;
  const k = phone ? 1.3 : 1; // fewer points on phones: a little larger
  const dustShare = phone ? 0.03 : 0.035;
  // Dots as close along the edges as the budget allows (phones: a wider pitch), leaving a share for the dust.
  let pitch = phone ? 3.6 : 2.0;
  let ink: Pt[] = [];
  let cores: Pt[] = [];
  for (let guard = 0; guard < 60; guard++) {
    [ink, cores] = sample(mulberry32(20261110 + n), pitch, k, phone ? 3 : 4);
    if (ink.length + cores.length <= n * (1 - dustShare)) break;
    pitch *= 1.02;
  }
  const rnd = mulberry32(977 + n);

  // dust: a loose belt around the chip (the scene makes it orbit), the rest of the budget
  const dust: Pt[] = [];
  for (let left = n - ink.length - cores.length; left > 0; left--) {
    const th = rnd() * Math.PI * 2;
    const r = 1.2 + 0.3 * rnd();
    dust.push({ p: [r * Math.cos(th), LIFT + (rnd() + rnd() - 1) * 0.6, r * Math.sin(th)], s: pick(rnd, DUST.sizes) * k, a: pick(rnd, DUST.alphas), layer: -1, core: -1, ring: -1 });
  }
  const pts = [...dust, ...ink, ...cores];
  pts.length = n;

  // Sphere: a Fibonacci sphere with a little depth, shuffled so each point flies to a random place.
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const R = 1.3;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const cloud: Cloud = {
    n,
    chip: new Float32Array(n * 3),
    sphere: new Float32Array(n * 3),
    size: new Float32Array(n),
    alpha: new Float32Array(n),
    seed: new Float32Array(n * 4),
    layer: new Float32Array(n),
    core: new Float32Array(n),
    ring: new Float32Array(n),
  };
  pts.forEach((pt, i) => {
    const j = order[i];
    const y = 1 - (2 * (j + 0.5)) / n;
    const q = Math.sqrt(1 - y * y);
    const r = R * (0.86 + 0.14 * rnd());
    cloud.sphere.set([r * q * Math.cos(golden * j), r * y, r * q * Math.sin(golden * j)], i * 3);
    cloud.chip.set(pt.p, i * 3);
    cloud.size[i] = pt.s;
    cloud.alpha[i] = pt.a;
    cloud.seed.set([rnd(), rnd(), rnd(), rnd()], i * 4);
    cloud.layer[i] = pt.layer;
    cloud.core[i] = pt.core;
    cloud.ring[i] = pt.ring;
  });
  return cloud;
}

/** Data packets: a head and a tail of four points per trace, each trace with its own pace and colour. */
export const PACKET_TAIL = 5;
export function buildPackets(): Packets {
  const rnd = mulberry32(7);
  const per = PACKET_TAIL;
  const n = TRACES.length * per;
  const out: Packets = { n, path: new Float32Array(n * 12), marks: new Float32Array(n * 2), motion: new Float32Array(n * 3), color: new Float32Array(n * 3) };
  TRACES.forEach((t, ti) => {
    const pts = t.map(([x, y]) => toWorld(x, y, I.z + I.h + 0.6));
    const lens = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1], p[2] - pts[i][2]));
    const total = lens[0] + lens[1] + lens[2];
    const speed = 0.35 + rnd() * 0.3;
    const phase = rnd();
    const hex = AI[ti % AI.length];
    const rgb = [1, 3, 5].map((o) => parseInt(hex.slice(o, o + 2), 16) / 255);
    for (let k = 0; k < per; k++) {
      const i = ti * per + k;
      out.path.set(pts.flat(), i * 12);
      out.marks.set([lens[0] / total, (lens[0] + lens[1]) / total], i * 2);
      out.motion.set([speed, phase, k], i * 3);
      out.color.set(rgb, i * 3);
    }
  });
  return out;
}

/* ---------------- projection (posters and social card) ---------------- */

/** 1 / tan(fov / 2): a point at distance d from the camera lands at focal · x / d, in frame units. */
export const FOCAL = 1 / Math.tan(((CAM.fov / 2) * Math.PI) / 180);

/** Project a world point the way the WebGL scene does at rest: returns 0..1 coordinates over the chip's frame and the view depth. */
export function project(v: ArrayLike<number>, yaw = CAM.yaw, tilt = CAM.tilt): [number, number, number] {
  const x = v[0];
  const y = v[1];
  const z = v[2];
  // rotation about y (yaw), then about x (tilt): v' = Rx · Ry · v
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const x1 = cy * x + sy * z;
  const z1 = -sy * x + cy * z;
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  const y2 = ct * y - st * z1;
  const z2 = st * y + ct * z1;
  const depth = CAM.dist - z2; // distance in front of the camera
  return [(1 + (FOCAL * x1) / depth) / 2, (1 - (FOCAL * y2) / depth) / 2, depth];
}

/** Diameter, as a fraction of the frame, of a point of world size s at a given depth. */
export const projectedSize = (s: number, depth: number) => (s * FOCAL) / depth / 2;

export interface SvgDot {
  /** centre and diameter, in viewBox units */
  x: number;
  y: number;
  d: number;
  alpha: number;
  colour: string;
}

/** Dots as round-capped zero-length strokes, grouped by diameter, opacity and colour, on integer coordinates (finer than a poster is ever drawn). */
export function dotsSVG(dots: SvgDot[], width: number, height: number): string {
  const groups = new Map<string, string[]>();
  for (const dot of dots) {
    if (dot.alpha <= 0) continue;
    const key = `${Math.max(0.5, Math.round(dot.d * 4) / 4)}|${Math.round(dot.alpha * 100) / 100}|${dot.colour}`;
    const list = groups.get(key) ?? [];
    list.push(`M${Math.round(dot.x)} ${Math.round(dot.y)}h0`);
    groups.set(key, list);
  }
  const paths = [...groups.entries()]
    .map(([key, list]) => {
      const [d, a, colour] = key.split("|");
      return `<path stroke="${colour}" stroke-width="${d}"${a === "1" ? "" : ` stroke-opacity="${a}"`} d="${list.join("")}"/>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><g fill="none" stroke-linecap="round">${paths}</g></svg>`;
}

/**
 * An SVG of the cloud's first frame (the sphere) or of the assembled chip
 * without its cores (for reduced motion and no JavaScript): black dots on
 * transparent, used as a CSS mask so the page paints them in its own ink. Or
 * the cores alone, in their accent colours, used as a plain image.
 */
export function posterSVG(n: number, mode: "sphere" | "still" | "cores"): string {
  const c = buildCloud(n);
  const V = 1000;
  const dots: SvgDot[] = [];
  for (let i = 0; i < c.n; i++) {
    const isCore = c.core[i] >= 0;
    if ((mode === "still" && isCore) || (mode === "cores" && !isCore)) continue;
    const src = mode === "sphere" ? c.sphere : c.chip;
    const [u, v, depth] = project(src.subarray(i * 3, i * 3 + 3));
    dots.push({ x: u * V, y: v * V, d: projectedSize(c.size[i], depth) * V, alpha: mode === "cores" ? 1 : c.alpha[i], colour: mode === "cores" ? AI[c.core[i] % AI.length] : "#000" });
  }
  return dotsSVG(dots, V, V);
}
