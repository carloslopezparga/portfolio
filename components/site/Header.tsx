"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Locale } from "@/content/types";
import { openMenu, openPalette, preloadPalette } from "@/lib/palette";
import { Glyph } from "@/components/ui/icons";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export interface HeaderProps {
  lang: Locale;
  initials: string;
  nav: { id: string; label: string }[];
  cv: string;
  labels: { command: string; menu: string; lang: string; dark: string; light: string; top: string; cv: string };
}

/**
 * Floating pill at the top: monogram, sections, ⌘K, ES/EN, theme and a black
 * "CV" button. On phones and tablets: monogram, CV and "Menu" (full screen).
 * The current section is marked while scrolling.
 */
export function Header({ lang, initials, nav, cv, labels }: HeaderProps) {
  const router = useRouter();
  const [current, setCurrent] = useState<string | null>(null);
  const [mac, setMac] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- platform is only known on the client
    setMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(e.target.id);
      },
      { rootMargin: "-45% 0px -55% 0px" },
    );
    document.querySelectorAll<HTMLElement>("main > section[id]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const other: Locale = lang === "en" ? "es" : "en";
  const otherHref = other === "en" ? "/" : "/es";

  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-3 sm:top-4">
      <div className="nav-pill pointer-events-auto flex h-[52px] w-full max-w-[1080px] items-center gap-1 rounded-full py-1.5 pl-1.5 pr-1.5">
        <a href="#top" title={labels.top} className="ai-tile grid size-10 shrink-0 place-items-center rounded-full text-[13px] font-bold tracking-[-0.02em]" style={{ fontFamily: "var(--font-heading)" }}>
          {initials}
          <span className="sr-only">{labels.top}</span>
        </a>

        <nav aria-label="Main" className="ml-2 hidden items-center lg:flex">
          {nav.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              aria-current={current === n.id ? "true" : undefined}
              className={`rounded-full px-3 py-2 text-[14px] font-medium transition-colors duration-200 ${current === n.id ? "text-fg" : "text-muted hover:text-fg"}`}
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={openPalette}
            onPointerEnter={preloadPalette}
            onFocus={preloadPalette}
            aria-keyshortcuts="Meta+K Control+K"
            title={mac ? "⌘K" : "Ctrl K"}
            className="hidden size-9 place-items-center rounded-full text-muted transition-colors duration-200 hover:bg-[var(--btn-2)] hover:text-fg lg:grid"
          >
            <Glyph name="search" className="size-[18px]" />
            <span className="sr-only">{labels.command}</span>
          </button>
          <Link
            href={otherHref}
            prefetch={false}
            hrefLang={other}
            lang={other}
            onClick={(e) => {
              if (!window.location.hash) return;
              e.preventDefault();
              router.push(otherHref + window.location.hash);
            }}
            className="hidden h-9 min-w-9 place-items-center rounded-full px-2 text-[13px] font-semibold uppercase text-muted transition-colors duration-200 hover:bg-[var(--btn-2)] hover:text-fg lg:grid"
          >
            {other}
            <span className="sr-only normal-case"> · {labels.lang}</span>
          </Link>
          <span className="hidden lg:block">
            <ThemeToggle labels={{ dark: labels.dark, light: labels.light }} />
          </span>
          <a href={cv} download className="btn btn-primary btn-sm ml-1 !h-10 !px-4">
            {labels.cv}
          </a>
          <button
            type="button"
            onClick={openMenu}
            aria-haspopup="dialog"
            className="flex h-10 items-center gap-2 rounded-full bg-[var(--btn-2)] pl-3.5 pr-4 text-[14px] font-medium text-fg lg:hidden"
          >
            <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
              <path d="M2.5 5h11M2.5 11h11" />
            </svg>
            {labels.menu}
          </button>
        </div>
      </div>
    </header>
  );
}
