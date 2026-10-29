"use client";

import { motion, useAnimate, useInView, useSpring } from "motion/react";
import { useEffect, useRef } from "react";
import { DUR, EASE, SPRING, STAGGER } from "@/lib/motion";

const CURVES = [
  { key: "out", label: "ease.out", use: "Reveals, hovers, todo lo que entra", e: EASE.out },
  { key: "inOut", label: "ease.inOut", use: "Paneles, layout, cambios de estado", e: EASE.inOut },
  { key: "in", label: "ease.in", use: "Salidas", e: EASE.in },
] as const;

const DURS = [
  { k: "press", v: DUR.press },
  { k: "hover", v: DUR.hover },
  { k: "base", v: DUR.base },
  { k: "reveal", v: DUR.reveal },
  { k: "slow", v: DUR.slow },
];

function Curve({ e }: { e: readonly number[] }) {
  const [x1, y1, x2, y2] = e;
  const P = (x: number, y: number) => `${8 + x * 64} ${72 - y * 64}`;
  return (
    <svg viewBox="0 0 80 80" className="size-16 shrink-0 md:size-20" aria-hidden>
      <rect x="8" y="8" width="64" height="64" className="fill-none stroke-line" />
      <path d={`M${P(0, 0)} L${P(x1, y1)} M${P(1, 1)} L${P(x2, y2)}`} className="stroke-subtle" strokeDasharray="2 2" />
      <path d={`M${P(0, 0)} C${P(x1, y1)} ${P(x2, y2)} ${P(1, 1)}`} className="fill-none stroke-accent" strokeWidth="1.5" />
      <circle cx={8 + x1 * 64} cy={72 - y1 * 64} r="2" className="fill-ice" />
      <circle cx={8 + x2 * 64} cy={72 - y2 * 64} r="2" className="fill-ice" />
    </svg>
  );
}

export function MotionTokens() {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const inView = useInView(scope, { once: true, margin: "0px 0px -20% 0px" });
  const boxRef = useRef<HTMLDivElement>(null);
  const sx = useSpring(0, SPRING.pointer);
  const sy = useSpring(0, SPRING.pointer);

  const play = () => {
    const tracks = scope.current.querySelectorAll<HTMLElement>("[data-track]");
    tracks.forEach((t, i) => {
      const dot = t.querySelector("[data-dot]")!;
      const w = t.clientWidth - 14;
      animate(dot, { x: [0, w] }, { duration: DUR.slow, ease: CURVES[i].e as [number, number, number, number] });
    });
    scope.current.querySelectorAll<HTMLElement>("[data-dur]").forEach((bar) => {
      animate(bar, { scaleX: [0, 1] }, { duration: Number(bar.dataset.dur), ease: EASE.out });
    });
    animate("[data-stagger]", { y: [18, 0], opacity: [0, 1] }, { duration: DUR.reveal, ease: EASE.out, delay: (i) => i * STAGGER.item });
  };

  useEffect(() => {
    if (inView) play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <div ref={scope} className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-[var(--radius-card)] p-6 shadow-[inset_0_0_0_1px_var(--line)]">
        <div className="flex items-center justify-between">
          <p className="mono-label">Curvas</p>
          <button type="button" onClick={play} className="mono-label !text-fg underline decoration-line-strong underline-offset-4 hover:decoration-accent">
            Reproducir
          </button>
        </div>
        <div className="mt-5 space-y-5">
          {CURVES.map((c) => (
            <div key={c.key} className="flex items-center gap-4">
              <Curve e={c.e} />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[12px] text-fg">
                  {c.label} <span className="text-dim">[{c.e.join(", ")}]</span>
                </p>
                <p className="text-[13px] text-dim">{c.use}</p>
                <div data-track className="relative mt-3 h-3.5 rounded-full bg-surface-2 shadow-[inset_0_0_0_1px_var(--line)]">
                  <span data-dot className="absolute left-0 top-0 size-3.5 rounded-full bg-accent shadow-[0_0_12px_rgb(var(--glow))]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6">
        <div className="rounded-[var(--radius-card)] p-6 shadow-[inset_0_0_0_1px_var(--line)]">
          <p className="mono-label">Duraciones</p>
          <div className="mt-4 space-y-3">
            {DURS.map((d) => (
              <div key={d.k} className="grid grid-cols-[70px_1fr_56px] items-center gap-3">
                <span className="font-mono text-[12px] text-fg">{d.k}</span>
                <span className="relative h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <span data-dur={d.v} className="absolute inset-y-0 left-0 origin-left rounded-full bg-accent" style={{ width: `${(d.v / DUR.slow) * 100}%` }} />
                </span>
                <span className="mono-label tabular text-right">{Math.round(d.v * 1000)}ms</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-[var(--radius-card)] p-6 shadow-[inset_0_0_0_1px_var(--line)]">
            <p className="mono-label">Stagger · {STAGGER.item * 1000}ms</p>
            <div className="mt-5 grid grid-cols-7 gap-1.5">
              {Array.from({ length: 14 }, (_, i) => (
                <span key={i} data-stagger className="aspect-square rounded-[5px] bg-surface-2 shadow-[inset_0_0_0_1px_var(--line-strong)]" />
              ))}
            </div>
          </div>
          <div
            ref={boxRef}
            className="relative overflow-hidden rounded-[var(--radius-card)] p-6 shadow-[inset_0_0_0_1px_var(--line)]"
            onPointerMove={(e) => {
              const r = boxRef.current!.getBoundingClientRect();
              sx.set(e.clientX - r.left - r.width / 2);
              sy.set(e.clientY - r.top - r.height / 2);
            }}
            onPointerLeave={() => {
              sx.set(0);
              sy.set(0);
            }}
          >
            <p className="mono-label">Muelle del puntero</p>
            <p className="mt-1 text-[13px] text-dim">Mueve el cursor aquí dentro</p>
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <motion.span style={{ x: sx, y: sy }} className="size-5 rounded-full bg-accent shadow-[0_0_18px_rgb(var(--glow))]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
