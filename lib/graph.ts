import type { DomainId } from "@/content/types";

/*
 * Layout of the skills graph (desktop): skill nodes grouped by domain in
 * small grids on both sides, projects / jobs / studies as larger nodes in two
 * central columns, "used in" links between them. Pure geometry, so the
 * server renders it and the client only adds interaction.
 */

export const GRAPH_W = 1120;
const COL_DX = 106;
const ROW_DY = 100;
const LABEL_H = 34;
const CLUSTER_GAP = 22;
const TOP = 24;
const SIDES: Record<"left" | "right", { x: number[]; domains: DomainId[] }> = {
  left: { x: [64, 64 + COL_DX, 64 + COL_DX * 2], domains: ["ai", "automation", "ops"] },
  right: { x: [GRAPH_W - 64 - COL_DX * 2, GRAPH_W - 64 - COL_DX, GRAPH_W - 64], domains: ["data", "software"] },
};
const REF_X = [GRAPH_W / 2 - 92, GRAPH_W / 2 + 92];

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
  const placedSkills: Placed[] = [];
  const clusters: GraphLayout["clusters"] = [];
  let bottom = 0;
  for (const side of ["left", "right"] as const) {
    const { x, domains } = SIDES[side];
    let y = TOP;
    for (const d of domains) {
      const members = skills.filter((s) => s.domain === d);
      if (!members.length) continue;
      clusters.push({ id: d, x: side === "left" ? x[0] - 22 : x[2] + 22, y: y + 12, anchor: side === "left" ? "start" : "end" });
      y += LABEL_H;
      members.forEach((s, i) => {
        const col = side === "left" ? i % 3 : 2 - (i % 3);
        placedSkills.push({ id: s.id, x: x[col], y: y + 22 + Math.floor(i / 3) * ROW_DY });
      });
      y += Math.ceil(members.length / 3) * ROW_DY + CLUSTER_GAP;
    }
    bottom = Math.max(bottom, y);
  }
  const h = Math.max(bottom, 420);

  // Each ref goes to the central column nearest its skills, ordered by their height.
  const pos = new Map(placedSkills.map((p) => [p.id, p]));
  const stats = refIds.map((id) => {
    const linked = skills.filter((s) => s.usedIn.some((u) => u.id === id)).map((s) => pos.get(s.id)!);
    const mx = linked.length ? linked.reduce((a, p) => a + p.x, 0) / linked.length : GRAPH_W / 2;
    const my = linked.length ? linked.reduce((a, p) => a + p.y, 0) / linked.length : h / 2;
    return { id, mx, my };
  });
  const sorted = [...stats].sort((a, b) => a.mx - b.mx);
  const half = Math.ceil(sorted.length / 2);
  const cols = [sorted.slice(0, half), sorted.slice(half)].map((c) => c.sort((a, b) => a.my - b.my));
  const refs: Placed[] = [];
  const first = TOP + 30;
  const lastY = h - 40;
  cols.forEach((col, ci) => {
    col.forEach((r, i) => refs.push({ id: r.id, x: REF_X[ci], y: first + (col.length > 1 ? ((lastY - first) * i) / (col.length - 1) : (lastY - first) / 2) }));
  });
  // room under the last row for two-line labels
  return { w: GRAPH_W, h: h + 40, skills: placedSkills, refs, clusters };
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
