import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Per-IP limits for /api/chat, only when Upstash credentials exist
 * (UPSTASH_REDIS_REST_* or the KV_REST_API_* names Vercel's integration sets).
 * Without them every request is allowed.
 */
let limiters: { burst: Ratelimit; daily: Ratelimit } | null | undefined;

function get() {
  if (limiters !== undefined) return limiters;
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return (limiters = null);
  const redis = new Redis({ url, token });
  limiters = {
    burst: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(12, "10 m"), prefix: "rl:chat:burst" }),
    daily: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(60, "1 d"), prefix: "rl:chat:day" }),
  };
  return limiters;
}

export async function checkRateLimit(ip: string): Promise<{ ok: boolean; reset?: number }> {
  const l = get();
  if (!l) return { ok: true };
  try {
    const [a, b] = await Promise.all([l.burst.limit(ip), l.daily.limit(ip)]);
    if (!a.success || !b.success) return { ok: false, reset: Math.max(a.reset, b.reset) };
    return { ok: true };
  } catch {
    // Redis down: fail open rather than breaking the chat.
    return { ok: true };
  }
}
