import Image from "next/image";
import { Tone } from "./Tone";

/**
 * Company / school mark. `src` comes from lib/assets (null when the file is
 * missing) and falls back to a mono monogram in the same frame.
 */
export function Logo({ src, name, monogram, size = 48, className }: { src: string | null; name: string; monogram: string; size?: number; className?: string }) {
  return (
    <Tone
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-surface-2 shadow-[inset_0_0_0_1px_var(--line-strong)] ${className ?? ""}`}
    >
      <span className="sr-only">{name}</span>
      <span style={{ width: size, height: size }} className="grid place-items-center" aria-hidden>
        {src ? (
          <Image src={src} alt="" width={size} height={size} unoptimized={src.endsWith(".svg")} className="size-[70%] object-contain" />
        ) : (
          <span className="img-tone-target font-mono text-[11px] font-medium tracking-[0.06em] text-muted">{monogram}</span>
        )}
      </span>
    </Tone>
  );
}
