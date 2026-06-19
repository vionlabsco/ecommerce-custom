'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createAuthClient } from '@/lib/supabase/auth-browser'

function friendlyError(raw: string): string {
  const msg = raw.toLowerCase()
  if (msg.includes('already registered') || msg.includes('user already exists')) {
    return 'That email already has an account. Try signing in instead.'
  }
  if (msg.includes('password')) {
    return 'Password is too short. Use at least 8 characters.'
  }
  return raw
}

export default function CustomerSignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setBusy(true)
    setError(null)
    const supabase = createAuthClient()
    const { error: signupError, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          typeof window !== 'undefined'
            ? `${window.location.origin}/account/auth/callback?redirect=/account`
            : undefined,
      },
    })
    if (signupError) {
      setError(friendlyError(signupError.message))
      setBusy(false)
      return
    }
    // If Supabase auto-confirms (email confirmation OFF), there's already a
    // session. Take them straight to /account. Otherwise prompt to check email.
    if (data.session) {
      window.location.assign('/account')
    } else {
      router.push('/account/login?verify=1')
    }
  }

  return (
    <div className="mx-auto w-full max-w-[400px] px-5 py-16 md:py-24">
      <p className="label-accent text-center">Account</p>
      <h1 className="mt-2 text-center font-display text-3xl font-bold text-ink md:text-4xl">
        Create your account
      </h1>
      <p className="mt-2 text-center text-sm text-ink-soft">
        Track your orders, save addresses, and check out faster next time.
      </p>

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
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-md border border-line bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/10"
          />
          <p className="mt-1.5 text-[11.5px] text-ink-mute">At least 8 characters.</p>
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
          {busy ? 'Creating…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Already have an account?{' '}
        <Link href="/account/login" className="font-medium text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
