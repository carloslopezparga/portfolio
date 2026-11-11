import type { DomainId } from "@/content/types";

/*
 * Layout of the skills graph (desktop): skill nodes grouped by domain, one
 * row per domain, on both sides; projects, jobs and studies as larger nodes
 * in three central columns (the middle one a half step down, like a
 * honeycomb); "used in" links between them. Compact: with a dozen skills it
 * is under 400 units tall. Pure geometry, so the server renders it and the
 * client only adds interaction.
 */

export const GRAPH_W = 1120;
const COL_DX = 104;
const ROW_DY = 82;
const LABEL_H = 26;
const CLUSTER_GAP = 12;
const TOP = 14;
const SIDES: Record<"left" | "right", { x: number[]; domains: DomainId[] }> = {
  left: { x: [64, 64 + COL_DX, 64 + COL_DX * 2], domains: ["ai", "automation", "ops"] },
  right: { x: [GRAPH_W - 64 - COL_DX * 2, GRAPH_W - 64 - COL_DX, GRAPH_W - 64], domains: ["data", "software"] },
};
const REF_X = [GRAPH_W / 2 - 132, GRAPH_W / 2, GRAPH_W / 2 + 132];

export interface GSkill {
  id: string;
  domain: DomainId;
  /** ref ids, with a weight (line thickness) */
  usedIn: { id: string; w: number }[];
}
export interface Placed {
  id: string;
  x: number;
  y: number;
}
export interface GraphLayout {
  w: number;
  h: number;
  skills: Placed[];
  refs: Placed[];
  clusters: { id: DomainId; x: number; y: number; anchor: "start" | "end" }[];
}

export function graphLayout(skills: GSkill[], refIds: string[]): GraphLayout {
  // each side on its own, from y = 0; then both centred on the taller one
  const sides = (["left", "right"] as const).map((side) => {
    const { x, domains } = SIDES[side];
    const nodes: Placed[] = [];
    const labels: GraphLayout["clusters"] = [];
    let y = 0;
    for (const d of domains) {
      const members = skills.filter((s) => s.domain === d);
      if (!members.length) continue;
      labels.push({ id: d, x: side === "left" ? x[0] - 22 : x[2] + 22, y: y + 12, anchor: side === "left" ? "start" : "end" });
      y += LABEL_H;
      members.forEach((s, i) => {
        const col = side === "left" ? i % 3 : 2 - (i % 3);
        nodes.push({ id: s.id, x: x[col], y: y + 22 + Math.floor(i / 3) * ROW_DY });
      });
      y += Math.ceil(members.length / 3) * ROW_DY + CLUSTER_GAP;
    }
    return { nodes, labels, height: Math.max(0, y - CLUSTER_GAP) };
  });
  const inner = Math.max(...sides.map((s) => s.height), 300);
  const placedSkills: Placed[] = [];
  const clusters: GraphLayout["clusters"] = [];
  for (const side of sides) {
    const dy = TOP + (inner - side.height) / 2;
    side.nodes.forEach((n) => placedSkills.push({ ...n, y: n.y + dy }));
    side.labels.forEach((l) => clusters.push({ ...l, y: l.y + dy }));
  }
  const h = TOP + inner;

  // Each ref goes to the central column nearest its skills, ordered by their height.
  const pos = new Map(placedSkills.map((p) => [p.id, p]));
  const stats = refIds.map((id) => {
    const linked = skills.filter((s) => s.usedIn.some((u) => u.id === id)).map((s) => pos.get(s.id)!);
    const mx = linked.length ? linked.reduce((a, p) => a + p.x, 0) / linked.length : GRAPH_W / 2;
    const my = linked.length ? linked.reduce((a, p) => a + p.y, 0) / linked.length : h / 2;
    return { id, mx, my };
  });
  const sorted = [...stats].sort((a, b) => a.mx - b.mx);
  const outer = Math.ceil(sorted.length / 3);
  const cols = [sorted.slice(0, outer), sorted.slice(outer, sorted.length - outer), sorted.slice(sorted.length - outer)].map((c) => c.sort((a, b) => a.my - b.my));
  const refs: Placed[] = [];
  const first = TOP + 28;
  const lastY = h - 50;
  const step = outer > 1 ? (lastY - first) / (outer - 1) : 0;
  cols.forEach((col, ci) => {
    // the middle column sits half a step lower, between its neighbours' rows
    const start = ci === 1 ? first + step / 2 + ((outer - 1 - col.length) * step) / 2 : first + ((outer - col.length) * step) / 2;
    col.forEach((r, i) => refs.push({ id: r.id, x: REF_X[ci], y: start + i * step }));
  });
  // room under the last row for two-line labels
  return { w: GRAPH_W, h: h + 18, skills: placedSkills, refs, clusters };
}

/** Word wrap into at most two lines: as many words as fit in `max` characters, then the rest. */
export function wrap(label: string, max = 15): string[] {
  if (label.length <= max) return [label];
  const words = label.split(" ");
  let first = words[0];
  let i = 1;
  while (i < words.length && `${first} ${words[i]}`.length <= max) first = `${first} ${words[i++]}`;
  const rest = words.slice(i).join(" ");
  return rest ? [first, rest] : [first];
}

/** A horizontal S-curve between two nodes. */
export const link = (a: Placed, b: Placed) => {
  const mx = (a.x + b.x) / 2;
  return `M${a.x} ${a.y} C${mx} ${a.y} ${mx} ${b.y} ${b.x} ${b.y}`;
};
