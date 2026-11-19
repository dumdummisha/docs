import { existsSync, statSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { join, posix, relative } from 'node:path'

export interface ILinkFinding {
  page: string
  target: string
  problem: 'missing page or file' | 'missing anchor'
}

const LINK_ATTRIBUTE = /\s(?:href|src)="(?<target>[^"]*)"/gu
const ID_ATTRIBUTE = /\sid="(?<id>[^"]*)"/gu
const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/iu

const decodeEntities = (value: string): string =>
  value.replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&')

const idsOf = (html: string): Set<string> =>
  new Set([...html.matchAll(ID_ATTRIBUTE)].map((match) => decodeEntities(match.groups?.id ?? '')))

// The built file a site path serves with clean URLs: the file itself, its .html page, or the folder's index.html.
const fileFor = (built: string, sitePath: string): string | undefined => {
  const path = join(built, decodeURIComponent(sitePath))
  const candidates = sitePath.endsWith('/') ? [join(path, 'index.html')] : [path, `${path}.html`, join(path, 'index.html')]

  return candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile())
}

// Every internal link and image in the built site's pages, checked against the built files and the target page's ids.
export const checkLinks = async (built: string): Promise<ILinkFinding[]> => {
  const entries = await readdir(built, { recursive: true, withFileTypes: true })
  const pages = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.html')).map((entry) => join(entry.parentPath, entry.name))
  const htmlByFile = new Map(await Promise.all(pages.map(async (page) => [page, await readFile(page, 'utf8')] as const)))
  const findings: ILinkFinding[] = []
  for (const [page, html] of htmlByFile) {
    const sitePathOfPage = `/${relative(built, page).split('\\').join('/')}`
    for (const match of html.matchAll(LINK_ATTRIBUTE)) {
      const target = decodeEntities(match.groups?.target ?? '')
      if (target === '' || EXTERNAL.test(target)) {
        continue
      }
      const [path = '', anchor] = target.split('#')
      const sitePath = path === '' ? sitePathOfPage : posix.resolve(posix.dirname(sitePathOfPage), path.split('?')[0] ?? '')
      const file = path === '' ? page : fileFor(built, sitePath)
      if (file === undefined) {
        findings.push({ page: relative(built, page), target, problem: 'missing page or file' })
        continue
      }
      if (anchor !== undefined && anchor !== '' && !idsOf(htmlByFile.get(file) ?? '').has(decodeURIComponent(anchor))) {
        findings.push({ page: relative(built, page), target, problem: 'missing anchor' })
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
