import {
  siClaude,
  siGithub,
  siGmail,
  siGreenhouse,
  siN8n,
  siNextdotjs,
  siPython,
  siTelegram,
  siTypescript,
  type SimpleIcon,
} from "simple-icons";
import type { StackId } from "@/content/types";

export const BRANDS = {
  python: siPython,
  nextjs: siNextdotjs,
  typescript: siTypescript,
  n8n: siN8n,
  claude: siClaude,
  gmail: siGmail,
  telegram: siTelegram,
  greenhouse: siGreenhouse,
  github: siGithub,
} satisfies Record<string, SimpleIcon>;
export type BrandName = keyof typeof BRANDS;

/** Brand colour, or the foreground token for near-black brands (Next.js, GitHub). */
export function brandColor(icon: SimpleIcon) {
  const n = parseInt(icon.hex, 16);
  const lum = (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
  return lum < 0.12 ? "var(--fg)" : `#${icon.hex}`;
}

export function BrandIcon({ name, className, title }: { name: BrandName; className?: string; title?: string }) {
  const icon = BRANDS[name];
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title ? <title>{title}</title> : null}
      <path d={icon.path} />
    </svg>
  );
}

/* Custom line glyphs, drawn on the same 24px grid with a 1.5 stroke. */
const GLYPHS = {
  mail: "M3.5 6.5h17v11h-17z M3.5 7l8.5 6 8.5-6",
  sheet: "M4 4h16v16H4z M4 9.3h16 M4 14.6h16 M9.3 4v16",
  form: "M6 3.5h12v17H6z M9 8.5h6 M9 12h6 M9 15.5h3.5",
  pdf: "M6 3.5h8l4 4v13H6z M14 3.5v4h4 M8.5 12.5h7 M8.5 15.5h5",
  doc: "M6 3.5h12v17H6z M9 8h6 M9 11.5h6 M9 15h4",
  inbox: "M3.5 13.5l2.5-8h12l2.5 8v5h-17z M3.5 13.5h5l1 2h5l1-2h5",
  database:
    "M5 6c0-1.4 3.1-2.5 7-2.5s7 1.1 7 2.5-3.1 2.5-7 2.5S5 7.4 5 6z M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6 M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5",
  api: "M8 5H6.5A1.5 1.5 0 005 6.5v3.2L3.5 12 5 14.3v3.2A1.5 1.5 0 006.5 19H8 M16 5h1.5A1.5 1.5 0 0119 6.5v3.2l1.5 2.3-1.5 2.3v3.2a1.5 1.5 0 01-1.5 1.5H16 M12 8.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z",
  automation: "M19 12a7 7 0 01-12 4.9 M5 12a7 7 0 0112-4.9 M17 4v3.1h-3.1 M7 20v-3.1h3.1 M12.6 8.5l-2 3.5h3l-2 3.5",
  operations: "M8.5 3.5h7v3h-7z M8.5 5H5.5v15.5h13V5h-3 M8.5 11.5l1.5 1.5 3-3 M8.5 16.5h7",
  sales: "M3.5 19.5h17 M5 15.5l4.5-4.5 3.5 3 6-6.5 M15 7.5h4v4",
  negotiation: "M4 8.5h14l-3.5-3.5 M20 15.5H6l3.5 3.5",
  drums: "M4 10c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z M4 10v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6 M8 3.5l3 4 M16 3.5l-3 4",
  vinyl: "M12 3.5a8.5 8.5 0 100 17 8.5 8.5 0 000-17z M12 10a2 2 0 100 4 2 2 0 000-4z M6.8 12A5.2 5.2 0 0112 6.8",
  golf: "M8 20.5V3.5l9 3.5-9 3.5 M5 20.5h9 M17.5 17a1.5 1.5 0 110 3 1.5 1.5 0 010-3z",
  sail: "M12 3.5v14 M12.8 5l6 10.5h-6z M11.2 7.5l-5 8h5z M4 18.5h16l-2 2.5H6z",
  chip: "M7 7h10v10H7z M10 10h4v4h-4z M9.5 4v3 M14.5 4v3 M9.5 17v3 M14.5 17v3 M4 9.5h3 M4 14.5h3 M17 9.5h3 M17 14.5h3",
  fan: "M12 10.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z M12 10.5c-1-3 0-6.5 3-6.5 1.5 0 2 2-1.2 4 M13.5 12c3-1 6.5 0 6.5 3 0 1.5-2 2-4-1.2 M12 13.5c1 3 0 6.5-3 6.5-1.5 0-2-2 1.2-4 M10.5 12c-3 1-6.5 0-6.5-3 0-1.5 2-2 4 1.2",
  check: "M5 12.5l4.5 4.5L19 7.5",
  search: "M10.5 4a6.5 6.5 0 100 13 6.5 6.5 0 000-13z M15.5 15.5l5 5",
  clock: "M12 3.5a8.5 8.5 0 100 17 8.5 8.5 0 000-17z M12 7.5V12l3 2",
  spark: "M12 4l1.6 4.8L18.5 10.5l-4.9 1.7L12 17l-1.6-4.8-4.9-1.7 4.9-1.7z",
  terminal: "M3.5 5h17v14h-17z M7 10l3 2-3 2 M12 15h4.5",
  command: "M9 9V6.5A2.5 2.5 0 106.5 9H9zm0 0v6m0-6h6m-6 6H6.5A2.5 2.5 0 109 17.5V15zm0 0h6m0-6V6.5A2.5 2.5 0 1117.5 9H15zm0 0v6m0 0v2.5a2.5 2.5 0 102.5-2.5H15z",
  globe: "M12 3.5a8.5 8.5 0 100 17 8.5 8.5 0 000-17z M3.5 12h17 M12 3.5c2.5 2.4 3.6 5.2 3.6 8.5s-1.1 6.1-3.6 8.5c-2.5-2.4-3.6-5.2-3.6-8.5S9.5 5.9 12 3.5z",
  download: "M12 4v11 M7.5 10.5L12 15l4.5-4.5 M5 19.5h14",
  chat: "M4.5 5.5h15v10h-9l-4 3.5v-3.5h-2z M8 10.5h.01 M12 10.5h.01 M16 10.5h.01",
  copy: "M9 9h10.5v11H9z M15 9V4.5H4.5V15H9",
  motion: "M4 12h3l2-6 3 12 2-8 2 4h4",
  hand: "M9 11V5.5a1.5 1.5 0 013 0V11 M12 10V4.5a1.5 1.5 0 013 0V11 M15 10.5V6a1.5 1.5 0 013 0v7.5a7 7 0 01-7 7h-.5a6 6 0 01-5-2.7L4 15a1.6 1.6 0 012.6-1.8L9 15.5",
  type: "M5 6.5V5h14v1.5 M12 5v14 M9.5 19h5",
  replay: "M5 12a7 7 0 107-7H9 M11.5 2.5L9 5l2.5 2.5",
  phone: "M8 3.5h8v17H8z M11 17.5h2",
} as const;
export type GlyphName = keyof typeof GLYPHS;

export function Glyph({ name, className, strokeWidth = 1.5 }: { name: GlyphName; className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={GLYPHS[name]} />
    </svg>
  );
}

/** Raw path data, for canvas drawing (Path2D). */
export const glyphPath = (name: GlyphName) => GLYPHS[name];

export const STACK_ICON: Record<StackId, { brand?: BrandName; glyph?: GlyphName }> = {
  python: { brand: "python" },
  sql: { glyph: "database" },
  nextjs: { brand: "nextjs" },
  typescript: { brand: "typescript" },
  n8n: { brand: "n8n" },
  "llm-apis": { glyph: "api" },
  "claude-code": { brand: "claude" },
  automation: { glyph: "automation" },
  operations: { glyph: "operations" },
  sales: { glyph: "sales" },
  negotiation: { glyph: "negotiation" },
};

export function StackIcon({ id, className }: { id: StackId; className?: string }) {
  const def = STACK_ICON[id];
  if (def.brand) return <BrandIcon name={def.brand} className={className} />;
  return <Glyph name={def.glyph!} className={className} />;
}

export function stackColor(id: StackId) {
  const def = STACK_ICON[id];
  return def.brand ? brandColor(BRANDS[def.brand]) : "var(--accent)";
}
