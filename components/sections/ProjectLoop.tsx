"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Locale, ProjectId } from "@/content/types";
import type { Clip } from "@/lib/media";
import { usePrefs } from "@/lib/prefs";
import { useTheme } from "@/lib/theme";
import { ProjectArt } from "./ProjectArt";

/**
 * The top of a project's card. From 768 px: a short clip of the project,
 * muted and in a loop (public/media/projects/<id>/loop…, one per theme; see
 * lib/media.ts). Until the card is near the screen, and with reduced motion
 * or without JavaScript, only its poster shows (painted by CSS, in the
 * page's theme); the clip plays only while the card is on screen. Phones: the
 * clip is a recording of the desktop card and cannot be read at that size, so
 * they get the live illustration instead (its main fragment, large: see
 * .frag-main), and never load the clip or its poster. No clip for a theme:
 * the live illustration everywhere. `?live-art` in the address always shows
 * it (scripts/record-project-loops.mjs records the clips from it).
 */
export function ProjectLoop({ id, lang, clips }: { id: ProjectId; lang: Locale; clips: Record<"light" | "dark", Clip | null> }) {
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const theme = useTheme();
  const { reduced } = usePrefs();
  const [near, setNear] = useState(false);
  const [seen, setSeen] = useState(false);
  const [live, setLive] = useState(false);
  const has = clips.light !== null && clips.dark !== null;

  useEffect(() => {
    // (read after hydration: the server does not know the address's query)
    const t = window.setTimeout(() => setLive(new URLSearchParams(window.location.search).has("live-art")), 0);
    const el = box.current;
    if (!el) return () => window.clearTimeout(t);
    const nearIO = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "60% 40%" });
    const seenIO = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.2 });
    nearIO.observe(el);
    seenIO.observe(el);
    return () => {
      window.clearTimeout(t);
      nearIO.disconnect();
      seenIO.disconnect();
    };
  }, [has, live]);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (seen) v.play().catch(() => {});
    else v.pause();
  }, [seen, near, theme, reduced]);

  if (!has || live) return <ProjectArt id={id} lang={lang} />;
  const clip = clips[theme]!;
  return (
    <>
      <ProjectArt id={id} lang={lang} className="md:hidden" />
      <div
        ref={box}
        className="project-loop relative aspect-[16/10] overflow-hidden rounded-t-[var(--radius-card)] max-md:hidden"
        style={{ "--poster-light": clips.light!.poster ? `url(${clips.light!.poster})` : "none", "--poster-dark": clips.dark!.poster ? `url(${clips.dark!.poster})` : "none" } as CSSProperties}
        aria-hidden
      >
        {near && !reduced ? (
          <video key={theme} ref={video} muted autoPlay loop playsInline preload="metadata" poster={clip.poster} className="absolute inset-0 size-full object-cover">
            {clip.webm ? <source src={clip.webm} type="video/webm" /> : null}
            {clip.mp4 ? <source src={clip.mp4} type="video/mp4" /> : null}
          </video>
        ) : null}
      </div>
    </>
  );
}
