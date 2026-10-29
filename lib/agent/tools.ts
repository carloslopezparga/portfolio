import type Anthropic from "@anthropic-ai/sdk";
import { registry } from "@/content/profile";
import { LOCALES } from "@/content/types";
import { bookingEnabled } from "@/lib/booking";

export { bookingEnabled };

/**
 * UI-only tools. They never touch data or leave the site: the browser runs
 * them (scroll, highlight, open a panel…). Every id is an enum taken from
 * the registry in content/profile.ts.
 */
export function agentTools(): Anthropic.Tool[] {
  const tools: Anthropic.Tool[] = [
    {
      name: "scroll_to",
      description: "Scroll the visitor's page to one of the site's sections. Use when the answer is best seen on the page.",
      eager_input_streaming: true,
      input_schema: {
        type: "object",
        properties: { sectionId: { type: "string", enum: registry.sections, description: "top = hero, now = current job and studies, experience, education, projects, skills, leadership, contact." } },
        required: ["sectionId"],
        additionalProperties: false,
      },
    },
    {
      name: "highlight",
      description: "Scroll to and outline one element on the page (a job, school, course, project, skill, language or leadership item) while the rest dims for a moment.",
      eager_input_streaming: true,
      input_schema: {
        type: "object",
        properties: { targetId: { type: "string", enum: registry.targets } },
        required: ["targetId"],
        additionalProperties: false,
      },
    },
    {
      name: "open_project",
      description: "Scroll to Projects and open one project's panel with its demo and case study.",
      eager_input_streaming: true,
      input_schema: {
        type: "object",
        properties: { projectId: { type: "string", enum: registry.projects } },
        required: ["projectId"],
        additionalProperties: false,
      },
    },
    {
      name: "download_cv",
      description: "Download Carlos's one-page CV as a PDF. Only when the visitor asks for the CV.",
      eager_input_streaming: true,
      input_schema: {
        type: "object",
        properties: { lang: { type: "string", enum: [...LOCALES] } },
        required: ["lang"],
        additionalProperties: false,
      },
    },
    {
      name: "focus_part",
      description: "A purely decorative effect: briefly light up one part of the gearbox drawing in the hero (ai = the AI core, automation / data / ops = the planet gears). It does not scroll. Use at most once, and only when it adds a playful touch to an answer about that area.",
      eager_input_streaming: true,
      input_schema: {
        type: "object",
        properties: { part: { type: "string", enum: registry.parts } },
        required: ["part"],
        additionalProperties: false,
      },
    },
  ];
  if (bookingEnabled()) {
    tools.push({
      name: "open_booking",
      description: "Open the calendar to book a 15-minute call with Carlos. Only when the visitor shows real interest in talking to him (hiring, an internship, a collaboration). Offer it; don't push it.",
      eager_input_streaming: true,
      input_schema: { type: "object", properties: {}, additionalProperties: false },
    });
  }
  return tools;
}

type Validated =
  | { ok: true; action: { type: "scroll_to"; sectionId: string } | { type: "highlight"; targetId: string } | { type: "open_project"; projectId: string } | { type: "download_cv"; lang: string } | { type: "focus_part"; part: string } | { type: "open_booking" } }
  | { ok: false; error: string };

const isStr = (v: unknown): v is string => typeof v === "string";

/** Server-side whitelist check — nothing outside the registry reaches the browser. */
export function validateAction(name: string, input: unknown): Validated {
  const o = (input ?? {}) as Record<string, unknown>;
  switch (name) {
    case "scroll_to":
      return isStr(o.sectionId) && (registry.sections as string[]).includes(o.sectionId)
        ? { ok: true, action: { type: "scroll_to", sectionId: o.sectionId } }
        : { ok: false, error: "unknown sectionId" };
    case "highlight":
      return isStr(o.targetId) && registry.targets.includes(o.targetId)
        ? { ok: true, action: { type: "highlight", targetId: o.targetId } }
        : { ok: false, error: "unknown targetId" };
    case "open_project":
      return isStr(o.projectId) && (registry.projects as string[]).includes(o.projectId)
        ? { ok: true, action: { type: "open_project", projectId: o.projectId } }
        : { ok: false, error: "unknown projectId" };
    case "download_cv":
      return isStr(o.lang) && (LOCALES as readonly string[]).includes(o.lang)
        ? { ok: true, action: { type: "download_cv", lang: o.lang } }
        : { ok: false, error: "unknown lang" };
    case "focus_part":
      return isStr(o.part) && (registry.parts as string[]).includes(o.part)
        ? { ok: true, action: { type: "focus_part", part: o.part } }
        : { ok: false, error: "unknown part" };
    case "open_booking":
      return bookingEnabled() ? { ok: true, action: { type: "open_booking" } } : { ok: false, error: "booking unavailable" };
    default:
      return { ok: false, error: "unknown tool" };
  }
}
