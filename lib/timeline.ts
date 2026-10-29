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

/** Smooth polyline through points (quadratic segments via midpoints). */
export function smoothPath(pts: number[][]) {
  const f = (n: number) => n.toFixed(1);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2;
    const my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += ` Q${f(pts[i][0])} ${f(pts[i][1])} ${f(mx)} ${f(my)}`;
  }
  const last = pts[pts.length - 1];
  return `${d} L${f(last[0])} ${f(last[1])}`;
}
