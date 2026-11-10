import { BufferAttribute, BufferGeometry, Color, Group, LinearSRGBColorSpace, PerspectiveCamera, Points, Scene, ShaderMaterial, WebGLRenderer } from "three";
import { AI, buildCloud, buildPackets, CAM, SWAY } from "@/lib/chip-cloud";

const INK = { light: "#1d1d1f", dark: "#f5f5f7" };
/** Seconds for the sphere to condense into the chip. */
const MORPH = 1.5;
/** Ink opacity per theme: light dots on black read bolder, so dark mode is a little lighter (the posters match it in CSS). */
const INK_ALPHA = { light: 1, dark: 0.85 };

/*
 * Colours go to the shaders as plain sRGB numbers and the shaders write them
 * out unchanged (no colour management), so #1D1D1F on screen is #1D1D1F, the
 * cores match the packets, and the first frame matches the SVG poster.
 */
const srgb = (css: string) => new Color().setStyle(css, LinearSRGBColorSpace);

/* Shared by both shaders: the cursor's soft push (a dent with a ripple), and a fade near the canvas edges so nothing is ever cut by a straight line. */
const COMMON = /* glsl */ `
uniform float uTime, uHover;
uniform vec2 uMouse;
vec4 pushed(vec4 mv) {
  vec4 clip = projectionMatrix * mv;
  vec2 d = clip.xy / clip.w - uMouse;
  float dist = length(d);
  float f = uHover * exp(-dist * dist / 0.08);
  float ripple = 1.0 + 0.4 * sin(dist * 22.0 - uTime * 4.0);
  mv.xy += (d / max(dist, 1e-3)) * f * ripple * 0.009 * -mv.z;
  return mv;
}
float edgeFade(vec4 pos) {
  vec2 n = pos.xy / pos.w;
  return 1.0 - smoothstep(0.82, 1.0, max(abs(n.x), abs(n.y)));
}`;

const CLOUD_VERT = /* glsl */ `
attribute vec3 aSphere;
attribute vec4 aMeta; // size, alpha, seed, layer
attribute float aCore;
uniform float uMorph, uScroll, uSpread, uPx, uCoreClock, uInkAlpha;
uniform vec3 uInk;
uniform vec3 uAI[4];
varying vec4 vColor;
${COMMON}

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
  vec4 mv = pushed(modelViewMatrix * vec4(p, 1.0));
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aMeta.x * uPx / -mv.z;
  // twinkle (exactly 1 at t = 0, so the first frame matches the poster)
  float tw = 1.0 - 0.32 * (0.5 - 0.5 * cos(uTime * (0.9 + seed * 2.2)));
  float fade = (1.0 - smoothstep(0.5, 1.0, s)) * edgeFade(gl_Position);
  float alpha = aMeta.y * tw * fade * uInkAlpha;
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
${COMMON}

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
  vec4 mv = pushed(modelViewMatrix * vec4(p, 1.0));
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (1.0 - aMotion.z * 0.28) * uPx / -mv.z;
  float ends = smoothstep(0.0, 0.05, u) * (1.0 - smoothstep(0.92, 1.0, u));
  float a = (1.0 - aMotion.z * 0.4) * ends * shown * smoothstep(0.85, 1.0, uMorph) * (1.0 - smoothstep(0.5, 1.0, uScroll)) * edgeFade(gl_Position);
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
/** Hand the main thread back between setup steps, so no step is one long task. */
const nextTask = () => new Promise<void>((r) => setTimeout(r, 0));
const pixelRatio = () => Math.min(window.devicePixelRatio || 1, 2);

/**
 * The hero chip as a point cloud (three.js Points with custom shaders): it
 * condenses from a sphere, sways slowly about its 3/4 view and twinkles; data packets run along
 * the traces and the cores light up in sequence (faster while the agent
 * answers); the cursor pushes points aside with a ripple; scrolling spreads
 * the layers, then scatters the points until they fade at the figures. Set up
 * in small steps (yielding in between, shaders compiled asynchronously).
 * Renders only while on screen, visible and not fully faded. Returns a
 * disposer, safe to call at any point of the setup.
 */
export function mountChip(canvas: HTMLCanvasElement, opts: ChipOptions): () => void {
  const html = document.documentElement;
  let alive = true;
  let renderer: WebGLRenderer | undefined;
  const disposers: (() => void)[] = [];
  const dispose = () => {
    alive = false;
    disposers.splice(0).reverse().forEach((d) => d());
  };

  void (async () => {
    await nextTask();
    if (!alive) return;
    const c = buildCloud(opts.n);
    const p = buildPackets();
    await nextTask();
    if (!alive) return;

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
    let dpr = pixelRatio();
    gl.setPixelRatio(dpr);

    const scene = new Scene();
    const camera = new PerspectiveCamera(CAM.fov, 1, 0.1, 40);
    camera.position.set(0, 0, CAM.dist);
    const group = new Group();
    group.rotation.set(CAM.tilt, CAM.yaw, 0);
    scene.add(group);

    // the cloud
    const meta = new Float32Array(c.n * 4);
    for (let i = 0; i < c.n; i++) meta.set([c.size[i], c.alpha[i], c.seed[i], c.layer[i]], i * 4);
    const cloudGeo = new BufferGeometry();
    cloudGeo.setAttribute("position", new BufferAttribute(c.chip, 3));
    cloudGeo.setAttribute("aSphere", new BufferAttribute(c.sphere, 3));
    cloudGeo.setAttribute("aMeta", new BufferAttribute(meta, 4));
    cloudGeo.setAttribute("aCore", new BufferAttribute(c.core, 1));
    const ink = srgb(INK.light);
    const mouseUniform: [number, number] = [0, 0];
    const uniforms = {
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uScroll: { value: 0 },
      uSpread: { value: 0 },
      uPx: { value: 1 },
      uHover: { value: 0 },
      uCoreClock: { value: 0 },
      uInkAlpha: { value: 1 },
      uMouse: { value: mouseUniform },
      uInk: { value: ink },
      uAI: { value: AI.map(srgb) },
    };
    const cloudMat = new ShaderMaterial({ vertexShader: CLOUD_VERT, fragmentShader: DOT_FRAG, uniforms, transparent: true, depthWrite: false, depthTest: false });
    const cloud = new Points(cloudGeo, cloudMat);
    cloud.frustumCulled = false;
    cloud.renderOrder = 0;

    // the data packets, drawn over the ink
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
      uTime: uniforms.uTime,
      uHover: uniforms.uHover,
      uMouse: uniforms.uMouse,
      uPulseClock: { value: 0 },
      uMorph: uniforms.uMorph,
      uScroll: uniforms.uScroll,
      uSpread: uniforms.uSpread,
      uPx: uniforms.uPx,
      uSize: { value: opts.n < 4000 ? 0.085 : 0.075 },
    };
    const pMat = new ShaderMaterial({ vertexShader: PACKET_VERT, fragmentShader: GLOW_FRAG, uniforms: pUniforms, transparent: true, depthWrite: false, depthTest: false });
    const packets = new Points(pGeo, pMat);
    packets.frustumCulled = false;
    packets.renderOrder = 1;
    group.add(cloud, packets);
    disposers.push(() => {
      cloudGeo.dispose();
      cloudMat.dispose();
      pGeo.dispose();
      pMat.dispose();
    });

    // ink: the theme's, or the system text colour in high-contrast mode
    const forced = matchMedia("(forced-colors: active)");
    const applyTheme = () => {
      if (forced.matches) {
        const probe = document.createElement("span");
        probe.style.color = "CanvasText";
        document.body.append(probe);
        ink.setStyle(getComputedStyle(probe).color, LinearSRGBColorSpace);
        probe.remove();
        uniforms.uInkAlpha.value = 1;
      } else {
        const dark = html.dataset.theme === "dark";
        ink.setStyle(dark ? INK.dark : INK.light, LinearSRGBColorSpace);
        uniforms.uInkAlpha.value = dark ? INK_ALPHA.dark : INK_ALPHA.light;
      }
      if (started) draw();
    };
    const themeObs = new MutationObserver(applyTheme);
    themeObs.observe(html, { attributes: true, attributeFilter: ["data-theme"] });
    forced.addEventListener("change", applyTheme);
    disposers.push(() => {
      themeObs.disconnect();
      forced.removeEventListener("change", applyTheme);
    });

    // scroll: 0 once the chip is fully on screen (at the top on desktop; under the buttons on phones), 1 when the figures reach a third of the screen
    let scrollStart = 0;
    let scrollEnd = 600;
    const measure = () => {
      const square = canvas.parentElement!.getBoundingClientRect();
      const next = document.getElementById("numbers");
      const top = next ? next.getBoundingClientRect().top + window.scrollY : square.bottom + window.scrollY + 300;
      scrollStart = Math.max(0, square.bottom + window.scrollY - window.innerHeight);
      scrollEnd = Math.max(scrollStart + 240, top - window.innerHeight * 0.35);
    };
    const scrollTarget = () => Math.min(1, Math.max(0, (window.scrollY - scrollStart) / (scrollEnd - scrollStart)));

    // cursor: the last pointer position, re-projected every frame (so wheel scrolling keeps it right)
    const mouse = { cx: 0, cy: 0, has: false, x: 0, y: 0, hover: 0, px: 0, py: 0 };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mouse.cx = e.clientX;
      mouse.cy = e.clientY;
      mouse.has = true;
    };
    const onLeave = () => (mouse.has = false);
    if (opts.pointer) {
      window.addEventListener("pointermove", onMove, { passive: true });
      html.addEventListener("pointerleave", onLeave);
      disposers.push(() => {
        window.removeEventListener("pointermove", onMove);
        html.removeEventListener("pointerleave", onLeave);
      });
    }

    // clocks and loop state
    let t = 0;
    let pulse = 0;
    let cores = 0;
    let scroll = 0;
    let raf = 0;
    let last = 0;
    let visible = true;
    let started = false;
    let parked = false; // fully faded by the scroll: nothing to draw until it comes back

    const draw = () => {
      group.rotation.set(CAM.tilt + mouse.py * 0.06, CAM.yaw + SWAY.amp * Math.sin(SWAY.speed * t) + mouse.px * 0.14, 0);
      uniforms.uTime.value = t;
      uniforms.uMorph.value = Math.min(1, t / MORPH);
      uniforms.uScroll.value = scroll;
      const k = Math.min(1, scroll / 0.6);
      uniforms.uSpread.value = (1 - (1 - k) * (1 - k)) * 0.2;
      uniforms.uHover.value = mouse.hover;
      mouseUniform[0] = mouse.x;
      mouseUniform[1] = mouse.y;
      uniforms.uCoreClock.value = cores;
      pUniforms.uPulseClock.value = pulse;
      gl.render(scene, camera);
    };

    const frame = (now: number) => {
      raf = 0;
      if (!alive) return;
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
      last = now;
      const busy = html.hasAttribute("data-agent-busy");
      t += dt;
      pulse += dt * (busy ? 2.4 : 1);
      cores += dt * 0.55 * (busy ? 3 : 1);
      const target = scrollTarget();
      scroll = damp(scroll, target, 7, dt);
      let tx = 0;
      let ty = 0;
      let th = 0;
      let tpx = 0;
      let tpy = 0;
      if (mouse.has) {
        const r = canvas.getBoundingClientRect();
        tx = ((mouse.cx - r.left) / r.width) * 2 - 1;
        ty = -(((mouse.cy - r.top) / r.height) * 2 - 1);
        th = Math.abs(tx) < 1 && Math.abs(ty) < 1 ? 1 : 0;
        tpx = (mouse.cx / window.innerWidth) * 2 - 1;
        tpy = (mouse.cy / window.innerHeight) * 2 - 1;
      }
      mouse.x = damp(mouse.x, tx, 10, dt);
      mouse.y = damp(mouse.y, ty, 10, dt);
      mouse.hover = damp(mouse.hover, th, 4, dt);
      mouse.px = damp(mouse.px, tpx, 3, dt);
      mouse.py = damp(mouse.py, tpy, 3, dt);
      draw();
      if (target >= 1 && scroll > 0.999) parked = true; // the last frame drawn is empty
      schedule();
    };
    const schedule = () => {
      if (!raf && alive && started && visible && !parked && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const wake = () => {
      if (raf) return;
      last = performance.now();
      schedule();
    };
    const onScroll = () => {
      if (parked && scrollTarget() < 1) {
        parked = false;
        wake();
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    disposers.push(() => window.removeEventListener("scroll", onScroll));

    const io = new IntersectionObserver((entries) => {
      visible = entries[entries.length - 1].isIntersecting;
      if (visible) wake();
    });
    io.observe(canvas);
    const onVisibility = () => !document.hidden && wake();
    document.addEventListener("visibilitychange", onVisibility);
    disposers.push(() => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    });

    // size and pixel ratio (a resize clears the canvas: redraw at once)
    const resize = () => {
      const next = pixelRatio();
      if (next !== dpr) {
        dpr = next;
        gl.setPixelRatio(dpr);
      }
      const w = canvas.clientWidth || 1;
      const h = canvas.clientHeight || 1;
      gl.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      uniforms.uPx.value = (h * dpr) / 2 / Math.tan(((CAM.fov / 2) * Math.PI) / 180);
      measure();
      if (started && !document.hidden) draw();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const bodyRo = new ResizeObserver(measure);
    bodyRo.observe(document.body);
    let dprQuery = matchMedia(`(resolution: ${dpr}dppx)`);
    const onDpr = () => {
      dprQuery.removeEventListener("change", onDpr);
      resize();
      dprQuery = matchMedia(`(resolution: ${dpr}dppx)`);
      dprQuery.addEventListener("change", onDpr);
    };
    dprQuery.addEventListener("change", onDpr);
    window.addEventListener("resize", measure);
    disposers.push(() => {
      ro.disconnect();
      bodyRo.disconnect();
      dprQuery.removeEventListener("change", onDpr);
      window.removeEventListener("resize", measure);
    });

    const onLost = (e: Event) => {
      e.preventDefault();
      alive = false;
      opts.onFail();
    };
    canvas.addEventListener("webglcontextlost", onLost);
    disposers.push(() => canvas.removeEventListener("webglcontextlost", onLost));

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
    started = true;
    draw();
    opts.onFirstFrame();
    last = performance.now();
    schedule();
  })();

  return dispose;
}
