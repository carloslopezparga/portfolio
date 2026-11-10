import { BufferAttribute, BufferGeometry, Camera, Points, Scene, ShaderMaterial, WebGLRenderer } from "three";
import { AI, buildPackets, CAM, FOCAL, SWAY } from "@/lib/chip-cloud";
import { BARS, barZ, buildParticles, FIGURES, FRAMES, GEARS, trendOf, type FigureId, type Frame } from "@/lib/figure-cloud";
import { CLOUD_VERT, DOT_FRAG, GLOW_FRAG, PACKET_VERT } from "./shaders";

const INK = { light: "#1d1d1f", dark: "#f5f5f7" };
/** Ink opacity per theme: light dots on black read bolder, so dark mode is a little lighter (the posters match it in CSS). */
const INK_ALPHA = { light: 1, dark: 0.85 };
/** Seconds: the sphere condensing into the chip; a figure condensing out of mist, dissolving into it, and flying to its neighbour. */
const INTRO = 1.5;
const FORM_IN = 0.65;
const FORM_OUT = 0.45;
const FLIGHT = 0.9;
/** A figure stays while more than this much of its gap is on screen (and takes a little less to hold on to it than to win it). */
const SEEN = 0.6;
const HELD = 0.5;
/** Full-screen canvas: the strip of screen under the navigation does not count as seen. */
const NAV = 64;
/** Buffer cap: DPR 2 at most, and about four megapixels. */
const MAX_DPR = 2;
const MAX_PIXELS = 4e6;
/** How far the figure leans towards the cursor (radians, about the screen's y and x axes). */
const GAZE = { yaw: 0.3, pitch: 0.25 };
/** Radians a figure turns per pixel dragged. */
const TURN = 0.0055;
/** How hard a click throws the points (px). */
const CLICK: Record<FigureId, number> = { chip: 70, bars: 60, gears: 60, globe: 170 };

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
export interface SceneHandle {
  dispose: () => void;
  /** Queue the next frame again, behind whoever else animates the scroll, so both use the same scroll position. */
  rearm: () => void;
}

/** A figure's gap on the page. Positions are document coordinates, cached: nothing here is read per frame. */
interface Spot {
  id: FigureId;
  index: number;
  el: HTMLElement;
  zone: HTMLElement;
  section: HTMLElement;
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
 * The cursor: every figure leans towards it, the points near it move away,
 * hovering opens the figure, dragging turns it and a click sends a shock
 * wave. All of it is done per vertex from a few uniforms (see shaders.ts).
 *
 * Set up in small steps (yielding in between, shaders compiled
 * asynchronously). The loop stops when no figure is on screen or the tab is
 * hidden.
 */
export function mountFigures(canvas: HTMLCanvasElement, opts: SceneOptions): SceneHandle {
  const html = document.documentElement;
  let alive = true;
  let rearm = () => {};
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
    cloudGeo.setAttribute("aSize", new BufferAttribute(p.sizes, 4));
    cloudGeo.setAttribute("aAlpha", new BufferAttribute(p.alphas, 4));
    cloudGeo.setAttribute("aSeed", new BufferAttribute(p.seed, 4));

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
      uMouse: { value: [0, 0, 0, 0] },
      uHover: { value: [0, 0] },
      uClick: { value: [0, 0, 99, 0] },
    };
    const cu = {
      ...u,
      uCoreClock: { value: 0 },
      uWave: { value: -1 },
      uBarH: { value: Float32Array.from(BARS.rest) },
      uTrend: { value: Float32Array.from(trendOf(BARS.rest, [])) },
      uGear: { value: 0 },
      uGearK: { value: Float32Array.from(GEARS.c.flatMap(([x, y], g) => [x, y, GEARS.ratio[g], GEARS.phase[g]])) },
      uInkA: { value: [0, 0, 0, 1] },
      uInkB: { value: [0, 0, 0, 1] },
      uAI: { value: Float32Array.from(AI.flatMap(rgb)) },
    };
    const cloudMat = new ShaderMaterial({ vertexShader: CLOUD_VERT, fragmentShader: DOT_FRAG, uniforms: cu, transparent: true, depthWrite: false, depthTest: false });
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
    const pu = { ...u, uPulseClock: { value: 0 }, uSize: { value: opts.n < 4000 ? 0.125 : 0.105 }, uChip: { value: 1 } };
    const pMat = new ShaderMaterial({ vertexShader: PACKET_VERT, fragmentShader: GLOW_FRAG, uniforms: pu, transparent: true, depthWrite: false, depthTest: false });
    const packets = new Points(pGeo, pMat);
    packets.frustumCulled = false;
    packets.renderOrder = 1;
    const scene = new Scene();
    const camera = new Camera();
    scene.add(cloud, packets);
    disposers.push(() => {
      cloudGeo.dispose();
      cloudMat.dispose();
      pGeo.dispose();
      pMat.dispose();
    });

    /* -------------------------- the gaps on the page -------------------------- */

    const spots: Spot[] = [];
    document.querySelectorAll<HTMLElement>("[data-figure]").forEach((el) => {
      const id = el.dataset.figure as FigureId;
      const index = FIGURES.indexOf(id);
      if (index < 0 || (!opts.layer && id !== "chip") || spots.some((s) => s.id === id)) return;
      spots.push({ id, index, el, zone: el.querySelector<HTMLElement>("[data-figure-zone]") ?? el, section: el.closest<HTMLElement>("section") ?? el, frame: FRAMES[id], known: false, x: 0, y: 0, w: 0, h: 0, dy: 0, v: 0, yaw: 0, pitch: 0, vyaw: 0, vpitch: 0 });
    });
    const CHIP = spots.findIndex((s) => s.id === "chip");
    const BARS_AT = spots.findIndex((s) => s.id === "bars");

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
    };

    /* ------------------------------- the state ------------------------------- */

    // The cloud is figure A, or between A and B (always a chip–chart pair, the chip as A); form 0 is mist.
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
      let bestScore = 0;
      for (let i = 0; i < spots.length; i++) {
        const s = spots[i];
        if (!s.known) {
          s.v = 0;
          continue;
        }
        const y0 = s.y - sy;
        s.v = clamp((Math.min(y0 + s.h, vh) - Math.max(y0, top)) / s.h, 0, 1);
        // phones: the chip stays assembled for as long as any of it is on screen
        if (s.v < (opts.layer ? (i === held ? HELD : SEEN) : 0.02)) continue;
        const mid = (top + vh) / 2;
        const score = s.v + 0.5 * (1 - Math.min(1, Math.abs(y0 + s.h / 2 - mid) / (vh - mid))) + (i === held ? 0.1 : 0);
        if (score > bestScore) {
          bestScore = score;
          best = i;
        }
      }
      held = best;
      return best;
    };
    /** Neighbours whose gaps are on screen together: the cloud flies from one to the other instead of dissolving. */
    const linked = (a: number, b: number) => ((a === CHIP && b === BARS_AT) || (a === BARS_AT && b === CHIP)) && spots[a].v > 0.2 && spots[b].v > 0.2;

    const advance = (want: number, dt: number) => {
      if (figA < 0) {
        if (want < 0) return;
        figA = figB = want;
        flight = 0;
        form = 0;
      }
      if (figA !== figB) {
        if (want === figB) flight += dt / FLIGHT;
        else if (want === figA) flight -= dt / FLIGHT;
        else {
          // neither end is wanted any more: finish the flight while dissolving
          flight += ((flight > 0.5 ? 1 : -1) * dt) / FLIGHT;
          form -= dt / FORM_OUT;
        }
        if (want === figA || want === figB) form += dt / FORM_IN;
        if (flight >= 1) figA = figB;
        else if (flight <= 0) figB = figA;
        if (figA === figB) flight = 0;
      } else if (want === figA) form += dt / FORM_IN;
      else if (want >= 0 && form > 0.6 && linked(figA, want)) {
        if (figA === CHIP) {
          figB = want;
          flight = 0;
        } else {
          figB = figA;
          figA = want;
          flight = 1;
        }
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

    const ptr = { x: 0, y: 0, on: false, presence: 0, fx: 0, fy: 0, sx: 0, sy: 0, svx: 0, svy: 0, gx: 0, gy: 0, over: -1, open: 0 };
    let press: { spot: Spot; x: number; y: number; lastX: number; lastY: number; lastT: number; moved: boolean; drag: boolean; gear: number } | null = null;
    let click = { x: 0, y: 0, at: -99, power: 0 };
    const gear = { phi: 0, vel: 0 };
    const liveZone = { index: -2 };

    // clocks and loop state
    let t = 0;
    let introT = 0;
    let pulse = 0;
    let cores = 0;
    let waveT = 2.3;
    let raf = 0;
    let last = 0;
    let lastSy = window.scrollY;
    let scrollVel = 0;
    let started = false;
    let parked = false;
    const barH = cu.uBarH.value;
    const barV = new Float32Array(BARS.count);
    const barGoal = Float32Array.from(BARS.rest);
    let nextData = 1.2;
    let spin = 0;

    const boxOf = (s: Spot, out: number[], sx: number, sy: number) => {
      const unit = Math.min(s.w / (2 * s.frame.w), s.h / (2 * s.frame.h));
      out[0] = s.x + s.w / 2 - (opts.layer ? sx : ox) - s.frame.cx * unit;
      out[1] = s.y + s.h / 2 - (opts.layer ? sy : oy) + s.frame.cy * unit;
      out[2] = unit;
    };
    const m1: number[] = [];
    const m2: number[] = [];
    /** The figure's rotation: its rest view (plus the chip's sway or the globe's spin), then, in screen space, the gaze and the drag. Column-major. */
    const rotOf = (s: Spot, out: Float32Array) => {
      const yaw = s.frame.yaw + (s.id === "chip" ? SWAY.amp * Math.sin(SWAY.speed * t) : s.id === "globe" ? spin : 0);
      turnXY(s.frame.tilt, yaw, m2);
      turnXY(ptr.gy + s.pitch, ptr.gx + s.yaw, m1);
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

    /** One frame: advance everything by dt and draw. */
    const render = (dt: number) => {
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
        gl.clear();
        return;
      }
      const A = spots[figA];
      const B = spots[figB];
      const here = spots[at];
      const settled = form > 0.9 && figA === figB;

      // the cursor, in canvas pixels: two followers (one quick, one slow and springy), the gaze and the hover
      const cx = ptr.x - (opts.layer ? 0 : ox - sx);
      const cy = ptr.y - (opts.layer ? 0 : oy - sy);
      if (ptr.on && ptr.presence < 0.01) {
        ptr.fx = ptr.sx = cx;
        ptr.fy = ptr.sy = cy;
        ptr.svx = ptr.svy = 0;
      }
      ptr.presence = damp(ptr.presence, ptr.on ? 1 : 0, 6, dt);
      ptr.fx = damp(ptr.fx, cx, 16, dt);
      ptr.fy = damp(ptr.fy, cy, 16, dt);
      ptr.svx += ((cx - ptr.sx) * 70 - ptr.svx * 9) * dt;
      ptr.svy += ((cy - ptr.sy) * 70 - ptr.svy * 9) * dt;
      ptr.sx += ptr.svx * dt;
      ptr.sy += ptr.svy * dt;
      boxOf(here, u.uBoxA.value, sx, sy);
      const lean = ptr.on && !press?.moved ? 1 : 0;
      ptr.gx = damp(ptr.gx, lean * GAZE.yaw * clamp((cx - u.uBoxA.value[0]) / (vw * 0.5), -1, 1), 3.5, dt);
      ptr.gy = damp(ptr.gy, lean * GAZE.pitch * clamp((cy - u.uBoxA.value[1]) / (vh * 0.5), -1, 1), 3.5, dt);
      ptr.open = damp(ptr.open, settled && ptr.over === at ? 1 : 0, 6, dt);
      if (liveZone.index !== (settled ? at : -1)) {
        liveZone.index = settled ? at : -1;
        for (const s of spots) s.zone.toggleAttribute("data-live", spots[liveZone.index] === s && opts.pointer);
      }

      // a released drag: the chip and the chart swing back home; the globe keeps turning and slows down
      for (const s of spots) {
        if (press?.moved && press.spot === s) continue;
        if (s.id === "globe") {
          s.yaw += s.vyaw * dt;
          s.pitch = clamp(s.pitch + s.vpitch * dt, -1.1, 1.1) * Math.exp(-0.3 * dt);
          s.vyaw *= Math.exp(-1.4 * dt);
          s.vpitch *= Math.exp(-2.4 * dt);
        } else {
          s.vyaw += (-34 * s.yaw - 6 * s.vyaw) * dt;
          s.vpitch += (-34 * s.pitch - 6 * s.vpitch) * dt;
          s.yaw += s.vyaw * dt;
          s.pitch += s.vpitch * dt;
        }
      }

      // the chip: cores in sequence, packets on the traces, and every four seconds a wave of light out from the die
      if (introT < INTRO) introT += dt;
      pulse += dt * rate;
      cores += dt * 0.55 * (busy ? 3 : 1);
      waveT += dt * (busy ? 2 : 1);
      const wave = waveT % 4;
      cu.uWave.value = waveT > 4 && wave < 1.5 ? wave * 0.62 - 0.08 : -1;
      u.uSpread.value = ptr.open * 0.095;

      // the gears: a steady turn, faster under the cursor, with the scroll and after a drag
      if (!(press?.moved && press.spot.id === "gears")) gear.vel *= Math.exp(-1.5 * dt);
      gear.phi += dt * (0.32 * rate * (1 + 1.8 * (here.id === "gears" ? ptr.open : 0)) + clamp(scrollVel * 0.0035, -5, 5) + gear.vel);
      spin += dt * 0.14 * rate;

      rotOf(A, u.uRotA.value);
      rotOf(B, u.uRotB.value);
      boxOf(A, u.uBoxA.value, sx, sy);
      boxOf(B, u.uBoxB.value, sx, sy);

      // the chart: new «data» every so often, and the bars near the cursor rise like an equaliser
      if (BARS_AT >= 0 && (figA === BARS_AT || figB === BARS_AT)) {
        if ((nextData -= dt * rate) <= 0) {
          nextData = 1.7 + Math.random() * 1.2;
          for (let k = 0; k < 2; k++) {
            const i = Math.floor(Math.random() * BARS.count);
            barGoal[i] = clamp(BARS.rest[i] * (0.66 + Math.random() * 0.62), 0.22, 1.25);
          }
        }
        const rot = figB === BARS_AT ? u.uRotB.value : u.uRotA.value;
        const box = figB === BARS_AT ? u.uBoxB.value : u.uBoxA.value;
        for (let i = 0; i < BARS.count; i++) {
          const [bx, by] = placeXY(0, barH[i] * 0.6, barZ(i), rot, box);
          const lift = at === BARS_AT ? 0.5 * ptr.presence * Math.exp(-(((cx - bx) / 80) ** 2) - ((cy - by) / 150) ** 2) : 0;
          barV[i] += ((Math.min(BARS.max, barGoal[i] + lift) - barH[i]) * 60 - barV[i] * 11) * dt;
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
      u.uMouse.value[0] = ptr.fx;
      u.uMouse.value[1] = ptr.fy;
      u.uMouse.value[2] = ptr.sx;
      u.uMouse.value[3] = ptr.sy;
      u.uHover.value[0] = ptr.presence;
      u.uHover.value[1] = ptr.open;
      u.uClick.value[0] = click.x - (opts.layer ? sx : ox);
      u.uClick.value[1] = click.y - (opts.layer ? sy : oy);
      u.uClick.value[2] = t - click.at;
      u.uClick.value[3] = click.power;
      cu.uCoreClock.value = cores;
      cu.uGear.value = gear.phi;
      cu.uInkA.value = inkOf(figA);
      cu.uInkB.value = inkOf(figB);
      pu.uPulseClock.value = pulse;
      pu.uChip.value = figA === CHIP ? (1 - smooth(0, 0.3, figA === figB ? 0 : flight)) * smooth(0.6, 1, form) : 0;
      gl.render(scene, camera);
    };

    const frame = (now: number) => {
      raf = 0;
      if (!alive) return;
      const dt = clamp((now - last) / 1000, 0, 0.05);
      last = now;
      render(dt);
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
      ptr.on = true;
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
        }
      };
      const move = (e: PointerEvent) => {
        if (!press || press.spot !== s) return;
        if (!press.moved && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 5) {
          press.moved = true;
          if (press.drag) html.dataset.grabbing = "";
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
        if (!press.moved && ready()) click = { x: e.clientX + window.scrollX, y: e.clientY + window.scrollY, at: t, power: CLICK[s.id] };
        release();
      };
      const enter = (e: PointerEvent) => e.pointerType === "mouse" && (ptr.over = index);
      const leave = () => ptr.over === index && (ptr.over = -1);
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

    let dpr = 1;
    // a resize clears the canvas: redraw at once
    const resize = () => {
      const w = canvas.clientWidth || 1;
      const h = canvas.clientHeight || 1;
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR, Math.sqrt(MAX_PIXELS / (w * h)));
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
      await gl.compileAsync(scene, camera);
    } catch {
      /* compiled on the first render instead */
    }
    if (!alive) return;
    measure();
    wanted(window.scrollY);
    if (CHIP >= 0 && spots[CHIP].v > 0) {
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

  return { dispose, rearm: () => rearm() };
}
