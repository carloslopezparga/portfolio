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

// Apple system colours (dark): ai purple, automation blue, data cyan, ops orange.
const COL = { ai: "#bf5af2", automation: "#0a84ff", data: "#64d2ff", ops: "#ff9f0a", ring: "#a8adb8" };
const S = 100;
const C = 200;
const ring = toothPath(GEAR.zRing, GEAR.rRing, S, C, C, true);
const sun = toothPath(GEAR.zSun, GEAR.rSun, S, C, C);
const mesh = neuralMesh(11, 24, C, C);
const planets = GEAR.planetAngles.map((a, i) => ({
  d: toothPath(GEAR.zPlanet, GEAR.rPlanet, S, C + Math.cos(a) * GEAR.orbit * S, C - Math.sin(a) * GEAR.orbit * S),
  c: [COL.automation, COL.data, COL.ops][i],
}));

/** Social card: name, headline and summary on the auroras; the gearbox on the right. Default font (Geist). */
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
          backgroundImage:
            "radial-gradient(ellipse 60% 70% at 8% 0%, rgba(10,132,255,0.38), transparent 70%), radial-gradient(ellipse 55% 65% at 95% 35%, rgba(191,90,242,0.34), transparent 70%), radial-gradient(ellipse 60% 50% at 40% 110%, rgba(255,55,95,0.28), transparent 70%)",
          color: "#f5f7fa",
          padding: 64,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 720 }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: 20, color: "#a8adb8" }}>
            <div style={{ width: 12, height: 12, borderRadius: 12, background: "#30d158", marginRight: 12 }} />
            {profile.availability[lang]}
          </div>
          <div style={{ fontSize: 76, lineHeight: 1, letterSpacing: -3, marginTop: 28 }}>{profile.name}</div>
          <div style={{ fontSize: 32, lineHeight: 1.25, marginTop: 22, color: "#c9a8ff" }}>{profile.tagline[lang]}</div>
          <div style={{ fontSize: 22, lineHeight: 1.45, marginTop: 22, color: "#a8adb8" }}>{profile.summary[lang]}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          <svg width="340" height="340" viewBox="0 0 400 400">
            <circle cx={C} cy={C} r={(GEAR.rRing + 0.42) * S} fill="none" stroke={COL.ring} strokeOpacity="0.4" strokeWidth="1.5" />
            <path d={ring} fill="none" stroke={COL.ring} strokeOpacity="0.75" strokeWidth="1.5" />
            {planets.map((p, i) => (
              <path key={i} d={p.d} fill="none" stroke={p.c} strokeWidth="2" />
            ))}
            <path d={sun} fill="none" stroke={COL.ai} strokeWidth="2" />
            {mesh.edges.map(([a, b], i) => (
              <line key={i} x1={mesh.nodes[a][0]} y1={mesh.nodes[a][1]} x2={mesh.nodes[b][0]} y2={mesh.nodes[b][1]} stroke={COL.ai} strokeOpacity="0.6" strokeWidth="1" />
            ))}
            {mesh.nodes.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="2.6" fill={COL.ai} />
            ))}
          </svg>
        </div>
      </div>
    ),
    size,
  );
}
