import { CAM, FOCAL } from "@/lib/chip-cloud";
import { BOOK, FLOW, FUNNEL, GLOBE_R } from "@/lib/figure-cloud";

/** The cursor's recent path, as the shader gets it: this many samples, this many seconds apart (newest first). */
export const TRAIL = { taps: 12, dt: 0.06 };

/** The strip (px) before the line the chip's points may not cross, where the ones pushed towards it squeeze (see scene.ts). */
export const SQUEEZE = 5;

const f = (n: number) => n.toFixed(4);

/*
 * Everything a point does happens here, per vertex, from a handful of
 * uniforms: no per-particle simulation on the CPU. A point knows where it
 * sits in each figure; the page tells the shader which figure the cloud is
 * (A), which one it is flying to (B) and how far, where their gaps are on
 * screen, how they are turned, and where the cursor has been.
 *
 * A figure is rigid: it turns as a whole and nothing in it stretches or
 * swings. What moves is each point, on its own: it wanders a little about
 * its place, and it steps aside from the cursor and comes back critically
 * damped, at its own pace, with no overshoot.
 *
 * Positions are worked out in CSS pixels from the canvas's top-left (the
 * camera is the chip's: lib/chip-cloud.ts), so the cursor's push and the
 * click's wave are plain 2D pushes in the same space.
 */
const COMMON = /* glsl */ `
uniform vec2 uView;        // canvas size
uniform float uDpr, uTime, uEdge;
uniform int uFigA, uFigB;
uniform vec3 uBoxA, uBoxB; // the figure's gap: centre, and pixels per frame unit
uniform mat3 uRotA, uRotB;
uniform float uFlight;     // 0 at A, 1 at B
uniform float uForm;       // 1 formed, 0 mist
uniform float uIntro;      // the chip's first appearance: 0 sphere, 1 chip
uniform float uSpread;     // extra gap between the chip's layers
uniform vec3 uTrail[${TRAIL.taps}];    // where the cursor was (xy) and whether it was on the page (z), newest first
uniform vec2 uHover;       // x: a cursor is on the page; y: it is over the figure
uniform vec4 uClick;       // where, seconds since, and how hard (px)
uniform vec4 uLintel[2];   // the chip: the texts over it, as left, right and the y no point may cross under them (w: in use)
uniform float uGuard;      // how much that applies
uniform float uRun;        // a clock for what a figure does by itself (faster under the cursor)

const float FOCAL = ${FOCAL.toFixed(7)};
const float DIST = ${CAM.dist.toFixed(4)};
const float PI = 3.14159265;

float ease(float t) { return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0; }
mat2 turn(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

// world → pixels (xy), and pixels per world unit at that depth (z)
vec3 place(vec3 p, mat3 rot, vec3 box) {
  vec3 q = rot * p;
  float k = FOCAL / (DIST - q.z) * box.z;
  return vec3(box.xy + vec2(q.x, -q.y) * k, k);
}

// hovering opens the chip's stack about its middle (the layers themselves never move)
float layerShift(float layer) { return (layer - 1.5) * uSpread; }

// How far a point within 140 px of the cursor is asked to step aside.
vec2 push(vec2 s, vec2 c) {
  vec2 d = s - c;
  float dist = length(d);
  float fall = 1.0 - smoothstep(0.0, 140.0, dist);
  return d / max(dist, 1.0) * fall * fall;
}

// Each point wanders about its place, with its own phases and pace: nothing moves together.
// (Nothing at t = 0, so the first frame is the poster.)
vec2 wander(vec4 seed) {
  float k = 0.45 + 0.9 * seed.w;
  vec2 a = vec2(sin(uTime * k + seed.x * 6.2832), cos(uTime * k * 1.3 + seed.y * 6.2832));
  vec2 b = vec2(sin(uTime * k * 2.3 + seed.z * 6.2832), cos(uTime * k * 1.9 + seed.x * 12.566));
  return (a + 0.5 * b) * 1.5 * min(1.0, uTime / 1.2);
}

// The cursor parts the points, one by one. Each answers like a critically damped spring to where
// the cursor has been: its push is the cursor's recent path weighed by that spring's response
// (t · e^-wt, all positive), so it leaves and comes back without ever overshooting, and at its own pace w.
// A click sends a front out: each point is thrown as the front passes and settles back the same way.
vec2 disturb(vec2 s, vec4 seed) {
  float w = 8.0 + 9.0 * seed.z;
  vec2 sum = vec2(0.0);
  float norm = 0.0;
  for (int k = 0; k < ${TRAIL.taps}; k++) {
    float tau = (float(k) + 0.5) * ${f(TRAIL.dt)};
    float g = tau * exp(-w * tau);
    sum += g * uTrail[k].z * push(s, uTrail[k].xy);
    norm += g;
  }
  // (a little gentler while the cursor is over the figure: there it opens as well)
  s += sum / norm * 58.0 * (1.0 - 0.4 * uHover.y) * (0.65 + 0.7 * seed.w);
  float t = uClick.z;
  if (t < 2.0) {
    vec2 d = s - uClick.xy;
    float dist = length(d);
    float tau = t - dist / 1000.0;
    if (tau > 0.0) {
      float x = tau / 0.1;
      vec2 dir = normalize(d + (seed.yz - 0.5) * 70.0 + vec2(1e-3));
      s += dir * uClick.w * exp(-dist / 300.0) * (0.4 + 1.2 * seed.w) * x * exp(1.0 - x);
    }
  }
  // the chip: no point crosses under the texts over it (their boxes' lower corners are cut at 45°);
  // the last pixels before the line squeeze, so the points a push sends there pile up instead
  if (uGuard > 0.0) {
    for (int i = 0; i < 2; i++) {
      float lim = uLintel[i].z - max(0.0, max(s.x - uLintel[i].y, uLintel[i].x - s.x));
      float over = lim + ${f(SQUEEZE)} - s.y;
      if (uLintel[i].w > 0.0 && over > 0.0) s.y = mix(s.y, lim + ${f(SQUEEZE)} * exp(-over / ${f(SQUEEZE)}), uGuard);
    }
  }
  return s;
}

vec4 toClip(vec2 s) { return vec4(s.x / uView.x * 2.0 - 1.0, 1.0 - s.y / uView.y * 2.0, 0.0, 1.0); }

// the small canvas of phones: fade near its edges, so nothing is cut by a straight line
float edgeFade(vec2 s) {
  vec2 n = abs(s / uView * 2.0 - 1.0);
  return 1.0 - uEdge * smoothstep(0.84, 1.0, max(n.x, n.y));
}`;

export const CLOUD_VERT = /* glsl */ `
attribute vec3 aSphere;   // the sphere the chip condenses from; normalised, the globe
attribute vec4 aChip;     // layer (-1 dust), core (-1 none), ring (-1 none), colour index in the bar chart (-1 none)
attribute vec4 aBars;     // x, t, z, code
attribute vec4 aGears;    // radius, angle, z, gear | x, y, z, -1
attribute vec4 aFunnel;   // x, y, z, code (lib/figure-cloud.ts)
attribute vec4 aFlow;
attribute vec4 aBook;
attribute vec4 aSize;     // diameter in the chip, the chart, the gears and the globe
attribute vec4 aAlpha;    // opacity in each of those
attribute vec4 aSize2;    // …and in the funnel, the pipeline and the book
attribute vec4 aAlpha2;
attribute vec4 aSeed;
uniform float uCoreClock, uWave;
uniform float uBarH[6];
uniform float uTrend[6];
uniform float uGear;
uniform vec4 uGearK[3];   // centre, turns per turn of the driver, phase
uniform vec4 uWire[${FLOW.wires.length}];    // the pipeline's wires: from (xy) to (zw)
uniform vec4 uInkA, uInkB;
uniform vec3 uAI[4];
varying vec4 vColor;
varying float vRadius;
${COMMON}

struct Dot { vec3 p; float size; float alpha; vec3 tint; float lit; };

Dot chipDot() {
  Dot d;
  float layer = aChip.x;
  float core = aChip.y;
  float ring = aChip.z;
  // sphere → chip, staggered per point, with a swirl about y that is zero at both ends
  float m = ease(clamp(uIntro * 1.6 - aSeed.x * 0.6, 0.0, 1.0));
  vec3 c = position;
  if (layer >= 0.0) {
    c.y += layerShift(layer);
  } else {
    // dust: a slow orbit about the chip's axis
    c.xz = turn(uTime * (0.07 + 0.13 * aSeed.y)) * c.xz;
  }
  vec3 p = mix(aSphere, c, m);
  float sw = sin(m * PI) * (aSeed.x - 0.5) * 1.6;
  p.xz = turn(sw) * p.xz;
  d.p = p;
  // twinkle (exactly 1 at t = 0, so the first frame matches the poster)
  d.alpha = aAlpha.x * (1.0 - 0.2 * (0.5 - 0.5 * cos(uTime * (0.9 + aSeed.w * 2.2))));
  d.size = aSize.x;
  d.tint = vec3(0.0);
  d.lit = 0.0;
  // the wave of light: out from the middle of the die and on along the traces
  float wave = ring >= 0.0 ? exp(-pow((ring - uWave) / 0.075, 2.0)) * m : 0.0;
  d.size *= 1.0 + (core >= 0.0 ? 0.2 : 0.85) * wave;
  d.alpha = mix(d.alpha, 1.0, wave);
  if (core >= 0.0) {
    // the cores fire in turn; all of them while the cursor is over the chip
    float ph = fract(uCoreClock - core / 8.0);
    float g = smoothstep(0.0, 0.06, ph) * (1.0 - smoothstep(0.18, 0.42, ph));
    g = max(max(g, wave), uHover.y) * m;
    d.tint = uAI[int(core + 0.5) % 4];
    d.lit = g;
    d.alpha = mix(d.alpha, 1.0, g);
    d.size *= 1.0 + 0.18 * g;
  }
  return d;
}

Dot barsDot() {
  Dot d;
  d.size = aSize.y;
  d.alpha = aAlpha.y;
  d.tint = vec3(0.0);
  d.lit = 0.0;
  float code = aBars.w;
  vec3 p = aBars.xyz;
  if (code >= 19.5) {
    int i = int(code - 19.5);
    p.y = uTrend[i];
    d.tint = uAI[i % 4];
    d.lit = 1.0;
  } else if (code >= 9.5) {
    int i = int(code - 9.5);
    p.y = mix(uTrend[i], uTrend[i + 1], aBars.y);
  } else if (code >= -0.5) {
    p.y = aBars.y * uBarH[int(code + 0.5)];
  }
  d.p = p;
  return d;
}

Dot gearsDot() {
  Dot d;
  d.size = aSize.z;
  d.alpha = aAlpha.z;
  d.tint = vec3(0.0);
  d.lit = 0.0;
  if (aGears.w >= -0.5) {
    vec4 k = uGearK[int(aGears.w + 0.5)];
    float a = aGears.y + k.w + uGear * k.z;
    d.p = vec3(k.xy + aGears.x * vec2(cos(a), sin(a)), aGears.z);
  } else {
    d.p = aGears.xyz;
  }
  return d;
}

Dot globeDot(mat3 rot) {
  Dot d;
  d.tint = vec3(0.0);
  d.lit = 0.0;
  vec3 nrm = normalize(aSphere);
  d.p = nrm * ${GLOBE_R.toFixed(3)};
  // the far side smaller and fainter (lib/figure-cloud.ts globeShade)
  float front = smoothstep(-0.75, 0.55, (rot * nrm).z);
  d.size = aSize.w * (0.6 + 0.4 * front);
  d.alpha = aAlpha.w * (0.14 + 0.86 * front);
  return d;
}

Dot funnelDot() {
  Dot d;
  d.size = aSize2.x;
  d.alpha = aAlpha2.x;
  d.tint = vec3(0.0);
  d.lit = 0.0;
  vec3 p = aFunnel.xyz;
  if (aFunnel.w > 1.5) {
    // what comes out: one file, evenly spaced, at one pace
    float u = fract(aFunnel.x + uRun * 0.13);
    p = vec3(0.0, ${f(FUNNEL.foot)} - u * ${f(FUNNEL.fall)}, 0.0);
    d.alpha *= smoothstep(0.0, 0.1, u) * (1.0 - smoothstep(0.75, 1.0, u));
    d.tint = uAI[int(aFunnel.x * ${f(FUNNEL.file)} + 0.5) % 4];
    d.lit = 1.0;
  } else if (aFunnel.w > 0.5) {
    // what goes in: every point on its own, circling the mouth one way or the other and bobbing
    p.xz = turn(uTime * (0.08 + 0.3 * aSeed.y) * (aSeed.z > 0.5 ? 1.0 : -1.0)) * p.xz;
    p.y += 0.06 * sin(uTime * (0.7 + 1.1 * aSeed.w) + aSeed.x * 6.2832);
  }
  d.p = p;
  return d;
}

Dot flowDot() {
  Dot d;
  d.size = aSize2.y;
  d.alpha = aAlpha2.y;
  d.tint = vec3(0.0);
  d.lit = 0.0;
  vec3 p = aFlow.xyz;
  if (aFlow.w > 9.5) {
    // along its wire, evenly spaced and at one pace: straight in x, an S in y; out of sight at the nodes
    bool packet = aFlow.w > 19.5;
    int wi = int(aFlow.w - (packet ? 19.5 : 9.5));
    vec4 wire = uWire[wi];
    float u = fract(aFlow.x + uRun * 0.16);
    p = vec3(mix(wire.x, wire.z, u), mix(wire.y, wire.w, u * u * (3.0 - 2.0 * u)), ${f(FLOW.thick / 2)});
    d.alpha *= smoothstep(0.0, 0.12, u) * (1.0 - smoothstep(0.88, 1.0, u));
    if (packet) {
      d.tint = uAI[wi % 4];
      d.lit = 1.0;
    }
  }
  d.p = p;
  return d;
}

Dot bookDot() {
  Dot d;
  d.size = aSize2.z;
  d.alpha = aAlpha2.z;
  d.tint = vec3(0.0);
  d.lit = 0.0;
  vec3 p = aBook.xyz;
  if (aBook.w > 0.5) {
    // a leaf turning about the spine, right to left: one at a time, each in its share of the cycle.
    // Flat it is arched like the page under it; in the air its edge trails behind.
    float ph = fract(uRun * 0.1 - (aBook.w - 1.0) / ${f(BOOK.leaves)}) * ${f(BOOK.leaves)};
    float go = clamp(ph / ${f(BOOK.air)}, 0.0, 1.0);
    float th = PI * ease(go);
    float fr = p.x / ${f(BOOK.W)};
    float n = ${f(BOOK.arch)} * sin(PI * fr) * cos(th) - ${f(BOOK.lag)} * fr * fr * sin(th);
    p = vec3(p.x * cos(th) - n * sin(th), p.x * sin(th) + n * cos(th) + 0.012, p.z);
    d.alpha *= smoothstep(0.0, 0.07, go) * (1.0 - smoothstep(0.93, 1.0, go));
  }
  d.p = p;
  return d;
}

Dot figure(int id, mat3 rot) {
  if (id == 0) return chipDot();
  if (id == 1) return barsDot();
  if (id == 2) return gearsDot();
  if (id == 3) return globeDot(rot);
  if (id == 4) return funnelDot();
  if (id == 5) return flowDot();
  return bookDot();
}

void main() {
  Dot a = figure(uFigA, uRotA);
  vec3 sa = place(a.p, uRotA, uBoxA);
  vec2 s = sa.xy;
  float size = a.size * sa.z;
  float alpha = a.alpha * mix(uInkA.a, 1.0, a.lit);
  vec3 col = mix(uInkA.rgb, a.tint, a.lit);
  float scale = uBoxA.z;

  if (uFigB != uFigA) {
    // in flight to another figure: each point leaves in its own time and bows out on the way
    Dot b = figure(uFigB, uRotB);
    vec3 sb = place(b.p, uRotB, uBoxB);
    float e = ease(clamp(uFlight * 1.5 - aSeed.x * 0.5, 0.0, 1.0));
    vec2 way = uBoxB.xy - uBoxA.xy;
    vec2 side = normalize(vec2(-way.y, way.x) + vec2(1e-3));
    float arc = sin(e * PI);
    s = mix(sa.xy, sb.xy, e) + side * arc * (aSeed.z - 0.35) * 0.3 * length(way) + arc * 7.0 * vec2(sin(uTime * 2.1 + aSeed.w * 6.2832), cos(uTime * 1.7 + aSeed.y * 6.2832));
    size = mix(size, b.size * sb.z, e);
    alpha = mix(alpha, b.alpha * mix(uInkB.a, 1.0, b.lit), e);
    col = mix(col, mix(uInkB.rgb, b.tint, b.lit), e);
    scale = mix(scale, uBoxB.z, e);
  }

  // mist: every point drifts off on its own heading, grows a little and fades (and the way back)
  float f = uForm >= 1.0 ? 1.0 : smoothstep(0.0, 1.0, clamp(uForm * 1.4 - aSeed.y * 0.4, 0.0, 1.0));
  float gone = 1.0 - f;
  vec2 heading = vec2(cos(aSeed.z * 6.2832), sin(aSeed.z * 6.2832));
  s += (heading * (0.12 + 0.34 * aSeed.w) + vec2(0.0, -0.1)) * gone * gone * scale + heading.yx * sin(uTime * 0.9 + aSeed.x * 6.2832) * 7.0 * gone;
  size *= 1.0 + 0.5 * gone;
  alpha *= f * f;

  s = disturb(s + wander(aSeed), aSeed);
  alpha *= edgeFade(s);
  float r = max(size, 0.0) * uDpr * 0.5;
  vRadius = r;
  vColor = vec4(col, alpha);
  gl_PointSize = 2.0 * r + 2.0;
  gl_Position = alpha > 0.002 ? toClip(s) : vec4(2.0, 2.0, 2.0, 1.0);
}`;

/* A crisp disc: one pixel of antialiasing on the rim, whatever the size. */
export const DOT_FRAG = /* glsl */ `
varying vec4 vColor;
varying float vRadius;
void main() {
  float d = length(gl_PointCoord - 0.5) * (2.0 * vRadius + 2.0);
  float a = clamp(vRadius - d + 0.5, 0.0, 1.0);
  if (a <= 0.0) discard;
  gl_FragColor = vec4(vColor.rgb, vColor.a * a);
}`;

export const PACKET_VERT = /* glsl */ `
attribute vec3 aP1, aP2, aP3;
attribute vec2 aMarks;
attribute vec3 aMotion; // speed, phase, tail index
attribute vec3 aColor;
uniform float uPulseClock, uSize, uChip;
varying vec4 vColor;
${COMMON}

vec3 along(float u) {
  if (u < aMarks.x) return mix(position, aP1, u / aMarks.x);
  if (u < aMarks.y) return mix(aP1, aP2, (u - aMarks.x) / (aMarks.y - aMarks.x));
  return mix(aP2, aP3, (u - aMarks.y) / (1.0 - aMarks.y));
}

void main() {
  float u = fract(uPulseClock * aMotion.x + aMotion.y) - aMotion.z * 0.04;
  float shown = step(0.0, u);
  u = clamp(u, 0.0, 1.0);
  vec3 p = along(u);
  p.y += layerShift(1.0); // the traces are on the interposer
  vec3 sp = place(p, uRotA, uBoxA);
  vec2 s = disturb(sp.xy, vec4(0.5));
  gl_Position = toClip(s);
  gl_PointSize = uSize * (1.0 - aMotion.z * 0.16) * sp.z * uDpr;
  float ends = smoothstep(0.0, 0.05, u) * (1.0 - smoothstep(0.92, 1.0, u));
  float a = (1.0 - aMotion.z * 0.19) * ends * shown * smoothstep(0.85, 1.0, uIntro) * uChip * edgeFade(s);
  vColor = vec4(aColor, a);
}`;

/* A bead of colour with a soft halo. */
export const GLOW_FRAG = /* glsl */ `
varying vec4 vColor;
void main() {
  float r = length(gl_PointCoord - 0.5) * 2.0;
  if (r > 1.0) discard;
  float bead = 1.0 - smoothstep(0.38, 0.52, r);
  float halo = (1.0 - smoothstep(0.3, 1.0, r)) * 0.32;
  gl_FragColor = vec4(vColor.rgb, vColor.a * max(bead, halo));
}`;
