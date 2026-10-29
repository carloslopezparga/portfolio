"use client";

import { useRouter } from "next/navigation";
import type { Locale, SectionId } from "@/content/types";
import { askAgent } from "@/lib/agent/store";
import { getPrefs } from "@/lib/prefs";
import { switchTheme } from "@/lib/theme";
import { dispatchUI } from "@/lib/ui-bus";
import { CommandPalette, type PaletteGroup } from "@/components/ui/CommandPalette";
import { toast } from "@/components/ui/Toaster";

export interface SitePaletteLabels {
  placeholder: string;
  empty: string;
  footer: string;
  navigate: string;
  actions: string;
  prefs: string;
  ask: string;
  book: string;
  cvEn: string;
  cvEs: string;
  copyEmail: string;
  copied: string;
  lang: string;
  theme: string;
}

/** The site's ⌘K palette. Loaded on the first ⌘K / click, then stays mounted. */
export default function SitePalette({
  lang,
  sections,
  email,
  booking,
  labels: t,
}: {
  lang: Locale;
  sections: { id: SectionId; label: string; sheet: number }[];
  email: string;
  booking: boolean;
  labels: SitePaletteLabels;
}) {
  const router = useRouter();
  const otherHref = lang === "en" ? "/es" : "/";

  const groups: PaletteGroup[] = [
    {
      heading: t.navigate,
      items: sections.map((s) => ({
        id: `go-${s.id}`,
        label: s.label,
        hint: `${String(s.sheet).padStart(2, "0")} / 06`,
        icon: "spark",
        run: () => dispatchUI({ type: "scroll_to", sectionId: s.id }),
      })),
    },
    {
      heading: t.actions,
      items: [
        { id: "ask", label: t.ask, icon: "chat", keywords: ["agent", "agente", "ai", "ia", "chat"], run: () => askAgent() },
        ...(booking ? [{ id: "book", label: t.book, icon: "clock" as const, keywords: ["call", "llamada", "cal", "meeting"], run: () => dispatchUI({ type: "open_booking" }) }] : []),
        { id: "cv-en", label: t.cvEn, icon: "download", keywords: ["cv", "resume", "pdf"], run: () => dispatchUI({ type: "download_cv", lang: "en" }) },
        { id: "cv-es", label: t.cvEs, icon: "download", keywords: ["cv", "currículum", "pdf"], run: () => dispatchUI({ type: "download_cv", lang: "es" }) },
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
      ],
    },
  ];

  return <CommandPalette initialOpen groups={groups} placeholder={t.placeholder} empty={t.empty} footer={<span className="mono-label !text-[10px]">{t.footer}</span>} />;
}
