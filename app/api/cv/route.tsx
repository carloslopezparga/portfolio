import { Document, Font, Link, Page, renderToBuffer, StyleSheet, Text, View } from "@react-pdf/renderer";
import { cacheLife } from "next/cache";
import type { NextRequest } from "next/server";
import type { ReactNode } from "react";
import { profile } from "@/content/profile";
import { has, type DomainId, type Locale } from "@/content/types";
import { formatMonth, formatRange, hasLocale, timeStatus } from "@/lib/i18n";

/*
 * One-page CV, generated from content/profile.ts. Built-in Helvetica and a
 * single column with plain section headings so ATS parsers read it as text.
 * TODO values are never printed; phone and address are never included.
 */

// No automatic hyphenation: a parser would read "Por-tuguese" as two words.
Font.registerHyphenationCallback((word) => [word]);

const C = { ink: "#111318", muted: "#4a505c", rule: "#c9ced8", accent: "#1f5fd1" };

const s = StyleSheet.create({
  page: { paddingTop: 28, paddingBottom: 24, paddingHorizontal: 36, fontFamily: "Helvetica", fontSize: 8.8, lineHeight: 1.32, color: C.ink },
  name: { fontFamily: "Helvetica-Bold", fontSize: 18, lineHeight: 1.15 },
  tagline: { fontSize: 10, lineHeight: 1.3, marginTop: 2 },
  contact: { marginTop: 4, color: C.muted, fontSize: 8.4 },
  link: { color: C.muted, textDecoration: "none" },
  avail: { marginTop: 1, color: C.accent, fontFamily: "Helvetica-Bold", fontSize: 8.4 },
  h2: { marginTop: 8, marginBottom: 3, paddingBottom: 1.5, borderBottomWidth: 0.6, borderBottomColor: C.rule, fontFamily: "Helvetica-Bold", fontSize: 9.2 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  item: { marginBottom: 3.5 },
  cols: { flexDirection: "row", gap: 16 },
  col: { flex: 1 },
  strong: { fontFamily: "Helvetica-Bold" },
  date: { color: C.muted, fontSize: 8.4 },
  sub: { color: C.muted },
  bullet: { flexDirection: "row", marginTop: 1 },
  dot: { width: 9 },
  grow: { flex: 1 },
});

const H = {
  en: { edu: "EDUCATION", exp: "EXPERIENCE", proj: "PROJECTS", lead: "LEADERSHIP & VOLUNTEERING", skills: "SKILLS", langs: "Languages", interests: "Interests", incoming: "Incoming", erasmus: "Erasmus exchange", spec: "Specialisation", course: "Course" },
  es: { edu: "FORMACIÓN", exp: "EXPERIENCIA", proj: "PROYECTOS", lead: "LIDERAZGO Y VOLUNTARIADO", skills: "HABILIDADES", langs: "Idiomas", interests: "Intereses", incoming: "Próximamente", erasmus: "Erasmus", spec: "Especialidad", course: "Curso" },
};

const DOMAIN_ORDER: DomainId[] = ["ai", "automation", "data", "software", "ops"];

function Bullet({ children }: { children: string }) {
  return (
    <View style={s.bullet}>
      <Text style={s.dot}>•</Text>
      <Text style={s.grow}>{children}</Text>
    </View>
  );
}

function Entry({ title, right, sub, children }: { title: string; right: string; sub?: string | null; children?: ReactNode }) {
  return (
    <View style={s.item} wrap={false}>
      <View style={s.row}>
        <Text style={s.strong}>{title}</Text>
        <Text style={s.date}>{right}</Text>
      </View>
      {sub ? <Text style={s.sub}>{sub}</Text> : null}
      {children}
    </View>
  );
}

function CV({ lang, now }: { lang: Locale; now: Date }) {
  const h = H[lang];
  const p = profile;
  const domainLabel = Object.fromEntries(p.domains.map((d) => [d.id, d.label[lang]]));
  const skills = DOMAIN_ORDER.map((d) => ({
    d,
    items: p.stack.filter((x) => x.domain === d).map((x) => x.label[lang]),
  })).filter((g) => g.items.length);
  const erasmus = p.future.erasmus;
  const site = (u: string) => u.replace(/^https?:\/\/(www\.)?/, "");

  return (
    <Document title={`${p.name} — CV`} author={p.name} subject={p.tagline[lang]} language={lang} creator={p.name} producer={p.name}>
      <Page size="A4" style={s.page}>
        <Text style={s.name}>{p.name}</Text>
        <Text style={s.tagline}>{p.tagline[lang]}</Text>
        <Text style={s.contact}>
          {p.location[lang]} ·{" "}
          <Link src={`mailto:${p.email}`} style={s.link}>
            {p.email}
          </Link>{" "}
          ·{" "}
          <Link src={p.links.linkedin} style={s.link}>
            {site(p.links.linkedin)}
          </Link>{" "}
          ·{" "}
          <Link src={p.links.github} style={s.link}>
            {site(p.links.github)}
          </Link>
        </Text>
        <Text style={s.avail}>{p.availability[lang]}</Text>

        <Text style={s.h2}>{h.exp}</Text>
        {p.experience.map((e) => {
          const upcoming = timeStatus(e.start, e.end, now) === "upcoming";
          const sub = [e.role[lang], e.context?.[lang], has(e.location) ? e.location[lang] : null, e.mode && has(e.mode) ? e.mode[lang] : null].filter(Boolean).join(" · ");
          const bullets = e.bullets.filter(has);
          return (
            <Entry key={e.id} title={e.company} right={`${upcoming ? `${h.incoming} · ` : ""}${formatRange(e.start, e.end, lang)}`} sub={sub}>
              {bullets.map((x, i) => (
                <Bullet key={i}>{x[lang]}</Bullet>
              ))}
              {!bullets.length && has(e.summary) ? <Text>{e.summary[lang]}</Text> : null}
              {has(e.results) ? <Bullet>{e.results[lang]}</Bullet> : null}
            </Entry>
          );
        })}

        <Text style={s.h2}>{h.edu}</Text>
        {p.education.map((e) => {
          const chips = e.chips.filter(has).map((c) => c.label[lang]);
          return (
            <Entry key={e.id} title={e.institution[lang]} right={formatRange(e.start, e.end, lang)} sub={e.degree[lang]}>
              {e.specialisation ? <Bullet>{`${h.spec}: ${e.specialisation[lang]}`}</Bullet> : null}
              {chips.length ? <Bullet>{chips.join(" · ")}</Bullet> : null}
              {e.id === "upm" ? (
                <Bullet>{`${h.erasmus}${has(erasmus.destination) ? ` · ${erasmus.destination[lang]}` : ""} · ${formatMonth(erasmus.start, lang)} – ${formatMonth(erasmus.end, lang)}`}</Bullet>
              ) : null}
            </Entry>
          );
        })}
        {p.courses.map((c) => (
          <Entry key={c.id} title={`${c.name} · ${c.provider}`} right={h.course} sub={c.detail[lang]} />
        ))}

        <Text style={s.h2}>{h.proj}</Text>
        {p.projects.map((pr) => (
          <View key={pr.id} style={s.item} wrap={false}>
            <View style={s.row}>
              <Text>
                <Text style={s.strong}>{pr.name[lang]}</Text>
                <Text style={s.sub}>{` · ${pr.oneLiner[lang]}`}</Text>
              </Text>
              <Text style={s.date}>{pr.stack.map((id) => p.stack.find((x) => x.id === id)?.label[lang] ?? id).join(", ")}</Text>
            </View>
            <Text>
              {pr.built[lang]}
              {has(pr.next) ? <Text style={s.sub}>{` ${pr.next[lang]}`}</Text> : null}
            </Text>
          </View>
        ))}

        <Text style={s.h2}>{h.lead}</Text>
        {p.leadership.map((l) => (
          <View key={l.id} style={s.bullet}>
            <Text style={s.dot}>•</Text>
            <Text style={s.grow}>
              <Text style={s.strong}>{l.title[lang]}</Text>
              {` · ${l.description[lang]}${has(l.metric) ? ` ${l.metric[lang]}` : ""}`}
            </Text>
          </View>
        ))}

        <Text style={s.h2}>{h.skills}</Text>
        <View style={s.cols}>
          <View style={s.col}>
            {skills.slice(0, 3).map((g) => (
              <Text key={g.d}>
                <Text style={s.strong}>{domainLabel[g.d]}: </Text>
                {g.items.join(", ")}
              </Text>
            ))}
          </View>
          <View style={s.col}>
            {skills.slice(3).map((g) => (
              <Text key={g.d}>
                <Text style={s.strong}>{domainLabel[g.d]}: </Text>
                {g.items.join(", ")}
              </Text>
            ))}
            <Text>
              <Text style={s.strong}>{h.langs}: </Text>
              {p.languages.map((l) => `${l.name[lang]} (${l.level[lang]})`).join(", ")}
            </Text>
            <Text>
              <Text style={s.strong}>{h.interests}: </Text>
              {p.offTheClock.map((x) => x.label[lang]).join(", ")}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

/** Rendered once per language per day (the "Incoming" label depends on the date). */
async function renderCv(lang: Locale) {
  "use cache";
  cacheLife("days");
  const buf = await renderToBuffer(<CV lang={lang} now={new Date()} />);
  return Buffer.from(buf).toString("base64");
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("lang") ?? "en";
  const lang: Locale = hasLocale(q) ? q : "en";
  const pdf = Buffer.from(await renderCv(lang), "base64");
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Carlos-Lopez-Parga-CV-${lang.toUpperCase()}.pdf"`,
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "X-Robots-Tag": "noindex",
    },
  });
}
