"use client";

import { useEffect } from "react";
import { useLenis } from "@/components/providers/SmoothScroll";
import { getPrefs } from "@/lib/prefs";
import { CV_URL } from "@/lib/site";
import { onUI } from "@/lib/ui-bus";

const HL_MS = 1900;
/** Where a scrolled-to element lands: just under the floating pill (--nav-offset in globals.css). */
const navOffset = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-offset")) || 88;
/** A section lands by its label (the small grey line over the title), not by its padding. */
const anchorOf = (el: HTMLElement) => (el.matches("main > section") ? (el.querySelector<HTMLElement>(".eyebrow") ?? el) : el);

const inView = (el: Element) => {
  const r = el.getBoundingClientRect();
  return r.bottom > 56 && r.top < window.innerHeight;
};

/**
 * Runs the page-level UI actions shared by the agent, clicks and ⌘K:
 * scroll_to, highlight, open_project (scroll; the row opens it), download_cv
 * and open_booking: the booking page (NEXT_PUBLIC_BOOKING_URL) in a new tab.
 * A browser only lets a page open a tab right after a click or a key press,
 * and the agent's answer can arrive later than that: if the tab is blocked,
 * the page goes to Contact and points at the «Book 15 min» button instead.
 */
export function UIActionHost({ booking }: { booking: string | null }) {
  const lenis = useLenis();

  useEffect(() => {
    let clear = 0;
    let delayed = 0;

    /**
     * Scroll an element to the reading position (under the nav pill, or
     * centred). Sections off screen skip layout (content-visibility), so their
     * height is only estimated until they render on the way: when the scroll
     * ends, measure again and finish the last stretch if needed.
     */
    const scrollTo = (el: HTMLElement | 0, center = false, pass = 0): void => {
      const reduced = getPrefs().reduced;
      if (el === 0) {
        if (lenis) lenis.scrollTo(0, { duration: 1.1 });
        else window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
        return;
      }
      const target = center ? el : anchorOf(el);
      const top = navOffset();
      const want = () => (center ? Math.max(top, (window.innerHeight - target.getBoundingClientRect().height) / 2) : top);
      const check = () => {
        if (pass < 2 && Math.abs(target.getBoundingClientRect().top - want()) > 6) scrollTo(el, center, pass + 1);
      };
      const delta = target.getBoundingClientRect().top - want();
      if (lenis) lenis.scrollTo(window.scrollY + delta, { duration: pass ? 0.5 : 1.1, onComplete: check });
      else {
        window.scrollTo({ top: window.scrollY + delta, behavior: reduced || pass ? "auto" : "smooth" });
        window.setTimeout(check, reduced || pass ? 50 : 900);
      }
    };

    // In-page links (nav, buttons): same scroll, with the correction pass.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as Element).closest?.<HTMLAnchorElement>('a[href^="#"]');
      const id = a?.getAttribute("href")?.slice(1);
      if (!a || !id) return;
      const el = id === "top" ? 0 : document.getElementById(id);
      if (el === null) return;
      e.preventDefault();
      scrollTo(el);
      history.replaceState(null, "", `#${id}`);
    };
    document.addEventListener("click", onClick);

    // Opening the page at a #hash: the browser jumps before the sections above
    // know their real height (content-visibility), so it lands short. Redo the
    // jump instantly, measuring again until it settles.
    let landing = 0;
    const id = decodeURIComponent(window.location.hash.slice(1));
    const hashTarget = id && id !== "top" ? document.getElementById(id) : null;
    if (hashTarget) {
      let tries = 0;
      const land = () => {
        const target = anchorOf(hashTarget);
        const delta = target.getBoundingClientRect().top - navOffset();
        if (Math.abs(delta) > 4) window.scrollTo({ top: window.scrollY + delta, behavior: "auto" });
        if (++tries < 6 && Math.abs(delta) > 4) landing = window.setTimeout(land, 120);
      };
      landing = window.setTimeout(land, 60);
    }

    const highlight = (id: string) => {
      const main = document.querySelector("main");
      const shown = Array.from(document.querySelectorAll(`[data-target-id="${CSS.escape(id)}"]`)).filter((el) => el.getClientRects().length > 0);
      if (!main || !shown.length) return;
      const visible = shown.filter(inView);
      const targets = visible.length ? visible : [shown[0]];
      if (!visible.length) scrollTo(shown[0] as HTMLElement, true);

      window.clearTimeout(clear);
      window.clearTimeout(delayed);
      document.querySelectorAll("[data-hl]").forEach((el) => el.removeAttribute("data-hl"));
      delayed = window.setTimeout(
        () => {
          targets.forEach((el) => el.setAttribute("data-hl", ""));
          main.dataset.focusing = "";
          clear = window.setTimeout(() => {
            targets.forEach((el) => el.removeAttribute("data-hl"));
            delete main.dataset.focusing;
          }, HL_MS);
        },
        visible.length ? 0 : 700,
      );
    };

    const offs = [
      onUI("scroll_to", ({ sectionId }) => {
        const el = sectionId === "top" ? 0 : document.getElementById(sectionId);
        if (el !== null) scrollTo(el);
      }),
      onUI("highlight", ({ targetId }) => highlight(targetId)),
      onUI("open_project", () => {
        const el = document.getElementById("projects");
        if (el && !inView(el)) scrollTo(el);
      }),
      onUI("open_booking", () => {
        if (!booking) return;
        const tab = window.open(booking, "_blank");
        if (tab) tab.opener = null;
        else highlight("booking");
      }),
      onUI("download_cv", () => {
        const a = document.createElement("a");
        a.href = CV_URL;
        a.download = "";
        document.body.append(a);
        a.click();
        a.remove();
      }),
    ];
    return () => {
      document.removeEventListener("click", onClick);
      window.clearTimeout(landing);
      offs.forEach((off) => off());
      window.clearTimeout(clear);
      window.clearTimeout(delayed);
    };
  }, [lenis, booking]);

  return null;
}
