"use client";

import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { usePrefs } from "@/lib/prefs";
import { BRANDS, brandColor, glyphPath, type BrandName, type GlyphName } from "@/components/ui/icons";

if (typeof window !== "undefined") gsap.registerPlugin(DrawSVGPlugin, MotionPathPlugin);

const Y = 118;
const XS = [72, 237, 402, 567];
const BY = 292;

type NodeDef = { x: number; y: number; size: number; brand?: BrandName; glyph?: GlyphName; label: string; step?: string };

function Node({ n, i, dashed }: { n: NodeDef; i: number; dashed?: boolean }) {
  const h = n.size / 2;
  const icon = n.brand ? BRANDS[n.brand] : null;
  const s = n.size * 0.42;
  const color = icon ? brandColor(icon) : "var(--accent)";
  return (
    <g data-node={i}>
      <rect
        x={n.x - h}
        y={n.y - h}
        width={n.size}
        height={n.size}
        rx={n.size * 0.27}
        className="fill-surface-2 stroke-line-strong"
        strokeWidth="1"
        strokeDasharray={dashed ? "4 4" : undefined}
      />
      <rect
        data-glow
        x={n.x - h}
        y={n.y - h}
        width={n.size}
        height={n.size}
        rx={n.size * 0.27}
        className="fill-accent/10 stroke-accent"
        strokeWidth="1.25"
        opacity="0"
        style={{ filter: "drop-shadow(0 0 10px rgb(var(--glow) / 0.65))" }}
      />
      <g transform={`translate(${n.x - s / 2} ${n.y - s / 2}) scale(${s / 24})`}>
        {icon ? (
          <>
            <path d={icon.path} className="fill-dim" />
            <path data-color d={icon.path} style={{ fill: color }} opacity="0" />
          </>
        ) : (
          <>
            <path d={glyphPath(n.glyph!)} fill="none" className="stroke-dim" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path data-color data-draw d={glyphPath(n.glyph!)} fill="none" className="stroke-accent" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0" />
          </>
        )}
      </g>
      <text x={n.x} y={n.y + h + 20} textAnchor="middle" className="fill-dim font-mono text-[9.5px] uppercase tracking-[0.12em]">
        {n.label}
      </text>
      {n.step ? (
        <text data-step x={n.x} y={n.y - h - 14} textAnchor="middle" opacity="0" className="fill-ice font-mono text-[9.5px] uppercase tracking-[0.12em]">
          {n.step}
        </text>
      ) : null}
    </g>
  );
}

/**
 * Gmail → Claude → digest → my inbox. A packet travels the pipe and each node
 * lights up (grey → brand colour) in sequence; the dashed lane is what is
 * still being built. Loops only while visible.
 */
export function MailFlow({
  labels,
}: {
  labels: { gmail: string; claude: string; digest: string; inbox: string; search: string; telegram: string; tailored: string; building: string; steps: [string, string, string, string] };
}) {
  const ref = useRef<SVGSVGElement>(null);
  const { reduced } = usePrefs();

  const main: NodeDef[] = [
    { x: XS[0], y: Y, size: 60, brand: "gmail", label: labels.gmail, step: labels.steps[0] },
    { x: XS[1], y: Y, size: 60, brand: "claude", label: labels.claude, step: labels.steps[1] },
    { x: XS[2], y: Y, size: 60, glyph: "doc", label: labels.digest, step: labels.steps[2] },
    { x: XS[3], y: Y, size: 60, glyph: "inbox", label: labels.inbox, step: labels.steps[3] },
  ];
  const lane: NodeDef[] = [
    { x: XS[1], y: BY, size: 46, glyph: "search", label: labels.search },
    { x: XS[2], y: BY, size: 46, brand: "telegram", label: labels.telegram },
    { x: XS[3], y: BY, size: 46, glyph: "doc", label: labels.tailored },
  ];
  const pipes = [0, 1, 2].map((i) => `M${XS[i] + 30} ${Y} H${XS[i + 1] - 30}`);

  useEffect(() => {
    const svg = ref.current!;
    const q = <T extends Element>(sel: string) => Array.from(svg.querySelectorAll<T>(sel));
    const nodes = [0, 1, 2, 3].map((i) => svg.querySelector(`[data-node="${i}"]`)!);
    const glow = (i: number) => nodes[i].querySelectorAll("[data-glow], [data-color]:not([data-draw])");
    const draw = (i: number) => nodes[i].querySelectorAll("[data-draw]");
    const step = (i: number) => nodes[i].querySelector("[data-step]");
    const actives = q<SVGPathElement>("[data-active]");
    const packet = svg.querySelector("[data-packet]")!;
    const think = svg.querySelector("[data-think]")!;
    const badge = svg.querySelector("[data-badge]")!;

    if (reduced) {
      gsap.set([...nodes.flatMap((_, i) => [...glow(i), ...draw(i)]), ...nodes.map((_, i) => step(i)), badge], { opacity: 1 });
      gsap.set(actives, { drawSVG: "100%" });
      gsap.set(packet, { opacity: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(actives, { drawSVG: "0%" });
      gsap.set(badge, { scale: 0, opacity: 0, transformOrigin: "50% 50%" });
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5, paused: true, defaults: { ease: "site.out" } });
      const travel = (i: number) => {
        tl.set(packet, { opacity: 1 })
          .to(packet, { motionPath: { path: actives[i], align: actives[i], alignOrigin: [0.5, 0.5] }, duration: 0.75, ease: "site.inOut" })
          .to(actives[i], { drawSVG: "100%", duration: 0.75, ease: "site.inOut" }, "<")
          .set(packet, { opacity: 0 });
      };
      const light = (i: number) => {
        tl.to(glow(i), { opacity: 1, duration: 0.35 }).fromTo(step(i), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.4 }, "<");
        if (draw(i).length) tl.fromTo(draw(i), { opacity: 1, drawSVG: "0%" }, { drawSVG: "100%", duration: 0.7, ease: "site.inOut" }, "<");
      };
      light(0);
      tl.to({}, { duration: 0.25 });
      travel(0);
      light(1);
      tl.to(think, { opacity: 1, duration: 0.2 }, "<")
        .fromTo(think, { rotation: 0 }, { rotation: 300, svgOrigin: `${XS[1]} ${Y}`, duration: 0.9, ease: "site.inOut" }, "<")
        .to(think, { opacity: 0, duration: 0.2 });
      travel(1);
      light(2);
      travel(2);
      light(3);
      tl.to(badge, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2.4)" }, "<0.1");
      tl.to({}, { duration: 1.5 });
      tl.to([...nodes.flatMap((_, i) => [...glow(i), ...draw(i)]), ...nodes.map((_, i) => step(i)), badge], { opacity: 0, duration: 0.5, ease: "site.in" })
        .to(actives, { drawSVG: "0%", duration: 0.5, ease: "site.in" }, "<");

      const io = new IntersectionObserver(([e]) => (e.isIntersecting ? tl.play() : tl.pause()), { threshold: 0.3 });
      io.observe(svg);
      return () => io.disconnect();
    }, svg);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <svg ref={ref} viewBox="0 0 640 360" className="h-auto w-full" role="img" aria-label={`${labels.gmail} → ${labels.claude} → ${labels.digest} → ${labels.inbox}`}>
      {/* main pipe */}
      {pipes.map((d, i) => (
        <g key={i}>
          <path d={d} className="stroke-line-strong" strokeWidth="1" fill="none" />
          <path data-active d={d} className="stroke-accent" strokeWidth="1.5" fill="none" style={{ filter: "drop-shadow(0 0 4px rgb(var(--glow)))" }} />
        </g>
      ))}

      {/* building lane */}
      <path
        d={`M${XS[0]} ${Y + 30} V${BY - 16} Q${XS[0]} ${BY} ${XS[0] + 16} ${BY} H${XS[1] - 23} M${XS[1] + 23} ${BY} H${XS[2] - 23} M${XS[2] + 23} ${BY} H${XS[3] - 23}`}
        className="mail-ants stroke-subtle"
        strokeWidth="1"
        strokeDasharray="3 5"
        fill="none"
      />
      <g transform={`translate(${XS[0] + 14} ${BY - 40})`}>
        <rect width="78" height="20" rx="10" className="fill-none stroke-subtle" strokeDasharray="3 3" />
        <text x="39" y="13.5" textAnchor="middle" className="fill-dim font-mono text-[8.5px] uppercase tracking-[0.14em]">
          {labels.building}
        </text>
      </g>
      {lane.map((n, i) => (
        <g key={i} opacity="0.75">
          <Node n={n} i={10 + i} dashed />
        </g>
      ))}

      {main.map((n, i) => (
        <Node key={i} n={n} i={i} />
      ))}

      {/* Claude thinking arc */}
      <circle data-think cx={XS[1]} cy={Y} r="40" fill="none" className="stroke-ice" strokeWidth="1.25" strokeDasharray="26 226" strokeLinecap="round" opacity="0" />

      {/* inbox badge */}
      <g data-badge>
        <circle cx={XS[3] + 27} cy={Y - 27} r="10" className="fill-accent" style={{ filter: "drop-shadow(0 0 8px rgb(var(--glow)))" }} />
        <text x={XS[3] + 27} y={Y - 23.5} textAnchor="middle" className="fill-on-accent font-mono text-[9px] font-semibold">
          +1
        </text>
      </g>

      <circle data-packet r="4" className="fill-ice" opacity="0" style={{ filter: "drop-shadow(0 0 6px rgb(var(--glow)))" }} />
    </svg>
  );
}
