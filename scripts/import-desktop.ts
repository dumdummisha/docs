import { lstat, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

import {
  BundleError,
  DESKTOP_FACTS_DIRECTORY,
  repositoryPathOf,
  SITE_CAPTURES_DIRECTORY,
  verifiedExportOf,
} from './desktop-export.ts'
import { findingLine, findingsInFile } from './public-data.ts'

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

const clearDirectory = async (directory: string, extension: string): Promise<void> => {
  await mkdir(directory, { recursive: true })
  const stale = (await readdir(directory)).filter((name) => name.endsWith(extension))
  await Promise.all(stale.map((name) => rm(join(directory, name))))
}

// Imports a reviewed desktop export bundle into the repository, replacing the previous import: facts to facts/desktop/,
// captures.json to facts/, PNGs to src/public/captures/. Nothing is written unless the bundle verifies and every file
// passes the public-data scan under the repository path it is written to.
export const importDesktop = async (bundle: string, root: string): Promise<string[]> => {
  const files = await bundleFilesOf(bundle)
  const bytesByFile = new Map(
    await Promise.all(files.map(async (file) => [file, await readFile(join(bundle, file))] as const))
  )
  verifiedExportOf(bytesByFile)
  const written = [...bytesByFile].map(([file, bytes]) => [repositoryPathOf(file), bytes] as const)
  const findings = written.flatMap(([target, bytes]) => findingsInFile(target, bytes))
  if (findings.length > 0) {
    throw new BundleError(`The bundle fails the public-data scan:\n${findings.map(findingLine).join('\n')}`)
  }

  await clearDirectory(join(root, DESKTOP_FACTS_DIRECTORY), '.json')
  await clearDirectory(join(root, SITE_CAPTURES_DIRECTORY), '.png')
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
