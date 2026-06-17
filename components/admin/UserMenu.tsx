export function UserMenu({ email }: { email: string }) {
  const initial = (email[0] ?? '?').toUpperCase()
  return (
    <form action="/admin/auth/signout" method="post" className="flex items-center gap-2.5">
      <span className="hidden text-[13px] text-gray-600 md:inline">{email}</span>
      <button
        type="button"
        className="hidden h-7 w-7 items-center justify-center rounded-full bg-emerald-700 text-[12px] font-semibold text-white md:inline-flex"
        aria-hidden
        tabIndex={-1}
      >
        {initial}
      </button>
      <button
        type="submit"
        className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-[12.5px] font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
      >
        Sign out
      </button>
    </form>
  )
}
