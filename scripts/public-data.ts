import { createHash } from 'node:crypto'
import { extname } from 'node:path'

import { pngChunkTypesOf } from './png.ts'
import { BROWSER_REPOSITORY_URL, DOWNLOADS_REPOSITORY_URL, LANDING_URL, REPOSITORY_URL, SITE_URL } from './site.ts'

export type PublicDataRule =
  | 'email address'
  | 'home path'
  | 'Slack id'
  | 'credential'
  | 'credential field'
  | 'unapproved URL'
  | 'URL credentials'
  | 'person outside the cast'
  | 'unapproved name-shaped phrase'
  | 'unapproved PNG chunk'
  | 'unapproved font'
  | 'unexpected binary file'
  | 'unreadable file'

export interface IPublicDataFinding {
  file: string
  line: number
  rule: PublicDataRule
}

interface IApprovedUrl {
  host: string
  // The approved path and everything below it, or the whole host when the path is /.
  path: string
  // File path prefixes the URL may appear in.
  within: readonly string[]
}

interface IJsonString {
  path: readonly (string | number)[]
  value: string
  isKey: boolean
  line: number
}

type JsonContainer = { kind: 'object'; key: string; isExpectingKey: boolean } | { kind: 'array'; index: number }

const ANYWHERE: readonly string[] = ['']
const BUILT_ASSETS: readonly string[] = ['.vitepress/dist/assets/']
const SITEMAP: readonly string[] = ['.vitepress/dist/sitemap.xml']
const OFL_TEXTS: readonly string[] = ['src/public/fonts/OFL-', '.vitepress/dist/fonts/OFL-']

// Every URL the repository and its built site may contain. Anything else fails, so a new link is a deliberate edit here.
const APPROVED_URLS: readonly IApprovedUrl[] = [
  // The product's own sites and its public repositories, each by its exact name.
  ...[SITE_URL, LANDING_URL, REPOSITORY_URL, BROWSER_REPOSITORY_URL, DOWNLOADS_REPOSITORY_URL].map((url) => {
    const { host, pathname } = new URL(url)

    return { host, path: pathname, within: ANYWHERE }
  }),
  // The home pages of the programs Misha needs, which the desktop export's detection facts link for installing them.
  { host: 'claude.com', path: '/product/claude-code', within: ANYWHERE },
  { host: 'opencode.ai', path: '/', within: ANYWHERE },
  { host: 'cli.github.com', path: '/', within: ANYWHERE },
  // Slack's web client origin, which the browser extension's disclosures and manifest name as the pages its content
  // scripts run on. Quoted from the imported facts and on the pages that render them, never linked.
  { host: 'app.slack.com', path: '/', within: ['facts/browser/', '.vitepress/dist/'] },
  // XML namespaces: SVG in the artwork and the built CSS and JavaScript, MathML and XLink in the bundled Vue runtime,
  // XLink in the rendered diagrams, XHTML and the sitemap schemas in the sitemap, and the vercel.json schema.
  { host: 'www.w3.org', path: '/2000/svg', within: ['src/public/', '.vitepress/dist/'] },
  { host: 'www.w3.org', path: '/1998/Math/MathML', within: BUILT_ASSETS },
  { host: 'www.w3.org', path: '/1999/xlink', within: [...BUILT_ASSETS, 'src/public/diagrams/', '.vitepress/dist/diagrams/'] },
  { host: 'www.w3.org', path: '/1999/xhtml', within: SITEMAP },
  { host: 'www.sitemaps.org', path: '/schemas/', within: SITEMAP },
  { host: 'www.google.com', path: '/schemas/', within: SITEMAP },
  { host: 'openapi.vercel.sh', path: '/vercel.json', within: ['vercel.json'] },
  // The licence texts: Apache-2.0, and the fonts' OFL-1.1 notices with each font project's home.
  { host: 'www.apache.org', path: '/licenses/', within: ['LICENSE'] },
  { host: 'scripts.sil.org', path: '/OFL', within: OFL_TEXTS },
  { host: 'github.com', path: '/ateliertriay/bricolage', within: OFL_TEXTS },
  { host: 'github.com', path: '/erikdkennedy/figtree', within: OFL_TEXTS },
  { host: 'github.com', path: '/JetBrains/JetBrainsMono', within: OFL_TEXTS },
  // Strings VitePress and Vue bundle into the built JavaScript and CSS. None is fetched by these pages: a.com is a URL
  // parsing base, iconify serves social-link icons this site does not configure, the Algolia link belongs to the search
  // provider this site does not use, and the others are licence and error-reference links in comments and messages.
  { host: 'a.com', path: '/', within: BUILT_ASSETS },
  { host: 'api.iconify.design', path: '/simple-icons/', within: BUILT_ASSETS },
  { host: 'docsearch.algolia.com', path: '/', within: BUILT_ASSETS },
  { host: 'github.com', path: '/focus-trap/', within: BUILT_ASSETS },
  { host: 'vuejs.org', path: '/error-reference/', within: BUILT_ASSETS },
]

// All-capitals words of the licence texts that have a Slack id's shape, each allowed only in its licence files. They
// are written in lowercase so this file does not match its own rule, and compared upper-cased.
const SLACK_ID_LOOKALIKES: readonly { words: readonly string[]; within: readonly string[] }[] = [
  { words: ['conditions', 'distribution', 'warranties'], within: ['LICENSE'] },
  {
    words: ['conditions', 'consequential', 'copyright', 'definitions', 'disclaimer', 'termination', 'trademark', 'warranties'],
    within: OFL_TEXTS,
  },
]

// The made-up people public examples may name, in full and by first name.
const CAST_FULL_NAMES: readonly string[] = ['Sam Rivera', 'Priya Nair', 'Jonas Weber']
const CAST: ReadonlySet<string> = new Set([...CAST_FULL_NAMES, ...CAST_FULL_NAMES.map((name) => name.split(' ')[0] ?? name)])

// JSON keys that hold a person, compared lowercase without separators and a plural s. Every string anywhere below such a
// key must name the cast, unless its exact location is listed in NON_PERSON_LOCATIONS.
const PERSON_KEYS: ReadonlySet<string> = new Set([
  'asker',
  'assignee',
  'author',
  'authorname',
  'colleague',
  'contact',
  'displayname',
  'fullname',
  'member',
  'owner',
  'ownername',
  'people',
  'person',
  'personname',
  'realname',
  'recipient',
  'reporter',
  'requestedby',
  'requester',
  'requestername',
  'sender',
  'user',
  'username',
])

// Where the imported facts hold a role id or prose, not a person, under a person key; * stands for an array index.
const NON_PERSON_LOCATIONS: readonly { file: string; path: string }[] = [
  // The two sender roles, owner and colleague, each with its description.
  { file: 'facts/desktop/commands.json', path: 'senders.*.id' },
  { file: 'facts/desktop/commands.json', path: 'senders.*.description' },
  { file: 'facts/desktop/commands.json', path: 'commands.*.sender' },
  // The format a repository's GitHub owner must match: its regular expression and flags.
  { file: 'facts/desktop/settings.json', path: 'fields.*.limits.owner.pattern' },
  { file: 'facts/desktop/settings.json', path: 'fields.*.limits.owner.flags' },
  // The browser disclosures' sentence on where the extension sends data.
  { file: 'facts/browser/store-disclosures.json', path: 'dataUsage.recipients' },
]

// JSON keys with a credential-like name that hold no credential, each at its exact location; * stands for an array index.
const REVIEWED_CREDENTIAL_KEYS: readonly { file: string; path: string }[] = [
  // The browser disclosures' account of where Slack's session credentials go.
  { file: 'facts/browser/store-disclosures.json', path: 'credentialHandling' },
  // The fewest model tokens a setting accepts, a count.
  { file: 'facts/desktop/settings.json', path: 'fields.*.limits.minTokens' },
]

// JSON keys whose string values are visible text, where two capitalised words in a row must be a cast name or one of
// NAME_SHAPED_PHRASES, so a capture cannot name someone outside the cast in its text or alt.
const FREE_TEXT_KEYS: ReadonlySet<string> = new Set(['text', 'alt'])
// The reviewed capitalised word pairs of the captures' text and alt that are not people.
const NAME_SHAPED_PHRASES: ReadonlySet<string> = new Set([
  'Ask Priya',
  'Claude Code',
  'Connect Figma',
  'Google Workspace',
  'No Slack',
  'Open Slack',
  'Opens Slack',
  'Opens Terminal',
  'Pause Misha',
  'Resume Misha',
  'System Settings',
  'This Mac',
  'Your Claude',
  'Your Docs',
])

// The reviewed font files by SHA-256: a font's name and metadata tables can carry any text, so only these exact files pass.
const APPROVED_FONTS: ReadonlySet<string> = new Set([
  // bricolage-grotesque-600.woff2
  '8928f6c9c1b5cc11562ccb0639cf5ca3ae9d963895d2a6e6ffa482fe9a6a2c95',
  // figtree-400-800-italic.woff2
  'ba0e9e20f91b8ba39cabca32e7f323c2e453b0badb563899b5e728d68cd97614',
  // figtree-400-800.woff2
  '8330490a01c60c196eae00b823de8102275aaa5862e7b76a7af21b8745338928',
  // jetbrains-mono-400-700.woff2
  '2c32b9b3ee358c119e210f6f5195f9bd34894d78a785ff2e95d60e718e400af4',
])
// PNG chunks that hold only pixels and how to render them. Every other chunk (text, EXIF, ICC profiles, timestamps,
// private chunks) fails rather than being read or stripped.
const APPROVED_PNG_CHUNKS: ReadonlySet<string> = new Set([
  'IHDR',
  'PLTE',
  'IDAT',
  'IEND',
  'tRNS',
  'sRGB',
  'gAMA',
  'cHRM',
  'pHYs',
  'bKGD',
])
const MARKUP_EXTENSIONS: ReadonlySet<string> = new Set(['.html', '.svg', '.xml', '.md'])
const SCRIPT_EXTENSIONS: ReadonlySet<string> = new Set(['.js', '.mjs', '.cjs', '.ts', '.mts'])
// Named character references markup may spell a scanned character with; numeric references are decoded generally.
const NAMED_ENTITIES: Readonly<Record<string, string>> = {
  amp: '&',
  apos: "'",
  bsol: '\\',
  colon: ':',
  commat: '@',
  gt: '>',
  lowbar: '_',
  lt: '<',
  nbsp: ' ',
  period: '.',
  quot: '"',
  sol: '/',
}

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/gu
const HOME_PATH = /(?:\/Users\/|\/home\/|[A-Za-z]:\\Users\\)[A-Za-z0-9._-]+/gu
// U, W, C, G, D or T followed by eight or more capitals and digits.
const SLACK_ID = /\b[UWCGDT][A-Z0-9]{8,}\b/gu
// Slack's mention syntax with an id, whatever the id's length: a less-than sign, then @, # or !subteam^, then the id.
const SLACK_MENTION = /<(?:@|#|!subteam\^)[A-Z0-9]+/gu
const CREDENTIAL_VALUE =
  /\bxox[abeoprs]-[A-Za-z0-9-]+|\bgh[pousr]_[A-Za-z0-9]{20,}|\bgithub_pat_\w+|\b(?:AKIA|ASIA)[A-Z0-9]{16}\b|-{5}BEGIN [A-Z ]*PRIVATE KEY-{5}|Developer ID (?:Application|Installer)|\bsk-[A-Za-z0-9_-]{20,}/gu
const CREDENTIAL_KEY = /secret|token|passw|api[_-]?key|private[_-]?key|signing|certificate|client[_-]?id|account[_-]?id|team[_-]?id|credential/iu
// A URL with any scheme, in any letter case.
const SCHEME_URL = /\b[a-z][a-z0-9+.-]*:\/\/[^\s"'`<>()[\]{}\\]+/giu
// A scheme-relative URL: two slashes, optional credentials, then a dotted host.
const SCHEME_RELATIVE_URL =
  /(?<![\w:/])\/\/(?:[^\s/@"'`<>]+@)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?::\d+)?(?:[/?#][^\s"'`<>()[\]{}\\]*)?/giu
// An @-mention of a capitalised name, one word or two.
const AT_MENTION = /(?<![\w.@])@(?<name>\p{Lu}\p{Ll}+(?: \p{Lu}\p{Ll}+)?)/gu
// Two capitalised words in a row, found at every capitalised word so overlapping pairs are all seen.
const NAME_SHAPED_PAIR = /(?<!\p{L})(?=(?<pair>\p{Lu}\p{Ll}+ \p{Lu}\p{Ll}+)(?!\p{L}))/gu
const CHARACTER_REFERENCE = /&(?:#(?<decimal>\d+)|#[xX](?<hex>[0-9a-fA-F]+)|(?<name>[A-Za-z]+));/gu
const SCRIPT_ESCAPE = /\\(?:u\{(?<braced>[0-9a-fA-F]+)\}|u(?<unicode>[0-9a-fA-F]{4})|x(?<hex>[0-9a-fA-F]{2})|(?<slash>\/))/gu
const JSON_TOKEN = /"(?:[^"\\]|\\.)*"|[{}[\],:]|[^\s{}[\],:"]+/gu
const FIRST_PRINTABLE_CODE_POINT = 0x20
const LAST_CODE_POINT = 0x10ffff
const REPLACEMENT_CHARACTER = '\ufffd'

const lineAt = (text: string, index: number): number => text.slice(0, index).split('\n').length

const isWithin = (file: string, within: readonly string[]): boolean => within.some((prefix) => file.startsWith(prefix))

// A decoded character that would break a line is scanned as a space, so findings keep the source's line numbers.
const printable = (codePoint: number): string => {
  if (codePoint > LAST_CODE_POINT) {
    return REPLACEMENT_CHARACTER
  }

  return codePoint < FIRST_PRINTABLE_CODE_POINT ? ' ' : String.fromCodePoint(codePoint)
}

const decodeMarkup = (text: string): string =>
  text.replaceAll(CHARACTER_REFERENCE, (reference, decimal?: string, hex?: string, name?: string) => {
    if (decimal !== undefined) {
      return printable(Number.parseInt(decimal, 10))
    }
    if (hex !== undefined) {
      return printable(Number.parseInt(hex, 16))
    }

    return NAMED_ENTITIES[name ?? ''] ?? reference
  })

const decodeScript = (text: string): string =>
  text.replaceAll(SCRIPT_ESCAPE, (_escape, braced?: string, unicode?: string, hex?: string) => {
    const digits = braced ?? unicode ?? hex
    if (digits === undefined) {
      return '/'
    }

    return printable(Number.parseInt(digits, 16))
  })

const urlFinding = (file: string, raw: string, isSchemeRelative: boolean): PublicDataRule | undefined => {
  const trimmed = raw.replace(/[.,;:]+$/u, '')
  const url = URL.parse(isSchemeRelative ? `https:${trimmed}` : trimmed)
  if (url === null) {
    return 'unapproved URL'
  }
  if (url.username !== '' || url.password !== '') {
    return 'URL credentials'
  }
  const isApproved =
    (url.protocol === 'https:' || url.protocol === 'http:') &&
    url.search === '' &&
    APPROVED_URLS.some(({ host, path, within }) => {
      const below = path.endsWith('/') ? path : `${path}/`

      return (
        isWithin(file, within) && url.host === host && (path === '/' || url.pathname === path || url.pathname.startsWith(below))
      )
    })

  return isApproved ? undefined : 'unapproved URL'
}

const isSlackIdLookalike = (file: string, id: string): boolean =>
  SLACK_ID_LOOKALIKES.some(({ words, within }) => isWithin(file, within) && words.some((word) => word.toUpperCase() === id))

// Findings in one text: email addresses, home paths, Slack ids and mentions, credentials, unapproved URLs and
// @-mentions of people outside the cast, each with its line.
export const findingsInText = (file: string, text: string): IPublicDataFinding[] => {
  const at = (index: number, rule: PublicDataRule): IPublicDataFinding => ({ file, line: lineAt(text, index), rule })
  const matches = (pattern: RegExp, rule: PublicDataRule): IPublicDataFinding[] =>
    [...text.matchAll(pattern)].map((match) => at(match.index, rule))
  const urls = (pattern: RegExp, isSchemeRelative: boolean): IPublicDataFinding[] =>
    [...text.matchAll(pattern)].flatMap((match) => {
      const rule = urlFinding(file, match[0], isSchemeRelative)

      return rule === undefined ? [] : [at(match.index, rule)]
    })

  return [
    ...matches(EMAIL, 'email address'),
    ...matches(HOME_PATH, 'home path'),
    ...[...text.matchAll(SLACK_ID)]
      .filter((match) => !isSlackIdLookalike(file, match[0]))
      .map((match) => at(match.index, 'Slack id')),
    ...matches(SLACK_MENTION, 'Slack id'),
    ...matches(CREDENTIAL_VALUE, 'credential'),
    ...urls(SCHEME_URL, false),
    ...urls(SCHEME_RELATIVE_URL, true),
    ...[...text.matchAll(AT_MENTION)]
      .filter((match) => !CAST.has(match.groups?.name ?? ''))
      .map((match) => at(match.index, 'person outside the cast')),
  ]
}

// Every string literal of a valid JSON document, keys included, decoded, with its location and line.
const jsonStringsOf = (text: string): IJsonString[] => {
  const stack: JsonContainer[] = []
  const strings: IJsonString[] = []
  const pathOf = (): (string | number)[] =>
    stack.map((container) => (container.kind === 'object' ? container.key : container.index))
  let line = 1
  let lineCountedTo = 0
  for (const match of text.matchAll(JSON_TOKEN)) {
    const token = match[0]
    const top = stack.at(-1)
    line += text.slice(lineCountedTo, match.index).split('\n').length - 1
    lineCountedTo = match.index
    if (token === '{') {
      stack.push({ kind: 'object', key: '', isExpectingKey: true })
    } else if (token === '[') {
      stack.push({ kind: 'array', index: 0 })
    } else if (token === '}' || token === ']') {
      stack.pop()
    } else if (token === ',' && top?.kind === 'object') {
      top.isExpectingKey = true
    } else if (token === ',' && top?.kind === 'array') {
      top.index += 1
    } else if (token === ':' && top?.kind === 'object') {
      top.isExpectingKey = false
    } else if (token.startsWith('"')) {
      const value = JSON.parse(token) as string
      const isKey = top?.kind === 'object' && top.isExpectingKey
      if (isKey) {
        top.key = value
      }
      strings.push({ path: pathOf(), value, isKey, line })
    }
  }

  return strings
}

const normalisedKey = (key: string): string => key.toLowerCase().replaceAll(/[\s_-]/gu, '').replace(/s$/u, '')

// Whether a decoded string sits at one of the locations, an array index matching *.
const isAtLocation = (
  locations: readonly { file: string; path: string }[],
  file: string,
  path: readonly (string | number)[]
): boolean =>
  locations.some((location) => {
    const pattern = location.path.split('.')

    return (
      location.file === file &&
      pattern.length === path.length &&
      pattern.every((segment, index) =>
        segment === '*' ? typeof path[index] === 'number' : segment === path[index]
      )
    )
  })

const structureRulesOf = (file: string, string: IJsonString): PublicDataRule[] => {
  if (string.isKey) {
    return CREDENTIAL_KEY.test(string.value) && !isAtLocation(REVIEWED_CREDENTIAL_KEYS, file, string.path)
      ? ['credential field']
      : []
  }
  const isPersonValue =
    string.path.some((segment) => typeof segment === 'string' && PERSON_KEYS.has(normalisedKey(segment))) &&
    !isAtLocation(NON_PERSON_LOCATIONS, file, string.path)
  const lastSegment = string.path.at(-1)
  const phrases =
    typeof lastSegment === 'string' && FREE_TEXT_KEYS.has(lastSegment)
      ? [...string.value.matchAll(NAME_SHAPED_PAIR)].map((match) => match.groups?.pair ?? '')
      : []

  return [
    ...(isPersonValue && !CAST.has(string.value) ? (['person outside the cast'] as const) : []),
    ...phrases
      .filter((phrase) => !CAST_FULL_NAMES.includes(phrase) && !NAME_SHAPED_PHRASES.has(phrase))
      .map(() => 'unapproved name-shaped phrase' as const),
  ]
}

// A JSON document is scanned by its decoded strings, so an escape such as \u0040 cannot hide a value, and by its
// structure: credential-like keys, people under person keys, and name-shaped phrases in visible text.
const jsonFindings = (file: string, text: string): IPublicDataFinding[] => {
  try {
    JSON.parse(text)
  } catch {
    return [{ file, line: 1, rule: 'unreadable file' }]
  }

  return jsonStringsOf(text).flatMap((string) => [
    ...findingsInText(file, string.value).map((finding) => ({ ...finding, line: string.line })),
    ...structureRulesOf(file, string).map((rule) => ({ file, line: string.line, rule })),
  ])
}

const pngFindings = (file: string, bytes: Buffer): IPublicDataFinding[] => {
  let types: string[]
  try {
    types = pngChunkTypesOf(bytes)
  } catch {
    return [{ file, line: 1, rule: 'unreadable file' }]
  }

  return [...new Set(types)]
    .filter((type) => !APPROVED_PNG_CHUNKS.has(type))
    .map(() => ({ file, line: 1, rule: 'unapproved PNG chunk' }))
}

// Findings in one file by its kind: a PNG by its chunk types, a font by its hash, JSON by its decoded strings and
// structure, markup and scripts with their character escapes decoded, any other file as UTF-8 text. A binary file of
// another kind is itself a finding.
export const findingsInFile = (file: string, bytes: Buffer): IPublicDataFinding[] => {
  const extension = extname(file).toLowerCase()
  if (extension === '.png') {
    return pngFindings(file, bytes)
  }
  if (extension === '.woff2') {
    const isApproved = APPROVED_FONTS.has(createHash('sha256').update(bytes).digest('hex'))

    return isApproved ? [] : [{ file, line: 1, rule: 'unapproved font' }]
  }
  if (bytes.includes(0)) {
    return [{ file, line: 1, rule: 'unexpected binary file' }]
  }
  const text = bytes.toString('utf8')
  if (extension === '.json') {
    return jsonFindings(file, text)
  }
  if (MARKUP_EXTENSIONS.has(extension)) {
    return findingsInText(file, decodeMarkup(text))
  }
  if (SCRIPT_EXTENSIONS.has(extension)) {
    return findingsInText(file, decodeScript(text))
  }

  return findingsInText(file, text)
}

export const findingLine = (finding: IPublicDataFinding): string => `${finding.file}:${finding.line} ${finding.rule}`
