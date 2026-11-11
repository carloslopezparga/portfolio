"use client";

import { toast } from "@/components/ui/Toaster";

/** The email, large; a click copies it (or opens the mail app if copying fails). */
export function CopyEmail({ email, copied, hint }: { email: string; copied: string; hint: string }) {
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(email);
          toast(copied);
        } catch {
          window.location.href = `mailto:${email}`;
        }
      }}
      className="group block max-w-full text-left"
    >
      <span className="block break-all font-display text-[clamp(1.9rem,5.6vw,4.2rem)] font-bold leading-[1.02] tracking-[-0.04em] text-fg">{email}</span>
      <span className="mt-3 inline-flex items-center gap-2 text-[14px] font-medium text-muted transition-colors duration-200 group-hover:text-fg">
        <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" aria-hidden>
          <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
          <path d="M10.5 3.5V3A1.5 1.5 0 009 1.5H4A1.5 1.5 0 002.5 3v5A1.5 1.5 0 004 9.5h.5" />
        </svg>
        {hint}
      </span>
    </button>
  );
}
