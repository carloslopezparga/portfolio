"use client";

import { useEffect, useState } from "react";

export const toast = (message: string) => window.dispatchEvent(new CustomEvent("toast", { detail: message }));

/** Minimal toast, CSS-only motion. */
export function Toaster() {
  const [msg, setMsg] = useState<{ id: number; text: string } | null>(null);
  useEffect(() => {
    let t = 0;
    const on = (e: Event) => {
      setMsg({ id: Date.now(), text: (e as CustomEvent<string>).detail });
      window.clearTimeout(t);
      t = window.setTimeout(() => setMsg(null), 2400);
    };
    window.addEventListener("toast", on);
    return () => {
      window.removeEventListener("toast", on);
      window.clearTimeout(t);
    };
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-[400] flex justify-center px-4" aria-live="polite">
      {msg ? (
        <div key={msg.id} className="clip-up panel-blur rounded-full px-4 py-2.5 text-[13px] text-fg shadow-[0_0_0_1px_var(--line-strong),0_20px_50px_-20px_rgb(0_0_0/0.6)]">
          {msg.text}
        </div>
      ) : null}
    </div>
  );
}
