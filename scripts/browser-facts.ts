import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { z } from 'zod'

import { BROWSER_REPOSITORY_URL, SITE_URL } from './site.ts'

// The public browser repository's reviewed disclosures and manifest declarations, copied at one named commit by
// pnpm import:browser into facts/browser/. The disclosure schemas mirror browser-extension's own
// (src/disclosures/store-disclosures.ts); every schema here is strict, the source manifest's included, which is stricter
// than browser-extension's parser, so a field the browser repository adds fails here until this repository reviews it.

export const BROWSER_FACTS_DIRECTORY = 'facts/browser'
// The one repository-owned file beside the imported facts.
const BROWSER_FACTS_README = 'README.md'
const SOURCE_FILE = 'source.json'
const DISCLOSURES_FILE = 'store-disclosures.json'
const MANIFEST_FILE = 'manifest.json'
const SLACK_TRANSPORT_FILE = 'slack-transport.json'
const IMPORTED_FILES = [DISCLOSURES_FILE, MANIFEST_FILE, SLACK_TRANSPORT_FILE] as const
type ImportedFile = (typeof IMPORTED_FILES)[number]

// Where each imported file comes from in the browser repository.
export const BROWSER_SOURCE_PATHS = {
  [DISCLOSURES_FILE]: 'docs/store-disclosures.json',
  [MANIFEST_FILE]: 'src/extension/manifest.json',
  [SLACK_TRANSPORT_FILE]: 'docs/store-permissions.md',
} as const satisfies Record<ImportedFile, string>

export const PRIVACY_POLICY_URL = `${SITE_URL}/privacy`
export const PERMISSIONS_PAGE_URL = `${SITE_URL}/reference/permissions`

// The data types the store's privacy practices form asks about, each declared once.
const STORE_DATA_CATEGORIES = [
  'Personally identifiable information',
  'Health information',
  'Financial and payment information',
  'Authentication information',
  'Personal communications',
  'Location',
  'Web history',
  'User activity',
  'Website content',
] as const

const SHA256 = z.string().regex(/^[0-9a-f]{64}$/u)
const COMMIT = z.string().regex(/^[0-9a-f]{40}$/u)
const TEXT = z.string().min(1)

export const COLLECTION_TRIGGERS = ['automatic', 'slack-tab', 'app-request', 'tool-request'] as const
export type CollectionTrigger = (typeof COLLECTION_TRIGGERS)[number]

const DISCLOSURE_SCHEMA = z.strictObject({
  capability: TEXT,
  justification: TEXT,
  collectionTiming: z.strictObject({ triggers: z.array(z.enum(COLLECTION_TRIGGERS)).min(1), detail: TEXT }),
  limits: z.array(TEXT).min(1),
})

const DISCLOSURES_SCHEMA = z.strictObject({
  privacyPolicyUrl: z.literal(PRIVACY_POLICY_URL),
  permissionsPageUrl: z.literal(PERMISSIONS_PAGE_URL),
  introduction: z.array(TEXT).min(1),
  singlePurpose: TEXT,
  permissions: z.record(TEXT, DISCLOSURE_SCHEMA),
  hostPermissions: z.record(TEXT, DISCLOSURE_SCHEMA),
  // Keyed by a content script entry's files, joined with " + ".
  contentScripts: z.record(TEXT, DISCLOSURE_SCHEMA),
  notRequested: z.array(TEXT),
  nativeMessaging: z.array(TEXT).min(1),
  remoteCode: z.strictObject({ isUsed: z.boolean(), statement: TEXT }),
  dataUsage: z.strictObject({
    categories: z
      .array(z.strictObject({ category: z.enum(STORE_DATA_CATEGORIES), isHandled: z.boolean(), detail: TEXT }))
      .refine(
        (categories) =>
          categories.length === STORE_DATA_CATEGORIES.length &&
          STORE_DATA_CATEGORIES.every((name) => categories.some(({ category }) => category === name)),
        { message: `Declare each store data category exactly once: ${STORE_DATA_CATEGORIES.join(', ')}` }
      ),
    recipients: TEXT,
    certifications: z.array(TEXT).min(1),
    limitedUse: TEXT,
  }),
  credentialHandling: z.strictObject({
    paragraphs: z.array(TEXT).min(1),
    tabCommandReturns: z.array(TEXT).min(1),
    outOfScope: TEXT,
  }),
})

const CONTENT_SCRIPT_SCHEMA = z.strictObject({
  matches: z.array(TEXT).min(1),
  js: z.array(TEXT).min(1),
  run_at: z.enum(['document_start', 'document_end', 'document_idle']),
  world: z.enum(['ISOLATED', 'MAIN']),
  all_frames: z.boolean(),
})

// The manifest's declarations as facts/browser/manifest.json holds them, each content script with its defaults filled.
const MANIFEST_SCHEMA = z.strictObject({
  version: z.string().regex(/^\d+\.\d+\.\d+$/u),
  minimum_chrome_version: z.string().regex(/^\d+$/u),
  permissions: z.array(TEXT),
  host_permissions: z.array(TEXT),
  content_scripts: z.array(CONTENT_SCRIPT_SCHEMA),
})

// The browser's manifest as its repository holds it, every top-level field named. The declaration fields are exported;
// the metadata fields (manifest_version, name, description, key, background) are reviewed as granting nothing the
// disclosures do not cover and are not exported. Any other field (externally_connectable, web_accessible_resources,
// commands and so on) fails the parse until it is reviewed here, and so does a declaration form the disclosures have no
// text for (optional permissions, other content script scope fields), so neither reaches this site undisclosed.
const undisclosed = (field: string): z.ZodOptional<z.ZodNever> =>
  z.never({ error: `The disclosures cover no ${field}` }).optional()

const SOURCE_MANIFEST_SCHEMA = z.strictObject({
  manifest_version: z.literal(3),
  name: TEXT,
  description: TEXT,
  key: TEXT,
  background: z.strictObject({ service_worker: TEXT, type: z.literal('module') }),
  version: MANIFEST_SCHEMA.shape.version,
  minimum_chrome_version: MANIFEST_SCHEMA.shape.minimum_chrome_version,
  permissions: z.array(TEXT),
  host_permissions: z.array(TEXT),
  optional_permissions: undisclosed('optional_permissions'),
  optional_host_permissions: undisclosed('optional_host_permissions'),
  content_scripts: z.array(
    z.strictObject({
      matches: CONTENT_SCRIPT_SCHEMA.shape.matches,
      js: CONTENT_SCRIPT_SCHEMA.shape.js,
      run_at: CONTENT_SCRIPT_SCHEMA.shape.run_at.default('document_idle'),
      world: CONTENT_SCRIPT_SCHEMA.shape.world.default('ISOLATED'),
      all_frames: CONTENT_SCRIPT_SCHEMA.shape.all_frames.default(false),
    })
  ),
})

const NAMES = z.array(z.string().regex(/^[a-z_.A-Z]+$/u)).min(1)

// The Slack transport's limits that browser-extension renders into docs/store-permissions.md from its protocol constants.
const SLACK_TRANSPORT_SCHEMA = z.strictObject({
  readMethods: NAMES,
  writeMethods: NAMES,
  uploadMethods: NAMES,
  messageFields: NAMES,
  newMessageSubtypes: NAMES,
})

const SOURCE_SCHEMA = z.strictObject({
  repository: z.literal(BROWSER_REPOSITORY_URL),
  commit: COMMIT,
  files: z.array(z.strictObject({ path: z.enum(IMPORTED_FILES), from: TEXT, sha256: SHA256 })),
})

export type StoreDisclosures = z.infer<typeof DISCLOSURES_SCHEMA>
export type Disclosure = z.infer<typeof DISCLOSURE_SCHEMA>
export type BrowserManifest = z.infer<typeof MANIFEST_SCHEMA>
export type ContentScript = z.infer<typeof CONTENT_SCRIPT_SCHEMA>
export type SlackTransport = z.infer<typeof SLACK_TRANSPORT_SCHEMA>
type BrowserSource = z.infer<typeof SOURCE_SCHEMA>

// The verified browser facts: where they come from, and the three documents.
export interface IBrowserFacts {
  source: BrowserSource
  disclosures: StoreDisclosures
  manifest: BrowserManifest
  slackTransport: SlackTransport
}

export class BrowserFactsError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BrowserFactsError'
  }
}

export const sha256 = (bytes: Buffer): string => createHash('sha256').update(bytes).digest('hex')

export const contentScriptKey = ({ js }: Pick<ContentScript, 'js'>): string => js.join(' + ')

const parsedJson = (file: string, bytes: Buffer): unknown => {
  try {
    return JSON.parse(bytes.toString('utf8'))
  } catch {
    throw new BrowserFactsError(`${file} is not valid JSON`)
  }
}

const parsed = <TSchema extends z.ZodType>(file: string, value: unknown, schema: TSchema): z.output<TSchema> => {
  const result = schema.safeParse(value)
  if (!result.success) {
    throw new BrowserFactsError(`${file} does not match its schema: ${z.prettifyError(result.error)}`)
  }

  return result.data
}

const keyMismatches = (kind: string, declared: readonly string[], disclosed: readonly string[]): string[] => [
  ...declared.filter((key) => !disclosed.includes(key)).map((key) => `the manifest's ${kind} ${key} has no disclosure`),
  ...disclosed.filter((key) => !declared.includes(key)).map((key) => `the disclosed ${kind} ${key} is not in the manifest`),
]

// Refuses disclosures that disagree with the manifest: a declaration with no disclosure, a disclosure of something
// the manifest does not declare, or a permission listed as not requested that the manifest requests.
const checkAgreement = (disclosures: StoreDisclosures, manifest: BrowserManifest): void => {
  const mismatches = [
    ...keyMismatches('permission', manifest.permissions, Object.keys(disclosures.permissions)),
    ...keyMismatches('host permission', manifest.host_permissions, Object.keys(disclosures.hostPermissions)),
    ...keyMismatches(
      'content script',
      manifest.content_scripts.map(contentScriptKey),
      Object.keys(disclosures.contentScripts)
    ),
    ...disclosures.notRequested
      .filter((permission) => manifest.permissions.includes(permission))
      .map((permission) => `${permission} is listed as not requested, but the manifest requests it`),
  ]
  if (mismatches.length > 0) {
    throw new BrowserFactsError(`The disclosures do not match the manifest: ${mismatches.join('; ')}`)
  }
}

const CODE_LIST = '`[^`]+`(?:, `[^`]+`)*'
const SLACK_TRANSPORT_LINES = [
  new RegExp(
    `^- Web API methods the extension calls when the Misha app asks: the reads (?<reads>${CODE_LIST}), the writes (?<writes>${CODE_LIST}), and for an upload (?<uploads>${CODE_LIST})\\.$`,
    'u'
  ),
  new RegExp(`^- Fields a new message keeps when it leaves the page: (?<fields>${CODE_LIST}), and the id of each file it shares\\.$`, 'u'),
  new RegExp(`^- A message is new when it has no subtype or one of (?<subtypes>${CODE_LIST})\\.$`, 'u'),
] as const
const SLACK_TRANSPORT_HEADING = '## Slack transport limits'

const codeListOf = (list: string | undefined): string[] =>
  (list ?? '').split(', ').map((item) => item.replace(/^`|`$/gu, ''))

// The Slack transport section of browser-extension's generated docs/store-permissions.md, read line by line against the
// exact sentences its generator writes, so a reworded or reordered section stops the import rather than being misread.
export const slackTransportOf = (storePermissions: string): SlackTransport => {
  const file = BROWSER_SOURCE_PATHS[SLACK_TRANSPORT_FILE]
  const sections = storePermissions.split(/\n(?=## )/u)
  const section = sections.find((each) => each.startsWith(`${SLACK_TRANSPORT_HEADING}\n`))
  if (section === undefined) {
    throw new BrowserFactsError(`${file} has no "${SLACK_TRANSPORT_HEADING}" section`)
  }
  const lines = section.slice(SLACK_TRANSPORT_HEADING.length).trim().split('\n')
  if (lines.length !== SLACK_TRANSPORT_LINES.length) {
    throw new BrowserFactsError(`${file}'s "${SLACK_TRANSPORT_HEADING}" has ${lines.length} lines, not ${SLACK_TRANSPORT_LINES.length}`)
  }
  const [methods, fields, subtypes] = SLACK_TRANSPORT_LINES.map((pattern, index) => {
    const match = pattern.exec(lines[index] ?? '')
    if (match === null) {
      throw new BrowserFactsError(`${file}'s "${SLACK_TRANSPORT_HEADING}" line ${index + 1} is not the sentence this import reads`)
    }

    return match.groups ?? {}
  })

  return parsed(
    file,
    {
      readMethods: codeListOf(methods?.reads),
      writeMethods: codeListOf(methods?.writes),
      uploadMethods: codeListOf(methods?.uploads),
      messageFields: codeListOf(fields?.fields),
      newMessageSubtypes: codeListOf(subtypes?.subtypes),
    },
    SLACK_TRANSPORT_SCHEMA
  )
}

// The facts/browser documents built from the three files of the browser repository at one commit: the disclosures as
// they are, the manifest's declarations, and the Slack transport limits, each checked, with source.json naming the
// commit and each written file's hash.
export const browserFactsFilesOf = (
  commit: string,
  sourceBytes: Readonly<Record<ImportedFile, Buffer>>
): Map<string, Buffer> => {
  const disclosuresBytes = sourceBytes[DISCLOSURES_FILE]
  const disclosures = parsed(
    BROWSER_SOURCE_PATHS[DISCLOSURES_FILE],
    parsedJson(BROWSER_SOURCE_PATHS[DISCLOSURES_FILE], disclosuresBytes),
    DISCLOSURES_SCHEMA
  )
  const sourceManifest = parsed(
    BROWSER_SOURCE_PATHS[MANIFEST_FILE],
    parsedJson(BROWSER_SOURCE_PATHS[MANIFEST_FILE], sourceBytes[MANIFEST_FILE]),
    SOURCE_MANIFEST_SCHEMA
  )
  const manifest = parsed(
    BROWSER_SOURCE_PATHS[MANIFEST_FILE],
    {
      version: sourceManifest.version,
      minimum_chrome_version: sourceManifest.minimum_chrome_version,
      permissions: sourceManifest.permissions,
      host_permissions: sourceManifest.host_permissions,
      content_scripts: sourceManifest.content_scripts,
    },
    MANIFEST_SCHEMA
  )
  checkAgreement(disclosures, manifest)
  const slackTransport = slackTransportOf(sourceBytes[SLACK_TRANSPORT_FILE].toString('utf8'))

  const written: [ImportedFile, Buffer][] = [
    [DISCLOSURES_FILE, disclosuresBytes],
    [MANIFEST_FILE, Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`)],
    [SLACK_TRANSPORT_FILE, Buffer.from(`${JSON.stringify(slackTransport, null, 2)}\n`)],
  ]
  const source = parsed(
    SOURCE_FILE,
    {
      repository: BROWSER_REPOSITORY_URL,
      commit,
      files: written.map(([path, bytes]) => ({ path, from: BROWSER_SOURCE_PATHS[path], sha256: sha256(bytes) })),
    },
    SOURCE_SCHEMA
  )

  return new Map([[SOURCE_FILE, Buffer.from(`${JSON.stringify(source, null, 2)}\n`)], ...written])
}

// The committed facts/browser documents, checked like an import: only the known files, each hash source.json records,
// every strict schema and the disclosures' agreement with the manifest. A fact edited after the import stops the build.
export const committedBrowserFactsOf = async (root: string): Promise<IBrowserFacts> => {
  const directory = join(root, BROWSER_FACTS_DIRECTORY)
  const fail = (message: string): never => {
    throw new Error(`The committed browser facts in ${BROWSER_FACTS_DIRECTORY}/ fail their check: ${message}`)
  }
  const entries = (await readdir(directory)).filter((name) => name !== BROWSER_FACTS_README).sort()
  const expected = [SOURCE_FILE, ...IMPORTED_FILES].sort()
  if (entries.join('\n') !== expected.join('\n')) {
    fail(`it holds ${entries.join(', ')}, not ${expected.join(', ')}`)
  }
  const bytesOf = new Map(await Promise.all(expected.map(async (name) => [name, await readFile(join(directory, name))] as const)))
  const read = (name: string): Buffer => bytesOf.get(name) ?? fail(`${name} is missing`)

  try {
    const source = parsed(SOURCE_FILE, parsedJson(SOURCE_FILE, read(SOURCE_FILE)), SOURCE_SCHEMA)
    const listed = source.files.map((file) => file.path).sort()
    if (listed.join('\n') !== [...IMPORTED_FILES].sort().join('\n')) {
      fail(`${SOURCE_FILE} lists ${listed.join(', ')}`)
    }
    const changed = source.files.filter((file) => sha256(read(file.path)) !== file.sha256 || file.from !== BROWSER_SOURCE_PATHS[file.path])
    if (changed.length > 0) {
      fail(`${changed.map((file) => file.path).join(', ')} differ from what ${SOURCE_FILE} records`)
    }
    const disclosures = parsed(DISCLOSURES_FILE, parsedJson(DISCLOSURES_FILE, read(DISCLOSURES_FILE)), DISCLOSURES_SCHEMA)
    const manifest = parsed(MANIFEST_FILE, parsedJson(MANIFEST_FILE, read(MANIFEST_FILE)), MANIFEST_SCHEMA)
    checkAgreement(disclosures, manifest)
    const slackTransport = parsed(SLACK_TRANSPORT_FILE, parsedJson(SLACK_TRANSPORT_FILE, read(SLACK_TRANSPORT_FILE)), SLACK_TRANSPORT_SCHEMA)

    return { source, disclosures, manifest, slackTransport }
  } catch (error) {
    if (!(error instanceof BrowserFactsError)) {
      throw error
    }

    return fail(error.message)
  }
}
