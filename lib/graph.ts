/*
 * The skills network (desktop): three layers in depth, like a neural
 * network: the skills (input), the projects (hidden) and the jobs and
 * studies (output). Each layer is a sheet of nodes; the sheets stand one
 * behind another, further right each time, and the camera looks at them
 * turned a little, so they recede. Pure geometry: the server lays the nodes
 * out in 3D and the client projects them on every frame (SkillsGraph.tsx).
 */

const DEG = Math.PI / 180;

export const NET = {
  /** The stage the view is composed for (px): the network at rest, with a margin. A smaller stage scales everything down. */
  w: 1136,
  h: 392,
  /** The camera: how far it is from the middle sheet (px, so nodes there are drawn at their own size), and its view at rest (rad). */
  focal: 3200,
  yaw: 25 * DEG,
  pitch: 5 * DEG,
  /** What moves it by itself: a slow sway about that view (rad, and rad/s of its phase)… */
  sway: 8 * DEG,
  swaySpeed: 0.3,
  /** …and how far the cursor over the network turns it (yaw, pitch). */
  parallax: [3 * DEG, 2 * DEG],
  /** A drag turns it this much per pixel (the nearest sheet about follows the pointer), and it comes home like a critically damped spring of this stiffness (with the speed it was let go at). */
  turn: 0.0025,
  home: 14,
  /** The sheets: how far apart in depth, where each is across (its middle), and the spacing of its columns; rows are the same everywhere. */
  depth: 270,
  x: [-500, 30, 530],
  col: [100, 112, 150],
  row: 94,
  /** A node's half width (its label's) and how far it reaches above and below its middle, for the frame of the view. */
  node: { half: 54, up: 26, down: 66 },
  /** How far a lit node comes towards the camera (px). */
  lift: 130,
};

export interface NetNode {
  id: string;
  /** 0 skills, 1 projects, 2 jobs and studies */
  layer: number;
  x: number;
  y: number;
  z: number;
}
export interface NetLayout {
  nodes: NetNode[];
  /** the middle of the network as the camera sees it at rest: the stage is centred on it */
  centre: [number, number];
}

/**
 * The camera at a yaw and a pitch: a function from a point of the network
 * (and how far it is lifted towards the camera) to where it is seen (x right,
 * y down, from the point the camera looks at), how large (1 on the middle
 * sheet) and how near (larger is nearer).
 */
export function camera(yaw: number, pitch: number) {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  return (x: number, y: number, z: number, lift = 0): [number, number, number, number] => {
    const x1 = x * cy + z * sy;
    const z1 = -x * sy + z * cy;
    const near = y * sp + z1 * cp + lift;
    const k = NET.focal / (NET.focal - near);
    return [x1 * k, -(y * cp - z1 * sp) * k, k, near];
  };
}

/** Three sheets of nodes, each filled by columns of three (a shorter last column is centred). */
export function netLayout(layers: string[][]): NetLayout {
  const nodes: NetNode[] = [];
  layers.forEach((ids, layer) => {
    const cols = Math.ceil(ids.length / 3);
    ids.forEach((id, i) => {
      const c = Math.floor(i / 3);
      const inCol = Math.min(3, ids.length - c * 3);
      nodes.push({ id, layer, x: NET.x[layer] + (c - (cols - 1) / 2) * NET.col[layer], y: ((inCol - 1) / 2 - (i % 3)) * NET.row, z: (1 - layer) * NET.depth });
    });
  });
  const see = camera(NET.yaw, NET.pitch);
  let x0 = Infinity;
  let x1 = -Infinity;
  let y0 = Infinity;
  let y1 = -Infinity;
  for (const n of nodes) {
    const [x, y, k] = see(n.x, n.y, n.z);
    x0 = Math.min(x0, x - NET.node.half * k);
    x1 = Math.max(x1, x + NET.node.half * k);
    y0 = Math.min(y0, y - NET.node.up * k);
    y1 = Math.max(y1, y + NET.node.down * k);
  }
  return { nodes, centre: [(x0 + x1) / 2, (y0 + y1) / 2] };
}
