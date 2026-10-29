/**
 * Single source of truth for the website, the PDF CV and the agent.
 *
 * - Every user-facing string has an `en` and an `es` version.
 * - Unknown data is a string that starts with TODO: and is never rendered:
 *   a metric, a sentence or a whole item disappears until it is filled in.
 * - `npm run todos` lists what is still missing.
 * - `registry` (bottom) is the whitelist of ids the agent's UI tools may use.
 */
import type { DomainId, Locale, ProjectId, Profile, RefId, SectionId } from "./types";

export const profile: Profile = {
  name: "Carlos López Parga",
  initials: "CL",

  tagline: {
    en: "I turn manual operations into automated systems.",
    es: "Convierto operaciones manuales en sistemas automatizados.",
  },
  subtitle: {
    en: "Industrial Engineering @ UPM · Tech Operations @ PropHero · Building with AI & automation",
    es: "Ingeniería Industrial @ UPM · Tech Operations @ PropHero · Construyo con IA y automatización",
  },
  location: { en: "Madrid", es: "Madrid" },
  coordinates: "40.4168°N 3.7038°W",
  availability: {
    en: "Open to internships 2027 · Full-time from Jan 2028",
    es: "Busco prácticas 2027 · Tiempo completo desde ene 2028",
  },
  email: "clpargaa@gmail.com",
  links: {
    linkedin: "https://www.linkedin.com/in/carloslopezparga",
    github: "https://github.com/carloslopezparga",
  },

  // The gearbox: sun = AI core, planets = automation / data & quant / operations, ring = engineering.
  domains: [
    {
      id: "ai",
      label: { en: "AI", es: "IA" },
      part: { en: "Sun gear · AI core", es: "Planeta sol · núcleo de IA" },
      highlights: [
        { en: "Evolutionary LLM agent that writes cooling controllers", es: "Agente evolutivo con LLMs que escribe controladores de refrigeración" },
        { en: "Daily email digest with Claude", es: "Resumen diario del correo con Claude" },
        { en: "This site's agent, with UI tool use", es: "El agente de esta web, con tool use de interfaz" },
      ],
      section: "toolkit",
    },
    {
      id: "automation",
      label: { en: "Automation", es: "Automatización" },
      part: { en: "Planet gear · Automation", es: "Satélite · Automatización" },
      highlights: [
        { en: "job-hunt-copilot, a Python CLI", es: "job-hunt-copilot, una CLI en Python" },
        { en: "n8n workflows on autopilot", es: "Flujos de n8n en piloto automático" },
        { en: "Tech Operations at PropHero", es: "Tech Operations en PropHero" },
      ],
      section: "toolkit",
    },
    {
      id: "data",
      label: { en: "Data & quant", es: "Datos y quant" },
      part: { en: "Planet gear · Data & quant", es: "Satélite · Datos y quant" },
      highlights: [
        { en: "Top grade in Statistics and in Design of Experiments & Regression", es: "Matrícula de Honor en Estadística y en Diseño de Experimentos y Regresión" },
        { en: "Python and SQL (CS50)", es: "Python y SQL (CS50)" },
        { en: "Controllers scored in a simulator", es: "Controladores evaluados en un simulador" },
      ],
      section: "toolkit",
    },
    {
      id: "ops",
      label: { en: "Operations", es: "Operaciones" },
      part: { en: "Planet gear · Operations", es: "Satélite · Operaciones" },
      highlights: [
        { en: "Operations & sales for events at Grupo Lalala", es: "Operaciones y ventas de eventos en Grupo Lalala" },
        { en: "Operations Lead at Classy Night Society", es: "Operations Lead en Classy Night Society" },
        { en: "Company relations for Induforum 2027", es: "Relación con empresas en Induforum 2027" },
      ],
      section: "toolkit",
    },
    {
      id: "engineering",
      label: { en: "Engineering", es: "Ingeniería" },
      part: { en: "Ring gear · Engineering base", es: "Corona · base de ingeniería" },
      highlights: [
        { en: "BEng Industrial Technologies, UPM (2023–2028)", es: "Grado en Ingeniería en Tecnologías Industriales, UPM (2023–2028)" },
        { en: "Specialisation: Intelligent Systems and Structures", es: "Especialidad: Sistemas y Estructuras Inteligentes" },
        { en: "Erasmus · Sep–Dec 2027", es: "Erasmus · sept–dic 2027" },
      ],
      section: "trajectory",
    },
  ],

  // Not shown on the site at the moment (no impact section); kept for when the numbers exist.
  impact: [
    { id: "events", value: "TODO: nº de eventos operados", label: { en: "events run", es: "eventos operados" } },
    { id: "attendees", value: "TODO: asistentes totales", suffix: "+", label: { en: "attendees", es: "asistentes" } },
  ],

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
      stack: ["python", "automation"],
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
        en: "Reading the inbox and hunting for internships every day eats time that should go into actual work.",
        es: "Leer el correo y buscar prácticas cada día consume un tiempo que debería ir al trabajo de verdad.",
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

  experience: [
    {
      id: "prophero",
      domain: "automation",
      lane: "work",
      company: "PropHero",
      logo: "prophero",
      monogram: "PH",
      role: { en: "Tech Operations Intern", es: "Tech Operations Intern" },
      context: { en: "Proptech · Madrid", es: "Proptech · Madrid" },
      start: "2026-11-03",
      end: "2027-02",
      summary: {
        en: "The bridge between Operations and Technology: spotting manual work across buying, renovating, renting and managing properties, and automating it with low-code, scripting and AI.",
        es: "Puente entre Operaciones y Tecnología: detectar tareas manuales en compra, reforma, alquiler y gestión de inmuebles y automatizarlas con low-code, scripting e IA.",
      },
      highlights: [
        {
          en: "Translate operational needs into requirements for the internal platform.",
          es: "Traducir necesidades operativas a requisitos para la plataforma interna.",
        },
        {
          en: "Integrate data between tools and measure the impact of each automation.",
          es: "Integrar datos entre herramientas y medir el impacto de cada automatización.",
        },
      ],
      results: "TODO: resultados",
    },
    {
      id: "grupo-lalala",
      domain: "ops",
      lane: "work",
      company: "Grupo Lalala",
      logo: "grupo-lalala",
      monogram: "GL",
      role: { en: "Operations & Sales Lead", es: "Operations & Sales Lead" },
      start: "2024-11",
      end: null,
      summary: {
        en: "Operations and sales for nightlife, private, daytime and sports events — including the F1 afternoon party, Mutua Madrid Open and Pádel XP — and the relationship with sponsors.",
        es: "Operaciones y ventas de eventos nocturnos, privados, diurnos y deportivos —tardeo de la F1, Mutua Madrid Open, Pádel XP— y relación con patrocinadores.",
      },
      results: "TODO: nº de eventos, asistentes y patrocinios",
      photo: "events-1",
    },
    {
      id: "classy-night-society",
      domain: "ops",
      lane: "work",
      company: "Classy Night Society",
      logo: "classy-night-society",
      monogram: "CNS",
      role: { en: "Operations Lead", es: "Operations Lead" },
      start: "2024-01",
      end: "2024-11",
      summary: "TODO: descripción del puesto",
      results: "TODO: cifras",
    },
    {
      id: "induforum",
      domain: "ops",
      lane: "leadership",
      company: "Induforum 2027",
      logo: "induforum",
      monogram: "IF",
      role: { en: "Organizer, corporate relations", es: "Organizador, área comercial" },
      context: { en: "ETSII-UPM job fair", es: "Feria de empleo de la ETSII-UPM" },
      start: "2026-10",
      end: null,
      summary: {
        en: "Bringing companies on board and managing the relationship with them.",
        es: "Captación y relación con empresas.",
      },
    },
  ],

  leadership: [
    {
      id: "dana",
      domain: "ops",
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
      domain: "ops",
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
      domain: "ops",
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
      domain: "ops",
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
      domain: "engineering",
      title: { en: "Orphanage build, South Africa", es: "Orfanato en Sudáfrica" },
      description: {
        en: "Construction work at an orphanage in South Africa.",
        es: "Construcción en un orfanato en Sudáfrica.",
      },
      start: "TODO: fecha (AAAA-MM)",
      photo: "volunteering-2",
    },
  ],

  education: [
    {
      id: "upm",
      institution: {
        en: "ETSII · Universidad Politécnica de Madrid",
        es: "ETSII · Universidad Politécnica de Madrid",
      },
      logo: "upm",
      monogram: "UPM",
      degree: {
        en: "BEng Industrial Technologies Engineering",
        es: "Grado en Ingeniería en Tecnologías Industriales",
      },
      start: "2023-09",
      end: "2028-06",
      details: [
        {
          en: "Specialisation: Intelligent Systems and Structures",
          es: "Especialidad: Sistemas y Estructuras Inteligentes",
        },
      ],
      honors: [
        { en: "Matrícula de Honor (top grade) · Statistics", es: "Matrícula de Honor · Estadística" },
        {
          en: "Matrícula de Honor (top grade) · Design of Experiments & Regression",
          es: "Matrícula de Honor · Diseño de Experimentos y Regresión",
        },
      ],
    },
    {
      id: "retamar",
      institution: { en: "Colegio Retamar", es: "Colegio Retamar" },
      logo: "retamar",
      monogram: "R",
      degree: {
        en: "Bachillerato, Science & Technology",
        es: "Bachillerato de Ciencias y Tecnología",
      },
      start: null,
      end: "2023-06",
      details: [],
      honors: [
        { en: "GPA 9.41 / 10", es: "Nota media 9,41" },
        { en: "University entrance exam 12.972 / 14", es: "Selectividad 12,972 / 14" },
      ],
    },
  ],

  courses: [{ id: "cs50", name: "CS50", detail: { en: "Python, SQL, AI", es: "Python, SQL, IA" } }],

  // The future stretch of the trajectory, drawn as a Monte Carlo cone.
  future: {
    erasmus: { start: "2027-09", end: "2027-12", destination: "TODO: destino Erasmus" },
    thesis: { en: "Final-year project (TFG)", es: "Trabajo Fin de Grado (TFG)" },
    fullTime: "2028-01",
  },

  // Constellation. weight = star size (all equal by default); usedIn {id, w} = line thickness.
  stack: [
    { id: "llm-apis", label: { en: "LLM APIs", es: "APIs de LLMs" }, domain: "ai", usedIn: ["mail-autopilot", "cooling-agent", "this-site"] },
    { id: "claude-code", label: { en: "Claude Code", es: "Claude Code" }, domain: "ai", usedIn: ["this-site"] },
    { id: "automation", label: { en: "Process automation", es: "Automatización de procesos" }, domain: "automation", usedIn: ["prophero", "mail-autopilot", "job-hunt-copilot"] },
    { id: "n8n", label: { en: "n8n", es: "n8n" }, domain: "automation", usedIn: ["mail-autopilot"] },
    { id: "nextjs", label: { en: "Next.js", es: "Next.js" }, domain: "automation", usedIn: ["this-site"] },
    { id: "typescript", label: { en: "TypeScript", es: "TypeScript" }, domain: "automation", usedIn: ["this-site"] },
    { id: "python", label: { en: "Python", es: "Python" }, domain: "data", usedIn: ["job-hunt-copilot", "cooling-agent", "cs50"] },
    { id: "sql", label: { en: "SQL", es: "SQL" }, domain: "data", usedIn: ["cs50"] },
    { id: "operations", label: { en: "Operations", es: "Operaciones" }, domain: "ops", usedIn: ["grupo-lalala", "classy-night-society", "prophero"] },
    { id: "sales", label: { en: "Sales", es: "Ventas" }, domain: "ops", usedIn: ["grupo-lalala", "induforum"] },
    { id: "negotiation", label: { en: "Sponsor negotiation", es: "Negociación con patrocinadores" }, domain: "ops", usedIn: ["grupo-lalala"] },
  ],

  languages: [
    { id: "es", name: { en: "Spanish", es: "Español" }, level: { en: "Native", es: "Nativo" } },
    { id: "en", name: { en: "English", es: "Inglés" }, level: { en: "C1", es: "C1" } },
    { id: "fr", name: { en: "French", es: "Francés" }, level: { en: "B2", es: "B2" } },
    { id: "pt", name: { en: "Portuguese", es: "Portugués" }, level: { en: "Basic", es: "Básico" } },
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
  cs50: { en: "CS50", es: "CS50" },
  "this-site": { en: "This website", es: "Esta web" },
};

/** Domain of each big node (colours the constellation). */
export const refDomain: Record<RefId, DomainId> = {
  "job-hunt-copilot": "automation",
  "mail-autopilot": "ai",
  "cooling-agent": "data",
  prophero: "automation",
  "grupo-lalala": "ops",
  "classy-night-society": "ops",
  induforum: "ops",
  cs50: "data",
  "this-site": "ai",
};

export const sectionLabels: Record<SectionId, { en: string; es: string }> = {
  top: { en: "Overview", es: "Inicio" },
  systems: { en: "Systems", es: "Sistemas" },
  trajectory: { en: "Trajectory", es: "Trayectoria" },
  toolkit: { en: "Toolkit", es: "Toolkit" },
  beyond: { en: "Beyond", es: "Más allá" },
  contact: { en: "Contact", es: "Contacto" },
};

/**
 * Whitelist for the agent's UI tools. Anything not listed here is rejected
 * by /api/chat before it reaches the browser.
 */
export const registry = {
  sections: ["top", "systems", "trajectory", "toolkit", "beyond", "contact"] as SectionId[],
  projects: profile.projects.map((p) => p.id) as ProjectId[],
  parts: profile.domains.map((d) => d.id) as DomainId[],
  /** Elements that carry data-target-id on the page. */
  targets: [
    ...profile.projects.map((p) => p.id),
    ...profile.experience.map((e) => e.id),
    ...profile.education.map((e) => e.id),
    ...profile.leadership.map((l) => l.id),
    ...profile.stack.map((s) => s.id),
    ...profile.languages.map((l) => `lang-${l.id}`),
    "cs50",
    "this-site",
    "erasmus",
    "full-time",
  ],
};

/** Human label for any registry target (used in the agent console's action lines). */
export function targetLabel(id: string, lang: Locale): string {
  const p = profile.projects.find((x) => x.id === id);
  if (p) return p.name[lang];
  const e = profile.experience.find((x) => x.id === id);
  if (e) return e.company;
  const ed = profile.education.find((x) => x.id === id);
  if (ed) return ed.institution[lang];
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

export function targetDomain(id: string): DomainId | "languages" {
  const p = profile.projects.find((x) => x.id === id);
  if (p) return p.domain;
  const e = profile.experience.find((x) => x.id === id);
  if (e) return e.domain;
  if (profile.education.some((x) => x.id === id) || id === "erasmus" || id === "full-time") return "engineering";
  const l = profile.leadership.find((x) => x.id === id);
  if (l) return l.domain;
  const s = profile.stack.find((x) => x.id === id);
  if (s) return s.domain;
  if (id.startsWith("lang-")) return "languages";
  if (id in refDomain) return refDomain[id as RefId];
  return "engineering";
}
