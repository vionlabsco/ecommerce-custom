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
    setDone(true)
  }

  if (done) {
    return (
      <p className="text-[12px] font-medium uppercase tracking-widest2 text-lime">
        ● You&apos;re on the list. Look out for a note soon.
      </p>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-2 sm:flex-row sm:items-center"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@vionlabs.co"
        className="min-w-0 flex-1 rounded-md border border-line bg-paper px-4 py-3 text-[14px] text-ink placeholder:text-ink-mute focus:border-accent focus:outline-none"
      />
      <button
        type="submit"
        className="shrink-0 rounded-md bg-accent px-5 py-3 text-[12px] font-bold uppercase tracking-widest2 text-paper transition-colors hover:bg-accent-hover"
      >
        Subscribe
      </button>
    </form>
  )
}
