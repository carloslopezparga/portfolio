"use client";

// three.js materials and objects are mutated every frame by design (useFrame), outside React state.
/* eslint-disable react-hooks/immutability */

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { DomainId } from "@/content/types";
import { GEAR, PLANET_DOMAINS, toothPoints } from "@/lib/gears";
import { gyro, pointer } from "@/lib/pointer";
import { agentBusy, onUI } from "@/lib/ui-bus";

/* ------------------------------------------------------------------ */
/* Geometry                                                            */
/* ------------------------------------------------------------------ */

function shapeFrom(points: [number, number][]) {
  const s = new THREE.Shape();
  points.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  s.closePath();
  return s;
}
function pathFrom(points: [number, number][]) {
  const p = new THREE.Path();
  points.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y)));
  p.closePath();
  return p;
}
function circlePath(r: number, x = 0, y = 0) {
  const p = new THREE.Path();
  p.absarc(x, y, r, 0, Math.PI * 2, false);
  return p;
}
function extrude(shape: THREE.Shape, depth: number) {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 12 });
  g.rotateX(-Math.PI / 2);
  g.translate(0, -depth / 2, 0);
  return g;
}
function gear(z: number, rp: number, bore: number, depth: number) {
  const s = shapeFrom(toothPoints(z, rp));
  s.holes.push(circlePath(bore));
  return extrude(s, depth);
}
function ringGear(depth: number) {
  const s = new THREE.Shape();
  s.absarc(0, 0, GEAR.rRing + 0.42, 0, Math.PI * 2, false);
  s.holes.push(pathFrom(toothPoints(GEAR.zRing, GEAR.rRing, true)));
  return extrude(s, depth);
}
/**
 * Three-lobed carrier ("spider"): a lobe around each planet pin and a wide
 * centre opening, so the sun gear and its neural core stay visible once the
 * gearbox is assembled.
 */
function carrierPlate() {
  const W = 0.34; // half-width of a lobe, radians
  const pts: [number, number][] = [];
  for (let i = 0; i < 180; i++) {
    const t = (i / 180) * Math.PI * 2;
    const bump = Math.max(
      ...GEAR.planetAngles.map((a) => {
        const d = Math.abs(Math.atan2(Math.sin(t - a), Math.cos(t - a)));
        return d < W ? Math.cos((Math.PI * d) / (2 * W)) ** 2 : 0;
      }),
    );
    const r = 0.8 + 0.44 * bump;
    pts.push([Math.cos(t) * r, Math.sin(t) * r]);
  }
  const s = shapeFrom(pts);
  s.holes.push(circlePath(0.66));
  GEAR.planetAngles.forEach((a) => s.holes.push(circlePath(0.09, Math.cos(a) * GEAR.orbit, Math.sin(a) * GEAR.orbit)));
  return extrude(s, 0.12);
}

/** Points on a sphere + nearest-neighbour edges: the AI core inside the sun gear. */
function neuralCore(n: number, r: number) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = i * 2.399963;
    pts.push(new THREE.Vector3(Math.cos(th) * rad * r, y * r * 0.8, Math.sin(th) * rad * r));
  }
  const seg: number[] = [];
  pts.forEach((p, i) => {
    pts
      .map((q, j) => ({ j, d: p.distanceTo(q) }))
      .filter((o) => o.j > i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 3)
      .forEach(({ j }) => seg.push(p.x, p.y, p.z, pts[j].x, pts[j].y, pts[j].z));
  });
  const nodes = new THREE.BufferGeometry().setFromPoints(pts);
  const edges = new THREE.BufferGeometry();
  edges.setAttribute("position", new THREE.Float32BufferAttribute(seg, 3));
  return { nodes, edges };
}

type Key = "ring" | "sun" | "p0" | "p1" | "p2" | "carrier" | "shaft";
/** Which colour each part takes (the ring, carrier and shaft stay neutral). */
const DOMAIN_OF: Record<Key, DomainId | null> = { ring: null, sun: "ai", p0: PLANET_DOMAINS[0], p1: PLANET_DOMAINS[1], p2: PLANET_DOMAINS[2], carrier: null, shaft: null };
/** Assembled y, exploded y, assembly order. */
const LAYOUT: Record<"ring" | "planet" | "sun" | "carrier" | "shaft", { y0: number; y1: number; order: number }> = {
  ring: { y0: 0, y1: -1.75, order: 0 },
  planet: { y0: 0, y1: -0.2, order: 1 },
  sun: { y0: 0, y1: 1.15, order: 2 },
  carrier: { y0: 0.3, y1: 2.15, order: 3 },
  shaft: { y0: 0.42, y1: 3.0, order: 4 },
};
/** Seconds the assembly takes once the scene is on screen. */
const ASSEMBLY = 2.8;
const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

function readColors() {
  const cs = getComputedStyle(document.documentElement);
  const v = (n: string) => cs.getPropertyValue(n).trim();
  return {
    ai: v("--purple"),
    automation: v("--blue"),
    data: v("--cyan"),
    ops: v("--orange"),
    software: v("--green"),
    neutral: v("--muted"),
  };
}

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

function Scene({ touch, focus }: { touch: boolean; focus: { current: { part: DomainId | null; left: number } } }) {
  const geo = useMemo(() => {
    const ring = ringGear(0.42);
    const sun = gear(GEAR.zSun, GEAR.rSun, 0.3, 0.46);
    const planet = gear(GEAR.zPlanet, GEAR.rPlanet, 0.11, 0.36);
    const carrier = carrierPlate();
    const shaft = new THREE.CylinderGeometry(0.12, 0.12, 2.6, 8, 1);
    const core = neuralCore(46, 0.26);
    const edges = (g: THREE.BufferGeometry) => new THREE.EdgesGeometry(g, 18);
    return { ring, sun, planet, carrier, shaft, core, e: { ring: edges(ring), sun: edges(sun), planet: edges(planet), carrier: edges(carrier), shaft: edges(shaft) } };
  }, []);

  const mats = useMemo(() => {
    const c = readColors();
    const keys: Key[] = ["ring", "sun", "p0", "p1", "p2", "carrier", "shaft"];
    const lines = {} as Record<Key, THREE.LineBasicMaterial>;
    const faces = {} as Record<Key, THREE.MeshBasicMaterial>;
    keys.forEach((k) => {
      const d = DOMAIN_OF[k];
      const color = d ? c[d] : c.neutral;
      lines[k] = new THREE.LineBasicMaterial({ color, transparent: true, opacity: d ? 0.9 : 0.45 });
      faces[k] = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: d ? 0.06 : 0.02, depthWrite: false, side: THREE.DoubleSide });
    });
    return {
      lines,
      faces,
      occluder: new THREE.MeshBasicMaterial({ colorWrite: false, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
      coreNodes: new THREE.PointsMaterial({ color: c.ai, size: 0.05, transparent: true, opacity: 0.95, depthWrite: false }),
      coreEdges: new THREE.LineBasicMaterial({ color: c.ai, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }),
    };
  }, []);

  useEffect(() => {
    const mo = new MutationObserver(() => {
      const c = readColors();
      (Object.keys(mats.lines) as Key[]).forEach((k) => {
        const d = DOMAIN_OF[k];
        mats.lines[k].color.set(d ? c[d] : c.neutral);
        mats.faces[k].color.set(d ? c[d] : c.neutral);
      });
      mats.coreNodes.color.set(c.ai);
      mats.coreEdges.color.set(c.ai);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, [mats]);

  const root = useRef<THREE.Group>(null);
  const carrierSpin = useRef<THREE.Group>(null);
  const R = useRef<Partial<Record<Key, THREE.Group>>>({});
  const core = useRef<THREE.Group>(null);
  const st = useRef({ t: 0, sun: 0, idle: 0, rx: 0, ry: 0, glow: { sun: 0, p0: 0, p1: 0, p2: 0 } as Record<string, number> });
  const reg = (k: Key) => (o: THREE.Group | null) => {
    if (o) R.current[k] = o;
  };

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = st.current;
    s.t += dt;

    // assembly: on its own, once, then it keeps turning
    const p = clamp01(s.t / ASSEMBLY);
    const k = (order: number) => smooth(clamp01((p * 1.3 - order * 0.1) / 0.6));
    const kRing = k(LAYOUT.ring.order);
    const kPlanet = k(LAYOUT.planet.order);
    const kSun = k(LAYOUT.sun.order);
    const kCarrier = k(LAYOUT.carrier.order);
    const kShaft = k(LAYOUT.shaft.order);
    const assembled = (kRing + kPlanet + kSun + kCarrier + kShaft) / 5;

    const cam = state.camera as THREE.PerspectiveCamera;
    const fov = 34 - 12 * smooth(assembled);
    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
      cam.lookAt(0, 0.55 - 0.42 * smooth(assembled), 0);
    }

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    if (R.current.ring) R.current.ring.position.y = lerp(LAYOUT.ring.y1, LAYOUT.ring.y0, kRing);
    if (R.current.sun) R.current.sun.position.y = lerp(LAYOUT.sun.y1, LAYOUT.sun.y0, kSun);
    if (core.current && R.current.sun) core.current.position.y = R.current.sun.position.y;
    if (R.current.carrier) R.current.carrier.position.y = lerp(LAYOUT.carrier.y1, LAYOUT.carrier.y0, kCarrier);
    if (R.current.shaft) R.current.shaft.position.y = lerp(LAYOUT.shaft.y1, LAYOUT.shaft.y0, kShaft);
    (["p0", "p1", "p2"] as const).forEach((key, i) => {
      const o = R.current[key];
      if (!o) return;
      const a = GEAR.planetAngles[i];
      const r = GEAR.orbit * (1 + (1 - kPlanet) * 0.5);
      o.position.set(Math.cos(a) * r, lerp(LAYOUT.planet.y1, LAYOUT.planet.y0, kPlanet), -Math.sin(a) * r);
    });

    // kinematics (ring fixed): carrier = sun/4, planets spin -3/4 sun relative to the carrier
    const w = 0.12 + 0.4 * smooth(assembled);
    s.sun += w * dt;
    if (R.current.sun) R.current.sun.rotation.y = s.sun;
    if (R.current.shaft) R.current.shaft.rotation.y = s.sun;
    if (carrierSpin.current) carrierSpin.current.rotation.y = s.sun / 4;
    (["p0", "p1", "p2"] as const).forEach((key, i) => {
      const o = R.current[key];
      if (o) o.rotation.y = -0.75 * s.sun + i * 0.4;
    });

    // the agent's focus_part: that part glows for a moment
    const f = focus.current;
    f.left = Math.max(0, f.left - dt);
    const lit = f.part && f.left > 0 ? f.part : null;
    const ease = 1 - Math.exp(-6 * dt);
    (["sun", "p0", "p1", "p2"] as const).forEach((key) => {
      s.glow[key] += ((lit && DOMAIN_OF[key] === lit ? 1 : 0) - s.glow[key]) * ease;
      mats.faces[key].opacity = 0.06 + s.glow[key] * 0.22;
      mats.lines[key].opacity = 0.9 + s.glow[key] * 0.1;
    });

    // neural core: a calm pulse, faster while the agent is answering
    if (core.current) {
      const busy = agentBusy.get() || s.glow.sun > 0.5;
      const t = state.clock.elapsedTime;
      const pulse = Math.sin(t * (busy ? 9 : 2.4));
      core.current.scale.setScalar(1 + pulse * (busy ? 0.12 : 0.05));
      core.current.rotation.y = -t * 0.3;
      mats.coreEdges.opacity = (busy ? 0.8 : 0.45) + pulse * 0.15;
    }

    // the cursor (or the gyroscope) tilts it a little
    s.idle += dt * 0.05;
    const tx = touch ? (gyro.active ? gyro.gx : 0) : pointer.inside ? pointer.nx : 0;
    const ty = touch ? (gyro.active ? gyro.gy : 0) : pointer.inside ? pointer.ny : 0;
    s.ry += (tx * 0.3 - s.ry) * (1 - Math.exp(-2.5 * dt));
    s.rx += (ty * 0.1 - s.rx) * (1 - Math.exp(-2.5 * dt));
    if (root.current) {
      root.current.rotation.y = -0.45 + s.idle + s.ry;
      root.current.rotation.x = s.rx;
    }
  });

  const part = (key: Key, g: THREE.BufferGeometry, e: THREE.BufferGeometry) => (
    <group ref={reg(key)} key={key}>
      <mesh geometry={g} material={mats.occluder} />
      <mesh geometry={g} material={mats.faces[key]} />
      <lineSegments geometry={e} material={mats.lines[key]} />
    </group>
  );

  return (
    <group ref={root}>
      {part("ring", geo.ring, geo.e.ring)}
      {part("sun", geo.sun, geo.e.sun)}
      <group ref={core}>
        <points geometry={geo.core.nodes} material={mats.coreNodes} />
        <lineSegments geometry={geo.core.edges} material={mats.coreEdges} />
      </group>
      {part("shaft", geo.shaft, geo.e.shaft)}
      <group ref={carrierSpin}>
        {part("p0", geo.planet, geo.e.planet)}
        {part("p1", geo.planet, geo.e.planet)}
        {part("p2", geo.planet, geo.e.planet)}
        {part("carrier", geo.carrier, geo.e.carrier)}
      </group>
    </group>
  );
}

/**
 * The planetary gearbox as a decorative piece: it assembles by itself when it
 * first appears, then turns slowly. The neural core pulses while the agent is
 * answering. No labels, no hover — the content is the text next to it.
 */
export default function Gearbox3D({ touch, onReady }: { touch: boolean; onReady?: () => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const focus = useRef<{ part: DomainId | null; left: number }>({ part: null, left: 0 });

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(wrap.current!);
    const off = onUI("focus_part", (a) => {
      focus.current = { part: a.part, left: 2.6 };
    });
    onReady?.();
    return () => {
      io.disconnect();
      off();
    };
  }, [onReady]);

  return (
    <div ref={wrap} className="absolute inset-0" aria-hidden>
      <Canvas
        dpr={[1, touch ? 1.5 : 1.75]}
        camera={{ position: [7.2, 5.4, 8.8], fov: 34, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop={visible ? "always" : "never"}
        onCreated={({ camera }) => camera.lookAt(0, 0.55, 0)}
      >
        <Scene touch={touch} focus={focus} />
      </Canvas>
    </div>
  );
}
