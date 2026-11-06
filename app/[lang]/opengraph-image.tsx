import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";
import { LOCALES } from "@/content/types";
import { buildCloud, CLOUD_SIZE, project, projectedSize } from "@/lib/chip-cloud";
import { hasLocale } from "@/lib/i18n";

export const alt = `${profile.name} — ${profile.tagline.en}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

const INK = "#1d1d1f";
const GREY = "#6e6e73";
const BLUE = "#0066cc";
const CORE = ["#0a84ff", "#bf5af2", "#ff375f", "#ff9f0a"];
/** side of the box the chip's canvas maps to (the chip itself sits in its middle) */
const BOX = 560;

// the site's faces (WOFF2 on the page; TrueType here, which the card renderer reads)
const font = (file: string) => readFile(join(process.cwd(), "assets/og", file));
const [jakarta600, jakarta700, inter400, inter500] = await Promise.all(
  ["PlusJakartaSans-SemiBold.ttf", "PlusJakartaSans-Bold.ttf", "Inter-Regular.ttf", "Inter-Medium.ttf"].map(font),
);
const FONTS = [
  { name: "Jakarta", data: jakarta600, weight: 600 as const, style: "normal" as const },
  { name: "Jakarta", data: jakarta700, weight: 700 as const, style: "normal" as const },
  { name: "Inter", data: inter400, weight: 400 as const, style: "normal" as const },
  { name: "Inter", data: inter500, weight: 500 as const, style: "normal" as const },
];

/** The chip as the hero draws it at rest: the phone point cloud, assembled, cores in colour. */
function ChipDots() {
  const c = buildCloud(CLOUD_SIZE.mobile);
  const dots = [];
  for (let i = 0; i < c.n; i++) {
    const [u, v, depth] = project(c.chip.subarray(i * 3, i * 3 + 3));
    const core = c.core[i];
    dots.push(<circle key={i} cx={(u * BOX).toFixed(1)} cy={(v * BOX).toFixed(1)} r={((projectedSize(c.size[i], depth) * BOX) / 2).toFixed(2)} fill={core >= 0 ? CORE[core % 4] : INK} fillOpacity={core >= 0 ? 0.9 : c.alpha[i]} />);
  }
  return (
    <svg width={BOX} height={BOX} viewBox={`0 0 ${BOX} ${BOX}`}>
      {dots}
    </svg>
  );
}

/** Social card, in the site's light look: name, availability, the tagline in ink with one word in blue, summary, and the chip. */
export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang = hasLocale(raw) ? raw : "en";
  const [now, ...rest] = profile.availability[lang].split(" · ");
  // word by word, so the line wraps naturally; «automated / automatizados» in blue, its full stop in ink
  const words = profile.tagline[lang].split(" ").flatMap((w) => (/^automat/i.test(w) ? [{ t: w.replace(/[.,]$/, ""), blue: true, tail: w.match(/[.,]$/)?.[0] ?? "" }] : [{ t: w, blue: false, tail: "" }]));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#ffffff", color: INK, padding: "56px 0 56px 64px", fontFamily: "Inter" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 660 }}>
          <div style={{ fontFamily: "Jakarta", fontSize: 76, lineHeight: 1, letterSpacing: -3.4, fontWeight: 700 }}>{profile.name}</div>
          <div style={{ display: "flex", alignItems: "center", fontSize: 21, marginTop: 20 }}>
            <div style={{ width: 10, height: 10, borderRadius: 10, background: "#34c759", marginRight: 12 }} />
            <span style={{ fontWeight: 500 }}>{now}</span>
            {rest.length ? <span style={{ color: GREY, marginLeft: 8 }}>{`· ${rest.join(" · ")}`}</span> : null}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", fontFamily: "Jakarta", fontSize: 38, lineHeight: 1.18, marginTop: 30, fontWeight: 600, letterSpacing: -1.1 }}>
            {words.map((w, i) => (
              // one flex item per word, its punctuation glued on in ink
              <div key={i} style={{ display: "flex", marginRight: 9 }}>
                <span style={{ color: w.blue ? BLUE : INK }}>{w.t}</span>
                {w.tail ? <span style={{ color: INK }}>{w.tail}</span> : null}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 21, lineHeight: 1.45, marginTop: 22, color: INK }}>{profile.summary[lang]}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          <ChipDots />
        </div>
      </div>
    ),
    { ...size, fonts: FONTS },
  );
}
