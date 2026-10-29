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

export type StackId =
  | "python"
  | "sql"
  | "nextjs"
  | "typescript"
  | "n8n"
  | "llm-apis"
  | "claude-code"
  | "automation"
  | "operations"
  | "sales"
  | "negotiation";

/** Anything a stack item can point to with `usedIn`. */
export type RefId =
  | "job-hunt-copilot"
  | "mail-autopilot"
  | "cooling-agent"
  | "prophero"
  | "grupo-lalala"
  | "classy-night-society"
  | "induforum"
  | "cs50"
  | "this-site";

export type ProjectStatus = "live" | "building" | "rnd";

export interface ImpactMetric {
  id: string;
  value: Maybe<number>;
  /** Shown after the number, e.g. "+" or "k". */
  suffix?: string;
  decimals?: number;
  label: L;
}

export interface Project {
  id: Extract<RefId, "job-hunt-copilot" | "mail-autopilot" | "cooling-agent">;
  name: L;
  status: ProjectStatus;
  problem: L;
  built: L;
  /** Work in progress / next step. */
  next?: Maybe<L>;
  stack: StackId[];
  repo?: { url: string; public: boolean };
  demo:
    | { kind: "terminal"; file: string }
    | { kind: "mail-flow" }
    | { kind: "cooling"; illustrative: boolean };
  /** Optional screenshot in public/photos (filename without extension). */
  screenshot?: string;
}

export interface Experience {
  id: Extract<RefId, "prophero" | "grupo-lalala" | "classy-night-society" | "induforum">;
  company: string;
  /** Filename (no extension) in public/logos. */
  logo: string;
  monogram: string;
  role: L;
  context?: L;
  start: DateISO;
  /** null = present. */
  end: DateISO | null;
  summary: Maybe<L>;
  highlights?: L[];
  results?: Maybe<L>;
  metrics?: ImpactMetric[];
}

export interface Leadership {
  id: string;
  title: L;
  description: L;
  metric?: Maybe<L>;
  /** Filename (no extension) in public/photos. */
  photo?: string;
}

export interface Education {
  id: string;
  institution: L;
  logo: string;
  monogram: string;
  degree: L;
  start: DateISO | null;
  end: DateISO;
  details: Maybe<L>[];
  honors: Maybe<L>[];
}

export interface Course {
  id: RefId;
  name: string;
  detail: L;
}

export interface StackItem {
  id: StackId;
  label: L;
  group: "build" | "operate";
  usedIn: RefId[];
}

export interface Language {
  name: L;
  level: L;
}

export interface Hobby {
  id: "drums" | "dj" | "golf" | "sailing";
  label: L;
}

export interface GalleryItem {
  /** Filename in public/photos including extension. */
  file: string;
  alt: L;
  caption?: Maybe<L>;
}

export interface Profile {
  name: string;
  initials: string;
  tagline: L;
  subtitle: L;
  location: L;
  coordinates: string;
  availability: L;
  email: string;
  links: { linkedin: string; github: string };
  impact: ImpactMetric[];
  projects: Project[];
  experience: Experience[];
  leadership: Leadership[];
  education: Education[];
  courses: Course[];
  stack: StackItem[];
  languages: Language[];
  offTheClock: Hobby[];
  gallery: GalleryItem[];
}
