"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { DUR, EASE } from "@/lib/motion";
import { ensurePointer, initGyro } from "@/lib/pointer";
import { usePrefs } from "@/lib/prefs";
import { SmoothScroll } from "./SmoothScroll";
import { Cursor } from "@/components/ui/Cursor";
import { Backdrop } from "@/components/background/Backdrop";
import { ScrollProgress } from "@/components/ui/ScrollProgress";

export function Providers({ children }: { children: ReactNode }) {
  const { reduced, touch } = usePrefs();

  useEffect(() => {
    ensurePointer();
    if (touch) initGyro();
  }, [touch]);

  return (
    <MotionConfig reducedMotion={reduced ? "always" : "never"} transition={{ duration: DUR.base, ease: EASE.out }}>
      <SmoothScroll>
        <Backdrop />
        <ScrollProgress />
        {children}
        <Cursor />
      </SmoothScroll>
    </MotionConfig>
  );
}
