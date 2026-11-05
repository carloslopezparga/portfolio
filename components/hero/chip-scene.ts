import { BufferAttribute, BufferGeometry, Color, Group, PerspectiveCamera, Points, Scene, ShaderMaterial, WebGLRenderer } from "three";
import { AI, buildCloud, buildPackets, CAM } from "@/lib/chip-cloud";

const INK = { light: "#1d1d1f", dark: "#f5f5f7" };
/** Seconds for the sphere to condense into the chip. */
const MORPH = 1.5;
/** Slow turn of the chip, radians per second. */
const SPIN = 0.1;

const CLOUD_VERT = /* glsl */ `
attribute vec3 aSphere;
attribute vec4 aMeta; // size, alpha, seed, layer
attribute float aCore;
uniform float uTime, uMorph, uScroll, uSpread, uPx, uHover, uCoreClock;
uniform vec2 uMouse;
uniform vec3 uInk;
uniform vec3 uAI[4];
varying vec4 vColor;

float easeInOut(float t) { return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0; }

void main() {
  float seed = aMeta.z;
  // sphere → chip, staggered per point, with a swirl about y that is zero at both ends
  float m = easeInOut(clamp(uMorph * 1.6 - seed * 0.6, 0.0, 1.0));
  vec3 chip = position;
  if (aMeta.w >= 0.0) chip.y += aMeta.w * uSpread;
  vec3 p = mix(aSphere, chip, m);
  float sw = sin(m * 3.14159265) * (seed - 0.5) * 1.6;
  p.xz = mat2(cos(sw), -sin(sw), sin(sw), cos(sw)) * p.xz;
  // scroll: the layers spread first (uSpread), then the points drift outwards and fade
  float s = uScroll;
  float scatter = smoothstep(0.3, 1.0, s);
  p += normalize(aSphere) * scatter * scatter * (1.0 + seed * 1.8);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  // cursor: nearby points move aside, with a ripple, and come back
  vec4 clip = projectionMatrix * mv;
  vec2 d = clip.xy / clip.w - uMouse;
  float dist = length(d);
  float f = uHover * exp(-dist * dist / 0.035);
  float ripple = 1.0 + 0.35 * sin(dist * 26.0 - uTime * 5.0);
  mv.xy += (d / max(dist, 1e-3)) * f * ripple * 0.03 * -mv.z;
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aMeta.x * uPx / -mv.z;
  // twinkle (exactly 1 at t = 0, so the first frame matches the poster)
  float tw = 1.0 - 0.32 * (0.5 - 0.5 * cos(uTime * (0.9 + seed * 2.2)));
  float fade = 1.0 - smoothstep(0.5, 1.0, s);
  float alpha = aMeta.y * tw * fade;
  vec3 col = uInk;
  if (aCore >= 0.0) {
    float ph = fract(uCoreClock - aCore / 8.0);
    float g = smoothstep(0.0, 0.06, ph) * (1.0 - smoothstep(0.18, 0.42, ph)) * m;
    int ci = int(mod(aCore, 4.0));
    vec3 c = ci == 0 ? uAI[0] : ci == 1 ? uAI[1] : ci == 2 ? uAI[2] : uAI[3];
    col = mix(uInk, c, g);
    alpha = mix(alpha, 0.95 * fade, g);
  }
  vColor = vec4(col, alpha);
}`;

const DOT_FRAG = /* glsl */ `
varying vec4 vColor;
void main() {
  float r = length(gl_PointCoord - 0.5);
  if (r > 0.5) discard;
  gl_FragColor = vec4(vColor.rgb, vColor.a * (1.0 - smoothstep(0.42, 0.5, r)));
}`;

const PACKET_VERT = /* glsl */ `
attribute vec3 aP1, aP2, aP3;
attribute vec2 aMarks;
attribute vec3 aMotion; // speed, phase, tail index
attribute vec3 aColor;
uniform float uPulseClock, uMorph, uScroll, uSpread, uPx, uSize;
varying vec4 vColor;

vec3 along(float u) {
  if (u < aMarks.x) return mix(position, aP1, u / aMarks.x);
  if (u < aMarks.y) return mix(aP1, aP2, (u - aMarks.x) / (aMarks.y - aMarks.x));
  return mix(aP2, aP3, (u - aMarks.y) / (1.0 - aMarks.y));
}

void main() {
  float u = fract(uPulseClock * aMotion.x + aMotion.y) - aMotion.z * 0.028;
  float shown = step(0.0, u);
  u = clamp(u, 0.0, 1.0);
  vec3 p = along(u);
  p.y += uSpread; // the interposer is layer 1
  float scatter = smoothstep(0.3, 1.0, uScroll);
  p += normalize(p) * scatter * scatter * 1.4;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (1.0 - aMotion.z * 0.28) * uPx / -mv.z;
  float ends = smoothstep(0.0, 0.05, u) * (1.0 - smoothstep(0.92, 1.0, u));
  float a = (1.0 - aMotion.z * 0.4) * ends * shown * smoothstep(0.85, 1.0, uMorph) * (1.0 - smoothstep(0.5, 1.0, uScroll));
  vColor = vec4(aColor, a);
}`;

const GLOW_FRAG = /* glsl */ `
varying vec4 vColor;
void main() {
  float r = length(gl_PointCoord - 0.5);
  if (r > 0.5) discard;
  gl_FragColor = vec4(vColor.rgb, vColor.a * (1.0 - smoothstep(0.16, 0.5, r)));
}`;

export interface ChipOptions {
  /** number of points (CLOUD_SIZE.desktop or .mobile; must match the poster shown) */
  n: number;
  /** cursor interaction (desktop with a mouse) */
  pointer: boolean;
  /** called once the first frame (identical to the poster) is on screen */
  onFirstFrame: () => void;
  /** WebGL unavailable or lost: the page shows the still poster */
  onFail: () => void;
}

const damp = (a: number, b: number, k: number, dt: number) => a + (b - a) * (1 - Math.exp(-k * dt));

/**
 * The hero chip as a point cloud (three.js Points with custom shaders): it
 * condenses from a sphere, turns slowly and twinkles; data packets run along
 * the traces and the cores light up in sequence (faster while the agent
 * answers); the cursor pushes points aside; scrolling down spreads the
 * layers and scatters the points until they fade at the figures section.
 * Renders only while on screen and the tab is visible. Returns a disposer.
 */
export function mountChip(canvas: HTMLCanvasElement, opts: ChipOptions): () => void {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "low-power" });
  } catch {
    opts.onFail();
    return () => {};
  }
  const html = document.documentElement;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(CAM.fov, 1, 0.1, 40);
  camera.position.set(0, 0, CAM.dist);
  const group = new Group();
  group.rotation.set(CAM.tilt, CAM.yaw, 0);
  scene.add(group);

  // the cloud
  const c = buildCloud(opts.n);
  const meta = new Float32Array(c.n * 4);
  for (let i = 0; i < c.n; i++) meta.set([c.size[i], c.alpha[i], c.seed[i], c.layer[i]], i * 4);
  const cloudGeo = new BufferGeometry();
  cloudGeo.setAttribute("position", new BufferAttribute(c.chip, 3));
  cloudGeo.setAttribute("aSphere", new BufferAttribute(c.sphere, 3));
  cloudGeo.setAttribute("aMeta", new BufferAttribute(meta, 4));
  cloudGeo.setAttribute("aCore", new BufferAttribute(c.core, 1));
  const ink = new Color(INK.light);
  const uniforms = {
    uTime: { value: 0 },
    uMorph: { value: 0 },
    uScroll: { value: 0 },
    uSpread: { value: 0 },
    uPx: { value: 1 },
    uHover: { value: 0 },
    uCoreClock: { value: 0 },
    uMouse: { value: [0, 0] as [number, number] },
    uInk: { value: ink },
    uAI: { value: AI.map((h) => new Color(h)) },
  };
  const cloudMat = new ShaderMaterial({ vertexShader: CLOUD_VERT, fragmentShader: DOT_FRAG, uniforms, transparent: true, depthWrite: false, depthTest: false });
  const cloud = new Points(cloudGeo, cloudMat);
  cloud.frustumCulled = false;

  // the data packets
  const p = buildPackets();
  const pGeo = new BufferGeometry();
  const ctrl = (k: number) => {
    const a = new Float32Array(p.n * 3);
    for (let i = 0; i < p.n; i++) a.set(p.path.subarray(i * 12 + k * 3, i * 12 + k * 3 + 3), i * 3);
    return new BufferAttribute(a, 3);
  };
  pGeo.setAttribute("position", ctrl(0));
  pGeo.setAttribute("aP1", ctrl(1));
  pGeo.setAttribute("aP2", ctrl(2));
  pGeo.setAttribute("aP3", ctrl(3));
  pGeo.setAttribute("aMarks", new BufferAttribute(p.marks, 2));
  pGeo.setAttribute("aMotion", new BufferAttribute(p.motion, 3));
  pGeo.setAttribute("aColor", new BufferAttribute(p.color, 3));
  const pUniforms = {
    uPulseClock: { value: 0 },
    uMorph: uniforms.uMorph,
    uScroll: uniforms.uScroll,
    uSpread: uniforms.uSpread,
    uPx: uniforms.uPx,
    uSize: { value: opts.n < 4000 ? 0.07 : 0.06 },
  };
  const pMat = new ShaderMaterial({ vertexShader: PACKET_VERT, fragmentShader: GLOW_FRAG, uniforms: pUniforms, transparent: true, depthWrite: false, depthTest: false });
  const packets = new Points(pGeo, pMat);
  packets.frustumCulled = false;
  group.add(cloud, packets);

  // theme
  const applyTheme = () => ink.set(html.dataset.theme === "dark" ? INK.dark : INK.light);
  applyTheme();
  const themeObs = new MutationObserver(applyTheme);
  themeObs.observe(html, { attributes: true, attributeFilter: ["data-theme"] });

  // size
  const resize = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    uniforms.uPx.value = (h * dpr) / 2 / Math.tan(((CAM.fov / 2) * Math.PI) / 180);
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  // scroll: 0 at the top, 1 once the figures section reaches a third of the screen
  let scrollEnd = 600;
  const measure = () => {
    const next = document.getElementById("numbers");
    const top = next ? next.getBoundingClientRect().top + window.scrollY : 900;
    scrollEnd = Math.max(280, top - window.innerHeight * 0.35);
  };
  measure();
  window.addEventListener("resize", measure);

  // cursor
  const mouse = { x: 0, y: 0, tx: 0, ty: 0, hover: 0, th: 0, px: 0, py: 0, tpx: 0, tpy: 0 };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const r = canvas.getBoundingClientRect();
    mouse.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouse.ty = -(((e.clientY - r.top) / r.height) * 2 - 1);
    mouse.th = Math.abs(mouse.tx) < 1 && Math.abs(mouse.ty) < 1 ? 1 : 0;
    mouse.tpx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.tpy = (e.clientY / window.innerHeight) * 2 - 1;
  };
  const onLeave = () => {
    mouse.th = 0;
    mouse.tpx = mouse.tpy = 0;
  };
  if (opts.pointer) {
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
  }

  // clocks
  let t = 0;
  let pulse = 0;
  let cores = 0;
  let scroll = 0;
  let raf = 0;
  let last = 0;
  let visible = true;
  let alive = true;

  const draw = () => {
    group.rotation.set(CAM.tilt + mouse.py * 0.06, CAM.yaw + t * SPIN + mouse.px * 0.14, 0);
    uniforms.uTime.value = t;
    uniforms.uMorph.value = Math.min(1, t / MORPH);
    uniforms.uScroll.value = scroll;
    const k = Math.min(1, scroll / 0.6);
    uniforms.uSpread.value = (1 - (1 - k) * (1 - k)) * 0.2;
    uniforms.uHover.value = mouse.hover;
    uniforms.uMouse.value = [mouse.x, mouse.y];
    uniforms.uCoreClock.value = cores;
    pUniforms.uPulseClock.value = pulse;
    renderer.render(scene, camera);
  };

  const frame = (now: number) => {
    raf = 0;
    if (!alive) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const busy = html.hasAttribute("data-agent-busy");
    t += dt;
    pulse += dt * (busy ? 2.4 : 1);
    cores += dt * 0.55 * (busy ? 3 : 1);
    scroll = damp(scroll, Math.min(1, Math.max(0, window.scrollY / scrollEnd)), 7, dt);
    mouse.x = damp(mouse.x, mouse.tx, 10, dt);
    mouse.y = damp(mouse.y, mouse.ty, 10, dt);
    mouse.hover = damp(mouse.hover, mouse.th, 4, dt);
    mouse.px = damp(mouse.px, mouse.tpx, 3, dt);
    mouse.py = damp(mouse.py, mouse.tpy, 3, dt);
    draw();
    schedule();
  };
  const schedule = () => {
    if (!raf && alive && visible && !document.hidden) raf = requestAnimationFrame(frame);
  };
  const wake = () => {
    if (raf || !alive || !visible || document.hidden) return;
    last = performance.now();
    schedule();
  };

  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) wake();
  });
  io.observe(canvas);
  const onVisibility = () => !document.hidden && wake();
  document.addEventListener("visibilitychange", onVisibility);

  const onLost = (e: Event) => {
    e.preventDefault();
    alive = false;
    opts.onFail();
  };
  canvas.addEventListener("webglcontextlost", onLost);

  // first frame at t = 0: the sphere, exactly as the poster draws it
  draw();
  opts.onFirstFrame();
  last = performance.now();
  schedule();

  return () => {
    alive = false;
    if (raf) cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
    themeObs.disconnect();
    window.removeEventListener("resize", measure);
    window.removeEventListener("pointermove", onMove);
    document.documentElement.removeEventListener("pointerleave", onLeave);
    document.removeEventListener("visibilitychange", onVisibility);
    canvas.removeEventListener("webglcontextlost", onLost);
    cloudGeo.dispose();
    cloudMat.dispose();
    pGeo.dispose();
    pMat.dispose();
    renderer.dispose();
  };
}
