// Single source of truth for "who counts as an admin". Used by the middleware
// (route gating) and by the admin layout (UI affordances).

export function isAllowedAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  const allowed = (process.env.ADMIN_ALLOWED_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  return allowed.includes(email.toLowerCase())
}
