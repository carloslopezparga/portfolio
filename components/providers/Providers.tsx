"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { ensurePointer, initGyro } from "@/lib/pointer";
import { usePrefs } from "@/lib/prefs";
import { SmoothScroll } from "./SmoothScroll";
import { HoverGlow } from "@/components/ui/HoverGlow";
import { Backdrop } from "@/components/background/Backdrop";

/** Shared shell for every page. No animation library here: it stays tiny. */
export function Providers({ children }: { children: ReactNode }) {
  const { touch } = usePrefs();

  useEffect(() => {
    ensurePointer();
    if (touch) initGyro();
  }, [touch]);

  return (
    <SmoothScroll>
      <Backdrop />
      {children}
      <HoverGlow />
    </SmoothScroll>
  );
}
