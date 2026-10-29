import type { ReactNode } from "react";

export function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 11 11 5M6 5h5v5" />
    </svg>
  );
}

export function ArrowRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

export function ArrowDown({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M8 3v10M4 9l4 4 4-4" />
    </svg>
  );
}

/** Underline draws left → right, arrow slides out and back in. Pure CSS. */
export function FancyLink({
  href,
  children,
  external,
  cursor,
  className,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
  cursor?: string;
  className?: string;
}) {
  const Arrow = external ? ArrowUpRight : ArrowRight;
  return (
    <a
      href={href}
      className={`group inline-flex items-center gap-1.5 ${className ?? ""}`}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      {...(cursor ? { "data-cursor": cursor } : {})}
    >
      <span className="link-draw">{children}</span>
      <span className={`link-arrow ${external ? "" : "link-arrow--right"}`} aria-hidden>
        <Arrow />
        <Arrow />
      </span>
    </a>
  );
}
