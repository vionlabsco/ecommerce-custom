export function UserMenu({ email }: { email: string }) {
  return (
    <form action="/admin/auth/signout" method="post" className="flex items-center gap-3">
      <span className="text-[12px] text-ink-soft">{email}</span>
      <button
        type="submit"
        className="rounded-md border border-line px-2.5 py-1 text-[12px] text-ink-soft transition-colors hover:border-ink hover:text-ink"
      >
        Sign out
      </button>
    </form>
  )
}
