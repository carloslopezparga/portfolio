"use client";

import { Command } from "cmdk";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useLenis } from "@/components/providers/SmoothScroll";
import { DUR, EASE } from "@/lib/motion";
import { Glyph, type GlyphName } from "./icons";

export interface PaletteItem {
  id: string;
  label: string;
  hint?: string;
  icon?: GlyphName;
  keywords?: string[];
  shortcut?: string;
  disabled?: boolean;
  /** Run while the palette stays open (toggles). Otherwise the palette closes first. */
  keepOpen?: boolean;
  run: () => void | boolean;
}
export interface PaletteGroup {
  heading: string;
  items: PaletteItem[];
}

export { openPalette } from "@/lib/palette";

/**
 * ⌘K / Ctrl+K palette built on cmdk (keyboard model, filtering, a11y) with our
 * own shell and motion. Any element can open it with openPalette().
 */
export function CommandPalette({
  groups,
  placeholder = "Type a command or search…",
  empty = "No results",
  footer,
  initialOpen = false,
}: {
  groups: PaletteGroup[];
  placeholder?: string;
  empty?: string;
  footer?: ReactNode;
  /** Open on mount (when the palette is loaded lazily by the first ⌘K). */
  initialOpen?: boolean;
}) {
  const [open, setOpen] = useState(initialOpen);
  const [query, setQuery] = useState("");
  const restoreRef = useRef<HTMLElement | null>(initialOpen && typeof document !== "undefined" ? (document.activeElement as HTMLElement | null) : null);
  const panelRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  const show = useCallback(() => {
    restoreRef.current = document.activeElement as HTMLElement | null;
    setQuery("");
    setOpen(true);
  }, []);
  const hide = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => {
          if (!o) restoreRef.current = document.activeElement as HTMLElement | null;
          return !o;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("palette:open", show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("palette:open", show);
    };
  }, [show]);

  useEffect(() => {
    if (open) {
      lenis?.stop();
      document.body.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.body.style.overflow = "";
      restoreRef.current?.focus?.();
    }
  }, [open, lenis]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="palette"
          className="fixed inset-0 z-[300] flex items-start justify-center px-4 pt-[14vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DUR.hover }}
          onKeyDown={(e) => {
            if (e.key === "Escape") hide();
            if (e.key === "Tab") e.preventDefault();
          }}
        >
          <div className="absolute inset-0 bg-[rgb(2_3_6/0.55)] backdrop-blur-[2px]" onClick={hide} aria-hidden />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="panel-blur relative w-full max-w-[580px] overflow-hidden rounded-[20px] shadow-[0_0_0_1px_var(--line-strong),0_40px_120px_-20px_rgb(0_0_0/0.7),0_0_60px_-30px_rgb(var(--glow))]"
            initial={{ opacity: 0, y: 12, scale: 0.98, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 8, scale: 0.985, filter: "blur(4px)" }}
            transition={{ duration: DUR.base, ease: EASE.out }}
          >
            <Command label="Command palette" loop className="cmdk">
              <div className="flex items-center gap-3 border-b border-line px-5">
                <Glyph name="search" className="size-4 text-dim" />
                <Command.Input
                  autoFocus
                  value={query}
                  onValueChange={setQuery}
                  placeholder={placeholder}
                  className="h-14 w-full bg-transparent text-[15px] text-fg outline-none placeholder:text-dim"
                />
                <kbd className="mono-label rounded-md px-1.5 py-0.5 shadow-[inset_0_0_0_1px_var(--line-strong)]">esc</kbd>
              </div>
              <Command.List className="max-h-[min(56vh,420px)] overflow-y-auto overscroll-contain p-2" data-lenis-prevent>
                <Command.Empty className="px-4 py-8 text-center text-sm text-dim">{empty}</Command.Empty>
                {groups.map((g) => (
                  <Command.Group
                    key={g.heading}
                    heading={g.heading}
                  >
                    {g.items.map((it) => (
                      <Command.Item
                        key={it.id}
                        value={`${it.label} ${it.id}`}
                        keywords={it.keywords}
                        disabled={it.disabled}
                        onSelect={() => {
                          if (it.keepOpen) {
                            it.run();
                            return;
                          }
                          // Close first: scrolling is locked while the palette is open.
                          hide();
                          window.setTimeout(() => it.run(), 40);
                        }}
                        className="group/item relative flex h-11 cursor-pointer items-center gap-3 rounded-xl px-3 text-[14px] text-muted transition-colors duration-150 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-40 data-[selected=true]:bg-[rgb(var(--glow)/0.1)] data-[selected=true]:text-fg"
                      >
                        <span className="absolute inset-y-2 left-0 w-[2px] scale-y-0 rounded-full bg-accent shadow-[0_0_10px_rgb(var(--glow))] transition-transform duration-200 group-data-[selected=true]/item:scale-y-100" />
                        {it.icon ? <Glyph name={it.icon} className="size-[18px] shrink-0 text-dim group-data-[selected=true]/item:text-accent" /> : null}
                        <span className="flex-1 truncate">{it.label}</span>
                        {it.hint ? <span className="mono-label hidden sm:inline">{it.hint}</span> : null}
                        {it.shortcut ? (
                          <kbd className="mono-label rounded-md px-1.5 py-0.5 shadow-[inset_0_0_0_1px_var(--line-strong)]">{it.shortcut}</kbd>
                        ) : null}
                      </Command.Item>
                    ))}
                  </Command.Group>
                ))}
              </Command.List>
              {footer ? <div className="flex items-center gap-4 border-t border-line px-5 py-3">{footer}</div> : null}
            </Command>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
