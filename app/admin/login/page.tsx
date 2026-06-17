'use client'

import { Suspense, useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createAuthClient } from '@/lib/supabase/auth-browser'

function LoginCard() {
  const router = useRouter()
  const params = useSearchParams()
  const denied = params.get('denied') === '1'
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
      setError(error.message)
      setBusy(false)
      return
    }
    router.replace(redirect)
    router.refresh()
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

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-[12px] uppercase tracking-[0.1em] text-ink-soft"
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
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm focus:border-ink focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-[12px] uppercase tracking-[0.1em] text-ink-soft"
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
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm focus:border-ink focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="mt-2 flex w-full items-center justify-center rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-clay disabled:opacity-60"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

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
