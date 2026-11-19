import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

import { z } from 'zod'

const CSP_HEADER = 'Content-Security-Policy'
const INLINE_SCRIPT = /<script(?<attributes>[^>]*)>(?<body>[\s\S]*?)<\/script>/gu
const SCRIPT_HASH = /'(?<hash>sha256-[A-Za-z0-9+/]+=*)'/gu

const VERCEL_SCHEMA = z.object({
  headers: z.array(z.object({ source: z.string(), headers: z.array(z.object({ key: z.string(), value: z.string() })) })),
})

// The script hashes the Content-Security-Policy in vercel.json allows.
export const allowedScriptHashesOf = (vercelJson: unknown): string[] => {
  const policy = VERCEL_SCHEMA.parse(vercelJson)
    .headers.flatMap((rule) => rule.headers)
    .find((header) => header.key === CSP_HEADER)?.value
  if (policy === undefined) {
    throw new Error(`vercel.json sets no ${CSP_HEADER} header`)
  }
  const scriptSource = policy
    .split(';')
    .map((directive) => directive.trim())
    .find((directive) => directive.startsWith('script-src '))
  if (scriptSource === undefined) {
    throw new Error(`The ${CSP_HEADER} in vercel.json has no script-src directive`)
  }

  return [...scriptSource.matchAll(SCRIPT_HASH)].map((match) => match.groups?.hash ?? '')
}

// The hash of every inline script in the built pages, which the browser compares against script-src.
export const inlineScriptHashesOf = (html: string): string[] =>
  [...html.matchAll(INLINE_SCRIPT)]
    .filter((match) => !/\ssrc=/u.test(match.groups?.attributes ?? ''))
    .map((match) => `sha256-${createHash('sha256').update(match.groups?.body ?? '').digest('base64')}`)

// Problems with the policy against the built pages: an inline script it does not allow, or a hash no page uses.
export const cspProblemsOf = (allowed: readonly string[], htmlByPage: ReadonlyMap<string, string>): string[] => {
  const used = new Set<string>()
  const problems: string[] = []
  for (const [page, html] of htmlByPage) {
    for (const hash of inlineScriptHashesOf(html)) {
      used.add(hash)
      if (!allowed.includes(hash)) {
        problems.push(`${page} has an inline script whose hash ${hash} the CSP does not allow`)
      }
    }
  }

  return [...problems, ...allowed.filter((hash) => !used.has(hash)).map((hash) => `The CSP allows ${hash}, which no page uses`)]
}

if (import.meta.main) {
  const root = process.cwd()
  const built = join(root, '.vitepress', 'dist')
  if (!existsSync(built)) {
    console.error('.vitepress/dist does not exist; run pnpm build before pnpm check:csp')
    process.exit(1)
  }
  const allowed = allowedScriptHashesOf(JSON.parse(await readFile(join(root, 'vercel.json'), 'utf8')))
  const entries = await readdir(built, { recursive: true, withFileTypes: true })
  const pages = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.html')).map((entry) => join(entry.parentPath, entry.name))
  const htmlByPage = new Map(await Promise.all(pages.map(async (page) => [relative(built, page), await readFile(page, 'utf8')] as const)))
  const problems = cspProblemsOf(allowed, htmlByPage)
  for (const problem of problems) {
    console.error(problem)
  }
  if (problems.length > 0) {
    console.error(`check:csp failed: ${problems.length} problem(s)`)
    process.exit(1)
  }
  console.log('check:csp passed')
}
