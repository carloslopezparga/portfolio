"use client";

import { useSyncExternalStore } from "react";

/**
 * One shared, allocation-free pointer + gyroscope source for every effect
 * (cursor, starfield, cards, hero). Consumers read it inside their own rAF loop.
 */
export const pointer = {
  x: -9999,
  y: -9999,
  /** -1..1 relative to viewport center. */
  nx: 0,
  ny: 0,
  inside: false,
  down: false,
  moved: false,
};

/** Device orientation mapped to -1..1 (gx: left/right, gy: forward/back). */
export const gyro = { gx: 0, gy: 0, active: false };

let started = false;
function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  const onMove = (e: PointerEvent) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.nx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ny = (e.clientY / window.innerHeight) * 2 - 1;
    pointer.inside = true;
    pointer.moved = true;
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerdown", (e) => {
    onMove(e);
    pointer.down = true;
  }, { passive: true });
  window.addEventListener("pointerup", () => (pointer.down = false), { passive: true });
  document.addEventListener("pointerleave", () => (pointer.inside = false));
  window.addEventListener("blur", () => (pointer.inside = false));
}

export function ensurePointer() {
  start();
}

/* ---------------- Gyroscope ---------------- */

export type GyroState = "unsupported" | "needs-permission" | "on" | "denied" | "idle";
let gyroState: GyroState = "idle";
const gyroListeners = new Set<() => void>();
const setGyroState = (s: GyroState) => {
  gyroState = s;
  gyroListeners.forEach((l) => l());
};

type IOSOrientation = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<"granted" | "denied"> };

function onOrientation(e: DeviceOrientationEvent) {
  if (e.gamma == null || e.beta == null) return;
  // Phone held naturally sits around 45° pitch.
  gyro.gx = Math.max(-1, Math.min(1, e.gamma / 30));
  gyro.gy = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
  gyro.active = true;
}

function listenGyro() {
  window.addEventListener("deviceorientation", onOrientation, { passive: true });
  setGyroState("on");
}

/** Call once on touch devices. On iOS it only reports that a tap is needed. */
export function initGyro() {
  if (typeof window === "undefined" || gyroState !== "idle") return;
  if (!("DeviceOrientationEvent" in window)) return setGyroState("unsupported");
  const DOE = DeviceOrientationEvent as IOSOrientation;
  if (typeof DOE.requestPermission === "function") setGyroState("needs-permission");
  else listenGyro();
}

/** Must run inside a user gesture on iOS. */
export async function requestGyro() {
  const DOE = DeviceOrientationEvent as IOSOrientation;
  try {
    if (typeof DOE.requestPermission === "function") {
      const res = await DOE.requestPermission();
      if (res === "granted") listenGyro();
      else setGyroState("denied");
    } else listenGyro();
  } catch {
    setGyroState("denied");
  }
}

export function useGyroState() {
  return useSyncExternalStore(
    (cb) => {
      gyroListeners.add(cb);
      return () => gyroListeners.delete(cb);
    },
    () => gyroState,
    () => "idle" as GyroState,
  );
}
