"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { usePrefs } from "@/lib/prefs";

const Gearbox3D = dynamic(() => import("./Gearbox3D"), { ssr: false });

const DESK = "(hover: hover) and (pointer: fine) and (min-width: 1024px)";

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * The hero's visual. Everyone first sees the 2D gearbox (server-rendered,
 * `children`); on desktop the 3D one loads once the page is idle and fades
 * in over it to play its assembly. Purely decorative.
 */
export function HeroVisual({ children }: { children: ReactNode }) {
  const { reduced, touch } = usePrefs();
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (reduced || load || !matchMedia(DESK).matches || !hasWebGL()) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const t = window.setTimeout(() => {
      if (w.requestIdleCallback) w.requestIdleCallback(() => setLoad(true), { timeout: 2000 });
      else setLoad(true);
    }, 700);
    return () => window.clearTimeout(t);
  }, [reduced, load]);

  const onReady = useCallback(() => setReady(true), []);
  const show3D = load && !reduced;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[260px] sm:max-w-[320px] lg:max-w-[460px]" aria-hidden>
      <div className="hero-halo absolute inset-[-12%] rounded-full" />
      <div className={`absolute inset-[8%] transition-opacity duration-700 ${show3D && ready ? "opacity-0" : "opacity-100"}`}>{children}</div>
      {show3D ? <Gearbox3D touch={touch} onReady={onReady} /> : null}
    </div>
  );
}
