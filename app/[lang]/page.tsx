import { notFound } from "next/navigation";
import { profile, sectionLabels } from "@/content/profile";
import type { SectionId } from "@/content/types";
import { AgentHost } from "@/components/agent/AgentHost";
import { HeroStage } from "@/components/hero/HeroStage";
import { HeroTitleBlock } from "@/components/hero/HeroTitleBlock";
import { Beyond } from "@/components/sections/Beyond";
import { Contact } from "@/components/sections/Contact";
import { Systems } from "@/components/sections/Systems";
import { Toolkit } from "@/components/sections/Toolkit";
import { Trajectory } from "@/components/sections/Trajectory";
import { BookingHost } from "@/components/site/BookingHost";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { PaletteLauncher } from "@/components/site/PaletteLauncher";
import { SheetBlock } from "@/components/site/SheetBlock";
import { UIActionHost } from "@/components/site/UIActionHost";
import { Toaster } from "@/components/ui/Toaster";
import { parseCalLink } from "@/lib/booking";
import { copy } from "@/lib/copy";
import { hasLocale } from "@/lib/i18n";
import { today } from "@/lib/today";

const SHEETS: SectionId[] = ["top", "systems", "trajectory", "toolkit", "beyond", "contact"];

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const iso = await today();
  const now = new Date(iso);
  const cal = parseCalLink();
  const sections = SHEETS.map((id, i) => ({ id, sheet: i + 1, label: sectionLabels[id][lang] }));
  const parts = profile.domains.map((d) => ({ id: d.id, label: d.label[lang], part: d.part[lang], highlights: d.highlights.map((h) => h[lang]) }));
  const p = copy.palette;

  return (
    <>
      <a href="#systems" className="skip-link">
        {lang === "en" ? "Skip to content" : "Saltar al contenido"}
      </a>
      <Header
        lang={lang}
        initials={profile.initials}
        name={profile.name}
        availability={profile.availability[lang]}
        nav={sections.slice(1)}
        labels={{
          command: copy.nav.command[lang],
          menu: copy.nav.menu[lang],
          lang: p.lang[lang],
          dark: lang === "en" ? "Switch to dark theme" : "Cambiar a tema oscuro",
          light: lang === "en" ? "Switch to light theme" : "Cambiar a tema claro",
          top: lang === "en" ? "Back to top" : "Volver arriba",
        }}
      />
      <main>
        <HeroStage
          parts={parts}
          hintScroll={copy.hero.hintScroll[lang]}
          hintTouch={copy.hero.hintTouch[lang]}
          clickHint={copy.hero.clickHint[lang]}
          assemblyLabel={copy.hero.assembly[lang]}
        >
          <HeroTitleBlock lang={lang} date={iso.slice(0, 10)} />
        </HeroStage>
        <Systems lang={lang} />
        <Trajectory lang={lang} now={now} />
        <Toolkit lang={lang} />
        <Beyond lang={lang} />
        <Contact lang={lang} />
      </main>
      <Footer lang={lang} year={now.getUTCFullYear()} />

      <SheetBlock titles={Object.fromEntries(sections.map((s) => [s.sheet, s.label]))} sheetLabel={copy.sheet.sheet[lang]} />
      <UIActionHost />
      <AgentHost lang={lang} />
      <PaletteLauncher
        lang={lang}
        sections={sections}
        email={profile.email}
        booking={!!cal}
        labels={{
          placeholder: p.placeholder[lang],
          empty: p.empty[lang],
          footer: p.footer[lang],
          navigate: p.navigate[lang],
          actions: p.actions[lang],
          prefs: p.prefs[lang],
          ask: p.ask[lang],
          book: p.book[lang],
          cvEn: p.cvEn[lang],
          cvEs: p.cvEs[lang],
          copyEmail: p.copyEmail[lang],
          copied: copy.contact.copied[lang],
          lang: p.lang[lang],
          theme: p.theme[lang],
        }}
      />
      {cal ? <BookingHost link={cal.link} origin={cal.origin} labels={{ title: copy.booking.title[lang], note: copy.booking.note[lang], close: copy.booking.close[lang] }} /> : null}
      <Toaster />
    </>
  );
}
