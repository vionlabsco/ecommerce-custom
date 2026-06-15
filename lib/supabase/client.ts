// ──────────────────────────────────────────────────────────────────────────
// Supabase client (server-side only).
//
// This module is imported only from server components and server actions, so
// it uses the SERVICE ROLE key (full access, never shipped to the browser).
//
// If the env vars are absent the client is null and `isSupabaseConfigured` is
// false — the data layer then falls back to its in-memory demo data, so the app
// runs with zero setup. Add the env vars (+ run supabase/schema.sql) to go live.
// ──────────────────────────────────────────────────────────────────────────

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

export const isSupabaseConfigured = Boolean(url && key)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, key as string, { auth: { persistSession: false } })
  : null
