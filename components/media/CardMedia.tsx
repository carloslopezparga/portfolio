import type { Locale, MediaSection } from "@/content/types";
import { mediaLabels } from "@/lib/copy";
import { mediaFor } from "@/lib/media";
import { MediaStrip } from "./MediaStrip";

/** The media strip of a card, from public/media/<section>/<folder>/ — nothing when the folder is empty. */
export async function CardMedia({ section, folder, lang, alt, className }: { section: MediaSection; folder: string; lang: Locale; alt: string; className?: string }) {
  const items = await mediaFor(section, folder, lang);
  if (!items.length) return null;
  return <MediaStrip items={items} alt={alt} labels={mediaLabels(lang)} className={className} />;
}
