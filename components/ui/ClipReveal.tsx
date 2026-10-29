"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { EASE } from "@/lib/motion";

const SHAPES = {
  up: { from: "inset(100% 0% 0% 0%)", to: "inset(0% 0% 0% 0%)" },
  left: { from: "inset(0% 100% 0% 0%)", to: "inset(0% 0% 0% 0%)" },
  iris: { from: "circle(0% at 50% 50%)", to: "circle(75% at 50% 50%)" },
  blinds: { from: "inset(50% 0% 50% 0%)", to: "inset(0% 0% 0% 0%)" },
} as const;

/** Image (or anything) revealed through an animated clip-path mask, with a counter-zoom inside. */
export function ClipReveal({ children, shape = "up", className, delay = 0 }: { children: ReactNode; shape?: keyof typeof SHAPES; className?: string; delay?: number }) {
  const s = SHAPES[shape];
  return (
    <motion.div
      className={`overflow-hidden ${className ?? ""}`}
      initial={{ clipPath: s.from }}
      whileInView={{ clipPath: s.to }}
      viewport={{ once: true, margin: "0px 0px -18% 0px" }}
      transition={{ duration: 1.25, ease: EASE.out, delay }}
    >
      <motion.div
        className="size-full"
        initial={{ scale: 1.22 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "0px 0px -18% 0px" }}
        transition={{ duration: 1.6, ease: EASE.out, delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
