import type { CSSProperties } from "react";

/**
 * A figure's gap on the page (desktop only): the empty space where the cloud
 * forms it, and the invisible zone that takes the pointer (hover, drag,
 * click). Decorative. It carries the figure's still poster, shown with
 * reduced motion, without JavaScript or without WebGL.
 */
export function FigureGap({ figure, className = "" }: { figure: "bars" | "gears" | "globe"; className?: string }) {
  return (
    <div data-figure={figure} aria-hidden className={`fig-gap fig-zone ${className}`}>
      <span className="fig-poster" style={{ "--poster": `url(/chip/${figure}-d.svg)` } as CSSProperties} />
      {figure === "bars" ? <span className="fig-poster fig-poster-colour" style={{ backgroundImage: "url(/chip/bars-c.svg)" }} /> : null}
    </div>
  );
}
