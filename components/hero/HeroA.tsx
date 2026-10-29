import type { ReactNode } from "react";
import { PipelineCanvas, type PipelineLabels } from "./PipelineCanvas";

/** Hero option A: the manual → automated pipeline drawn behind the copy. */
export function HeroA({ children, labels }: { children: ReactNode; labels: PipelineLabels }) {
  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <PipelineCanvas labels={labels} />
      {children}
    </section>
  );
}
