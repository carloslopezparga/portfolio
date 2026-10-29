import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";
import { LOCALES } from "@/content/types";
import { GEAR, neuralMesh, toothPath } from "@/lib/gears";
import { hasLocale } from "@/lib/i18n";

export const alt = `${profile.name} — ${profile.tagline.en}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

const COL = { ai: "#22d3ee", automation: "#4c8dff", data: "#8b7cff", ops: "#c7d7fe", engineering: "#e8edf5" };
const S = 118;
const C = 210;
const ring = toothPath(GEAR.zRing, GEAR.rRing, S, C, C, true);
const sun = toothPath(GEAR.zSun, GEAR.rSun, S, C, C);
const mesh = neuralMesh(11, 24, C, C);
const planets = GEAR.planetAngles.map((a, i) => ({
  d: toothPath(GEAR.zPlanet, GEAR.rPlanet, S, C + Math.cos(a) * GEAR.orbit * S, C - Math.sin(a) * GEAR.orbit * S),
  c: [COL.automation, COL.data, COL.ops][i],
}));

/** Social card: the gearbox on the right, the title block on the left. Default font (Geist). */
export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang = hasLocale(raw) ? raw : "en";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#05060a",
          backgroundImage: "linear-gradient(rgba(120,150,205,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(120,150,205,0.07) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          color: "#f5f7fa",
          padding: 56,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 660 }}>
          <div style={{ display: "flex", fontSize: 18, letterSpacing: 3, color: "#7d8594", textTransform: "uppercase" }}>
            {`REV A · ${lang === "en" ? "SHEET" : "LÁMINA"} 01 / 06`}
          </div>
          <div style={{ display: "flex", flexDirection: "column", border: "1px solid rgba(140,165,210,0.28)", padding: 32 }}>
            <div style={{ fontSize: 64, lineHeight: 1.04, letterSpacing: -2 }}>{profile.name}</div>
            <div style={{ fontSize: 30, lineHeight: 1.25, marginTop: 18, color: "#f5f7fa" }}>{profile.tagline[lang]}</div>
            <div style={{ display: "flex", alignItems: "center", marginTop: 26, fontSize: 19, color: "#a1a7b3" }}>
              <div style={{ width: 10, height: 10, borderRadius: 10, background: COL.ai, marginRight: 12 }} />
              {`${profile.location[lang]} · ${profile.availability[lang]}`}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          <svg width="420" height="420" viewBox="0 0 420 420">
            <circle cx={C} cy={C} r={(GEAR.rRing + 0.42) * S} fill="none" stroke={COL.engineering} strokeOpacity="0.45" strokeWidth="1.5" />
            <path d={ring} fill="none" stroke={COL.engineering} strokeOpacity="0.85" strokeWidth="1.5" />
            {planets.map((p, i) => (
              <path key={i} d={p.d} fill="none" stroke={p.c} strokeWidth="1.6" />
            ))}
            <path d={sun} fill="none" stroke={COL.ai} strokeWidth="1.8" />
            {mesh.edges.map(([a, b], i) => (
              <line key={i} x1={mesh.nodes[a][0]} y1={mesh.nodes[a][1]} x2={mesh.nodes[b][0]} y2={mesh.nodes[b][1]} stroke={COL.ai} strokeOpacity="0.55" strokeWidth="1" />
            ))}
            {mesh.nodes.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="2.4" fill={COL.ai} />
            ))}
          </svg>
        </div>
      </div>
    ),
    size,
  );
}
