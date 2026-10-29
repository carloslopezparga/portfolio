"use client";

export type FontPref = "geist" | "inter" | "archivo";

export function setFont(f: FontPref) {
  const d = document.documentElement;
  if (f === "geist") delete d.dataset.font;
  else d.dataset.font = f;
  try {
    if (f === "geist") sessionStorage.removeItem("pref:font");
    else sessionStorage.setItem("pref:font", f);
  } catch {}
  window.dispatchEvent(new Event("lab:font"));
  // Text was re-measured: let ScrollTrigger / SplitText recompute.
  window.dispatchEvent(new Event("resize"));
}

export function getFont(): FontPref {
  const f = document.documentElement.dataset.font;
  return f === "inter" || f === "archivo" ? f : "geist";
}

export function setHeroLang(l: "en" | "es") {
  document.documentElement.dataset.labLang = l;
  window.dispatchEvent(new Event("lab:lang"));
}

/** Replays the first-visit intro: stars light up, grid draws itself. */
export function replayIntro() {
  const d = document.documentElement;
  delete d.dataset.intro;
  void d.offsetWidth;
  d.dataset.intro = "1";
  window.dispatchEvent(new Event("intro:replay"));
  window.setTimeout(() => delete d.dataset.intro, 1600);
}

export function toast(message: string) {
  window.dispatchEvent(new CustomEvent("toast", { detail: message }));
}

export function toggleLayer(name: "stars" | "grid" | "nebula") {
  document.documentElement.classList.toggle(`hide-${name}`);
}
