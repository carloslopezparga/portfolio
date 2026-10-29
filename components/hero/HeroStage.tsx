"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { DomainId } from "@/content/types";
import { usePrefs } from "@/lib/prefs";
import { onUI } from "@/lib/ui-bus";
import { useLenis } from "@/components/providers/SmoothScroll";
import { ExplodedDrawing } from "./ExplodedDrawing";
import { Gearbox2D, type PartInfo } from "./Gearbox2D";

const Gearbox3D = dynamic(() => import("./Gearbox3D"), { ssr: false });

const DESK = "(hover: hover) and (pointer: fine) and (min-width: 900px)";

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Hero stage. Desktop: a sticky stage inside a taller section; scrolling
 * assembles the exploded gearbox (three.js loads after the page is idle, the
 * static parts sheet covers the wait). Phones/tablets: the 2D gearbox.
 */
export function HeroStage({
  parts,
  hintScroll,
  hintTouch,
  clickHint,
  assemblyLabel,
  children,
}: {
  parts: PartInfo[];
  hintScroll: string;
  hintTouch: string;
  clickHint: string;
  assemblyLabel: string;
  children: ReactNode;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const { reduced, touch } = usePrefs();
  const [desk, setDesk] = useState(false);
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    const mq = matchMedia(DESK);
    const set = () => setDesk(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  // Scroll → assembly progress (0 exploded … 1 assembled).
  useEffect(() => {
    const el = sectionRef.current!;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const span = Math.max(1, el.offsetHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, -r.top / span));
      progress.current = p;
      if (readoutRef.current) readoutRef.current.textContent = String(Math.round(Math.min(1, p * 1.25) * 100)).padStart(3, "0");
      if (hintRef.current) hintRef.current.style.opacity = String(Math.max(0, 1 - p * 3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // three.js only on desktop, after the page has settled.
  useEffect(() => {
    if (!desk || reduced || load || !hasWebGL()) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const t = window.setTimeout(() => {
      if (w.requestIdleCallback) w.requestIdleCallback(() => setLoad(true), { timeout: 2000 });
      else setLoad(true);
    }, 900);
    return () => window.clearTimeout(t);
  }, [desk, reduced, load]);

  // The agent's focus_part: bring the gearbox into view first.
  useEffect(
    () =>
      onUI("focus_part", () => {
        const r = sectionRef.current!.getBoundingClientRect();
        if (r.bottom < window.innerHeight * 0.5) {
          if (lenis) lenis.scrollTo(0, { duration: 1.1 });
          else window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
        }
      }),
    [lenis, reduced],
  );

  const show3D = desk && load && !reduced;
  const onReady = useCallback(() => setReady(true), []);

  return (
    <section ref={sectionRef} id="top" data-sheet="1" className="hero-scroll relative">
      <div className="hero-sticky pt-16">
        <div className="relative min-h-[46svh] flex-1">
          {/* desktop */}
          <div className="only-desk absolute inset-0">
            <ExplodedDrawing
              labels={parts.map((p) => ({ id: p.id as DomainId, label: p.label }))}
              className={`absolute inset-0 m-auto h-full max-h-[94%] w-full max-w-[860px] transition-opacity duration-700 ${show3D && ready ? "opacity-0" : "opacity-100"}`}
            />
            {show3D ? <Gearbox3D progress={progress} parts={parts} mobile={false} touch={touch} clickHint={clickHint} onReady={onReady} /> : null}
            {!reduced ? (
              <>
                <p className="mono-label pointer-events-none absolute right-6 top-4 text-right md:right-10">
                  {assemblyLabel}{" "}
                  <span ref={readoutRef} className="tabular text-fg">
                    000
                  </span>
                  %
                </p>
                <p ref={hintRef} className="mono-label pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  {hintScroll}
                </p>
              </>
            ) : null}
          </div>
          {/* phones / tablets */}
          <div className="only-mob px-5 pt-2 sm:px-8">
            <Gearbox2D parts={parts} hint={hintTouch} />
          </div>
        </div>
        <div className="relative z-10">{children}</div>
      </div>
    </section>
  );
}
