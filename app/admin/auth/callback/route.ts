// OAuth callback: Supabase redirects here with ?code=... after Google sign-in.
// We exchange the code for a session (which sets cookies) and bounce the user
// to either the original /admin path they tried to visit or /admin by default.

import { NextResponse } from 'next/server'
import { createAuthClient } from '@/lib/supabase/auth-server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect') ?? '/admin'

  if (code) {
    const supabase = createAuthClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${redirect}`)
    }
  }

  return NextResponse.redirect(`${origin}/admin/login?error=oauth_failed`)
}
