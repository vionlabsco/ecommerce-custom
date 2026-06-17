'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createAuthClient } from '@/lib/supabase/auth-browser'

function LoginCard() {
  const params = useSearchParams()
  const denied = params.get('denied') === '1'
  const oauthError = params.get('error')
  const redirect = params.get('redirect') ?? '/admin'
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async () => {
    setBusy(true)
    setError(null)
    const supabase = createAuthClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/admin/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    })
    if (error) {
      setError(error.message)
      setBusy(false)
    }
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-8 shadow-sm">
      <h1 className="font-display text-2xl">Admin sign-in</h1>
      <p className="mt-1.5 text-sm text-ink-soft">Authorized users only.</p>

      {denied && (
        <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-[13px] text-rose-700 ring-1 ring-inset ring-rose-200">
          That account isn’t allowed to access the admin.
        </p>
      )}
      {oauthError && (
        <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-[13px] text-rose-700 ring-1 ring-inset ring-rose-200">
          Sign-in failed. Try again.
        </p>
      )}

      <button
        onClick={handleSignIn}
        disabled={busy}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-clay disabled:opacity-60"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#fff"
            d="M21.35 11.1H12v2.96h5.36c-.24 1.5-1.74 4.4-5.36 4.4-3.22 0-5.85-2.67-5.85-5.96S8.78 6.54 12 6.54c1.83 0 3.06.78 3.77 1.45l2.56-2.47C16.74 4.04 14.6 3.1 12 3.1 6.96 3.1 2.86 7.2 2.86 12.5S6.96 21.9 12 21.9c6.91 0 9.5-4.85 9.5-9.32 0-.63-.05-1.1-.15-1.48Z"
          />
        </svg>
        {busy ? 'Redirecting…' : 'Sign in with Google'}
      </button>

      {error && <p className="mt-3 text-[12px] text-rose-600">{error}</p>}
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f4ee] p-6">
      <Suspense fallback={null}>
        <LoginCard />
      </Suspense>
    </div>
  )
}
