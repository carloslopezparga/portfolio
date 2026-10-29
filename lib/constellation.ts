import { profile, refDomain } from "@/content/profile";
import type { DomainId, RefId, StackId } from "@/content/types";

export type Cluster = DomainId | "languages";

export interface StarPos {
  id: string;
  kind: "skill" | "language";
  cluster: Cluster;
  x: number;
  y: number;
  r: number;
  labelSide: "l" | "r";
}
export interface NodePos {
  id: RefId;
  domain: DomainId;
  x: number;
  y: number;
}
export interface ClusterPos {
  id: Cluster;
  x: number;
  y: number;
}
export interface Layout {
  w: number;
  h: number;
  stars: StarPos[];
  nodes: NodePos[];
  clusters: ClusterPos[];
}

const CLUSTERS = {
  landscape: { w: 1200, h: 620, c: { ai: [235, 150], automation: [965, 150], data: [235, 470], ops: [965, 470], engineering: [600, 70], languages: [600, 575] }, ell: [600, 305, 230, 128] },
  portrait: { w: 600, h: 900, c: { ai: [150, 130], automation: [450, 130], data: [150, 700], ops: [450, 700], engineering: [300, 40], languages: [300, 850] }, ell: [300, 415, 200, 165] },
} as const;

/** Base angle (screen coords, y down) where each domain's big nodes sit on the central ellipse. */
const BASE: Record<DomainId, number> = { ai: -150, automation: -30, data: 150, ops: 30, engineering: -90 };

export function weightOf(u: RefId | { id: RefId; w: number }) {
  return typeof u === "string" ? 1 : u.w;
}
export function idOf(u: RefId | { id: RefId; w: number }) {
  return typeof u === "string" ? u : u.id;
}

export function constellationLayout(orientation: "landscape" | "portrait"): Layout {
  const cfg = CLUSTERS[orientation];
  const stars: StarPos[] = [];
  const clusters: ClusterPos[] = [];

  const byCluster = new Map<Cluster, { id: string; kind: StarPos["kind"]; weight: number }[]>();
  profile.stack.forEach((s) => {
    const list = byCluster.get(s.domain) ?? [];
    list.push({ id: s.id, kind: "skill", weight: s.weight ?? 1 });
    byCluster.set(s.domain, list);
  });
  byCluster.set(
    "languages",
    profile.languages.map((l) => ({ id: `lang-${l.id}`, kind: "language" as const, weight: 1 })),
  );

  byCluster.forEach((list, cluster) => {
    const [cx, cy] = cfg.c[cluster];
    clusters.push({ id: cluster, x: cx, y: cy });
    if (cluster === "languages") {
      const span = orientation === "landscape" ? 320 : 360;
      list.forEach((s, i) => {
        const x = cx - span / 2 + (span * i) / Math.max(1, list.length - 1);
        stars.push({ id: s.id, kind: s.kind, cluster, x, y: cy, r: 3.5, labelSide: "r" });
      });
      return;
    }
    const n = list.length;
    const radius = n <= 2 ? 52 : 48 + n * 9;
    const offset = cluster === "ai" || cluster === "data" ? Math.PI : 0;
    list.forEach((s, i) => {
      const a = offset + (n === 1 ? 0 : (i / n) * Math.PI * 2) + 0.4;
      const x = cx + Math.cos(a) * radius;
      const y = cy + Math.sin(a) * radius * 0.72;
      stars.push({ id: s.id, kind: s.kind, cluster, x, y, r: 4 + (s.weight - 1) * 2.5, labelSide: x < cx ? "l" : "r" });
    });
  });

  // Big nodes evenly spaced on a central ellipse, grouped by domain and
  // ordered by angle so each group faces its domain's corner.
  const [ex, ey, rx, ry] = cfg.ell;
  const refs = (Object.keys(refDomain) as RefId[]).sort((a, b) => BASE[refDomain[a]] - BASE[refDomain[b]]);
  const step = 360 / refs.length;
  const firstGroup = refs.filter((id) => refDomain[id] === refDomain[refs[0]]).length;
  const start = BASE[refDomain[refs[0]]] - ((firstGroup - 1) * step) / 2;
  const nodes: NodePos[] = refs.map((id, i) => {
    const a = ((start + i * step) * Math.PI) / 180;
    return { id, domain: refDomain[id], x: ex + Math.cos(a) * rx, y: ey + Math.sin(a) * ry };
  });

  return { w: cfg.w, h: cfg.h, stars, nodes, clusters };
}

/** skill → [{ref, w}] and ref → [skill] lookups. */
export function links() {
  const out: { skill: StackId; ref: RefId; w: number }[] = [];
  profile.stack.forEach((s) => s.usedIn.forEach((u) => out.push({ skill: s.id, ref: idOf(u), w: weightOf(u) })));
  return out;
}
