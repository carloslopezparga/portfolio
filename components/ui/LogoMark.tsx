import Image from "next/image";
import type { Brand } from "@/content/types";
import { logoSrc } from "@/lib/assets";

/**
 * An organisation's logo on a rounded tile with a hairline border. Logos with
 * their own background fill the tile; the rest sit on white. Without a file
 * in public/logos, the monogram stands in, in the brand colour. The files
 * are tiny (1-2 kB each once resized), so they load with the page instead
 * of lazily: a lazy one in a section the browser was still skipping
 * (content-visibility) only started loading once you were already looking
 * at its empty white tile.
 */
export function LogoMark({ brand, size = 44, className }: { brand: Brand; size?: number; className?: string }) {
  const src = logoSrc(brand.logo);
  const fill = src && brand.tile === "fill";
  // a logo on white keeps a margin inside its tile, unless its file already has one
  const share = brand.bleed ? 1 : 0.74;
  const inner = Math.round(size * share);
  // The size can be overridden from CSS with --logo (the timeline uses smaller tiles on phones).
  const box = `var(--logo, ${size}px)`;
  return (
    <span className={`logo-mark grid shrink-0 place-items-center overflow-hidden ${className ?? ""}`} style={{ width: box, height: box, borderRadius: `calc(${box} * 0.26)` }} aria-hidden>
      {src ? (
        fill ? (
          <Image src={src} alt="" width={size} height={size} sizes={`${size * 2}px`} loading="eager" fetchPriority="low" className="size-full object-cover" />
        ) : (
          <Image src={src} alt="" width={inner} height={inner} sizes={`${inner * 2}px`} loading="eager" fetchPriority="low" className="object-contain" style={{ width: `calc(${box} * ${share})`, height: "auto" }} />
        )
      ) : (
        <span className="font-semibold tracking-[-0.02em] text-[var(--brand-l,var(--d))]" style={{ fontSize: `max(10px, calc(${box} * ${brand.monogram.length > 3 ? 0.24 : brand.monogram.length > 2 ? 0.28 : 0.34}))` }}>
          {brand.monogram}
        </span>
      )}
    </span>
  );
}
