"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ComponentProps } from "react";

const SitePalette = dynamic(() => import("./SitePalette"), { ssr: false });

/**
 * Keeps cmdk and Motion out of the first load: the palette is fetched on the
 * first ⌘K (or click on the header button) and opens as soon as it mounts.
 * From then on it handles ⌘K itself.
 */
export function PaletteLauncher(props: ComponentProps<typeof SitePalette>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setMounted(true);
      }
    };
    const onOpen = () => setMounted(true);
    const preload = () => void import("./SitePalette");
    window.addEventListener("keydown", onKey);
    window.addEventListener("palette:open", onOpen);
    window.addEventListener("palette:preload", preload);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("palette:open", onOpen);
      window.removeEventListener("palette:preload", preload);
    };
  }, [mounted]);

  return mounted ? <SitePalette {...props} /> : null;
}
