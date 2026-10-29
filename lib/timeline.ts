import type { DateISO } from "@/content/types";

/** Axis of the trajectory chart: Jan 2023 → Jul 2028, in months. */
export const AXIS = { startYear: 2023, months: 66 };

/** Month index (fractional) from the start of the axis. */
export function monthIndex(d: DateISO | Date): number {
  if (d instanceof Date) return (d.getUTCFullYear() - AXIS.startYear) * 12 + d.getUTCMonth() + (d.getUTCDate() - 1) / 30;
  const [y, m, day] = d.split("-").map(Number);
  return (y - AXIS.startYear) * 12 + (m - 1) + (day ? (day - 1) / 30 : 0);
}

/** End of a month given as YYYY-MM (inclusive) → index of the following month start. */
export function monthEnd(d: DateISO): number {
  const parts = d.split("-");
  return parts.length === 3 ? monthIndex(d) : monthIndex(d) + 1;
}

/** Brownian bridges from 0 to 0: a fan of plausible paths that converge at both ends. */
export function brownianBridges(n: number, steps: number, seed = 11): number[][] {
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  const gauss = () => {
    const u = Math.max(rand(), 1e-9);
    const v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const out: number[][] = [];
  for (let k = 0; k < n; k++) {
    const w = [0];
    for (let i = 1; i <= steps; i++) w.push(w[i - 1] + gauss() / Math.sqrt(steps));
    const end = w[steps];
    out.push(w.map((v, i) => v - (i / steps) * end));
  }
  return out;
}
