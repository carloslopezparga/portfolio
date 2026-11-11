"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Clip } from "@/lib/media";
import { usePrefs } from "@/lib/prefs";

const SLIDE_MS = 6000;

/**
 * The media of a section's backdrop (see SectionBackdrop; globals.css keeps
 * it at 10 % and grey). Nothing loads until the section is near the screen.
 * A video plays muted, in a loop, only while the section is on screen
 * (several: one after another); photos cross-fade every few seconds. With
 * reduced motion: the video's poster or first frame, or the first photo, still.
 */
export function BackdropMedia({ videos, images }: { videos: Clip[]; images: string[] }) {
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const { reduced } = usePrefs();
  const [near, setNear] = useState(false);
  const [seen, setSeen] = useState(false);
  const [index, setIndex] = useState(0);
  const count = videos.length || images.length;

  useEffect(() => {
    const el = box.current!;
    const nearIO = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "100% 0px" });
    const seenIO = new IntersectionObserver(([e]) => setSeen(e.isIntersecting));
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
    if (seen && !reduced) v.play().catch(() => {});
    else v.pause();
  }, [seen, reduced, near, index]);

  useEffect(() => {
    if (videos.length || images.length < 2 || !seen || reduced) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % images.length), SLIDE_MS);
    return () => window.clearInterval(t);
  }, [videos.length, images.length, seen, reduced]);

  const clip = videos[index % Math.max(1, videos.length)];
  return (
    <div ref={box} className="section-backdrop" aria-hidden>
      {!near ? null : clip ? (
        <video key={index} ref={video} muted playsInline loop={count === 1} autoPlay={!reduced} preload="auto" poster={clip.poster} onEnded={() => setIndex((i) => (i + 1) % count)} className="absolute inset-0 size-full object-cover">
          {clip.webm ? <source src={clip.webm} type="video/webm" /> : null}
          {clip.mp4 ? <source src={clip.mp4} type="video/mp4" /> : null}
        </video>
      ) : (
        images.map((src, i) => (i === index || i === (index + count - 1) % count ? <Image key={src} src={src} alt="" fill sizes="100vw" quality={50} className={`object-cover transition-opacity duration-[1600ms] ${i === index ? "opacity-100" : "opacity-0"}`} /> : null))
      )}
    </div>
  );
}
