// In-memory sliding-window rate limiter. Keyed by an arbitrary string (usually
// IP + endpoint). Sufficient for a single-region Vercel deployment (each
// serverless instance keeps its own map) — good enough to blunt brute-force
// enumeration and spam signup. For truly distributed rate-limiting swap the
// backing Map for Upstash / Redis / a Supabase table.
//
// The map is process-local and doesn't persist across cold starts, which
// intentionally caps memory growth in exchange for slightly weaker guarantees
// (attacker who can spread work across instances gets more budget).

type Slot = { count: number; resetAt: number }

const buckets = new Map<string, Slot>()

/** Prune expired keys every minute. Bounded work — the map is capped by the
 *  number of unique keys we've seen in the current window. */
if (typeof (globalThis as any).__vionlabs_rl_sweep === 'undefined') {
  ;(globalThis as any).__vionlabs_rl_sweep = setInterval(() => {
    const now = Date.now()
    for (const [k, v] of buckets) {
      if (v.resetAt < now) buckets.delete(k)
    }
  }, 60_000)
  // Don't hold the process open on Node runtimes that care.
  const t = (globalThis as any).__vionlabs_rl_sweep
  if (t && typeof t.unref === 'function') t.unref()
}

export type RateLimitResult = {
  ok: boolean
  /** Remaining attempts in the current window. */
  remaining: number
  /** Milliseconds until the window resets. */
  retryAfterMs: number
}

/** Check + increment. `key` should uniquely identify the caller + endpoint
 *  (e.g. `applyCode:1.2.3.4`). `limit` = max attempts per `windowMs`. */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now()
  const slot = buckets.get(key)
  if (!slot || slot.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1, retryAfterMs: windowMs }
  }
  slot.count += 1
  const remaining = Math.max(0, limit - slot.count)
  const retryAfterMs = slot.resetAt - now
  return { ok: slot.count <= limit, remaining, retryAfterMs }
}

/** Derive a stable per-request key from the caller's IP address. Uses the
 *  standard Vercel / proxy header chain; falls back to a coarse bucket when
 *  no IP is available (best-effort — a missing IP is better than crashing). */
export function requestKey(headers: Headers, endpoint: string): string {
  const forwarded = headers.get('x-forwarded-for') || ''
  const ip = forwarded.split(',')[0].trim() || headers.get('x-real-ip') || 'unknown'
  return `${endpoint}:${ip}`
}
