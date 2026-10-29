"use client";

import { useEffect, useRef } from "react";
import { glyphPath, type GlyphName } from "@/components/ui/icons";
import { gyro, pointer } from "@/lib/pointer";
import { usePrefs } from "@/lib/prefs";

/* ------------------------------------------------------------------ */
/* "Manual operations → automated systems", drawn on a 2D canvas.       */
/* Manual inputs drift in a messy cluster, get pulled into a 4-stage    */
/* pipeline, morph as they are processed, and leave as tidy outputs.    */
/* The cursor repels inputs, lights nodes and tugs the connectors.      */
/* ------------------------------------------------------------------ */

type Kind = 0 | 1 | 2 | 3;
const KIND_GLYPH: GlyphName[] = ["mail", "sheet", "form", "pdf"];
const NODE_GLYPH: GlyphName[] = ["download", "doc", "spark", "negotiation"];

type Item = {
  kind: Kind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hx: number;
  hy: number;
  rot: number;
  ph: number;
  timer: number;
  seek: boolean;
  alpha: number;
  hover: number;
};
type Packet = { kind: Kind; seg: number; t: number; dwell: number; out: boolean; slot: { x: number; y: number } | null };
type Chip = { kind: Kind; y: number; slot: number; alpha: number; leaving: boolean; fresh: number };
type Node = { x: number; y: number; pulse: number; hover: number };
type Conn = { ox: number; oy: number; vx: number; vy: number; act: number };

export interface PipelineLabels {
  nodes: [string, string, string, string];
  outputs: [string, string, string, string];
  manual: string;
  automated: string;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export function PipelineCanvas({ labels, className }: { labels: PipelineLabels; className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { reduced, touch } = usePrefs();

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const paths = {
      kind: KIND_GLYPH.map((g) => new Path2D(glyphPath(g))),
      node: NODE_GLYPH.map((g) => new Path2D(glyphPath(g))),
      check: new Path2D(glyphPath("check")),
    };

    let W = 0;
    let H = 0;
    let dpr = 1;
    let s = 1;
    let mobile = false;
    let rect = wrap.getBoundingClientRect();
    let colors = readColors();
    let mono = monoFamily();
    let nodes: Node[] = [];
    let conns: Conn[] = [];
    let items: Item[] = [];
    let packets: Packet[] = [];
    let chips: Chip[] = [];
    let zone = { x0: 0, x1: 0, y0: 0, y1: 0 };
    let chipW = 0;
    let chipH = 0;
    let chipX = 0;
    let chipY0 = 0;
    let chipGap = 0;
    let half = 22;
    let maxChips = 5;
    const par = { x: 0, y: 0 };
    let raf = 0;
    let last = performance.now();
    let visible = true;
    let time = 0;

    function readColors() {
      const cs = getComputedStyle(document.documentElement);
      const v = (n: string) => cs.getPropertyValue(n).trim();
      return {
        fg: v("--fg"),
        muted: v("--muted"),
        dim: v("--dim"),
        subtle: v("--subtle"),
        accent: v("--accent"),
        ice: v("--ice"),
        surface: v("--surface"),
        surface2: v("--surface-2"),
        line: v("--line-strong"),
        glow: v("--glow"),
        light: document.documentElement.dataset.theme === "light",
      };
    }
    function monoFamily() {
      return getComputedStyle(document.documentElement).getPropertyValue("--font-geist-mono").trim() || "ui-monospace, monospace";
    }

    const ingestPort = () => ({ x: nodes[0].x - half - 4 * s, y: nodes[0].y });
    const slotY = (i: number) => chipY0 + i * chipGap;

    function newItem(x?: number, y?: number, seekNow = false): Item {
      const hx = rand(zone.x0, zone.x1);
      const hy = rand(zone.y0, zone.y1);
      return {
        kind: ((Math.random() * 4) | 0) as Kind,
        x: x ?? hx,
        y: y ?? hy,
        vx: 0,
        vy: 0,
        hx,
        hy,
        rot: rand(-0.35, 0.35),
        ph: Math.random() * 100,
        timer: seekNow ? 0 : rand(1.5, 7),
        seek: seekNow,
        alpha: x === undefined ? 0 : 1,
        hover: 0,
      };
    }

    function layout() {
      rect = wrap.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      mobile = W < 768;
      dpr = Math.min(window.devicePixelRatio || 1, touch ? 1.5 : 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      s = mobile ? clamp(W / 560, 0.62, 0.85) : clamp(W / 1440, 0.78, 1.15);
      half = 22 * s;
      const py = mobile ? H * 0.33 : H * 0.28;
      const nx0 = mobile ? W * 0.44 : W * 0.5;
      const nx1 = mobile ? W * 0.9 : W * 0.88;
      nodes = [0, 1, 2, 3].map((i) => ({ x: nx0 + ((nx1 - nx0) * i) / 3, y: py, pulse: 0, hover: 0 }));
      conns = [0, 1, 2].map(() => ({ ox: 0, oy: 0, vx: 0, vy: 0, act: 0 }));
      zone = mobile
        ? { x0: W * 0.07, x1: W * 0.32, y0: H * 0.25, y1: H * 0.43 }
        : { x0: W * 0.06, x1: W * 0.36, y0: H * 0.19, y1: H * 0.34 };
      chipW = (mobile ? 150 : 176) * s;
      chipH = 26 * s;
      chipGap = 34 * s;
      chipX = Math.min(nodes[3].x - chipW / 2, W - 20 - chipW);
      chipY0 = py + half + (mobile ? 40 : 58) * s;
      maxChips = mobile ? 3 : 5;
      const count = mobile ? 6 : 10;
      items = Array.from({ length: count }, () => {
        const it = newItem();
        it.alpha = 1;
        return it;
      });
      packets = [];
      chips = [];
    }

    /* ------------------------------ update ------------------------------ */
    function update(dt: number) {
      time += dt;
      const lx = pointer.x - rect.left;
      const ly = pointer.y - rect.top;
      const mouse = !touch && pointer.inside && lx > 0 && ly > 0 && lx < W && ly < H;
      const tap = touch && pointer.down;
      const active = mouse || tap;
      const R = 140 * s;

      // gyro / pointer parallax for the whole scene
      const px = touch ? (gyro.active ? gyro.gx : 0) : mouse ? (lx / W) * 2 - 1 : 0;
      const py = touch ? (gyro.active ? gyro.gy : 0) : mouse ? (ly / H) * 2 - 1 : 0;
      par.x += (px - par.x) * (1 - Math.exp(-3 * dt));
      par.y += (py - par.y) * (1 - Math.exp(-3 * dt));

      const port = ingestPort();
      for (const it of items) {
        let ax = 0;
        let ay = 0;
        if (!it.seek) {
          ax += (it.hx - it.x) * 1.4 + Math.sin(time * 0.6 + it.ph) * 26 * s;
          ay += (it.hy - it.y) * 1.4 + Math.cos(time * 0.8 + it.ph * 1.3) * 20 * s;
          it.timer -= dt;
          if (it.timer <= 0) it.seek = true;
        } else {
          const dx = port.x - it.x;
          const dy = port.y - it.y;
          const d = Math.hypot(dx, dy) || 1;
          const speed = 300 * s;
          ax += ((dx / d) * speed - it.vx) * 3.2;
          ay += ((dy / d) * speed - it.vy) * 3.2;
          if (d < 14 * s) {
            packets.push({ kind: it.kind, seg: 0, t: 0, dwell: 0.14, out: false, slot: null });
            nodes[0].pulse = 1;
            Object.assign(it, newItem());
            continue;
          }
        }
        if (active) {
          const dx = it.x - lx;
          const dy = it.y - ly;
          const d = Math.hypot(dx, dy) || 1;
          if (d < R) {
            const f = (1 - d / R) ** 2 * 5200 * s;
            ax += (dx / d) * f;
            ay += (dy / d) * f;
          }
          it.hover += ((d < R * 0.75 ? 1 : 0) - it.hover) * (1 - Math.exp(-10 * dt));
        } else it.hover += (0 - it.hover) * (1 - Math.exp(-6 * dt));
        it.vx = (it.vx + ax * dt) * Math.exp(-2.4 * dt);
        it.vy = (it.vy + ay * dt) * Math.exp(-2.4 * dt);
        it.x += it.vx * dt;
        it.y += it.vy * dt;
        it.alpha = Math.min(1, it.alpha + dt * 2);
      }

      // nodes
      for (const n of nodes) {
        n.pulse *= Math.exp(-2.6 * dt);
        const d = mouse ? Math.hypot(n.x - lx, n.y - ly) : 1e9;
        n.hover += ((d < 80 * s ? 1 : 0) - n.hover) * (1 - Math.exp(-10 * dt));
      }

      // connectors: springs pulled toward the cursor, wobble on release
      conns.forEach((c, i) => {
        const a = nodes[i];
        const b = nodes[i + 1];
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        let tx = 0;
        let ty = 0;
        if (mouse) {
          const d = Math.hypot(lx - mx, ly - my);
          const reach = 170 * s;
          if (d < reach) {
            const k = (1 - d / reach) * 0.55;
            tx = (lx - mx) * k;
            ty = (ly - my) * k;
          }
        }
        c.vx += ((tx - c.ox) * 95 - c.vx * 7) * dt;
        c.vy += ((ty - c.oy) * 95 - c.vy * 7) * dt;
        c.ox += c.vx * dt;
        c.oy += c.vy * dt;
        c.act *= Math.exp(-1.8 * dt);
      });

      // packets
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        if (p.dwell > 0) {
          p.dwell -= dt;
          continue;
        }
        p.t += dt * (p.out ? 1.5 : 1.35);
        if (!p.out) conns[p.seg].act = 1;
        if (p.t >= 1) {
          if (p.out) {
            chips.forEach((c) => !c.leaving && c.slot++);
            chips.unshift({ kind: p.kind, y: slotY(0) - 12 * s, slot: 0, alpha: 0, leaving: false, fresh: 1 });
            chips.filter((c) => !c.leaving && c.slot >= maxChips).forEach((c) => (c.leaving = true));
            packets.splice(i, 1);
            continue;
          }
          p.seg++;
          p.t = 0;
          nodes[p.seg].pulse = 1;
          p.dwell = 0.16;
          if (p.seg === 3) {
            p.out = true;
            p.slot = { x: chipX + 16 * s, y: slotY(0) };
          }
        }
      }

      // chips
      for (let i = chips.length - 1; i >= 0; i--) {
        const c = chips[i];
        c.y += (slotY(c.slot) - c.y) * (1 - Math.exp(-9 * dt));
        c.fresh *= Math.exp(-1.6 * dt);
        if (c.leaving) {
          c.alpha -= dt * 2.5;
          if (c.alpha <= 0) chips.splice(i, 1);
        } else c.alpha = Math.min(1, c.alpha + dt * 3);
      }
    }

    /* ------------------------------ geometry ----------------------------- */
    function segPoint(i: number, t: number) {
      const a = nodes[i];
      const b = nodes[i + 1];
      const c = conns[i];
      const sx = a.x + half;
      const sy = a.y;
      const ex = b.x - half;
      const ey = b.y;
      const cx = (sx + ex) / 2 + c.ox;
      const cy = (sy + ey) / 2 + c.oy;
      const u = 1 - t;
      return { x: u * u * sx + 2 * u * t * cx + t * t * ex, y: u * u * sy + 2 * u * t * cy + t * t * ey, cx, cy, sx, sy, ex, ey };
    }
    function outPoint(t: number, slot: { x: number; y: number }) {
      const a = nodes[3];
      const sx = a.x;
      const sy = a.y + half;
      const cx = a.x;
      const cy = slot.y;
      const u = 1 - t;
      return { x: u * u * sx + 2 * u * t * cx + t * t * slot.x, y: u * u * sy + 2 * u * t * cy + t * t * slot.y };
    }

    /* ------------------------------- draw -------------------------------- */
    function glyph(path: Path2D, x: number, y: number, size: number, rot: number, stroke: string, alpha: number, lw = 1.5) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.scale(size / 24, size / 24);
      ctx.translate(-12, -12);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lw;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke(path);
      ctx.restore();
    }

    function label(text: string, x: number, y: number, color: string, align: CanvasTextAlign = "left", size = 9.5) {
      ctx.font = `500 ${Math.max(8.5, size * s)}px ${mono}`;
      ctx.fillStyle = color;
      ctx.textAlign = align;
      ctx.textBaseline = "middle";
      const spaced = text.toUpperCase().split("").join(String.fromCharCode(8202));
      ctx.fillText(spaced, x, y);
    }

    function corners(x0: number, y0: number, x1: number, y1: number, len: number, color: string) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const [x, y, dx, dy] of [
        [x0, y0, 1, 1],
        [x1, y0, -1, 1],
        [x0, y1, 1, -1],
        [x1, y1, -1, -1],
      ]) {
        ctx.moveTo(x + dx * len, y);
        ctx.lineTo(x, y);
        ctx.lineTo(x, y + dy * len);
      }
      ctx.stroke();
    }

    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const C = colors;
      const offManual = { x: -par.x * 16 * s, y: -par.y * 10 * s };
      const offSys = { x: -par.x * 6 * s, y: -par.y * 4 * s };

      // manual zone annotation
      ctx.save();
      ctx.translate(offManual.x, offManual.y);
      const pad = 26 * s;
      corners(zone.x0 - pad, zone.y0 - pad, zone.x1 + pad, zone.y1 + pad, 10 * s, C.line);
      label(labels.manual, zone.x0 - pad, zone.y0 - pad - 12 * s, C.dim);
      ctx.restore();

      ctx.save();
      ctx.translate(offSys.x, offSys.y);

      // funnel from manual zone into the ingest port
      const port = ingestPort();
      ctx.setLineDash([2 * s, 5 * s]);
      ctx.strokeStyle = C.line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(zone.x1 + 26 * s + offManual.x - offSys.x, (zone.y0 + zone.y1) / 2 + offManual.y - offSys.y);
      ctx.quadraticCurveTo((zone.x1 + port.x) / 2, port.y, port.x, port.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // connectors
      conns.forEach((c, i) => {
        const g = segPoint(i, 0);
        ctx.strokeStyle = C.line;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(g.sx, g.sy);
        ctx.quadraticCurveTo(g.cx, g.cy, g.ex, g.ey);
        ctx.stroke();
        if (c.act > 0.02) {
          ctx.save();
          ctx.globalAlpha = c.act;
          ctx.strokeStyle = C.accent;
          ctx.shadowColor = `rgb(${C.glow})`;
          ctx.shadowBlur = 8;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6 * s, 6 * s]);
          ctx.lineDashOffset = -time * 40;
          ctx.beginPath();
          ctx.moveTo(g.sx, g.sy);
          ctx.quadraticCurveTo(g.cx, g.cy, g.ex, g.ey);
          ctx.stroke();
          ctx.restore();
        }
      });

      // out lane to the chip stack
      ctx.strokeStyle = C.line;
      ctx.setLineDash([2 * s, 5 * s]);
      ctx.beginPath();
      ctx.moveTo(nodes[3].x, nodes[3].y + half);
      ctx.lineTo(nodes[3].x, slotY(Math.min(maxChips - 1, 2)));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // manual items
      ctx.save();
      ctx.translate(offManual.x, offManual.y);
      for (const it of items) {
        const size = (22 + it.hover * 6) * s;
        const box = size * 1.55;
        const wob = Math.sin(time * 1.3 + it.ph) * 0.06;
        ctx.save();
        ctx.globalAlpha = it.alpha * (it.seek ? 0.95 : 0.85);
        ctx.translate(it.x, it.y);
        ctx.rotate(it.rot + wob + it.vx * 0.0012);
        ctx.fillStyle = C.light ? C.surface : C.surface2;
        ctx.strokeStyle = it.hover > 0.05 ? C.accent : C.line;
        ctx.lineWidth = 1;
        if (it.hover > 0.05) {
          ctx.shadowColor = `rgb(${C.glow} / ${0.8 * it.hover})`;
          ctx.shadowBlur = 18 * it.hover;
        }
        ctx.beginPath();
        ctx.roundRect(-box / 2, -box / 2, box, box, 8 * s);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        glyph(paths.kind[it.kind], it.x, it.y, size, it.rot + wob + it.vx * 0.0012, it.hover > 0.05 ? C.ice : C.muted, it.alpha);
      }
      ctx.restore();

      ctx.save();
      ctx.translate(offSys.x, offSys.y);

      // nodes
      nodes.forEach((n, i) => {
        const glow = Math.max(n.pulse, n.hover * 0.75);
        ctx.save();
        ctx.fillStyle = C.light ? C.surface : C.surface;
        ctx.strokeStyle = glow > 0.05 ? C.accent : C.line;
        ctx.lineWidth = glow > 0.05 ? 1.25 : 1;
        if (glow > 0.02) {
          ctx.shadowColor = `rgb(${C.glow} / ${glow})`;
          ctx.shadowBlur = 26 * glow;
        }
        ctx.beginPath();
        ctx.roundRect(n.x - half, n.y - half, half * 2, half * 2, 12 * s);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        glyph(paths.node[i], n.x, n.y, 20 * s, 0, glow > 0.3 ? C.ice : C.muted, 1);
        label(labels.nodes[i], n.x, n.y - half - 14 * s, glow > 0.3 ? C.fg : C.dim, "center");
      });

      // packets
      for (const p of packets) {
        const pos = p.out ? outPoint(Math.min(1, p.t), p.slot!) : p.dwell > 0 ? { x: nodes[p.seg].x, y: nodes[p.seg].y } : segPoint(p.seg, p.t);
        if (p.dwell > 0 && !p.out) continue;
        const stage = p.out ? 3 : p.seg;
        if (stage === 0) {
          glyph(paths.kind[p.kind], pos.x, pos.y, 14 * s, 0, C.ice, 1);
        } else if (stage === 1) {
          ctx.save();
          ctx.strokeStyle = C.ice;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.roundRect(pos.x - 6 * s, pos.y - 5 * s, 12 * s, 10 * s, 2.5 * s);
          ctx.moveTo(pos.x - 3 * s, pos.y - 1 * s);
          ctx.lineTo(pos.x + 3 * s, pos.y - 1 * s);
          ctx.moveTo(pos.x - 3 * s, pos.y + 2 * s);
          ctx.lineTo(pos.x + 1.5 * s, pos.y + 2 * s);
          ctx.stroke();
          ctx.restore();
        } else {
          ctx.save();
          ctx.fillStyle = C.ice;
          ctx.shadowColor = `rgb(${C.glow})`;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 3.5 * s, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // output chips
      if (chips.length) label(labels.automated, chipX, chipY0 - chipH / 2 - 14 * s, C.dim);
      for (const c of chips) {
        const y = c.y;
        ctx.save();
        ctx.globalAlpha = Math.max(0, c.alpha);
        ctx.fillStyle = C.light ? C.surface : C.surface2;
        ctx.strokeStyle = c.fresh > 0.1 ? C.accent : C.line;
        ctx.lineWidth = 1;
        if (c.fresh > 0.05) {
          ctx.shadowColor = `rgb(${C.glow} / ${c.fresh * 0.8})`;
          ctx.shadowBlur = 16 * c.fresh;
        }
        ctx.beginPath();
        ctx.roundRect(chipX, y - chipH / 2, chipW, chipH, chipH / 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = Math.max(0, c.alpha);
        glyph(paths.check, chipX + 15 * s, y, 13 * s, 0, C.accent, 1, 2);
        label(labels.outputs[c.kind], chipX + 28 * s, y + 0.5, C.fg, "left", 9);
        ctx.restore();
      }
      ctx.restore();
    }

    /* ------------------------------- loop -------------------------------- */
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      update(dt);
      draw();
      if (visible && !document.hidden) raf = requestAnimationFrame(loop);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      if (reduced) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };

    const staticFrame = () => {
      // Run the simulation forward silently, then paint once.
      for (let i = 0; i < 60 * 9; i++) update(1 / 60);
      draw();
    };

    layout();
    if (reduced) staticFrame();
    else start();

    const ro = new ResizeObserver(() => {
      layout();
      if (reduced) staticFrame();
    });
    ro.observe(wrap);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else cancelAnimationFrame(raf);
    });
    io.observe(wrap);
    const onScroll = () => (rect = wrap.getBoundingClientRect());
    window.addEventListener("scroll", onScroll, { passive: true });
    const onVis = () => (!document.hidden && visible ? start() : cancelAnimationFrame(raf));
    document.addEventListener("visibilitychange", onVis);
    const mo = new MutationObserver(() => {
      colors = readColors();
      mono = monoFamily();
      if (reduced) draw();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    // Click / tap on empty space drops a new manual task that heads straight in.
    const onDown = (e: PointerEvent) => {
      if ((e.target as Element).closest("a, button")) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x > W || y > H) return;
      if (items.length < 18) items.push(newItem(x, y, true));
      else Object.assign(items[(Math.random() * items.length) | 0], newItem(x, y, true));
      if (reduced) staticFrame();
    };
    const host = wrap.parentElement ?? wrap;
    host.addEventListener("pointerdown", onDown);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
      host.removeEventListener("pointerdown", onDown);
    };
  }, [reduced, touch, labels]);

  return (
    <div ref={wrapRef} className={`absolute inset-0 ${className ?? ""}`} aria-hidden>
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}
