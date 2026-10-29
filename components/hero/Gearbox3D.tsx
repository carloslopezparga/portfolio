"use client";

// three.js materials and objects are mutated every frame by design (useFrame), outside React state.
/* eslint-disable react-hooks/immutability */

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import type { DomainId } from "@/content/types";
import { GEAR, PLANET_DOMAINS, toothPoints } from "@/lib/gears";
import { gyro, pointer } from "@/lib/pointer";
import { agentBusy, dispatchUI, onUI } from "@/lib/ui-bus";
import type { PartInfo } from "./Gearbox2D";

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
const DOMAIN_OF: Record<Key, DomainId | null> = { ring: "engineering", sun: "ai", p0: PLANET_DOMAINS[0], p1: PLANET_DOMAINS[1], p2: PLANET_DOMAINS[2], carrier: null, shaft: null };
/** Assembled y, exploded y, assembly order. */
const LAYOUT: Record<"ring" | "planet" | "sun" | "carrier" | "shaft", { y0: number; y1: number; order: number }> = {
  ring: { y0: 0, y1: -1.75, order: 0 },
  planet: { y0: 0, y1: -0.2, order: 1 },
  sun: { y0: 0, y1: 1.15, order: 2 },
  carrier: { y0: 0.3, y1: 2.15, order: 3 },
  shaft: { y0: 0.42, y1: 3.0, order: 4 },
};
const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

function readColors() {
  const cs = getComputedStyle(document.documentElement);
  const v = (n: string) => cs.getPropertyValue(n).trim();
  return { ai: v("--ai"), automation: v("--auto"), data: v("--data"), ops: v("--ops"), engineering: v("--eng"), neutral: v("--subtle") };
}

export interface OverlayFrame {
  anchors: Partial<Record<DomainId, [number, number]>>;
  top: [number, number];
  bottom: [number, number];
  heightMM: number;
  assembled: number;
  active: DomainId | null;
}

export interface GearboxShared {
  progress: number;
  hover: DomainId | null;
  focus: DomainId | null;
  onFrame?: (f: OverlayFrame) => void;
}

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

function Scene({ shared, setHover, mobile, touch }: { shared: RefObject<GearboxShared>; setHover: (d: DomainId | null) => void; mobile: boolean; touch: boolean }) {
  const { camera, size } = useThree();
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
    const line = (color: string, opacity = 0.9) => new THREE.LineBasicMaterial({ color, transparent: true, opacity });
    const face = (color: string) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.03, depthWrite: false, side: THREE.DoubleSide });
    const keys: Key[] = ["ring", "sun", "p0", "p1", "p2", "carrier", "shaft"];
    const lines = {} as Record<Key, THREE.LineBasicMaterial>;
    const faces = {} as Record<Key, THREE.MeshBasicMaterial>;
    keys.forEach((k) => {
      const d = DOMAIN_OF[k];
      const color = d ? c[d] : c.neutral;
      lines[k] = line(color, d ? 0.9 : 0.55);
      faces[k] = face(color);
    });
    return {
      lines,
      faces,
      occluder: new THREE.MeshBasicMaterial({ colorWrite: false, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
      coreNodes: new THREE.PointsMaterial({ color: c.ai, size: 0.045, transparent: true, opacity: 0.95, depthWrite: false }),
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
  const st = useRef({ sun: 0, idle: 0, rx: 0, ry: 0, sep: { ring: 0, sun: 0, p0: 0, p1: 0, p2: 0 } as Record<string, number> });
  const v = useMemo(() => new THREE.Vector3(), []);
  const reg = (k: Key) => (o: THREE.Group | null) => {
    if (o) R.current[k] = o;
  };

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = st.current;
    const sh = shared.current!;
    const p = mobile ? 1 : sh.progress;
    const active = sh.hover ?? sh.focus;

    // assembly
    const k = (order: number) => smooth(clamp01((p * 1.3 - order * 0.1) / 0.6));
    const kRing = k(LAYOUT.ring.order);
    const kPlanet = k(LAYOUT.planet.order);
    const kSun = k(LAYOUT.sun.order);
    const kCarrier = k(LAYOUT.carrier.order);
    const kShaft = k(LAYOUT.shaft.order);
    const assembled = (kRing + kPlanet + kSun + kCarrier + kShaft) / 5;

    // the camera closes in as the parts come together, so the assembled box stays the protagonist
    if (!mobile) {
      const cam = state.camera as THREE.PerspectiveCamera;
      const fov = 31 - 9 * smooth(assembled);
      if (Math.abs(cam.fov - fov) > 0.01) {
        cam.fov = fov;
        cam.updateProjectionMatrix();
        cam.lookAt(0, 0.55 - 0.4 * smooth(assembled), 0);
      }
    }

    // hover / focus separation
    const ease = 1 - Math.exp(-8 * dt);
    (["ring", "sun", "p0", "p1", "p2"] as const).forEach((key) => {
      s.sep[key] += ((active && DOMAIN_OF[key] === active ? 1 : 0) - s.sep[key]) * ease;
    });

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    if (R.current.ring) R.current.ring.position.y = lerp(LAYOUT.ring.y1, LAYOUT.ring.y0, kRing) - s.sep.ring * 0.35;
    if (R.current.sun) R.current.sun.position.y = lerp(LAYOUT.sun.y1, LAYOUT.sun.y0, kSun) + s.sep.sun * 0.5;
    if (core.current && R.current.sun) core.current.position.y = R.current.sun.position.y;
    if (R.current.carrier) R.current.carrier.position.y = lerp(LAYOUT.carrier.y1, LAYOUT.carrier.y0, kCarrier);
    if (R.current.shaft) R.current.shaft.position.y = lerp(LAYOUT.shaft.y1, LAYOUT.shaft.y0, kShaft);
    (["p0", "p1", "p2"] as const).forEach((key, i) => {
      const o = R.current[key];
      if (!o) return;
      const a = GEAR.planetAngles[i];
      const r = GEAR.orbit * (1 + (1 - kPlanet) * 0.5) + s.sep[key] * 0.45;
      o.position.set(Math.cos(a) * r, lerp(LAYOUT.planet.y1, LAYOUT.planet.y0, kPlanet), -Math.sin(a) * r);
    });

    // kinematics (ring fixed): carrier = sun/4, planets spin -3/4 sun relative to the carrier
    const w = 0.12 + 0.5 * smooth(assembled);
    s.sun += w * dt;
    if (R.current.sun) R.current.sun.rotation.y = s.sun;
    if (R.current.shaft) R.current.shaft.rotation.y = s.sun;
    if (carrierSpin.current) carrierSpin.current.rotation.y = s.sun / 4;
    (["p0", "p1", "p2"] as const).forEach((key, i) => {
      const o = R.current[key];
      if (o) o.rotation.y = -0.75 * s.sun + i * 0.4;
    });

    // neural core pulse — faster while the agent is answering
    if (core.current) {
      const busy = agentBusy.get();
      const t = state.clock.elapsedTime;
      const pulse = Math.sin(t * (busy ? 9 : 2.4));
      core.current.scale.setScalar(1 + pulse * (busy ? 0.1 : 0.05));
      core.current.rotation.y = -t * 0.3;
      mats.coreEdges.opacity = (busy ? 0.75 : 0.45) + pulse * 0.15;
    }

    // emphasis: the active part glows, the rest recede
    (Object.keys(mats.lines) as Key[]).forEach((key) => {
      const d = DOMAIN_OF[key];
      const on = !active || d === active;
      const base = d ? 0.9 : 0.5;
      mats.lines[key].opacity += ((on ? (d === active ? 1 : base) : 0.18) - mats.lines[key].opacity) * ease;
      mats.faces[key].opacity += ((d && d === active ? 0.1 : on ? 0.03 : 0.01) - mats.faces[key].opacity) * ease;
    });

    // steering: cursor (or gyroscope) tilts the whole drawing a little
    s.idle += dt * 0.05;
    const tx = touch ? (gyro.active ? gyro.gx : 0) : pointer.inside ? pointer.nx : 0;
    const ty = touch ? (gyro.active ? gyro.gy : 0) : pointer.inside ? pointer.ny : 0;
    s.ry += (tx * 0.35 - s.ry) * (1 - Math.exp(-2.5 * dt));
    s.rx += (ty * 0.12 - s.rx) * (1 - Math.exp(-2.5 * dt));
    if (root.current) {
      root.current.rotation.y = -0.45 + s.idle + s.ry;
      root.current.rotation.x = s.rx;
    }

    // overlay: project anchors to screen space
    if (sh.onFrame) {
      const proj = (o: THREE.Object3D | undefined, local: [number, number, number]): [number, number] => {
        if (!o) return [-999, -999];
        v.set(...local).applyMatrix4(o.matrixWorld).project(camera);
        return [(v.x * 0.5 + 0.5) * size.width, (-v.y * 0.5 + 0.5) * size.height];
      };
      const anchors: OverlayFrame["anchors"] = {
        ai: proj(R.current.sun, [GEAR.rSun + 0.05, 0.1, 0]),
        engineering: proj(R.current.ring, [GEAR.rRing + 0.42, 0, 0]),
        [PLANET_DOMAINS[0]]: proj(R.current.p0, [GEAR.rPlanet, 0.1, 0]),
        [PLANET_DOMAINS[1]]: proj(R.current.p1, [GEAR.rPlanet, 0.1, 0]),
        [PLANET_DOMAINS[2]]: proj(R.current.p2, [GEAR.rPlanet, 0.1, 0]),
      };
      const topY = (R.current.shaft?.position.y ?? 0) + 1.3;
      const botY = (R.current.ring?.position.y ?? 0) - 0.21;
      sh.onFrame({
        anchors,
        top: proj(root.current ?? undefined, [0, topY, 0]),
        bottom: proj(root.current ?? undefined, [0, botY, 0]),
        heightMM: Math.round((topY - botY) * 100),
        assembled,
        active,
      });
    }
  });

  const events = (key: Key) => {
    const d = DOMAIN_OF[key];
    if (!d) return {};
    return {
      onPointerOver: (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHover(d);
      },
      onPointerOut: (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHover(null);
      },
      onClick: (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        if (d === "engineering") dispatchUI({ type: "scroll_to", sectionId: "trajectory" });
        else {
          dispatchUI({ type: "filter_domain", domain: d });
          dispatchUI({ type: "scroll_to", sectionId: "toolkit" });
        }
      },
    };
  };

  const part = (key: Key, g: THREE.BufferGeometry, e: THREE.BufferGeometry) => (
    <group ref={reg(key)} key={key} {...events(key)}>
      <mesh geometry={g} material={mats.occluder} />
      <mesh geometry={g} material={mats.faces[key]} />
      <lineSegments geometry={e} material={mats.lines[key]} raycast={() => null} />
    </group>
  );

  return (
    <group ref={root} scale={mobile ? 0.8 : 1}>
      {part("ring", geo.ring, geo.e.ring)}
      {part("sun", geo.sun, geo.e.sun)}
      <group ref={core}>
        <points geometry={geo.core.nodes} material={mats.coreNodes} raycast={() => null} />
        <lineSegments geometry={geo.core.edges} material={mats.coreEdges} raycast={() => null} />
      </group>
      {part("shaft", geo.shaft, geo.e.shaft)}
      <group ref={carrierSpin}>
        {part("p0", geo.planet, geo.e.planet)}
        {part("p1", geo.planet, geo.e.planet)}
        {part("p2", geo.planet, geo.e.planet)}
        {part("carrier", geo.carrier, geo.e.carrier)}
      </group>
      <lineSegments raycast={() => null}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[new Float32Array([0, -2.6, 0, 0, 4.6, 0]), 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#5b6270" transparent opacity={0.35} />
      </lineSegments>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Overlay (parts-sheet annotations) + canvas                          */
/* ------------------------------------------------------------------ */

const SIDE: Record<DomainId, "L" | "R"> = { ai: "L", data: "L", engineering: "L", automation: "R", ops: "R" };

export default function Gearbox3D({
  progress,
  parts,
  mobile,
  touch,
  clickHint,
  onReady,
}: {
  progress: RefObject<number>;
  parts: PartInfo[];
  mobile: boolean;
  touch: boolean;
  clickHint: string;
  onReady?: () => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const labelEls = useRef<Partial<Record<DomainId, HTMLDivElement | null>>>({});
  const cardRef = useRef<HTMLDivElement>(null);
  const [hover, setHoverState] = useState<DomainId | null>(null);
  const [focus, setFocus] = useState<DomainId | null>(null);
  const [visible, setVisible] = useState(true);
  const shared = useRef<GearboxShared>({ progress: 0, hover: null, focus: null });
  const active = hover ?? focus;
  const activeInfo = parts.find((p) => p.id === active);

  const setHover = (d: DomainId | null) => {
    shared.current.hover = d;
    setHoverState(d);
  };

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(wrap.current!);
    let t = 0;
    const off = onUI("focus_part", (a) => {
      shared.current.focus = a.part;
      setFocus(a.part);
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        shared.current.focus = null;
        setFocus(null);
      }, 3600);
    });
    onReady?.();
    return () => {
      io.disconnect();
      off();
      window.clearTimeout(t);
    };
  }, [onReady]);

  // Overlay is written straight to the DOM every frame (no React renders).
  useEffect(() => {
    const sh = shared.current;
    sh.onFrame = (f) => {
      shared.current.progress = progress.current ?? 0;
      const el = wrap.current;
      const s = svg.current;
      if (!el || !s) return;
      const W = el.clientWidth;
      const H = el.clientHeight;
      const colX = { L: W * 0.05, R: W * 0.95 };
      const placed: { d: DomainId; y: number }[] = [];
      (Object.keys(f.anchors) as DomainId[])
        .sort((a, b) => f.anchors[a]![1] - f.anchors[b]![1])
        .forEach((d) => {
          let y = Math.max(70, Math.min(H - 30, f.anchors[d]![1]));
          const prev = placed.filter((p) => SIDE[p.d] === SIDE[d]).pop();
          if (prev && y - prev.y < 46) y = prev.y + 46;
          placed.push({ d, y });
        });
      const labelOpacity = Math.max(0, 1 - f.assembled * 1.5);
      let paths = "";
      placed.forEach(({ d, y }) => {
        const [ax, ay] = f.anchors[d]!;
        const side = SIDE[d];
        const lx = colX[side];
        const elbow = side === "L" ? lx + 150 : lx - 150;
        const show = f.active ? f.active === d : labelOpacity > 0.01;
        const op = f.active ? (f.active === d ? 1 : 0) : labelOpacity;
        if (show) paths += `<path data-domain="${d}" d="M${ax.toFixed(1)} ${ay.toFixed(1)} L${elbow.toFixed(1)} ${y.toFixed(1)} H${(side === "L" ? lx + 128 : lx - 128).toFixed(1)}" opacity="${op.toFixed(2)}"/><circle data-domain="${d}" cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="2.6" opacity="${op.toFixed(2)}"/>`;
        const lab = labelEls.current[d];
        if (lab) {
          lab.style.transform = `translate3d(${side === "L" ? lx : lx - lab.offsetWidth}px, ${y - 10}px, 0)`;
          lab.style.opacity = op.toFixed(2);
        }
      });
      // overall height dimension, left of the stack
      const dimX = Math.min(f.top[0], f.bottom[0]) - Math.min(W * 0.2, 230);
      const dOp = Math.max(0.35, 1 - f.assembled * 0.6);
      paths += `<g class="dim" opacity="${dOp.toFixed(2)}"><path d="M${dimX - 10} ${f.top[1].toFixed(1)} h20 M${dimX - 10} ${f.bottom[1].toFixed(1)} h20 M${dimX} ${(f.top[1] + 6).toFixed(1)} V${(f.bottom[1] - 6).toFixed(1)}"/><path class="arrow" d="M${dimX} ${f.top[1].toFixed(1)} l-4 9 h8 z M${dimX} ${f.bottom[1].toFixed(1)} l-4 -9 h8 z"/><text transform="translate(${dimX - 10} ${((f.top[1] + f.bottom[1]) / 2).toFixed(1)}) rotate(-90)" text-anchor="middle">H ${f.heightMM}</text></g>`;
      s.innerHTML = paths;
      // info card follows the active part
      const card = cardRef.current;
      if (card && f.active && f.anchors[f.active]) {
        const [ax, ay] = f.anchors[f.active]!;
        const side = SIDE[f.active];
        const x = side === "L" ? Math.min(ax + 28, W - card.offsetWidth - 16) : Math.max(16, ax - card.offsetWidth - 28);
        const y = Math.max(64, Math.min(H - card.offsetHeight - 16, ay - card.offsetHeight / 2));
        card.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
    };
    return () => {
      sh.onFrame = undefined;
    };
  }, [progress]);

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        dpr={[1, touch ? 1.5 : 1.75]}
        camera={{ position: [7.2, 5.4, 8.8], fov: mobile ? 40 : 31, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop={visible ? "always" : "never"}
        onCreated={({ camera }) => camera.lookAt(0, 0.55, 0)}
        style={{ cursor: hover ? "pointer" : undefined }}
        onPointerMissed={() => setHover(null)}
      >
        <Scene shared={shared} setHover={setHover} mobile={mobile} touch={touch} />
      </Canvas>

      <svg ref={svg} className="gearbox-overlay pointer-events-none absolute inset-0 size-full" aria-hidden />

      {!mobile
        ? parts.map((p, i) => (
            <div
              key={p.id}
              ref={(el) => {
                labelEls.current[p.id] = el;
              }}
              data-domain={p.id}
              className="pointer-events-none absolute left-0 top-0 will-change-transform"
              style={{ opacity: 0 }}
              aria-hidden
            >
              <p className="mono-label whitespace-nowrap !text-[10px]">
                <span className="!text-[var(--d)]">{String(i + 1).padStart(2, "0")}</span> · {p.label}
              </p>
              <p className="whitespace-nowrap text-[12px] text-dim">{p.part}</p>
            </div>
          ))
        : null}

      <div
        ref={cardRef}
        data-domain={activeInfo?.id}
        className={`panel-blur pointer-events-none absolute left-0 top-0 w-[290px] rounded-[16px] p-4 shadow-[0_0_0_1px_rgb(var(--d-rgb,var(--glow))/0.5),0_20px_60px_-20px_rgb(0_0_0/0.6),0_0_40px_-12px_rgb(var(--d-rgb,var(--glow))/0.6)] transition-opacity duration-200 ${activeInfo ? "opacity-100" : "opacity-0"}`}
        aria-live="polite"
      >
        {activeInfo ? (
          <>
            <p className="mono-label !text-[var(--d)]">{activeInfo.label}</p>
            <p className="mt-0.5 text-[13px] text-dim">{activeInfo.part}</p>
            <ul className="mt-3 space-y-1.5 text-[13.5px] leading-snug text-fg">
              {activeInfo.highlights.map((h) => (
                <li key={h} className="flex gap-2">
                  <span className="mt-[0.6em] h-px w-2.5 shrink-0 bg-[var(--d)]" />
                  {h}
                </li>
              ))}
            </ul>
            {!touch ? <p className="mono-label mt-3 !text-[9.5px]">{clickHint} →</p> : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
