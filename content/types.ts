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

/**
 * Areas of the "Carlos as a system" gearbox. Each one has a colour:
 * ai = cyan, automation = electric blue, data = indigo, ops = ice/silver,
 * engineering = white (the ring gear the rest runs inside).
 */
export type DomainId = "ai" | "automation" | "data" | "ops" | "engineering";

export type SectionId = "top" | "systems" | "trajectory" | "toolkit" | "beyond" | "contact";

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

/** Projects, jobs and courses: the big nodes skills point to. */
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

export type ProjectId = Extract<RefId, "job-hunt-copilot" | "mail-autopilot" | "cooling-agent">;
export type ProjectStatus = "live" | "building" | "rnd";

export interface Domain {
  id: DomainId;
  label: L;
  /** The gearbox part that represents it. */
  part: L;
  /** 2–3 real things from this area, shown on hover. */
  highlights: L[];
  /** Where a click on the part leads. */
  section: SectionId;
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
  /** One line for the project list. */
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

export interface Experience {
  id: Extract<RefId, "prophero" | "grupo-lalala" | "classy-night-society" | "induforum">;
  domain: DomainId;
  /** Trajectory lane. */
  lane: "work" | "leadership";
  company: string;
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
  /** Optional photo in public/photos for the detail card. */
  photo?: string;
}

export interface Leadership {
  id: string;
  domain: DomainId;
  title: L;
  description: L;
  metric?: Maybe<L>;
  /** Dates place it on the trajectory chart; undated items only appear in "Beyond". */
  start?: Maybe<DateISO>;
  end?: Maybe<DateISO>;
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

/** A link from a skill to where it was used; w = attention weight (default 1). */
export type UsedIn = RefId | { id: RefId; w: number };

export interface StackItem {
  id: StackId;
  label: L;
  domain: DomainId;
  /** Star size in the constellation (default 1). */
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
  fullTime: DateISO;
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
  domains: Domain[];
  /** Not rendered at the moment; kept for when real numbers exist. */
  impact: ImpactMetric[];
  projects: Project[];
  experience: Experience[];
  leadership: Leadership[];
  education: Education[];
  courses: Course[];
  future: FuturePlan;
  stack: StackItem[];
  languages: Language[];
  offTheClock: Hobby[];
}
