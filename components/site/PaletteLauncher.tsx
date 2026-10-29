"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import type { SiteActionProps } from "./siteActions";

const SitePalette = dynamic(() => import("./SitePalette"), { ssr: false });
const MobileMenu = dynamic(() => import("./MobileMenu"), { ssr: false });

/**
 * Keeps cmdk and Motion out of the first load: the ⌘K palette (desktop) is
 * fetched on the first ⌘K or click on the header button, and opens as soon as
 * it mounts; from then on it handles ⌘K itself. "Menu" on phones mounts the
 * full-screen menu instead.
 */
export function PaletteLauncher(props: SiteActionProps) {
  const [palette, setPalette] = useState(false);
  const [menu, setMenu] = useState(false);
  const closeMenu = useCallback(() => setMenu(false), []);

  useEffect(() => {
    const onMenu = () => setMenu(true);
    window.addEventListener("menu:open", onMenu);
    if (palette) return () => window.removeEventListener("menu:open", onMenu);
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette(true);
      }
    };
    const onOpen = () => setPalette(true);
    const preload = () => void import("./SitePalette");
    window.addEventListener("keydown", onKey);
    window.addEventListener("palette:open", onOpen);
    window.addEventListener("palette:preload", preload);
    return () => {
      window.removeEventListener("menu:open", onMenu);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("palette:open", onOpen);
      window.removeEventListener("palette:preload", preload);
    };
  }, [palette]);

  return (
    <>
      {palette ? <SitePalette {...props} /> : null}
      {menu ? <MobileMenu {...props} onClose={closeMenu} /> : null}
    </>
  );
}
