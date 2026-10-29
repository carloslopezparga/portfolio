/**
 * Single source of truth for the website, the PDF CV and the AI chat.
 *
 * - Every user-facing string has an `en` and an `es` version.
 * - Unknown data is a string that starts with TODO: and is never rendered:
 *   a metric, a sentence or a whole section disappears until it is filled in.
 * - `npm run todos` lists what is still missing.
 */
import type { Profile } from "./types";

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

  // Hidden until at least one value is real.
  impact: [
    { id: "events", value: "TODO: nº de eventos operados", label: { en: "events run", es: "eventos operados" } },
    { id: "attendees", value: "TODO: asistentes totales", suffix: "+", label: { en: "attendees", es: "asistentes" } },
    { id: "volunteers", value: "TODO: voluntarios coordinados (DANA)", label: { en: "volunteers coordinated", es: "voluntarios coordinados" } },
    { id: "raised", value: "TODO: € recaudados en eventos benéficos", suffix: " €", label: { en: "raised for charity", es: "recaudados para causas benéficas" } },
  ],

  projects: [
    {
      id: "job-hunt-copilot",
      name: { en: "job-hunt-copilot", es: "job-hunt-copilot" },
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
      name: { en: "Email on autopilot", es: "Correo en piloto automático" },
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
      name: { en: "AI agent for data-center cooling", es: "Agente de IA para refrigeración de centros de datos" },
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
    },
    {
      id: "classy-night-society",
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
      title: { en: "Valencia DANA flood response", es: "Respuesta a la DANA de Valencia" },
      description: {
        en: "Coordinated the humanitarian response to the DANA floods in Valencia.",
        es: "Coordinación de la respuesta humanitaria a la DANA de Valencia.",
      },
      metric: "TODO: voluntarios coordinados, toneladas / envíos",
      photo: "dana",
    },
    {
      id: "mentor",
      title: { en: "ETSII Mentor Programme", es: "Programa Mentor ETSII" },
      description: {
        en: "Two years mentoring students from other cohorts.",
        es: "Dos años como mentor de alumnos de otras promociones.",
      },
      metric: "TODO: nº de mentorizados",
      photo: "mentor",
    },
    {
      id: "food-bank",
      title: { en: "Madrid Food Bank campaigns", es: "Campañas del Banco de Alimentos" },
      description: {
        en: "Food collection campaigns with the Food Bank in Madrid.",
        es: "Campañas de recogida con el Banco de Alimentos en Madrid.",
      },
      metric: "TODO: kg recogidos",
      photo: "volunteering-1",
    },
    {
      id: "charity-events",
      title: { en: "Charity events", es: "Eventos benéficos" },
      description: {
        en: "Charity events I organised myself.",
        es: "Eventos benéficos organizados por mí.",
      },
      metric: "TODO: € recaudados y destino",
    },
    {
      id: "orphanage",
      title: { en: "Orphanage build, South Africa", es: "Orfanato en Sudáfrica" },
      description: {
        en: "Construction work at an orphanage in South Africa.",
        es: "Construcción en un orfanato en Sudáfrica.",
      },
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
        { en: "Erasmus · Sep–Dec 2027", es: "Erasmus · sept–dic 2027" },
        "TODO: destino Erasmus",
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

  courses: [
    {
      id: "cs50",
      name: "CS50",
      detail: { en: "Python, SQL, AI", es: "Python, SQL, IA" },
    },
  ],

  stack: [
    { id: "python", label: { en: "Python", es: "Python" }, group: "build", usedIn: ["job-hunt-copilot", "cooling-agent", "cs50"] },
    { id: "sql", label: { en: "SQL", es: "SQL" }, group: "build", usedIn: ["cs50"] },
    { id: "nextjs", label: { en: "Next.js", es: "Next.js" }, group: "build", usedIn: ["this-site"] },
    { id: "typescript", label: { en: "TypeScript", es: "TypeScript" }, group: "build", usedIn: ["this-site"] },
    { id: "n8n", label: { en: "n8n", es: "n8n" }, group: "build", usedIn: ["mail-autopilot"] },
    { id: "llm-apis", label: { en: "LLM APIs", es: "APIs de LLMs" }, group: "build", usedIn: ["mail-autopilot", "cooling-agent"] },
    { id: "claude-code", label: { en: "Claude Code", es: "Claude Code" }, group: "build", usedIn: ["this-site"] },
    {
      id: "automation",
      label: { en: "Process automation", es: "Automatización de procesos" },
      group: "build",
      usedIn: ["prophero", "mail-autopilot", "job-hunt-copilot"],
    },
    { id: "operations", label: { en: "Operations", es: "Operaciones" }, group: "operate", usedIn: ["grupo-lalala", "classy-night-society", "prophero"] },
    { id: "sales", label: { en: "Sales", es: "Ventas" }, group: "operate", usedIn: ["grupo-lalala", "induforum"] },
    {
      id: "negotiation",
      label: { en: "Sponsor negotiation", es: "Negociación con patrocinadores" },
      group: "operate",
      usedIn: ["grupo-lalala"],
    },
  ],

  languages: [
    { name: { en: "Spanish", es: "Español" }, level: { en: "Native", es: "Nativo" } },
    { name: { en: "English", es: "Inglés" }, level: { en: "C1", es: "C1" } },
    { name: { en: "French", es: "Francés" }, level: { en: "B2", es: "B2" } },
    { name: { en: "Portuguese", es: "Portugués" }, level: { en: "Basic", es: "Básico" } },
  ],

  offTheClock: [
    { id: "drums", label: { en: "Drums", es: "Batería" } },
    { id: "dj", label: { en: "DJ (DJ CHARLY)", es: "DJ (DJ CHARLY)" } },
    { id: "golf", label: { en: "Golf · handicap 18.5", es: "Golf · hándicap 18,5" } },
    { id: "sailing", label: { en: "Sailing", es: "Vela" } },
  ],

  gallery: [
    ...[1, 2, 3, 4, 5, 6].map((n) => ({
      file: `events-${n}.jpg`,
      alt: { en: "Event operations", es: "Operaciones de eventos" },
      caption: `TODO: pie de foto events-${n}` as const,
    })),
    { file: "dana.jpg", alt: { en: "DANA flood response in Valencia", es: "Respuesta a la DANA en Valencia" } },
    ...[1, 2, 3].map((n) => ({
      file: `volunteering-${n}.jpg`,
      alt: { en: "Volunteering", es: "Voluntariado" },
      caption: `TODO: pie de foto volunteering-${n}` as const,
    })),
    { file: "mentor.jpg", alt: { en: "ETSII Mentor Programme", es: "Programa Mentor ETSII" } },
  ],
};

/** Ids that `usedIn` can point to, with display names. */
export const refLabels: Record<string, { en: string; es: string }> = {
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
