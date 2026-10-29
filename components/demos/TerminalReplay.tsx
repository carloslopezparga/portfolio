"use client";

import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getPrefs } from "@/lib/prefs";

/**
 * Replays a recorded CLI session.
 * Script format (plain text):
 *   $ command            → typed character by character
 *   any other line       → printed as output (ANSI colours supported)
 *   # @pause 1.5         → waits 1.5 s, never shown
 */
type Line = { kind: "cmd" | "out"; text: string } | { kind: "pause"; ms: number };

function parse(script: string): Line[] {
  return script
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((raw): Line => {
      const pause = raw.match(/^#\s*@pause\s+([\d.]+)/);
      if (pause) return { kind: "pause", ms: parseFloat(pause[1]) * 1000 };
      if (raw.startsWith("$ ")) return { kind: "cmd", text: raw.slice(2) };
      return { kind: "out", text: raw };
    });
}

const ANSI_FG: Record<number, string> = {
  30: "text-dim",
  31: "text-[#ff6b6b]",
  32: "text-[#3ddc97]",
  33: "text-[#ffd166]",
  34: "text-accent",
  35: "text-[#c792ea]",
  36: "text-ice",
  37: "text-fg",
  90: "text-dim",
  91: "text-[#ff8787]",
  92: "text-[#69f0ae]",
  93: "text-[#ffe08a]",
  94: "text-ice",
  95: "text-[#d7a6ff]",
  96: "text-ice",
  97: "text-fg",
};

function ansi(text: string): ReactNode {
  const re = /\u001b\[([\d;]*)m/g;
  const out: ReactNode[] = [];
  let state = { fg: "", bold: false, dim: false };
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  const push = (s: string) => {
    if (!s) return;
    const cls = [state.fg, state.bold ? "font-semibold" : "", state.dim ? "opacity-60" : ""].join(" ").trim();
    out.push(cls ? <span key={k++} className={cls}>{s}</span> : <Fragment key={k++}>{s}</Fragment>);
  };
  while ((m = re.exec(text))) {
    push(text.slice(last, m.index));
    last = re.lastIndex;
    for (const code of (m[1] || "0").split(";").map(Number)) {
      if (code === 0) state = { fg: "", bold: false, dim: false };
      else if (code === 1) state = { ...state, bold: true };
      else if (code === 2) state = { ...state, dim: true };
      else if (ANSI_FG[code]) state = { ...state, fg: ANSI_FG[code] };
    }
  }
  push(text.slice(last));
  return out;
}

const sleep = (ms: number, signal: { cancelled: boolean }) =>
  new Promise<void>((res, rej) => setTimeout(() => (signal.cancelled ? rej(new Error("cancelled")) : res()), ms));

export function TerminalReplay({ script, title, badge }: { script: string; title: string; badge?: string }) {
  const lines = useMemo(() => parse(script), [script]);
  const printable = useMemo(() => lines.filter((l): l is Extract<Line, { kind: "cmd" | "out" }> => l.kind !== "pause"), [lines]);
  const [history, setHistory] = useState<Extract<Line, { kind: "cmd" | "out" }>[]>([]);
  const [typing, setTyping] = useState<string | null>(null);
  const [run, setRun] = useState(0);
  const [done, setDone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  // Start once the terminal enters the viewport.
  useEffect(() => {
    const el = rootRef.current!;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          setRun(1);
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!run) return;
    const signal = { cancelled: false };
    const play = async () => {
      setHistory([]);
      setTyping(null);
      setDone(false);
      if (getPrefs().reduced) {
        setHistory(printable);
        setDone(true);
        return;
      }
      await sleep(350, signal);
      for (const line of lines) {
        if (line.kind === "pause") {
          await sleep(line.ms, signal);
        } else if (line.kind === "cmd") {
          for (let i = 1; i <= line.text.length; i++) {
            setTyping(line.text.slice(0, i));
            await sleep(26 + Math.random() * 40, signal);
          }
          await sleep(260, signal);
          setTyping(null);
          setHistory((h) => [...h, line]);
          await sleep(120, signal);
        } else {
          setHistory((h) => [...h, line]);
          await sleep(line.text.trim() ? 28 + Math.random() * 30 : 60, signal);
        }
      }
      setDone(true);
    };
    play().catch(() => {});
    return () => {
      signal.cancelled = true;
    };
  }, [run, lines, printable]);

  useEffect(() => {
    const b = bodyRef.current;
    if (b) b.scrollTop = b.scrollHeight;
  }, [history, typing]);

  return (
    <div ref={rootRef} className="overflow-hidden rounded-[16px] bg-[#07090e] shadow-[0_0_0_1px_var(--line-strong),0_30px_80px_-30px_rgb(0_0_0/0.9)] [color-scheme:dark]">
      <div className="flex h-10 items-center gap-2 border-b border-white/[0.06] px-4">
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="mono-label mx-auto min-w-0 truncate !text-[10.5px] !text-[#8b93a3]">{title}</span>
        {badge ? (
          <span className="mono-label flex shrink-0 items-center gap-1.5 whitespace-nowrap !text-[10px] !text-[#9cc3ff]">
            <span className="size-1.5 animate-pulse rounded-full bg-[#4c8dff]" />
            {badge}
          </span>
        ) : null}
      </div>
      <div
        ref={bodyRef}
        data-lenis-prevent
        className="h-[340px] overflow-y-auto px-4 py-3 font-mono text-[12.5px] leading-[1.65] text-[#c9d1de] md:h-[380px]"
        aria-live="off"
      >
        {history.map((l, i) =>
          l.kind === "cmd" ? (
            <div key={i} className="whitespace-pre-wrap break-words">
              <span className="text-[#4c8dff]">$ </span>
              <span className="text-[#f5f7fa]">{l.text}</span>
            </div>
          ) : (
            <div key={i} className="min-h-[1.65em] whitespace-pre-wrap break-words">
              {ansi(l.text)}
            </div>
          ),
        )}
        <div className="whitespace-pre-wrap">
          <span className="text-[#4c8dff]">$ </span>
          <span className="text-[#f5f7fa]">{typing ?? ""}</span>
          <span className="ml-px inline-block h-[1.1em] w-[0.55em] translate-y-[0.2em] animate-pulse bg-[#9cc3ff]" />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-2.5">
        <span className="mono-label !text-[10px] !text-[#8b93a3]">
          {history.length} / {printable.length}
        </span>
        <div className="flex gap-4">
          {!done ? (
            <button
              type="button"
              className="mono-label !text-[10px] !text-[#c9d1de] transition-hover hover:!text-[#9cc3ff]"
              onClick={() => {
                started.current = true;
                setRun(0);
                setTyping(null);
                setHistory(printable);
                setDone(true);
              }}
            >
              Skip
            </button>
          ) : null}
          <button
            type="button"
            className="mono-label !text-[10px] !text-[#c9d1de] transition-hover hover:!text-[#9cc3ff]"
            onClick={() => {
              started.current = true;
              setRun((r) => r + 1);
            }}
          >
            Replay
          </button>
        </div>
      </div>
    </div>
  );
}
