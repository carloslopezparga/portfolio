import Image from "next/image";

/**
 * An organisation's logo on a tinted tile in its brand colour; the monogram
 * stands in until the logo file exists in public/logos.
 */
export function LogoMark({ src, monogram, size = 44, className }: { src: string | null; monogram: string; size?: number; className?: string }) {
  return (
    <span className={`logo-mark grid shrink-0 place-items-center overflow-hidden ${className ?? ""}`} style={{ width: size, height: size, borderRadius: size * 0.28 }} aria-hidden>
      {src ? (
        <Image src={src} alt="" width={Math.round(size * 0.68)} height={Math.round(size * 0.68)} unoptimized={src.endsWith(".svg")} className="object-contain" />
      ) : (
        <span className="font-semibold tracking-[-0.02em] text-[var(--d)]" style={{ fontSize: Math.max(10, size * (monogram.length > 3 ? 0.24 : monogram.length > 2 ? 0.28 : 0.34)) }}>
          {monogram}
        </span>
      )}
    </span>
  );
}
