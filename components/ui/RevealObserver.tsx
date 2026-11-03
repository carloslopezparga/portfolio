"use client";

import { useEffect } from "react";
import { getPrefs } from "@/lib/prefs";

/**
 * Reveals .reveal elements (opacity + a 24 px rise, see globals.css) once
 * they come into view. Watches the DOM, so client components that mount
 * later are picked up too. Reduced motion: CSS shows everything at once.
 */
export function RevealObserver() {
  useEffect(() => {
    const show = (el: Element) => el.setAttribute("data-in", "");
    if (getPrefs().reduced || !("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach(show);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) {
            show(e.target);
            io.unobserve(e.target);
          }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const watch = (root: ParentNode) => root.querySelectorAll(".reveal:not([data-in])").forEach((el) => io.observe(el));
    watch(document);
    const mo = new MutationObserver((records) => {
      for (const r of records) r.addedNodes.forEach((n) => n instanceof Element && (n.matches(".reveal:not([data-in])") ? io.observe(n) : watch(n)));
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
  return null;
}
