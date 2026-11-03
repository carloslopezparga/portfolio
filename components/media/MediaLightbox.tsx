"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLenis } from "@/components/providers/SmoothScroll";
import type { MediaItem } from "@/lib/media";
import type { MediaLabels } from "./MediaStrip";

const STAGE = { w: "92vw", h: "78svh" };

function embedSrc(m: Extract<MediaItem, { kind: "youtube" | "vimeo" }>) {
  if (m.kind === "youtube") return `https://www.youtube-nocookie.com/embed/${m.id}?autoplay=1&rel=0&playsinline=1`;
  return `https://player.vimeo.com/video/${m.id}?${m.hash ? `h=${m.hash}&` : ""}autoplay=1&dnt=1&title=0&byline=0&portrait=0`;
}

function Slide({ m, alt }: { m: MediaItem; alt: string }) {
  if (m.kind === "image") {
    const ratio = m.width / m.height;
    return (
      <div className="relative overflow-hidden rounded-[14px]" style={{ width: `min(${STAGE.w}, calc(${STAGE.h} * ${ratio}))`, aspectRatio: `${m.width} / ${m.height}` }}>
        <Image src={m.src} alt={m.caption ?? alt} fill sizes="92vw" className="object-contain" />
      </div>
    );
  }
  if (m.kind === "video")
    return <video key={m.src} src={m.src} poster={m.poster} controls autoPlay playsInline className="max-h-[78svh] max-w-[92vw] rounded-[14px] bg-black" />;
  return (
    <div className="overflow-hidden rounded-[14px] bg-black" style={{ width: `min(${STAGE.w}, calc(${STAGE.h} * 16 / 9))`, aspectRatio: "16 / 9" }}>
      <iframe
        key={m.id}
        src={embedSrc(m)}
        title={m.caption ?? alt}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        className="size-full"
      />
    </div>
  );
}

/**
 * Full-screen viewer for a card's photos and videos: ← → and Esc on the
 * keyboard, swipe on touch, the counter and caption underneath. A modal
 * <dialog>, so focus stays inside and the page behind is inert.
 */
export default function MediaLightbox({
  items,
  start,
  alt,
  labels,
  onClose,
}: {
  items: MediaItem[];
  start: number;
  alt: string;
  labels: MediaLabels;
  onClose: (last: number) => void;
}) {
  const [i, setI] = useState(start);
  const ref = useRef<HTMLDialogElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const lenis = useLenis();
  const m = items[i];
  const many = items.length > 1;

  const go = useCallback((d: number) => setI((n) => (n + d + items.length) % items.length), [items.length]);

  useEffect(() => {
    const d = ref.current!;
    d.showModal();
    lenis?.stop();
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
      lenis?.start();
    };
  }, [lenis]);

  return (
    <dialog
      ref={ref}
      aria-label={labels.title}
      className="media-lightbox m-0 h-svh max-h-none w-screen max-w-none bg-transparent p-0 text-fg backdrop:bg-[rgb(3_4_8/0.9)] backdrop:backdrop-blur-md"
      onCancel={(e) => {
        e.preventDefault();
        onClose(i);
      }}
      onKeyDown={(e) => {
        if (!many) return;
        if (e.key === "ArrowRight") go(1);
        else if (e.key === "ArrowLeft") go(-1);
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose(i);
      }}
    >
      <div
        className="grid h-full grid-rows-[auto_1fr_auto]"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose(i);
        }}
      >
        <div className="flex justify-end p-4 md:p-6">
          <button type="button" autoFocus onClick={() => onClose(i)} aria-label={labels.close} className="btn btn-ghost !size-11 justify-center !p-0">
            <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
              <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
            </svg>
          </button>
        </div>

        <div
          className="grid min-h-0 touch-pan-y place-items-center px-3"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose(i);
          }}
          onPointerDown={(e) => {
            if (e.pointerType !== "mouse") swipe.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerUp={(e) => {
            const s = swipe.current;
            swipe.current = null;
            if (!s || !many) return;
            const dx = e.clientX - s.x;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - s.y)) go(dx < 0 ? 1 : -1);
          }}
        >
          <Slide m={m} alt={alt} />
        </div>

        <div className="flex items-center gap-4 p-4 md:p-6">
          <div className="min-w-0 flex-1" aria-live="polite">
            <p className="mono-label text-fg">
              {String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </p>
            {m.caption ? <p className="mt-1 text-[14px] text-muted">{m.caption}</p> : null}
          </div>
          {many ? (
            <div className="flex gap-2">
              <button type="button" onClick={() => go(-1)} aria-label={labels.prev} className="btn btn-ghost !size-11 justify-center !p-0">
                <span aria-hidden>←</span>
              </button>
              <button type="button" onClick={() => go(1)} aria-label={labels.next} className="btn btn-ghost !size-11 justify-center !p-0">
                <span aria-hidden>→</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </dialog>
  );
}
