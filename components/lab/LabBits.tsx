"use client";

import { useState, type ReactNode } from "react";
import { Glyph } from "@/components/ui/icons";
import { replayIntro, setFont, toast, toggleLayer, type FontPref } from "./labActions";

/** Re-mounts its children so entrance animations can be replayed. */
export function Replay({ children, label = "Repetir" }: { children: ReactNode; label?: string }) {
  const [k, setK] = useState(0);
  return (
    <div>
      <div key={k}>{children}</div>
      <button
        type="button"
        onClick={() => setK((v) => v + 1)}
        className="mono-label mt-6 inline-flex items-center gap-2 rounded-full px-3 py-2 !text-fg shadow-[inset_0_0_0_1px_var(--line-strong)] transition-hover hover:shadow-[inset_0_0_0_1px_rgb(var(--glow))]"
      >
        <Glyph name="replay" className="size-3.5" />
        {label}
      </button>
    </div>
  );
}

export function FontButton({ font, children }: { font: FontPref; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => {
        setFont(font);
        toast("Tipografía aplicada a toda la página");
      }}
      className="mono-label mt-6 rounded-full px-3 py-2 !text-fg shadow-[inset_0_0_0_1px_var(--line-strong)] transition-hover hover:shadow-[inset_0_0_0_1px_rgb(var(--glow))]"
    >
      {children}
    </button>
  );
}

export function LayerToggles() {
  const [off, setOff] = useState<Record<string, boolean>>({});
  const layers = [
    ["stars", "Estrellas"],
    ["grid", "Retícula"],
    ["nebula", "Auroras"],
  ] as const;
  return (
    <div className="flex flex-wrap gap-2">
      {layers.map(([k, l]) => (
        <button
          key={k}
          type="button"
          aria-pressed={!off[k]}
          onClick={() => {
            toggleLayer(k);
            setOff((o) => ({ ...o, [k]: !o[k] }));
          }}
          className={`mono-label rounded-full px-3 py-2 transition-hover ${off[k] ? "!text-dim shadow-[inset_0_0_0_1px_var(--line)]" : "!text-fg shadow-[inset_0_0_0_1px_rgb(var(--glow)/0.6)]"}`}
        >
          {off[k] ? "○" : "●"} {l}
        </button>
      ))}
      <button
        type="button"
        onClick={replayIntro}
        className="mono-label inline-flex items-center gap-2 rounded-full bg-fg px-3 py-2 !text-bg transition-hover hover:shadow-[0_0_24px_-4px_rgb(var(--glow))]"
      >
        <Glyph name="replay" className="size-3.5" />
        Repetir intro
      </button>
    </div>
  );
}

/** Targets that show each contextual cursor label. */
export function CursorTargets() {
  const [copied, setCopied] = useState(false);
  const tiles: { label: string; cursor?: string; hint: string; onClick?: () => void; icon: Parameters<typeof Glyph>[0]["name"] }[] = [
    { label: "Proyecto", cursor: "Ver", hint: 'data-cursor="Ver"', icon: "doc" },
    { label: "Chat", cursor: "Abrir", hint: 'data-cursor="Abrir"', icon: "chat" },
    { label: "Galería", cursor: "Arrastrar", hint: 'data-cursor="Arrastrar"', icon: "hand" },
    {
      label: copied ? "¡Copiado!" : "clpargaa@gmail.com",
      cursor: copied ? "Copiado" : "Copiar",
      hint: 'data-cursor="Copiar"',
      icon: "copy",
      onClick: () => {
        navigator.clipboard?.writeText("clpargaa@gmail.com");
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      },
    },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((t) => (
        <button
          key={t.hint}
          type="button"
          data-cursor={t.cursor}
          onClick={t.onClick}
          className="group flex h-44 flex-col justify-between rounded-[var(--radius-card)] p-5 text-left shadow-[inset_0_0_0_1px_var(--line)] transition-hover hover:bg-[rgb(var(--glow)/0.05)] hover:shadow-[inset_0_0_0_1px_rgb(var(--glow)/0.5)]"
        >
          <Glyph name={t.icon} className="size-6 text-dim transition-hover group-hover:text-accent" />
          <span>
            <span className="block truncate text-[17px] text-fg">{t.label}</span>
            <span className="mono-label mt-1 block !text-[10px]">{t.hint}</span>
          </span>
        </button>
      ))}
      <div className="flex flex-col gap-3 rounded-[var(--radius-card)] p-5 shadow-[inset_0_0_0_1px_var(--line)] sm:col-span-2 lg:col-span-4 lg:flex-row lg:items-center">
        <a href="#lab-links" className="link-draw w-fit text-fg">
          Enlace normal: el anillo crece
        </a>
        <input
          type="text"
          placeholder="Campo de texto: vuelve el cursor nativo"
          className="h-11 flex-1 rounded-full bg-surface-2 px-4 text-[14px] text-fg outline-none shadow-[inset_0_0_0_1px_var(--line-strong)] placeholder:text-dim focus:shadow-[inset_0_0_0_1px_rgb(var(--glow))]"
          onFocus={() => toast("Sobre campos de texto el cursor propio se aparta")}
        />
      </div>
    </div>
  );
}
