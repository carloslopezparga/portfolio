"use client";

import { motion } from "motion/react";
import { useId } from "react";
import { getPrefs } from "@/lib/prefs";
import { switchTheme, useTheme } from "@/lib/theme";

/** Sun/moon that morphs; the new theme is revealed as a circle from the button. */
export function ThemeToggle({ className, labels = { dark: "Dark", light: "Light" } }: { className?: string; labels?: { dark: string; light: string } }) {
  const theme = useTheme();
  const dark = theme === "dark";
  const maskId = `moon-${useId().replace(/:/g, "")}`;

  return (
    <button
      type="button"
      aria-label={dark ? labels.light : labels.dark}
      className={`grid size-9 place-items-center rounded-full text-fg shadow-[inset_0_0_0_1px_var(--line-strong)] transition-hover hover:shadow-[inset_0_0_0_1px_rgb(var(--glow)),0_0_18px_-4px_rgb(var(--glow))] ${className ?? ""}`}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const x = e.clientX || r.left + r.width / 2;
        const y = e.clientY || r.top + r.height / 2;
        switchTheme(dark ? "light" : "dark", x, y, getPrefs().reduced);
      }}
    >
      <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <mask id={maskId}>
          <rect width="24" height="24" fill="#fff" />
          <motion.circle r="6" fill="#000" initial={false} animate={{ cx: dark ? 17 : 30, cy: dark ? 7 : -6 }} transition={{ duration: 0.5 }} />
        </mask>
        <motion.circle
          cx="12"
          cy="12"
          fill="currentColor"
          stroke="none"
          mask={`url(#${maskId})`}
          initial={false}
          animate={{ r: dark ? 8 : 4.5 }}
          transition={{ duration: 0.5 }}
        />
        <motion.g initial={false} animate={{ opacity: dark ? 0 : 1, rotate: dark ? -45 : 0, scale: dark ? 0.6 : 1 }} style={{ originX: "12px", originY: "12px" }} transition={{ duration: 0.5 }}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1="12" y1="2.5" x2="12" y2="4.5" transform={`rotate(${a} 12 12)`} />
          ))}
        </motion.g>
      </svg>
    </button>
  );
}
