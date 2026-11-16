"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Clip } from "@/lib/media";
import { usePrefs } from "@/lib/prefs";

/**
 * The background of a project's card: its looping clip, muted, edge to edge
 * (public/media/projects/<id>/loop.*; see lib/media.ts), on every screen
 * size. Until the card is near the screen, and with reduced motion or without
 * JavaScript, only its poster shows (painted by CSS); the clip plays only
 * while the card is on screen. Decorative: the card's text is not in it.
 */
export function ProjectLoop({ clip }: { clip: Clip }) {
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const { reduced } = usePrefs();
  const [near, setNear] = useState(false);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = box.current!;
    const nearIO = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "60% 40%" });
    const seenIO = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.2 });
    nearIO.observe(el);
    seenIO.observe(el);
    return () => {
      nearIO.disconnect();
      seenIO.disconnect();
    };
  }, []);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (seen) v.play().catch(() => {});
    else v.pause();
  }, [seen, near, reduced]);

  return (
    <div ref={box} className="project-loop" style={{ "--poster": clip.poster ? `url(${clip.poster})` : "none" } as CSSProperties} aria-hidden>
      {near && !reduced ? (
        <video ref={video} muted autoPlay loop playsInline preload="metadata" poster={clip.poster} tabIndex={-1}>
          {clip.webm ? <source src={clip.webm} type="video/webm" /> : null}
          {clip.mp4 ? <source src={clip.mp4} type="video/mp4" /> : null}
        </video>
      ) : null}
    </div>
  );
}
