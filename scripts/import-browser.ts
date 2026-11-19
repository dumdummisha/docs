import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
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
const REMOTE_MAIN = 'refs/heads/main'
const FETCHED_MAIN = 'refs/import/main'

// Git as the import runs it: no system or global configuration (a url.<base>.insteadOf there could redirect the fetch
// to another server), no GIT_* variable of the caller's (GIT_DIR, GIT_OBJECT_DIRECTORY and the like could point it at
// other objects), no replacement objects (a refs/replace entry could stand in for what a hash names) and no prompt.
const gitEnvironment = (): NodeJS.ProcessEnv => ({
  ...Object.fromEntries(Object.entries(process.env).filter(([name]) => !name.startsWith('GIT_'))),
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_NO_REPLACE_OBJECTS: '1',
  GIT_TERMINAL_PROMPT: '0',
})

const git = (repository: string, args: readonly string[]): Buffer => {
  try {
    return execFileSync('git', ['--no-replace-objects', '-C', repository, ...args], {
      env: gitEnvironment(),
      stdio: ['ignore', 'pipe', 'pipe'],
    })
  } catch (error) {
    throw new BrowserFactsError(`git ${args.join(' ')} failed: ${String(error)}`)
  }
}

// The full hash of the named commit in `repository`, refused unless it is on the main branch fetched from `remote`.
const mainCommitOf = (repository: string, remote: string, name: string): string => {
  if (!COMMIT_NAME.test(name)) {
    throw new BrowserFactsError(`Name the commit by its hash, not ${name}`)
  }
  try {
    const commit = git(repository, ['rev-parse', '--verify', '--quiet', '--end-of-options', `${name}^{commit}`])
      .toString('utf8')
      .trim()
    git(repository, ['merge-base', '--is-ancestor', commit, FETCHED_MAIN])

    return commit
  } catch (error) {
    if (!(error instanceof BrowserFactsError)) {
      throw error
    }

    throw new BrowserFactsError(`${name} is not a commit on the main branch of ${remote}`)
  }
}

// Imports the browser repository's disclosures, manifest declarations and Slack transport limits at one commit into
// facts/browser/, replacing the previous import. The commit and its files are read from a fresh repository that has
// fetched nothing but `remote`'s main branch, so what is imported is what that server publishes there, whatever any
// local checkout holds; git checks every fetched object against its hash. The CLI fetches from the public browser
// repository; tests pass a local one. Nothing is written unless every file verifies and passes the public-data scan
// under the repository path it is written to.
export const importBrowser = async (name: string, root: string, remote: string): Promise<string[]> => {
  const repository = await mkdtemp(join(tmpdir(), 'misha-browser-import-'))
  try {
    git(repository, ['init', '--quiet', '--bare'])
    git(repository, ['fetch', '--quiet', '--no-tags', '--', remote, `+${REMOTE_MAIN}:${FETCHED_MAIN}`])
    const commit = mainCommitOf(repository, remote, name)
    const files = browserFactsFilesOf(commit, {
      'store-disclosures.json': git(repository, ['show', `${commit}:${BROWSER_SOURCE_PATHS['store-disclosures.json']}`]),
      'manifest.json': git(repository, ['show', `${commit}:${BROWSER_SOURCE_PATHS['manifest.json']}`]),
      'slack-transport.json': git(repository, ['show', `${commit}:${BROWSER_SOURCE_PATHS['slack-transport.json']}`]),
    })
    const written = [...files].map(([file, bytes]) => [`${BROWSER_FACTS_DIRECTORY}/${file}`, bytes] as const)
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
  } finally {
    await rm(repository, { recursive: true, force: true })
  }
}

if (import.meta.main) {
  const [commit, ...rest] = process.argv.slice(2).filter((argument) => argument !== '--')
  if (commit === undefined || rest.length > 0) {
    console.error('Usage: pnpm import:browser -- <commit>')
    process.exit(1)
  }
  try {
    const written = await importBrowser(commit, process.cwd(), BROWSER_REPOSITORY_URL)
    console.log(`Imported ${written.length} files from ${BROWSER_REPOSITORY_URL} at ${commit}:\n${written.join('\n')}`)
  } catch (error) {
    if (!(error instanceof BrowserFactsError)) {
      throw error
    }
    console.error(`import:browser refused the commit: ${error.message}`)
    process.exit(1)
  }
}
