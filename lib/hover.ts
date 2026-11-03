/*
 * Shared by the pointer (components/ui/Cursor.tsx) and the hover light
 * (components/ui/HoverGlow.tsx): which elements count as interactive, and
 * the shape (box and corner radius) each one is highlighted with.
 */

/** Buttons, links, chips, menu options… what the pointer snaps to. */
export const CONTROLS =
  'a[href], button, [role="button"], [role="tab"], [role="option"], [role="menuitem"], [role="switch"], summary, select, label[for], [data-cursor-morph]';

export interface HoverShape {
  left: number;
  top: number;
  width: number;
  height: number;
  radius: number;
}

const transparent = (c: string) => c === "transparent" || /rgba?\([^)]*,\s*0\)$/.test(c) || /\/\s*0\)$/.test(c);

/**
 * The box to highlight: the element itself when it has a visible shape
 * (pills, chips, tiles), a little padding around bare text links, and the
 * node's circle for the constellation's SVG nodes.
 */
export function shapeOf(el: Element): HoverShape {
  if (el instanceof SVGElement) {
    const hit = el.querySelector("circle") ?? el;
    const r = hit.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height, radius: Math.min(r.width, r.height) / 2 };
  }
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  const filled = !transparent(cs.backgroundColor) || cs.boxShadow !== "none" || cs.borderTopWidth !== "0px";
  const pad = filled ? 0 : r.height < 28 ? 5 : 3;
  const base = parseFloat(cs.borderTopLeftRadius) || 0;
  const width = r.width + pad * 2;
  const height = r.height + pad * 2;
  return { left: r.left - pad, top: r.top - pad, width, height, radius: Math.min(height / 2, width / 2, filled ? base : Math.max(base, 8) + pad) };
}
