// Renders CHANGELOG.md from the repo root, in the admin chrome. Engineers
// update the markdown file via PR; this page picks it up on the next deploy.
// Used by support + the team for bug reports ("we're on v2026-06-19").

import type { Metadata } from 'next'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { PageHeader } from '@/components/admin/PageHeader'

export const metadata: Metadata = { title: 'Changelog' }
// Read fresh from disk on every navigation; the file is tiny.
export const dynamic = 'force-dynamic'

type Entry = { date: string; body: string }

function parseChangelog(md: string): { intro: string; entries: Entry[] } {
  // Body starts after the first `---` divider; ignore the file header above it.
  const after = md.split(/\n---\n/, 2)[1] ?? md
  const intro =
    md.split(/\n---\n/, 1)[0]?.replace(/^# Changelog\s*/i, '').trim() ?? ''

  // Split on lines that start with `## ` (date headers).
  const sections = after.split(/^##\s+/m).filter(Boolean)
  const entries: Entry[] = sections.map((s) => {
    const [first, ...rest] = s.split('\n')
    return { date: first.trim(), body: rest.join('\n').trim() }
  })
  return { intro, entries }
}

// Render a minimal markdown subset: headings (### / ####), bullets, bold,
// inline code. Good enough for the changelog format. No external deps so this
// stays a Server Component with no client-side cost.
//
// Link href sanitization (security audit L2): only allow http(s)://, mailto:,
// and same-origin (/) hrefs. Everything else — javascript:, data:, vbscript: —
// falls back to a plain "#" so a compromised or badly-written CHANGELOG.md
// can't inject an XSS vector.
function safeHref(raw: string): string {
  const t = raw.trim()
  if (
    t.startsWith('http://') ||
    t.startsWith('https://') ||
    t.startsWith('mailto:') ||
    t.startsWith('/')
  ) {
    return t.replace(/"/g, '&quot;')
  }
  return '#'
}

function renderInline(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/`([^`]+)`/g, '<code class="rounded bg-gray-100 px-1 py-0.5 text-[12px] text-gray-800">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label: string, href: string) =>
      `<a href="${safeHref(href)}" class="text-emerald-700 hover:underline">${label}</a>`,
    )
}

function bodyToHtml(body: string): string {
  const lines = body.split('\n')
  const out: string[] = []
  let inList = false
  for (const line of lines) {
    if (line.startsWith('### ')) {
      if (inList) { out.push('</ul>'); inList = false }
      out.push(`<h3 class="mt-6 font-display text-lg font-bold text-gray-900">${renderInline(line.slice(4))}</h3>`)
    } else if (line.startsWith('- ')) {
      if (!inList) { out.push('<ul class="ml-5 mt-2 list-disc space-y-1.5 text-sm text-gray-700">'); inList = true }
      out.push(`<li>${renderInline(line.slice(2))}</li>`)
    } else if (line.trim() === '') {
      if (inList) { out.push('</ul>'); inList = false }
    } else {
      if (inList) { out.push('</ul>'); inList = false }
      out.push(`<p class="mt-2 text-sm leading-relaxed text-gray-700">${renderInline(line)}</p>`)
    }
  }
  if (inList) out.push('</ul>')
  return out.join('\n')
}

export default async function ChangelogPage() {
  let raw = ''
  try {
    raw = await readFile(join(process.cwd(), 'CHANGELOG.md'), 'utf8')
  } catch {
    raw = '# Changelog\n\n---\n\n## No entries yet\n\nAdd entries to `CHANGELOG.md` in the repo root.'
  }
  const { intro, entries } = parseChangelog(raw)

  return (
    <>
      <PageHeader
        title="Changelog"
        subtitle="Everything shipped to the storefront. Newest first. Quote the date when reporting a bug."
      />

      {intro && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5 text-[13px] leading-relaxed text-gray-600 shadow-sm">
          {intro.split('\n\n').map((p, i) => (
            <p key={i} className={i > 0 ? 'mt-3' : ''}>{p}</p>
          ))}
        </div>
      )}

      <div className="space-y-6">
        {entries.length === 0 ? (
          <p className="rounded-lg border border-gray-200 bg-white px-5 py-12 text-center text-sm text-gray-500">
            No entries yet. Add some to <code className="rounded bg-gray-100 px-1 py-0.5 text-[12px]">CHANGELOG.md</code>.
          </p>
        ) : (
          entries.map((e, i) => (
            <article
              key={i}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <header className="border-b border-gray-200 bg-gray-50 px-5 py-3">
                <p className="font-display text-base font-bold text-gray-900">{e.date}</p>
              </header>
              <div
                className="px-5 py-5"
                dangerouslySetInnerHTML={{ __html: bodyToHtml(e.body) }}
              />
            </article>
          ))
        )}
      </div>
    </>
  )
}
