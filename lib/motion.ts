/**
 * Motion tokens: one "physics" for the whole site.
 * Mirrored as CSS custom properties in globals.css and as GSAP eases in lib/gsap.ts.
 */

/** Cubic-bezier control points. */
export const EASE = {
  /** Default for reveals, hovers and anything entering: fast start, long soft landing. */
  out: [0.22, 1, 0.36, 1] as [number, number, number, number],
  /** Moving between two resting states (panels, layout). */
  inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
  /** Leaving the screen. */
  in: [0.55, 0, 1, 0.45] as [number, number, number, number],
};

/** Seconds. */
export const DUR = {
  press: 0.12,
  hover: 0.25,
  base: 0.45,
  reveal: 0.8,
  slow: 1.2,
};

/** Seconds between siblings. */
export const STAGGER = {
  char: 0.016,
  word: 0.04,
  line: 0.09,
  item: 0.07,
};

/** Springs for anything that follows the pointer. */
export const SPRING = {
  pointer: { stiffness: 260, damping: 26, mass: 0.5 },
  magnetic: { stiffness: 200, damping: 16, mass: 0.4 },
  tilt: { stiffness: 170, damping: 20, mass: 0.6 },
};

/** Frame-rate independent exponential smoothing factor. */
export const damp = (lambda: number, dt: number) => 1 - Math.exp(-lambda * dt);

export const cssBezier = (e: readonly number[]) => `cubic-bezier(${e.join(",")})`;
