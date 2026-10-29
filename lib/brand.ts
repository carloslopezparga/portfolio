import type { CSSProperties } from "react";
import type { Hex } from "@/content/types";

/*
 * Brand colours as accents. A logo colour rarely works as-is on both themes
 * (ETSII's navy disappears on the dark background, a bright yellow on the
 * light one), so each brand gets two tones with the same hue: one lightened
 * until it reaches AA (4.5:1) on the dark background, one darkened until it
 * does on the light background.
 */

type RGB = [number, number, number];

// Measured against the card surfaces (a touch lighter / darker than the page), with a small margin.
const BG_DARK: RGB = [23, 26, 35];
const BG_LIGHT: RGB = [240, 240, 244];
const TARGET = 4.7;

export function hexToRgb(hex: string): RGB {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const toHex = ([r, g, b]: RGB) => `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}` as Hex;

function luminance([r, g, b]: RGB) {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrast(a: RGB, b: RGB) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

function rgbToHsl([r, g, b]: RGB): [number, number, number] {
  const [rr, gg, bb] = [r / 255, g / 255, b / 255];
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === rr ? (gg - bb) / d + (gg < bb ? 6 : 0) : max === gg ? (bb - rr) / d + 2 : (rr - gg) / d + 4;
  return [h / 6, s, l];
}

function hslToRgb([h, s, l]: [number, number, number]): RGB {
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue = (t: number) => {
    const tt = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  return [hue(h + 1 / 3) * 255, hue(h) * 255, hue(h - 1 / 3) * 255];
}

/** Moves lightness (keeping hue and a lively saturation) until the colour reaches the target contrast on `bg`. */
function toward(rgb: RGB, bg: RGB, lighten: boolean): RGB {
  const [h, s0, l0] = rgbToHsl(rgb);
  const s = Math.max(s0, 0.55);
  let l = l0;
  let out = rgb;
  for (let i = 0; i < 60 && contrast(out, bg) < TARGET; i++) {
    l = Math.min(0.95, Math.max(0.05, l + (lighten ? 0.015 : -0.015)));
    out = hslToRgb([h, s, l]);
  }
  return out;
}

export interface BrandTones {
  dark: Hex;
  light: Hex;
}

export function brandTones(hex: string): BrandTones {
  const rgb = hexToRgb(hex);
  return { dark: toHex(toward(rgb, BG_DARK, true)), light: toHex(toward(rgb, BG_LIGHT, false)) };
}

/** CSS variables for an element that takes a brand as its accent (see `.brand` in globals.css). */
export function brandStyle(t: BrandTones): CSSProperties {
  const rgb = (h: string) => hexToRgb(h).join(" ");
  return { "--brand": t.dark, "--brand-rgb": rgb(t.dark), "--brand-l": t.light, "--brand-l-rgb": rgb(t.light) } as CSSProperties;
}

/** Most frequent saturated colour among the hex / rgb() values in an SVG. */
export function svgColor(svg: string): Hex | null {
  const counts = new Map<string, number>();
  const add = (rgb: RGB) => {
    const [, s, l] = rgbToHsl(rgb);
    if (s < 0.25 || l < 0.08 || l > 0.94) return; // greys, black, white
    const key = toHex(rgb);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  };
  for (const m of svg.matchAll(/#([0-9a-f]{6}|[0-9a-f]{3})\b/gi)) add(hexToRgb(m[1]));
  for (const m of svg.matchAll(/rgba?\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)/gi)) add([+m[1], +m[2], +m[3]]);
  let best: string | null = null;
  let n = 0;
  counts.forEach((c, k) => {
    if (c > n) [best, n] = [k, c];
  });
  return best;
}

/** Average of the largest hue bucket among saturated, opaque pixels (RGBA buffer). */
export function pixelsColor(data: Uint8Array | Buffer, channels: number): Hex | null {
  const buckets = new Map<number, { n: number; r: number; g: number; b: number }>();
  for (let i = 0; i < data.length; i += channels) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    if (channels === 4 && data[i + 3] < 200) continue;
    const [h, s, l] = rgbToHsl([r, g, b]);
    if (s < 0.25 || l < 0.08 || l > 0.94) continue;
    const k = Math.round(h * 24);
    const e = buckets.get(k) ?? { n: 0, r: 0, g: 0, b: 0 };
    e.n++;
    e.r += r;
    e.g += g;
    e.b += b;
    buckets.set(k, e);
  }
  let best: { n: number; r: number; g: number; b: number } | null = null;
  buckets.forEach((e) => {
    if (!best || e.n > best.n) best = e;
  });
  if (!best) return null;
  const { n, r, g, b } = best;
  return toHex([r / n, g / n, b / n]);
}
