"use client";

import { toast } from "@/components/ui/Toaster";
import { dispatchUI } from "@/lib/ui-bus";

export function CopyEmail({ email, copied, cursor }: { email: string; copied: string; cursor: string }) {
  return (
    <button
      type="button"
      data-cursor={cursor}
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
      <span className="block break-all text-[clamp(1.8rem,5.2vw,4.4rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-fg transition-colors duration-300 group-hover:text-[var(--blue-text)]">
        {email}
      </span>
    </button>
  );
}

export function BookButton({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => dispatchUI({ type: "open_booking" })} className="btn btn-primary">
      <span className="ai-dot size-2 rounded-full" aria-hidden />
      {label}
    </button>
  );
}
