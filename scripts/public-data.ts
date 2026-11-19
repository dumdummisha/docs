import { extname } from 'node:path'

import { pngTextsOf } from './png.ts'

export type PublicDataRule =
  | 'email address'
  | 'home path'
  | 'Slack id'
  | 'unapproved URL'
  | 'person outside the cast'
  | 'unexpected binary file'
  | 'unreadable file'

export interface IPublicDataFinding {
  file: string
  line: number
  rule: PublicDataRule
}

interface IApprovedUrl {
  host: string
  // A path prefix, or '' for the whole host.
  path: string
  // Where the URL may appear: a file path prefix, or '' for any file.
  within: string
}

const BUILT_ASSETS = '.vitepress/dist/assets/'

// Every URL the repository and its built site may contain. Anything else fails, so a new link is a deliberate edit here.
const APPROVED_URLS: readonly IApprovedUrl[] = [
  // The product's own sites and its public GitHub organisation.
  { host: 'docs.dumdummisha.ai', path: '', within: '' },
  { host: 'dumdummisha.ai', path: '', within: '' },
  { host: 'github.com', path: '/dumdummisha/', within: '' },
  // The home pages of the programs Misha needs, which the desktop export's detection facts link for installing them.
  { host: 'claude.com', path: '/product/claude-code', within: '' },
  { host: 'opencode.ai', path: '/', within: '' },
  { host: 'cli.github.com', path: '/', within: '' },
  // Namespace and schema identifiers: SVG and MathML namespaces in markup, the vercel.json schema, the sitemap's schemas.
  { host: 'www.w3.org', path: '', within: '' },
  { host: 'openapi.vercel.sh', path: '', within: 'vercel.json' },
  { host: 'www.sitemaps.org', path: '/schemas/', within: '.vitepress/dist/sitemap.xml' },
  { host: 'www.google.com', path: '/schemas/', within: '.vitepress/dist/sitemap.xml' },
  // The licence texts: Apache-2.0 and the fonts' OFL-1.1 notices with each font project's home.
  { host: 'www.apache.org', path: '/licenses/', within: '' },
  { host: 'scripts.sil.org', path: '/OFL', within: '' },
  { host: 'openfontlicense.org', path: '', within: '' },
  { host: 'github.com', path: '/ateliertriay/bricolage', within: '' },
  { host: 'github.com', path: '/erikdkennedy/figtree', within: '' },
  { host: 'github.com', path: '/JetBrains/JetBrainsMono', within: '' },
  // Strings VitePress and Vue bundle into the built JavaScript and CSS. None is fetched by these pages: a.com is a URL
  // parsing base, iconify serves social-link icons this site does not configure, the Algolia link belongs to the search
  // provider this site does not use, and the others are licence and error-reference links in comments and messages.
  { host: 'a.com', path: '', within: BUILT_ASSETS },
  { host: 'api.iconify.design', path: '/simple-icons/', within: BUILT_ASSETS },
  { host: 'docsearch.algolia.com', path: '', within: BUILT_ASSETS },
  { host: 'github.com', path: '/focus-trap/', within: BUILT_ASSETS },
  { host: 'vuejs.org', path: '/error-reference/', within: BUILT_ASSETS },
]

// The made-up people public examples may name.
const CAST: ReadonlySet<string> = new Set(['Sam Rivera', 'Priya Nair', 'Jonas Weber', 'Sam', 'Priya', 'Jonas'])
// JSON keys whose values name a person, lowercase; keys are compared case-insensitively. Role words such as owner or
// colleague are not here: the desktop export uses them as role ids, not names.
const PERSON_KEYS: ReadonlySet<string> = new Set([
  'authorname',
  'displayname',
  'fullname',
  'ownername',
  'people',
  'person',
  'personname',
  'realname',
  'requestername',
])
// Font files are binary and hold no page text, so they are not scanned.
const FONT_EXTENSIONS: ReadonlySet<string> = new Set(['.woff2'])

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/gu
const HOME_PATH = /(?:\/Users\/|\/home\/|[A-Za-z]:\\Users\\)[A-Za-z0-9._-]+/gu
// U, C, D, T or G followed by eight or more uppercase letters and digits, at least one a digit: an ordinary
// all-capitals word such as CONDITIONS is not an id.
const SLACK_ID = /\b[UCDTG](?=[A-Z0-9]*[0-9])[A-Z0-9]{8,}\b/gu
const URL_PATTERN = /https?:\/\/[^\s"'`<>()[\]{}\\]+/gu

const lineAt = (text: string, index: number): number => text.slice(0, index).split('\n').length

const isApprovedUrl = (file: string, raw: string): boolean => {
  const url = URL.parse(raw.replace(/[.,;:]+$/u, ''))
  if (url === null) {
    return false
  }

  return APPROVED_URLS.some(
    (approved) =>
      file.startsWith(approved.within) &&
      url.host === approved.host &&
      (approved.path === '' ||
        url.pathname.startsWith(approved.path) ||
        url.pathname === approved.path.replace(/\/$/u, ''))
  )
}

// Every string a JSON value holds under a person key, so a fact or capture can name only the cast.
const peopleIn = (value: unknown, isPersonField = false): string[] => {
  if (typeof value === 'string') {
    return isPersonField ? [value] : []
  }
  if (Array.isArray(value)) {
    return value.flatMap((item) => peopleIn(item, isPersonField))
  }
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).flatMap(([key, item]) => peopleIn(item, PERSON_KEYS.has(key.toLowerCase())))
  }

  return []
}

const personFindings = (file: string, text: string): IPublicDataFinding[] => {
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch {
    return [{ file, line: 1, rule: 'unreadable file' }]
  }

  return peopleIn(value)
    .filter((name) => !CAST.has(name))
    .map((name) => {
      const index = text.indexOf(JSON.stringify(name))

      return { file, line: index === -1 ? 1 : lineAt(text, index), rule: 'person outside the cast' }
    })
}

const pngFindings = (file: string, bytes: Buffer): IPublicDataFinding[] => {
  let texts: string[]
  try {
    texts = pngTextsOf(bytes)
  } catch {
    return [{ file, line: 1, rule: 'unreadable file' }]
  }

  return texts.flatMap((text) => findingsInText(file, text).map((finding) => ({ ...finding, line: 1 })))
}

// Findings in one text: email addresses, home paths, Slack ids and unapproved URLs, each with its line.
export const findingsInText = (file: string, text: string): IPublicDataFinding[] => {
  const matches = (pattern: RegExp, rule: PublicDataRule): IPublicDataFinding[] =>
    [...text.matchAll(pattern)]
      .filter((match) => rule !== 'unapproved URL' || !isApprovedUrl(file, match[0]))
      .map((match) => ({ file, line: lineAt(text, match.index), rule }))

  return [
    ...matches(EMAIL, 'email address'),
    ...matches(HOME_PATH, 'home path'),
    ...matches(SLACK_ID, 'Slack id'),
    ...matches(URL_PATTERN, 'unapproved URL'),
  ]
}

// Findings in one file by its kind: a PNG's text chunks, a font as an approved binary, JSON with its person fields,
// any other file as UTF-8 text. A binary file of another kind is itself a finding.
export const findingsInFile = (file: string, bytes: Buffer): IPublicDataFinding[] => {
  const extension = extname(file).toLowerCase()
  if (extension === '.png') {
    return pngFindings(file, bytes)
  }
  if (FONT_EXTENSIONS.has(extension)) {
    return []
  }
  if (bytes.includes(0)) {
    return [{ file, line: 1, rule: 'unexpected binary file' }]
  }
  const text = bytes.toString('utf8')

  return extension === '.json' ? [...findingsInText(file, text), ...personFindings(file, text)] : findingsInText(file, text)
}

export const findingLine = (finding: IPublicDataFinding): string => `${finding.file}:${finding.line} ${finding.rule}`
