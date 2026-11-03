import type { Locale, Metric, StackRef } from "@/content/types";

/** Thousands with the language's separator, always grouped: "6,400" / "6.400". */
export function formatNumber(n: number, lang: Locale) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, lang === "es" ? "." : ",");
}

export const metricSuffix = (m: Metric, lang: Locale) => (typeof m.suffix === "string" ? m.suffix : (m.suffix?.[lang] ?? ""));

/** "~400", "6,400+", "−80%" (or the Spanish "6.400+", "−80 %"). */
export function formatMetric(m: Metric, lang: Locale, value = m.value) {
  return `${m.prefix ?? ""}${formatNumber(value, lang)}${metricSuffix(m, lang)}`;
}

/** Label of a project's stack entry (a skill id is resolved by the caller). */
export const isSkill = (s: StackRef): s is Exclude<StackRef, { label: string }> => typeof s === "string";
