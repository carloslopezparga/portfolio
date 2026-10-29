import type { CSSProperties } from "react";

/**
 * Server-split characters animated by pure CSS (.split-char): the reveal starts
 * on first paint without waiting for JavaScript, so it never delays LCP.
 */
export function SplitChars({ lines, delay = 0 }: { lines: string[]; delay?: number }) {
  let i = 0;
  return (
    <span aria-hidden className="block">
      {lines.map((line, li) => (
        <span key={li} className="block whitespace-nowrap">
          {line.split(" ").map((word, wi, words) => (
            <span key={wi} className="split-mask">
              {Array.from(word).map((ch, ci) => (
                <span key={ci} className="split-char" style={{ "--i": i++, "--d": `${delay}ms` } as CSSProperties}>
                  {ch}
                </span>
              ))}
              {wi < words.length - 1 ? " " : null}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}
