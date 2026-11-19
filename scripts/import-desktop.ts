import { createHash } from 'node:crypto'
import { lstat, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

import { z } from 'zod'

import { findingLine, findingsInFile } from './public-data.ts'
import { type IPngSize, pngSizeOf } from './png.ts'
import { type CaptureList, CAPTURES_FILE, captureListOf } from './site-facts.ts'

const MANIFEST_FILE = 'manifest.json'
const FACT_FILES: readonly string[] = [
  'facts/commands.json',
  'facts/settings.json',
  'facts/detection.json',
  'facts/retention.json',
  'facts/paths.json',
  'facts/setup-commands.json',
]
const CAPTURE_PATH = /^captures\/[a-z0-9]+(?:-[a-z0-9]+)*\.png$/u
const EXPORT_SCHEMA_VERSION = 1

// Where the import writes, relative to the repository root.
export const DESKTOP_FACTS_DIRECTORY = 'facts/desktop'
export const SITE_CAPTURES_FILE = `facts/${CAPTURES_FILE}`
export const SITE_CAPTURES_DIRECTORY = 'src/public/captures'

const SHA256 = z.string().regex(/^[0-9a-f]{64}$/u)

// The export's manifest: versions, the evidence day, and every other file with its size and hash. The digest is the
// SHA-256 of one "<sha256>  <path>" line per listed file, in the listed order, joined with newlines.
const MANIFEST_SCHEMA = z.strictObject({
  exportSchemaVersion: z.literal(EXPORT_SCHEMA_VERSION),
  productVersion: z.string().min(1),
  evidenceDate: z.iso.date(),
  captureRecipeVersion: z.int().positive(),
  digest: SHA256,
  files: z.array(z.strictObject({ path: z.string().min(1), bytes: z.int().nonnegative(), sha256: SHA256 })),
})

export class BundleError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BundleError'
  }
}

const sha256 = (bytes: Buffer): string => createHash('sha256').update(bytes).digest('hex')

const isKnownFile = (file: string): boolean =>
  file === MANIFEST_FILE || file === CAPTURES_FILE || FACT_FILES.includes(file) || CAPTURE_PATH.test(file)

// Every regular file in the bundle by its path inside it; a symlink or any other special file stops the import.
const bundleFilesOf = async (bundle: string): Promise<string[]> => {
  const entries = await readdir(bundle, { recursive: true, withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    const path = join(entry.parentPath, entry.name)
    const file = relative(bundle, path).split('\\').join('/')
    const stats = await lstat(path)
    if (stats.isSymbolicLink()) {
      throw new BundleError(`The bundle holds a symlink, ${file}`)
    }
    if (stats.isFile()) {
      files.push(file)
    } else if (!stats.isDirectory()) {
      throw new BundleError(`The bundle holds ${file}, which is not a regular file`)
    }
  }

  return files.sort()
}

const parsedJson = (file: string, bytes: Buffer): unknown => {
  try {
    return JSON.parse(bytes.toString('utf8'))
  } catch {
    throw new BundleError(`${file} is not valid JSON`)
  }
}

const bundleCaptureListOf = (bytes: Buffer): CaptureList => {
  try {
    return captureListOf(parsedJson(CAPTURES_FILE, bytes))
  } catch (error) {
    throw new BundleError(`${CAPTURES_FILE} is not a valid capture list: ${String(error)}`)
  }
}

const bundlePngSizeOf = (file: string, bytes: Buffer): IPngSize => {
  try {
    return pngSizeOf(bytes)
  } catch (error) {
    throw new BundleError(`${file} is not a readable PNG: ${String(error)}`)
  }
}

// Checks every file of a desktop export bundle and returns their bytes by path: only known names, nothing missing,
// every hash the manifest and captures.json name, every capture's size, and no public-data finding.
const verifiedBundleOf = async (bundle: string): Promise<Map<string, Buffer>> => {
  const files = await bundleFilesOf(bundle)
  const unknown = files.filter((file) => !isKnownFile(file))
  if (unknown.length > 0) {
    throw new BundleError(`The bundle holds files the import does not know: ${unknown.join(', ')}`)
  }
  const missing = [MANIFEST_FILE, CAPTURES_FILE, ...FACT_FILES].filter((file) => !files.includes(file))
  if (missing.length > 0) {
    throw new BundleError(`The bundle lacks ${missing.join(', ')}`)
  }
  const bytesByFile = new Map(
    await Promise.all(files.map(async (file) => [file, await readFile(join(bundle, file))] as const))
  )
  const read = (file: string): Buffer => {
    const bytes = bytesByFile.get(file)
    if (bytes === undefined) {
      throw new BundleError(`The bundle lacks ${file}`)
    }

    return bytes
  }

  const manifest = MANIFEST_SCHEMA.safeParse(parsedJson(MANIFEST_FILE, read(MANIFEST_FILE)))
  if (!manifest.success) {
    throw new BundleError(
      `${MANIFEST_FILE} does not match export schema ${EXPORT_SCHEMA_VERSION}: ${manifest.error.message}`
    )
  }
  const listed = manifest.data.files.map((entry) => entry.path)
  const content = files.filter((file) => file !== MANIFEST_FILE)
  if ([...listed].sort().join('\n') !== content.join('\n')) {
    throw new BundleError(`${MANIFEST_FILE} lists ${listed.join(', ')} but the bundle holds ${content.join(', ')}`)
  }
  const mismatched = manifest.data.files.filter(
    (entry) => entry.sha256 !== sha256(read(entry.path)) || entry.bytes !== read(entry.path).length
  )
  if (mismatched.length > 0) {
    const paths = mismatched.map((entry) => entry.path).join(', ')
    throw new BundleError(`The size or SHA-256 of ${paths} differs from ${MANIFEST_FILE}`)
  }
  const digest = sha256(Buffer.from(manifest.data.files.map((entry) => `${entry.sha256}  ${entry.path}`).join('\n')))
  if (digest !== manifest.data.digest) {
    throw new BundleError(`The digest in ${MANIFEST_FILE} does not match its file list`)
  }

  for (const file of FACT_FILES) {
    parsedJson(file, read(file))
  }
  const { recipe, captures } = bundleCaptureListOf(read(CAPTURES_FILE))
  if (recipe.version !== manifest.data.captureRecipeVersion) {
    throw new BundleError(
      `${CAPTURES_FILE} has capture recipe ${recipe.version} but ${MANIFEST_FILE} says ${manifest.data.captureRecipeVersion}`
    )
  }
  const capturedFiles = captures.map((capture) => capture.file).sort()
  const pngFiles = files.filter((file) => CAPTURE_PATH.test(file))
  if (capturedFiles.join('\n') !== pngFiles.join('\n')) {
    throw new BundleError(
      `${CAPTURES_FILE} names ${capturedFiles.join(', ')} but the bundle holds ${pngFiles.join(', ')}`
    )
  }
  for (const capture of captures) {
    const bytes = read(capture.file)
    if (sha256(bytes) !== capture.sha256) {
      throw new BundleError(`The SHA-256 of ${capture.file} differs from ${CAPTURES_FILE}`)
    }
    const { width, height } = bundlePngSizeOf(capture.file, bytes)
    if (width !== capture.width || height !== capture.height) {
      throw new BundleError(
        `${capture.file} is ${width}x${height}, not the ${capture.width}x${capture.height} ${CAPTURES_FILE} says`
      )
    }
  }

  const findings = files.flatMap((file) => findingsInFile(file, read(file)))
  if (findings.length > 0) {
    throw new BundleError(`The bundle fails the public-data scan:\n${findings.map(findingLine).join('\n')}`)
  }

  return bytesByFile
}

const clearDirectory = async (directory: string, extension: string): Promise<void> => {
  await mkdir(directory, { recursive: true })
  const stale = (await readdir(directory)).filter((name) => name.endsWith(extension))
  await Promise.all(stale.map((name) => rm(join(directory, name))))
}

// Imports a reviewed desktop export bundle into the repository, replacing the previous import: facts to facts/desktop/,
// captures.json to facts/, PNGs to src/public/captures/. Nothing is written unless every check passes.
export const importDesktop = async (bundle: string, root: string): Promise<string[]> => {
  const bytesByFile = await verifiedBundleOf(bundle)
  const factsDirectory = join(root, DESKTOP_FACTS_DIRECTORY)
  const capturesDirectory = join(root, SITE_CAPTURES_DIRECTORY)
  await clearDirectory(factsDirectory, '.json')
  await clearDirectory(capturesDirectory, '.png')

  const targetOf = (file: string): string => {
    if (file === CAPTURES_FILE) {
      return SITE_CAPTURES_FILE
    }
    if (CAPTURE_PATH.test(file)) {
      return `${SITE_CAPTURES_DIRECTORY}/${file.slice('captures/'.length)}`
    }

    return `${DESKTOP_FACTS_DIRECTORY}/${file.replace(/^facts\//u, '')}`
  }
  const written = [...bytesByFile].map(([file, bytes]) => [targetOf(file), bytes] as const)
  await Promise.all(written.map(([target, bytes]) => writeFile(join(root, target), bytes)))

  return written.map(([target]) => target).sort()
}

if (import.meta.main) {
  const [bundle] = process.argv.slice(2).filter((argument) => argument !== '--')
  if (bundle === undefined) {
    console.error('Usage: pnpm import:desktop -- <bundle-dir>')
    process.exit(1)
  }
  try {
    const written = await importDesktop(bundle, process.cwd())
    console.log(`Imported ${written.length} files:\n${written.join('\n')}`)
  } catch (error) {
    if (!(error instanceof BundleError)) {
      throw error
    }
    console.error(`import:desktop refused the bundle: ${error.message}`)
    process.exit(1)
  }
}
