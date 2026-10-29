"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Locale } from "@/content/types";
import { openMenu, openPalette, preloadPalette } from "@/lib/palette";
import { currentSheet, useSheet } from "@/lib/sheet";
import { Glyph } from "@/components/ui/icons";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ScrollGear } from "./ScrollGear";

export interface HeaderProps {
  lang: Locale;
  initials: string;
  name: string;
  total: number;
  nav: { id: string; sheet: number; label: string }[];
  labels: { command: string; menu: string; lang: string; dark: string; light: string; top: string };
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Fixed bar. Desktop: monogram, sections, ⌘K, language and theme. Phones:
 * monogram and "Menu" (full-screen menu). A small gear turns with the scroll
 * next to the current section number. Transparent over the top of the page,
 * a translucent material once it moves.
 */
export function Header({ lang, initials, name, total, nav, labels }: HeaderProps) {
  const sheet = useSheet();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mac, setMac] = useState(true);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- platform is only known on the client
    setMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent));
    // which section is under the middle of the viewport
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) currentSheet.set(Number((e.target as HTMLElement).dataset.sheet) || 1);
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    document.querySelectorAll<HTMLElement>("[data-sheet]").forEach((el) => io.observe(el));
    return () => {
      window.removeEventListener("scroll", on);
      io.disconnect();
    };
  }, []);

  const other: Locale = lang === "en" ? "es" : "en";
  const otherHref = other === "en" ? "/" : "/es";

  return (
    <header data-scrolled={scrolled || undefined} className="site-header fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-3 px-4 sm:px-8">
        <a href="#top" title={labels.top} className="flex items-center gap-2.5 rounded-[12px] py-1 pr-2 text-fg">
          <span aria-hidden className="ai-tile grid size-8 place-items-center rounded-[10px] text-[11.5px] font-semibold tracking-[0.02em] text-white">
            {initials}
          </span>
          <span className="sr-only text-[14.5px] font-medium tracking-[-0.01em] sm:not-sr-only">{name}</span>
        </a>

        <span className="mono-label flex items-center gap-1.5 !text-[10px]" aria-hidden>
          <ScrollGear className="size-4 text-dim" />
          {pad(sheet)}/{pad(total)}
        </span>

        <nav aria-label="Main" className="ml-4 hidden items-center gap-0.5 lg:flex">
          {nav.map((n) => {
            const on = n.sheet === sheet;
            return (
              <a
                key={n.id}
                href={`#${n.id}`}
                aria-current={on ? "true" : undefined}
                className={`rounded-full px-3 py-1.5 text-[13.5px] transition-colors duration-200 ${on ? "bg-[rgb(var(--glow)/0.12)] text-fg" : "text-muted hover:text-fg"}`}
              >
                {n.label}
              </a>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={openPalette}
            onPointerEnter={preloadPalette}
            onFocus={preloadPalette}
            aria-keyshortcuts="Meta+K Control+K"
            className="hidden h-9 items-center gap-2 rounded-full pl-3 pr-2 text-[13px] text-muted shadow-[inset_0_0_0_1px_var(--line-strong)] transition-colors duration-200 hover:text-fg lg:flex"
          >
            <Glyph name="search" className="size-4" />
            <span className="sr-only">{labels.command}</span>
            <kbd aria-hidden className="rounded-md px-1.5 py-0.5 font-mono text-[10.5px] text-dim shadow-[inset_0_0_0_1px_var(--line)]">
              {mac ? "⌘K" : "Ctrl K"}
            </kbd>
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
            className="hidden h-9 min-w-9 place-items-center rounded-full px-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted shadow-[inset_0_0_0_1px_var(--line-strong)] transition-colors duration-200 hover:text-fg lg:grid"
          >
            {other}
            <span className="sr-only normal-case"> · {labels.lang}</span>
          </Link>
          <span className="hidden lg:block">
            <ThemeToggle labels={{ dark: labels.dark, light: labels.light }} />
          </span>
          <button
            type="button"
            onClick={openMenu}
            aria-haspopup="dialog"
            className="flex h-10 items-center gap-2 rounded-full pl-3.5 pr-4 text-[14px] font-medium text-fg shadow-[inset_0_0_0_1px_var(--line-strong)] lg:hidden"
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
