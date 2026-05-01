/**
 * In-memory rate limiter (per IP).
 * Limits are intentionally high for local benchmark use (50+ prompts per run).
 * For multi-instance production, swap the store for Redis.
 */

const store = new Map(); // { `${ip}:${key}` -> { count, resetAt } }

/**
 * Check if an IP has exceeded its rate limit.
 * @param {Request} request - Next.js request object
 * @param {Object} options
 * @param {number} options.limit     - max requests per window (default 500)
 * @param {number} options.windowMs  - window size in ms (default 600_000 = 10 min)
 * @param {string} options.key       - optional namespace key (default "default")
 * @returns {{ allowed: boolean, remaining: number, resetAt: number }}
 */
export function rateLimit(
  request,
  { limit = 500, windowMs = 600_000, key = "default" } = {},
) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const storeKey = `${ip}:${key}`;
  const now = Date.now();
  const entry = store.get(storeKey);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    store.set(storeKey, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Build a 429 Too Many Requests response with Retry-After header.
 */
export function tooManyRequests(resetAt) {
  const retryAfterSecs = Math.ceil((resetAt - Date.now()) / 1000);
  return new Response(
    JSON.stringify({
      error: `Rate limit exceeded. Try again in ${retryAfterSecs}s.`,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfterSecs),
        "X-RateLimit-Reset": String(resetAt),
      },
    },
  );
}
