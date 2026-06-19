// Single source of truth for "who counts as an admin". Used by the middleware
// (route gating), by the admin layout (UI affordances), and by every server
// action that mutates admin-only state (defence-in-depth — server actions are
// POST endpoints and shouldn't trust middleware alone).

import { headers } from 'next/headers'

export function isAllowedAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  const allowed = (process.env.ADMIN_ALLOWED_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  return allowed.includes(email.toLowerCase())
}

/** Throw if the current request isn't a signed-in admin. Call at the top of
 *  every server action that mutates store data. Reads the validated email
 *  from the x-admin-email header set by middleware after JWT verification. */
export function requireAdmin(): string {
  const email = headers().get('x-admin-email')
  if (!isAllowedAdmin(email)) {
    throw new Error('Unauthorized')
  }
  return email as string
}
