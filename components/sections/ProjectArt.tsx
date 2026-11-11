"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import type { Locale, ProjectId } from "@/content/types";
import { BrandIcon, Glyph } from "@/components/ui/icons";
import { getPrefs } from "@/lib/prefs";

const T = {
  ranked: { en: "Ranked postings", es: "Ofertas ordenadas" },
  posting: { en: "Internship · Operations", es: "Prácticas · Operaciones" },
  score: { en: "Score · 7 factors", es: "Puntuación · 7 factores" },
  postings: { en: "6,400+ postings · 29 companies", es: "6.400+ ofertas · 29 empresas" },
  passed: { en: "116 passed", es: "116 passed" },
  digest: { en: "Today's digest", es: "Resumen de hoy" },
  groups: { en: ["Internships", "University", "Other"], es: ["Prácticas", "Universidad", "Otros"] },
  illustrative: { en: "Illustrative", es: "Ilustrativo" },
  generations: { en: "Generations", es: "Generaciones" },
  energy: { en: "Energy", es: "Energía" },
  byLLM: { en: "Written by an LLM", es: "Escrito por un LLM" },
  signs: { en: ["Stop", "Yield", "No entry"], es: ["Stop", "Ceda el paso", "Prohibido el paso"] },
  aiTurn: { en: "AI's turn", es: "Turno de la IA" },
};

/**
 * One floating card: tilted, at a depth (parallax strength), with its own
 * float period. `main` marks the one card each project keeps on phones, where
 * it is shown alone and large enough to read (see .frag-main in globals.css).
 */
function Frag({ children, className, rot, depth, float = 9, delay = 0, style, main }: { children: ReactNode; className: string; rot: number; depth: number; float?: number; delay?: number; style?: CSSProperties; main?: boolean }) {
  return (
    <div className={`frag ${main ? "frag-main" : ""} ${className}`} style={{ ["--rot" as string]: `${rot}deg`, ["--depth" as string]: depth, ["--fd" as string]: `${float}s`, animationDelay: `${delay}s`, ...style }}>
      {children}
    </div>
  );
}

const Bar = ({ w, className = "" }: { w: string; className?: string }) => <span className={`block h-1.5 rounded-full bg-[rgb(var(--fg-rgb)/0.1)] ${className}`} style={{ width: w }} />;

function JobHunt({ lang }: { lang: Locale }) {
  return (
    <>
      <Frag className="left-[6%] top-[12%] w-[46%]" rot={-5} depth={8} float={10}>
        <div className="flex gap-1">
          {["Greenhouse", "Lever", "Ashby"].map((s) => (
            <span key={s} className="rounded-full bg-[rgb(var(--fg-rgb)/0.06)] px-1.5 py-0.5 text-[8.5px] font-semibold text-fg">
              {s}
            </span>
          ))}
        </div>
        <p className="mt-2 text-[11px] font-semibold text-fg">{T.posting[lang]}</p>
        <Bar w="70%" className="mt-1.5" />
        <p className="mt-2.5 text-[9px] font-semibold text-muted">{T.score[lang]}</p>
        <span className="mt-1 block h-2 overflow-hidden rounded-full bg-[rgb(var(--fg-rgb)/0.08)]">
          <span className="block h-full w-[82%] rounded-full bg-[linear-gradient(90deg,var(--blue),var(--purple))]" />
        </span>
      </Frag>
      <Frag className="right-[6%] top-[8%] w-[42%]" rot={4} depth={14} float={8} delay={-2}>
        <p className="text-[10px] font-semibold text-fg">{T.ranked[lang]}</p>
        <ul className="mt-2 space-y-1.5">
          {[92, 78, 64, 51].map((v, i) => (
            <li key={v} className="flex items-center gap-1.5">
              <span className="w-3 text-[8.5px] font-semibold text-muted">{i + 1}</span>
              <Bar w="38%" />
              <span className="ml-auto h-1.5 w-[34%] overflow-hidden rounded-full bg-[rgb(var(--fg-rgb)/0.08)]">
                <span className="block h-full rounded-full bg-[var(--blue)]" style={{ width: `${v}%`, opacity: 0.4 + v / 160 }} />
              </span>
            </li>
          ))}
        </ul>
      </Frag>
      <Frag main className="frag-dark bottom-[9%] left-[20%] w-[60%] font-mono" rot={-2} depth={20} float={11} delay={-4}>
        <p className="text-[9.5px] leading-relaxed">
          <span className="text-[#2997ff]">$</span> shortlist fetch
          <br />
          <span className="text-[#a1a1a6]">{T.postings[lang]}</span>
          <br />
          <span className="text-[#2997ff]">$</span> pytest
          <br />
          <span className="text-[#30d158]">{T.passed[lang]}</span>
        </p>
      </Frag>
    </>
  );
}

function Mail({ lang }: { lang: Locale }) {
  const dots = ["var(--blue)", "var(--purple)", "var(--subtle)"];
  return (
    <>
      <Frag main className="left-[8%] top-[10%] w-[50%]" rot={-4} depth={10} float={10}>
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold text-fg">{T.digest[lang]}</p>
          <span className="text-[9px] font-semibold text-muted">07:00</span>
        </div>
        <div className="mt-2 space-y-2">
          {T.groups[lang].map((g, i) => (
            <div key={g}>
              <p className="flex items-center gap-1.5 text-[9px] font-semibold text-muted">
                <span className="size-1.5 rounded-full" style={{ background: dots[i] }} />
                {g}
              </p>
              <Bar w={["86%", "72%", "60%"][i]} className="ml-3 mt-1" />
              <Bar w={["64%", "50%", "40%"][i]} className="ml-3 mt-1" />
            </div>
          ))}
        </div>
      </Frag>
      <Frag className="bottom-[12%] right-[7%] w-[48%]" rot={5} depth={16} float={8} delay={-3}>
        <div className="flex items-center justify-between gap-1">
          <span className="grid size-8 place-items-center rounded-[10px] bg-[rgb(var(--fg-rgb)/0.05)]">
            <BrandIcon name="gmail" className="size-4 text-[#ea4335]" />
          </span>
          <span className="h-px flex-1 bg-[linear-gradient(90deg,var(--line-strong),var(--purple))]" />
          <span className="grid size-8 place-items-center rounded-[10px] bg-[rgb(var(--fg-rgb)/0.05)]">
            <BrandIcon name="claude" className="size-4 text-[#d97757]" />
          </span>
          <span className="h-px flex-1 bg-[linear-gradient(90deg,var(--purple),var(--line-strong))]" />
          <span className="grid size-8 place-items-center rounded-[10px] bg-[rgb(var(--fg-rgb)/0.05)] text-muted">
            <Glyph name="inbox" className="size-4" />
          </span>
        </div>
        <p className="mt-2 text-center text-[9px] font-semibold text-muted">n8n</p>
      </Frag>
    </>
  );
}

function Cooling({ lang }: { lang: Locale }) {
  // illustrative curves: each generation a little lower (less energy)
  const curves = [0, 1, 2, 3].map((g) => {
    const base = 62 - g * 11;
    return Array.from({ length: 9 }, (_, i) => `${i ? "L" : "M"}${8 + i * 18},${(base + Math.sin(i * 1.3 + g) * 5 + (8 - i) * 1.2).toFixed(1)}`).join(" ");
  });
  return (
    <>
      <Frag main className="left-[7%] top-[11%] w-[60%]" rot={-3} depth={10} float={10}>
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold text-fg">{T.generations[lang]}</p>
          <span className="rounded-full bg-[rgb(var(--cyan-rgb)/0.14)] px-1.5 py-0.5 text-[8.5px] font-semibold text-[var(--cyan-text)]">{T.illustrative[lang]}</span>
        </div>
        <svg viewBox="0 0 160 80" className="mt-1.5 w-full" aria-hidden>
          {curves.map((d, i) => (
            <path key={i} d={d} fill="none" strokeWidth={i === 3 ? 2 : 1.2} stroke={i === 3 ? "var(--cyan)" : "rgb(var(--fg-rgb) / 0.18)"} strokeLinecap="round" />
          ))}
        </svg>
        <p className="text-[8.5px] font-semibold text-muted">{T.energy[lang]} ↓</p>
      </Frag>
      <Frag className="frag-dark bottom-[10%] right-[7%] w-[44%] font-mono" rot={5} depth={18} float={9} delay={-3}>
        <p className="text-[8.5px] text-[#a1a1a6]">controller.py</p>
        <div className="mt-1.5 space-y-1">
          {["72%", "54%", "84%", "40%", "66%"].map((w, i) => (
            <span key={i} className="block h-1 rounded-full" style={{ width: w, marginLeft: i % 2 ? 8 : 0, background: i === 2 ? "#64d2ff" : "rgb(255 255 255 / 0.22)" }} />
          ))}
        </div>
        <p className="mt-2 text-[8.5px] text-[#64d2ff]">{T.byLLM[lang]}</p>
      </Frag>
    </>
  );
}

function CS50({ lang }: { lang: Locale }) {
  return (
    <>
      <Frag main className="left-[7%] top-[10%] w-[50%]" rot={-4} depth={10} float={10}>
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 40 40" className="size-9 shrink-0" aria-hidden>
            <polygon points="12,2 28,2 38,12 38,28 28,38 12,38 2,28 2,12" fill="#d70015" stroke="#fff" strokeWidth="2" />
            <text x="20" y="24" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">STOP</text>
          </svg>
          <p className="text-[9px] font-semibold text-muted">CNN · GTSRB</p>
        </div>
        <ul className="mt-2 space-y-1.5">
          {T.signs[lang].map((s, i) => (
            <li key={s}>
              <p className="text-[9px] font-semibold text-fg">{s}</p>
              <span className="mt-0.5 block h-1.5 overflow-hidden rounded-full bg-[rgb(var(--fg-rgb)/0.08)]">
                <span className="block h-full rounded-full" style={{ width: ["88%", "8%", "4%"][i], background: i ? "rgb(var(--fg-rgb) / 0.3)" : "var(--purple)" }} />
              </span>
            </li>
          ))}
        </ul>
      </Frag>
      <Frag className="bottom-[10%] right-[7%] w-[42%]" rot={5} depth={16} float={8} delay={-3}>
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold text-fg">Nim</p>
          <span className="text-[8.5px] font-semibold text-[var(--purple-text)]">Q-learning</span>
        </div>
        <div className="mt-2 space-y-1.5">
          {[1, 3, 5, 7].map((n) => (
            <div key={n} className="flex justify-center gap-1">
              {Array.from({ length: n }, (_, i) => (
                <span key={i} className="h-3 w-1 rounded-full bg-[rgb(var(--fg-rgb)/0.55)]" />
              ))}
            </div>
          ))}
        </div>
        <p className="mt-2 text-center text-[8.5px] font-semibold text-muted">{T.aiTurn[lang]}</p>
      </Frag>
    </>
  );
}

const ART: Record<ProjectId, (p: { lang: Locale }) => ReactNode> = {
  "job-hunt-copilot": JobHunt,
  "mail-autopilot": Mail,
  "cooling-agent": Cooling,
  "cs50-ai": CS50,
};

/**
 * Each project's illustration: two or three small, tilted cards of real-looking
 * interface (HTML/CSS, no images) that float slowly and shift with the
 * pointer, each at its own depth. Only real figures or generic labels.
 */
export function ProjectArt({ id, lang }: { id: ProjectId; lang: Locale }) {
  const ref = useRef<HTMLDivElement>(null);
  const Art = ART[id];
  return (
    <div
      ref={ref}
      className="frag-stage relative aspect-[16/10] overflow-hidden rounded-t-[var(--radius-card)]"
      aria-hidden
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || getPrefs().reduced) return;
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--px", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
        e.currentTarget.style.setProperty("--py", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
      }}
      onPointerLeave={(e) => {
        e.currentTarget.style.setProperty("--px", "0");
        e.currentTarget.style.setProperty("--py", "0");
      }}
    >
      <div className="frag-canvas">
        <Art lang={lang} />
      </div>
    </div>
  );
}
