'use client'

import { Suspense, useState, type FormEvent } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createAuthClient } from '@/lib/supabase/auth-browser'

function friendlyError(raw: string): string {
  const msg = raw.toLowerCase()
  if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
    return 'That email and password don’t match. Try again, or sign up if you don’t have an account yet.'
  }
  if (msg.includes('email not confirmed')) {
    return 'Check your inbox for the confirmation link before signing in.'
  }
  if (msg.includes('rate')) {
    return 'Too many attempts. Give it a minute.'
  }
  return raw
}

function Card() {
  const params = useSearchParams()
  const redirect = params.get('redirect') ?? '/account'
  const justSignedUp = params.get('verify') === '1'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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
    // Hard navigation so middleware sees the freshly-set auth cookies
    // (same reason as the admin login — soft router.replace races the
    // cookie flush and bounces back to login on the first try).
    window.location.assign(redirect)
  }

  return (
    <div className="mx-auto w-full max-w-[400px] px-5 py-16 md:py-24">
      <p className="label-accent text-center">Account</p>
      <h1 className="mt-2 text-center font-display text-3xl font-bold text-ink md:text-4xl">
        Sign in
      </h1>
      <p className="mt-2 text-center text-sm text-ink-soft">
        Welcome back. Sign in to see your orders.
      </p>

      {justSignedUp && (
        <div className="mt-6 rounded-lg bg-accent-soft px-3.5 py-2.5 text-[13px] text-ink ring-1 ring-inset ring-accent/20">
          We sent a confirmation link to your email. Click it, then sign in here.
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest2 text-ink-soft"
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
            className="w-full rounded-md border border-line bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/10"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest2 text-ink-soft"
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
            className="w-full rounded-md border border-line bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/10"
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
          className="mt-1 flex w-full items-center justify-center rounded-md bg-accent px-4 py-2.5 text-[13px] font-bold uppercase tracking-widest2 text-paper transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        New here?{' '}
        <Link href="/account/signup" className="font-medium text-accent hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  )
}

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={null}>
      <Card />
    </Suspense>
  )
}
