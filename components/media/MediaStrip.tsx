"use client";

import Image from "next/image";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { MediaItem } from "@/lib/media";
import { usePrefs } from "@/lib/prefs";

const MediaLightbox = lazy(() => import("./MediaLightbox"));

export interface MediaLabels {
  title: string;
  video: string;
  close: string;
  prev: string;
  next: string;
}

const MAX = 8;
const isVideo = (m: MediaItem) => m.kind !== "image";

function PlayGlyph() {
  return (
    <span className="media-play" aria-hidden>
      <svg viewBox="0 0 16 16" className="size-3" fill="currentColor">
        <path d="M5 3.5v9l7.5-4.5z" />
      </svg>
    </span>
  );
}

/**
 * A row of thumbnails under a card (nothing at all when the card has no
 * media). Grey until hovered; local videos play muted on hover, or while on
 * screen on touch devices. Everything opens in the lightbox, which is only
 * downloaded on the first click.
 */
export function MediaStrip({ items, alt, labels, className = "" }: { items: MediaItem[]; alt: string; labels: MediaLabels; className?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const thumbs = useRef<(HTMLButtonElement | null)[]>([]);
  const { touch } = usePrefs();
  const shown = items.slice(0, MAX);
  const more = items.length - shown.length;

  // Touch: no hover, so colour and motion come with being on screen.
  useEffect(() => {
    const list = listRef.current;
    if (!touch || !list) return;
    const io = new IntersectionObserver(
      ([e]) => {
        list.toggleAttribute("data-inview", e.isIntersecting);
        list.querySelectorAll("video").forEach((v) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()));
      },
      { threshold: 0.6 },
    );
    io.observe(list);
    return () => io.disconnect();
  }, [touch]);

  const video = (btn: HTMLElement) => btn.querySelector("video");

  return (
    <>
      <ul ref={listRef} className={`media-strip ${className}`} aria-label={labels.title}>
        {shown.map((m, i) => {
          const name = m.caption ?? (isVideo(m) ? `${alt} · ${labels.video}` : alt);
          return (
            <li key={m.kind === "image" || m.kind === "video" ? m.src : m.id}>
              <button
                ref={(el) => {
                  thumbs.current[i] = el;
                }}
                type="button"
                className="media-thumb"
                aria-label={`${name} (${i + 1}/${items.length})`}
                aria-haspopup="dialog"
                onClick={() => setOpen(i)}
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") video(e.currentTarget)?.play().catch(() => {});
                }}
                onPointerLeave={(e) => {
                  const v = video(e.currentTarget);
                  if (v && !touch) v.pause();
                }}
              >
                {m.kind === "image" ? (
                  <Image src={m.src} alt="" fill sizes="128px" className="object-cover" />
                ) : m.kind === "video" ? (
                  <video src={m.src} poster={m.poster} muted loop playsInline preload="none" aria-hidden tabIndex={-1} />
                ) : m.poster ? (
                  <Image src={m.poster} alt="" fill sizes="128px" className="object-cover" />
                ) : null}
                {isVideo(m) ? <PlayGlyph /> : null}
                {more > 0 && i === shown.length - 1 ? <span className="media-more">+{more}</span> : null}
              </button>
            </li>
          );
        })}
      </ul>
      {open !== null ? (
        <Suspense fallback={null}>
          <MediaLightbox
            items={items}
            start={open}
            alt={alt}
            labels={labels}
            onClose={(last) => {
              setOpen(null);
              // After the modal is gone: until then the page behind it is inert.
              requestAnimationFrame(() => thumbs.current[Math.min(last, shown.length - 1)]?.focus());
            }}
          />
        </Suspense>
      ) : null}
    </>
  );
}
