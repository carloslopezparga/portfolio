"use client";

import type { ReactNode } from "react";
import { SmoothScroll } from "./SmoothScroll";
import { HoverGlow } from "@/components/ui/HoverGlow";
import { RevealObserver } from "@/components/ui/RevealObserver";
import { Backdrop } from "@/components/background/Backdrop";

/** Shared shell for every page. No animation library here: it stays tiny. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <SmoothScroll>
      <Backdrop />
      {children}
      <HoverGlow />
      <RevealObserver />
    </SmoothScroll>
  );
}
