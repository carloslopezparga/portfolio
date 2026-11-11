/**
 * NEXT_PUBLIC_BOOKING_URL: the public page of a Google Calendar appointment
 * schedule (any https URL works). Every «Book 15 min» opens it in a new tab.
 * Missing or not https → booking is hidden everywhere (Contact, ⌘K and the
 * agent's open_booking).
 */
export function bookingUrl(raw = process.env.NEXT_PUBLIC_BOOKING_URL): string | null {
  const v = raw?.trim();
  if (!v) return null;
  try {
    const u = new URL(v);
    return u.protocol === "https:" ? u.href : null;
  } catch {
    return null;
  }
}

export const bookingEnabled = () => bookingUrl() !== null;
