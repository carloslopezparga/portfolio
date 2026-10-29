"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLenis } from "@/components/providers/SmoothScroll";
import { gsap, useIsoLayoutEffect } from "@/lib/gsap";
import { DUR, EASE } from "@/lib/motion";
import { usePrefs } from "@/lib/prefs";
import { Tone } from "./Tone";

export interface LightboxImage {
  src: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
}

/**
 * Gallery (masonry columns with scroll parallax) + lightbox with a
 * shared-element transition (layoutId). Keyboard ← → Esc, swipe/drag to
 * navigate, focus is kept inside and restored.
 */
export function Lightbox({
  images,
  labels = { view: "View", drag: "Drag", close: "Close", prev: "Previous", next: "Next" },
  columns = 3,
}: {
  images: LightboxImage[];
  labels?: { view: string; drag: string; close: string; prev: string; next: string };
  columns?: number;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const [dir, setDir] = useState(0);
  const lenis = useLenis();
  const thumbs = useRef<(HTMLButtonElement | null)[]>([]);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastOpened = useRef<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { reduced } = usePrefs();

  // Columns drift at different speeds while the gallery scrolls past (desktop).
  useIsoLayoutEffect(() => {
    if (reduced) return;
    const grid = gridRef.current!;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      grid.querySelectorAll<HTMLElement>("[data-col]").forEach((col, i) => {
        const d = [-6, 8, -2][i % 3];
        gsap.fromTo(col, { yPercent: -d }, { yPercent: d, ease: "none", scrollTrigger: { trigger: grid, start: "top bottom", end: "bottom top", scrub: true } });
      });
    });
    return () => mm.revert();
  }, [reduced, columns]);

  const cols = Array.from({ length: columns }, (_, c) => images.map((_, i) => i).filter((i) => i % columns === c));

  const go = useCallback(
    (d: number) => {
      setDir(d);
      setIndex((i) => (i === null ? i : (i + d + images.length) % images.length));
    },
    [images.length],
  );
  const close = useCallback(() => setIndex(null), []);

  useEffect(() => {
    if (index === null) {
      lenis?.start();
      document.body.style.overflow = "";
      if (lastOpened.current !== null) thumbs.current[lastOpened.current]?.focus();
      return;
    }
    lenis?.stop();
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, lenis, close, go]);

  const current = index === null ? null : images[index];

  return (
    <>
      <div ref={gridRef} className={`grid gap-4 md:gap-5 ${columns === 3 ? "md:grid-cols-3" : columns === 2 ? "md:grid-cols-2" : ""}`}>
        {cols.map((col, c) => (
          <div key={c} data-col className="flex flex-col gap-4 md:gap-5">
            {col.map((i) => { const img = images[i]; return (
          <button
            key={img.src}
            ref={(el) => {
              thumbs.current[i] = el;
            }}
            type="button"
            data-cursor={labels.view}
            onClick={() => {
              lastOpened.current = i;
              setDir(0);
              setIndex(i);
            }}
            className="group relative block w-full overflow-hidden rounded-[18px] text-left shadow-[0_0_0_1px_var(--line)]"
            style={{ aspectRatio: `${img.width} / ${img.height}` }}
          >
            <motion.div layoutId={`lb-${img.src}`} className="absolute inset-0" transition={{ duration: DUR.base, ease: EASE.inOut }}>
              <Tone className="size-full">
                <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 33vw, 100vw" unoptimized={img.src.endsWith(".svg")} className="object-cover" />
              </Tone>
            </motion.div>
            {img.caption ? (
              <span className="mono-label absolute bottom-3 left-3 rounded-full bg-[rgb(0_0_0/0.45)] px-2.5 py-1 text-[10px] text-white opacity-0 backdrop-blur-sm transition-hover group-hover:opacity-100">
                {img.caption}
              </span>
            ) : null}
          </button>
            ); })}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {current && index !== null ? (
          <motion.div
            key="lb"
            role="dialog"
            aria-modal="true"
            aria-label={current.alt}
            className="fixed inset-0 z-[320] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR.base, ease: EASE.out }}
            onKeyDown={(e) => {
              if (e.key !== "Tab") return;
              const focusables = Array.from(e.currentTarget.querySelectorAll<HTMLElement>("button"));
              const i = focusables.indexOf(document.activeElement as HTMLElement);
              e.preventDefault();
              focusables[(i + (e.shiftKey ? -1 : 1) + focusables.length) % focusables.length]?.focus();
            }}
          >
            <div className="absolute inset-0 bg-[rgb(3_4_8/0.86)] backdrop-blur-md" onClick={close} aria-hidden />

            <motion.div
              key={current.src}
              layoutId={`lb-${current.src}`}
              className="relative z-10 overflow-hidden rounded-[18px] shadow-[0_40px_120px_-20px_rgb(0_0_0/0.8)]"
              style={{
                width: `min(92vw, calc(80vh * ${current.width / current.height}))`,
                aspectRatio: `${current.width} / ${current.height}`,
              }}
              initial={dir ? { x: dir * 80, opacity: 0 } : false}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: DUR.base, ease: EASE.inOut }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={(_, info) => {
                if (info.offset.x < -70) go(1);
                else if (info.offset.x > 70) go(-1);
              }}
              data-cursor={labels.drag}
            >
              <Image src={current.src} alt={current.alt} fill sizes="92vw" unoptimized={current.src.endsWith(".svg")} className="pointer-events-none object-cover" priority />
            </motion.div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-4 p-5 md:p-8">
              <div className="min-w-0">
                <p className="mono-label text-fg">
                  {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
                </p>
                {current.caption ? <p className="mt-1 truncate text-sm text-muted">{current.caption}</p> : null}
              </div>
              <div className="pointer-events-auto flex gap-2">
                <button type="button" onClick={() => go(-1)} aria-label={labels.prev} className="btn btn-ghost !h-11 !w-11 justify-center !p-0">
                  ←
                </button>
                <button type="button" onClick={() => go(1)} aria-label={labels.next} className="btn btn-ghost !h-11 !w-11 justify-center !p-0">
                  →
                </button>
              </div>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label={labels.close}
              className="btn btn-ghost absolute right-5 top-5 z-20 !h-11 !w-11 justify-center !p-0 md:right-8 md:top-8"
            >
              <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
              </svg>
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
