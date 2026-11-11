import { camera, NET, type NetLayout } from "@/lib/graph";

export interface NetLink {
  from: string;
  to: string;
}
export interface NetOptions {
  layout: NetLayout;
  /** each node's element, by id: placed here on every frame */
  els: Map<string, HTMLElement>;
  links: NetLink[];
  /** no sway, no pulses, no parallax or orbit: the view at rest, redrawn only when something changes */
  reduced: boolean;
  /** what is lit now: the active node (if any), the nodes linked to it, and whether a link is one of its own */
  lit: () => { active: string | null; ids: Set<string>; on: (from: string, to: string) => boolean };
}
export interface NetHandle {
  dispose: () => void;
  /** something changed (the active node, the theme): read the colours again and draw */
  refresh: () => void;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const damp = (a: number, b: number, k: number, dt: number) => a + (b - a) * (1 - Math.exp(-k * dt));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/**
 * The skills network in motion. The nodes are DOM elements (logos and text
 * stay crisp and accessible): on every frame each is placed where the camera
 * sees it, sized and faded by its depth and stacked nearest on top. Behind
 * them, on a 2D canvas, the links and the pulses that run along them from
 * each skill to where it was used, in the skill's colour. No WebGL.
 *
 * The view sways slowly, leans a little towards the cursor, and a drag
 * orbits it: let go, it keeps its speed for a moment and comes home. The
 * active node's links light up, its pulses run faster, and it and the nodes
 * linked to it come a little towards the camera. The loop only runs while the
 * network is on screen (and the sway holds while the pointer is on it, so
 * nodes do not slide from under the cursor).
 */
export function mountNet(stage: HTMLElement, canvas: HTMLCanvasElement, opts: NetOptions): NetHandle {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { dispose: () => {}, refresh: () => {} };
  const html = document.documentElement;
  const { nodes, centre } = opts.layout;
  const els = nodes.map((n) => opts.els.get(n.id) ?? null);
  const index = new Map(nodes.map((n, i) => [n.id, i]));
  // where each node is seen: x, y (stage px), scale, nearness
  const seen = nodes.map(() => [0, 0, 1, 0]);
  const lift = nodes.map(() => 0);
  const shade = nodes.map(() => 1);
  const links = opts.links.map((l, i) => ({ a: index.get(l.from)!, b: index.get(l.to)!, from: l.from, to: l.to, colour: "#888", phase: (i * 0.618) % 1, pace: 0.17 + 0.09 * ((i * 0.37) % 1) }));

  let w = 1;
  let h = 1;
  let fit = 1;
  let dpr = 1;
  let ink = "0 0 0";
  let raf = 0;
  let last = 0;
  let onScreen = false;
  let over = false;
  let sway = 0;
  /** the cursor over the stage, -1..1 each way, and the lean it has eased to */
  const aim = { x: 0, y: 0 };
  const lean = { x: 0, y: 0 };
  /** the drag's turn and its speed */
  const orbit = { yaw: 0, pitch: 0, vyaw: 0, vpitch: 0 };
  let drag: { id: number; x: number; y: number; t: number; moved: boolean } | null = null;

  const colours = () => {
    ink = getComputedStyle(stage).getPropertyValue("--fg-rgb").trim() || "0 0 0";
    for (const l of links) {
      const el = els[l.a];
      if (el) l.colour = getComputedStyle(el).getPropertyValue("--d").trim() || l.colour;
    }
  };
  const resize = () => {
    w = stage.clientWidth || 1;
    h = stage.clientHeight || 1;
    fit = Math.min(w / NET.w, h / NET.h);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    draw(0);
  };

  const draw = (dt: number) => {
    const { active, ids, on } = opts.lit();
    const see = camera(NET.yaw + NET.sway * Math.sin(sway * NET.swaySpeed) + lean.x * NET.parallax[0] + orbit.yaw, NET.pitch - lean.y * NET.parallax[1] + orbit.pitch);
    nodes.forEach((n, i) => {
      // the active node and the ones linked to it come towards the camera
      const up = active && ids.has(n.id) ? 1 : 0;
      lift[i] = dt > 0 ? damp(lift[i], up, 9, dt) : up;
      const [x, y, k, near] = see(n.x, n.y, n.z, lift[i] * NET.lift);
      const s = seen[i];
      s[0] = w / 2 + (x - centre[0]) * fit;
      s[1] = h / 2 + (y - centre[1]) * fit;
      s[2] = k * fit;
      s[3] = near;
      const el = els[i];
      if (!el) return;
      el.style.transform = `translate(${s[0].toFixed(1)}px, ${s[1].toFixed(1)}px) translate(-50%, -50%) scale(${s[2].toFixed(3)})`;
      el.style.zIndex = String(1000 + Math.round(near / 4));
      // far nodes are fainter, and so are the ones that are not lit while one is (never under 0.65: their labels stay at AA contrast)
      const depth = 0.8 + 0.2 * smooth(-520, 420, near);
      const to = active && !ids.has(n.id) ? Math.max(0.65, depth * 0.86) : Math.max(depth, up);
      shade[i] = dt > 0 ? damp(shade[i], to, 9, dt) : to;
      el.style.opacity = shade[i].toFixed(3);
    });

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = "round";
    const fade = (k: number) => 0.4 + 0.6 * smooth(0.82 * fit, 1.18 * fit, k);
    // the links: faint ink, fainter with depth; the active node's own on top, in their skill's colour
    for (const pass of [false, true])
      for (const l of links) {
        const lit = !!active && on(l.from, l.to);
        if (lit !== pass) continue;
        const a = seen[l.a];
        const b = seen[l.b];
        if (lit) {
          ctx.globalAlpha = 0.9;
          ctx.strokeStyle = l.colour;
          ctx.lineWidth = 1.8 * fit;
        } else {
          const g = ctx.createLinearGradient(a[0], a[1], b[0], b[1]);
          const base = active ? 0.1 : 0.15;
          g.addColorStop(0, `rgb(${ink} / ${(base * fade(a[2])).toFixed(3)})`);
          g.addColorStop(1, `rgb(${ink} / ${(base * fade(b[2])).toFixed(3)})`);
          ctx.globalAlpha = 1;
          ctx.strokeStyle = g;
          ctx.lineWidth = fit;
        }
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.stroke();
      }
    if (opts.reduced) return;
    // the pulses: two points of light per link, from the skill to where it was used; faster on the active node's links
    for (const l of links) {
      const lit = !!active && on(l.from, l.to);
      l.phase = (l.phase + dt * l.pace * (lit ? 2.6 : 1)) % 1;
      const a = seen[l.a];
      const b = seen[l.b];
      for (let j = 0; j < 2; j++) {
        const u = (l.phase + j * 0.5) % 1;
        const x = a[0] + (b[0] - a[0]) * u;
        const y = a[1] + (b[1] - a[1]) * u;
        const k = a[2] + (b[2] - a[2]) * u;
        const alpha = smooth(0, 0.1, u) * (1 - smooth(0.9, 1, u)) * (lit ? 1 : active ? 0.35 : 0.8) * fade(k);
        const r = (lit ? 2.8 : 2.1) * k;
        ctx.fillStyle = l.colour;
        ctx.globalAlpha = alpha * 0.2;
        ctx.beginPath();
        ctx.arc(x, y, r * 2.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  const frame = (now: number) => {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    // the sway holds while the pointer or the keyboard is on the network
    if (!over && !drag && !stage.contains(document.activeElement)) sway += dt;
    lean.x = damp(lean.x, over ? aim.x : 0, 4, dt);
    lean.y = damp(lean.y, over ? aim.y : 0, 4, dt);
    if (!drag?.moved) {
      const c = 2 * Math.sqrt(NET.home);
      orbit.vyaw += (-NET.home * orbit.yaw - c * orbit.vyaw) * dt;
      orbit.vpitch += (-NET.home * orbit.pitch - c * orbit.vpitch) * dt;
      orbit.yaw += orbit.vyaw * dt;
      orbit.pitch += orbit.vpitch * dt;
    }
    draw(dt);
    schedule();
  };
  const schedule = () => {
    if (!raf && !opts.reduced && onScreen && !document.hidden) raf = requestAnimationFrame(frame);
  };
  const wake = () => {
    if (raf) return;
    last = performance.now();
    schedule();
  };

  const io = new IntersectionObserver(([e]) => {
    onScreen = e.isIntersecting;
    wake();
  });
  io.observe(stage);
  const ro = new ResizeObserver(resize);
  ro.observe(stage);
  document.addEventListener("visibilitychange", wake);

  // the pointer: the lean, and the drag that orbits (a mouse only; a finger scrolls the page)
  const move = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const r = stage.getBoundingClientRect();
    aim.x = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
    aim.y = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
    over = true;
    if (!drag || drag.id !== e.pointerId) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 5) {
      drag.moved = true;
      drag.x = e.clientX;
      drag.y = e.clientY;
      stage.setPointerCapture(e.pointerId);
      html.dataset.grabbing = "";
    }
    if (!drag.moved) return;
    const dt = Math.max(0.004, (e.timeStamp - drag.t) / 1000);
    const dyaw = (e.clientX - drag.x) * NET.turn;
    const dpitch = (e.clientY - drag.y) * NET.turn * 0.6;
    drag.x = e.clientX;
    drag.y = e.clientY;
    drag.t = e.timeStamp;
    orbit.yaw = clamp(orbit.yaw + dyaw, -1.1, 0.9);
    orbit.pitch = clamp(orbit.pitch - dpitch, -0.5, 0.5);
    orbit.vyaw = clamp(orbit.vyaw * 0.5 + (dyaw / dt) * 0.5, -3, 3);
    orbit.vpitch = clamp(orbit.vpitch * 0.5 - (dpitch / dt) * 0.5, -2, 2);
  };
  const down = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button === 0) drag = { id: e.pointerId, x: e.clientX, y: e.clientY, t: e.timeStamp, moved: false };
  };
  const up = (e: PointerEvent) => {
    if (!drag || drag.id !== e.pointerId) return;
    // a drag is not a click on the node it began on
    if (drag.moved) stage.addEventListener("click", (c) => c.stopPropagation(), { capture: true, once: true });
    drag = null;
    delete html.dataset.grabbing;
  };
  const leave = () => (over = false);
  if (!opts.reduced) {
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerdown", down);
    stage.addEventListener("pointerup", up);
    stage.addEventListener("pointercancel", up);
    stage.addEventListener("pointerleave", leave);
  }

  colours();
  resize();
  return {
    dispose: () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", wake);
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerdown", down);
      stage.removeEventListener("pointerup", up);
      stage.removeEventListener("pointercancel", up);
      stage.removeEventListener("pointerleave", leave);
      delete html.dataset.grabbing;
    },
    refresh: () => {
      colours();
      if (opts.reduced || !raf) draw(0);
    },
  };
}
