"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { usePrefs } from "@/lib/prefs";

/** The lab still uses Motion everywhere; it gets its own MotionConfig so the reduce toggle applies. */
export function LabMotion({ children }: { children: ReactNode }) {
  const { reduced } = usePrefs();
  return <MotionConfig reducedMotion={reduced ? "always" : "never"}>{children}</MotionConfig>;
}
