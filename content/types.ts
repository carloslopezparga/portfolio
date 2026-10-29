export const LOCALES = ["en", "es"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/** A value that exists in both languages. */
export type L<T = string> = { en: T; es: T };

/** A missing value. Anything typed as a Todo is never rendered. */
export type Todo = `TODO:${string}`;
export type Maybe<T> = T | Todo;

export const isTodo = (v: unknown): v is Todo => typeof v === "string" && v.startsWith("TODO:");
export const has = <T>(v: Maybe<T> | undefined | null): v is T => v != null && !isTodo(v);

/** ISO month ("2026-11") or day ("2026-11-03"). */
export type DateISO = `${number}-${number}` | `${number}-${number}-${number}`;

/** A hex colour, e.g. "#2050F6". */
export type Hex = `#${string}`;

/**
 * Skill domains. Each has an Apple system colour:
 * ai = purple, automation = blue, data = cyan, ops = orange, software = green.
 */
export type DomainId = "ai" | "automation" | "data" | "ops" | "software";

/** Apple system accents (light / dark variants live in globals.css). */
export type Accent = "blue" | "indigo" | "purple" | "pink" | "orange" | "green" | "cyan";

export type SectionId = "top" | "now" | "experience" | "education" | "projects" | "skills" | "leadership" | "contact";

export type StackId =
  | "python"
  | "sql"
  | "stats"
  | "nextjs"
  | "typescript"
  | "n8n"
  | "llm-apis"
  | "claude-code"
  | "automation"
  | "operations"
  | "sales"
  | "negotiation";

export type ExperienceId = "prophero" | "grupo-lalala" | "induforum" | "classy-night-society";
export type ProjectId = "job-hunt-copilot" | "mail-autopilot" | "cooling-agent";

/** Everything a skill can point to: the big nodes of the constellation. */
export type RefId = ProjectId | ExperienceId | "giti" | "cs50" | "this-site";

export type ProjectStatus = "live" | "building" | "rnd";

export interface Domain {
  id: DomainId;
  label: L;
}

export interface ImpactMetric {
  id: string;
  value: Maybe<number>;
  suffix?: string;
  decimals?: number;
  label: L;
}

export interface Project {
  id: ProjectId;
  domain: DomainId;
  name: L;
  /** One line for the project card. */
  oneLiner: L;
  status: ProjectStatus;
  problem: L;
  built: L;
  next?: Maybe<L>;
  stack: StackId[];
  repo?: { url: string; public: boolean };
  demo: { kind: "terminal"; file: string } | { kind: "mail-flow" } | { kind: "cooling"; illustrative: boolean };
  /** Optional screenshot in public/photos (filename without extension). */
  screenshot?: string;
}

/**
 * Brand colour of an organisation. The site reads it from the logo file in
 * public/logos when there is one; this value is the fallback until then.
 */
export interface Brand {
  logo: string;
  monogram: string;
  color: Hex;
}

export interface Experience {
  id: ExperienceId;
  company: string;
  brand: Brand;
  role: L;
  /** Short context shown next to the company ("Proptech"). */
  context?: L;
  location: Maybe<L>;
  /** On-site / hybrid / remote. */
  mode?: Maybe<L>;
  start: DateISO;
  /** null = present. */
  end: DateISO | null;
  /** Two lines: what I do there (the "Now" card and the agent use it). */
  summary: Maybe<L>;
  /** 3–4 short, concrete bullets for the experience card and the CV. */
  bullets: Maybe<L>[];
  results?: Maybe<L>;
  /** Bigger card with the "Current" badge. */
  featured?: boolean;
  /** Optional photo in public/photos. */
  photo?: string;
}

export interface Chip {
  label: L;
  /** A registry target to jump to (e.g. a leadership card). */
  target?: string;
}

export interface Education {
  id: "upm" | "retamar";
  institution: L;
  /** Short name for cards ("ETSII-UPM"). */
  short: string;
  brand: Brand;
  degree: L;
  specialisation?: L;
  start: DateISO | null;
  end: DateISO;
  /** Chips: honours, programmes. */
  chips: Maybe<Chip>[];
  featured?: boolean;
}

export interface Course {
  id: "cs50";
  name: string;
  provider: string;
  brand: Brand;
  detail: L;
}

export interface Leadership {
  id: string;
  accent: Accent;
  title: L;
  description: L;
  metric?: Maybe<L>;
  start?: Maybe<DateISO>;
  end?: Maybe<DateISO>;
  photo?: string;
}

/** A link from a skill to where it was used; w = attention weight (line thickness, default 1). */
export type UsedIn = RefId | { id: RefId; w: number };

export interface StackItem {
  id: StackId;
  label: L;
  domain: DomainId;
  /** Star size in the constellation, 1–3 (default 1). */
  weight?: number;
  usedIn: UsedIn[];
}

export interface Language {
  id: string;
  name: L;
  level: L;
}

export interface Hobby {
  id: "drums" | "dj" | "golf" | "sailing";
  label: L;
}

export interface FuturePlan {
  erasmus: { start: DateISO; end: DateISO; destination: Maybe<L> };
  thesis: L;
  /** Full-time availability. */
  fullTime: DateISO;
  graduation: DateISO;
}

export interface Profile {
  name: string;
  initials: string;
  /** Headline under the name. */
  tagline: L;
  /** Two-line summary in the hero. */
  summary: L;
  location: L;
  availability: L;
  email: string;
  links: { linkedin: string; github: string };
  domains: Domain[];
  /** Not rendered at the moment; kept for when real numbers exist. */
  impact: ImpactMetric[];
  experience: Experience[];
  education: Education[];
  courses: Course[];
  future: FuturePlan;
  projects: Project[];
  stack: StackItem[];
  languages: Language[];
  leadership: Leadership[];
  offTheClock: Hobby[];
}
