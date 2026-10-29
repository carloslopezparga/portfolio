"use client";

import { useEffect, useRef, useState } from "react";
import { useLenis } from "@/components/providers/SmoothScroll";
import { Glyph } from "@/components/ui/icons";
import { useSiteGroups, type SiteActionProps } from "./siteActions";

const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/**
 * Full-screen menu for phones: a search field on top, then the sections, the
 * agent, CV, email, language and theme. Same actions as the ⌘K palette.
 */
export default function MobileMenu({ onClose, ...props }: SiteActionProps & { onClose: () => void }) {
  const groups = useSiteGroups(props);
  const t = props.labels;
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const restore = useRef<HTMLElement | null>(typeof document !== "undefined" ? (document.activeElement as HTMLElement | null) : null);
  const lenis = useLenis();

  useEffect(() => {
    lenis?.stop();
    document.body.style.overflow = "hidden";
    const back = restore.current;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      back?.focus?.();
    };
  }, [lenis, onClose]);

  // Close first (scrolling is locked while the menu is open), then act.
  const pick = (run: () => void | boolean) => {
    onClose();
    window.setTimeout(() => run(), 40);
  };

  const query = norm(q.trim());
  const filtered = groups
    .map((g) => ({ ...g, items: g.items.filter((it) => !query || norm([it.label, it.hint ?? "", ...(it.keywords ?? [])].join(" ")).includes(query)) }))
    .filter((g) => g.items.length);

  return (
    <div role="dialog" aria-modal="true" aria-label={t.navigate} className="mobile-menu material-blur fixed inset-0 z-[300] flex flex-col" data-lenis-prevent>
      <div className="flex items-center gap-2 px-4 pb-3 pt-3">
        <label className="flex h-12 flex-1 items-center gap-3 rounded-full bg-[rgb(var(--surface-rgb)/0.7)] px-4 shadow-[inset_0_0_0_1px_var(--material-line)]">
          <Glyph name="search" className="size-4 shrink-0 text-dim" />
          <span className="sr-only">{t.search}</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.placeholder}
            className="h-full w-full bg-transparent text-[16px] text-fg outline-none placeholder:text-dim"
            enterKeyHint="go"
            onKeyDown={(e) => {
              const first = filtered[0]?.items[0];
              if (e.key === "Enter" && first) pick(first.run);
            }}
          />
        </label>
        <button type="button" onClick={onClose} aria-label={t.close} className="grid size-12 shrink-0 place-items-center rounded-full text-fg shadow-[inset_0_0_0_1px_var(--material-line)]">
          <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto overscroll-contain px-4 pb-10">
        {filtered.length ? (
          filtered.map((g, gi) => (
            <div key={g.heading} className="mt-4">
              <p className="mono-label px-2 pb-1">{g.heading}</p>
              <ul>
                {g.items.map((it) => (
                  <li key={it.id}>
                    <button
                      type="button"
                      onClick={() => pick(it.run)}
                      className={`flex w-full items-center gap-3 rounded-[14px] px-2 text-left text-fg active:bg-[rgb(var(--glow)/0.1)] ${gi === 0 ? "h-12 text-[20px] font-medium tracking-[-0.02em]" : "h-12 text-[16px]"}`}
                    >
                      {gi > 0 && it.icon ? <Glyph name={it.icon} className="size-5 shrink-0 text-dim" /> : null}
                      <span className="flex-1 truncate">{it.label}</span>
                      {it.hint && gi === 0 ? <span className="mono-label">{it.hint}</span> : null}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p className="px-2 pt-8 text-center text-[15px] text-dim">{t.empty}</p>
        )}
      </nav>
    </div>
  );
}
