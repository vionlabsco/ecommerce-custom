'use client'

import { useState, type FormEvent } from 'react'

/**
 * Newsletter capture. Front-end only for now — on submit it shows a confirmation.
 * Wire the `onSubmit` body to your ESP (Klaviyo, Mailchimp, etc.) later.
 */
export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email) return
    // TODO: POST to your email provider here.
    setDone(true)
  }

  if (done) {
    return (
      <p className="text-sm text-paper/80">
        ✦ You&apos;re on the list. Look out for a note soon.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm items-center gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        className="min-w-0 flex-1 border-b border-paper/30 bg-transparent py-2 text-sm text-paper placeholder:text-paper/40 focus:border-paper focus:outline-none"
      />
      <button
        type="submit"
        className="shrink-0 text-[12px] uppercase tracking-[0.18em] text-paper/80 transition-colors hover:text-paper"
      >
        Subscribe
      </button>
    </form>
  )
}
