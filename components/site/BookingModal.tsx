"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect, useRef } from "react";
import { useLenis } from "@/components/providers/SmoothScroll";
import { useTheme } from "@/lib/theme";

/**
 * Cal.com inline embed in a themed dialog. Everything about the booking is
 * handled by Cal.com; this site never sees or stores it.
 */
export default function BookingModal({
  open,
  onClose,
  link,
  origin,
  labels,
}: {
  open: boolean;
  onClose: () => void;
  link: string;
  origin?: string;
  labels: { title: string; note: string; close: string };
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const theme = useTheme();
  const lenis = useLenis();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      lenis?.stop();
    } else if (!open && d.open) {
      d.close();
    }
    if (!open) lenis?.start();
  }, [open, lenis]);

  useEffect(() => {
    let cancelled = false;
    getCalApi({ namespace: "book" }).then((cal) => {
      if (cancelled) return;
      cal("ui", {
        theme,
        hideEventTypeDetails: false,
        layout: "month_view",
        cssVarsPerTheme: {
          dark: { "cal-brand": "#4c8dff", "cal-bg": "#0d1017", "cal-bg-emphasis": "#141821" },
          light: { "cal-brand": "#0066cc" },
        },
      });
    });
    return () => {
      cancelled = true;
    };
  }, [theme]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-label={labels.title}
      className="booking m-auto h-[min(760px,92svh)] w-[min(980px,94vw)] max-w-none overflow-hidden rounded-[22px] bg-surface p-0 text-fg shadow-[0_0_0_1px_var(--line-strong),0_40px_120px_-20px_rgb(0_0_0/0.7)] backdrop:bg-[rgb(2_3_6/0.6)] backdrop:backdrop-blur-[2px]"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 border-b border-line px-5 py-3">
          <span className="size-1.5 rounded-full bg-[var(--ai)] shadow-[0_0_8px_rgb(var(--ai-rgb))]" aria-hidden />
          <h2 className="text-[15px] font-medium">{labels.title}</h2>
          <p className="mono-label ml-2 hidden !text-[10px] sm:block">{labels.note}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label={labels.close}
            className="ml-auto grid size-8 place-items-center rounded-full text-muted shadow-[inset_0_0_0_1px_var(--line-strong)] hover:text-fg"
          >
            <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto" data-lenis-prevent>
          <Cal namespace="book" calLink={link} calOrigin={origin} config={{ theme, layout: "month_view" }} style={{ width: "100%", height: "100%", overflow: "auto" }} />
        </div>
      </div>
    </dialog>
  );
}
