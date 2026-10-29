/**
 * Single source of truth for the website, the PDF CV and the agent.
 *
 * - Every user-facing string has an `en` and an `es` version.
 * - Unknown data is a string that starts with TODO: and is never rendered:
 *   a metric, a sentence or a whole item disappears until it is filled in.
 * - `npm run todos` lists what is still missing.
 * - `registry` (bottom) is the whitelist of ids the agent's UI tools may use.
 */
import type { DomainId, Hex, Locale, ProjectId, Profile, RefId, SectionId } from "./types";

export const profile: Profile = {
  name: "Carlos López Parga",
  initials: "CL",

  tagline: {
    en: "I turn manual operations into automated systems.",
    es: "Convierto operaciones manuales en sistemas automatizados.",
  },
  summary: {
    en: "Industrial Engineering student at ETSII-UPM and Tech Operations Intern at PropHero. I connect operations and technology: I find manual work and automate it with code, low-code and AI.",
    es: "Estudiante de Ingeniería Industrial en la ETSII-UPM y Tech Operations Intern en PropHero. Conecto operaciones y tecnología: detecto trabajo manual y lo automatizo con código, low-code e IA.",
  },
  location: { en: "Madrid", es: "Madrid" },
  availability: {
    en: "Open to internships 2027 · Full-time from Jan 2028",
    es: "Busco prácticas 2027 · Tiempo completo desde ene 2028",
  },
  email: "clpargaa@gmail.com",
  links: {
    linkedin: "https://www.linkedin.com/in/carloslopezparga",
    github: "https://github.com/carloslopezparga",
  },

  // Skill domains and their colours (see globals.css): ai purple, automation blue, data cyan, ops orange, software green.
  domains: [
    { id: "ai", label: { en: "AI", es: "IA" } },
    { id: "automation", label: { en: "Automation", es: "Automatización" } },
    { id: "data", label: { en: "Data & quant", es: "Datos y quant" } },
    { id: "ops", label: { en: "Operations", es: "Operaciones" } },
    { id: "software", label: { en: "Software", es: "Software" } },
  ],

  // Not shown on the site at the moment; kept for when the numbers exist.
  impact: [
    { id: "events", value: "TODO: nº de eventos operados", label: { en: "events run", es: "eventos operados" } },
    { id: "attendees", value: "TODO: asistentes totales", suffix: "+", label: { en: "attendees", es: "asistentes" } },
  ],

  // Brand colours: PropHero, ETSII and Retamar come from their websites; the
  // others are placeholders until the logo is in public/logos (the site then
  // reads the colour from the logo itself).
  experience: [
    {
      id: "prophero",
      company: "PropHero",
      brand: { logo: "prophero", monogram: "PH", color: "#2050F6" },
      role: { en: "Tech Operations Intern", es: "Tech Operations Intern" },
      context: { en: "Proptech", es: "Proptech" },
      location: { en: "Madrid", es: "Madrid" },
      mode: "TODO: presencial / híbrido / remoto",
      start: "2026-11-03",
      end: "2027-02",
      summary: {
        en: "The bridge between Operations and Technology: I spot manual work across buying, renovating, renting and managing properties, and automate it with low-code, scripting and AI.",
        es: "Puente entre Operaciones y Tecnología: detecto tareas manuales en compra, reforma, alquiler y gestión de inmuebles y las automatizo con low-code, scripting e IA.",
      },
      bullets: [
        { en: "Spot manual work across buying, renovating, renting and managing properties.", es: "Detectar tareas manuales en compra, reforma, alquiler y gestión de inmuebles." },
        { en: "Automate it with low-code, scripting and AI.", es: "Automatizarlas con low-code, scripting e IA." },
        { en: "Translate operational needs into requirements for the internal platform.", es: "Traducir necesidades operativas a requisitos para la plataforma interna." },
        { en: "Integrate data between tools and measure the impact of each automation.", es: "Integrar datos entre herramientas y medir el impacto de cada automatización." },
      ],
      results: "TODO: resultados",
      featured: true,
    },
    {
      id: "grupo-lalala",
      company: "Grupo Lalala",
      brand: { logo: "grupo-lalala", monogram: "GL", color: "#FF375F" },
      role: { en: "Operations & Sales Lead", es: "Operations & Sales Lead" },
      context: { en: "Events", es: "Eventos" },
      location: "TODO: ciudad",
      start: "2024-11",
      end: null,
      summary: {
        en: "Operations and sales for nightlife, private, daytime and sports events — including the F1 afternoon party, Mutua Madrid Open and Pádel XP — and the relationship with sponsors.",
        es: "Operaciones y ventas de eventos nocturnos, privados, diurnos y deportivos —tardeo de la F1, Mutua Madrid Open, Pádel XP— y relación con patrocinadores.",
      },
      bullets: [
        { en: "Operations for nightlife, private, daytime and sports events.", es: "Operaciones de eventos nocturnos, privados, diurnos y deportivos." },
        { en: "Events including the F1 afternoon party, Mutua Madrid Open and Pádel XP.", es: "Eventos como el tardeo de la F1, el Mutua Madrid Open y Pádel XP." },
        { en: "Event sales and the relationship with sponsors, including negotiation.", es: "Ventas de eventos y relación con patrocinadores, incluida la negociación." },
      ],
      results: "TODO: nº de eventos, asistentes y patrocinios",
      photo: "events-1",
    },
    {
      id: "induforum",
      company: "Induforum 2027",
      brand: { logo: "induforum", monogram: "IF", color: "#5E5CE6" },
      role: { en: "Organizer, corporate relations", es: "Organizador, área comercial" },
      context: { en: "ETSII-UPM job fair", es: "Feria de empleo de la ETSII-UPM" },
      location: { en: "Madrid", es: "Madrid" },
      start: "2026-10",
      end: null,
      summary: {
        en: "Bringing companies on board and managing the relationship with them.",
        es: "Captación y relación con empresas.",
      },
      bullets: [
        { en: "Organising Induforum 2027, the ETSII-UPM job fair.", es: "Organización de Induforum 2027, la feria de empleo de la ETSII-UPM." },
        { en: "Bringing companies on board for the fair.", es: "Captación de empresas para la feria." },
        { en: "Managing the relationship with participating companies.", es: "Relación con las empresas participantes." },
      ],
    },
    {
      id: "classy-night-society",
      company: "Classy Night Society",
      brand: { logo: "classy-night-society", monogram: "CNS", color: "#BF5AF2" },
      role: { en: "Operations Lead", es: "Operations Lead" },
      location: "TODO: ciudad",
      start: "2024-01",
      end: "2024-11",
      summary: "TODO: descripción del puesto",
      bullets: ["TODO: 3–4 bullets de qué hacías (sin cifras inventadas)"],
      results: "TODO: cifras",
    },
  ],

  education: [
    {
      id: "upm",
      institution: { en: "ETSII · Universidad Politécnica de Madrid", es: "ETSII · Universidad Politécnica de Madrid" },
      short: "ETSII-UPM",
      brand: { logo: "upm", monogram: "UPM", color: "#003262" },
      degree: { en: "BEng Industrial Technologies Engineering", es: "Grado en Ingeniería en Tecnologías Industriales" },
      specialisation: { en: "Intelligent Systems and Structures", es: "Sistemas y Estructuras Inteligentes" },
      start: "2023-09",
      end: "2028-06",
      chips: [
        { label: { en: "Top grade (MH) · Statistics", es: "MH · Estadística" } },
        { label: { en: "Top grade (MH) · Design of Experiments & Regression", es: "MH · Diseño de Experimentos y Regresión" } },
        { label: { en: "ETSII Mentor Programme", es: "Programa Mentor ETSII" }, target: "mentor" },
      ],
      featured: true,
    },
    {
      id: "retamar",
      institution: { en: "Colegio Retamar", es: "Colegio Retamar" },
      short: "Retamar",
      brand: { logo: "retamar", monogram: "R", color: "#001E60" },
      degree: { en: "Bachillerato, Science & Technology", es: "Bachillerato de Ciencias y Tecnología" },
      start: null,
      end: "2023-06",
      chips: [
        { label: { en: "GPA 9.41 / 10", es: "Nota media 9,41" } },
        { label: { en: "University entrance exam (PAU) 12.972 / 14", es: "PAU 12,972 / 14" } },
      ],
    },
  ],

  courses: [{ id: "cs50", name: "CS50", provider: "Harvard", brand: { logo: "cs50", monogram: "CS50", color: "#A51C30" }, detail: { en: "Python, SQL, AI", es: "Python, SQL, IA" } }],

  // The end of the education timeline: a small Monte Carlo cone.
  future: {
    erasmus: { start: "2027-09", end: "2027-12", destination: "TODO: destino Erasmus" },
    thesis: { en: "Final-year project (TFG)", es: "Trabajo Fin de Grado (TFG)" },
    fullTime: "2028-01",
    graduation: "2028-06",
  },

  projects: [
    {
      id: "job-hunt-copilot",
      domain: "automation",
      name: { en: "job-hunt-copilot", es: "job-hunt-copilot" },
      oneLiner: { en: "Finds, scores and prepares applications", es: "Busca, puntúa y prepara candidaturas" },
      status: "building",
      problem: {
        en: "Finding relevant roles across dozens of company job boards and preparing tailored material for each one is slow, repetitive work.",
        es: "Encontrar ofertas relevantes en decenas de tableros de empleo y preparar material adaptado para cada una es un trabajo lento y repetitivo.",
      },
      built: {
        en: "A Python CLI that pulls openings from the public Greenhouse, Lever and Ashby job boards, scores them against my profile and prepares the application material. No LinkedIn scraping — I send every application myself.",
        es: "Una CLI en Python que descarga ofertas de los tableros públicos de Greenhouse, Lever y Ashby, las puntúa contra mi perfil y prepara el material de candidatura. Sin scraping de LinkedIn: las candidaturas las envío yo.",
      },
      next: { en: "Next: a Telegram interface.", es: "Próximo paso: interfaz por Telegram." },
      stack: ["python", "automation", "claude-code"],
      repo: { url: "https://github.com/carloslopezparga/job-hunt-copilot", public: false },
      demo: { kind: "terminal", file: "content/demos/job-hunt-copilot.txt" },
    },
    {
      id: "mail-autopilot",
      domain: "ai",
      name: { en: "Email on autopilot", es: "Correo en piloto automático" },
      oneLiner: { en: "n8n + Claude daily digest", es: "Resumen diario con n8n + Claude" },
      status: "building",
      problem: {
        en: "Checking email and hunting for internships every day eats hours that should go into building things.",
        es: "Revisar el correo y buscar prácticas a diario se come horas que deberían ir a construir cosas.",
      },
      built: {
        en: "An n8n + Claude workflow that writes a daily AI summary of my email and delivers it to my inbox.",
        es: "Un flujo de n8n + Claude que redacta un resumen diario de mi correo con IA y me lo entrega en la bandeja.",
      },
      next: {
        en: "In progress: a daily internship search with Telegram alerts, plus a CV and cover letter tailored to each posting.",
        es: "En construcción: búsqueda diaria de prácticas con avisos por Telegram y CV + carta adaptados a cada oferta.",
      },
      stack: ["n8n", "llm-apis", "automation"],
      demo: { kind: "mail-flow" },
      screenshot: "n8n-flow",
    },
    {
      id: "cooling-agent",
      domain: "data",
      name: { en: "AI agent for data-center cooling", es: "Agente de IA para refrigeración de centros de datos" },
      oneLiner: { en: "Evolving controllers in a simulator", es: "Controladores que evolucionan en un simulador" },
      status: "rnd",
      problem: {
        en: "Good cooling control policies are hard to design by hand and slow to iterate on.",
        es: "Las buenas políticas de control de refrigeración son difíciles de diseñar a mano y lentas de iterar.",
      },
      built: {
        en: "An evolutionary agent that uses LLMs to write and improve cooling controllers, each one evaluated in a simulator.",
        es: "Un agente evolutivo con LLMs que escribe y mejora controladores de refrigeración, evaluados en un simulador.",
      },
      next: "TODO: resultados reales del simulador",
      stack: ["python", "llm-apis"],
      demo: { kind: "cooling", illustrative: true },
    },
  ],

  // Constellation. weight = star size (1–3); usedIn {id, w} = line thickness.
  stack: [
    { id: "llm-apis", label: { en: "LLM APIs", es: "APIs de LLMs" }, domain: "ai", weight: 3, usedIn: ["mail-autopilot", "cooling-agent", "this-site"] },
    { id: "claude-code", label: { en: "Claude Code", es: "Claude Code" }, domain: "ai", weight: 3, usedIn: ["this-site", "job-hunt-copilot"] },
    { id: "automation", label: { en: "Process automation", es: "Automatización de procesos" }, domain: "automation", weight: 3, usedIn: ["prophero", "mail-autopilot", "job-hunt-copilot"] },
    { id: "n8n", label: { en: "n8n", es: "n8n" }, domain: "automation", weight: 2, usedIn: ["mail-autopilot"] },
    { id: "python", label: { en: "Python", es: "Python" }, domain: "data", weight: 3, usedIn: ["job-hunt-copilot", "cooling-agent", "cs50"] },
    { id: "stats", label: { en: "Statistics & regression", es: "Estadística y regresión" }, domain: "data", weight: 2, usedIn: ["giti"] },
    { id: "sql", label: { en: "SQL", es: "SQL" }, domain: "data", weight: 1, usedIn: ["cs50"] },
    { id: "nextjs", label: { en: "Next.js", es: "Next.js" }, domain: "software", weight: 2, usedIn: ["this-site"] },
    { id: "typescript", label: { en: "TypeScript", es: "TypeScript" }, domain: "software", weight: 1, usedIn: ["this-site"] },
    { id: "operations", label: { en: "Operations", es: "Operaciones" }, domain: "ops", weight: 3, usedIn: ["grupo-lalala", "classy-night-society", "prophero"] },
    { id: "sales", label: { en: "Sales", es: "Ventas" }, domain: "ops", weight: 2, usedIn: ["grupo-lalala", "induforum"] },
    { id: "negotiation", label: { en: "Sponsor negotiation", es: "Negociación con patrocinadores" }, domain: "ops", weight: 2, usedIn: ["grupo-lalala"] },
  ],

  languages: [
    { id: "es", name: { en: "Spanish", es: "Español" }, level: { en: "Native", es: "Nativo" } },
    { id: "en", name: { en: "English", es: "Inglés" }, level: { en: "C1", es: "C1" } },
    { id: "fr", name: { en: "French", es: "Francés" }, level: { en: "B2", es: "B2" } },
    { id: "pt", name: { en: "Portuguese", es: "Portugués" }, level: { en: "Basic", es: "Básico" } },
  ],

  leadership: [
    {
      id: "dana",
      accent: "orange",
      title: { en: "Valencia DANA flood response", es: "Respuesta a la DANA de Valencia" },
      description: {
        en: "Coordinated the humanitarian response to the DANA floods in Valencia.",
        es: "Coordinación de la respuesta humanitaria a la DANA de Valencia.",
      },
      metric: "TODO: voluntarios coordinados, toneladas / envíos",
      start: "TODO: mes de inicio (AAAA-MM)",
      end: "TODO: mes de fin (AAAA-MM)",
      photo: "dana",
    },
    {
      id: "mentor",
      accent: "indigo",
      title: { en: "ETSII Mentor Programme", es: "Programa Mentor ETSII" },
      description: {
        en: "Two years mentoring students from other cohorts.",
        es: "Dos años como mentor de alumnos de otras promociones.",
      },
      metric: "TODO: nº de mentorizados",
      start: "TODO: inicio (AAAA-MM)",
      end: "TODO: fin (AAAA-MM)",
      photo: "mentor",
    },
    {
      id: "food-bank",
      accent: "green",
      title: { en: "Madrid Food Bank campaigns", es: "Campañas del Banco de Alimentos" },
      description: {
        en: "Food collection campaigns with the Food Bank in Madrid.",
        es: "Campañas de recogida con el Banco de Alimentos en Madrid.",
      },
      metric: "TODO: kg recogidos",
      start: "TODO: fecha (AAAA-MM)",
      photo: "volunteering-1",
    },
    {
      id: "charity-events",
      accent: "pink",
      title: { en: "Charity events", es: "Eventos benéficos" },
      description: {
        en: "Charity events I organised myself.",
        es: "Eventos benéficos organizados por mí.",
      },
      metric: "TODO: € recaudados y destino",
      start: "TODO: fecha (AAAA-MM)",
    },
    {
      id: "orphanage",
      accent: "cyan",
      title: { en: "Orphanage build, South Africa", es: "Orfanato en Sudáfrica" },
      description: {
        en: "Construction work at an orphanage in South Africa.",
        es: "Construcción en un orfanato en Sudáfrica.",
      },
      start: "TODO: fecha (AAAA-MM)",
      photo: "volunteering-2",
    },
  ],

  offTheClock: [
    { id: "drums", label: { en: "Drums", es: "Batería" } },
    { id: "dj", label: { en: "DJ (DJ CHARLY)", es: "DJ (DJ CHARLY)" } },
    { id: "golf", label: { en: "Golf · handicap 18.5", es: "Golf · hándicap 18,5" } },
    { id: "sailing", label: { en: "Sailing", es: "Vela" } },
  ],
};

/** Display names for every node a skill can point to. */
export const refLabels: Record<RefId, { en: string; es: string }> = {
  "job-hunt-copilot": { en: "job-hunt-copilot", es: "job-hunt-copilot" },
  "mail-autopilot": { en: "Email on autopilot", es: "Correo en piloto automático" },
  "cooling-agent": { en: "Cooling agent", es: "Agente de refrigeración" },
  prophero: { en: "PropHero", es: "PropHero" },
  "grupo-lalala": { en: "Grupo Lalala", es: "Grupo Lalala" },
  "classy-night-society": { en: "Classy Night Society", es: "Classy Night Society" },
  induforum: { en: "Induforum 2027", es: "Induforum 2027" },
  giti: { en: "GITI degree", es: "Grado GITI" },
  cs50: { en: "CS50", es: "CS50" },
  "this-site": { en: "This website", es: "Esta web" },
};

/**
 * Colour of each big node: organisations use their brand (by logo name),
 * projects and this site use their skill domain.
 */
export const refTone: Record<RefId, { domain: DomainId } | { brand: string; fallback: Hex }> = (() => {
  const org = (b: { logo: string; color: Hex }) => ({ brand: b.logo, fallback: b.color });
  const xp = (id: string) => org(profile.experience.find((e) => e.id === id)!.brand);
  return {
    "job-hunt-copilot": { domain: "automation" },
    "mail-autopilot": { domain: "ai" },
    "cooling-agent": { domain: "data" },
    "this-site": { domain: "software" },
    prophero: xp("prophero"),
    "grupo-lalala": xp("grupo-lalala"),
    induforum: xp("induforum"),
    "classy-night-society": xp("classy-night-society"),
    giti: org(profile.education[0].brand),
    cs50: org(profile.courses[0].brand),
  };
})();

export const sectionLabels: Record<SectionId, { en: string; es: string }> = {
  top: { en: "Home", es: "Inicio" },
  now: { en: "Right now", es: "Ahora mismo" },
  experience: { en: "Experience", es: "Experiencia" },
  education: { en: "Education", es: "Formación" },
  projects: { en: "Projects", es: "Proyectos" },
  skills: { en: "Skills", es: "Skills" },
  leadership: { en: "Leadership", es: "Liderazgo" },
  contact: { en: "Contact", es: "Contacto" },
};

/** Sections in page order (their number is shown in each header). */
export const SECTIONS: SectionId[] = ["top", "now", "experience", "education", "projects", "skills", "leadership", "contact"];

/** Gearbox parts the agent may light up (a visual effect only). */
export const GEARBOX_PARTS = ["ai", "automation", "data", "ops"] as const satisfies readonly DomainId[];

/**
 * Whitelist for the agent's UI tools. Anything not listed here is rejected
 * by /api/chat before it reaches the browser.
 */
export const registry = {
  sections: SECTIONS,
  projects: profile.projects.map((p) => p.id) as ProjectId[],
  parts: [...GEARBOX_PARTS],
  /** Elements that carry data-target-id on the page. */
  targets: [
    ...profile.experience.map((e) => e.id),
    ...profile.education.map((e) => e.id),
    ...profile.courses.map((c) => c.id),
    "erasmus",
    "full-time",
    ...profile.projects.map((p) => p.id),
    ...profile.stack.map((s) => s.id),
    ...profile.languages.map((l) => `lang-${l.id}`),
    "this-site",
    ...profile.leadership.map((l) => l.id),
  ],
};

/** Human label for any registry target (used in the agent console's action lines). */
export function targetLabel(id: string, lang: Locale): string {
  const p = profile.projects.find((x) => x.id === id);
  if (p) return p.name[lang];
  const e = profile.experience.find((x) => x.id === id);
  if (e) return e.company;
  const ed = profile.education.find((x) => x.id === id);
  if (ed) return ed.short;
  const c = profile.courses.find((x) => x.id === id);
  if (c) return c.name;
  const l = profile.leadership.find((x) => x.id === id);
  if (l) return l.title[lang];
  const s = profile.stack.find((x) => x.id === id);
  if (s) return s.label[lang];
  const lg = profile.languages.find((x) => `lang-${x.id}` === id);
  if (lg) return lg.name[lang];
  if (id in refLabels) return refLabels[id as RefId][lang];
  if (id === "erasmus") return "Erasmus";
  if (id === "full-time") return lang === "en" ? "Full-time · Jan 2028" : "Tiempo completo · ene 2028";
  const d = profile.domains.find((x) => x.id === id);
  if (d) return d.label[lang];
  return id;
}

/** Skill domain of a target, when it has one (colours the console's action line). */
export function targetDomain(id: string): DomainId | null {
  const p = profile.projects.find((x) => x.id === id);
  if (p) return p.domain;
  const s = profile.stack.find((x) => x.id === id);
  if (s) return s.domain;
  const t = refTone[id as RefId];
  if (t && "domain" in t) return t.domain;
  if (profile.domains.some((d) => d.id === id)) return id as DomainId;
  return null;
}
