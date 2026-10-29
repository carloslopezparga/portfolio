import Image from "next/image";
import { profile } from "@/content/profile";
import { has, type DateISO, type Locale } from "@/content/types";
import { logoSrc, photoSrc } from "@/lib/assets";
import { copy } from "@/lib/copy";
import { formatMonth, formatRange, timeStatus } from "@/lib/i18n";
import { brownianBridges, monthEnd, monthIndex } from "@/lib/timeline";
import { SectionHeader } from "./SectionHeader";
import { TrajectoryChart, type TItem } from "./TrajectoryChart";

function buildItems(lang: Locale, now: Date): TItem[] {
  const t = copy.trajectory;
  const nowM = monthIndex(now);
  const status = (start: DateISO, end: DateISO | null) => {
    const s = timeStatus(start, end, now);
    return s === "upcoming" ? t.incoming[lang] : s === "current" ? t.current[lang] : null;
  };
  const items: TItem[] = [];

  for (const ed of profile.education) {
    items.push({
      id: ed.id,
      lane: "education",
      domain: "engineering",
      start: ed.start ? monthIndex(ed.start) : 0,
      end: monthEnd(ed.end),
      future: false,
      label: ed.id === "upm" ? "ETSII · UPM" : ed.institution[lang],
      title: ed.degree[lang],
      org: ed.institution[lang],
      period: formatRange(ed.start, ed.end, lang),
      status: ed.start ? status(ed.start, ed.end) : null,
      summary: null,
      bullets: [...ed.details.filter(has).map((d) => d[lang]), ...(ed.id === "upm" ? profile.courses.map((c) => `${c.name} · ${c.detail[lang]}`) : [])],
      chips: ed.honors.filter(has).map((h) => h[lang]),
      logo: logoSrc(ed.logo),
      monogram: ed.monogram,
      photo: null,
    });
  }
  const er = profile.future.erasmus;
  items.push({
    id: "erasmus",
    lane: "education",
    domain: "engineering",
    start: monthIndex(er.start),
    end: monthEnd(er.end),
    future: monthIndex(er.start) > nowM,
    label: t.erasmus[lang],
    title: "Erasmus",
    org: has(er.destination) ? er.destination[lang] : "ETSII · UPM",
    period: formatRange(er.start, er.end, lang),
    status: null,
    summary: null,
    bullets: [],
    chips: [],
    logo: null,
    monogram: "ER",
    photo: null,
  });

  for (const e of profile.experience) {
    items.push({
      id: e.id,
      lane: e.lane,
      domain: e.domain,
      start: monthIndex(e.start),
      end: e.end ? monthEnd(e.end) : null,
      future: monthIndex(e.start) > nowM,
      label: e.company,
      title: e.role[lang],
      org: [e.company, e.context?.[lang]].filter(Boolean).join(" · "),
      period: formatRange(e.start, e.end, lang),
      status: status(e.start, e.end),
      summary: has(e.summary) ? e.summary[lang] : null,
      bullets: e.highlights?.map((h) => h[lang]) ?? [],
      chips: [],
      logo: logoSrc(e.logo),
      monogram: e.monogram,
      photo: e.photo ? photoSrc(e.photo) : null,
    });
  }

  for (const l of profile.leadership) {
    if (!has(l.start)) continue; // undated items live in "Beyond" only
    const end = has(l.end) ? l.end : l.start;
    items.push({
      id: l.id,
      lane: "leadership",
      domain: l.domain,
      start: monthIndex(l.start),
      end: monthEnd(end),
      future: false,
      label: l.title[lang],
      title: l.title[lang],
      org: "",
      period: formatRange(l.start, has(l.end) ? l.end : l.start, lang),
      status: null,
      summary: l.description[lang],
      bullets: has(l.metric) ? [l.metric[lang]] : [],
      chips: [],
      logo: null,
      monogram: l.title[lang].slice(0, 2).toUpperCase(),
      photo: l.photo ? photoSrc(l.photo) : null,
    });
  }
  return items;
}

/** Compact vertical version for phones: one disclosure per milestone. */
function TrajectoryList({ items, lang, nowLabel }: { items: TItem[]; lang: Locale; nowLabel: string }) {
  const t = copy.trajectory;
  const bridges = brownianBridges(14, 24, 5);
  return (
    <div className="space-y-8 px-5 sm:px-8">
      {(["education", "work", "leadership"] as const).map((lane) => {
        const li = items.filter((i) => i.lane === lane).sort((a, b) => b.start - a.start);
        if (!li.length) return null;
        return (
          <div key={lane}>
            <p className="mono-label mb-2">{t.lanes[lane][lang]}</p>
            <div className="divide-y divide-[var(--line)] rounded-[16px] shadow-[inset_0_0_0_1px_var(--line)]">
              {li.map((it) => (
                <details key={it.id} className="tr-item group" data-target-id={it.id} data-domain={it.domain}>
                  <summary className="flex cursor-pointer items-center gap-3 px-4 py-3">
                    <span className={`size-2 shrink-0 rounded-full ${it.future ? "border border-[var(--d)]" : "bg-[var(--d)]"}`} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] text-fg">{it.label}</span>
                      <span className="mono-label block !text-[10px]">
                        {it.period}
                        {it.status ? <span className="!text-[var(--d)]"> · {it.status}</span> : null}
                      </span>
                    </span>
                    <svg viewBox="0 0 16 16" className="tr-chevron size-3.5 shrink-0 text-dim transition-transform" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                      <path d="M6 3.5 10.5 8 6 12.5" />
                    </svg>
                  </summary>
                  <div className="px-4 pb-4 pl-9">
                    {it.photo ? (
                      <div className="relative mb-3 aspect-[16/9] overflow-hidden rounded-[12px]">
                        <Image src={it.photo} alt="" fill sizes="90vw" className="object-cover" />
                      </div>
                    ) : null}
                    <p className="text-[14px] text-fg">{it.title}</p>
                    {it.org ? <p className="text-[13px] text-muted">{it.org}</p> : null}
                    {it.summary ? <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{it.summary}</p> : null}
                    {it.bullets.map((b) => (
                      <p key={b} className="mt-1 text-[13px] leading-snug text-muted">
                        — {b}
                      </p>
                    ))}
                    {it.chips.length ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {it.chips.map((c) => (
                          <span key={c} className="mono-label rounded-full px-2 py-1 !text-[9.5px] shadow-[inset_0_0_0_1px_var(--line-strong)]">
                            {c}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </details>
              ))}
            </div>
          </div>
        );
      })}
      <div data-domain="data" className="rounded-[16px] p-4 shadow-[inset_0_0_0_1px_rgb(var(--d-rgb)/0.4)]" data-target-id="full-time">
        <p className="mono-label">
          {nowLabel} → {t.fullTime[lang]}
        </p>
        <svg viewBox="0 0 300 70" className="mt-2 block h-auto w-full" aria-hidden>
          {bridges.map((b, i) => (
            <path key={i} d={b.map((v, j) => `${j ? "L" : "M"}${(10 + (280 * j) / (b.length - 1)).toFixed(1)} ${(35 + v * 26).toFixed(1)}`).join(" ")} fill="none" className="stroke-[var(--d)]" strokeOpacity="0.3" />
          ))}
          <circle cx="290" cy="35" r="4" className="fill-[var(--d)]" />
        </svg>
        <p className="mt-2 text-[13px] text-muted">
          Erasmus · {formatRange(profile.future.erasmus.start, profile.future.erasmus.end, lang)} → {profile.future.thesis[lang]} → {t.fullTime[lang]}
        </p>
      </div>
    </div>
  );
}

export function Trajectory({ lang, now }: { lang: Locale; now: Date }) {
  const t = copy.trajectory;
  const items = buildItems(lang, now);
  const nowM = monthIndex(now);
  const nowDate = formatMonth(`${now.getUTCFullYear()}-${now.getUTCMonth() + 1}` as DateISO, lang);
  return (
    <section id="trajectory" data-sheet="3" className="relative scroll-mt-16 py-20 md:flex md:min-h-[100svh] md:flex-col md:justify-center md:py-16">
      <SectionHeader index={3} title={t.title[lang]} intro={t.intro[lang]} />
      <div className="mx-auto mt-8 hidden w-full max-w-[1400px] px-5 sm:px-8 md:block md:px-12">
        <TrajectoryChart
          items={items}
          now={nowM}
          erasmus={{ start: monthIndex(profile.future.erasmus.start), end: monthEnd(profile.future.erasmus.end) }}
          fullTime={monthIndex(profile.future.fullTime)}
          labels={{
            lanes: { education: t.lanes.education[lang], work: t.lanes.work[lang], leadership: t.lanes.leadership[lang] },
            now: t.now[lang],
            nowDate,
            fullTime: t.fullTime[lang],
            erasmus: `${t.erasmus[lang]} · ${formatRange(profile.future.erasmus.start, profile.future.erasmus.end, lang)}`,
            thesis: profile.future.thesis[lang].replace(/.*\((.*)\)/, "$1"),
            paths: t.paths[lang],
            close: t.close[lang],
          }}
        />
      </div>
      <div className="mt-8 md:hidden">
        <TrajectoryList items={items} lang={lang} nowLabel={`${t.now[lang]} · ${nowDate}`} />
      </div>
    </section>
  );
}
