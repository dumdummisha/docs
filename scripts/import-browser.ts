import { execFileSync } from 'node:child_process'
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import {
  BROWSER_FACTS_DIRECTORY,
  BROWSER_SOURCE_PATHS,
  BrowserFactsError,
  browserFactsFilesOf,
} from './browser-facts.ts'
import { findingLine, findingsInFile } from './public-data.ts'
import { BROWSER_REPOSITORY_URL } from './site.ts'

// A commit is named by its hash, never by a branch or tag, so the import records exactly what it read.
const COMMIT_NAME = /^[0-9a-f]{7,40}$/u
const PUBLIC_MAIN = 'refs/remotes/origin/main'
const PUBLIC_ORIGINS: readonly string[] = [BROWSER_REPOSITORY_URL, `${BROWSER_REPOSITORY_URL}.git`]

const git = (checkout: string, args: readonly string[]): Buffer => {
  try {
    return execFileSync('git', ['-C', checkout, ...args], { stdio: ['ignore', 'pipe', 'pipe'] })
  } catch (error) {
    throw new BrowserFactsError(`git ${args.join(' ')} failed in ${checkout}: ${String(error)}`)
  }
}

// The full hash of the named commit, refused unless the checkout's origin is the public browser repository and the
// commit is on its main branch as last fetched.
const publicCommitOf = (checkout: string, name: string): string => {
  if (!COMMIT_NAME.test(name)) {
    throw new BrowserFactsError(`Name the commit by its hash, not ${name}`)
  }
  const origin = git(checkout, ['remote', 'get-url', 'origin']).toString('utf8').trim()
  if (!PUBLIC_ORIGINS.includes(origin)) {
    throw new BrowserFactsError(`${checkout}'s origin is ${origin}, not ${BROWSER_REPOSITORY_URL}`)
  }
  const commit = git(checkout, ['rev-parse', '--verify', '--end-of-options', `${name}^{commit}`]).toString('utf8').trim()
  try {
    execFileSync('git', ['-C', checkout, 'merge-base', '--is-ancestor', commit, PUBLIC_MAIN], { stdio: 'ignore' })
  } catch {
    throw new BrowserFactsError(`${commit} is not on ${PUBLIC_MAIN} in ${checkout}; fetch origin, or name a public commit`)
  }

  return commit
}

// Imports the browser repository's disclosures, manifest declarations and Slack transport limits at one public commit
// into facts/browser/, replacing the previous import. Nothing is written unless every file verifies and passes the
// public-data scan under the repository path it is written to.
export const importBrowser = async (checkout: string, name: string, root: string): Promise<string[]> => {
  const commit = publicCommitOf(checkout, name)
  const files = browserFactsFilesOf(commit, {
    'store-disclosures.json': git(checkout, ['show', `${commit}:${BROWSER_SOURCE_PATHS['store-disclosures.json']}`]),
    'manifest.json': git(checkout, ['show', `${commit}:${BROWSER_SOURCE_PATHS['manifest.json']}`]),
    'slack-transport.json': git(checkout, ['show', `${commit}:${BROWSER_SOURCE_PATHS['slack-transport.json']}`]),
  })
  const written = [...files].map(([name, bytes]) => [`${BROWSER_FACTS_DIRECTORY}/${name}`, bytes] as const)
  const findings = written.flatMap(([target, bytes]) => findingsInFile(target, bytes))
  if (findings.length > 0) {
    throw new BrowserFactsError(`The browser facts fail the public-data scan:\n${findings.map(findingLine).join('\n')}`)
  }

  const directory = join(root, BROWSER_FACTS_DIRECTORY)
  await mkdir(directory, { recursive: true })
  const stale = (await readdir(directory)).filter((entry) => entry.endsWith('.json'))
  await Promise.all(stale.map((entry) => rm(join(directory, entry))))
  await Promise.all(written.map(([target, bytes]) => writeFile(join(root, target), bytes)))

  return written.map(([target]) => target).sort()
}

if (import.meta.main) {
  const [checkout, commit] = process.argv.slice(2).filter((argument) => argument !== '--')
  if (checkout === undefined || commit === undefined) {
    console.error('Usage: pnpm import:browser -- <misha-browser checkout> <commit>')
    process.exit(1)
  }
  try {
    const written = await importBrowser(checkout, commit, process.cwd())
    console.log(`Imported ${written.length} files:\n${written.join('\n')}`)
  } catch (error) {
    if (!(error instanceof BrowserFactsError)) {
      throw error
    }
    console.error(`import:browser refused the commit: ${error.message}`)
    process.exit(1)
  }
}
