"use client";

import { useEffect, useRef } from "react";
import {
  BoxGeometry,
  BufferGeometry,
  Color,
  EdgesGeometry,
  Group,
  InstancedMesh,
  Line,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  OrthographicCamera,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from "three";
import { BALLS, CORES, FIN, LAYERS, TRACES, type Slab } from "@/lib/chip";

const K = Math.sqrt(2 / 3); // isometric foreshortening: matches the SVG drawing exactly
const AI = ["#0a84ff", "#bf5af2", "#ff375f", "#ff9f0a"];

const PALETTE = {
  light: { line: "#3a3a3d", lineOpacity: 0.8, top: "#ffffff", left: "#f5f5f7", right: "#e8e8ed", ball: "#d2d2d7", trace: 0.4, core: "#f2f2f4" },
  dark: { line: "#f5f5f7", lineOpacity: 0.7, top: "#000000", left: "#0e0e10", right: "#18181b", ball: "#3a3a3c", trace: 0.45, core: "#121214" },
};
type Theme = keyof typeof PALETTE;

const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
const damp = (a: number, b: number, k: number, dt: number) => a + (b - a) * (1 - Math.exp(-k * dt));

/**
 * The hero chip in 3D (desktop only, loaded when the page is idle): the same
 * four layers and the same isometric view as the SVG it replaces. The layers
 * assemble on load; data pulses run along the traces and the cores light up
 * in sequence, without pause (faster while the agent answers); the chip
 * turns a little with the cursor and its layers spread on hover.
 */
export default function Chip3D({ onReady }: { onReady: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const stage = canvas.parentElement!;
    const html = document.documentElement;
    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
    } catch {
      return; // no WebGL: the SVG stays
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new Scene();
    const camera = new OrthographicCamera(-190 * K, 190 * K, 332 * K, -118 * K, -2000, 2000);
    camera.position.set(600, 600, 600);
    camera.lookAt(0, 0, 0);

    const theme = (): Theme => (html.dataset.theme === "dark" ? "dark" : "light");
    const lineMat = new LineBasicMaterial({ transparent: true });
    const traceMat = new LineBasicMaterial({ transparent: true });
    const faceMats = { top: new MeshBasicMaterial(), left: new MeshBasicMaterial(), right: new MeshBasicMaterial() };
    for (const m of Object.values(faceMats)) Object.assign(m, { polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    const ballMat = new MeshBasicMaterial();
    const disposables: { dispose: () => void }[] = [lineMat, traceMat, ballMat, ...Object.values(faceMats)];

    // BoxGeometry material order: +x, −x, +y (top), −y, +z, −z. The camera sees +x (right), +y (top) and +z (left).
    const boxMats = [faceMats.right, faceMats.left, faceMats.top, faceMats.left, faceMats.left, faceMats.right];
    const box = (w: number, h: number, d: number, x = 0, y = 0, z = 0) => {
      const g = new BoxGeometry(w, h, d);
      const mesh = new Mesh(g, boxMats);
      const edges = new LineSegments(new EdgesGeometry(g), lineMat);
      const o = new Group();
      o.add(mesh, edges);
      o.position.set(x, y + h / 2, z);
      disposables.push(g, edges.geometry);
      return o;
    };
    const slab = (s: Slab) => box(s.w * 2, s.h, s.d * 2);

    // chip (x, y, z-up) → three (x, z, y)
    const base = new Group();
    base.add(slab(LAYERS.substrate));
    const sphere = new SphereGeometry(3.6, 12, 8);
    const balls = new InstancedMesh(sphere, ballMat, BALLS.length);
    const tmp = new Object3D();
    BALLS.forEach(([x, y], i) => {
      tmp.position.set(x, -5, y);
      tmp.updateMatrix();
      balls.setMatrixAt(i, tmp.matrix);
    });
    base.add(balls);
    disposables.push(sphere);

    const I = LAYERS.interposer;
    const interposer = new Group();
    interposer.add(slab(I));
    const paths = TRACES.map((t) => t.map(([x, y]) => new Vector3(x, I.h + 0.15, y)));
    for (const p of paths) {
      const g = new BufferGeometry().setFromPoints(p);
      interposer.add(new Line(g, traceMat));
      disposables.push(g);
    }
    // the data packets
    const packetGeo = new SphereGeometry(1.9, 10, 8);
    const packetMat = new MeshBasicMaterial({ color: "#ffffff" });
    const packets = new InstancedMesh(packetGeo, packetMat, paths.length);
    paths.forEach((_, i) => packets.setColorAt(i, new Color(AI[i % 4])));
    interposer.add(packets);
    disposables.push(packetGeo, packetMat);
    const lengths = paths.map((p) => p.slice(1).reduce((acc, v, i) => acc + v.distanceTo(p[i]), 0));
    const along = (p: Vector3[], len: number, t: number, out: Vector3) => {
      let d = t * len;
      for (let i = 1; i < p.length; i++) {
        const seg = p[i].distanceTo(p[i - 1]);
        if (d <= seg) return out.lerpVectors(p[i - 1], p[i], d / seg);
        d -= seg;
      }
      return out.copy(p[p.length - 1]);
    };

    const D = LAYERS.die;
    const die = new Group();
    die.add(slab(D));
    const coreMats = CORES.map(() => new MeshBasicMaterial({ polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }));
    CORES.forEach((c, i) => {
      const g = new BoxGeometry(c.x1 - c.x0, 0.8, c.y1 - c.y0);
      const mesh = new Mesh(g, coreMats[i]);
      const edges = new LineSegments(new EdgesGeometry(g), lineMat);
      const o = new Group();
      o.add(mesh, edges);
      o.position.set((c.x0 + c.x1) / 2, D.h + 0.4, (c.y0 + c.y1) / 2);
      die.add(o);
      disposables.push(g, edges.geometry, coreMats[i]);
    });

    const H = LAYERS.sink;
    const sink = new Group();
    sink.add(slab(H));
    const finStep = (H.d * 2 - FIN.t) / (FIN.count - 1);
    for (let k = 0; k < FIN.count; k++) sink.add(box((H.w - 4) * 2, FIN.h, FIN.t, 0, H.h, -H.d + k * finStep + FIN.t / 2));

    const chip = new Group();
    chip.add(base, interposer, die, sink);
    scene.add(chip);

    // where each layer sits when stacked, and exploded
    const stacked = [0, LAYERS.substrate.h, LAYERS.substrate.h + I.h, LAYERS.substrate.h + I.h + D.h];
    const exploded = [0, I.z, D.z, H.z];
    const layers = [base, interposer, die, sink];

    const applyTheme = () => {
      const p = PALETTE[theme()];
      lineMat.color.set(p.line);
      lineMat.opacity = p.lineOpacity;
      traceMat.color.set(p.line);
      traceMat.opacity = p.trace;
      faceMats.top.color.set(p.top);
      faceMats.left.color.set(p.left);
      faceMats.right.color.set(p.right);
      ballMat.color.set(p.ball);
    };
    applyTheme();
    const mo = new MutationObserver(applyTheme);
    mo.observe(html, { attributes: true, attributeFilter: ["data-theme"] });

    const resize = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      renderer.setSize(w, h, false);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(stage);

    // pointer: parallax anywhere in the hero, spread while over the chip
    const hero = stage.closest("section") ?? stage;
    let px = 0;
    let py = 0;
    let over = false;
    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      px = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)));
      py = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)));
      over = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    };
    const onLeave = () => {
      px = py = 0;
      over = false;
    };
    hero.addEventListener("pointermove", onMove as EventListener, { passive: true });
    hero.addEventListener("pointerleave", onLeave);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(stage);

    const t0 = performance.now();
    let last = t0;
    let rotY = 0;
    let rotX = 0;
    let spread = 1;
    let pulseClock = 0;
    let coreClock = 0;
    let raf = 0;
    let readied = false;
    const pos = new Vector3();
    const core = new Color();
    const coreBase = new Color();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) {
        last = now;
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = (now - t0) / 1000;
      const busy = html.hasAttribute("data-agent-busy");

      rotY = damp(rotY, px * 0.32, 4, dt);
      rotX = damp(rotX, py * 0.08, 4, dt);
      spread = damp(spread, over ? 1.22 : 1, 5, dt);
      chip.rotation.set(rotX, rotY, 0);

      // assemble: each layer rises from the stack, staggered
      layers.forEach((l, i) => {
        const p = easeOut((t - 0.15 - i * 0.14) / 1.5);
        l.position.y = stacked[i] + (exploded[i] - stacked[i]) * p * spread;
      });

      pulseClock += dt * (busy ? 2.2 : 1);
      paths.forEach((p, i) => {
        const period = 2.4 + (i % 5) * 0.35;
        const ph = ((pulseClock + i * 0.37) % period) / period;
        along(p, lengths[i], ph, pos);
        tmp.position.copy(pos);
        const s = ph < 0.08 ? ph / 0.08 : ph > 0.92 ? (1 - ph) / 0.08 : 1;
        tmp.scale.setScalar(Math.max(0.001, s));
        tmp.updateMatrix();
        packets.setMatrixAt(i, tmp.matrix);
      });
      packets.instanceMatrix.needsUpdate = true;

      coreClock += dt * (busy ? 3.2 : 1);
      coreBase.set(PALETTE[theme()].core);
      coreMats.forEach((m, i) => {
        const ph = (coreClock * 1.6 - i * 0.55) % (CORES.length * 0.55);
        const glow = ph > 0 && ph < 1.1 ? Math.sin((ph / 1.1) * Math.PI) : 0;
        m.color.copy(coreBase).lerp(core.set(AI[i % 4]), glow * 0.85);
      });

      renderer.render(scene, camera);
      if (!readied) {
        readied = true;
        onReady();
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      ro.disconnect();
      io.disconnect();
      hero.removeEventListener("pointermove", onMove as EventListener);
      hero.removeEventListener("pointerleave", onLeave);
      disposables.forEach((d) => d.dispose());
      balls.dispose();
      packets.dispose();
      renderer.dispose();
    };
  }, [onReady]);

  return <canvas ref={ref} className="absolute inset-0 size-full" aria-hidden />;
}
