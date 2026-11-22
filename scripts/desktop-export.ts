import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { z } from 'zod'

import { type IPngSize, pngSizeOf } from './png.ts'

const MANIFEST_FILE = 'manifest.json'
const CAPTURES_FILE = 'captures.json'
const CAPTURE_PATH = /^captures\/[a-z0-9]+(?:-[a-z0-9]+)*\.png$/u
const EXPORT_SCHEMA_VERSION = 2

// Where the import writes each export file, relative to the repository root.
export const DESKTOP_FACTS_DIRECTORY = 'facts/desktop'
const SITE_CAPTURES_FILE = `facts/${CAPTURES_FILE}`
export const SITE_CAPTURES_DIRECTORY = 'src/public/captures'
// The one repository-owned file beside the imported facts.
const DESKTOP_FACTS_README = 'README.md'

const SHA256 = z.string().regex(/^[0-9a-f]{64}$/u)
const SLUG = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u)
const TEXT = z.string().min(1)
const SENDER_ROLE = z.enum(['owner', 'colleague'])
const SETTING_FIELD = z.string().regex(/^[a-z][A-Za-z]*$/u)
const HOME_RELATIVE_PATH = z.string().regex(/^~\/\.misha(?:\/[a-z0-9._-]+)*$/u)
// A format a setting's value must match: a regular expression and its flags, refused unless they compile together.
const FORMAT = z
  .strictObject({ pattern: TEXT, flags: z.string().regex(/^[dimsuvy]*$/u) })
  .superRefine(({ pattern, flags }, context) => {
    try {
      RegExp(pattern, flags)
    } catch (error) {
      context.addIssue({ code: 'custom', message: `The pattern does not compile with its flags: ${String(error)}` })
    }
  })

// The export's manifest: versions, the evidence day, and every other file with its size and hash. The digest is the
// SHA-256 of one "<sha256>  <path>" line per listed file, in the listed order, joined with newlines.
const MANIFEST_SCHEMA = z.strictObject({
  exportSchemaVersion: z.literal(EXPORT_SCHEMA_VERSION),
  productVersion: z.string().regex(/^\d+\.\d+\.\d+$/u),
  evidenceDate: z.iso.date(),
  captureRecipeVersion: z.int().positive(),
  digest: SHA256,
  files: z.array(z.strictObject({ path: TEXT, bytes: z.int().nonnegative(), sha256: SHA256 })),
})

// How the desktop export took its screenshots: the browser, window size and scale, the frozen clock and the data set.
const RECIPE_SCHEMA = z.strictObject({
  version: z.int().positive(),
  browser: TEXT,
  window: z.strictObject({ width: z.int().positive(), height: z.int().positive(), scale: z.int().positive() }),
  clock: TEXT,
  data: TEXT,
})

// One committed screenshot of the desktop app, as the export describes it and <Shot> shows it. The region is the whole
// page, the window's first screen, or one element of the page by its id.
const CAPTURE_SCHEMA = z.strictObject({
  id: SLUG,
  scenario: SLUG,
  page: SLUG,
  region: z.discriminatedUnion('kind', [
    z.strictObject({ kind: z.literal('page') }),
    z.strictObject({ kind: z.literal('window') }),
    z.strictObject({ kind: z.literal('element'), id: SLUG }),
  ]),
  file: z.string().regex(CAPTURE_PATH),
  width: z.int().positive(),
  height: z.int().positive(),
  sha256: SHA256,
  alt: TEXT,
  text: z.string(),
})

const CAPTURES_SCHEMA = z
  .strictObject({ recipe: RECIPE_SCHEMA, captures: z.array(CAPTURE_SCHEMA) })
  .superRefine(({ captures }, context) => {
    const ids = captures.map((capture) => capture.id)
    const duplicate = ids.find((id, index) => ids.indexOf(id) !== index)
    if (duplicate !== undefined) {
      context.addIssue({ code: 'custom', message: `${CAPTURES_FILE} lists the capture ${duplicate} more than once` })
    }
  })

// The public shape of each fact file, by its path in the bundle. Every object is strict, so a field the export adds
// fails here until this schema and the review accept it.
const FACT_SCHEMAS = {
  'facts/commands.json': z.strictObject({
    rule: TEXT,
    senders: z.array(z.strictObject({ id: SENDER_ROLE, description: TEXT })),
    places: z.array(z.strictObject({ id: SLUG, description: TEXT })),
    commands: z.array(
      z.strictObject({
        id: SLUG,
        syntax: TEXT,
        sender: SENDER_ROLE,
        places: z.array(SLUG).min(1),
        effect: TEXT,
        example: TEXT,
        mutation: SLUG,
      })
    ),
  }),
  'facts/settings.json': z.strictObject({
    fields: z.array(
      z.strictObject({
        field: SETTING_FIELD,
        description: TEXT,
        default: TEXT,
        limits: z.strictObject({
          maxCharacters: z.int().positive().optional(),
          maxNotes: z.int().positive().optional(),
          maxCharactersEach: z.int().positive().optional(),
          maxNameCharacters: z.int().positive().optional(),
          levels: z.array(SLUG).optional(),
          channelId: FORMAT.optional(),
          name: FORMAT.optional(),
          remote: FORMAT.optional(),
          names: z.array(SLUG).optional(),
          runtimes: z.array(TEXT).optional(),
          isWholeNumber: z.literal(true).optional(),
          minTokens: z.int().positive().optional(),
        }),
      })
    ),
    mutations: z.array(
      z.strictObject({
        type: SLUG,
        description: TEXT,
        setting: SETTING_FIELD.nullable(),
        window: z.array(z.strictObject({ page: TEXT, section: TEXT.nullable(), control: TEXT, note: TEXT.nullable() })),
        slackCommands: z.array(SLUG),
        setupTool: z.string().regex(/^misha_[a-z_]+$/u).nullable(),
      })
    ),
  }),
  'facts/detection.json': z.strictObject({
    items: z.array(
      z.strictObject({
        item: SLUG,
        name: TEXT,
        about: TEXT,
        readyLabel: TEXT,
        isRequired: z.boolean(),
        group: TEXT,
        signIn: SLUG.nullable(),
        signInLabel: TEXT.nullable(),
        getIt: z.strictObject({ label: TEXT, url: z.url({ protocol: /^https$/u }) }).nullable(),
      })
    ),
  }),
  'facts/retention.json': z.strictObject({
    rule: TEXT,
    stores: z.array(z.strictObject({ id: SLUG, keptDays: z.int().positive().nullable(), description: TEXT })),
    overwrittenBatches: z.strictObject({ kept: z.int().positive(), description: TEXT }),
  }),
  'facts/paths.json': z.strictObject({
    home: HOME_RELATIVE_PATH,
    rule: TEXT,
    paths: z.array(z.strictObject({ id: SLUG, path: HOME_RELATIVE_PATH, description: TEXT })),
  }),
  'facts/setup-commands.json': z.strictObject({
    commands: z.array(
      z.strictObject({
        harness: z.enum(['claude-code', 'opencode']),
        name: TEXT,
        command: z.string().regex(/^\/[a-z0-9:/-]+$/u),
      })
    ),
  }),
} as const satisfies Record<string, z.ZodType>

type FactFile = keyof typeof FACT_SCHEMAS
const FACT_FILES = Object.keys(FACT_SCHEMAS) as FactFile[]

type Manifest = z.infer<typeof MANIFEST_SCHEMA>
export type Capture = z.infer<typeof CAPTURE_SCHEMA>
type CaptureList = z.infer<typeof CAPTURES_SCHEMA>

// The fact documents by name, facts/commands.json as commands and so on, each in its schema's shape.
export type DesktopFacts = {
  [TFile in FactFile as TFile extends `facts/${infer TName}.json` ? TName : never]: z.infer<(typeof FACT_SCHEMAS)[TFile]>
}

// A verified export: its manifest, capture list and fact documents by name.
interface IDesktopExport {
  manifest: Manifest
  captureList: CaptureList
  facts: DesktopFacts
}

export class BundleError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BundleError'
  }
}

const sha256 = (bytes: Buffer): string => createHash('sha256').update(bytes).digest('hex')

const isKnownFile = (file: string): boolean =>
  file === MANIFEST_FILE || file === CAPTURES_FILE || FACT_FILES.some((fact) => fact === file) || CAPTURE_PATH.test(file)

// The repository path an export file is imported to: facts to facts/desktop/, captures.json to facts/, PNGs to
// src/public/captures/.
export const repositoryPathOf = (file: string): string => {
  if (file === CAPTURES_FILE) {
    return SITE_CAPTURES_FILE
  }
  if (CAPTURE_PATH.test(file)) {
    return `${SITE_CAPTURES_DIRECTORY}/${file.slice('captures/'.length)}`
  }

  return `${DESKTOP_FACTS_DIRECTORY}/${file.replace(/^facts\//u, '')}`
}

const parsedJson = (file: string, bytes: Buffer): unknown => {
  try {
    return JSON.parse(bytes.toString('utf8'))
  } catch {
    throw new BundleError(`${file} is not valid JSON`)
  }
}

const parsedDocument = <TSchema extends z.ZodType>(file: string, bytes: Buffer, schema: TSchema): z.infer<TSchema> => {
  const result = schema.safeParse(parsedJson(file, bytes))
  if (!result.success) {
    throw new BundleError(`${file} does not match its schema: ${z.prettifyError(result.error)}`)
  }

  return result.data
}

const verifiedPngSizeOf = (file: string, bytes: Buffer): IPngSize => {
  try {
    return pngSizeOf(bytes)
  } catch (error) {
    throw new BundleError(`${file} is not a readable PNG: ${String(error)}`)
  }
}

// Checks every file of a desktop export by its path in the bundle: only known names, nothing missing, every size and
// hash the manifest and captures.json name, every document's strict schema and every capture's dimensions.
export const verifiedExportOf = (bytesByFile: ReadonlyMap<string, Buffer>): IDesktopExport => {
  const files = [...bytesByFile.keys()].sort()
  const unknown = files.filter((file) => !isKnownFile(file))
  if (unknown.length > 0) {
    throw new BundleError(`The bundle holds files the import does not know: ${unknown.join(', ')}`)
  }
  const missing = [MANIFEST_FILE, CAPTURES_FILE, ...FACT_FILES].filter((file) => !bytesByFile.has(file))
  if (missing.length > 0) {
    throw new BundleError(`The bundle lacks ${missing.join(', ')}`)
  }
  const read = (file: string): Buffer => {
    const bytes = bytesByFile.get(file)
    if (bytes === undefined) {
      throw new BundleError(`The bundle lacks ${file}`)
    }

    return bytes
  }

  const manifest = parsedDocument(MANIFEST_FILE, read(MANIFEST_FILE), MANIFEST_SCHEMA)
  const listed = manifest.files.map((entry) => entry.path)
  const content = files.filter((file) => file !== MANIFEST_FILE)
  if ([...listed].sort().join('\n') !== content.join('\n')) {
    throw new BundleError(`${MANIFEST_FILE} lists ${listed.join(', ')} but the bundle holds ${content.join(', ')}`)
  }
  const mismatched = manifest.files.filter(
    (entry) => entry.sha256 !== sha256(read(entry.path)) || entry.bytes !== read(entry.path).length
  )
  if (mismatched.length > 0) {
    const paths = mismatched.map((entry) => entry.path).join(', ')
    throw new BundleError(`The size or SHA-256 of ${paths} differs from ${MANIFEST_FILE}`)
  }
  const digest = sha256(Buffer.from(manifest.files.map((entry) => `${entry.sha256}  ${entry.path}`).join('\n')))
  if (digest !== manifest.digest) {
    throw new BundleError(`The digest in ${MANIFEST_FILE} does not match its file list`)
  }

  // Each document parsed by its own file's schema under its file's name, which is what DesktopFacts maps.
  const facts = Object.fromEntries(
    FACT_FILES.map((file) => [
      file.replace(/^facts\//u, '').replace(/\.json$/u, ''),
      parsedDocument(file, read(file), FACT_SCHEMAS[file]),
    ])
  ) as DesktopFacts
  const captureList = parsedDocument(CAPTURES_FILE, read(CAPTURES_FILE), CAPTURES_SCHEMA)
  if (captureList.recipe.version !== manifest.captureRecipeVersion) {
    throw new BundleError(
      `${CAPTURES_FILE} has capture recipe ${captureList.recipe.version} but ${MANIFEST_FILE} says ${manifest.captureRecipeVersion}`
    )
  }
  const capturedFiles = captureList.captures.map((capture) => capture.file).sort()
  const pngFiles = files.filter((file) => CAPTURE_PATH.test(file))
  if (capturedFiles.join('\n') !== pngFiles.join('\n')) {
    throw new BundleError(`${CAPTURES_FILE} names ${capturedFiles.join(', ')} but the bundle holds ${pngFiles.join(', ')}`)
  }
  for (const capture of captureList.captures) {
    const bytes = read(capture.file)
    if (sha256(bytes) !== capture.sha256) {
      throw new BundleError(`The SHA-256 of ${capture.file} differs from ${CAPTURES_FILE}`)
    }
    const { width, height } = verifiedPngSizeOf(capture.file, bytes)
    if (width !== capture.width || height !== capture.height) {
      throw new BundleError(
        `${capture.file} is ${width}x${height}, not the ${capture.width}x${capture.height} ${CAPTURES_FILE} says`
      )
    }
  }

  return { manifest, captureList, facts }
}

// What facts/ holds: the desktop export's capture list and facts, the browser facts pnpm import:browser writes, and
// the records reviewed by hand (reviewed-facts.ts).
const FACTS_ENTRIES: readonly string[] = [CAPTURES_FILE, 'desktop', 'browser', 'reviewed']

// The imported export as the repository holds it, checked again like a bundle, so a capture or fact edited or replaced
// after the import fails the build. facts/desktop/ holds only the export and its README.
export const committedExportOf = async (root: string): Promise<IDesktopExport> => {
  const [factsEntries, desktopEntries, captureEntries] = await Promise.all([
    readdir(join(root, 'facts')),
    readdir(join(root, DESKTOP_FACTS_DIRECTORY)),
    readdir(join(root, SITE_CAPTURES_DIRECTORY)),
  ])
  const unexpected = factsEntries.filter((name) => !FACTS_ENTRIES.includes(name))
  if (unexpected.length > 0) {
    throw new Error(
      `facts/ holds ${unexpected.join(', ')}, which is neither the desktop export, the browser facts nor the reviewed records`
    )
  }
  const files = [
    CAPTURES_FILE,
    ...desktopEntries
      .filter((name) => name !== DESKTOP_FACTS_README)
      .map((name) => (name === MANIFEST_FILE ? name : `facts/${name}`)),
    ...captureEntries.map((name) => `captures/${name}`),
  ]
  const bytesByFile = new Map(
    await Promise.all(files.map(async (file) => [file, await readFile(join(root, repositoryPathOf(file)))] as const))
  )
  try {
    return verifiedExportOf(bytesByFile)
  } catch (error) {
    if (!(error instanceof BundleError)) {
      throw error
    }
    throw new Error(`The committed desktop export in facts/ and ${SITE_CAPTURES_DIRECTORY}/ fails its check: ${error.message}`)
  }
}
