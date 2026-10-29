"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { gyro, pointer } from "@/lib/pointer";

/* ------------------------------------------------------------------ */
/* Exploded planetary gearbox in blue wireframe (hidden lines removed). */
/* Scroll assembles it; once assembled it runs. The cursor steers it.   */
/* ------------------------------------------------------------------ */

const M = 0.0833; // gear module
const Z_SUN = 12;
const Z_PLANET = 12;
const Z_RING = 36;
const R_SUN = (M * Z_SUN) / 2;
const R_PLANET = (M * Z_PLANET) / 2;
const R_RING = (M * Z_RING) / 2;
const ORBIT = R_SUN + R_PLANET;

function toothed(path: THREE.Path, z: number, rp: number, inward = false) {
  const tip = inward ? rp - M : rp + M;
  const root = inward ? rp + 1.25 * M : rp - 1.25 * M;
  const step = (Math.PI * 2) / z;
  for (let i = 0; i < z; i++) {
    const a = i * step;
    const pts: [number, number][] = [
      [root, a],
      [tip, a + step * 0.2],
      [tip, a + step * 0.42],
      [root, a + step * 0.62],
    ];
    pts.forEach(([r, ang], j) => {
      const x = Math.cos(ang) * r;
      const y = Math.sin(ang) * r;
      if (i === 0 && j === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    });
  }
  path.closePath();
}

function circle(path: THREE.Path, x: number, y: number, r: number) {
  path.absarc(x, y, r, 0, Math.PI * 2, false);
}

function extrude(shape: THREE.Shape, depth: number) {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 10 });
  g.rotateX(-Math.PI / 2);
  g.translate(0, -depth / 2, 0);
  return g;
}

function gear(z: number, rp: number, bore: number, depth: number) {
  const s = new THREE.Shape();
  toothed(s, z, rp);
  const h = new THREE.Path();
  circle(h, 0, 0, bore);
  s.holes.push(h);
  return extrude(s, depth);
}

function ringGear(depth: number) {
  const s = new THREE.Shape();
  circle(s, 0, 0, R_RING + 0.42);
  const h = new THREE.Path();
  toothed(h, Z_RING, R_RING, true);
  s.holes.push(h);
  return extrude(s, depth);
}

function plate(r: number, holes: { x: number; y: number; r: number }[], depth: number) {
  const s = new THREE.Shape();
  circle(s, 0, 0, r);
  holes.forEach((p) => {
    const h = new THREE.Path();
    circle(h, p.x, p.y, p.r);
    s.holes.push(h);
  });
  return extrude(s, depth);
}

const PLANET_ANGLES = [Math.PI / 2, Math.PI / 2 + (Math.PI * 2) / 3, Math.PI / 2 + (Math.PI * 4) / 3];

type PartDef = { key: string; geo: THREE.BufferGeometry; y0: number; y1: number; order: number; spread?: boolean; anchor: THREE.Vector3 };

function useParts() {
  return useMemo(() => {
    const bolts = Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
      return { x: Math.cos(a) * 1.95, y: Math.sin(a) * 1.95, r: 0.07 };
    });
    const pins = PLANET_ANGLES.map((a) => ({ x: Math.cos(a) * ORBIT, y: Math.sin(a) * ORBIT, r: 0.09 }));
    const shaft = new THREE.CylinderGeometry(0.13, 0.13, 3.1, 8, 1);
    const parts: PartDef[] = [
      { key: "base", geo: plate(2.2, [{ x: 0, y: 0, r: 0.24 }, ...bolts], 0.16), y0: -0.42, y1: -2.7, order: 0, anchor: new THREE.Vector3(2.2, 0, 0) },
      { key: "ring", geo: ringGear(0.42), y0: 0, y1: -1.3, order: 1, anchor: new THREE.Vector3(R_RING + 0.42, 0, 0) },
      { key: "planet", geo: gear(Z_PLANET, R_PLANET, 0.11, 0.36), y0: 0, y1: 0.35, order: 2, spread: true, anchor: new THREE.Vector3(0, 0.18, 0) },
      { key: "sun", geo: gear(Z_SUN, R_SUN, 0.15, 0.46), y0: 0, y1: 1.35, order: 3, anchor: new THREE.Vector3(R_SUN + M, 0, 0) },
      { key: "carrier", geo: plate(1.32, [{ x: 0, y: 0, r: 0.2 }, ...pins], 0.13), y0: 0.31, y1: 2.45, order: 4, anchor: new THREE.Vector3(1.32, 0, 0) },
      { key: "shaft", geo: shaft, y0: 0.35, y1: 3.7, order: 5, anchor: new THREE.Vector3(0.13, 1.55, 0) },
    ];
    return parts.map((p) => ({ ...p, edges: new THREE.EdgesGeometry(p.geo, 18) }));
  }, []);
}

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

function readColors() {
  const cs = getComputedStyle(document.documentElement);
  return { accent: cs.getPropertyValue("--accent").trim(), ice: cs.getPropertyValue("--ice").trim() };
}

function Scene({
  progress,
  labelRefs,
  mobile,
  touch,
  onReady,
}: {
  progress: RefObject<number>;
  labelRefs: RefObject<(HTMLDivElement | null)[]>;
  mobile: boolean;
  touch: boolean;
  onReady?: () => void;
}) {
  const parts = useParts();
  const root = useRef<THREE.Group>(null);
  const carrierSpin = useRef<THREE.Group>(null);
  const objs = useRef<Record<string, THREE.Object3D[]>>({});
  const { camera, size } = useThree();
  const state = useRef({ sun: 0, carrier: 0, rotY: 0, rx: 0, ry: 0, idle: 0, assembled: 0 });
  const tmp = useMemo(() => new THREE.Vector3(), []);

  const mats = useMemo(() => {
    const c = readColors();
    return {
      line: new THREE.LineBasicMaterial({ color: c.accent, transparent: true, opacity: 0.9 }),
      lineHot: new THREE.LineBasicMaterial({ color: c.ice, transparent: true, opacity: 0.95 }),
      occluder: new THREE.MeshBasicMaterial({ colorWrite: false, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
      face: new THREE.MeshBasicMaterial({ color: c.accent, transparent: true, opacity: 0.035, depthWrite: false, side: THREE.DoubleSide }),
    };
  }, []);

  useEffect(() => {
    const mo = new MutationObserver(() => {
      const c = readColors();
      mats.line.color.set(c.accent);
      mats.face.color.set(c.accent);
      mats.lineHot.color.set(c.ice);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    onReady?.();
    return () => mo.disconnect();
  }, [mats, onReady]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const st = state.current;
    const p = progress.current ?? 0;

    // assembly
    let assembledSum = 0;
    for (const part of parts) {
      const k = smooth(clamp01((p * 1.25 - part.order * 0.09) / 0.55));
      assembledSum += k;
      const list = objs.current[part.key] ?? [];
      list.forEach((o, i) => {
        o.position.y = part.y1 + (part.y0 - part.y1) * k;
        if (part.spread) {
          const a = PLANET_ANGLES[i];
          const r = ORBIT * (1 + (1 - k) * 0.45);
          o.position.x = Math.cos(a) * r;
          o.position.z = -Math.sin(a) * r;
        }
      });
    }
    st.assembled = assembledSum / parts.length;

    // kinematics (ring fixed): carrier = sun/4, planets spin -sun/2 absolute
    const w = 0.25 + 2.1 * smooth(st.assembled);
    st.sun += w * dt;
    st.carrier += (w / 4) * dt;
    (objs.current.sun ?? []).forEach((o) => (o.rotation.y = st.sun));
    if (carrierSpin.current) carrierSpin.current.rotation.y = st.carrier;
    (objs.current.planet ?? []).forEach((o, i) => (o.rotation.y = -0.75 * st.sun + i * 0.3));
    (objs.current.shaft ?? []).forEach((o) => (o.rotation.y = st.sun));

    // steering
    st.idle += dt * 0.07;
    const tx = touch ? (gyro.active ? gyro.gx : 0) : pointer.inside ? pointer.nx : 0;
    const ty = touch ? (gyro.active ? gyro.gy : 0) : pointer.inside ? pointer.ny : 0;
    const k = 1 - Math.exp(-3 * dt);
    st.ry += (tx * 0.45 - st.ry) * k;
    st.rx += (ty * 0.16 - st.rx) * k;
    if (root.current) {
      root.current.rotation.y = -0.5 + st.idle + st.ry;
      root.current.rotation.x = st.rx;
    }

    // callouts
    const labels = labelRefs.current ?? [];
    parts.forEach((part, i) => {
      const el = labels[i];
      const o = objs.current[part.key]?.[0];
      if (!el || !o) return;
      tmp.copy(part.anchor).applyMatrix4(o.matrixWorld).project(camera);
      const x = (tmp.x * 0.5 + 0.5) * size.width;
      const y = (-tmp.y * 0.5 + 0.5) * size.height;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      el.style.opacity = String(Math.max(0, 1 - st.assembled * 1.6));
    });
  });

  const register = (key: string, i: number) => (o: THREE.Object3D | null) => {
    if (!o) return;
    (objs.current[key] ??= [])[i] = o;
  };

  const renderPart = (part: (typeof parts)[number], i: number, key = part.key) => (
    <group ref={register(key, i)} key={`${key}-${i}`}>
      <mesh geometry={part.geo} material={mats.occluder} />
      <mesh geometry={part.geo} material={mats.face} />
      <lineSegments geometry={part.edges} material={key === "sun" || key === "shaft" ? mats.lineHot : mats.line} />
    </group>
  );

  const byKey = (k: string) => parts.find((p) => p.key === k)!;

  return (
    <group ref={root} scale={mobile ? 0.78 : 1} position={[0, mobile ? 0.9 : 0, 0]}>
      {renderPart(byKey("base"), 0)}
      {renderPart(byKey("ring"), 0)}
      {renderPart(byKey("sun"), 0)}
      {renderPart(byKey("shaft"), 0)}
      <group ref={carrierSpin}>
        {PLANET_ANGLES.map((_, i) => renderPart(byKey("planet"), i))}
        {renderPart(byKey("carrier"), 0)}
      </group>
      {/* assembly axis */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[new Float32Array([0, -3.4, 0, 0, 4.4, 0]), 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#5b6270" transparent opacity={0.45} />
      </lineSegments>
    </group>
  );
}

export default function Mechanism3D({
  progress,
  labels,
  mobile,
  touch,
  onReady,
}: {
  progress: RefObject<number>;
  labels: string[];
  mobile: boolean;
  touch: boolean;
  onReady?: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(wrapRef.current!);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <Canvas
        dpr={[1, touch ? 1.5 : 2]}
        camera={{ position: [7, 5.6, 8.6], fov: mobile ? 40 : 33, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop={visible ? "always" : "never"}
        onCreated={({ camera }) => camera.lookAt(0, 0.35, 0)}
      >
        <Scene progress={progress} labelRefs={labelRefs} mobile={mobile} touch={touch} onReady={onReady} />
      </Canvas>
      {!mobile ? (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {labels.map((l, i) => (
            <div
              key={l}
              ref={(el) => {
                labelRefs.current[i] = el;
              }}
              className="absolute left-0 top-0 flex items-center gap-2 will-change-transform"
              style={{ opacity: 0 }}
            >
              <span className="size-1.5 rounded-full bg-ice shadow-[0_0_8px_rgb(var(--glow))]" />
              <span className="h-px w-10 bg-[var(--line-strong)]" />
              <span className="mono-label whitespace-nowrap !text-[10px]">
                <span className="text-ice">{String(i + 1).padStart(2, "0")}</span> · {l}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
