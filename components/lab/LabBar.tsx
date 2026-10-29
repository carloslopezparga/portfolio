"use client";

import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Glyph } from "@/components/ui/icons";
import { CommandPalette, openPalette, type PaletteGroup } from "@/components/ui/CommandPalette";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useLenis } from "@/components/providers/SmoothScroll";
import { requestGyro, useGyroState } from "@/lib/pointer";
import { getPrefs, setInputOverride, setMotionOverride, usePrefs } from "@/lib/prefs";
import { switchTheme } from "@/lib/theme";
import { getFont, replayIntro, setFont, setHeroLang, toast, toggleLayer, type FontPref } from "./labActions";

function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  const id = useId();
  return (
    <div className="flex items-center gap-2">
      <span className="mono-label !text-[9.5px]">{label}</span>
      <div className="flex rounded-full p-0.5 shadow-[inset_0_0_0_1px_var(--line-strong)]" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={`relative rounded-full px-2.5 py-1 text-[12px] transition-colors duration-200 ${value === o.value ? "text-bg" : "text-muted hover:text-fg"}`}
          >
            {value === o.value ? <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-full bg-fg" transition={{ type: "spring", stiffness: 420, damping: 34 }} /> : null}
            <span className="relative">{o.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function LabBar({ sheets }: { sheets: { id: string; code: string; title: string }[] }) {
  const { motionOverride, inputOverride, touch, reduced } = usePrefs();
  const gyroState = useGyroState();
  const [font, setFontState] = useState<FontPref>("geist");
  const [lang, setLang] = useState<"en" | "es">("en");
  const pctRef = useRef<HTMLSpanElement>(null);
  const lenis = useLenis();
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (pctRef.current) pctRef.current.textContent = String(Math.round(v * 100)).padStart(3, "0");
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync with the attribute set before paint
    setFontState(getFont());
    const l = document.documentElement.dataset.labLang === "es" ? "es" : "en";
    setLang(l);
  }, []);

  const applyFont = (f: FontPref) => {
    setFont(f);
    setFontState(f);
  };
  const applyLang = (l: "en" | "es") => {
    setHeroLang(l);
    setLang(l);
  };
  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -64, duration: 1.4 });
    else el.scrollIntoView();
  };

  const groups: PaletteGroup[] = [
    {
      heading: "Láminas",
      items: sheets.map((s) => ({ id: `go-${s.id}`, label: s.title, hint: s.code, icon: "doc", run: () => go(s.id) })),
    },
    {
      heading: "Preferencias",
      items: [
        {
          id: "theme",
          label: "Cambiar tema claro / oscuro",
          icon: "spark",
          run: () => {
            const dark = document.documentElement.dataset.theme !== "light";
            switchTheme(dark ? "light" : "dark", window.innerWidth - 60, 36, getPrefs().reduced);
          },
        },
        { id: "m-reduce", label: reduced ? "Motion: volver a automático" : "Simular reduced motion", icon: "motion", run: () => setMotionOverride(reduced ? "auto" : "reduce") },
        { id: "i-touch", label: touch ? "Input: volver a automático" : "Simular modo táctil", icon: "hand", run: () => setInputOverride(touch ? "auto" : "touch") },
        { id: "f-geist", label: "Tipografía: Geist", icon: "type", run: () => applyFont("geist") },
        { id: "f-inter", label: "Tipografía: Inter Tight", icon: "type", run: () => applyFont("inter") },
        { id: "f-archivo", label: "Tipografía: titulares en Archivo expandida", icon: "type", run: () => applyFont("archivo") },
        { id: "lang", label: lang === "en" ? "Hero en español" : "Hero in English", icon: "globe", run: () => applyLang(lang === "en" ? "es" : "en") },
        ...(touch && gyroState === "needs-permission" ? [{ id: "gyro", label: "Activar giroscopio", icon: "phone" as const, run: () => void requestGyro() }] : []),
      ],
    },
    {
      heading: "Acciones",
      items: [
        { id: "intro", label: "Repetir intro", icon: "replay", run: () => replayIntro() },
        {
          id: "copy",
          label: "Copiar email",
          icon: "copy",
          run: () => {
            navigator.clipboard?.writeText("clpargaa@gmail.com");
            toast("Email copiado");
          },
        },
        { id: "stars", label: "Mostrar / ocultar estrellas", icon: "spark", run: () => (toggleLayer("stars"), false) },
        { id: "grid", label: "Mostrar / ocultar retícula", icon: "sheet", run: () => (toggleLayer("grid"), false) },
        { id: "site", label: "Ir a la home (en construcción)", icon: "globe", run: () => router.push("/") },
        { id: "cv", label: "Descargar CV", hint: "Fase 2", icon: "download", disabled: true, run: () => {} },
        { id: "chat", label: "Abrir chat con IA", hint: "Fase 2", icon: "chat", disabled: true, run: () => {} },
      ],
    },
  ];

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[120] px-3 pt-3">
        <div className="panel-blur mx-auto flex h-12 max-w-[1400px] items-center gap-4 rounded-full px-4 shadow-[0_0_0_1px_var(--line),0_10px_40px_-20px_rgb(0_0_0/0.6)]">
          <a href="#top" className="font-display text-[15px] text-fg" onClick={(e) => (e.preventDefault(), go("top"))}>
            CLP<span className="text-accent">·</span>LAB
          </a>
          <span className="mono-label tabular hidden sm:inline">
            <span ref={pctRef} className="text-fg">
              000
            </span>
            %
          </span>
          <div className="ml-auto hidden items-center gap-4 xl:flex">
            <Segmented
              label="Tipo"
              value={font}
              onChange={applyFont}
              options={[
                { value: "geist", label: "Geist" },
                { value: "inter", label: "Inter T." },
                { value: "archivo", label: "Archivo" },
              ]}
            />
            <Segmented
              label="Motion"
              value={motionOverride === "reduce" ? "reduce" : "auto"}
              onChange={(v) => setMotionOverride(v)}
              options={[
                { value: "auto", label: "Auto" },
                { value: "reduce", label: "Reduce" },
              ]}
            />
            <Segmented
              label="Input"
              value={inputOverride === "touch" ? "touch" : "auto"}
              onChange={(v) => setInputOverride(v)}
              options={[
                { value: "auto", label: "Auto" },
                { value: "touch", label: "Touch" },
              ]}
            />
            <Segmented
              label="Hero"
              value={lang}
              onChange={applyLang}
              options={[
                { value: "en", label: "EN" },
                { value: "es", label: "ES" },
              ]}
            />
          </div>
          <div className="ml-auto flex items-center gap-2 xl:ml-0">
            {touch && gyroState === "needs-permission" ? (
              <button type="button" onClick={() => void requestGyro()} className="mono-label rounded-full px-3 py-2 !text-fg shadow-[inset_0_0_0_1px_var(--line-strong)]">
                Giroscopio
              </button>
            ) : null}
            <button
              type="button"
              onClick={replayIntro}
              aria-label="Repetir intro"
              className="hidden size-9 place-items-center rounded-full text-fg shadow-[inset_0_0_0_1px_var(--line-strong)] transition-hover hover:shadow-[inset_0_0_0_1px_rgb(var(--glow))] sm:grid"
            >
              <Glyph name="replay" className="size-[17px]" />
            </button>
            <ThemeToggle labels={{ dark: "Tema oscuro", light: "Tema claro" }} />
            <button
              type="button"
              onClick={openPalette}
              className="flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] text-fg shadow-[inset_0_0_0_1px_var(--line-strong)] transition-hover hover:shadow-[inset_0_0_0_1px_rgb(var(--glow)),0_0_18px_-4px_rgb(var(--glow))]"
            >
              <Glyph name="command" className="size-[15px]" />
              <span className="mono-label !text-fg">K</span>
            </button>
          </div>
        </div>
      </header>

      {/* Visible palette trigger on small screens */}
      <button
        type="button"
        onClick={openPalette}
        aria-label="Abrir paleta de comandos"
        className="panel-blur fixed bottom-5 right-5 z-[120] grid size-14 place-items-center rounded-full text-fg shadow-[0_0_0_1px_var(--line-strong),0_0_30px_-8px_rgb(var(--glow))] lg:hidden"
      >
        <Glyph name="command" className="size-5" />
      </button>

      <CommandPalette groups={groups} placeholder="Busca una lámina o un comando…" empty="Sin resultados" footer={<span className="mono-label !text-[10px]">↑↓ navegar · ↵ ejecutar · esc cerrar</span>} />
    </>
  );
}
