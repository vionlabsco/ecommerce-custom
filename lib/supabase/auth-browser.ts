// Browser-side Supabase client for the admin login page. Uses the publishable
// (anon) key, which is safe to ship to the browser.

import { createBrowserClient } from '@supabase/ssr'

export function createAuthClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
