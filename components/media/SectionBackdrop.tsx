import type { MediaSection } from "@/content/types";
import { backdropFor } from "@/lib/media";
import { BackdropMedia } from "./BackdropMedia";

/**
 * A section's backdrop: the video (or, with no video, the photos, one after
 * another) found directly in public/media/<section>/, behind everything, very
 * faint and with no colour. Nothing there: no backdrop.
 */
export async function SectionBackdrop({ section }: { section: MediaSection }) {
  const { videos, images } = await backdropFor(section);
  if (!videos.length && !images.length) return null;
  return <BackdropMedia videos={videos} images={images} />;
}
