'use client'

import { Suspense, useState, type FormEvent } from 'react'
import { useSearchParams } from 'next/navigation'
import { createAuthClient } from '@/lib/supabase/auth-browser'
import { site } from '@/lib/site'

function friendlyError(raw: string): string {
  const msg = raw.toLowerCase()
  if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
    return 'That email and password don’t match. Try again.'
  }
  if (msg.includes('email not confirmed')) {
    return 'This account hasn’t been confirmed yet. Check your inbox or ask an admin to confirm it.'
  }
  if (msg.includes('rate')) {
    return 'Too many attempts. Wait a minute and try again.'
  }
  return raw
}

function LoginCard() {
  const params = useSearchParams()
  const denied = params.get('denied') === '1'
  const oauthFailed = params.get('error') === 'oauth_failed'
  const redirect = params.get('redirect') ?? '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const supabase = createAuthClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(friendlyError(error.message))
      setBusy(false)
      return
    }
    // Hard navigation so middleware sees the freshly-set auth cookies on the
    // very next request — soft router.replace races against cookie flush and
    // bounces back to login the first time.
    window.location.assign(redirect)
  }

  return (
    <div className="w-full max-w-[400px]">
      {/* Brand mark */}
      <div className="mb-7 text-center">
        <div className="inline-flex items-center gap-2 font-display text-[20px] tracking-[0.32em] text-ink">
          {site.brand}
        </div>
        <p className="mt-1 text-[12px] uppercase tracking-[0.18em] text-ink-soft">
          Back-office
        </p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-line/80 bg-white p-8 shadow-[0_1px_2px_rgba(15,15,15,0.04),0_12px_40px_-12px_rgba(15,15,15,0.12)]">
        <h1 className="font-display text-[22px] leading-tight text-ink">Sign in</h1>
        <p className="mt-1.5 text-[13px] text-ink-soft">
          Authorized {site.brand.toLowerCase()} staff only.
        </p>

        {/* Banner: denied (signed in but not allow-listed) */}
        {denied && (
          <div className="mt-5 rounded-lg bg-rose-50 px-3.5 py-2.5 text-[13px] text-rose-700 ring-1 ring-inset ring-rose-200">
            That account isn’t allowed in the admin. Ask an admin to add you to the
            allow-list, then sign in again.
          </div>
        )}

        {/* Banner: OAuth callback failed */}
        {oauthFailed && (
          <div className="mt-5 rounded-lg bg-amber-50 px-3.5 py-2.5 text-[13px] text-amber-800 ring-1 ring-inset ring-amber-200">
            Single sign-on didn’t complete. Try again with email and password below.
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-ink-soft"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
              placeholder="you@vionlabs.co"
              className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/50 transition-colors focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/10"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-ink-soft"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink transition-colors focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/10"
            />
          </div>

          {error && (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-[12.5px] text-rose-700 ring-1 ring-inset ring-rose-100">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || !email || !password}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-[13.5px] font-medium text-paper transition-colors hover:bg-clay disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
              <>
                <svg
                  className="h-3.5 w-3.5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    opacity="0.25"
                  />
                  <path
                    d="M12 2a10 10 0 0 1 10 10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-[12px] text-ink-soft">
        Trouble signing in? Contact your admin.
      </p>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#f7f5ef] via-[#f6f4ee] to-[#efece4] p-6">
      <Suspense fallback={null}>
        <LoginCard />
      </Suspense>
    </div>
  )
}
