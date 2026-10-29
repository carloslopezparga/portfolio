"use client";

import { useEffect } from "react";
import { useLenis } from "@/components/providers/SmoothScroll";
import { getPrefs } from "@/lib/prefs";
import { onUI } from "@/lib/ui-bus";

const HL_MS = 1900;

const inView = (el: Element) => {
  const r = el.getBoundingClientRect();
  return r.bottom > 56 && r.top < window.innerHeight;
};

/**
 * Runs the page-level UI actions shared by the agent, clicks and ⌘K:
 * scroll_to, highlight, open_project (scroll; the switcher opens it) and
 * download_cv. focus_part, filter_domain and open_booking are handled by the
 * components that own them.
 */
export function UIActionHost() {
  const lenis = useLenis();

  useEffect(() => {
    let clear = 0;
    let delayed = 0;

    const scrollTo = (target: HTMLElement | 0, center = false) => {
      const reduced = getPrefs().reduced;
      if (target === 0) {
        if (lenis) lenis.scrollTo(0, { duration: 1.1 });
        else window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
        return;
      }
      const r = target.getBoundingClientRect();
      const offset = center ? -(window.innerHeight - r.height) / 2 : 0;
      if (lenis) lenis.scrollTo(target, { offset, duration: 1.1 });
      else window.scrollTo({ top: window.scrollY + r.top + offset, behavior: reduced ? "auto" : "smooth" });
    };

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
        const el = document.getElementById("systems");
        if (el && !inView(el)) scrollTo(el);
      }),
      onUI("download_cv", ({ lang }) => {
        const a = document.createElement("a");
        a.href = `/api/cv?lang=${lang}`;
        a.download = "";
        document.body.append(a);
        a.click();
        a.remove();
      }),
    ];
    return () => {
      offs.forEach((off) => off());
      window.clearTimeout(clear);
      window.clearTimeout(delayed);
    };
  }, [lenis]);

  return null;
}
