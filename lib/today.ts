import { cacheLife } from "next/cache";

/** Cached for a day, so dates and "current / upcoming" states stay right without a rebuild. */
export async function today() {
  "use cache";
  cacheLife("days");
  return new Date().toISOString();
}
