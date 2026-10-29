"use client";

import type { AnchorHTMLAttributes } from "react";
import { dispatchUI } from "@/lib/ui-bus";

/**
 * A link to an element on the page: scrolls to it and highlights it (the same
 * UI action the agent uses). Plain anchor without JavaScript.
 */
export function TargetLink({ targetId, href, onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { targetId: string; href: string }) {
  return (
    <a
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        dispatchUI({ type: "highlight", targetId });
      }}
      {...rest}
    />
  );
}
