import { BALLS, boxFaces, CORES, FIN, iso, LAYERS, slabFaces, tracePath, TRACES } from "@/lib/chip";

const S = LAYERS.substrate;
const I = LAYERS.interposer;
const D = LAYERS.die;
const H = LAYERS.sink;

function Slab({ faces }: { faces: ReturnType<typeof slabFaces> }) {
  return (
    <>
      <polygon points={faces.left} className="chip-l" />
      <polygon points={faces.right} className="chip-r" />
      <polygon points={faces.top} className="chip-t" />
    </>
  );
}

/**
 * The AI chip in an exploded isometric view, as line art: BGA balls,
 * substrate, interposer with its traces, the die with 8 cores and the heat
 * sink with its fins. Pure SVG (no JavaScript); each layer is a group so it
 * can be animated (Phase: pulses along the traces, cores lighting up).
 */
export function ChipArt({ className, title }: { className?: string; title: string }) {
  const iTop = I.z + I.h;
  const dTop = D.z + D.h;
  const finStep = (H.d * 2 - FIN.t) / (FIN.count - 1);
  return (
    <svg viewBox="-190 -332 380 450" className={`chip-art ${className ?? ""}`} role="img" aria-label={title}>
      <g className="chip-layer" data-layer="balls">
        {BALLS.map(([x, y]) => {
          const [cx, cy] = iso(x, y, S.z - 5);
          return <circle key={`${x},${y}`} cx={cx.toFixed(1)} cy={cy.toFixed(1)} r="3.6" className="chip-ball" />;
        })}
      </g>

      <g className="chip-layer" data-layer="substrate">
        <Slab faces={slabFaces(S)} />
        <polygon points={boxFaces(-30, -30, 30, 30, S.z + S.h, 0).top} className="chip-pad" />
      </g>

      <g className="chip-layer" data-layer="interposer">
        <Slab faces={slabFaces(I)} />
        {TRACES.map((t, i) => (
          <path key={i} d={tracePath(t, iTop)} className="chip-trace" />
        ))}
        {TRACES.map((t, i) => (
          <path key={`p${i}`} d={tracePath(t, iTop)} pathLength={100} className="chip-pulse" style={{ ["--pd" as string]: `${((i * 0.37) % 4).toFixed(2)}s`, ["--pc" as string]: `var(--pulse-${i % 4})` }} />
        ))}
      </g>

      <g className="chip-layer" data-layer="die">
        <Slab faces={slabFaces(D)} />
        {CORES.map((c, i) => (
          <polygon key={i} points={boxFaces(c.x0, c.y0, c.x1, c.y1, dTop, 0).top} className="chip-core" style={{ ["--ci" as string]: i, ["--core-c" as string]: `var(--pulse-${i % 4})` }} />
        ))}
      </g>

      <g className="chip-layer" data-layer="sink">
        <Slab faces={slabFaces(H)} />
        {Array.from({ length: FIN.count }, (_, k) => {
          const y0 = -H.d + k * finStep;
          const f = boxFaces(-H.w + 4, y0, H.w - 4, y0 + FIN.t, H.z + H.h, FIN.h);
          return (
            <g key={k}>
              <polygon points={f.right} className="chip-r" />
              <polygon points={f.left} className="chip-l" />
              <polygon points={f.top} className="chip-t" />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
