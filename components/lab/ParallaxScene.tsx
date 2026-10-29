"use client";

import { useEffect, useRef } from "react";
import { gsap, useIsoLayoutEffect } from "@/lib/gsap";
import { gyro, pointer } from "@/lib/pointer";
import { usePrefs } from "@/lib/prefs";

/**
 * Three depth layers. Scroll moves them at different speeds (scrubbed);
 * the cursor — or the gyroscope on phones — offsets them by depth.
 */
export function ParallaxScene() {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced, touch } = usePrefs();

  useIsoLayoutEffect(() => {
    if (reduced) return;
    const root = ref.current!;
    const ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>("[data-depth]").forEach((el) => {
        const d = Number(el.dataset.depth);
        gsap.fromTo(el, { yPercent: d * 22 }, { yPercent: -d * 22, ease: "none", scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true } });
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  useEffect(() => {
    if (reduced) return;
    const root = ref.current!;
    const layers = Array.from(root.querySelectorAll<HTMLElement>("[data-shift]"));
    const off = { x: 0, y: 0 };
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const r = root.getBoundingClientRect();
      const inside = pointer.x > r.left && pointer.x < r.right && pointer.y > r.top && pointer.y < r.bottom;
      const tx = touch ? (gyro.active ? gyro.gx : 0) : inside ? ((pointer.x - r.left) / r.width) * 2 - 1 : 0;
      const ty = touch ? (gyro.active ? gyro.gy : 0) : inside ? ((pointer.y - r.top) / r.height) * 2 - 1 : 0;
      const k = 1 - Math.exp(-5 * dt);
      off.x += (tx - off.x) * k;
      off.y += (ty - off.y) * k;
      layers.forEach((el) => {
        const d = Number(el.dataset.shift);
        el.style.transform = `translate3d(${(-off.x * d * 28).toFixed(2)}px, ${(-off.y * d * 18).toFixed(2)}px, 0)`;
      });
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      if (e.isIntersecting) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(root);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [reduced, touch]);

  return (
    <div ref={ref} className="relative h-[78vh] min-h-[520px] overflow-hidden rounded-[28px] shadow-[inset_0_0_0_1px_var(--line)]">
      {/* far: orbital drawing */}
      <div data-depth="0.25" className="absolute inset-[-12%]">
        <div data-shift="0.3" className="size-full">
          <svg viewBox="0 0 800 600" className="size-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
            {[120, 190, 260, 330].map((r) => (
              <circle key={r} cx="560" cy="250" r={r} className="fill-none stroke-line-strong" strokeDasharray={r % 140 ? "2 6" : undefined} />
            ))}
            <path d="M0 250 H800 M560 0 V600" className="stroke-line" />
            <circle cx="560" cy="250" r="6" className="fill-accent" />
          </svg>
        </div>
      </div>
      {/* mid: headline */}
      <div data-depth="0.6" className="absolute inset-0 flex items-center px-8 md:px-16">
        <div data-shift="0.65">
          <p className="font-display text-[clamp(3rem,11vw,9rem)] leading-[0.88] text-fg/90">
            Depth,
            <br />
            <span className="text-transparent [-webkit-text-stroke:1px_var(--fg)]">not noise.</span>
          </p>
        </div>
      </div>
      {/* near: annotations */}
      <div data-depth="1.1" className="pointer-events-none absolute inset-0">
        <div data-shift="1.2" className="size-full">
          <span className="mono-label absolute left-[62%] top-[18%] rounded-full bg-bg/70 px-3 py-1.5 shadow-[inset_0_0_0_1px_rgb(var(--glow)/0.6)]">Layer 03 · depth 1.1</span>
          <span className="mono-label absolute left-[12%] top-[72%] rounded-full bg-bg/70 px-3 py-1.5 shadow-[inset_0_0_0_1px_var(--line-strong)]">Layer 02 · depth 0.6</span>
          <span className="mono-label absolute left-[70%] top-[80%] rounded-full bg-bg/70 px-3 py-1.5 shadow-[inset_0_0_0_1px_var(--line)]">Layer 01 · depth 0.25</span>
          <span className="absolute left-[58%] top-[30%] size-2 rounded-full bg-ice shadow-[0_0_14px_rgb(var(--glow))]" />
          <span className="absolute left-[24%] top-[22%] size-1.5 rounded-full bg-accent" />
        </div>
      </div>
    </div>
  );
}
