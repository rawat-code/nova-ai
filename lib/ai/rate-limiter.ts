import { getServerEnv } from "@/lib/env";

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// In-memory fallback cache for development or when Upstash is not configured
const inMemoryCache = new Map<string, { count: number; expiresAt: number }>();

/**
 * Rate Limiter for AI endpoints.
 * Uses Upstash REST API if configured, otherwise falls back to in-memory sliding window.
 */
export async function checkRateLimit(
  identifier: string,
  limit = 20,
  windowSeconds = 60
): Promise<RateLimitResult> {
  let env;
  try {
    env = getServerEnv();
  } catch {
    env = undefined;
  }

  const redisUrl = env?.UPSTASH_REDIS_REST_URL;
  const redisToken = env?.UPSTASH_REDIS_REST_TOKEN;

  // Use Upstash Redis REST if configured
  if (redisUrl && redisToken && !redisUrl.includes("your-database-id")) {
    try {
      const key = `ratelimit:tutor:${identifier}`;
      const url = `${redisUrl}/pipeline`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${redisToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", key],
          ["TTL", key],
        ]),
      });

      if (response.ok) {
        const results = await response.json();
        const currentCount = Number(results[0]?.result || 1);
        let ttl = Number(results[1]?.result || -1);

        if (ttl === -1) {
          // Key exists without expiry; set expiry
          await fetch(`${redisUrl}/expire/${key}/${windowSeconds}`, {
            headers: { Authorization: `Bearer ${redisToken}` },
          });
          ttl = windowSeconds;
        }

        const remaining = Math.max(0, limit - currentCount);
        const reset = Date.now() + (ttl > 0 ? ttl * 1000 : windowSeconds * 1000);

        return {
          success: currentCount <= limit,
          limit,
          remaining,
          reset,
        };
      }
    } catch (err) {
      console.warn("[RateLimiter] Upstash Redis request failed, falling back to memory:", err);
    }
  }

  // In-memory fallback
  const now = Date.now();
  const key = `mem:${identifier}`;
  const entry = inMemoryCache.get(key);

  if (!entry || entry.expiresAt < now) {
    inMemoryCache.set(key, { count: 1, expiresAt: now + windowSeconds * 1000 });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: now + windowSeconds * 1000,
    };
  }

  entry.count++;
  const remaining = Math.max(0, limit - entry.count);
  const success = entry.count <= limit;

  return {
    success,
    limit,
    remaining,
    reset: entry.expiresAt,
  };
}
