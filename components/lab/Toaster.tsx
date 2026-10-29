"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "./labActions";

/** Small toast + handler for hero CTAs that are not wired yet in the lab. */
export function Toaster() {
  const [msg, setMsg] = useState<{ id: number; text: string } | null>(null);

  useEffect(() => {
    let timer = 0;
    const onToast = (e: Event) => {
      const text = (e as CustomEvent<string>).detail;
      setMsg({ id: Date.now(), text });
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setMsg(null), 2600);
    };
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element).closest<HTMLElement>("[data-action]");
      if (!el) return;
      const action = el.dataset.action;
      if (action === "chat") {
        e.preventDefault();
        toast("El chat con IA se construye en la web completa (fase 2).");
      }
      if (action === "cv") {
        e.preventDefault();
        toast("El CV en PDF se genera en la web completa (fase 2).");
      }
    };
    window.addEventListener("toast", onToast);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("toast", onToast);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[400] flex justify-center px-4" aria-live="polite">
      <AnimatePresence>
        {msg ? (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 8, filter: "blur(4px)" }}
            className="panel-blur rounded-full px-4 py-2.5 text-[13px] text-fg shadow-[0_0_0_1px_var(--line-strong),0_20px_50px_-20px_rgb(0_0_0/0.6)]"
          >
            {msg.text}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
