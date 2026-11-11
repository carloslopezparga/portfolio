/**
 * Single source of truth for the website and the agent. It mirrors Carlos's
 * own CV (public/cv/), which is what the CV buttons download.
 *
 * - Every user-facing string has an `en` and an `es` version.
 * - Unknown data is a string that starts with TODO: and is never rendered:
 *   a metric, a sentence or a whole item disappears until it is filled in.
 * - `npm run todos` lists what is still missing.
 * - `registry` (bottom) is the whitelist of ids the agent's UI tools may use.
 */
import type { Brand, DomainId, L, Locale, ProjectId, Profile, RefId, SectionId } from "./types";

/** "80%" in English, "80 %" (non-breaking space) in Spanish. */
const PCT: L = { en: "%", es: "\u00a0%" };

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

  // «How I work», right under the hero. Short on purpose, and with no figures: those live in the experience and project cards.
  method: [
    { id: "detect", title: { en: "Detect", es: "Detecto" }, text: { en: "Manual tasks and inefficiencies in operations.", es: "Tareas manuales e ineficiencias en operaciones." } },
    { id: "automate", title: { en: "Automate", es: "Automatizo" }, text: { en: "With code, low-code and AI.", es: "Con código, low-code e IA." } },
    { id: "measure", title: { en: "Measure", es: "Mido" }, text: { en: "Time saved, errors and volume processed.", es: "Tiempo ahorrado, errores y volumen procesado." } },
  ],

  // Brand colours are read from the logo in public/logos; `color` is the
  // fallback (or the fixed accent when `fixed` is set).
  experience: [
    {
      id: "prophero",
      company: "PropHero",
      brand: { logo: "prophero", monogram: "PH", color: "#2050F6", tile: "fill" },
      role: { en: "Tech Operations Intern, AI & Automation", es: "Tech Operations Intern, AI & Automation" },
      context: { en: "Proptech", es: "Proptech" },
      location: { en: "Madrid", es: "Madrid" },
      mode: { en: "On-site", es: "Presencial" },
      start: "2026-11-03",
      end: null,
      summary: {
        en: "Bridge between Operations and Tech at a proptech scale-up, working on Vistral, its internal AI-powered operations platform (Next.js, Supabase).",
        es: "Hago de puente entre Operaciones y Tecnología en una proptech en crecimiento, trabajando en Vistral, su plataforma interna de operaciones con IA (Next.js, Supabase).",
      },
      bullets: [
        {
          en: "Bridge between Operations and Tech at a proptech scale-up, working on Vistral, its internal AI-powered operations platform (Next.js, Supabase).",
          es: "Hago de puente entre Operaciones y Tecnología en una proptech en crecimiento, trabajando en Vistral, su plataforma interna de operaciones con IA (Next.js, Supabase).",
        },
        {
          en: "Build AI automations and internal tools with Claude Code and Cursor to remove manual work from the property supply process.",
          es: "Construyo automatizaciones con IA y herramientas internas con Claude Code y Cursor para quitar trabajo manual del proceso de captación de inmuebles.",
        },
      ],
      skills: ["nextjs", "supabase", "claude-code", "cursor", "automation"],
      featured: true,
    },
    {
      id: "grupo-lalala",
      company: "Grupo Lalala",
      // Black-and-white logo: the accent is a fixed Apple orange.
      brand: { logo: "grupo-lalala", monogram: "GL", color: "#FF9F0A", fixed: true, tile: "white" },
      role: { en: "Operations & Sales Lead", es: "Operations & Sales Lead" },
      context: { en: "Events", es: "Eventos" },
      location: { en: "Madrid", es: "Madrid" },
      start: "2024-11",
      end: null,
      summary: {
        en: "Lead sales and operations at a promoter running around 400 events a year (avg. 2,000 attendees) across private, daytime, nightlife and sports formats (F1, Mutua Madrid Open, Pádel XP).",
        es: "Lidero ventas y operaciones en una promotora con unos 400 eventos al año (2.000 asistentes de media) de formatos privados, diurnos, nocturnos y deportivos (F1, Mutua Madrid Open, Pádel XP).",
      },
      bullets: [
        {
          en: "Lead sales and operations at a promoter running around 400 events a year (avg. 2,000 attendees) across private, daytime, nightlife and sports formats (F1, Mutua Madrid Open, Pádel XP).",
          es: "Lidero ventas y operaciones en una promotora con unos 400 eventos al año (2.000 asistentes de media) de formatos privados, diurnos, nocturnos y deportivos (F1, Mutua Madrid Open, Pádel XP).",
        },
        {
          en: "Negotiate with sponsors and brand partners; standardised processes across event formats to protect margins.",
          es: "Negocio con patrocinadores y marcas; estandaricé procesos entre formatos de evento para proteger márgenes.",
        },
      ],
      metrics: [
        { prefix: "~", value: 400, label: { en: "events a year", es: "eventos al año" } },
        { prefix: "~", value: 2000, label: { en: "attendees on average", es: "asistentes de media" } },
      ],
    },
    {
      id: "induforum",
      company: "Induforum 2027",
      brand: { logo: "induforum", monogram: "IF", color: "#5E5CE6", tile: "white" },
      role: { en: "Business Development Intern", es: "Becario de Desarrollo de Negocio" },
      context: { en: "ETSII-UPM careers fair", es: "Feria de empleo de la ETSII-UPM" },
      location: { en: "Madrid", es: "Madrid" },
      start: "2026-10",
      end: null,
      summary: {
        en: "Recruit and manage exhibiting companies for the school's annual careers fair.",
        es: "Capto y gestiono las empresas expositoras de la feria anual de empleo de la escuela.",
      },
      bullets: [
        {
          en: "Recruit and manage exhibiting companies for the school's annual careers fair.",
          es: "Capto y gestiono las empresas expositoras de la feria anual de empleo de la escuela.",
        },
      ],
    },
    {
      id: "classy-night-society",
      company: "Classy Night Society",
      brand: { logo: "classy-night-society", monogram: "CNS", color: "#7A1616", tile: "fill" },
      role: { en: "Operations Lead", es: "Operations Lead" },
      location: { en: "Madrid", es: "Madrid" },
      start: "2024-01",
      end: "2024-11",
      summary: {
        en: "Built an Excel/VBA system that automated artist, venue and staff payouts, cutting payment cycles by 80%.",
        es: "Construí un sistema en Excel/VBA que automatizó los pagos a artistas, salas y staff y redujo un 80\u00a0% el ciclo de pagos.",
      },
      bullets: [
        {
          en: "Built an Excel/VBA system that automated artist, venue and staff payouts, cutting payment cycles by 80%.",
          es: "Construí un sistema en Excel/VBA que automatizó los pagos a artistas, salas y staff y redujo un 80\u00a0% el ciclo de pagos.",
        },
        {
          en: "Redesigned the sales-force commission model to reward margin over volume.",
          es: "Rediseñé el modelo de comisiones del equipo comercial para premiar el margen sobre el volumen.",
        },
      ],
      metrics: [{ prefix: "−", value: 80, suffix: PCT, label: { en: "payment cycle", es: "ciclo de pagos" } }],
    },
  ],

  education: [
    {
      id: "upm",
      institution: { en: "ETSII · Universidad Politécnica de Madrid", es: "ETSII · Universidad Politécnica de Madrid" },
      short: "ETSII-UPM",
      brand: { logo: "upm", monogram: "UPM", color: "#003262", tile: "fill" },
      degree: { en: "B.Sc. in Industrial Engineering", es: "Grado en Ingeniería en Tecnologías Industriales" },
      start: "2023-09",
      end: "2028-06",
      chips: [
        { label: { en: "Matrícula de Honor · Statistics", es: "MH · Estadística" } },
        { label: { en: "Matrícula de Honor · Design of Experiments & Regression", es: "MH · Diseño de Experimentos y Regresión" } },
        { label: { en: "EvAU 12.97/14", es: "EvAU 12,97/14" } },
      ],
      notes: [
        {
          id: "mentor",
          label: { en: "ETSII Mentor Programme", es: "Programa Mentor ETSII" },
          detail: { en: "Selected two years running as peer mentor for first-year students.", es: "Seleccionado dos años seguidos como mentor de alumnos de primero." },
        },
      ],
      coursework: {
        en: ["Programming", "Statistics", "Regression & Experimental Design", "Linear Algebra", "Differential Equations", "Control Engineering", "System Dynamics", "Production Systems"],
        es: ["Programación", "Estadística", "Regresión y Diseño de Experimentos", "Álgebra Lineal", "Ecuaciones Diferenciales", "Ingeniería de Control", "Dinámica de Sistemas", "Sistemas de Producción"],
      },
      featured: true,
    },
    {
      id: "retamar",
      institution: { en: "Colegio Retamar", es: "Colegio Retamar" },
      short: "Retamar",
      brand: { logo: "retamar", monogram: "R", color: "#001E60", tile: "white" },
      degree: { en: "High School Diploma (Science & Technology)", es: "Bachillerato de Ciencias y Tecnología" },
      start: null,
      end: "2023-05",
      chips: [{ label: { en: "GPA 9.41/10 · top 1% of class", es: "Nota media 9,41 · top 1\u00a0% de la promoción" } }],
    },
  ],

  courses: [
    {
      id: "cs50",
      name: "CS50",
      provider: "HarvardX",
      brand: { logo: "cs50", monogram: "CS50", color: "#A51C30", tile: "white" },
      detail: {
        en: "CS50's Introduction to AI with Python and CS50's Introduction to Programming with Python",
        es: "CS50's Introduction to AI with Python y CS50's Introduction to Programming with Python",
      },
      date: "2026-10",
    },
  ],

  // What comes after: the Erasmus row in the ETSII card, and what the agent knows about 2028.
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
      // Shown as «Shortlist»; the id and the repository keep the old name.
      name: { en: "Shortlist", es: "Shortlist" },
      oneLiner: { en: "Finds, scores and prepares applications", es: "Busca, puntúa y prepara candidaturas" },
      status: "building",
      problem: {
        en: "Finding relevant roles across dozens of company job boards and preparing tailored material for each one is slow, repetitive work.",
        es: "Encontrar ofertas relevantes en decenas de tableros de empleo y preparar material adaptado para cada una es un trabajo lento y repetitivo.",
      },
      built: {
        en: "A CLI that pulls postings from the public Greenhouse, Lever and Ashby APIs, ranks them with a configurable 7-factor scoring model, generates a tailored CV and cover letter from a single profile file and tracks every application. 116 automated tests in CI.",
        es: "Una CLI que descarga ofertas de las APIs públicas de Greenhouse, Lever y Ashby, las ordena con un modelo de puntuación configurable de 7 factores, genera CV y carta adaptados desde un único archivo de perfil y registra cada candidatura. 116 tests automáticos en CI.",
      },
      next: { en: "Next: a Telegram interface.", es: "Próximo paso: interfaz por Telegram." },
      metrics: [
        { value: 6400, suffix: "+", label: { en: "postings", es: "ofertas" } },
        { value: 29, label: { en: "companies", es: "empresas" } },
        { value: 116, label: { en: "tests", es: "tests" } },
      ],
      stack: ["python", { label: "REST APIs" }, { label: "pytest" }, { label: "CI" }, { label: "Git" }, "claude-code"],
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
    {
      id: "cs50-ai",
      domain: "ai",
      name: { en: "AI projects (CS50)", es: "Proyectos de IA (CS50)" },
      oneLiner: { en: "HarvardX · CS50's Introduction to AI with Python", es: "HarvardX · CS50's Introduction to AI with Python" },
      status: "done",
      date: "2026-10",
      problem: {
        en: "Learning AI by building it: the projects of HarvardX's CS50's Introduction to AI with Python.",
        es: "Aprender IA construyéndola: los proyectos de CS50's Introduction to AI with Python, de HarvardX.",
      },
      built: {
        en: "A CNN that classifies traffic signs (GTSRB), a Q-learning Nim agent, a k-NN classifier, Bayesian networks, minimax and BFS search, and an analysis of BERT's attention patterns.",
        es: "Una CNN que clasifica señales de tráfico (GTSRB), un agente de Nim con Q-learning, un clasificador k-NN, redes bayesianas, búsqueda minimax y BFS, y un análisis de los patrones de atención de BERT.",
      },
      stack: ["python", { label: "TensorFlow/Keras" }, { label: "OpenCV" }, { label: "scikit-learn" }, { label: "NLTK" }, { label: "Transformers" }],
    },
  ],

  // Skills graph: the twelve key skills (weights 3 and 2). weight = importance (1–3); usedIn {id, w} = line thickness.
  stack: [
    { id: "llm-apis", label: { en: "LLM APIs", es: "APIs de LLMs" }, domain: "ai", weight: 3, usedIn: ["mail-autopilot", "cooling-agent", "this-site"] },
    { id: "claude-code", label: { en: "Claude Code", es: "Claude Code" }, domain: "ai", weight: 3, usedIn: ["prophero", "job-hunt-copilot", "this-site"] },
    { id: "cursor", label: { en: "Cursor", es: "Cursor" }, domain: "ai", weight: 2, usedIn: ["prophero"] },
    { id: "automation", label: { en: "Process automation", es: "Automatización de procesos" }, domain: "automation", weight: 3, usedIn: ["prophero", "mail-autopilot", "job-hunt-copilot"] },
    { id: "n8n", label: { en: "n8n", es: "n8n" }, domain: "automation", weight: 2, usedIn: ["mail-autopilot"] },
    { id: "excel-vba", label: { en: "Excel/VBA", es: "Excel/VBA" }, domain: "automation", weight: 2, usedIn: ["classy-night-society"] },
    { id: "python", label: { en: "Python", es: "Python" }, domain: "data", weight: 3, usedIn: ["job-hunt-copilot", "cooling-agent", "cs50-ai", "cs50"] },
    { id: "stats", label: { en: "Statistics & regression", es: "Estadística y regresión" }, domain: "data", weight: 2, usedIn: ["giti"] },
    { id: "nextjs", label: { en: "Next.js", es: "Next.js" }, domain: "software", weight: 2, usedIn: ["prophero", "this-site"] },
    { id: "supabase", label: { en: "Supabase", es: "Supabase" }, domain: "software", weight: 2, usedIn: ["prophero"] },
    { id: "operations", label: { en: "Operations", es: "Operaciones" }, domain: "ops", weight: 3, usedIn: ["grupo-lalala", "classy-night-society"] },
    { id: "sales", label: { en: "Sales", es: "Ventas" }, domain: "ops", weight: 2, usedIn: ["grupo-lalala", "induforum"] },
  ],

  languages: [
    { id: "es", name: { en: "Spanish", es: "Español" }, level: { en: "Native", es: "Nativo" } },
    { id: "en", name: { en: "English", es: "Inglés" }, level: { en: "B2 Cambridge · C1 exam in Dec 2026", es: "B2 Cambridge · C1 en dic 2026" } },
    { id: "fr", name: { en: "French", es: "Francés" }, level: { en: "B2 (DELF)", es: "B2 (DELF)" } },
    { id: "pt", name: { en: "Portuguese", es: "Portugués" }, level: { en: "Basic", es: "Básico" } },
  ],

  // Volunteering only (the ETSII Mentor Programme is a line in the ETSII card).
  volunteering: [
    {
      id: "dana",
      accent: "orange",
      title: { en: "DANA Flood Relief Task Force", es: "DANA Flood Relief Task Force" },
      description: {
        en: "Founded the DANA Flood Relief Task Force and mobilised 200 volunteers after the 2024 floods.",
        es: "Fundé el DANA Flood Relief Task Force y moví a 200 voluntarios tras las inundaciones de 2024.",
      },
      metric: { value: 200, label: { en: "volunteers", es: "voluntarios" } },
      start: "2024-10",
      end: "2024-11",
    },
    {
      id: "food-bank",
      accent: "green",
      title: { en: "Madrid Food Bank campaigns", es: "Campañas del Banco de Alimentos" },
      description: {
        en: "Food collection campaigns with the Food Bank in Madrid.",
        es: "Campañas de recogida con el Banco de Alimentos en Madrid.",
      },
      start: "TODO: fecha (AAAA-MM)",
    },
    {
      id: "charity-events",
      accent: "pink",
      title: { en: "Charity events", es: "Eventos benéficos" },
      description: {
        en: "Charity events I organised myself.",
        es: "Eventos benéficos organizados por mí.",
      },
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
    },
  ],

  offTheClock: [
    { id: "drums", label: { en: "Drums", es: "Batería" } },
    { id: "dj", label: { en: "DJ (DJ CHARLY)", es: "DJ (DJ CHARLY)" } },
    { id: "golf", label: { en: "Golf · handicap 18.5", es: "Golf · hándicap 18,5" } },
    { id: "sailing", label: { en: "Sailing", es: "Vela" } },
  ],

  // Photos and videos live in public/media/<section>/<folder>/ and are found
  // automatically (see public/media/README.md). Here only what a file can't
  // say by itself: captions by file name, and videos hosted elsewhere.
  // Folders: experience/{prophero, grupo-lalala, induforum, classy-night-society},
  // education/{etsii, retamar, cs50}, projects/{job-hunt-copilot, mail-autopilot,
  // cooling-agent, cs50-ai}, volunteering/{dana, food-bank, charity-events, orphanage}.
  // Example:
  //   "experience/prophero": {
  //     captions: { "01-first-day.jpg": { en: "First day", es: "Primer día" } },
  //     external: [{ kind: "youtube", id: "dQw4w9WgXcQ", caption: { en: "Demo", es: "Demo" } }],
  //   },
  media: {},
};

/** Display names for every node a skill can point to. */
export const refLabels: Record<RefId, { en: string; es: string }> = {
  "job-hunt-copilot": { en: "Shortlist", es: "Shortlist" },
  "mail-autopilot": { en: "Email on autopilot", es: "Correo en piloto automático" },
  "cooling-agent": { en: "Cooling agent", es: "Agente de refrigeración" },
  prophero: { en: "PropHero", es: "PropHero" },
  "grupo-lalala": { en: "Grupo Lalala", es: "Grupo Lalala" },
  "classy-night-society": { en: "Classy Night Society", es: "Classy Night Society" },
  induforum: { en: "Induforum 2027", es: "Induforum 2027" },
  giti: { en: "GITI degree", es: "Grado GITI" },
  cs50: { en: "CS50 (HarvardX)", es: "CS50 (HarvardX)" },
  "cs50-ai": { en: "AI projects (CS50)", es: "Proyectos de IA (CS50)" },
  "this-site": { en: "This website", es: "Esta web" },
};

/**
 * Colour of each big node: organisations use their brand (by logo name),
 * projects and this site use their skill domain.
 */
export const refTone: Record<RefId, { domain: DomainId } | { brand: Brand }> = (() => {
  const org = (brand: Brand) => ({ brand });
  const xp = (id: string) => org(profile.experience.find((e) => e.id === id)!.brand);
  return {
    "job-hunt-copilot": { domain: "automation" },
    "mail-autopilot": { domain: "ai" },
    "cooling-agent": { domain: "data" },
    "cs50-ai": { domain: "ai" },
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
  volunteering: { en: "Volunteering", es: "Voluntariado" },
  contact: { en: "Contact", es: "Contacto" },
};

/** Sections in page order (their number is shown in each header). */
export const SECTIONS: SectionId[] = ["top", "now", "experience", "education", "projects", "skills", "volunteering", "contact"];


/**
 * Whitelist for the agent's UI tools. Anything not listed here is rejected
 * by /api/chat before it reaches the browser.
 */
export const registry = {
  sections: SECTIONS,
  projects: profile.projects.map((p) => p.id) as ProjectId[],
  /** Elements that carry data-target-id on the page. */
  targets: [
    ...profile.experience.map((e) => e.id),
    ...profile.education.map((e) => e.id),
    ...profile.education.flatMap((e) => (e.notes ?? []).map((n) => n.id)),
    ...profile.courses.map((c) => c.id),
    "erasmus",
    ...profile.projects.map((p) => p.id),
    ...profile.stack.map((s) => s.id),
    ...profile.languages.map((l) => `lang-${l.id}`),
    "this-site",
    ...profile.volunteering.map((l) => l.id),
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
  const note = profile.education.flatMap((x) => x.notes ?? []).find((x) => x.id === id);
  if (note) return note.label[lang];
  const l = profile.volunteering.find((x) => x.id === id);
  if (l) return l.title[lang];
  const s = profile.stack.find((x) => x.id === id);
  if (s) return s.label[lang];
  const lg = profile.languages.find((x) => `lang-${x.id}` === id);
  if (lg) return lg.name[lang];
  if (id in refLabels) return refLabels[id as RefId][lang];
  if (id === "erasmus") return "Erasmus";
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
