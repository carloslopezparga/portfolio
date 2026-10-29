"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Locale } from "@/content/types";
import { openPalette, preloadPalette } from "@/lib/palette";
import { useSheet } from "@/lib/sheet";
import { Glyph } from "@/components/ui/icons";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ScrollGear } from "./ScrollGear";

export interface HeaderProps {
  lang: Locale;
  initials: string;
  name: string;
  availability: string;
  nav: { id: string; sheet: number; label: string }[];
  labels: { command: string; menu: string; lang: string; dark: string; light: string; top: string };
}

/**
 * Fixed bar: monogram, the five sheets, ⌘K, language and theme. Transparent
 * over the top of the hero, blurred once the page moves. On mobile the
 * navigation lives in the ⌘K palette and the scroll gear shows the sheet.
 */
export function Header({ lang, initials, name, availability, nav, labels }: HeaderProps) {
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
    return () => window.removeEventListener("scroll", on);
  }, []);

  const other: Locale = lang === "en" ? "es" : "en";
  const otherHref = other === "en" ? "/" : "/es";

  return (
    <header
      data-scrolled={scrolled || undefined}
      className="fixed inset-x-0 top-0 z-50 border-b border-transparent transition-[background-color,border-color,backdrop-filter] duration-300 data-[scrolled]:border-line data-[scrolled]:bg-[rgb(var(--bg-rgb)/0.72)] data-[scrolled]:backdrop-blur-xl"
    >
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-3 px-4 sm:px-6 md:px-8">
        <a href="#top" title={labels.top} className="flex items-center gap-2.5 rounded-[10px] py-1 pr-2 text-fg">
          <span aria-hidden className="grid size-8 place-items-center rounded-[9px] font-mono text-[11px] font-medium tracking-[0.06em] shadow-[inset_0_0_0_1px_var(--line-strong)]">
            {initials}
          </span>
          <span className="sr-only text-[14px] font-medium tracking-[-0.01em] sm:not-sr-only">{name}</span>
        </a>

        {/* mobile: current sheet + gear */}
        <span className="mono-label flex items-center gap-1.5 !text-[10px] lg:hidden" aria-hidden>
          <ScrollGear className="size-4 text-dim" />
          {String(sheet).padStart(2, "0")}/06
        </span>

        <nav aria-label="Main" className="ml-6 hidden items-center gap-1 lg:flex">
          {nav.map((n) => {
            const on = n.sheet === sheet;
            return (
              <a
                key={n.id}
                href={`#${n.id}`}
                aria-current={on ? "true" : undefined}
                className={`group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13.5px] transition-colors duration-200 ${on ? "text-fg" : "text-muted hover:text-fg"}`}
              >
                <span className={`font-mono text-[10px] transition-colors ${on ? "text-accent" : "text-dim"}`}>{String(n.sheet).padStart(2, "0")}</span>
                {n.label}
              </a>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <span className="mono-label mr-2 hidden items-center gap-2 !text-[10px] 2xl:flex">
            <span className="size-1.5 rounded-full bg-[var(--ai)] shadow-[0_0_8px_rgb(var(--ai-rgb))]" aria-hidden />
            {availability}
          </span>
          <button
            type="button"
            onClick={openPalette}
            onPointerEnter={preloadPalette}
            onFocus={preloadPalette}
            aria-keyshortcuts="Meta+K Control+K"
            className="flex h-9 items-center gap-2 rounded-full pl-3 pr-2 text-[13px] text-muted shadow-[inset_0_0_0_1px_var(--line-strong)] transition-colors duration-200 hover:text-fg"
          >
            <Glyph name="search" className="size-4" />
            <span className="lg:hidden">{labels.menu}</span>
            <span className="sr-only">{labels.command}</span>
            <kbd aria-hidden className="hidden rounded-md px-1.5 py-0.5 font-mono text-[10.5px] text-dim shadow-[inset_0_0_0_1px_var(--line)] lg:inline">{mac ? "⌘K" : "Ctrl K"}</kbd>
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
            className="grid h-9 min-w-9 place-items-center rounded-full px-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted shadow-[inset_0_0_0_1px_var(--line-strong)] transition-colors duration-200 hover:text-fg"
          >
            {other}
            <span className="sr-only normal-case"> · {labels.lang}</span>
          </Link>
          <ThemeToggle labels={{ dark: labels.dark, light: labels.light }} />
        </div>
      </div>
    </header>
  );
}
