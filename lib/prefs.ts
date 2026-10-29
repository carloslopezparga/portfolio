"use client";

import { useSyncExternalStore } from "react";

/**
 * Global interaction preferences, mirrored on <html> as data-motion / data-input
 * so CSS and JS read the same truth. /lab can override both for testing.
 */
export type MotionPref = "auto" | "reduce" | "full";
export type InputPref = "auto" | "touch" | "fine";

export interface Prefs {
  reduced: boolean;
  touch: boolean;
  motionOverride: MotionPref;
  inputOverride: InputPref;
}

const SERVER: Prefs = { reduced: false, touch: false, motionOverride: "auto", inputOverride: "auto" };

let state: Prefs = SERVER;
let started = false;
const listeners = new Set<() => void>();

function read(key: string) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, value: string | null) {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch {}
}

const mqReduce = () => matchMedia("(prefers-reduced-motion: reduce)");
const mqTouch = () => matchMedia("(hover: none), (pointer: coarse)");

function compute(): Prefs {
  const motionOverride = (read("pref:motion") as MotionPref) || "auto";
  const inputOverride = (read("pref:input") as InputPref) || "auto";
  const reduced = motionOverride === "reduce" || (motionOverride !== "full" && mqReduce().matches);
  const touch = inputOverride === "touch" || (inputOverride !== "fine" && mqTouch().matches);
  return { reduced, touch, motionOverride, inputOverride };
}

function update() {
  const next = compute();
  const d = document.documentElement;
  d.dataset.motion = next.reduced ? "reduce" : "full";
  d.dataset.input = next.touch ? "touch" : "fine";
  if (
    next.reduced !== state.reduced ||
    next.touch !== state.touch ||
    next.motionOverride !== state.motionOverride ||
    next.inputOverride !== state.inputOverride
  ) {
    state = next;
    listeners.forEach((l) => l());
  }
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  state = compute();
  mqReduce().addEventListener("change", update);
  mqTouch().addEventListener("change", update);
}

function subscribe(cb: () => void) {
  start();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  start();
  return state;
}

export function usePrefs(): Prefs {
  return useSyncExternalStore(subscribe, getSnapshot, () => SERVER);
}

export const useReducedMotion = () => usePrefs().reduced;
export const useIsTouch = () => usePrefs().touch;

export function setMotionOverride(v: MotionPref) {
  write("pref:motion", v === "auto" ? null : v);
  update();
}
export function setInputOverride(v: InputPref) {
  write("pref:input", v === "auto" ? null : v);
  update();
}

/** Non-hook read for imperative code (canvas loops, GSAP setups). */
export function getPrefs(): Prefs {
  start();
  return state;
}
