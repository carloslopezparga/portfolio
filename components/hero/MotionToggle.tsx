"use client";

import { setMotionOverride, usePrefs } from "@/lib/prefs";

/**
 * Pauses the page's moving parts (the chip, the pulsing dot, the rest of
 * the motion) and resumes them: WCAG 2.2.2. It switches the site's reduced
 * motion preference, which the chip and the CSS already follow at runtime;
 * the choice lasts for the session.
 */
export function MotionToggle({ label, className }: { label: string; className?: string }) {
  const { reduced } = usePrefs();
  const toggle = () => {
    if (!reduced) setMotionOverride("reduce");
    else setMotionOverride(matchMedia("(prefers-reduced-motion: reduce)").matches ? "full" : "auto");
  };
  return (
    <button
      type="button"
      aria-pressed={reduced}
      aria-label={label}
      title={label}
      onClick={toggle}
      className={`grid size-8 place-items-center rounded-full text-muted transition-colors duration-200 hover:bg-[var(--btn-2)] hover:text-fg ${className ?? ""}`}
    >
      <svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor" aria-hidden>
        {reduced ? <path d="M5 3.2v9.6a.6.6 0 0 0 .9.5l7.6-4.8a.6.6 0 0 0 0-1L5.9 2.7a.6.6 0 0 0-.9.5Z" /> : <path d="M4.5 3h2.2v10H4.5zM9.3 3h2.2v10H9.3z" />}
      </svg>
    </button>
  );
}
