/** Submissions faster than this after the form rendered are almost certainly bots. */
export const MIN_FILL_TIME_MS = 3000;

export function isHoneypotFilled(value: string | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

/**
 * True if the form came back implausibly fast. A missing or malformed
 * timestamp is not treated as spam, so the form still works if a proxy strips it.
 */
export function isTooFast(startedAt: string | undefined, now: number, minMs = MIN_FILL_TIME_MS): boolean {
  const started = Number(startedAt);
  if (!startedAt || !Number.isFinite(started)) return false;
  return now - started < minMs;
}

export interface RateLimiter {
  /** Records an attempt and returns false if the key is over its limit. */
  take: (key: string, now: number) => boolean;
}

/**
 * Sliding-window limit per key (the visitor's IP). Kept in memory, so on
 * serverless hosts each instance counts separately; swap in a shared store
 * (Upstash, Redis, a database) if the site gets real abuse.
 */
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }): RateLimiter {
  const hits = new Map<string, number[]>();
  return {
    take(key, now) {
      const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return false;
      }
      recent.push(now);
      hits.set(key, recent);
      if (hits.size > 5000) {
        for (const [k, times] of hits) {
          if (times.every((time) => now - time >= windowMs)) hits.delete(k);
        }
      }
      return true;
    },
  };
}
