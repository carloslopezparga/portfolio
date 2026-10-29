/**
 * NEXT_PUBLIC_CALCOM_LINK accepts "carlos/15min" or a full URL
 * ("https://cal.com/carlos/15min", or a self-hosted / EU origin).
 * Missing or unparsable → booking is hidden everywhere.
 */
export function parseCalLink(raw = process.env.NEXT_PUBLIC_CALCOM_LINK): { link: string; origin?: string } | null {
  const v = raw?.trim();
  if (!v) return null;
  if (!/^https?:\/\//.test(v)) return { link: v.replace(/^\/+|\/+$/g, "") };
  try {
    const u = new URL(v);
    const link = u.pathname.replace(/^\/+|\/+$/g, "");
    if (!link) return null;
    return u.hostname === "cal.com" ? { link } : { link, origin: u.origin };
  } catch {
    return null;
  }
}

export const bookingEnabled = () => parseCalLink() !== null;
