"use client";

import dynamic from "next/dynamic";
import { useMotionValueEvent, useScroll } from "motion/react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { usePrefs } from "@/lib/prefs";
import { MechanismFallback } from "./MechanismFallback";

const Mechanism3D = dynamic(() => import("./Mechanism3D"), { ssr: false });

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Hero option B: exploded mechanism that assembles while the hero is scrolled
 * (sticky stage inside a taller section). three.js loads only when the hero
 * is near the viewport; the SVG drawing covers loading, no-WebGL and reduced motion.
 */
export function HeroB({ children, partLabels, readout }: { children: ReactNode; partLabels: string[]; readout: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const { reduced, touch } = usePrefs();
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);
  const [mobile, setMobile] = useState(false);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progress.current = v;
    if (readoutRef.current) readoutRef.current.textContent = String(Math.round(Math.min(1, v * 1.25) * 100)).padStart(3, "0");
  });

  useEffect(() => {
    const mq = matchMedia("(max-width: 767px)");
    const set = () => setMobile(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  useEffect(() => {
    if (reduced || !hasWebGL()) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(sectionRef.current!);
    return () => io.disconnect();
  }, [reduced]);

  const onReady = useCallback(() => setReady(true), []);
  const show3D = load && !reduced;

  return (
    <section ref={sectionRef} className={reduced ? "relative" : "relative h-[220vh]"}>
      <div className={reduced ? "relative min-h-[100svh] overflow-hidden" : "sticky top-0 h-[100svh] overflow-hidden"}>
        <div className="absolute inset-x-0 top-[8%] h-[52%] md:inset-y-0 md:left-[42%] md:right-[-4%] md:top-0 md:h-auto">
          <MechanismFallback
            labels={partLabels}
            className={`absolute inset-0 m-auto h-full max-h-[80%] w-full max-w-[760px] transition-opacity duration-700 ${show3D && ready ? "opacity-0" : "opacity-100"}`}
          />
          {show3D ? <Mechanism3D progress={progress} labels={partLabels} mobile={mobile} touch={touch} onReady={onReady} /> : null}
        </div>
        {children}
        {!reduced ? (
          <div className="mono-label pointer-events-none absolute bottom-10 right-5 z-10 hidden text-right sm:block md:bottom-14 md:right-12">
            {readout} <span ref={readoutRef} className="tabular text-fg">000</span>%
          </div>
        ) : null}
      </div>
    </section>
  );
}
