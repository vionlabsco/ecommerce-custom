// Customer auth callback — Supabase redirects here after signup confirmation
// (or after social login if we add it later). Mirrors the admin callback but
// lands the user on /account instead of /admin.

import { NextResponse } from 'next/server'
import { createAuthClient } from '@/lib/supabase/auth-server'

function safeRedirect(raw: string | null): string {
  if (!raw) return '/account'
  if (
    !raw.startsWith('/') ||
    raw.startsWith('//') ||
    raw.includes('\\') ||
    !raw.startsWith('/account')
  ) {
    return '/account'
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

  return NextResponse.redirect(`${origin}/account/login?error=auth_failed`)
}
