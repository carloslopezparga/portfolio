/*
 * How the cloud's points move: every number in one place. The scene
 * (components/figures/scene.ts) reads `particleConfig` on every frame, and
 * the tuning panel (?tune=1 in the address) writes to it, so a slider is felt
 * at once. To make a set of values permanent, paste them into PARTICLE_DEFAULTS.
 */

export const PARTICLE_DEFAULTS = {
  /** The cursor pushes the points within this many pixels of it… */
  repelRadius: 130,
  /** …this hard: the radius (px) of the hole it keeps clear around itself. */
  repelForce: 60,
  /** How much of the cursor's own velocity the points near it take on (1/s): the wake behind it. */
  drag: 8,
  /** The spring that brings a point back to its place: its frequency (Hz; each point's own is within ±20 % of it)… */
  springHz: 1,
  /** …and its damping ratio: 1 is critical (the fastest way back with no bounce), less than 1 bounces. */
  springDamping: 1,
  /** The drift, a slow flow that neighbouring points share: how far it carries a point (px)… */
  driftAmp: 4,
  /** …and how fast the flow changes (1: a breath every eight seconds or so). */
  driftSpeed: 1,
};
export type ParticleConfig = typeof PARTICLE_DEFAULTS;

/** The live values… */
export const particleConfig: ParticleConfig = { ...PARTICLE_DEFAULTS };
/** …and how the tuning panel changes them: some of them, or back to the defaults. */
export function tuneParticles(values: Partial<ParticleConfig> = PARTICLE_DEFAULTS): ParticleConfig {
  return { ...Object.assign(particleConfig, values) };
}

/** The tuning panel's sliders: label, lowest, highest and step. */
export const PARTICLE_SLIDERS: { key: keyof ParticleConfig; label: string; min: number; max: number; step: number }[] = [
  { key: "repelRadius", label: "Repulsión · radio (px)", min: 60, max: 260, step: 5 },
  { key: "repelForce", label: "Repulsión · fuerza (hueco, px)", min: 0, max: 140, step: 2 },
  { key: "drag", label: "Arrastre (1/s)", min: 0, max: 30, step: 0.5 },
  { key: "springHz", label: "Muelle · frecuencia (Hz)", min: 0.3, max: 3, step: 0.05 },
  { key: "springDamping", label: "Muelle · amortiguación", min: 0.2, max: 2, step: 0.05 },
  { key: "driftAmp", label: "Deriva · amplitud (px)", min: 0, max: 14, step: 0.5 },
  { key: "driftSpeed", label: "Deriva · velocidad", min: 0, max: 4, step: 0.1 },
];

/** What no slider changes. */
export const SIM = {
  /** The simulation advances in fixed steps of this many seconds, at most `maxSteps` per frame. */
  step: 1 / 120,
  maxSteps: 4,
  /** No point moves faster (px/s) or strays further from its place (px) than this. */
  maxSpeed: 4000,
  maxOffset: 600,
  /** The wake: however fast the cursor goes, the points take it for no faster than this (px/s). */
  maxWake: 2500,
  /** The share of the hole that is a wall: whatever the cursor does, no point is ever closer to it than this. */
  core: 0.75,
  /** A click: its front travels this fast (px/s), fades over this distance (px) and throws each point during this long (s). */
  clickSpeed: 1000,
  clickReach: 300,
  clickPulse: 8 / 120,
};

/** The drift's flow field: the size of its eddies (px), and how much of it passes per second at speed 1. */
export const DRIFT = { cell: 190, rate: 0.12 };
