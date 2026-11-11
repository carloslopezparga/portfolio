import { Fragment, type CSSProperties } from "react";
import type { FigureId } from "@/lib/figure-cloud";

export type GapFigure = Exclude<FigureId, "chip">;

/**
 * A figure's gap on the page (desktop only): the empty space where the cloud
 * forms it, and the invisible zone that takes the pointer (hover, drag,
 * click). Decorative. With several figures the gap takes turns between them:
 * data-figure names the one it shows now (the first, until a script changes
 * it) and the cloud flies from one to the next. It carries each figure's
 * still poster, shown with reduced motion, without JavaScript or without WebGL.
 */
export function FigureGap({ figures, className = "" }: { figures: GapFigure[]; className?: string }) {
  return (
    <div data-figure={figures[0]} data-figure-set={figures.length > 1 ? figures.join(" ") : undefined} aria-hidden className={`fig-gap fig-zone ${className}`}>
      {figures.map((figure) => (
        <Fragment key={figure}>
          <span data-of={figure} className="fig-poster" style={{ "--poster": `url(/chip/${figure}-d.svg)` } as CSSProperties} />
          {figure === "bars" ? <span data-of={figure} className="fig-poster fig-poster-colour" style={{ backgroundImage: "url(/chip/bars-c.svg)" }} /> : null}
        </Fragment>
      ))}
    </div>
  );
}
