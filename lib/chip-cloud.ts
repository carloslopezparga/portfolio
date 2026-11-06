/*
 * The hero chip as a cloud of points (exploded view: heat sink with fins, die
 * with its cores, interposer with traces, substrate with BGA balls), plus the
 * sphere the points start from. Pure and deterministic (seeded), shared by
 * the WebGL scene (components/hero/chip-scene.ts), the SVG posters that stand
 * in for its first frame (app/chip/[file]/route.ts) and the social card.
 *
 * World units: the chip's "mm" / 100, y up. The chip's own y axis (depth)
 * becomes world z.
 */
import { BALLS, CORES, FIN, LAYERS, TRACES } from "./chip";

export { CLOUD_SIZE, DESKTOP_QUERY } from "./chip-config";

/**
 * Camera: perspective, at (0, 0, dist) looking at the origin. The chip is
 * turned (yaw, about y) and then tipped towards the viewer (tilt, about x),
 * exactly like three.js applies rotation.set(tilt, yaw, 0) in "XYZ" order.
 */
export const CAM = { fov: 30, dist: 9.1, tilt: 0.5, yaw: -0.72 };

/**
 * The canvas and the posters cover the chip's square plus this margin on
 * each side (as a fraction of the square), so scattered points have room.
 */
export const BLEED = 0.15;

/** Apple accent colours for the data packets and the cores. */
export const AI = ["#0a84ff", "#bf5af2", "#ff375f", "#ff9f0a"];

const SIZES = [0.017, 0.026, 0.038];
const ALPHAS = [0.3, 0.55, 0.88];

export interface Cloud {
  n: number;
  /** assembled position, xyz per point */
  chip: Float32Array;
  /** starting position on the sphere, xyz per point */
  sphere: Float32Array;
  /** world-space diameter */
  size: Float32Array;
  alpha: Float32Array;
  /** 0..1, for staggering, twinkle and scatter */
  seed: Float32Array;
  /** layer index for the extra spread on scroll: 0 substrate, 1 interposer, 2 die, 3 heat sink, -1 dust */
  layer: Float32Array;
  /** core index 0..7, or -1 */
  core: Float32Array;
}

export interface Packets {
  n: number;
  /** four control points of the trace, xyz each (12 floats per packet point) */
  path: Float32Array;
  /** cumulative length fractions at the 2nd and 3rd control points */
  marks: Float32Array;
  /** speed (laps per clock unit), phase offset, tail index (0 head, 1-2 tail) */
  motion: Float32Array;
  color: Float32Array;
}

function mulberry32(seed: number) {
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
const LIFT = 0.13;
/** chip "mm" (x right, y depth, z up) → world */
export const toWorld = (x: number, y: number, z: number): [number, number, number] => [x / 100, (z - ZC) / 100 + LIFT, y / 100];

type Weights = [number, number, number];
const EDGE: [Weights, Weights] = [[0.4, 0.45, 0.15], [0.25, 0.5, 0.25]];
const FACE: [Weights, Weights] = [[0.62, 0.3, 0.08], [0.45, 0.4, 0.15]];
const FINS: [Weights, Weights] = [[0.55, 0.37, 0.08], [0.4, 0.45, 0.15]];
const LINE: [Weights, Weights] = [[0.45, 0.5, 0.05], [0.4, 0.45, 0.15]];
const CORE: [Weights, Weights] = [[0.45, 0.45, 0.1], [0.3, 0.5, 0.2]];
const BALL: [Weights, Weights] = [[0.3, 0.5, 0.2], [0.2, 0.5, 0.3]];
const DUST: [Weights, Weights] = [[0.75, 0.22, 0.03], [0.8, 0.2, 0]];

/** The point cloud for n points (same n → same cloud, always). */
export function buildCloud(n: number): Cloud {
  const rnd = mulberry32(20261105 + n);
  const k = n < 4000 ? 1.3 : 1; // fewer points on phones: a little larger
  const pts: { p: [number, number, number]; s: number; a: number; layer: number; core: number }[] = [];
  const choose = (w: Weights) => {
    const r = rnd();
    return r < w[0] ? 0 : r < w[0] + w[1] ? 1 : 2;
  };
  const add = (x: number, y: number, z: number, look: [Weights, Weights], layer: number, core = -1) =>
    pts.push({ p: toWorld(x, y, z), s: SIZES[choose(look[0])] * k, a: ALPHAS[choose(look[1])], layer, core });

  // Budget: each part gets a share of n; dust takes the remainder.
  const share = (f: number) => Math.max(1, Math.round(n * f));

  const segment = (a: number[], b: number[], count: number, look: [Weights, Weights], layer: number) => {
    for (let i = 0; i < count; i++) {
      const t = (i + 0.2 + rnd() * 0.6) / count;
      add(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, look, layer);
    }
  };
  const polyline = (pl: number[][], count: number, look: [Weights, Weights], layer: number) => {
    const lens = pl.slice(1).map((p, i) => Math.hypot(p[0] - pl[i][0], p[1] - pl[i][1], p[2] - pl[i][2]));
    const total = lens.reduce((s, l) => s + l, 0);
    let left = count;
    lens.forEach((l, i) => {
      const c = i === lens.length - 1 ? left : Math.round((count * l) / total);
      left -= c;
      segment(pl[i], pl[i + 1], c, look, layer);
    });
  };
  const boxEdges = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, count: number, layer: number) => {
    const e: [number[], number[]][] = [];
    for (const z of [z0, z1]) {
      e.push([[x0, y0, z], [x1, y0, z]], [[x1, y0, z], [x1, y1, z]], [[x1, y1, z], [x0, y1, z]], [[x0, y1, z], [x0, y0, z]]);
    }
    for (const [x, y] of [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]) e.push([[x, y, z0], [x, y, z1]]);
    const lens = e.map(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]));
    const total = lens.reduce((s, l) => s + l, 0);
    e.forEach(([a, b], i) => segment(a, b, Math.max(1, Math.round((count * lens[i]) / total)), EDGE, layer));
  };
  const top = (x0: number, x1: number, y0: number, y1: number, z: number, count: number, layer: number, skip?: (x: number, y: number) => boolean) => {
    let made = 0;
    let guard = count * 20;
    while (made < count && guard-- > 0) {
      const x = x0 + (x1 - x0) * rnd();
      const y = y0 + (y1 - y0) * rnd();
      if (skip?.(x, y)) continue;
      add(x, y, z, FACE, layer);
      made++;
    }
  };
  const sides = (s: { w: number; d: number; z: number; h: number }, count: number, layer: number) => {
    const per = 2 * (s.w + s.d);
    for (let i = 0; i < count; i++) {
      let u = rnd() * per * 2;
      const z = s.z + s.h * rnd();
      let x: number;
      let y: number;
      if (u < 2 * s.w) [x, y] = [-s.w + u, -s.d];
      else if ((u -= 2 * s.w) < 2 * s.d) [x, y] = [s.w, -s.d + u];
      else if ((u -= 2 * s.d) < 2 * s.w) [x, y] = [s.w - u, s.d];
      else [x, y] = [-s.w, s.d - (u - 2 * s.w)];
      add(x, y, z, FACE, layer);
    }
  };
  const slab = (s: { w: number; d: number; z: number; h: number }) => [-s.w, s.w, -s.d, s.d, s.z, s.z + s.h] as const;

  // substrate (layer 0) and its BGA balls
  boxEdges(...slab(S), share(0.04), 0);
  top(-S.w, S.w, -S.d, S.d, S.z + S.h, share(0.07), 0);
  sides(S, share(0.03), 0);
  const perBall = Math.max(2, Math.round((n * 0.1) / BALLS.length));
  for (const [bx, by] of BALLS)
    for (let i = 0; i < perBall; i++) {
      const u = rnd() * 2 - 1;
      const th = rnd() * Math.PI * 2;
      const r = Math.sqrt(1 - u * u) * 3.6;
      add(bx + r * Math.cos(th), by + r * Math.sin(th), S.z - 5 + u * 3.6, BALL, 0);
    }

  // interposer (layer 1) and its traces
  boxEdges(...slab(I), share(0.035), 1);
  top(-I.w, I.w, -I.d, I.d, I.z + I.h, share(0.06), 1, (x, y) => Math.abs(x) < D.w && Math.abs(y) < D.d);
  const perTrace = Math.max(3, Math.round((n * 0.11) / TRACES.length));
  for (const t of TRACES) polyline(t.map(([x, y]) => [x, y, I.z + I.h + 0.4]), perTrace, LINE, 1);

  // die (layer 2) and its cores
  boxEdges(...slab(D), share(0.03), 2);
  sides(D, share(0.025), 2);
  const inCore = (x: number, y: number) => CORES.some((c) => x > c.x0 - 1 && x < c.x1 + 1 && y > c.y0 - 1 && y < c.y1 + 1);
  top(-D.w, D.w, -D.d, D.d, D.z + D.h, share(0.025), 2, inCore);
  const perCore = Math.max(4, Math.round((n * 0.06) / CORES.length));
  const side = Math.max(2, Math.round(Math.sqrt(perCore)));
  CORES.forEach((c, ci) => {
    for (let i = 0; i < side; i++)
      for (let j = 0; j < side; j++) {
        const x = c.x0 + ((i + 0.5) / side) * (c.x1 - c.x0) + (rnd() - 0.5) * 0.8;
        const y = c.y0 + ((j + 0.5) / side) * (c.y1 - c.y0) + (rnd() - 0.5) * 0.8;
        add(x, y, D.z + D.h + 0.3, CORE, 2, ci);
      }
  });

  // heat sink (layer 3): plate and fins
  boxEdges(...slab(H), share(0.04), 3);
  top(-H.w, H.w, -H.d, H.d, H.z + H.h, share(0.06), 3);
  const finStep = (H.d * 2 - FIN.t) / (FIN.count - 1);
  const perFin = Math.max(6, Math.round((n * 0.22) / FIN.count));
  const fz0 = H.z + H.h;
  for (let f = 0; f < FIN.count; f++) {
    const y0 = -H.d + f * finStep;
    const x0 = -H.w + 4;
    const x1 = H.w - 4;
    // top edge (dense), the two vertical ends, then the face (sparse)
    segment([x0, y0, fz0 + FIN.h], [x1, y0, fz0 + FIN.h], Math.round(perFin * 0.25), EDGE, 3);
    segment([x0, y0, fz0], [x0, y0, fz0 + FIN.h], Math.round(perFin * 0.06), EDGE, 3);
    segment([x1, y0, fz0], [x1, y0, fz0 + FIN.h], Math.round(perFin * 0.06), EDGE, 3);
    for (let i = 0, m = perFin - 2 * Math.round(perFin * 0.06) - Math.round(perFin * 0.25); i < m; i++)
      add(x0 + (x1 - x0) * rnd(), y0 + (rnd() < 0.5 ? 0 : FIN.t), fz0 + FIN.h * rnd(), FINS, 3);
  }

  // dust: a faint halo around the chip, the rest of the budget
  while (pts.length < n) {
    const u = rnd() * 2 - 1;
    const th = rnd() * Math.PI * 2;
    const r = 1.3 + rnd() * 0.32;
    const q = Math.sqrt(1 - u * u);
    pts.push({ p: [r * q * Math.cos(th), r * u * 0.8, r * q * Math.sin(th)], s: SIZES[choose(DUST[0])] * k, a: ALPHAS[choose(DUST[1])] * 0.7, layer: -1, core: -1 });
  }
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
    seed: new Float32Array(n),
    layer: new Float32Array(n),
    core: new Float32Array(n),
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
    cloud.seed[i] = rnd();
    cloud.layer[i] = pt.layer;
    cloud.core[i] = pt.core;
  });
  return cloud;
}

/** Data packets: one head and two tail points per trace, each trace with its own pace and colour. */
export function buildPackets(): Packets {
  const rnd = mulberry32(7);
  const per = 3;
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

/** Project a world point the way the WebGL scene does at rest (no extra spread): returns 0..1 coordinates over the canvas box and the view depth. */
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
  const f = 1 / Math.tan(((CAM.fov / 2) * Math.PI) / 180);
  return [(1 + (f * x1) / depth) / 2, (1 - (f * y2) / depth) / 2, depth];
}

/** Diameter, as a fraction of the canvas box, of a point of world size s at a given depth. */
export const projectedSize = (s: number, depth: number) => (s / depth / Math.tan(((CAM.fov / 2) * Math.PI) / 180)) / 2;

/**
 * An SVG of the cloud's first frame (the sphere) or of the assembled chip
 * without its cores (for reduced motion and no JavaScript): black dots on
 * transparent, used as a CSS mask so the page paints them in its own ink. Or
 * the cores alone, in their accent colours, used as a plain image. Dots are
 * round-capped zero-length strokes, grouped by diameter, opacity and colour,
 * on integer coordinates (finer than the poster is ever drawn).
 */
export function posterSVG(n: number, mode: "sphere" | "still" | "cores"): string {
  const c = buildCloud(n);
  const V = 1000;
  const groups = new Map<string, string[]>();
  for (let i = 0; i < c.n; i++) {
    const isCore = c.core[i] >= 0;
    if ((mode === "still" && isCore) || (mode === "cores" && !isCore)) continue;
    const src = mode === "sphere" ? c.sphere : c.chip;
    const [u, v, depth] = project(src.subarray(i * 3, i * 3 + 3));
    const d = Math.max(0.5, Math.round(projectedSize(c.size[i], depth) * V * 0.975 * 4) / 4);
    const colour = mode === "cores" ? AI[c.core[i] % AI.length] : "#000";
    const alpha = mode === "cores" ? 0.9 : c.alpha[i];
    const key = `${d}|${alpha}|${colour}`;
    const list = groups.get(key) ?? [];
    list.push(`M${Math.round(u * V)} ${Math.round(v * V)}h0`);
    groups.set(key, list);
  }
  const paths = [...groups.entries()]
    .map(([key, list]) => {
      const [d, a, colour] = key.split("|");
      return `<path stroke="${colour}" stroke-width="${d}"${a === "1" ? "" : ` stroke-opacity="${a}"`} d="${list.join("")}"/>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${V} ${V}"><g fill="none" stroke-linecap="round">${paths}</g></svg>`;
}
