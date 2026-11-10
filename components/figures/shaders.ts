import { CAM, FOCAL } from "@/lib/chip-cloud";
import { GLOBE_R } from "@/lib/figure-cloud";

/*
 * Everything a point does happens here, per vertex, from a handful of
 * uniforms: no per-particle simulation on the CPU. A point knows where it
 * sits in each figure; the page tells the shader which figure the cloud is
 * (A), which one it is flying to (B) and how far, where their gaps are on
 * screen, how they are turned, and what the cursor is doing.
 *
 * Positions are worked out in CSS pixels from the canvas's top-left (the
 * camera is the chip's: lib/chip-cloud.ts), so the cursor's push and the
 * click's shock wave are plain 2D pushes in the same space.
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
uniform vec4 uMouse;       // the cursor, twice: a quick follower (xy) and a slow, springy one (zw)
uniform vec2 uHover;       // x: a cursor is on the page; y: it is over the figure
uniform vec4 uClick;       // where, seconds since, and how hard (px)

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

// the chip's layers float, each with its own phase; hovering opens the stack about its middle
float layerShift(float layer) { return (layer - 1.5) * uSpread + 0.024 * sin(uTime * 0.9 + layer * 1.9); }

vec2 push(vec2 s, vec2 c, float amp) {
  vec2 d = s - c;
  float dist = length(d);
  float fall = 1.0 - smoothstep(0.0, 140.0, dist);
  return d / max(dist, 1.0) * fall * fall * amp;
}

// The cursor parts the points (they come back late, on the slow follower, and wobble with it);
// a click sends a shock front out: each point is thrown as the front passes and falls back.
vec2 disturb(vec2 s, vec4 seed) {
  // (a little gentler while the cursor is over the figure: there it opens as well)
  float w = uHover.x * (1.0 - 0.45 * uHover.y) * (0.7 + 0.6 * seed.w);
  s += push(s, uMouse.xy, 34.0 * w) + push(s, uMouse.zw, 30.0 * w);
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
attribute vec4 aSize;     // diameter in each figure
attribute vec4 aAlpha;    // opacity in each figure
attribute vec4 aSeed;
uniform float uCoreClock, uWave;
uniform float uBarH[6];
uniform float uTrend[6];
uniform float uGear;
uniform vec4 uGearK[3];   // centre, turns per turn of the driver, phase
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
    // dust: a slow orbit about the chip's axis, bobbing a little
    c.xz = turn(uTime * (0.07 + 0.13 * aSeed.y)) * c.xz;
    c.y += 0.035 * sin(uTime * 0.5 + aSeed.z * 6.2832);
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
  } else if (code < -1.5) {
    p.y += 0.05 * sin(uTime * 0.6 + aSeed.x * 6.2832);
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
    d.p = aGears.xyz + 0.04 * vec3(sin(uTime * 0.5 + aSeed.x * 6.2832), cos(uTime * 0.4 + aSeed.y * 6.2832), 0.0);
  }
  return d;
}

Dot globeDot(mat3 rot, vec3 box) {
  Dot d;
  d.tint = vec3(0.0);
  d.lit = 0.0;
  vec3 nrm = normalize(aSphere);
  // a slow swell over the surface
  float r = ${GLOBE_R.toFixed(3)} * (1.0 + 0.016 * sin(uTime * 0.7 + nrm.y * 5.0 + nrm.x * 3.0));
  float facing = (rot * nrm).z;
  // the cursor raises ripples that run out from it over the near side
  float dc = distance(place(nrm * r, rot, box).xy, uMouse.xy);
  float wv = sin(dc * 0.055 - uTime * 5.5) * exp(-dc / 150.0) * uHover.x * smoothstep(-0.2, 0.5, facing);
  d.p = nrm * r * (1.0 + 0.085 * wv + 0.04 * uHover.y);
  // the far side smaller and fainter (lib/figure-cloud.ts globeShade)
  float front = smoothstep(-0.75, 0.55, facing);
  d.size = aSize.w * (0.6 + 0.4 * front) * (1.0 + 0.5 * max(wv, 0.0));
  d.alpha = aAlpha.w * (0.14 + 0.86 * front);
  return d;
}

Dot figure(int id, mat3 rot, vec3 box) {
  if (id == 0) return chipDot();
  if (id == 1) return barsDot();
  if (id == 2) return gearsDot();
  return globeDot(rot, box);
}

void main() {
  Dot a = figure(uFigA, uRotA, uBoxA);
  vec3 sa = place(a.p, uRotA, uBoxA);
  vec2 s = sa.xy;
  float size = a.size * sa.z;
  float alpha = a.alpha * mix(uInkA.a, 1.0, a.lit);
  vec3 col = mix(uInkA.rgb, a.tint, a.lit);
  float scale = uBoxA.z;

  if (uFigB != uFigA) {
    // in flight to another figure: each point leaves in its own time and bows out on the way
    Dot b = figure(uFigB, uRotB, uBoxB);
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

  s = disturb(s, aSeed);
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
