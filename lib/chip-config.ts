/*
 * Constants of the hero chip's point cloud that the page needs before the
 * scene loads (kept apart from lib/chip-cloud.ts so the startup bundle does
 * not carry the generator).
 */

/** Points per device class: desktop (≥ 1024 px wide) and everything else. */
export const CLOUD_SIZE = { desktop: 8000, mobile: 2500 } as const;
/** Width from which the desktop cloud (and its poster) is used. */
export const DESKTOP_QUERY = "(min-width: 1024px)";
