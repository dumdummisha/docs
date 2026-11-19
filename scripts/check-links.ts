import { existsSync, statSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

import { SITE_URL } from './site.ts'

export interface ILinkFinding {
  page: string
  target: string
  problem: 'missing page or file' | 'missing anchor' | 'unreadable link'
}

// An attribute's value in any HTML form: double-quoted, single-quoted or bare, with the name in any letter case.
const ATTRIBUTE_VALUE = String.raw`\s*=\s*(?:"(?<double>[^"]*)"|'(?<single>[^']*)'|(?<bare>[^\s"'=<>\x60]+))`
const LINK_ATTRIBUTE = new RegExp(String.raw`\s(?:href|src)${ATTRIBUTE_VALUE}`, 'giu')
const ID_ATTRIBUTE = new RegExp(String.raw`\sid${ATTRIBUTE_VALUE}`, 'giu')
const SITE_HOST = new URL(SITE_URL).host

const decodeEntities = (value: string): string =>
  value.replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&')

const valuesOf = (html: string, attribute: RegExp): string[] =>
  [...html.matchAll(attribute)].map((match) =>
    decodeEntities(match.groups?.double ?? match.groups?.single ?? match.groups?.bare ?? '')
  )

// The built file a site path serves with clean URLs: the file itself, its .html page, or the folder's index.html.
const fileFor = (built: string, sitePath: string): string | undefined => {
  const path = join(built, decodeURIComponent(sitePath))
  const candidates = sitePath.endsWith('/') ? [join(path, 'index.html')] : [path, `${path}.html`, join(path, 'index.html')]

  return candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile())
}

// Every link and image in the built site's pages that stays on the site, relative or absolute (any letter case,
// scheme-relative, the canonical host), checked against the built files and the target page's ids.
export const checkLinks = async (built: string): Promise<ILinkFinding[]> => {
  const entries = await readdir(built, { recursive: true, withFileTypes: true })
  const pages = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.html')).map((entry) => join(entry.parentPath, entry.name))
  const htmlByFile = new Map(await Promise.all(pages.map(async (page) => [page, await readFile(page, 'utf8')] as const)))
  const findings: ILinkFinding[] = []
  for (const [page, html] of htmlByFile) {
    const pageUrl = `${SITE_URL}/${relative(built, page).split('\\').join('/')}`
    for (const target of valuesOf(html, LINK_ATTRIBUTE)) {
      if (target === '') {
        continue
      }
      const finding = (problem: ILinkFinding['problem']): ILinkFinding => ({ page: relative(built, page), target, problem })
      const url = URL.parse(target, pageUrl)
      if (url === null) {
        findings.push(finding('unreadable link'))
        continue
      }
      if (url.host !== SITE_HOST || (url.protocol !== 'https:' && url.protocol !== 'http:')) {
        continue
      }
      const file = fileFor(built, url.pathname)
      if (file === undefined) {
        findings.push(finding('missing page or file'))
        continue
      }
      const anchor = decodeURIComponent(url.hash.slice(1))
      if (anchor !== '' && !valuesOf(htmlByFile.get(file) ?? '', ID_ATTRIBUTE).includes(anchor)) {
        findings.push(finding('missing anchor'))
      }
    }
  }

  return findings
}

if (import.meta.main) {
  const built = join(process.cwd(), '.vitepress', 'dist')
  if (!existsSync(built)) {
    console.error('.vitepress/dist does not exist; run pnpm build before pnpm check:links')
    process.exit(1)
  }
  const findings = await checkLinks(built)
  for (const finding of findings) {
    console.error(`${finding.page} links to ${finding.target}: ${finding.problem}`)
  }
  if (findings.length > 0) {
    console.error(`check:links failed: ${findings.length} finding(s)`)
    process.exit(1)
  }
  console.log('check:links passed')
}
