import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { promisify } from 'node:util'

import { findingLine, findingsInFile, type IPublicDataFinding } from './public-data.ts'

export const BUILT_DIRECTORY = '.vitepress/dist'

// Files git tracks or would add (untracked and not ignored), so a new file is scanned before its first commit. A tracked
// file deleted in the working tree has nothing left to scan.
const repositoryFilesOf = async (root: string): Promise<string[]> => {
  const { stdout } = await promisify(execFile)('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], {
    cwd: root,
  })

  return [...new Set(stdout.split('\0').filter((file) => file !== ''))].filter((file) => existsSync(join(root, file)))
}

const builtFilesOf = async (root: string): Promise<string[]> => {
  const built = join(root, BUILT_DIRECTORY)
  if (!existsSync(built)) {
    throw new Error(`${BUILT_DIRECTORY} does not exist; run pnpm build before pnpm check:privacy`)
  }
  const entries = await readdir(built, { recursive: true, withFileTypes: true })

  return entries.filter((entry) => entry.isFile()).map((entry) => relative(root, join(entry.parentPath, entry.name)))
}

// The public-data findings in the repository's files and its built site.
export const checkPublic = async (root: string): Promise<IPublicDataFinding[]> => {
  const files = [...(await repositoryFilesOf(root)), ...(await builtFilesOf(root))]
  const findings = await Promise.all(files.map(async (file) => findingsInFile(file, await readFile(join(root, file)))))

  return findings.flat()
}

if (import.meta.main) {
  const findings = await checkPublic(process.cwd())
  for (const finding of findings) {
    console.error(findingLine(finding))
  }
  if (findings.length > 0) {
    console.error(`check:privacy failed: ${findings.length} finding(s)`)
    process.exit(1)
  }
  console.log('check:privacy passed')
}
