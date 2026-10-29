import { profile, refLabels } from "@/content/profile";
import type { DomainId, RefId, StackId } from "@/content/types";

export type Cluster = DomainId | "languages";

export interface StarPos {
  id: string;
  kind: "skill" | "language";
  cluster: Cluster;
  x: number;
  y: number;
  r: number;
  /** 1–3: star and icon size. */
  weight: number;
  labelSide: "l" | "r";
}
export interface NodePos {
  id: RefId;
  x: number;
  y: number;
  /** Label beside the dot (phones) instead of under it. */
  labelSide?: "r";
}
export interface ClusterPos {
  id: Cluster;
  x: number;
  y: number;
  anchor?: "start" | "middle";
}
export interface Layout {
  w: number;
  h: number;
  stars: StarPos[];
  nodes: NodePos[];
  clusters: ClusterPos[];
}

export function weightOf(u: RefId | { id: RefId; w: number }) {
  return typeof u === "string" ? 1 : u.w;
}
export function idOf(u: RefId | { id: RefId; w: number }) {
  return typeof u === "string" ? u : u.id;
}

export function constellationLayout(orientation: "landscape" | "portrait"): Layout {
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
  return orientation === "portrait" ? portraitLayout(byCluster) : landscapeLayout(byCluster);
}

/** Big nodes in reading order: jobs, studies, projects, this site. */
const NODE_ORDER: RefId[] = ["prophero", "grupo-lalala", "induforum", "classy-night-society", "giti", "cs50", "job-hunt-copilot", "mail-autopilot", "cooling-agent", "this-site"];

type Groups = Map<Cluster, { id: string; kind: StarPos["kind"]; weight: number }[]>;

const starPos = (it: { id: string; kind: StarPos["kind"]; weight: number }, cluster: Cluster, x: number, y: number): StarPos => ({
  id: it.id,
  kind: it.kind,
  cluster,
  x,
  y,
  r: it.kind === "language" ? 3.5 : 4 + (it.weight - 1) * 2.5,
  weight: it.weight,
  labelSide: "r",
});

/**
 * Wide screens: domains as short columns on both sides (labels to the right,
 * so they never collide), the projects and jobs on an ellipse in the centre,
 * languages in a row underneath.
 */
function landscapeLayout(groups: Groups): Layout {
  const W = 1000;
  const stars: StarPos[] = [];
  const clusters: ClusterPos[] = [];
  const column = (ids: Cluster[], x: number) => {
    let y = 30;
    ids.forEach((cluster) => {
      const list = groups.get(cluster) ?? [];
      clusters.push({ id: cluster, x: x - 6, y, anchor: "start" });
      y += 38;
      list.forEach((it) => {
        stars.push(starPos(it, cluster, x + 12, y));
        y += 40;
      });
      y += 18;
    });
    return y;
  };
  const bottom = Math.max(column(["ai", "automation", "software"], 24), column(["data", "ops"], 740));
  const langY = bottom + 64;
  clusters.push({ id: "languages", x: W / 2, y: langY - 30 });
  (groups.get("languages") ?? []).forEach((it, i, all) => stars.push(starPos(it, "languages", W / 2 - 200 + (400 * i) / Math.max(1, all.length - 1), langY)));
  const cy = (bottom - 20) / 2 + 10;
  const nodes: NodePos[] = NODE_ORDER.map((id, i) => {
    const a = ((-90 + (i * 360) / NODE_ORDER.length) * Math.PI) / 180;
    return { id, x: W / 2 + Math.cos(a) * 165, y: cy + Math.sin(a) * (cy - 34) };
  });
  return { w: W, h: langY + 26, stars, nodes, clusters };
}

/** Longest label of a star across both languages, in characters. */
function labelLength(id: string) {
  const s = profile.stack.find((x) => x.id === id);
  if (s) return Math.max(s.label.en.length, s.label.es.length);
  const l = profile.languages.find((x) => `lang-${x.id}` === id);
  return l ? Math.max(l.name.en.length + l.level.en.length, l.name.es.length + l.level.es.length) + 1 : 10;
}

/**
 * Phones: each domain as a short list (two per row when the labels fit, one
 * when they don't), labels always to the right so nothing overflows; the big
 * nodes on an ellipse underneath.
 */
function portraitLayout(byCluster: Map<Cluster, { id: string; kind: StarPos["kind"]; weight: number }[]>): Layout {
  const W = 600;
  const ORDER: Cluster[] = ["ai", "automation", "data", "software", "ops", "languages"];
  const COLS = [34, 316];
  const CHAR = 10; // label width per character, in viewBox units
  const stars: StarPos[] = [];
  const clusters: ClusterPos[] = [];
  let y = 26;
  ORDER.forEach((cluster) => {
    const list = byCluster.get(cluster) ?? [];
    if (!list.length) return;
    clusters.push({ id: cluster, x: COLS[0] - 6, y, anchor: "start" });
    y += 40;
    for (let i = 0; i < list.length; ) {
      const a = list[i];
      const b = list[i + 1];
      const fits = (it: { id: string }) => 50 + labelLength(it.id) * CHAR < COLS[1] - COLS[0] - 10;
      const pair = b && fits(a) && fits(b);
      [a, ...(pair ? [b] : [])].forEach((it, col) =>
        stars.push({ id: it.id, kind: it.kind, cluster, x: COLS[col] + 14, y, r: it.kind === "language" ? 3.5 : 4 + (it.weight - 1) * 2.5, weight: it.weight, labelSide: "r" }),
      );
      i += pair ? 2 : 1;
      y += 44;
    }
    y += 14;
  });
  // the projects and jobs: two per row when both labels fit
  const nodes: NodePos[] = [];
  const nodeLen = (id: RefId) => Math.max(refLabels[id].en.length, refLabels[id].es.length);
  y += 18;
  for (let i = 0; i < NODE_ORDER.length; ) {
    const a = NODE_ORDER[i];
    const b = NODE_ORDER[i + 1];
    const fits = (id: RefId) => 40 + nodeLen(id) * CHAR < COLS[1] - COLS[0] - 10;
    const pair = b && fits(a) && fits(b);
    [a, ...(pair ? [b] : [])].forEach((id, col) => nodes.push({ id, x: COLS[col] + 14, y, labelSide: "r" }));
    i += pair ? 2 : 1;
    y += 46;
  }
  return { w: W, h: y + 6, stars, nodes, clusters };
}

/** skill → [{ref, w}] and ref → [skill] lookups. */
export function links() {
  const out: { skill: StackId; ref: RefId; w: number }[] = [];
  profile.stack.forEach((s) => s.usedIn.forEach((u) => out.push({ skill: s.id, ref: idOf(u), w: weightOf(u) })));
  return out;
}
