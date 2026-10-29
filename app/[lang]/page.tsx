import { notFound } from "next/navigation";
import { profile, SECTIONS, sectionLabels } from "@/content/profile";
import { AgentHost } from "@/components/agent/AgentHost";
import { Hero } from "@/components/hero/Hero";
import { Contact } from "@/components/sections/Contact";
import { Education } from "@/components/sections/Education";
import { Experience } from "@/components/sections/Experience";
import { Leadership } from "@/components/sections/Leadership";
import { Now } from "@/components/sections/Now";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { BookingHost } from "@/components/site/BookingHost";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { PaletteLauncher } from "@/components/site/PaletteLauncher";
import { UIActionHost } from "@/components/site/UIActionHost";
import { Toaster } from "@/components/ui/Toaster";
import { parseCalLink } from "@/lib/booking";
import { copy } from "@/lib/copy";
import { hasLocale } from "@/lib/i18n";
import { today } from "@/lib/today";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const now = new Date(await today());
  const cal = parseCalLink();
  const sections = SECTIONS.map((id, i) => ({ id, sheet: i + 1, label: sectionLabels[id][lang] }));
  const p = copy.palette;

  return (
    <>
      <a href="#now" className="skip-link">
        {copy.nav.skip[lang]}
      </a>
      <Header
        lang={lang}
        initials={profile.initials}
        name={profile.name}
        total={SECTIONS.length}
        nav={sections.filter((s) => s.id !== "top" && s.id !== "now")}
        labels={{
          command: copy.nav.command[lang],
          menu: copy.nav.menu[lang],
          lang: p.lang[lang],
          dark: copy.nav.dark[lang],
          light: copy.nav.light[lang],
          top: copy.nav.top[lang],
        }}
      />
      <main>
        <Hero lang={lang} />
        <Now lang={lang} now={now} />
        <Experience lang={lang} now={now} />
        <Education lang={lang} now={now} />
        <Projects lang={lang} />
        <Skills lang={lang} />
        <Leadership lang={lang} />
        <Contact lang={lang} />
      </main>
      <Footer lang={lang} year={now.getUTCFullYear()} />

      <UIActionHost />
      <AgentHost lang={lang} />
      <PaletteLauncher
        lang={lang}
        sections={sections}
        email={profile.email}
        booking={!!cal}
        labels={{
          placeholder: p.placeholder[lang],
          search: p.search[lang],
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
          close: copy.nav.close[lang],
        }}
      />
      {cal ? <BookingHost link={cal.link} origin={cal.origin} labels={{ title: copy.booking.title[lang], note: copy.booking.note[lang], close: copy.booking.close[lang] }} /> : null}
      <Toaster />
    </>
  );
}
