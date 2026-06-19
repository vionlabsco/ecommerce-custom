// OAuth callback: Supabase redirects here with ?code=... after Google sign-in.
// We exchange the code for a session (which sets cookies) and bounce the user
// to either the original /admin path they tried to visit or /admin by default.
//
// SECURITY: `redirect` is a query param controlled by whoever crafts the URL.
// We MUST validate it stays within our own site, otherwise an attacker can
// phish admins with /admin/auth/callback?code=...&redirect=https://evil.com.

import { NextResponse } from 'next/server'
import { createAuthClient } from '@/lib/supabase/auth-server'

function safeRedirect(raw: string | null): string {
  if (!raw) return '/admin'
  // Reject anything that doesn't start with a single `/`, or starts with `//`
  // (protocol-relative), or contains a scheme. Restrict to the admin subtree.
  if (
    !raw.startsWith('/') ||
    raw.startsWith('//') ||
    raw.includes('\\') ||
    !raw.startsWith('/admin')
  ) {
    return '/admin'
  }
  return raw
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = safeRedirect(searchParams.get('redirect'))

  if (code) {
    const supabase = createAuthClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${redirect}`)
    }
  }

  return NextResponse.redirect(`${origin}/admin/login?error=oauth_failed`)
}
