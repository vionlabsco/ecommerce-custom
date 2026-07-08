// Guard against open-redirect abuse from a `?redirect=...` search param.
//
// Any post-login redirect target that comes from the URL bar must:
//   - Start with a "/" (a same-origin path).
//   - NOT start with "//" or contain "\" (both are common ways to sneak an
//     off-site URL past a naive check — browsers treat "//evil.com" as
//     protocol-relative).
//   - Start with the caller-specified prefix (e.g. "/admin" for the admin
//     login, "/account" for the customer login) — so an admin sign-in can't
//     be used to bounce the browser into the customer surface, and neither
//     can be used to bounce off-site.
//
// Returns `fallback` on any failure. Use this everywhere a search-param URL
// is fed into `window.location.assign` or a server-side redirect.

export function safeRedirect(
  raw: string | null | undefined,
  mustStartWith: string,
  fallback: string,
): string {
  if (!raw) return fallback
  const s = String(raw)
  if (
    !s.startsWith('/') ||
    s.startsWith('//') ||
    s.includes('\\') ||
    !s.startsWith(mustStartWith)
  ) {
    return fallback
  }
  return s
}
