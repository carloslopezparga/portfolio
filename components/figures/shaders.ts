import { CAM, FOCAL } from "@/lib/chip-cloud";
import { BOOK, FLOW, FUNNEL, GLOBE_R } from "@/lib/figure-cloud";
import { DRIFT, SIM } from "@/lib/particle-config";

/** Without the simulation: the cursor's recent path, as the shader gets it: this many samples, this many seconds apart (newest first). */
export const TRAIL = { taps: 12, dt: 0.06 };

/** The simulation's state lives in a texture this many texels wide: one texel per point. */
export const STATE_W = 128;

/** The strip (px) before the line the chip's points may not cross, where the ones pushed towards it squeeze (see scene.ts). */
export const SQUEEZE = 5;

const f = (n: number) => n.toFixed(4);

/*
 * Where a point goes is worked out here, per vertex, from a handful of
 * uniforms. A point knows where it sits in each figure; the page tells the
 * shader which figure the cloud is (A), which one it is flying to (B) and how
 * far, where their gaps are on screen and how they are turned.
 *
 * A figure is rigid: it turns as a whole and nothing in it stretches or
 * swings. What moves is each point, on its own. It drifts with a slow flow
 * its neighbours share. And the cursor moves it:
 *
 * - With a mouse (STATEFUL): every point has a state, how far it is from its
 *   place and how fast it moves, kept in a texture and advanced by a
 *   simulation pass (SIM) that runs this same code to find the point's place.
 *   The forces act where the point is: a spring back to its place, the
 *   cursor's push and its wake, a click's kick.
 * - Otherwise (phones, or no float textures): no state. The push is worked
 *   out from the cursor's recent path, as before.
 *
 * Positions are CSS pixels from the canvas's top-left (the camera is the
 * chip's: lib/chip-cloud.ts), so every push is a plain 2D push in that space.
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
uniform vec2 uHover;       // x: a cursor is on the page; y: it is over the figure
uniform vec4 uClick;       // where, seconds since, and how hard (px)
uniform vec4 uLintel[2];   // the chip: the texts over it, as left, right and the y no point may cross under them (w: in use)
uniform float uGuard;      // how much that applies
uniform float uRun;        // a clock for what a figure does by itself (faster under the cursor)
uniform vec2 uDrift;       // the drift: how far it carries a point (px), and its clock
#ifdef STATEFUL
uniform sampler2D uState;  // per point: how far it is from its place (xy, px) and how fast it moves (zw, px/s)
#else
uniform vec3 uTrail[${TRAIL.taps}];    // where the cursor was (xy) and whether it was on the page (z), newest first
#endif

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

// A smooth field, about -0.8..0.8: gradient noise on a lattice (a random slope at every node, blended in between).
vec3 slope(ivec3 c) {
  uvec3 q = uvec3(c) * uvec3(1597334677u, 3812015801u, 2798796415u);
  uint h = (q.x ^ q.y ^ q.z) * 1597334677u;
  h ^= h >> 15;
  h *= 2246822519u;
  h ^= h >> 13;
  return vec3(h & 1023u, (h >> 10) & 1023u, (h >> 20) & 1023u) / 511.5 - 1.0;
}
float corner(ivec3 c, vec3 f, ivec3 o) { return dot(slope(c + o), f - vec3(o)); }
float field(vec3 p) {
  vec3 i = floor(p);
  vec3 f = p - i;
  ivec3 c = ivec3(i);
  vec3 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(
    mix(mix(corner(c, f, ivec3(0, 0, 0)), corner(c, f, ivec3(1, 0, 0)), u.x), mix(corner(c, f, ivec3(0, 1, 0)), corner(c, f, ivec3(1, 1, 0)), u.x), u.y),
    mix(mix(corner(c, f, ivec3(0, 0, 1)), corner(c, f, ivec3(1, 0, 1)), u.x), mix(corner(c, f, ivec3(0, 1, 1)), corner(c, f, ivec3(1, 1, 1)), u.x), u.y),
    u.z);
}

// The drift: every point is carried by a slow flow through that field (its curl: nothing piles up), read where the
// point is, p pixels from the middle of its figure. Neighbours get nearly the same push, so the figure breathes
// instead of trembling. (Nothing at t = 0, so the first frame is the poster.)
vec2 drift(vec2 p) {
  vec3 q = vec3(p / ${f(DRIFT.cell)}, uDrift.y);
  float n = field(q);
  vec2 g = vec2(field(q + vec3(0.1, 0.0, 0.0)) - n, field(q + vec3(0.0, 0.1, 0.0)) - n) / 0.1;
  return vec2(g.y, -g.x) * uDrift.x * min(1.0, uTime / 1.2);
}

// the chip: no point crosses under the texts over it (their boxes' lower corners are cut at 45°);
// the last pixels before the line squeeze, so the points a push sends there pile up instead
vec2 guard(vec2 s) {
  if (uGuard > 0.0) {
    for (int i = 0; i < 2; i++) {
      float lim = uLintel[i].z - max(0.0, max(s.x - uLintel[i].y, uLintel[i].x - s.x));
      float over = lim + ${f(SQUEEZE)} - s.y;
      if (uLintel[i].w > 0.0 && over > 0.0) s.y = mix(s.y, lim + ${f(SQUEEZE)} * exp(-over / ${f(SQUEEZE)}), uGuard);
    }
  }
  return s;
}

#ifdef STATEFUL
ivec2 cellOf(int id) { return ivec2(id % ${STATE_W}, id / ${STATE_W}); }

// Where a point is drawn: its place, plus how far the simulation has it from there.
vec2 moved(vec2 s, vec4 seed, int id) { return guard(s + texelFetch(uState, cellOf(id), 0).xy); }
#else
// How far a point within 140 px of the cursor is asked to step aside.
vec2 push(vec2 s, vec2 c) {
  vec2 d = s - c;
  float dist = length(d);
  float fall = 1.0 - smoothstep(0.0, 140.0, dist);
  return d / max(dist, 1.0) * fall * fall;
}

// Without a state: each point answers like a critically damped spring to where the cursor has been. Its push is
// the cursor's recent path weighed by that spring's response (t · e^-wt, all positive), so it leaves and comes
// back without overshooting, at its own pace w. A click (a tap) sends a front out: each point is thrown as the
// front passes and settles back the same way.
vec2 moved(vec2 s, vec4 seed, int id) {
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
    float tau = t - dist / ${f(SIM.clickSpeed)};
    if (tau > 0.0) {
      float x = tau / 0.1;
      vec2 dir = normalize(d + (seed.yz - 0.5) * 70.0 + vec2(1e-3));
      s += dir * uClick.w * exp(-dist / ${f(SIM.clickReach)}) * (0.4 + 1.2 * seed.w) * x * exp(1.0 - x);
    }
  }
  return guard(s);
}
#endif

#ifdef SIM
uniform vec4 uCursor;      // the stretch the cursor covers in this step: from (xy) to (zw)
uniform vec3 uCursorV;     // its velocity (px/s), and how much it is on the page (0..1)
uniform vec3 uRepel;       // the cursor's reach (px), the hole it keeps clear (px), and its drag (1/s)
uniform vec3 uSpring;      // the spring's angular frequency (rad/s) and damping ratio; the step (s)
uniform vec2 uStateSize;
varying vec4 vState;

// The nearest point to p of the stretch the cursor covers in this step.
vec2 cursorNear(vec2 p) {
  vec2 ab = uCursor.zw - uCursor.xy;
  return uCursor.xy + ab * clamp(dot(p - uCursor.xy, ab) / max(dot(ab, ab), 1e-4), 0.0, 1.0);
}

// One step of a point's own physics: s is its place now, and the forces act where the point is (s plus how far
// it has been moved). Writes the new state into the point's texel.
void simulate(vec2 s, vec4 seed, int id) {
  vec4 state = texelFetch(uState, cellOf(id), 0);
  vec2 d = state.xy;
  vec2 v = state.zw;
  float dt = uSpring.z;

  // a spring back to its place, at the point's own frequency; critically damped it comes back with no bounce
  float w = uSpring.x * (0.8 + 0.4 * seed.z);
  vec2 acc = -w * w * d - 2.0 * uSpring.y * w * v;

  // the cursor pushes the points within its reach outwards, ever harder towards its centre: where push and
  // spring balance is the rim of the hole it keeps clear (a little wider or narrower for each point)
  float on = uCursorV.z;
  float reach = uRepel.x;
  float hole = min(uRepel.y, 0.85 * reach) * (0.9 + 0.2 * seed.w);
  vec2 off = s + d - cursorNear(s + d);
  float r = length(off);
  vec2 away = r > 1e-3 ? off / r : vec2(cos(seed.x * 6.2832), sin(seed.x * 6.2832));
  float x = max(0.0, 1.0 - r / reach);
  float x0 = 1.0 - hole / reach;
  acc += away * on * w * w * hole * x * x / (x0 * x0);
  // …and the points near it take on part of its velocity: the wake it leaves when it moves
  float near = max(0.0, 1.0 - r / (1.3 * reach));
  acc += on * uRepel.z * near * near * (uCursorV.xy - v);

  // a click: a front travels out from it and kicks each point as it passes, hard enough to throw it uClick.w px
  // (more or less, each its own) before the spring brings it back
  vec2 fromClick = s - uClick.xy;
  float dist = length(fromClick);
  float tau = uClick.z - dist / ${f(SIM.clickSpeed)};
  if (uClick.w > 0.0 && tau >= 0.0 && tau < ${f(SIM.clickPulse)}) {
    vec2 dir = normalize(fromClick + (seed.yz - 0.5) * 70.0 + vec2(1e-3));
    acc += dir * uClick.w * exp(-dist / ${f(SIM.clickReach)}) * (0.4 + 1.2 * seed.w) * 2.71828 * w / ${f(SIM.clickPulse)};
  }

  v += acc * dt;
  v *= min(1.0, ${f(SIM.maxSpeed)} / max(length(v), 1e-3));
  d += v * dt;

  // The middle of the hole is a wall that moves with the cursor: a point goes round it, never through. The wall
  // takes the point's speed towards it (nothing is flung) and, as the cursor moves, the point slides back along
  // it, the way water rounds a pebble: what is in the cursor's way steps aside instead of being pushed ahead.
  float core = ${f(SIM.core)} * hole * on;
  off = s + d - cursorNear(s + d);
  r = length(off);
  if (r < core) {
    away = r > 1e-3 ? off / r : away;
    d += away * (core - r) - (uCursorV.xy - away * dot(uCursorV.xy, away)) * dt;
    v -= away * min(dot(v, away), 0.0);
  }
  d *= min(1.0, ${f(SIM.maxOffset)} / max(length(d), 1e-3));

  vState = vec4(d, v);
  gl_Position = vec4((vec2(cellOf(id)) + 0.5) / uStateSize * 2.0 - 1.0, 0.0, 1.0);
  gl_PointSize = 1.0;
}
#endif

vec4 toClip(vec2 s) { return vec4(s.x / uView.x * 2.0 - 1.0, 1.0 - s.y / uView.y * 2.0, 0.0, 1.0); }

// the small canvas of phones: fade near its edges, so nothing is cut by a straight line
float edgeFade(vec2 s) {
  vec2 n = abs(s / uView * 2.0 - 1.0);
  return 1.0 - uEdge * smoothstep(0.84, 1.0, max(n.x, n.y));
}`;

/* The cloud's points: where each one is in every figure, and so its place on screen (shared by the pass that draws them and the one that simulates them). */
const CLOUD = /* glsl */ `
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

#ifdef FIGURES
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
  float code = aFunnel.w;
  if (code > 1.5 && code < 2.5) {
    // what comes out: one file, evenly spaced, at one pace
    float u = fract(aFunnel.x + uRun * 0.13);
    p = vec3(0.0, ${f(FUNNEL.foot)} - u * ${f(FUNNEL.fall)}, 0.0);
    d.alpha *= smoothstep(0.0, 0.1, u) * (1.0 - smoothstep(0.75, 1.0, u));
    d.tint = uAI[int(aFunnel.x * ${f(FUNNEL.file)} + 0.5) % 4];
    d.lit = 1.0;
  } else if (code > 0.5) {
    // what goes in: loose points that circle over the mouth, each at its own pace, sink into the cone and
    // turn faster as it narrows, down to the neck (lib/figure-cloud.ts looseAt); a few, in colour, are the finds
    float u = fract(aFunnel.y + uRun * ${f(FUNNEL.pace)} * (0.7 + 0.6 * aSeed.y));
    float y = mix(${f(FUNNEL.top + FUNNEL.swarm)}, ${f(FUNNEL.neck)}, pow(u, ${f(FUNNEL.sink)}));
    float t = max(0.0, (y - ${f(FUNNEL.neck)}) / ${f(FUNNEL.top - FUNNEL.neck)});
    float wide = y > ${f(FUNNEL.top)}
      ? mix(${f(0.9 * FUNNEL.R)}, ${f(FUNNEL.cloud)}, (y - ${f(FUNNEL.top)}) / ${f(FUNNEL.swarm)})
      : 0.9 * (${f(FUNNEL.r)} + ${f(FUNNEL.R - FUNNEL.r)} * pow(t, 1.5));
    float th = aFunnel.z + ${f(FUNNEL.turns * 2 * Math.PI)} * u * (0.4 + u);
    p = vec3(aFunnel.x * wide * cos(th), y + 0.03 * sin(uTime * (0.7 + 1.1 * aSeed.w) + aSeed.x * 6.2832), aFunnel.x * wide * sin(th));
    d.alpha *= smoothstep(0.0, 0.08, u) * (1.0 - smoothstep(0.9, 1.0, u));
    if (code > 2.5) {
      d.tint = uAI[int(code - 2.5)];
      d.lit = 1.0;
    }
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

#endif

// (phones only ever draw the chip: the rest is not even compiled there)
Dot figure(int id, mat3 rot) {
#ifdef FIGURES
  if (id == 1) return barsDot();
  if (id == 2) return gearsDot();
  if (id == 3) return globeDot(rot);
  if (id == 4) return funnelDot();
  if (id == 5) return flowDot();
  if (id == 6) return bookDot();
#endif
  return chipDot();
}

// A point's place on screen now, and how it looks there.
struct Seen { vec2 s; float size; float alpha; vec3 col; };

Seen target() {
  Dot a = figure(uFigA, uRotA);
  vec3 sa = place(a.p, uRotA, uBoxA);
  vec2 s = sa.xy;
  vec2 middle = uBoxA.xy;
  float size = a.size * sa.z;
  float alpha = a.alpha * mix(uInkA.a, 1.0, a.lit);
  vec3 col = mix(uInkA.rgb, a.tint, a.lit);
  float scale = uBoxA.z;

#ifdef FIGURES
  if (uFigB != uFigA) {
    // in flight to another figure: each point leaves in its own time and bows out on the way
    Dot b = figure(uFigB, uRotB);
    vec3 sb = place(b.p, uRotB, uBoxB);
    float e = ease(clamp(uFlight * 1.5 - aSeed.x * 0.5, 0.0, 1.0));
    vec2 way = uBoxB.xy - uBoxA.xy;
    vec2 side = normalize(vec2(-way.y, way.x) + vec2(1e-3));
    float arc = sin(e * PI);
    s = mix(sa.xy, sb.xy, e) + side * arc * (aSeed.z - 0.35) * 0.3 * length(way) + arc * 7.0 * vec2(sin(uTime * 2.1 + aSeed.w * 6.2832), cos(uTime * 1.7 + aSeed.y * 6.2832));
    middle = mix(middle, uBoxB.xy, e);
    size = mix(size, b.size * sb.z, e);
    alpha = mix(alpha, b.alpha * mix(uInkB.a, 1.0, b.lit), e);
    col = mix(col, mix(uInkB.rgb, b.tint, b.lit), e);
    scale = mix(scale, uBoxB.z, e);
  }
#endif

  // mist: every point drifts off on its own heading, grows a little and fades (and the way back)
  float f = uForm >= 1.0 ? 1.0 : smoothstep(0.0, 1.0, clamp(uForm * 1.4 - aSeed.y * 0.4, 0.0, 1.0));
  float gone = 1.0 - f;
  vec2 heading = vec2(cos(aSeed.z * 6.2832), sin(aSeed.z * 6.2832));
  s += (heading * (0.12 + 0.34 * aSeed.w) + vec2(0.0, -0.1)) * gone * gone * scale + heading.yx * sin(uTime * 0.9 + aSeed.x * 6.2832) * 7.0 * gone;
  size *= 1.0 + 0.5 * gone;
  alpha *= f * f;

  return Seen(s + drift(s - middle), size, alpha, col);
}`;

export const CLOUD_VERT = /* glsl */ `
varying vec4 vColor;
varying float vRadius;
${CLOUD}

void main() {
  Seen t = target();
  vec2 s = moved(t.s, aSeed, gl_VertexID);
  float alpha = t.alpha * edgeFade(s);
  float r = max(t.size, 0.0) * uDpr * 0.5;
  vRadius = r;
  vColor = vec4(t.col, alpha);
  gl_PointSize = 2.0 * r + 2.0;
  gl_Position = alpha > 0.002 ? toClip(s) : vec4(2.0, 2.0, 2.0, 1.0);
}`;

/* The simulation's pass over the same points: one step of each point's state, written to its texel. */
export const CLOUD_SIM = /* glsl */ `
${CLOUD}

void main() {
  simulate(target().s, aSeed, gl_VertexID);
}`;

export const STATE_FRAG = /* glsl */ `
varying vec4 vState;
void main() {
  gl_FragColor = vState;
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

/* The chip's data packets: beads that run along its traces. They have a state too (after the cloud's in the texture), so the cursor parts them with the points around them. */
const PACKETS = /* glsl */ `
attribute vec3 aP1, aP2, aP3;
attribute vec2 aMarks;
attribute vec3 aMotion; // speed, phase, tail index
attribute vec3 aColor;
uniform float uPulseClock, uSize, uChip;
uniform int uStateBase;
${COMMON}

vec3 along(float u) {
  if (u < aMarks.x) return mix(position, aP1, u / aMarks.x);
  if (u < aMarks.y) return mix(aP1, aP2, (u - aMarks.x) / (aMarks.y - aMarks.x));
  return mix(aP2, aP3, (u - aMarks.y) / (1.0 - aMarks.y));
}

// How far along its trace the bead is (negative: not out yet), and its place on screen (z: pixels per world unit).
vec3 target(out float u) {
  u = fract(uPulseClock * aMotion.x + aMotion.y) - aMotion.z * 0.04;
  vec3 p = along(clamp(u, 0.0, 1.0));
  p.y += layerShift(1.0); // the traces are on the interposer
  vec3 sp = place(p, uRotA, uBoxA);
  return vec3(sp.xy + drift(sp.xy - uBoxA.xy), sp.z);
}`;

export const PACKET_VERT = /* glsl */ `
varying vec4 vColor;
${PACKETS}

void main() {
  float u;
  vec3 sp = target(u);
  vec2 s = moved(sp.xy, vec4(0.5), uStateBase + gl_VertexID);
  gl_Position = toClip(s);
  gl_PointSize = uSize * (1.0 - aMotion.z * 0.16) * sp.z * uDpr;
  float ends = smoothstep(0.0, 0.05, u) * (1.0 - smoothstep(0.92, 1.0, u));
  float a = (1.0 - aMotion.z * 0.19) * ends * step(0.0, u) * smoothstep(0.85, 1.0, uIntro) * uChip * edgeFade(s);
  vColor = vec4(aColor, a);
}`;

export const PACKET_SIM = /* glsl */ `
${PACKETS}

void main() {
  float u;
  simulate(target(u).xy, vec4(0.5), uStateBase + gl_VertexID);
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
