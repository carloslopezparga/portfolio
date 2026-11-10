"use client";

import { useRouter } from "next/navigation";
import type { Locale, SectionId } from "@/content/types";
import { askAgent } from "@/lib/agent/store";
import { getPrefs, toggleMotion, usePrefs } from "@/lib/prefs";
import { switchTheme } from "@/lib/theme";
import { dispatchUI } from "@/lib/ui-bus";
import type { PaletteGroup } from "@/components/ui/CommandPalette";
import { toast } from "@/components/ui/Toaster";

export interface SiteActionLabels {
  placeholder: string;
  search: string;
  empty: string;
  footer: string;
  navigate: string;
  actions: string;
  prefs: string;
  ask: string;
  book: string;
  cv: string;
  copyEmail: string;
  copied: string;
  lang: string;
  theme: string;
  pauseMotion: string;
  resumeMotion: string;
  close: string;
}

export interface SiteActionProps {
  lang: Locale;
  sections: { id: SectionId; label: string }[];
  email: string;
  booking: boolean;
  labels: SiteActionLabels;
}


/** Everything the ⌘K palette (desktop) and the full-screen menu (mobile) offer. */
export function useSiteGroups({ lang, sections, email, booking, labels: t }: SiteActionProps): PaletteGroup[] {
  const router = useRouter();
  const { reduced } = usePrefs();
  const otherHref = lang === "en" ? "/es" : "/";
  return [
    {
      heading: t.navigate,
      items: sections.map((s) => ({
        id: `go-${s.id}`,
        label: s.label,
        icon: "spark",
        run: () => dispatchUI({ type: "scroll_to", sectionId: s.id }),
      })),
    },
    {
      heading: t.actions,
      items: [
        { id: "ask", label: t.ask, icon: "chat", keywords: ["agent", "agente", "ai", "ia", "chat"], run: () => askAgent() },
        ...(booking ? [{ id: "book", label: t.book, icon: "clock" as const, keywords: ["call", "llamada", "cal", "meeting"], run: () => dispatchUI({ type: "open_booking" }) }] : []),
        { id: "cv", label: t.cv, icon: "download", keywords: ["cv", "resume", "currículum", "pdf"], run: () => dispatchUI({ type: "download_cv" }) },
        {
          id: "email",
          label: t.copyEmail,
          hint: email,
          icon: "copy",
          keywords: ["email", "mail", "contact", "contacto"],
          run: () => {
            navigator.clipboard.writeText(email).then(
              () => toast(t.copied),
              () => (window.location.href = `mailto:${email}`),
            );
          },
        },
      ],
    },
    {
      heading: t.prefs,
      items: [
        { id: "lang", label: t.lang, icon: "globe", keywords: ["language", "idioma", "english", "español"], run: () => router.push(otherHref + window.location.hash) },
        {
          id: "theme",
          label: t.theme,
          icon: "motion",
          keywords: ["dark", "light", "oscuro", "claro", "theme", "tema"],
          run: () => {
            const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
            switchTheme(next, window.innerWidth / 2, window.innerHeight / 2, getPrefs().reduced);
          },
        },
        // WCAG 2.2.2: the pause control the page no longer shows over the chip
        { id: "motion", label: reduced ? t.resumeMotion : t.pauseMotion, icon: "replay", keywords: ["motion", "animation", "animations", "animaciones", "movimiento", "pause", "pausar", "resume", "reanudar", "play", "stop"], run: toggleMotion },
      ],
    },
  ];
}
