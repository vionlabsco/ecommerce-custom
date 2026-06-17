// Cookie-based Supabase auth client for server components, server actions, and
// route handlers. Uses the publishable (anon) key — RLS still applies, and the
// user's identity is taken from the session cookie set during sign-in.
//
// This is NOT the same as `./client.ts` (which uses the service-role key for
// server-side data work and bypasses RLS).

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createAuthClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // setAll from a server component is a no-op — middleware refreshes the session.
          }
        },
      },
    },
  )
}
