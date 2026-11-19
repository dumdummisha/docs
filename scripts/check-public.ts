import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

import { findingLine, findingsInFile, findingsInText, type IPublicDataFinding } from './public-data.ts'

type Scope = 'source' | 'built' | 'outgoing'

interface ITreeEntry {
  path: string
  blob: string
}

interface ICommit {
  sha: string
  identities: { name: string; email: string }[]
  message: string
}

export const BUILT_DIRECTORY = '.vitepress/dist'
const SCOPES: readonly Scope[] = ['source', 'built', 'outgoing']
const ORIGIN_MAIN = 'refs/remotes/origin/main'
const GIT_BUFFER_BYTES = 1024 * 1024 * 1024
const SHORT_SHA_LENGTH = 7
// git log's placeholders for the separators, and the characters they print.
const FIELD_PLACEHOLDER = '%x00'
const RECORD_PLACEHOLDER = '%x1e'
const FIELD = '\0'
const RECORD = '\x1e'
// The GitHub noreply address a public commit may carry instead of a real mailbox.
const NOREPLY_EMAIL = /^(?:\d+\+)?[A-Za-z0-9-]+@users\.noreply\.github\.com$/u

const git = (root: string, args: readonly string[], input?: string): Buffer =>
  execFileSync('git', args, { cwd: root, maxBuffer: GIT_BUFFER_BYTES, ...(input === undefined ? {} : { input }) })

// Files git tracks or would add (untracked and not ignored), as the working tree holds them: what a build of this
// checkout reads. A tracked file deleted in the working tree is not built, so it is not scanned.
const sourceFilesOf = (root: string): string[] =>
  [
    ...new Set(
      git(root, ['ls-files', '-z', '--cached', '--others', '--exclude-standard'])
        .toString('utf8')
        .split('\0')
        .filter((file) => file !== '')
    ),
  ].filter((file) => existsSync(join(root, file)))

const builtFilesOf = async (root: string): Promise<string[]> => {
  const built = join(root, BUILT_DIRECTORY)
  if (!existsSync(built)) {
    throw new Error(`${BUILT_DIRECTORY} does not exist; run pnpm build first`)
  }
  const entries = await readdir(built, { recursive: true, withFileTypes: true })

  return entries.filter((entry) => entry.isFile()).map((entry) => relative(root, join(entry.parentPath, entry.name)))
}

const findingsInFiles = async (root: string, files: readonly string[]): Promise<IPublicDataFinding[]> =>
  (await Promise.all(files.map(async (file) => findingsInFile(file, await readFile(join(root, file)))))).flat()

const hasOriginMain = (root: string): boolean =>
  git(root, ['for-each-ref', '--format=%(refname)', ORIGIN_MAIN]).toString('utf8').trim() !== ''

// The revisions a push of HEAD would publish: the commits not yet on origin's main, or the whole history when origin
// has no main.
const outgoingRangeOf = (root: string): string[] => (hasOriginMain(root) ? ['HEAD', '--not', ORIGIN_MAIN] : ['HEAD'])

// Every object origin's main already holds. A push cannot publish these again or take them back, so a rule added
// since they were pushed has nothing to stop in them.
const publishedObjectsOf = (root: string): ReadonlySet<string> =>
  hasOriginMain(root)
    ? new Set(
        git(root, ['rev-list', '--objects', '--no-object-names', ORIGIN_MAIN])
          .toString('utf8')
          .split('\n')
          .filter((id) => id !== '')
      )
    : new Set()

const treeEntriesOf = (root: string, commit: string): ITreeEntry[] =>
  git(root, ['ls-tree', '-r', '-z', '--full-tree', commit])
    .toString('utf8')
    .split('\0')
    .filter((line) => line !== '')
    .flatMap((line) => {
      const [header = '', path = ''] = line.split('\t')
      const [, type, blob = ''] = header.split(' ')

      return type === 'blob' ? [{ path, blob }] : []
    })

// Every blob's bytes by its id, read in one git cat-file --batch call.
const blobsOf = (root: string, blobs: readonly string[]): Map<string, Buffer> => {
  const output = git(root, ['cat-file', '--batch'], `${blobs.join('\n')}\n`)
  const bytesByBlob = new Map<string, Buffer>()
  let offset = 0
  while (offset < output.length) {
    const headerEnd = output.indexOf('\n', offset)
    const [blob = '', type, size = ''] = output.toString('utf8', offset, headerEnd).split(' ')
    if (type !== 'blob') {
      throw new Error(`git cat-file did not return blob ${blob}`)
    }
    const start = headerEnd + 1
    const end = start + Number(size)
    bytesByBlob.set(blob, output.subarray(start, end))
    offset = end + 1
  }

  return bytesByBlob
}

const commitsOf = (root: string, range: readonly string[]): ICommit[] =>
  git(root, ['log', `--format=${['%H', '%an', '%ae', '%cn', '%ce', '%B'].join(FIELD_PLACEHOLDER)}${RECORD_PLACEHOLDER}`, ...range])
    .toString('utf8')
    .split(RECORD)
    .map((record) => record.replace(/^\n/u, ''))
    .filter((record) => record !== '')
    .map((record) => {
      const [sha = '', authorName = '', authorEmail = '', committerName = '', committerEmail = '', message = ''] =
        record.split(FIELD)

      return {
        sha,
        identities: [
          { name: authorName, email: authorEmail },
          { name: committerName, email: committerEmail },
        ],
        message,
      }
    })

// The public-data findings in what a push of HEAD would publish: every blob of HEAD's tree and of each outgoing commit
// that origin's main does not already hold, under each path it has there, and each outgoing commit's message and author
// and committer identities.
const outgoingFindingsOf = (root: string): IPublicDataFinding[] => {
  const range = outgoingRangeOf(root)
  const commits = commitsOf(root, range)
  const published = publishedObjectsOf(root)
  const entries = new Map(
    ['HEAD', ...commits.map((commit) => commit.sha)]
      .flatMap((commit) => treeEntriesOf(root, commit))
      .filter((entry) => !published.has(entry.blob))
      .map((entry) => [`${entry.blob} ${entry.path}`, entry])
  )
  const bytesByBlob = blobsOf(root, [...new Set([...entries.values()].map((entry) => entry.blob))])
  const blobFindings = [...entries.values()].flatMap(({ path, blob }) => {
    const bytes = bytesByBlob.get(blob)
    if (bytes === undefined) {
      throw new Error(`git cat-file did not return blob ${blob} of ${path}`)
    }

    return findingsInFile(path, bytes).map((finding) => ({
      ...finding,
      file: `${path} (blob ${blob.slice(0, SHORT_SHA_LENGTH)})`,
    }))
  })
  const commitFindings = commits.flatMap(({ sha, identities, message }) => {
    const label = `commit ${sha.slice(0, SHORT_SHA_LENGTH)}`

    return [
      ...findingsInText(`${label} message`, message),
      ...identities.flatMap(({ name, email }) => [
        ...findingsInText(`${label} identity`, name),
        ...(NOREPLY_EMAIL.test(email) ? [] : [{ file: `${label} identity`, line: 1, rule: 'email address' as const }]),
      ]),
    ]
  })

  return [...blobFindings, ...commitFindings]
}

// The public-data findings in one scope: the checkout a build reads, the built site, or what a push would publish.
export const checkPublic = async (root: string, scope: Scope): Promise<IPublicDataFinding[]> => {
  switch (scope) {
    case 'source':
      return findingsInFiles(root, sourceFilesOf(root))
    case 'built':
      return findingsInFiles(root, await builtFilesOf(root))
    case 'outgoing':
      return outgoingFindingsOf(root)
  }
}

const isScope = (value: string | undefined): value is Scope => SCOPES.some((scope) => scope === value)

if (import.meta.main) {
  const [scope] = process.argv.slice(2)
  if (!isScope(scope)) {
    console.error(`Usage: node scripts/check-public.ts <${SCOPES.join('|')}>`)
    process.exit(1)
  }
  const findings = await checkPublic(process.cwd(), scope)
  for (const finding of findings) {
    console.error(findingLine(finding))
  }
  if (findings.length > 0) {
    console.error(`The public-data scan of ${scope} failed: ${findings.length} finding(s)`)
    process.exit(1)
  }
  console.log(`The public-data scan of ${scope} passed`)
}
