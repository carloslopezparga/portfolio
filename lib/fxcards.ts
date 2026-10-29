"use client";

import { damp } from "./motion";
import { gyro, pointer } from "./pointer";

/**
 * One rAF loop for every .fx-card on screen. Reads all rects first, then
 * writes CSS variables, so cards never thrash layout.
 *
 * Fine pointer: border glow at the edge point nearest the cursor (even before
 * the cursor enters the card). Touch: a scan line follows the viewport centre
 * while scrolling, and tilt comes from the gyroscope or the scroll position.
 */
type Entry = {
  el: HTMLElement;
  touch: boolean;
  visible: boolean;
  bx: number;
  by: number;
  bi: number;
  onTilt?: (rx: number, ry: number) => void;
};

const entries = new Set<Entry>();
let raf = 0;
let last = 0;
let io: IntersectionObserver | null = null;

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const REACH = 180;

function loop(now: number) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  const visible: Entry[] = [];
  entries.forEach((e) => e.visible && visible.push(e));
  if (!visible.length) {
    raf = 0;
    return;
  }
  const rects = visible.map((e) => e.el.getBoundingClientRect());
  const vh = window.innerHeight;
  const k = damp(14, dt);

  visible.forEach((e, i) => {
    const r = rects[i];
    let tbx: number;
    let tby: number;
    let tbi: number;

    if (e.touch) {
      const scan = vh * 0.5 - r.top;
      tbx = r.width / 2;
      tby = clamp(scan, 0, r.height);
      const outside = scan < 0 ? -scan : scan > r.height ? scan - r.height : 0;
      tbi = clamp(1 - outside / 160, 0, 1);
      e.el.style.setProperty("--my", `${scan}px`);
      e.el.style.setProperty("--spot", String(tbi));
      if (e.onTilt) {
        if (gyro.active) e.onTilt(-gyro.gy * 5, gyro.gx * 5);
        else {
          const p = clamp((r.top + r.height / 2 - vh / 2) / vh, -1, 1);
          e.onTilt(p * 6, 0);
        }
      }
    } else {
      const lx = pointer.x - r.left;
      const ly = pointer.y - r.top;
      const cx = clamp(lx, 0, r.width);
      const cy = clamp(ly, 0, r.height);
      let dist = 0;
      if (lx < 0 || lx > r.width || ly < 0 || ly > r.height) {
        tbx = cx;
        tby = cy;
        dist = Math.hypot(lx - cx, ly - cy);
      } else {
        const d = [lx, r.width - lx, ly, r.height - ly];
        const m = Math.min(...d);
        if (m === d[0]) [tbx, tby] = [0, ly];
        else if (m === d[1]) [tbx, tby] = [r.width, ly];
        else if (m === d[2]) [tbx, tby] = [lx, 0];
        else [tbx, tby] = [lx, r.height];
      }
      tbi = pointer.inside ? clamp(1 - dist / REACH, 0, 1) : 0;
    }

    e.bx += (tbx - e.bx) * k;
    e.by += (tby - e.by) * k;
    e.bi += (tbi - e.bi) * k;
    e.el.style.setProperty("--bx", `${e.bx.toFixed(1)}px`);
    e.el.style.setProperty("--by", `${e.by.toFixed(1)}px`);
    e.el.style.setProperty("--bi", e.bi.toFixed(3));
  });

  raf = requestAnimationFrame(loop);
}

function kick() {
  if (!raf) {
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }
}

export function registerFxCard(el: HTMLElement, opts: { touch: boolean; onTilt?: (rx: number, ry: number) => void }) {
  const entry: Entry = { el, touch: opts.touch, visible: false, bx: 0, by: 0, bi: 0, onTilt: opts.onTilt };
  entries.add(entry);
  io ??= new IntersectionObserver(
    (list) => {
      list.forEach((item) => {
        entries.forEach((e) => {
          if (e.el === item.target) e.visible = item.isIntersecting;
        });
      });
      kick();
    },
    { rootMargin: "200px" },
  );
  io.observe(el);
  return () => {
    io?.unobserve(el);
    entries.delete(entry);
  };
}
