import { BufferAttribute, BufferGeometry, Camera, FloatType, HalfFloatType, NearestFilter, NoBlending, Points, Scene, ShaderMaterial, WebGLRenderer, WebGLRenderTarget } from "three";
import { FIN, LAYERS } from "@/lib/chip";
import { AI, buildPackets, CAM, FOCAL, SWAY, toWorld } from "@/lib/chip-cloud";
import { BARS, buildParticles, FIGURES, FLOW, FRAMES, GEARS, trendOf, type FigureId, type Frame } from "@/lib/figure-cloud";
import { DRIFT, particleConfig, SIM } from "@/lib/particle-config";
import { CLOUD_SIM, CLOUD_VERT, DOT_FRAG, GLOW_FRAG, PACKET_SIM, PACKET_VERT, SQUEEZE, STATE_FRAG, STATE_W, TRAIL } from "./shaders";

const INK = { light: "#1d1d1f", dark: "#f5f5f7" };
/** Ink opacity per theme: light dots on black read bolder, so dark mode is a little lighter (the posters match it in CSS). */
const INK_ALPHA = { light: 1, dark: 0.85 };
/** Seconds: the sphere condensing into the chip; a figure condensing out of mist, dissolving into it, and flying to its neighbour. */
const INTRO = 1.5;
const FORM_IN = 0.5;
const FORM_OUT = 0.3;
const FLIGHT = 0.6;
/** A figure starts to form as soon as this much of its gap is on screen, and stays until less than this is left. */
const SEEN = 0.25;
const HELD = 0.15;
/** Phones: the chip condenses the first time this much of it is on screen. */
const ENTER = 0.35;
/** A slow frame is caught up in slices of this many seconds (up to MAX_LAG), so a figure takes the time it says to form at any frame rate. */
const STEP = 0.05;
const MAX_LAG = 0.25;
/** Full-screen canvas: the strip of screen under the navigation does not count as seen. */
const NAV = 64;
/** Buffer cap: DPR 2 at most, and about four megapixels. */
const MAX_DPR = 2;
const MAX_PIXELS = 4e6;
/** How far the figure leans towards the cursor (radians, about the screen's y and x axes): a hint, about 14° and 10°. It turns as a whole: nothing in it bends. */
const GAZE = { yaw: 0.24, pitch: 0.18 };
/** How far hovering pulls the chip's layers apart (world units between neighbours). */
const OPEN = 0.16;
/** Radians a figure turns per pixel dragged. */
const TURN = 0.0055;
/** A dragged figure comes home like a critically damped spring of this stiffness (damping 2·√k: no bounce). */
const HOME = 34;
/**
 * The chip keeps clear of the texts over it (the hero's name and the line under it), however it is tilted, opened or
 * dragged: no point's centre comes closer than CLEAR px (24 plus the largest dot's radius), and the chip itself, as a
 * rigid body, stays SQUEEZE px further out: that strip is where the points the cursor pushes pile up instead of crossing.
 */
const CLEAR = 30;
/** How hard a click throws the points (px). */
const CLICK: Record<FigureId, number> = { chip: 110, bars: 90, gears: 90, globe: 200, funnel: 90, flow: 90, book: 90 };
/** Without the simulation: the cursor's path is kept this long (samples, at most one per 1/90 s), enough for the shader's taps. */
const PATH = 128;

export interface SceneOptions {
  /** number of points (CLOUD_SIZE.desktop or .mobile; must match the poster shown) */
  n: number;
  /** true: a fixed, full-screen canvas and every figure (desktop). false: the canvas inside the chip's stage and only the chip (phones). */
  layer: boolean;
  /** a mouse: gaze, proximity, hover and drag */
  pointer: boolean;
  /** called once the first frame (identical to the poster) is on screen */
  onFirstFrame: () => void;
  /** WebGL unavailable or lost: the page shows the still posters */
  onFail: () => void;
}
export interface SimState {
  points: Float32Array;
  clock: number;
}
export interface SceneHandle {
  dispose: () => void;
  /** Queue the next frame again, behind whoever else animates the scroll, so both use the same scroll position. */
  rearm: () => void;
  /** For the tests (through the tuning panel): every point's state as the simulation has it now (per point: offset x, y and velocity x, y, in pixels) and the simulation's clock (s), or null without the simulation. */
  state: () => SimState | null;
}

/** A figure's gap on the page. Positions are document coordinates, cached: nothing here is read per frame. */
interface Spot {
  id: FigureId;
  index: number;
  el: HTMLElement;
  zone: HTMLElement;
  section: HTMLElement;
  /** one of several figures that share a gap: only the one the gap names (data-figure) is formed */
  shared: boolean;
  frame: Frame;
  known: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  /** top, relative to its section */
  dy: number;
  /** fraction on screen */
  v: number;
  /** the drag's turn (about the screen's y and x axes) and its speed */
  yaw: number;
  pitch: number;
  vyaw: number;
  vpitch: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const damp = (a: number, b: number, k: number, dt: number) => a + (b - a) * (1 - Math.exp(-k * dt));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
/** Hand the main thread back between setup steps, so no step is one long task. */
const nextTask = () => new Promise<void>((r) => setTimeout(r, 0));
const rgb = (hex: string) => [1, 3, 5].map((o) => parseInt(hex.slice(o, o + 2), 16) / 255);

/** Rx(a) · Ry(b), row by row. */
function turnXY(a: number, b: number, out: number[]) {
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const cb = Math.cos(b);
  const sb = Math.sin(b);
  out[0] = cb;
  out[1] = 0;
  out[2] = sb;
  out[3] = sa * sb;
  out[4] = ca;
  out[5] = -sa * cb;
  out[6] = -ca * sb;
  out[7] = sa;
  out[8] = ca * cb;
}

/**
 * The page's point cloud (three.js Points with custom shaders, one WebGL
 * context). It condenses from a sphere into the hero's chip and, further
 * down, forms a figure in each gap marked [data-figure]: it flies straight
 * to a neighbour that is on screen at the same time, and otherwise dissolves
 * into mist and condenses again. Which figure it forms depends only on where
 * the gaps are on screen, and it always finishes: whenever the scroll stops
 * it ends up as the most visible figure, or gone.
 *
 * A figure is rigid and its points move one by one: each drifts with a slow
 * flow its neighbours share, and the cursor stirs them like water. With a
 * mouse every point has its own state (how far it is from its place, and how
 * fast it moves), kept in a float texture and advanced on the GPU in fixed
 * steps: a spring back to its place, the cursor's push and its wake, a
 * click's kick (shaders.ts, SIM; the numbers are in lib/particle-config.ts).
 * The state is never reset, so the points keep their momentum while the cloud
 * flies from figure to figure. Without a mouse, or without float textures,
 * there is no state and the push is worked out from the cursor's recent path.
 * The figure as a whole only turns: it leans towards the cursor, a drag turns
 * it and it comes home without a bounce. Hovering opens the chip.
 *
 * Set up in small steps (yielding in between, shaders compiled
 * asynchronously). The loop stops when no figure is on screen or the tab is
 * hidden.
 */
export function mountFigures(canvas: HTMLCanvasElement, opts: SceneOptions): SceneHandle {
  const html = document.documentElement;
  let alive = true;
  let rearm = () => {};
  let readState: () => SimState | null = () => null;
  const disposers: (() => void)[] = [];
  const dispose = () => {
    alive = false;
    disposers.splice(0).reverse().forEach((d) => d());
  };

  void (async () => {
    await nextTask();
    if (!alive) return;
    const p = buildParticles(opts.n, opts.layer);
    const pk = buildPackets();
    await nextTask();
    if (!alive) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "low-power" });
    } catch {
      opts.onFail();
      return;
    }
    const gl = renderer;
    disposers.push(() => gl.dispose());
    gl.debug.checkShaderErrors = process.env.NODE_ENV !== "production";
    gl.setClearColor(0x000000, 0);

    /* ------------------------------ geometry ------------------------------ */

    const chipMeta = new Float32Array(p.n * 4);
    for (let i = 0; i < p.n; i++) chipMeta.set([p.layer[i], p.core[i], p.ring[i], p.tint[i]], i * 4);
    const cloudGeo = new BufferGeometry();
    cloudGeo.setAttribute("position", new BufferAttribute(p.chip, 3));
    cloudGeo.setAttribute("aSphere", new BufferAttribute(p.sphere, 3));
    cloudGeo.setAttribute("aChip", new BufferAttribute(chipMeta, 4));
    cloudGeo.setAttribute("aBars", new BufferAttribute(p.bars, 4));
    cloudGeo.setAttribute("aGears", new BufferAttribute(p.gears, 4));
    cloudGeo.setAttribute("aFunnel", new BufferAttribute(p.funnel, 4));
    cloudGeo.setAttribute("aFlow", new BufferAttribute(p.flow, 4));
    cloudGeo.setAttribute("aBook", new BufferAttribute(p.book, 4));
    cloudGeo.setAttribute("aSize", new BufferAttribute(p.sizes, 4));
    cloudGeo.setAttribute("aAlpha", new BufferAttribute(p.alphas, 4));
    cloudGeo.setAttribute("aSize2", new BufferAttribute(p.sizes2, 4));
    cloudGeo.setAttribute("aAlpha2", new BufferAttribute(p.alphas2, 4));
    cloudGeo.setAttribute("aSeed", new BufferAttribute(p.seed, 4));

    // With a mouse, and where the GPU can draw into a float texture: the points' state, one texel each (the cloud's, then the
    // packets'), in two textures that take turns (one is read while the other is written).
    const floats = opts.pointer ? (gl.extensions.has("EXT_color_buffer_float") ? FloatType : gl.extensions.has("EXT_color_buffer_half_float") ? HalfFloatType : null) : null;
    const stateSize: [number, number] = [STATE_W, Math.ceil((p.n + pk.n) / STATE_W)];
    const makeState = () => new WebGLRenderTarget(stateSize[0], stateSize[1], { type: floats!, minFilter: NearestFilter, magFilter: NearestFilter, depthBuffer: false });
    const state = floats ? [makeState(), makeState()] : null;
    // (FIGURES: the shader's code for every figure but the chip, and for the flights between them: desktop only)
    const defines: Record<string, string> = { ...(state ? { STATEFUL: "" } : {}), ...(opts.layer ? { FIGURES: "" } : {}) };
    canvas.dataset.sim = state ? "gpu" : "trail";
    disposers.push(() => {
      state?.forEach((s) => s.dispose());
      delete canvas.dataset.sim;
    });

    // Colours go to the shaders as plain sRGB numbers and come out unchanged (no colour management): #1D1D1F on screen is #1D1D1F.
    const u = {
      uView: { value: [1, 1] },
      uDpr: { value: 1 },
      uTime: { value: 0 },
      uEdge: { value: opts.layer ? 0 : 1 },
      uFigA: { value: 0 },
      uFigB: { value: 0 },
      uBoxA: { value: [0, 0, 1] },
      uBoxB: { value: [0, 0, 1] },
      uRotA: { value: new Float32Array(9) },
      uRotB: { value: new Float32Array(9) },
      uFlight: { value: 0 },
      uForm: { value: 1 },
      uIntro: { value: 0 },
      uSpread: { value: 0 },
      uTrail: { value: new Float32Array(TRAIL.taps * 3) },
      uHover: { value: [0, 0] },
      uClick: { value: [0, 0, 99, 0] },
      uLintel: { value: new Float32Array(8) },
      uGuard: { value: 0 },
      uRun: { value: 0 },
      uDrift: { value: [0, 0] },
      uState: { value: state?.[0].texture ?? null },
      // the simulation's own
      uStateSize: { value: stateSize },
      uCursor: { value: [0, 0, 0, 0] },
      uCursorV: { value: [0, 0, 0] },
      uRepel: { value: [1, 0, 0] },
      uSpring: { value: [1, 1, SIM.step] },
    };
    const cu = {
      ...u,
      uCoreClock: { value: 0 },
      uWave: { value: -1 },
      uBarH: { value: Float32Array.from(BARS.rest) },
      uTrend: { value: Float32Array.from(trendOf(BARS.rest, [])) },
      uGear: { value: 0 },
      uGearK: { value: Float32Array.from(GEARS.c.flatMap(([x, y], g) => [x, y, GEARS.ratio[g], GEARS.phase[g]])) },
      uWire: { value: Float32Array.from(FLOW.wires.flat()) },
      uInkA: { value: [0, 0, 0, 1] },
      uInkB: { value: [0, 0, 0, 1] },
      uAI: { value: Float32Array.from(AI.flatMap(rgb)) },
    };
    const cloudMat = new ShaderMaterial({ vertexShader: CLOUD_VERT, fragmentShader: DOT_FRAG, uniforms: cu, defines, transparent: true, depthWrite: false, depthTest: false });
    const cloud = new Points(cloudGeo, cloudMat);
    cloud.frustumCulled = false;
    cloud.renderOrder = 0;

    // the data packets, drawn over the ink
    const pGeo = new BufferGeometry();
    const ctrl = (k: number) => {
      const a = new Float32Array(pk.n * 3);
      for (let i = 0; i < pk.n; i++) a.set(pk.path.subarray(i * 12 + k * 3, i * 12 + k * 3 + 3), i * 3);
      return new BufferAttribute(a, 3);
    };
    pGeo.setAttribute("position", ctrl(0));
    pGeo.setAttribute("aP1", ctrl(1));
    pGeo.setAttribute("aP2", ctrl(2));
    pGeo.setAttribute("aP3", ctrl(3));
    pGeo.setAttribute("aMarks", new BufferAttribute(pk.marks, 2));
    pGeo.setAttribute("aMotion", new BufferAttribute(pk.motion, 3));
    pGeo.setAttribute("aColor", new BufferAttribute(pk.color, 3));
    const pu = { ...u, uPulseClock: { value: 0 }, uSize: { value: opts.n < 4000 ? 0.125 : 0.105 }, uChip: { value: 1 }, uStateBase: { value: p.n } };
    const pMat = new ShaderMaterial({ vertexShader: PACKET_VERT, fragmentShader: GLOW_FRAG, uniforms: pu, defines, transparent: true, depthWrite: false, depthTest: false });
    const packets = new Points(pGeo, pMat);
    packets.frustumCulled = false;
    packets.renderOrder = 1;
    const scene = new Scene();
    const camera = new Camera();
    scene.add(cloud, packets);
    // the simulation's pass: the same points with the same uniforms, each drawn into its own texel of the state
    const simScene = new Scene();
    const simMats = state ? [new ShaderMaterial({ vertexShader: CLOUD_SIM, uniforms: cu }), new ShaderMaterial({ vertexShader: PACKET_SIM, uniforms: pu })] : [];
    simMats.forEach((m, i) => {
      m.setValues({ fragmentShader: STATE_FRAG, defines: { ...defines, SIM: "" }, blending: NoBlending, depthWrite: false, depthTest: false });
      const points = new Points(i ? pGeo : cloudGeo, m);
      points.frustumCulled = false;
      simScene.add(points);
    });
    disposers.push(() => {
      cloudGeo.dispose();
      cloudMat.dispose();
      pGeo.dispose();
      pMat.dispose();
      simMats.forEach((m) => m.dispose());
    });

    /* -------------------------- the gaps on the page -------------------------- */

    const spots: Spot[] = [];
    document.querySelectorAll<HTMLElement>("[data-figure]").forEach((el) => {
      // a gap can take turns between several figures (data-figure-set); data-figure says which one it is now
      const ids = (el.dataset.figureSet ?? el.dataset.figure ?? "").split(" ") as FigureId[];
      for (const id of ids) {
        const index = FIGURES.indexOf(id);
        if (index < 0 || (!opts.layer && id !== "chip") || spots.some((s) => s.id === id)) continue;
        spots.push({ id, index, el, zone: el.querySelector<HTMLElement>("[data-figure-zone]") ?? el, section: el.closest<HTMLElement>("section") ?? el, shared: ids.length > 1, frame: FRAMES[id], known: false, x: 0, y: 0, w: 0, h: 0, dy: 0, v: 0, yaw: 0, pitch: 0, vyaw: 0, vpitch: 0 });
      }
    });
    const zones = [...new Set(spots.map((s) => s.zone))];
    const CHIP = spots.findIndex((s) => s.id === "chip");
    const BARS_AT = spots.findIndex((s) => s.id === "bars");
    // the texts over the chip (the hero's name and its availability line): the chip never comes closer to them than CLEAR
    const lintelEls = opts.layer && CHIP >= 0 ? [...document.querySelectorAll<HTMLElement>("[data-figure-lintel]")].slice(0, 2) : [];
    /** each text's box grown by CLEAR, in document coordinates: left, right, bottom */
    const lintels: [number, number, number][] = [];
    /** How low a point at x has to stay (canvas y): under every box, whose lower corners are cut at 45°. */
    const limitAt = (x: number, sx: number, sy: number) => {
      let lim = -Infinity;
      for (const [x0, x1, y] of lintels) lim = Math.max(lim, y - sy - Math.max(0, x - (x1 - sx), x0 - sx - x));
      return lim;
    };
    // the chip's box, layer by layer (each moves apart from the others as it opens): the points that can end up on top
    const chipBox: { p: [number, number, number]; layer: number }[] = [];
    [LAYERS.substrate, LAYERS.interposer, LAYERS.die, LAYERS.sink].forEach((slab, layer) => {
      const z0 = slab.z - (layer === 0 ? 5 : 0);
      const z1 = slab.z + slab.h + (layer === 3 ? FIN.h : 0);
      for (const x of [-slab.w, slab.w]) for (const y of [-slab.d, slab.d]) for (const z of [z0, z1]) chipBox.push({ p: toWorld(x, y, z), layer });
    });

    let vw = 1;
    let vh = 1;
    /** phones: where the canvas is in the document */
    let ox = 0;
    let oy = 0;
    let dirty = true;
    /** Layout reads, only when something changed size (never per frame). */
    const measure = () => {
      dirty = false;
      const sx = window.scrollX;
      const sy = window.scrollY;
      vw = window.innerWidth;
      vh = window.innerHeight;
      for (const s of spots) {
        const sec = s.section.getBoundingClientRect();
        // Only near the screen: further away the section may still be skipped (content-visibility) and measuring inside it would force its layout.
        if (sec.bottom > -vh && sec.top < 2 * vh) {
          const r = s.el.getBoundingClientRect();
          s.x = r.left + sx;
          s.dy = r.top - sec.top;
          s.w = r.width;
          s.h = r.height;
          s.known = r.width > 0 && r.height > 0;
        }
        s.y = sec.top + sy + s.dy;
      }
      if (!opts.layer) {
        const r = canvas.getBoundingClientRect();
        ox = r.left + sx;
        oy = r.top + sy;
      }
      lintels.length = 0;
      for (const el of lintelEls) {
        // the text itself, not its block (which spans the page)
        const range = document.createRange();
        range.selectNodeContents(el);
        const r = range.getBoundingClientRect();
        if (r.width > 0) lintels.push([r.left + sx - CLEAR, r.right + sx + CLEAR, r.bottom + sy + CLEAR]);
      }
    };

    /* ------------------------------- the state ------------------------------- */

    // The cloud is figure A, or between A and B (two figures of the same gap); form 0 is mist.
    let figA = -1;
    let figB = -1;
    let flight = 0;
    let form = 0;
    let held = -1;
    const present = () => (figA < 0 ? -1 : figA !== figB && flight > 0.5 ? figB : figA);

    /** Which figure the screen asks for: the most visible gap, the nearest to the middle on a tie. No layout reads. */
    const wanted = (sy: number) => {
      const top = opts.layer ? NAV : 0;
      let best = -1;
      let bestScore = -Infinity;
      for (let i = 0; i < spots.length; i++) {
        const s = spots[i];
        if (!s.known) {
          s.v = 0;
          continue;
        }
        const y0 = s.y - sy;
        s.v = clamp((Math.min(y0 + s.h, vh) - Math.max(y0, top)) / s.h, 0, 1);
        if (s.shared && s.el.dataset.figure !== s.id) continue;
        // phones: the chip stays assembled for as long as any of it is on screen
        // (figures of one gap take over from each other at once: the gap is «held» by whichever is there)
        const mine = i === held || (held >= 0 && spots[held].el === s.el);
        if (s.v < (opts.layer ? (mine ? HELD : SEEN) : 0.02)) continue;
        const mid = (top + vh) / 2;
        const score = s.v + 0.5 * (1 - Math.min(1, Math.abs(y0 + s.h / 2 - mid) / (vh - mid))) + (mine ? 0.1 : 0);
        if (score > bestScore) {
          bestScore = score;
          best = i;
        }
      }
      held = best;
      return best;
    };
    /** Figures of the same gap: the cloud flies from one to the other instead of dissolving. */
    const linked = (a: number, b: number) => a !== b && a >= 0 && b >= 0 && spots[a].el === spots[b].el;

    const advance = (want: number, dt: number) => {
      if (!opts.layer) {
        // phones: the chip is simply there, assembled, whenever any of it is on screen
        figA = figB = want;
        form = 1;
        return;
      }
      if (figA < 0) {
        if (want < 0) return;
        figA = figB = want;
        flight = 0;
        form = 0;
      }
      if (figA !== figB) {
        // a third figure, linked to one of the ends (the gap changed its mind in mid-flight): land there first, then fly on
        const onward = want !== figA && want !== figB && (linked(figB, want) || linked(figA, want));
        if (want === figB) flight += dt / FLIGHT;
        else if (want === figA) flight -= dt / FLIGHT;
        else if (onward) flight += ((linked(figB, want) ? 1 : -1) * dt) / FLIGHT;
        else {
          // neither end is wanted any more: finish the flight while dissolving
          flight += ((flight > 0.5 ? 1 : -1) * dt) / FLIGHT;
          form -= dt / FORM_OUT;
        }
        if (want === figA || want === figB || onward) form += dt / FORM_IN;
        if (flight >= 1) figA = figB;
        else if (flight <= 0) figB = figA;
        if (figA === figB) flight = 0;
      } else if (want === figA) form += dt / FORM_IN;
      else if (want >= 0 && form > 0.6 && linked(figA, want)) {
        figB = want;
        flight = 0;
      } else form -= dt / FORM_OUT;
      form = clamp(form, 0, 1);
      flight = clamp(flight, 0, 1);
      if (form <= 0) {
        // all mist: the cloud is free to appear wherever it is wanted next
        figA = figB = want;
        flight = 0;
      }
    };

    /* ------------------------------- the cursor ------------------------------ */

    const ptr = { x: 0, y: 0, on: false, presence: 0, gx: 0, gy: 0, over: null as HTMLElement | null, open: 0 };
    // The simulation's cursor, in document coordinates (so the page scrolling under a still mouse moves it across the
    // points): where it was at the last step, how fast it moves, and whether it has just come onto the page.
    const sim = { x: 0, y: 0, vx: 0, vy: 0, fresh: true, due: 0, waited: 0, clock: 0, flip: 0 };
    // Without the simulation: the cursor's recent path (document coordinates too).
    const path = { t: new Float64Array(PATH), x: new Float32Array(PATH), y: new Float32Array(PATH), on: new Float32Array(PATH), head: 0, count: 0 };
    const trail = u.uTrail.value;
    const lintel = u.uLintel.value;
    /** Where the cursor was `ago` seconds ago, straight into the shader's tap k. */
    const tap = (k: number, ago: number, dx: number, dy: number) => {
      const when = t - ago;
      let i = path.head;
      let j = i;
      for (let n = 1; n < path.count && path.t[i] > when; n++) {
        j = i;
        i = (i + PATH - 1) % PATH;
      }
      const span = path.t[j] - path.t[i];
      const f = span > 0 ? clamp((when - path.t[i]) / span, 0, 1) : 0;
      trail[k * 3] = path.x[i] + (path.x[j] - path.x[i]) * f - dx;
      trail[k * 3 + 1] = path.y[i] + (path.y[j] - path.y[i]) * f - dy;
      trail[k * 3 + 2] = path.count ? path.on[i] + (path.on[j] - path.on[i]) * f : 0;
    };
    let press: { spot: Spot; x: number; y: number; lastX: number; lastY: number; lastT: number; moved: boolean; drag: boolean; gear: number } | null = null;
    /** (`at`: on the simulation's clock when there is one, so the kick lasts the same number of steps at any frame rate) */
    let click = { x: 0, y: 0, at: -99, power: 0 };
    const clock = () => (state ? sim.clock : t);
    const gear = { phi: 0, vel: 0 };
    let liveZone: HTMLElement | null | undefined;
    /** the clock of what the figures do by themselves (pages, wires, the file out of the funnel) */
    let run = 0;

    // clocks and loop state
    let t = 0;
    let introT = 0;
    let pulse = 0;
    let cores = 0;
    let waveT = 2.3;
    let raf = 0;
    let last = 0;
    let dpr = 1;
    let lastSy = window.scrollY;
    let scrollVel = 0;
    let started = false;
    let parked = false;
    let slow = 0;
    let dprCap = MAX_DPR;
    /** phones: hold the intro (the sphere) until the chip is on screen */
    let introWaits = false;
    const barH = cu.uBarH.value;
    const barV = new Float32Array(BARS.count);
    const barGoal = Float32Array.from(BARS.rest);
    const barWait = new Float32Array(BARS.count);
    let barsOn = false;
    let nextData = 1.2;
    let spin = 0;
    let driftT = 0;

    const boxOf = (s: Spot, out: number[], sx: number, sy: number) => {
      const unit = Math.min(s.w / (2 * s.frame.w), s.h / (2 * s.frame.h));
      out[0] = s.x + s.w / 2 - (opts.layer ? sx : ox) - s.frame.cx * unit;
      out[1] = s.y + s.h / 2 - (opts.layer ? sy : oy) + s.frame.cy * unit;
      out[2] = unit;
    };
    const m1: number[] = [];
    const m2: number[] = [];
    /** The figure's rotation: its rest view (plus the chip's sway or the globe's spin), then, in screen space, `k` of the gaze and the drag. Column-major. */
    const rotOf = (s: Spot, out: Float32Array, k = 1) => {
      const yaw = s.frame.yaw + (s.id === "chip" ? SWAY.amp * Math.sin(SWAY.speed * t) : s.id === "globe" ? spin : 0);
      turnXY(s.frame.tilt, yaw, m2);
      turnXY(k * (ptr.gy + s.pitch), k * (ptr.gx + s.yaw), m1);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) out[c * 3 + r] = m1[r * 3] * m2[c] + m1[r * 3 + 1] * m2[3 + c] + m1[r * 3 + 2] * m2[6 + c];
    };
    /** Where a world point of a figure lands on the canvas (the shader's place(), for the few points the page needs). */
    const placeXY = (x: number, y: number, z: number, rot: Float32Array, box: number[]): [number, number] => {
      const qx = rot[0] * x + rot[3] * y + rot[6] * z;
      const qy = rot[1] * x + rot[4] * y + rot[7] * z;
      const qz = rot[2] * x + rot[5] * y + rot[8] * z;
      const k = (FOCAL / (CAM.dist - qz)) * box[2];
      return [box[0] + qx * k, box[1] - qy * k];
    };

    const probe = new Float32Array(9);
    /** Whether the chip keeps clear of the texts over it with `k` of its tilt (gaze and drag) and of its opening. */
    const clear = (s: Spot, box: number[], k: number, sx: number, sy: number) => {
      rotOf(s, probe, k);
      for (const c of chipBox) {
        const [x, y] = placeXY(c.p[0], c.p[1] + (c.layer - 1.5) * k * ptr.open * OPEN, c.p[2], probe, box);
        if (y < limitAt(x, sx, sy) + SQUEEZE) return false;
      }
      return true;
    };
    /** How much of its tilt and opening the chip may take: all of it, or the largest share that keeps it clear (found by halving). */
    const reach = (s: Spot, box: number[], sx: number, sy: number) => {
      if (clear(s, box, 1, sx, sy)) return 1;
      let lo = 0;
      let hi = 1;
      for (let i = 0; i < 7; i++) {
        const mid = (lo + hi) / 2;
        if (clear(s, box, mid, sx, sy)) lo = mid;
        else hi = mid;
      }
      return lo;
    };

    // ink: the theme's (the globe, on its dark band, is always light), or the system text colour in high-contrast mode
    const forced = matchMedia("(forced-colors: active)");
    let ink = { auto: [...rgb(INK.light), 1], light: [...rgb(INK.dark), 1] };
    const applyTheme = () => {
      if (forced.matches) {
        const probe = document.createElement("span");
        probe.style.color = "CanvasText";
        document.body.append(probe);
        const c = (getComputedStyle(probe).color.match(/[\d.]+/g) ?? ["0", "0", "0"]).slice(0, 3).map((v) => Number(v) / 255);
        probe.remove();
        ink = { auto: [...c, 1], light: [...c, 1] };
      } else {
        const dark = html.dataset.theme === "dark";
        ink = { auto: [...rgb(dark ? INK.dark : INK.light), dark ? INK_ALPHA.dark : INK_ALPHA.light], light: [...rgb(INK.dark), 0.92] };
      }
      if (started && !parked && !document.hidden) render(0);
    };
    const inkOf = (i: number) => (i >= 0 && spots[i].id === "globe" ? ink.light : ink.auto);

    /** Advance everything by dt and, unless this is a catch-up slice, draw. */
    const render = (dt: number, draw = true) => {
      if (dirty) measure();
      const sx = window.scrollX;
      const sy = window.scrollY;
      const busy = html.hasAttribute("data-agent-busy");
      const rate = busy ? 2.4 : 1;
      t += dt;
      if (dt > 0) scrollVel = damp(scrollVel, (sy - lastSy) / dt, 8, dt);
      lastSy = sy;

      const want = wanted(sy);
      advance(want, dt);
      const at = present();
      if (figA < 0) {
        if (draw) gl.clear();
        // (when a figure is back the cursor may be anywhere: it has not swept its way there)
        sim.fresh = true;
        return;
      }
      const A = spots[figA];
      const B = spots[figB];
      const here = spots[at];
      const settled = form > 0.9 && figA === figB;

      // the cursor, in canvas pixels: its path (each point answers to it on its own, in the shader), the gaze and the hover
      const cx = ptr.x - (opts.layer ? 0 : ox - sx);
      const cy = ptr.y - (opts.layer ? 0 : oy - sy);
      ptr.presence = damp(ptr.presence, ptr.on ? 1 : 0, 8, dt);
      if (!state) {
        if (!path.count || t - path.t[path.head] >= 1 / 90) {
          path.head = (path.head + 1) % PATH;
          path.count = Math.min(PATH, path.count + 1);
        }
        path.t[path.head] = t;
        path.x[path.head] = ptr.x + sx;
        path.y[path.head] = ptr.y + sy;
        path.on[path.head] = ptr.presence;
        for (let k = 0; k < TRAIL.taps; k++) tap(k, (k + 0.5) * TRAIL.dt, opts.layer ? sx : ox, opts.layer ? sy : oy);
      }
      boxOf(here, u.uBoxA.value, sx, sy);
      const lean = ptr.on && !press?.moved ? 1 : 0;
      ptr.gx = damp(ptr.gx, lean * GAZE.yaw * clamp((cx - u.uBoxA.value[0]) / (vw * 0.5), -1, 1), 5, dt);
      // (less when the cursor is above: tipped any further back, the figure would be seen edge-on)
      ptr.gy = damp(ptr.gy, lean * GAZE.pitch * clamp((cy - u.uBoxA.value[1]) / (vh * 0.5), -0.6, 1), 5, dt);
      ptr.open = damp(ptr.open, settled && ptr.over === here.zone ? 1 : 0, 6, dt);
      const live = settled && opts.pointer ? here.zone : null;
      if (liveZone !== live) {
        liveZone = live;
        for (const z of zones) z.toggleAttribute("data-live", z === live);
      }

      // a released drag: the figure comes back home without a bounce (critically damped); the globe keeps turning and slows down
      for (const s of spots) {
        if (press?.moved && press.spot === s) continue;
        if (s.id === "globe") {
          s.yaw += s.vyaw * dt;
          s.pitch = clamp(s.pitch + s.vpitch * dt, -1.1, 1.1) * Math.exp(-0.3 * dt);
          s.vyaw *= Math.exp(-1.4 * dt);
          s.vpitch *= Math.exp(-2.4 * dt);
        } else {
          const c = 2 * Math.sqrt(HOME);
          s.vyaw += (-HOME * s.yaw - c * s.vyaw) * dt;
          s.vpitch += (-HOME * s.pitch - c * s.vpitch) * dt;
          s.yaw += s.vyaw * dt;
          s.pitch += s.vpitch * dt;
        }
      }

      // the chip: cores in sequence, packets on the traces, and every four seconds a wave of light out from the die
      // (phones: the sphere waits until enough of the chip is on screen, then condenses by itself)
      if (introWaits && here.v >= ENTER) introWaits = false;
      if (introT < INTRO && !introWaits) introT += dt;
      pulse += dt * rate;
      cores += dt * 0.55 * (busy ? 3 : 1);
      waveT += dt * (busy ? 2 : 1);
      const wave = waveT % 4;
      cu.uWave.value = waveT > 4 && wave < 1.5 ? wave * 0.62 - 0.08 : -1;

      // the gears: a steady turn, faster under the cursor, with the scroll and after a drag
      if (!(press?.moved && press.spot.id === "gears")) gear.vel *= Math.exp(-1.5 * dt);
      gear.phi += dt * (0.32 * rate * (1 + 1.8 * (here.id === "gears" ? ptr.open : 0)) + clamp(scrollVel * 0.0035, -5, 5) + gear.vel);
      spin += dt * 0.14 * rate;
      // pages, wires and the file out of the funnel: their own pace, faster under the cursor
      run += dt * rate * (1 + 1.6 * (here.id === "chip" || here.id === "gears" ? 0 : ptr.open));

      boxOf(A, u.uBoxA.value, sx, sy);
      boxOf(B, u.uBoxB.value, sx, sy);
      // the chip: only as much tilt and opening as keeps it clear of the text over it
      const guarded = lintels.length > 0 && figA === CHIP;
      const share = guarded ? reach(A, u.uBoxA.value, sx, sy) : 1;
      for (let i = 0; i < 2; i++) {
        const l = guarded ? lintels[i] : undefined;
        lintel.set(l ? [l[0] - sx, l[1] - sx, l[2] - sy, 1] : [0, 0, 0, 0], i * 4);
      }
      // (not while the sphere is still condensing, nor once the cloud is leaving)
      u.uGuard.value = guarded ? smooth(0.9, 1, form) * smooth(0.85, 1, introT / INTRO) : 0;
      u.uSpread.value = ptr.open * OPEN * share;
      rotOf(A, u.uRotA.value, share);
      rotOf(B, u.uRotB.value);

      // the chart: as the cloud arrives its bars grow from the plate, one after another (the points stack up); then new
      // «data» every so often. Each bar settles on its height without a bounce.
      const bars = BARS_AT >= 0 && (figA === BARS_AT || figB === BARS_AT);
      if (bars && !barsOn) {
        for (let i = 0; i < BARS.count; i++) {
          barH[i] = BARS.rest[i] * BARS.seed;
          barV[i] = 0;
          barGoal[i] = BARS.rest[i];
          barWait[i] = 0.3 + i * 0.13;
        }
        nextData = 2.4;
      }
      barsOn = bars;
      if (bars) {
        if ((nextData -= dt * rate) <= 0) {
          nextData = 1.5 + Math.random() * 1.1;
          for (let k = 0; k < 2; k++) {
            const i = Math.floor(Math.random() * BARS.count);
            barGoal[i] = BARS.rest[i] * (BARS.swing[0] + Math.random() * (BARS.swing[1] - BARS.swing[0]));
          }
        }
        for (let i = 0; i < BARS.count; i++) {
          if ((barWait[i] -= dt) > 0) continue;
          barV[i] += ((barGoal[i] - barH[i]) * 40 - barV[i] * 2 * Math.sqrt(40)) * dt;
          barH[i] += barV[i] * dt;
        }
        trendOf(barH, cu.uTrend.value);
      }

      u.uTime.value = t;
      u.uFigA.value = A.index;
      u.uFigB.value = B.index;
      u.uFlight.value = flight;
      u.uForm.value = form;
      u.uIntro.value = Math.min(1, introT / INTRO);
      u.uRun.value = run;
      u.uHover.value[0] = ptr.presence;
      u.uHover.value[1] = ptr.open;
      u.uClick.value[0] = click.x - (opts.layer ? sx : ox);
      u.uClick.value[1] = click.y - (opts.layer ? sy : oy);
      u.uClick.value[2] = clock() - click.at;
      u.uClick.value[3] = click.power;
      driftT += dt * particleConfig.driftSpeed * DRIFT.rate;
      u.uDrift.value[0] = particleConfig.driftAmp;
      u.uDrift.value[1] = driftT;
      cu.uCoreClock.value = cores;
      cu.uGear.value = gear.phi;
      cu.uInkA.value = inkOf(figA);
      cu.uInkB.value = inkOf(figB);
      pu.uPulseClock.value = pulse;
      pu.uChip.value = figA === CHIP ? smooth(0.6, 1, form) : 0;
      sim.due += dt;
      sim.waited += dt;
      if (!draw) return;
      if (state) simulate(state, sx, sy);
      gl.render(scene, camera);
    };

    /**
     * The points' own physics, in fixed steps: as many as the time since the last frame asks for, a few at most (a longer
     * stall is not caught up). Every step sees the figure where it is now, and the cursor a little further along the
     * stretch it has covered since the last frame.
     */
    const simulate = (pair: WebGLRenderTarget[], sx: number, sy: number) => {
      const cfg = particleConfig;
      const steps = Math.min(SIM.maxSteps, Math.floor(sim.due / SIM.step + 1e-6));
      if (!steps) return;
      sim.due = Math.min(sim.due - steps * SIM.step, SIM.step);
      const tx = ptr.x + sx;
      const ty = ptr.y + sy;
      if (sim.fresh || ptr.presence < 0.02) {
        // the cursor has just come onto the page: it did not sweep its way here
        sim.x = tx;
        sim.y = ty;
        sim.vx = sim.vy = 0;
        sim.fresh = false;
      }
      const waited = Math.max(sim.waited, SIM.step);
      sim.vx = damp(sim.vx, (tx - sim.x) / waited, 30, waited);
      sim.vy = damp(sim.vy, (ty - sim.y) / waited, 30, waited);
      sim.waited = 0;
      const wake = Math.min(1, SIM.maxWake / Math.max(Math.hypot(sim.vx, sim.vy), 1));
      u.uCursorV.value = [sim.vx * wake, sim.vy * wake, ptr.presence];
      u.uRepel.value = [cfg.repelRadius, cfg.repelForce, cfg.drag];
      u.uSpring.value = [2 * Math.PI * cfg.springHz, cfg.springDamping, SIM.step];
      for (let i = 0; i < steps; i++) {
        const x0 = sim.x + ((tx - sim.x) * i) / steps - sx;
        const y0 = sim.y + ((ty - sim.y) * i) / steps - sy;
        u.uCursor.value = [x0, y0, x0 + (tx - sim.x) / steps, y0 + (ty - sim.y) / steps];
        sim.clock += SIM.step;
        u.uClick.value[2] = sim.clock - click.at;
        u.uState.value = pair[sim.flip].texture;
        sim.flip = 1 - sim.flip;
        gl.setRenderTarget(pair[sim.flip]);
        gl.render(simScene, camera);
      }
      gl.setRenderTarget(null);
      u.uState.value = pair[sim.flip].texture;
      sim.x = tx;
      sim.y = ty;
    };
    readState = () => {
      if (!state || floats !== FloatType) return null;
      const out = new Float32Array(stateSize[0] * stateSize[1] * 4);
      gl.readRenderTargetPixels(state[sim.flip], 0, 0, stateSize[0], stateSize[1], out);
      return { points: out.subarray(0, p.n * 4), clock: sim.clock };
    };

    const frame = (now: number) => {
      raf = 0;
      if (!alive) return;
      // A machine that keeps missing frames at a high pixel ratio gets the plain one (once): fewer pixels to fill.
      slow = now - last > 40 ? slow + 1 : Math.max(0, slow - 1);
      if (slow > 40 && dpr > 1 && dprCap > 1) {
        dprCap = 1;
        slow = 0;
        resize();
      }
      let lag = clamp((now - last) / 1000, 0, MAX_LAG);
      last = now;
      for (; lag > STEP; lag -= STEP) render(STEP, false);
      render(lag);
      if (figA < 0) {
        // nothing on screen and nothing wanted: the canvas is clear, stop until the scroll brings a gap back
        parked = true;
        canvas.style.visibility = "hidden";
      }
      schedule();
    };
    const schedule = () => {
      if (!raf && alive && started && !parked && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const wake = () => {
      if (raf) return;
      last = performance.now();
      schedule();
    };
    const check = () => {
      if (!parked || !started) return;
      if (dirty) measure();
      if (wanted(window.scrollY) < 0) return;
      parked = false;
      canvas.style.visibility = "";
      wake();
    };
    rearm = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    };
    window.addEventListener("scroll", check, { passive: true });
    const onVisibility = () => !document.hidden && wake();
    document.addEventListener("visibilitychange", onVisibility);
    disposers.push(() => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", check);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.style.visibility = "";
    });

    /* ----------------------------- pointer events ---------------------------- */

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      ptr.x = e.clientX;
      ptr.y = e.clientY;
      if (!ptr.on) sim.fresh = true;
      ptr.on = true;
      // a pointer that was already resting on a figure when it formed never «entered» it
      if (!ptr.over && e.target instanceof Element) ptr.over = zones.find((z) => z.contains(e.target as Element)) ?? null;
    };
    const onLeave = () => (ptr.on = false);
    if (opts.pointer) {
      window.addEventListener("pointermove", onMove, { passive: true });
      html.addEventListener("pointerleave", onLeave);
      disposers.push(() => {
        window.removeEventListener("pointermove", onMove);
        html.removeEventListener("pointerleave", onLeave);
      });
    }
    const release = () => {
      if (!press) return;
      const s = press.spot;
      s.vyaw = clamp(s.vyaw, -7, 7);
      s.vpitch = clamp(s.vpitch, -7, 7);
      gear.vel = clamp(gear.vel, -9, 9);
      press = null;
      delete html.dataset.grabbing;
    };
    for (const s of spots) {
      const z = s.zone;
      const index = spots.indexOf(s);
      const ready = () => present() === index && figA === figB && form > 0.9;
      const down = (e: PointerEvent) => {
        if (e.button !== 0 || !ready()) return;
        const drag = opts.pointer && e.pointerType === "mouse";
        let nearest = 0;
        if (s.id === "gears") {
          // the gear under the pointer is the one the drag turns
          let bestD = Infinity;
          GEARS.c.forEach(([gx, gy], g) => {
            const [px, py] = placeXY(gx, gy, 0, u.uRotA.value, u.uBoxA.value);
            const d = Math.hypot(e.clientX - px, e.clientY - py) / GEARS.r[g];
            if (d < bestD) {
              bestD = d;
              nearest = g;
            }
          });
        }
        press = { spot: s, x: e.clientX, y: e.clientY, lastX: e.clientX, lastY: e.clientY, lastT: e.timeStamp, moved: false, drag, gear: nearest };
        if (drag) {
          e.preventDefault(); // no text selection while turning the figure
          z.setPointerCapture(e.pointerId);
          html.dataset.grabbing = "";
        }
      };
      const move = (e: PointerEvent) => {
        if (!press || press.spot !== s) return;
        if (!press.moved && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 5) {
          press.moved = true;
        }
        if (!press.moved || !press.drag) return;
        const dx = e.clientX - press.lastX;
        const dy = e.clientY - press.lastY;
        const dt = Math.max(0.004, (e.timeStamp - press.lastT) / 1000);
        press.lastX = e.clientX;
        press.lastY = e.clientY;
        press.lastT = e.timeStamp;
        if (s.id === "gears") {
          // turn the grabbed gear by the angle the pointer sweeps about its centre; the others follow by their ratios
          const [gx, gy] = GEARS.c[press.gear];
          const [px, py] = placeXY(gx, gy, 0, u.uRotA.value, u.uBoxA.value);
          const rx = e.clientX - px;
          const ry = e.clientY - py;
          const dphi = (ry * dx - rx * dy) / Math.max(rx * rx + ry * ry, 30 * 30) / GEARS.ratio[press.gear];
          gear.phi += dphi;
          gear.vel = gear.vel * 0.5 + (dphi / dt) * 0.5;
        } else {
          s.yaw += dx * TURN;
          s.pitch = clamp(s.pitch + dy * TURN, -1.1, 1.1);
          s.vyaw = s.vyaw * 0.5 + ((dx * TURN) / dt) * 0.5;
          s.vpitch = s.vpitch * 0.5 + ((dy * TURN) / dt) * 0.5;
        }
      };
      const up = (e: PointerEvent) => {
        if (!press || press.spot !== s) return;
        // a click (or a tap): a shock wave from that point
        if (!press.moved && ready()) click = { x: e.clientX + window.scrollX, y: e.clientY + window.scrollY, at: clock(), power: CLICK[s.id] };
        release();
      };
      const enter = (e: PointerEvent) => e.pointerType === "mouse" && (ptr.over = z);
      const leave = () => ptr.over === z && (ptr.over = null);
      z.addEventListener("pointerdown", down);
      z.addEventListener("pointermove", move);
      z.addEventListener("pointerup", up);
      z.addEventListener("pointercancel", release);
      if (opts.pointer) {
        z.addEventListener("pointerenter", enter);
        z.addEventListener("pointerleave", leave);
      }
      disposers.push(() => {
        z.removeEventListener("pointerdown", down);
        z.removeEventListener("pointermove", move);
        z.removeEventListener("pointerup", up);
        z.removeEventListener("pointercancel", release);
        z.removeEventListener("pointerenter", enter);
        z.removeEventListener("pointerleave", leave);
        z.removeAttribute("data-live");
      });
    }
    disposers.push(() => delete html.dataset.grabbing);

    /* -------------------------- size, theme, observers ------------------------ */

    // a resize clears the canvas: redraw at once
    const resize = () => {
      const w = canvas.clientWidth || 1;
      const h = canvas.clientHeight || 1;
      dpr = Math.min(window.devicePixelRatio || 1, dprCap, Math.sqrt(MAX_PIXELS / (w * h)));
      gl.setPixelRatio(dpr);
      gl.setSize(w, h, false);
      u.uView.value = [w, h];
      u.uDpr.value = dpr;
      dirty = true;
      if (started && !parked && !document.hidden) render(0);
    };
    const touch = () => {
      dirty = true;
      check();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    // the page's height changes as sections further up are laid out (content-visibility): the gaps move
    const bodyRo = new ResizeObserver(touch);
    bodyRo.observe(document.body);
    const near = new IntersectionObserver(touch, { rootMargin: "100% 0px" });
    for (const s of spots) near.observe(s.section);
    let dprQuery = matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
    const onDpr = () => {
      dprQuery.removeEventListener("change", onDpr);
      resize();
      dprQuery = matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
      dprQuery.addEventListener("change", onDpr);
    };
    dprQuery.addEventListener("change", onDpr);
    window.addEventListener("resize", touch);
    void document.fonts?.ready.then(touch);
    const themeObs = new MutationObserver(applyTheme);
    themeObs.observe(html, { attributes: true, attributeFilter: ["data-theme"] });
    forced.addEventListener("change", applyTheme);
    const onLost = (e: Event) => {
      e.preventDefault();
      alive = false;
      opts.onFail();
    };
    canvas.addEventListener("webglcontextlost", onLost);
    disposers.push(() => {
      ro.disconnect();
      bodyRo.disconnect();
      near.disconnect();
      dprQuery.removeEventListener("change", onDpr);
      window.removeEventListener("resize", touch);
      themeObs.disconnect();
      forced.removeEventListener("change", applyTheme);
      canvas.removeEventListener("webglcontextlost", onLost);
    });

    // compile the shaders without blocking, then draw the first frame (t = 0: the sphere, exactly as the poster draws it)
    resize();
    applyTheme();
    await nextTask();
    if (!alive) return;
    try {
      // (the simulation's programs are compiled as they will run: drawing into the state)
      gl.setRenderTarget(state?.[0] ?? null);
      const sims = state ? gl.compileAsync(simScene, camera) : null;
      gl.setRenderTarget(null);
      await Promise.all([gl.compileAsync(scene, camera), sims]);
    } catch {
      /* compiled on the first render instead */
    }
    if (!alive) return;
    measure();
    wanted(window.scrollY);
    if (!opts.layer) {
      // phones: the scene is ready before the chip is reached; it stays a sphere (its poster) until it comes on screen
      introWaits = true;
    } else if (CHIP >= 0 && spots[CHIP].v > 0) {
      // the chip is on screen: start as its poster, the sphere, and condense
      figA = figB = CHIP;
      form = 1;
    } else introT = INTRO;
    started = true;
    render(0);
    opts.onFirstFrame();
    last = performance.now();
    schedule();
  })();

  return { dispose, rearm: () => rearm(), state: () => readState() };
}
