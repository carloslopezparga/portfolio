import { cacheLife } from "next/cache";
import type { CSSProperties } from "react";
import { profile, refLabels } from "@/content/profile";
import { has } from "@/content/types";
import { logoSrc, readDemo } from "@/lib/assets";
import { formatRange, t, timeStatus, ui } from "@/lib/i18n";
import { HeroA } from "@/components/hero/HeroA";
import { HeroB } from "@/components/hero/HeroB";
import { HeroCopy } from "@/components/hero/HeroCopy";
import { CoolingEvolution } from "@/components/demos/CoolingEvolution";
import { MailFlow } from "@/components/demos/MailFlow";
import { TerminalReplay } from "@/components/demos/TerminalReplay";
import { LabBar } from "@/components/lab/LabBar";
import { CursorTargets, FontButton, LayerToggles, Replay } from "@/components/lab/LabBits";
import { MotionTokens } from "@/components/lab/MotionTokens";
import { PaletteSwatches } from "@/components/lab/PaletteSwatches";
import { ParallaxScene } from "@/components/lab/ParallaxScene";
import { PlayOnView } from "@/components/lab/PlayOnView";
import { Sheet } from "@/components/lab/Sheet";
import { StackShowcase } from "@/components/lab/StackShowcase";
import { Toaster } from "@/components/lab/Toaster";
import { ProjectPanel } from "@/components/sections/ProjectPanel";
import { ProjectsRail } from "@/components/sections/ProjectsRail";
import { Timeline, type TimelineItem } from "@/components/sections/Timeline";
import { ClipReveal } from "@/components/ui/ClipReveal";
import { Counter } from "@/components/ui/Counter";
import { DimensionLine } from "@/components/ui/DimensionLine";
import { FancyLink, ArrowRight } from "@/components/ui/FancyLink";
import { BrandIcon, BRANDS, brandColor, Glyph, type BrandName } from "@/components/ui/icons";
import { Lightbox } from "@/components/ui/Lightbox";
import { Logo } from "@/components/ui/Logo";
import { Magnetic } from "@/components/ui/Magnetic";
import { RevealText } from "@/components/ui/RevealText";
import { Scramble } from "@/components/ui/Scramble";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { TiltCard } from "@/components/ui/TiltCard";
import { Tone } from "@/components/ui/Tone";
import Image from "next/image";

/** Cached for a day so "Incoming" / "Current" badges stay correct without a rebuild. */
async function today() {
  "use cache";
  cacheLife("days");
  return new Date().toISOString();
}

const LAB_SAMPLE = [
  "# @pause 0.3",
  '$ echo "LAB SAMPLE · the real run goes in content/demos/job-hunt-copilot.txt"',
  "\u001b[36mLAB SAMPLE\u001b[0m · the real run goes in content/demos/job-hunt-copilot.txt",
  "# @pause 0.6",
  "$ cat content/demos/FORMAT",
  'Lines starting with "$ " are typed character by character.',
  "Every other line is printed as output, ANSI colours included:",
  "  \u001b[32mgreen\u001b[0m  \u001b[33myellow\u001b[0m  \u001b[34mblue\u001b[0m  \u001b[1mbold\u001b[0m  \u001b[2mdim\u001b[0m",
  '"# @pause 1.5" waits 1.5 s and is never shown.',
  "",
  "If the file is missing, the site simply hides this demo.",
  "# @pause 0.8",
  "$ ls content/demos",
  "\u001b[2m(waiting for job-hunt-copilot.txt)\u001b[0m",
].join("\n");

const PLACEHOLDERS = [
  { src: "/lab/placeholder-1.svg", width: 1200, height: 800 },
  { src: "/lab/placeholder-2.svg", width: 800, height: 1000 },
  { src: "/lab/placeholder-3.svg", width: 1200, height: 800 },
  { src: "/lab/placeholder-4.svg", width: 1000, height: 1000 },
  { src: "/lab/placeholder-5.svg", width: 1200, height: 800 },
  { src: "/lab/placeholder-6.svg", width: 800, height: 1000 },
];

const SHEETS = [
  { id: "hero-a", code: "A", title: "Hero A · Pipeline 2D" },
  { id: "hero-b", code: "B", title: "Hero B · Mecanismo 3D" },
  { id: "palette", code: "L-01", title: "Paleta" },
  { id: "type", code: "L-02", title: "Tipografía" },
  { id: "motion", code: "L-03", title: "Sistema de motion" },
  { id: "backdrop", code: "L-04", title: "Fondo e intro" },
  { id: "cursor", code: "L-05", title: "Cursor" },
  { id: "cards", code: "L-06", title: "Cards" },
  { id: "images", code: "L-07", title: "Logos e imágenes" },
  { id: "lab-links", code: "L-08", title: "Enlaces y botones" },
  { id: "text", code: "L-09", title: "Texto" },
  { id: "stack", code: "L-10", title: "Stack" },
  { id: "parallax", code: "L-11", title: "Parallax por capas" },
  { id: "projects-intro", code: "L-12", title: "Proyectos en horizontal" },
  { id: "clip", code: "L-13", title: "Máscaras clip-path" },
  { id: "dimensions", code: "L-14", title: "Cotas y progreso" },
  { id: "timeline", code: "L-15", title: "Timeline" },
  { id: "gallery", code: "L-16", title: "Galería y lightbox" },
  { id: "counters", code: "L-17", title: "Contadores" },
  { id: "theme", code: "L-18", title: "Tema" },
  { id: "palette-cmd", code: "L-19", title: "Paleta de comandos" },
];
const TOTAL = SHEETS.length - 2;

export default async function LabPage() {
  const lang = "es" as const;
  const now = new Date(await today());

  const pipelineLabels = {
    nodes: ["Ingest", "Parse", "AI", "Route"] as [string, string, string, string],
    outputs: ["Reply drafted", "Row synced", "Record created", "Data extracted"] as [string, string, string, string],
    manual: "Manual inputs",
    automated: "Automated outputs",
  };
  const partLabels = ["Housing", "Ring gear · Z36", "Planets ×3 · Z12", "Sun gear · Z12", "Carrier", "Input shaft"];

  const experience: TimelineItem[] = profile.experience.map((e) => {
    const status = timeStatus(e.start, e.end, now);
    return {
      id: e.id,
      period: formatRange(e.start, e.end, lang),
      status: status === "upcoming" ? ui.status.upcoming[lang] : status === "current" ? ui.status.current[lang] : undefined,
      title: e.role[lang],
      org: e.company,
      meta: e.context?.[lang],
      body: t(e.summary, lang) ?? undefined,
      bullets: e.highlights?.map((h) => h[lang]),
      logo: <Logo src={logoSrc(e.logo)} name={e.company} monogram={e.monogram} size={44} />,
    };
  });
  const education: TimelineItem[] = [
    ...profile.education.map((ed) => ({
      id: ed.id,
      period: formatRange(ed.start, ed.end, lang),
      title: ed.degree[lang],
      org: ed.institution[lang],
      bullets: ed.details.filter(has).map((d) => d[lang]),
      chips: ed.honors.filter(has).map((h) => h[lang]),
      logo: <Logo src={logoSrc(ed.logo)} name={ed.institution[lang]} monogram={ed.monogram} size={44} />,
    })),
    ...profile.courses.map((c) => ({
      id: c.id,
      period: lang === "es" ? "Formación complementaria" : "Additional training",
      title: c.name,
      org: c.detail[lang],
      logo: <Logo src={null} name={c.name} monogram="CS" size={44} />,
    })),
  ];

  const stackLabels = Object.fromEntries(profile.stack.map((s) => [s.id, s.label[lang]]));
  const stackEntries = profile.stack.map((s) => ({
    id: s.id,
    label: s.label[lang],
    group: profile.domains.find((d) => d.id === s.domain)?.label[lang] ?? s.domain,
    usedIn: s.usedIn.map((u) => {
      const id = typeof u === "string" ? u : u.id;
      return { id, label: refLabels[id][lang] };
    }),
  }));

  const jobs = profile.projects[0];
  const realRun = jobs.demo.kind === "terminal" ? readDemo(jobs.demo.file) : null;
  const demos = {
    "job-hunt-copilot": <TerminalReplay script={realRun ?? LAB_SAMPLE} title="job-hunt-copilot — zsh" badge={realRun ? "Replay" : "Lab sample"} />,
    "mail-autopilot": (
      <div className="p-2 md:p-4">
        <MailFlow
          labels={{
            gmail: "Gmail",
            claude: "Claude",
            digest: "Resumen",
            inbox: "Mi bandeja",
            search: "Prácticas",
            telegram: "Telegram",
            tailored: "CV + carta",
            building: "En obra",
            steps: ["07:00 · cron", "resumir", "digest.md", "entregado"],
          }}
        />
      </div>
    ),
    "cooling-agent": (
      <div className="p-2 md:p-4">
        <CoolingEvolution labels={{ illustrative: ui.illustrative[lang], x: "tiempo de simulación", y: "energía", baseline: "controlador base", best: "mejor generación", gen: "GEN" }} />
      </div>
    ),
  } as const;

  const brandRow: BrandName[] = ["python", "n8n", "claude", "gmail", "telegram", "typescript"];

  return (
    <main id="top">
      <LabBar sheets={SHEETS} />
      <Toaster />

      {/* ------------------------------------------------------------ */}
      {/* Intro band                                                     */}
      {/* ------------------------------------------------------------ */}
      <section className="mx-auto max-w-[1280px] px-5 pb-16 pt-32 sm:px-8 md:px-12 md:pt-40">
        <p className="mono-label">
          <span className="text-accent">CLP-LAB</span> · Rev A · {SHEETS.length} láminas
        </p>
        <h1 className="mt-4 max-w-[16ch] text-[clamp(2.6rem,7vw,6rem)] leading-[0.95] text-fg">Laboratorio de movimiento</h1>
        <p className="mt-6 max-w-[60ch] text-[16px] leading-relaxed text-muted">
          Cada interacción de la web, aislada para probarla antes de construir el sitio. Arriba tienes los controles: tipografía, simular
          <em className="not-italic text-fg"> reduced motion</em>, simular modo táctil e idioma del hero. En móvil, todo está en el botón ⌘ de abajo a la
          derecha. Los textos y datos salen de <code className="font-mono text-[13px] text-fg">content/profile.ts</code>; las imágenes de colores son
          marcadores de laboratorio.
        </p>
        <ol className="mt-10 grid gap-px overflow-hidden rounded-[14px] bg-line sm:grid-cols-2 lg:grid-cols-3">
          {SHEETS.map((s) => (
            <li key={s.id} className="bg-bg">
              <a href={`#${s.id}`} className="group flex items-center justify-between gap-3 px-4 py-3 transition-hover hover:bg-[rgb(var(--glow)/0.05)]">
                <span className="flex items-baseline gap-3">
                  <span className="mono-label w-10 !text-accent">{s.code}</span>
                  <span className="text-[14px] text-fg">{s.title}</span>
                </span>
                <ArrowRight className="size-3.5 text-dim transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent" />
              </a>
            </li>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Hero options                                                   */}
      {/* ------------------------------------------------------------ */}
      <div id="hero-a" className="scroll-mt-0">
        <div className="mx-auto max-w-[1280px] px-5 pb-6 sm:px-8 md:px-12">
          <p className="mono-label">
            <span className="text-accent">Opción A</span> · Pipeline 2D en canvas sobre el campo de estrellas
          </p>
          <p className="mt-2 max-w-[80ch] text-[14px] text-muted">
            Las tareas manuales flotan desordenadas, entran al pipeline, se transforman nodo a nodo y salen como resultados ordenados. El cursor
            repele los iconos, enciende los nodos y tensa los conectores. Haz clic (o toca) en un hueco para soltar una tarea nueva. Móvil:
            composición compacta, toque para soltar tareas y giroscopio para el parallax.
          </p>
        </div>
        <PlayOnView>
          <HeroA labels={pipelineLabels}>
            <div className="lab-en">
              <HeroCopy lang="en" play={false} projectsHref="#projects" />
            </div>
            <div className="lab-es">
              <HeroCopy lang="es" play={false} projectsHref="#projects" />
            </div>
          </HeroA>
        </PlayOnView>
      </div>

      <div id="hero-b" className="mt-24">
        <div className="mx-auto max-w-[1280px] px-5 pb-6 sm:px-8 md:px-12">
          <p className="mono-label">
            <span className="text-accent">Opción B</span> · Vista explosionada 3D (React Three Fiber, carga diferida)
          </p>
          <p className="mt-2 max-w-[80ch] text-[14px] text-muted">
            Una reductora planetaria en wireframe azul con líneas ocultas eliminadas. Sigue al cursor y se ensambla mientras haces scroll; una vez
            montada, gira. three.js solo se descarga al acercarte; mientras tanto (y sin WebGL o con reduced motion) se ve el plano SVG.
          </p>
        </div>
        <PlayOnView>
          <HeroB partLabels={partLabels} readout="Assembly">
            <div className="lab-en">
              <HeroCopy lang="en" play={false} projectsHref="#projects" />
            </div>
            <div className="lab-es">
              <HeroCopy lang="es" play={false} projectsHref="#projects" />
            </div>
          </HeroB>
        </PlayOnView>
      </div>

      {/* ------------------------------------------------------------ */}
      <Sheet
        id="palette"
        code="L-01"
        index={1}
        total={TOTAL}
        title="Paleta: negros, blancos, grises y un azul"
        description="Contraste calculado en vivo contra el fondo de cada tema. Todo el texto usa tokens que pasan AA; los grises más tenues quedan reservados a líneas y cotas."
      >
        <PaletteSwatches />
      </Sheet>

      <Sheet
        id="type"
        code="L-02"
        index={2}
        total={TOTAL}
        title="Tipografía"
        description="Sans neutra tipo SF + Geist Mono para etiquetas, cotas y datos. Compara las tres opciones y aplica la que quieras a toda la página (también desde la barra superior)."
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            { key: "geist", name: "Geist", family: "var(--font-geist)", note: "Por defecto. Neutra, técnica, muy legible.", stretch: undefined },
            { key: "inter", name: "Inter Tight", family: "var(--font-inter-tight)", note: "Más apretada; titulares más compactos.", stretch: undefined },
            { key: "archivo", name: "Archivo expandida", family: "var(--font-archivo)", note: "Solo titulares, ancho 125%. Más carácter.", stretch: "125%" },
          ].map((f) => (
            <div key={f.key} className="flex flex-col rounded-[var(--radius-card)] p-6 shadow-[inset_0_0_0_1px_var(--line)]">
              <p className="mono-label">{f.name}</p>
              <p
                className="mt-6 text-[clamp(2.4rem,4vw,3.4rem)] leading-[0.92] tracking-[-0.035em] text-fg"
                style={{ fontFamily: f.family, fontStretch: f.stretch, fontVariationSettings: f.stretch ? "'wdth' 125" : undefined, fontWeight: f.stretch ? 700 : 600 } as CSSProperties}
              >
                Carlos
                <br />
                López Parga
              </p>
              <p className="mt-5 text-[20px] font-medium leading-snug tracking-[-0.02em] text-fg" style={{ fontFamily: f.key === "inter" ? f.family : "var(--font-geist)" }}>
                {profile.tagline.es}
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-muted" style={{ fontFamily: f.key === "inter" ? f.family : "var(--font-geist)" }}>
                {profile.subtitle.es}
              </p>
              <p className="mono-label mt-5">Madrid · {profile.coordinates} · Geist Mono</p>
              <div className="mt-auto">
                <FontButton font={f.key as "geist" | "inter" | "archivo"}>Aplicar a toda la página</FontButton>
              </div>
            </div>
          ))}
        </div>
      </Sheet>

      <Sheet
        id="motion"
        code="L-03"
        index={3}
        total={TOTAL}
        title="Una sola física para todo"
        description="Tokens de easing, duración y stagger compartidos por CSS, Motion y GSAP (registrados como eases propios). Hovers 200–300 ms, reveals 600–900 ms."
        notes={{
          desktop: "Mismas curvas en hovers, reveals, paneles y scroll. Los muelles del puntero también son tokens.",
          mobile: "Idénticas curvas; las duraciones no cambian, solo se desactivan los efectos pesados.",
          reduced: "Todas las animaciones pasan a estado final al instante; se mantienen los cambios de color y opacidad.",
        }}
      >
        <MotionTokens />
      </Sheet>

      <Sheet
        id="backdrop"
        code="L-04"
        index={4}
        total={TOTAL}
        title="Espacio profundo con retícula de plano"
        description="Tres capas de estrellas con parallax según el cursor y el scroll, la retícula azul-grisácea que se ilumina bajo el cursor y dos resplandores de nebulosa casi imperceptibles. La intro (<1 s) solo se reproduce en la primera visita de la sesión."
        notes={{
          desktop: "Parallax de estrellas con el cursor (capas a distinta profundidad) y con el scroll. Retícula iluminada alrededor del cursor.",
          mobile: "Parallax con el giroscopio (en iPhone tras pulsar «Giroscopio») y con el scroll. Menos estrellas, sin foco de retícula.",
          reduced: "Estrellas estáticas, sin centelleo ni parallax. Sin intro.",
        }}
      >
        <LayerToggles />
      </Sheet>

      <Sheet
        id="cursor"
        code="L-05"
        index={5}
        total={TOTAL}
        title="Cursor con intención"
        description="Punto + anillo en mix-blend difference. Sobre lo interactivo el anillo crece; si el elemento tiene una acción concreta, se convierte en una etiqueta."
        notes={{
          desktop: "Punto exacto, anillo con muelle, etiqueta contextual. Se aparta sobre campos de texto.",
          mobile: "No existe: cada objetivo tiene su feedback de toque (escala, onda o cambio de estado).",
          reduced: "Cursor nativo del sistema.",
        }}
      >
        <CursorTargets />
      </Sheet>

      <Sheet
        id="cards"
        code="L-06"
        index={6}
        total={TOTAL}
        title="Cards: tilt, foco y borde vivo"
        description="Inclinación 3D sutil, un foco que sigue al cursor y un borde que se enciende en azul en el punto más cercano al cursor, incluso antes de entrar en la card."
        notes={{
          desktop: "Tilt con muelle (±6°), foco interior y brillo del borde por proximidad.",
          mobile: "Una «línea de escaneo» recorre la card al hacer scroll; tilt con giroscopio o con la posición de scroll; onda al tocar.",
          reduced: "Card estática con borde fino.",
        }}
      >
        <div className="grid gap-5 md:grid-cols-6">
          <TiltCard className="md:col-span-4" contentClassName="flex min-h-[300px] flex-col justify-between p-7">
            <div className="flex items-center justify-between">
              <span className="mono-label !text-accent">P-01 · {ui.status.building.es}</span>
              <Glyph name="terminal" className="size-5 text-dim" />
            </div>
            <div>
              <h3 className="text-[clamp(1.6rem,3vw,2.4rem)] leading-tight text-fg">{profile.projects[0].name.es}</h3>
              <p className="mt-2 max-w-[52ch] text-[15px] leading-relaxed text-muted">{profile.projects[0].built.es}</p>
            </div>
          </TiltCard>
          <TiltCard className="md:col-span-2" contentClassName="flex min-h-[300px] flex-col justify-between p-7">
            <span className="mono-label">Disponibilidad</span>
            <p className="text-[22px] leading-snug text-fg">{profile.availability.es}</p>
          </TiltCard>
          <TiltCard className="md:col-span-3" contentClassName="p-3">
            <Tone className="relative aspect-[16/10] rounded-[16px]">
              <Image src="/lab/placeholder-3.svg" alt="Marcador de laboratorio" fill unoptimized className="object-cover" />
            </Tone>
            <p className="mono-label px-3 pb-2 pt-4">Card con foto · gris → color al pasar</p>
          </TiltCard>
          <TiltCard className="md:col-span-3" contentClassName="flex min-h-[260px] flex-col justify-between p-7">
            <span className="mono-label">{profile.leadership[4].title.es}</span>
            <p className="text-[18px] leading-relaxed text-muted">{profile.leadership[4].description.es}</p>
          </TiltCard>
        </div>
      </Sheet>

      <Sheet
        id="images"
        code="L-07"
        index={7}
        total={TOTAL}
        title="Logos y fotos: de gris a color"
        description="Escala de grises a color con un zoom ligero al pasar el ratón. Si falta el archivo del logo, aparece un monograma en el mismo marco: ahora mismo no hay ningún logo subido, así que ves los seis monogramas."
        notes={{
          desktop: "Hover: color + zoom 4,5 %.",
          mobile: "Pasa a color al cruzar la franja central de la pantalla mientras haces scroll.",
          reduced: "Cambio de color sin zoom.",
        }}
      >
        <div className="flex flex-wrap items-center gap-4">
          {[...profile.experience.map((e) => ({ k: e.logo, name: e.company, mono: e.monogram })), ...profile.education.map((e) => ({ k: e.logo, name: e.institution.es, mono: e.monogram }))].map((l) => (
            <div key={l.k} className="flex items-center gap-3 rounded-full py-1.5 pl-1.5 pr-4 shadow-[inset_0_0_0_1px_var(--line)]">
              <Logo src={logoSrc(l.k)} name={l.name} monogram={l.mono} size={40} />
              <span className="font-mono text-[11px] text-dim">logos/{l.k}.svg</span>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-4">
          {brandRow.map((b) => (
            <Tone key={b} className="grid size-20 place-items-center rounded-[18px] shadow-[inset_0_0_0_1px_var(--line)]">
              <span style={{ color: brandColor(BRANDS[b]) }}>
                <BrandIcon name={b} className="size-8" title={BRANDS[b].title} />
              </span>
            </Tone>
          ))}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {PLACEHOLDERS.slice(0, 3).map((p, i) => (
            <Tone key={p.src} className="relative aspect-[4/3] rounded-[18px]">
              <Image src={p.src} alt={`Marcador ${i + 1}`} fill unoptimized className="object-cover" />
            </Tone>
          ))}
        </div>
      </Sheet>

      <Sheet
        id="lab-links"
        code="L-08"
        index={8}
        total={TOTAL}
        title="Enlaces y botones"
        description="El subrayado se dibuja de izquierda a derecha (y se retira hacia la derecha); la flecha sale y vuelve a entrar. Los CTA principales son magnéticos."
        notes={{
          desktop: "Subrayado + flecha en hover/foco. Botones magnéticos con capa interior que se desplaza más.",
          mobile: "Sin magnetismo; escala al pulsar.",
          reduced: "Sin desplazamientos; solo color y subrayado.",
        }}
      >
        <div className="grid gap-10 md:grid-cols-2">
          <div className="space-y-5 text-[18px]">
            <p>
              <FancyLink href={profile.links.linkedin} external cursor="Abrir">
                linkedin.com/in/carloslopezparga
              </FancyLink>
            </p>
            <p>
              <FancyLink href={profile.links.github} external cursor="Abrir">
                github.com/carloslopezparga
              </FancyLink>
            </p>
            <p>
              <FancyLink href="#projects" cursor="Ver">
                Ver proyectos
              </FancyLink>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Magnetic>
              <a href="#projects" className="btn btn-primary" data-cursor="Ver">
                Ver proyectos <ArrowRight className="size-4" />
              </a>
            </Magnetic>
            <Magnetic>
              <button type="button" data-action="chat" className="btn btn-ghost" data-cursor="Abrir">
                <span className="size-1.5 rounded-full bg-accent shadow-[0_0_8px_rgb(var(--glow))]" />
                Pregúntale a mi agente
              </button>
            </Magnetic>
            <Magnetic strength={0.5}>
              <a href={`mailto:${profile.email}`} className="btn btn-ghost" data-cursor="Escribir">
                {profile.email}
              </a>
            </Magnetic>
          </div>
        </div>
      </Sheet>

      <Sheet
        id="text"
        code="L-09"
        index={9}
        total={TOTAL}
        title="Texto que se revela"
        description="Titulares por líneas, palabras o caracteres saliendo de una máscara; efecto decode en la tagline y en las etiquetas mono. Nunca mueve el layout: el texto final reserva su espacio."
        notes={{
          desktop: "Reveal al entrar en pantalla. Las etiquetas mono vuelven a descifrarse al pasar el ratón.",
          mobile: "Igual, disparado por scroll.",
          reduced: "Texto final directamente.",
        }}
      >
        <Replay label="Repetir">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="space-y-10">
              <div>
                <p className="mono-label">Por líneas</p>
                <RevealText as="p" mode="lines" className="mt-3 text-[clamp(1.8rem,3.4vw,2.8rem)] font-medium leading-[1.08] tracking-[-0.03em] text-fg">
                  {profile.tagline.es} Del correo y la hoja de cálculo al flujo que funciona solo.
                </RevealText>
              </div>
              <div>
                <p className="mono-label">Por caracteres</p>
                <RevealText as="p" mode="chars" className="font-display mt-3 text-[clamp(2.4rem,5vw,4rem)] leading-none text-fg">
                  López Parga
                </RevealText>
              </div>
            </div>
            <div className="space-y-10">
              <div>
                <p className="mono-label">Decode · tagline</p>
                <p className="mt-3 text-[clamp(1.4rem,2.4vw,2rem)] font-medium leading-snug tracking-[-0.02em] text-fg">
                  <Scramble text={profile.tagline.en} trigger="view" duration={1100} />
                </p>
              </div>
              <div>
                <p className="mono-label">Decode · etiquetas (pasa el ratón)</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Madrid", profile.coordinates, "Rev A", "Sheet 09/19", "Tech Operations"].map((l) => (
                    <span key={l} className="mono-label rounded-full px-3 py-1.5 !text-fg shadow-[inset_0_0_0_1px_var(--line-strong)]">
                      <Scramble text={l.toUpperCase()} trigger="view-hover" duration={600} />
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="mono-label">Por palabras</p>
                <RevealText as="p" mode="words" className="mt-3 max-w-[40ch] text-[20px] leading-snug text-muted">
                  {profile.subtitle.es}
                </RevealText>
              </div>
            </div>
          </div>
        </Replay>
      </Sheet>

      <Sheet
        id="stack"
        code="L-10"
        index={10}
        total={TOTAL}
        title="Stack"
        description="Marquee de iconos que se frena al pasar el cursor y una retícula densa. Cualquier icono alimenta el inspector: dónde lo he usado (definido en profile.ts → usedIn)."
        notes={{
          desktop: "El marquee frena con inercia al entrar el cursor; hover/foco actualiza el inspector.",
          mobile: "Mantén el dedo para frenar y arrastra para moverlo; toque para inspeccionar.",
          reduced: "Fila estática con scroll horizontal.",
        }}
      >
        <StackShowcase items={stackEntries} usedInLabel="Usado en" languages={profile.languages.map((l) => ({ name: l.name.es, level: l.level.es }))} />
      </Sheet>

      <Sheet
        id="parallax"
        code="L-11"
        index={11}
        total={TOTAL}
        title="Parallax por capas"
        description="Cada capa se desplaza a una velocidad distinta con el scroll, y se desplaza según su profundidad con el cursor."
        notes={{
          desktop: "Scroll (scrub) + cursor.",
          mobile: "Scroll + giroscopio.",
          reduced: "Capas fijas.",
        }}
      >
        <ParallaxScene />
      </Sheet>

      <Sheet
        id="projects-intro"
        code="L-12"
        index={12}
        total={TOTAL}
        title="Proyectos: sección fijada con scroll horizontal"
        description="En desktop la sección se fija y los case studies avanzan en horizontal con el scroll vertical. Cada demo se activa al quedar visible y se pausa al salir."
        notes={{
          desktop: "Pin + scroll horizontal con scrub e indicador de progreso.",
          mobile: "Pila vertical normal.",
          reduced: "Pila vertical; demos en estado final.",
        }}
      >
        <span />
      </Sheet>
      <ProjectsRail
        id="projects"
        panels={profile.projects.map((p, i) => (
          <ProjectPanel
            key={p.id}
            project={p}
            index={i + 1}
            lang={lang}
            demo={demos[p.id]}
            labels={{ problem: "Problema", built: "Qué construí", next: "Siguiente", stack: "Stack" }}
            stackLabels={stackLabels}
          />
        ))}
      />

      <Sheet
        id="clip"
        code="L-13"
        index={13}
        total={TOTAL}
        title="Máscaras clip-path"
        description="Las imágenes entran a través de una máscara animada mientras la imagen hace un contra-zoom. Cuatro variantes para elegir."
        notes={{
          desktop: "Al entrar en pantalla.",
          mobile: "Igual.",
          reduced: "Imagen visible desde el principio.",
        }}
      >
        <div className="grid gap-5 md:grid-cols-2">
          {(["up", "left", "iris", "blinds"] as const).map((shape, i) => (
            <div key={shape}>
              <ClipReveal shape={shape} className="relative aspect-[16/10] rounded-[20px]">
                <Image src={PLACEHOLDERS[i + 2].src} alt={`Marcador ${shape}`} fill unoptimized className="object-cover" />
              </ClipReveal>
              <p className="mono-label mt-3">{shape}</p>
            </div>
          ))}
        </div>
      </Sheet>

      <Sheet
        id="dimensions"
        code="L-14"
        index={14}
        total={TOTAL}
        title="Cotas y barra de progreso"
        description="Las cotas miden su propio ancho real y se extienden desde el centro al entrar. La barra de progreso es la línea azul de 1 px arriba del todo (y el % de la barra superior)."
      >
        <div className="space-y-10">
          <DimensionLine />
          <div className="grid gap-10 md:grid-cols-2">
            <DimensionLine />
            <DimensionLine label="Ø 40.4168° N" />
          </div>
          <div className="w-1/2">
            <DimensionLine />
          </div>
        </div>
      </Sheet>

      <Sheet
        id="timeline"
        code="L-15"
        index={15}
        total={TOTAL}
        title="Timeline que se dibuja"
        description="La línea crece con el scroll y cada hito se enciende al alcanzarlo (logo a color, halo azul). Educación usa el mismo componente. Datos reales de profile.ts; los TODO no aparecen."
        notes={{
          desktop: "Scrub de la línea + encendido de hitos.",
          mobile: "Igual, con la línea a la izquierda.",
          reduced: "Línea completa y todos los hitos encendidos.",
        }}
      >
        <div className="grid gap-20">
          <div>
            <p className="mono-label mb-8">Experiencia</p>
            <Timeline items={experience} />
          </div>
          <div>
            <p className="mono-label mb-8">Educación</p>
            <Timeline items={education} />
          </div>
        </div>
      </Sheet>

      <Sheet
        id="gallery"
        code="L-16"
        index={16}
        total={TOTAL}
        title="Galería con parallax y lightbox"
        description="Columnas que se desplazan a distinta velocidad; al abrir, la foto vuela a pantalla completa (transición de elemento compartido). Teclado ← → Esc, arrastre o swipe."
        notes={{
          desktop: "Parallax por columnas + lightbox con arrastre.",
          mobile: "Una columna; swipe en el lightbox.",
          reduced: "Sin parallax; el lightbox aparece con fundido.",
        }}
      >
        <Lightbox
          images={PLACEHOLDERS.map((p, i) => ({ ...p, alt: `Marcador de laboratorio ${i + 1}`, caption: `Marcador ${String(i + 1).padStart(2, "0")}` }))}
          labels={{ view: "Ver", drag: "Arrastrar", close: "Cerrar", prev: "Anterior", next: "Siguiente" }}
        />
      </Sheet>

      <Sheet
        id="counters"
        code="L-17"
        index={17}
        total={TOTAL}
        title="Contadores"
        description="Para la sección de cifras de impacto, que seguirá oculta hasta que haya datos reales. Estos valores son de ejemplo y no aparecerán en la web."
      >
        <div className="grid gap-px overflow-hidden rounded-[var(--radius-card)] bg-line sm:grid-cols-3">
          {[
            { v: 1234, s: "", l: "valor de ejemplo" },
            { v: 98.6, s: "%", d: 1, l: "valor de ejemplo" },
            { v: 42, s: "+", l: "valor de ejemplo" },
          ].map((c, i) => (
            <div key={i} className="bg-bg p-7">
              <p className="font-display text-[clamp(2.6rem,5vw,4rem)] leading-none text-fg">
                <Counter value={c.v} suffix={c.s} decimals={c.d ?? 0} />
              </p>
              <p className="mono-label mt-3">{c.l}</p>
            </div>
          ))}
        </div>
      </Sheet>

      <Sheet
        id="theme"
        code="L-18"
        index={18}
        total={TOTAL}
        title="Tema claro / oscuro"
        description="El nuevo tema se revela en un círculo que crece desde el botón (View Transitions API). Oscuro por defecto; la elección se recuerda."
        notes={{
          desktop: "Revelado circular desde el punto del clic.",
          mobile: "Igual (Safari 18+, Chrome). En navegadores sin soporte, cambio instantáneo.",
          reduced: "Cambio instantáneo.",
        }}
      >
        <div className="flex items-center gap-5">
          <ThemeToggle className="!size-16 [&_svg]:!size-7" labels={{ dark: "Tema oscuro", light: "Tema claro" }} />
          <p className="text-[15px] text-muted">Pulsa el botón y mira el borde del círculo.</p>
        </div>
      </Sheet>

      <Sheet
        id="palette-cmd"
        code="L-19"
        index={19}
        total={TOTAL}
        title="Paleta de comandos"
        description="⌘K / Ctrl+K en escritorio y botón visible en móvil. En la web completa: navegar, cambiar idioma y tema, descargar el CV y abrir el chat. Aquí navega por las láminas y cambia preferencias del lab."
      >
        <div className="flex flex-wrap items-center gap-4">
          <kbd className="mono-label rounded-lg px-3 py-2 !text-fg shadow-[inset_0_0_0_1px_var(--line-strong)]">⌘ K</kbd>
          <span className="text-[15px] text-muted">o el botón ⌘ de la barra superior.</span>
        </div>
      </Sheet>

      <footer className="mx-auto max-w-[1280px] px-5 pb-32 pt-10 sm:px-8 md:px-12">
        <DimensionLine label="Fin del laboratorio · Rev A" />
      </footer>
    </main>
  );
}
