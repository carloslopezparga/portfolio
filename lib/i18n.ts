import { has, LOCALES, type DateISO, type L, type Locale, type Maybe } from "@/content/types";

export const hasLocale = (v: string | undefined): v is Locale => !!v && (LOCALES as readonly string[]).includes(v);

/** Pick a language; returns null for TODOs so callers can skip rendering. */
export function t(value: Maybe<L> | undefined, lang: Locale): string | null {
  if (!has(value)) return null;
  return value[lang];
}

const MONTHS: Record<Locale, string[]> = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  es: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"],
};

export function formatMonth(d: DateISO, lang: Locale) {
  const [y, m] = d.split("-").map(Number);
  return `${MONTHS[lang][m - 1]} ${y}`;
}

/** "Nov 3" / "3 nov" for a day date; falls back to the month for "YYYY-MM". */
export function formatDay(d: DateISO, lang: Locale) {
  const [, m, day] = d.split("-").map(Number);
  if (!day) return formatMonth(d, lang);
  return lang === "en" ? `${MONTHS.en[m - 1]} ${day}` : `${day} ${MONTHS.es[m - 1]}`;
}

/** Academic year of a degree started in September (`start`), or null outside it. */
export function studyYear(start: DateISO, end: DateISO, now: Date) {
  const [sy] = start.split("-").map(Number);
  const [ey, em] = end.split("-").map(Number);
  const y = now.getUTCFullYear() - sy + (now.getUTCMonth() >= 8 ? 1 : 0);
  const total = ey - sy;
  const ended = now.getUTCFullYear() > ey || (now.getUTCFullYear() === ey && now.getUTCMonth() + 1 > em);
  return ended || y < 1 ? null : Math.min(y, total);
}

export function formatRange(start: DateISO | null, end: DateISO | null, lang: Locale) {
  const present = lang === "en" ? "Present" : "Actualidad";
  const s = start ? formatMonth(start, lang) : null;
  const e = end ? formatMonth(end, lang) : present;
  return s ? `${s} – ${e}` : e;
}

/** "upcoming" before the start date, "current" until the end date, otherwise "past". */
export function timeStatus(start: DateISO, end: DateISO | null, now: Date): "upcoming" | "current" | "past" {
  const toDate = (d: DateISO, endOfMonth = false) => {
    const [y, m, day] = d.split("-").map(Number);
    if (day) return new Date(Date.UTC(y, m - 1, day));
    return endOfMonth ? new Date(Date.UTC(y, m, 0, 23, 59)) : new Date(Date.UTC(y, m - 1, 1));
  };
  if (now < toDate(start)) return "upcoming";
  if (!end || now <= toDate(end, true)) return "current";
  return "past";
}

/** UI strings that are not profile content. */
export const ui = {
  viewProjects: { en: "View projects", es: "Ver proyectos" },
  askAgent: { en: "Ask my agent", es: "Pregúntale a mi agente" },
  downloadCV: { en: "Download CV", es: "Descargar CV" },
  cursor: {
    view: { en: "View", es: "Ver" },
    open: { en: "Open", es: "Abrir" },
    drag: { en: "Drag", es: "Arrastrar" },
    copy: { en: "Copy", es: "Copiar" },
    copied: { en: "Copied", es: "Copiado" },
  },
  status: {
    live: { en: "Live", es: "En marcha" },
    building: { en: "Building", es: "En construcción" },
    rnd: { en: "In development", es: "En desarrollo" },
    upcoming: { en: "Incoming", es: "Próximamente" },
    current: { en: "Current", es: "Actual" },
  },
  illustrative: { en: "Illustrative", es: "Ilustrativo" },
  repoSoon: { en: "Repo coming soon", es: "Repo próximamente" },
} satisfies Record<string, L | Record<string, L>>;
