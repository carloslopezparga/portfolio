"use client";

import { toggleMotion, usePrefs } from "@/lib/prefs";

/**
 * Pauses the page's moving parts (the point cloud, the pulsing dot, the rest
 * of the motion) and resumes them: WCAG 2.2.2. It switches the site's reduced
 * motion preference, which the scene and the CSS already follow at runtime;
 * the choice lasts for the session.
 *
 * Not on show: like the skip link it follows, it slides in when the keyboard
 * reaches it (the page's second stop). The same action is in the ⌘K palette
 * and in the phone menu (siteActions.ts).
 */
export function MotionToggle({ pause, resume }: { pause: string; resume: string }) {
  const { reduced } = usePrefs();
  return (
    <button type="button" onClick={toggleMotion} className="skip-link">
      {reduced ? resume : pause}
    </button>
  );
}
