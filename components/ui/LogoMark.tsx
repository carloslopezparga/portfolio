import Image from "next/image";
import type { Brand } from "@/content/types";
import { logoSrc } from "@/lib/assets";

/**
 * An organisation's logo on a rounded tile with a hairline border. Logos with
 * their own background fill the tile; the rest sit on white. Without a file
 * in public/logos, the monogram stands in, in the brand colour.
 */
export function LogoMark({ brand, size = 44, className }: { brand: Brand; size?: number; className?: string }) {
  const src = logoSrc(brand.logo);
  const fill = src && brand.tile === "fill";
  const inner = Math.round(size * 0.74);
  // The size can be overridden from CSS with --logo (the timeline uses smaller tiles on phones).
  const box = `var(--logo, ${size}px)`;
  return (
    <span className={`logo-mark grid shrink-0 place-items-center overflow-hidden ${className ?? ""}`} style={{ width: box, height: box, borderRadius: `calc(${box} * 0.26)` }} aria-hidden>
      {src ? (
        fill ? (
          <Image src={src} alt="" width={size} height={size} sizes={`${size * 2}px`} className="size-full object-cover" />
        ) : (
          <Image src={src} alt="" width={inner} height={inner} sizes={`${inner * 2}px`} className="object-contain" style={{ width: `calc(${box} * 0.74)`, height: "auto" }} />
        )
      ) : (
        <span className="font-semibold tracking-[-0.02em] text-[var(--brand-l,var(--d))]" style={{ fontSize: `max(10px, calc(${box} * ${brand.monogram.length > 3 ? 0.24 : brand.monogram.length > 2 ? 0.28 : 0.34}))` }}>
          {brand.monogram}
        </span>
      )}
    </span>
  );
}
