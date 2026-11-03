import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";
import { LOCALES } from "@/content/types";
import { BALLS, boxFaces, CORES, FIN, iso, LAYERS, slabFaces, tracePath, TRACES } from "@/lib/chip";
import { hasLocale } from "@/lib/i18n";

export const alt = `${profile.name} — ${profile.tagline.en}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

const LINE = "#3a3a3d";
const faces = (f: { top: string; left: string; right: string }, k: string) => [
  <polygon key={`${k}l`} points={f.left} fill="#f5f5f7" stroke={LINE} strokeWidth="1" />,
  <polygon key={`${k}r`} points={f.right} fill="#e8e8ed" stroke={LINE} strokeWidth="1" />,
  <polygon key={`${k}t`} points={f.top} fill="#ffffff" stroke={LINE} strokeWidth="1" />,
];

/** Social card: the site's light look — name, the tagline in the Apple Intelligence gradient, summary, and the chip. */
export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang = hasLocale(raw) ? raw : "en";
  const { substrate: S, interposer: I, die: D, sink: H } = LAYERS;
  const finStep = (H.d * 2 - FIN.t) / (FIN.count - 1);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#ffffff", color: "#1d1d1f", padding: 64 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 700 }}>
          <div style={{ display: "flex", alignItems: "center", alignSelf: "flex-start", fontSize: 20, background: "#f5f5f7", borderRadius: 999, padding: "8px 18px" }}>
            <div style={{ width: 10, height: 10, borderRadius: 10, background: "#34c759", marginRight: 12 }} />
            {profile.availability[lang]}
          </div>
          <div style={{ fontSize: 80, lineHeight: 1, letterSpacing: -3.5, marginTop: 30, fontWeight: 700 }}>{profile.name}</div>
          <div
            style={{
              fontSize: 36,
              lineHeight: 1.2,
              marginTop: 22,
              fontWeight: 600,
              backgroundImage: "linear-gradient(90deg, #0066cc, #8944ab 36%, #d30f45 68%, #c93400)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {profile.tagline[lang]}
          </div>
          <div style={{ fontSize: 22, lineHeight: 1.45, marginTop: 22, color: "#6e6e73" }}>{profile.summary[lang]}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          <svg width="380" height="450" viewBox="-190 -332 380 450">
            {BALLS.map(([x, y]) => {
              const [cx, cy] = iso(x, y, S.z - 5);
              return <circle key={`${x},${y}`} cx={cx} cy={cy} r="3.6" fill="#fff" stroke={LINE} strokeWidth="1" />;
            })}
            {faces(slabFaces(S), "s")}
            {faces(slabFaces(I), "i")}
            {TRACES.map((t, i) => (
              <path key={i} d={tracePath(t, I.z + I.h)} fill="none" stroke={["#0a84ff", "#bf5af2", "#ff375f", "#ff9f0a"][i % 4]} strokeWidth="1.4" strokeOpacity="0.8" />
            ))}
            {faces(slabFaces(D), "d")}
            {CORES.map((c, i) => (
              <polygon key={i} points={boxFaces(c.x0, c.y0, c.x1, c.y1, D.z + D.h, 0).top} fill={["#0a84ff", "#bf5af2", "#ff375f", "#ff9f0a"][i % 4]} fillOpacity="0.25" stroke={LINE} strokeWidth="1" />
            ))}
            {faces(slabFaces(H), "h")}
            {Array.from({ length: FIN.count }, (_, k) => faces(boxFaces(-H.w + 4, -H.d + k * finStep, H.w - 4, -H.d + k * finStep + FIN.t, H.z + H.h, FIN.h), `f${k}`))}
          </svg>
        </div>
      </div>
    ),
    size,
  );
}
