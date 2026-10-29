"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { profile, sectionLabels, targetDomain, targetLabel } from "@/content/profile";
import type { Locale, SectionId } from "@/content/types";
import { agentUI } from "@/lib/agent/store";
import { copy, fill } from "@/lib/copy";
import { useIsTouch } from "@/lib/prefs";
import { agentBusy, dispatchUI, type UIAction } from "@/lib/ui-bus";

type Part = { kind: "text"; v: string } | { kind: "action"; label: string; domain?: string };
type Turn =
  | { role: "user"; content: string }
  | { role: "assistant"; parts: Part[]; done: boolean; error?: string };

const MAX_BUDGET = 12;
const STORE_KEY = "agent:transcript";

function actionLine(a: UIAction, lang: Locale): Part {
  const t = copy.agent.actions;
  switch (a.type) {
    case "scroll_to":
      return { kind: "action", label: fill(t.scroll_to[lang], sectionLabels[a.sectionId as SectionId][lang]) };
    case "highlight":
      return { kind: "action", label: fill(t.highlight[lang], targetLabel(a.targetId, lang)), domain: targetDomain(a.targetId) ?? undefined };
    case "open_project":
      return { kind: "action", label: fill(t.open_project[lang], targetLabel(a.projectId, lang)), domain: targetDomain(a.projectId) ?? undefined };
    case "download_cv":
      return { kind: "action", label: fill(t.download_cv[lang], a.lang.toUpperCase()) };
    case "open_booking":
      return { kind: "action", label: t.open_booking[lang] };
    case "focus_part":
      return { kind: "action", label: fill(t.focus_part[lang], targetLabel(a.part, lang)), domain: a.part };
    default:
      return { kind: "action", label: "" };
  }
}

const textOf = (parts: Part[]) =>
  parts
    .filter((p): p is { kind: "text"; v: string } => p.kind === "text")
    .map((p) => p.v)
    .join("");

/**
 * The agent's console. No bubbles: a transcript of lines, answers streamed
 * token by token (each one lands with a faint cyan flash), and every UI action
 * the agent takes shown as a discreet mono line. Desktop: a panel that stays
 * open while the page moves behind it. Mobile: a sheet that tucks itself away
 * while you scroll and comes back when you stop.
 */
export default function AgentConsole({ lang }: { lang: Locale }) {
  const ui = useSyncExternalStore(agentUI.subscribe, agentUI.get, agentUI.get);
  const touch = useIsTouch();
  const [turns, setTurns] = useState<Turn[]>(() => {
    try {
      const raw = sessionStorage.getItem(STORE_KEY);
      return raw ? (JSON.parse(raw) as Turn[]).filter((t) => t.role === "user" || t.done) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [mini, setMini] = useState(false);
  const [tucked, setTucked] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const handledSeq = useRef(0);

  const actionsUsed = turns.reduce((n, t) => n + (t.role === "assistant" ? t.parts.filter((p) => p.kind === "action").length : 0), 0);
  const used = turns.filter((t) => t.role === "user" || (t.role === "assistant" && !t.error)).length + actionsUsed;
  const exhausted = used >= MAX_BUDGET - 1;

  useEffect(() => {
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify(turns));
    } catch {}
    const b = bodyRef.current;
    if (b) b.scrollTop = b.scrollHeight;
  }, [turns]);

  const send = useCallback(
    async (q: string) => {
      const question = q.trim().slice(0, 500);
      if (!question || busy) return;
      const history = turns
        .filter((t) => t.role === "user" || (t.role === "assistant" && t.done && !t.error && textOf(t.parts)))
        .map((t) => (t.role === "user" ? { role: "user" as const, content: t.content } : { role: "assistant" as const, content: textOf(t.parts) }));
      // Keep strict user/assistant alternation for the API.
      const clean: { role: "user" | "assistant"; content: string }[] = [];
      history.forEach((m) => {
        if (clean.length && clean[clean.length - 1].role === m.role) clean[clean.length - 1] = m;
        else clean.push(m);
      });
      if (clean.length && clean[clean.length - 1].role === "user") clean.pop();
      const payload = [...clean, { role: "user" as const, content: question }].slice(-11);
      if (payload[0]?.role !== "user") payload.shift();

      setTurns((t) => [...t, { role: "user", content: question }, { role: "assistant", parts: [], done: false }]);
      setBusy(true);
      agentBusy.set(true);
      const patch = (fn: (a: Extract<Turn, { role: "assistant" }>) => Extract<Turn, { role: "assistant" }>) =>
        setTurns((t) => {
          const last = t[t.length - 1];
          if (!last || last.role !== "assistant") return t;
          return [...t.slice(0, -1), fn(last)];
        });

      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: payload, lang }),
          signal: ctrl.signal,
        });
        if (!res.ok || !res.body) {
          const code = res.status === 503 ? "offline" : res.status === 429 ? "rate" : "error";
          patch((a) => ({ ...a, done: true, error: code }));
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          let nl: number;
          while ((nl = buf.indexOf("\n")) >= 0) {
            const line = buf.slice(0, nl).trim();
            buf = buf.slice(nl + 1);
            if (!line) continue;
            const ev = JSON.parse(line) as { t: string; v?: string; a?: UIAction; code?: string };
            if (ev.t === "text" && ev.v) patch((a) => ({ ...a, parts: [...a.parts, { kind: "text", v: ev.v! }] }));
            else if (ev.t === "action" && ev.a) {
              const action = ev.a;
              patch((a) => ({ ...a, parts: [...a.parts, actionLine(action, lang)] }));
              // Run it after the line renders, so the visitor reads what is about to happen.
              window.setTimeout(() => dispatchUI(action), 250);
            } else if (ev.t === "error") patch((a) => ({ ...a, error: ev.code === "refusal" ? "refusal" : ev.code === "busy" ? "rate" : "error" }));
          }
        }
        patch((a) => ({ ...a, done: true }));
      } catch {
        if (!ctrl.signal.aborted) patch((a) => ({ ...a, done: true, error: "error" }));
      } finally {
        setBusy(false);
        agentBusy.set(false);
        abortRef.current = null;
      }
    },
    [busy, turns, lang],
  );

  // A question typed in the hero prompt bar (or ⌘K) arrives through the store.
  const sendRef = useRef(send);
  useEffect(() => {
    sendRef.current = send;
  });
  useEffect(() => {
    const handle = () => {
      const s = agentUI.get();
      if (!s.open || s.seq === handledSeq.current) return;
      handledSeq.current = s.seq;
      setMini(false);
      if (s.pending) void sendRef.current(s.pending);
      else window.setTimeout(() => inputRef.current?.focus(), 50);
    };
    const t = window.setTimeout(handle, 0); // the request that mounted the console
    const off = agentUI.subscribe(handle);
    return () => {
      window.clearTimeout(t);
      off();
    };
  }, []);

  // Mobile: tuck away while the page scrolls, come back when it stops.
  useEffect(() => {
    if (!touch || !ui.open) return;
    let t = 0;
    const onScroll = () => {
      setTucked(true);
      window.clearTimeout(t);
      t = window.setTimeout(() => setTucked(false), 900);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(t);
    };
  }, [touch, ui.open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  if (!ui.open) return null;

  const collapsed = mini || tucked;
  const email = (
    <a href={`mailto:${profile.email}`} className="text-fg underline decoration-[var(--line-strong)] underline-offset-4 hover:decoration-[var(--ai)]">
      {profile.email}
    </a>
  );

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => {
          setMini(false);
          setTucked(false);
        }}
        aria-label={copy.agent.expand[lang]}
        className="material-blur fixed bottom-5 left-1/2 z-[160] flex h-11 -translate-x-1/2 items-center gap-2.5 rounded-full px-4 text-[13px] text-fg shadow-[0_0_0_1px_var(--line-strong),0_0_30px_-8px_rgb(var(--ai-rgb)/0.6)] md:left-auto md:right-6 md:translate-x-0"
      >
        <span className={`ai-dot size-2 rounded-full ${busy ? "animate-pulse" : ""}`} />
        {copy.agent.name[lang]}
      </button>
    );
  }

  return (
    <section
      aria-label={copy.agent.name[lang]}
      className="agent-console material-blur fixed inset-x-2 bottom-2 z-[160] flex max-h-[72svh] flex-col overflow-hidden rounded-[20px] shadow-[0_0_0_1px_var(--line-strong),0_40px_120px_-30px_rgb(0_0_0/0.7),0_0_60px_-30px_rgb(var(--ai-rgb)/0.7)] md:inset-x-auto md:bottom-6 md:right-6 md:max-h-[min(70vh,640px)] md:w-[440px]"
    >
      {/* header */}
      <header className="flex items-center gap-3 border-b border-line px-4 py-3">
        <span className={`ai-dot size-2.5 shrink-0 rounded-full ${busy ? "animate-pulse" : ""}`} aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-medium leading-tight text-fg">{copy.agent.name[lang]}</p>
          <p className="mono-label truncate !text-[9.5px]">{copy.agent.grounded[lang]}</p>
        </div>
        <span className="mono-label tabular !text-[10px]" title={copy.agent.budget[lang]}>
          {Math.min(used, MAX_BUDGET)}/{MAX_BUDGET}
        </span>
        <button
          type="button"
          onClick={() => {
            abortRef.current?.abort();
            setTurns([]);
          }}
          aria-label={copy.agent.reset[lang]}
          className="grid size-8 place-items-center rounded-full text-dim hover:text-fg"
        >
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M3 8a5 5 0 1 0 1.5-3.5M3 2.5v2.5h2.5" />
          </svg>
        </button>
        <button type="button" onClick={() => setMini(true)} aria-label={copy.agent.minimize[lang]} className="grid size-8 place-items-center rounded-full text-dim hover:text-fg">
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M3.5 8h9" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => {
            abortRef.current?.abort();
            agentUI.set((s) => ({ ...s, open: false, pending: null }));
          }}
          aria-label={copy.agent.close[lang]}
          className="grid size-8 place-items-center rounded-full text-dim hover:text-fg"
        >
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </header>

      {/* transcript */}
      <div ref={bodyRef} data-lenis-prevent className="min-h-[120px] flex-1 space-y-4 overflow-y-auto px-4 py-4 text-[14.5px] leading-relaxed" aria-live="polite">
        {turns.length === 0 ? (
          <div>
            <p className="text-muted">{copy.agent.prompt[lang]}.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {copy.agent.examples[lang].map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => void send(ex)}
                  className="rounded-full px-3 py-1.5 text-left text-[12.5px] text-muted shadow-[inset_0_0_0_1px_var(--line-strong)] transition-colors hover:text-fg hover:shadow-[inset_0_0_0_1px_rgb(var(--ai-rgb)/0.6)]"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {turns.map((t, i) =>
          t.role === "user" ? (
            <p key={i} className="flex gap-2 text-fg">
              <span className="mono-label mt-[0.3em] shrink-0 !text-[var(--ai)]">›</span>
              <span className="min-w-0 break-words">{t.content}</span>
            </p>
          ) : (
            <div key={i} className="pl-4">
              {t.parts.length === 0 && !t.done && !t.error ? (
                <span className="agent-dots" aria-label="…">
                  <i />
                  <i />
                  <i />
                </span>
              ) : null}
              <p className="whitespace-pre-wrap break-words text-muted">
                {t.parts.map((p, j) =>
                  p.kind === "text" ? (
                    <span key={j} className={t.done ? undefined : "tok"}>
                      {p.v}
                    </span>
                  ) : (
                    <span key={j} data-domain={p.domain} className="my-1.5 flex items-center gap-2 font-mono text-[11px] tracking-[0.04em] text-dim">
                      <span className="size-1.5 shrink-0 rounded-full bg-[var(--d,var(--ai))]" />→ {p.label}
                    </span>
                  ),
                )}
              </p>
              {t.error ? (
                <p className="mt-1 text-[13.5px] text-muted">
                  {t.error === "offline" ? (
                    <>
                      {copy.agent.offline[lang]} {email}
                    </>
                  ) : t.error === "rate" ? (
                    copy.agent.rateLimited[lang]
                  ) : t.error === "refusal" ? (
                    copy.agent.refusal[lang]
                  ) : (
                    copy.agent.error[lang]
                  )}
                </p>
              ) : null}
            </div>
          ),
        )}
        {exhausted ? (
          <p className="text-[13.5px] text-muted">
            {copy.agent.limit[lang]} {email}
          </p>
        ) : null}
      </div>

      {/* input */}
      <form
        className="flex items-center gap-2 border-t border-line p-2.5"
        onSubmit={(e) => {
          e.preventDefault();
          if (exhausted) return;
          void send(input);
          setInput("");
        }}
      >
        <label htmlFor="agent-input" className="sr-only">
          {copy.agent.inputPlaceholder[lang]}
        </label>
        <input
          ref={inputRef}
          id="agent-input"
          value={input}
          maxLength={500}
          disabled={exhausted}
          onChange={(e) => setInput(e.target.value)}
          placeholder={copy.agent.inputPlaceholder[lang]}
          autoComplete="off"
          className="h-10 min-w-0 flex-1 rounded-full bg-transparent px-3 text-[14px] text-fg outline-none placeholder:text-dim disabled:opacity-50"
        />
        {input.length > 400 ? <span className="mono-label tabular !text-[10px]">{500 - input.length}</span> : null}
        <button
          type="submit"
          disabled={busy || exhausted || !input.trim()}
          aria-label={copy.agent.send[lang]}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-fg text-bg transition-opacity disabled:opacity-30"
        >
          <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </button>
      </form>
    </section>
  );
}

