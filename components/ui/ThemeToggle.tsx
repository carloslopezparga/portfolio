"use client";

import { useId } from "react";
import { getPrefs } from "@/lib/prefs";
import { switchTheme, useTheme } from "@/lib/theme";

const T = "transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]";

/** Sun/moon that morphs (CSS only); the new theme is revealed as a circle from the button. */
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
          <circle cx="17" cy="7" r="6" fill="#000" className={T} style={{ transform: dark ? "none" : "translate(13px, -13px)" }} />
        </mask>
        <circle
          cx="12"
          cy="12"
          r="8"
          fill="currentColor"
          stroke="none"
          mask={`url(#${maskId})`}
          className={T}
          style={{ transformOrigin: "12px 12px", transform: dark ? "none" : "scale(0.5625)" }}
        />
        <g className={T} style={{ transformOrigin: "12px 12px", opacity: dark ? 0 : 1, transform: dark ? "rotate(-45deg) scale(0.6)" : "none" }}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1="12" y1="2.5" x2="12" y2="4.5" transform={`rotate(${a} 12 12)`} />
          ))}
        </g>
      </svg>
    </button>
  );
}
