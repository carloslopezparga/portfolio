import { contrast } from "@/lib/contrast";

type Swatch = { name: string; token: string; hex: string; use: string; text?: boolean };

const DARK: Swatch[] = [
  { name: "Fondo", token: "--bg", hex: "#05060A", use: "Espacio profundo" },
  { name: "Superficie", token: "--surface", hex: "#0D1017", use: "Cards, paneles" },
  { name: "Superficie 2", token: "--surface-2", hex: "#141821", use: "Elevación" },
  { name: "Texto", token: "--fg", hex: "#F5F7FA", use: "Titulares, texto principal", text: true },
  { name: "Gris", token: "--muted", hex: "#A1A7B3", use: "Texto secundario", text: true },
  { name: "Gris tenue", token: "--dim", hex: "#7D8594", use: "Etiquetas mono pequeñas", text: true },
  { name: "Sutil", token: "--subtle", hex: "#5B6270", use: "Solo decorativo (líneas, cotas)", text: true },
  { name: "Azul eléctrico", token: "--accent", hex: "#4C8DFF", use: "Acento, estados activos", text: true },
  { name: "Azul hielo", token: "--ice", hex: "#9CC3FF", use: "Brillos, destellos", text: true },
];
const LIGHT: Swatch[] = [
  { name: "Fondo", token: "--bg", hex: "#FBFBFD", use: "Papel" },
  { name: "Superficie", token: "--surface", hex: "#FFFFFF", use: "Cards" },
  { name: "Superficie 2", token: "--surface-2", hex: "#F5F5F7", use: "Elevación" },
  { name: "Texto", token: "--fg", hex: "#1D1D1F", use: "Titulares, texto", text: true },
  { name: "Gris", token: "--muted", hex: "#6E6E73", use: "Texto secundario", text: true },
  { name: "Sutil", token: "--subtle", hex: "#86868B", use: "Solo decorativo", text: true },
  { name: "Azul profundo", token: "--accent", hex: "#0066CC", use: "Acento, enlaces", text: true },
];

function Column({ theme, title, swatches }: { theme: "dark" | "light"; title: string; swatches: Swatch[] }) {
  const bg = swatches[0].hex;
  return (
    <div data-theme={theme} className="overflow-hidden rounded-[var(--radius-card)] bg-bg p-5 text-fg shadow-[0_0_0_1px_var(--line-strong)] md:p-6">
      <p className="mono-label">{title}</p>
      <ul className="mt-5 divide-y divide-[var(--line)]">
        {swatches.map((s) => {
          const ratio = contrast(s.hex, bg);
          const pass = ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA grande" : "decorativo";
          return (
            <li key={s.token} className="flex items-center gap-4 py-3">
              <span className="size-10 shrink-0 rounded-[10px] shadow-[inset_0_0_0_1px_var(--line-strong)]" style={{ background: s.hex }} />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] text-fg">
                  {s.name} <span className="font-mono text-[11px] text-dim">{s.token}</span>
                </p>
                <p className="truncate text-[12.5px] text-muted">{s.use}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[12px] text-fg">{s.hex}</p>
                {s.text ? (
                  <p className={`mono-label !text-[9.5px] ${ratio >= 4.5 ? "!text-accent" : ""}`}>
                    {ratio.toFixed(1)}:1 · {pass}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function PaletteSwatches() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Column theme="dark" title="Oscuro · por defecto" swatches={DARK} />
      <Column theme="light" title="Claro · estilo Apple" swatches={LIGHT} />
    </div>
  );
}
