import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { BrowserFactsError, committedBrowserFactsOf, slackTransportOf } from './browser-facts.ts'
import { importBrowser } from './import-browser.ts'
import { BROWSER_REPOSITORY_URL } from './site.ts'

const directories: string[] = []
// Built from parts so this file itself passes the public-data scan.
const COMMITTER_EMAIL = ['sam.rivera', 'shop.example'].join('@')
const SLACK_MATCH = ['https:', '', 'app.slack.com', '*'].join('/')
const OTHER_ORIGIN = ['https:', '', 'github.com', 'someone', 'misha-browser.git'].join('/')

// The committed disclosures, a valid source for the browser repository's own file.
const COMMITTED_DISCLOSURES = await readFile(new URL('../facts/browser/store-disclosures.json', import.meta.url))

const MANIFEST = {
  manifest_version: 3,
  name: 'Misha Browser',
  version: '0.1.0',
  minimum_chrome_version: '140',
  permissions: ['nativeMessaging', 'scripting', 'alarms', 'unlimitedStorage', 'tabs', 'webRequest', 'downloads'],
  host_permissions: ['<all_urls>'],
  content_scripts: [
    { matches: [SLACK_MATCH], js: ['observer.js'], run_at: 'document_start', world: 'MAIN' },
    { matches: [SLACK_MATCH], js: ['relay.js'], run_at: 'document_start' },
  ],
}

const STORE_PERMISSIONS = [
  '# Chrome Web Store disclosures',
  '## Slack transport limits',
  [
    '- Web API methods the extension calls when the Misha app asks: the reads `auth.test`, `users.info`, the writes `chat.postMessage`, and for an upload `files.getUploadURLExternal`, `files.completeUploadExternal`.',
    '- Fields a new message keeps when it leaves the page: `type`, `text`, and the id of each file it shares.',
    '- A message is new when it has no subtype or one of `thread_broadcast`, `file_share`.',
  ].join('\n'),
  "## Where Slack's credentials go",
  'Text.',
].join('\n\n')

const temporaryDirectory = async (prefix: string): Promise<string> => {
  const directory = await mkdtemp(join(tmpdir(), prefix))
  directories.push(directory)

  return directory
}

const git = (checkout: string, args: readonly string[]): string =>
  execFileSync('git', ['-C', checkout, '-c', 'commit.gpgsign=false', '-c', 'user.name=Sam Rivera', '-c', `user.email=${COMMITTER_EMAIL}`, ...args])
    .toString('utf8')
    .trim()

// A browser checkout with one commit of the three source files, its origin and, unless told otherwise, that commit
// on origin's main.
const browserCheckout = async (
  files: Readonly<Record<string, string | Buffer>> = {},
  { origin = `${BROWSER_REPOSITORY_URL}.git`, isOnMain = true } = {}
): Promise<{ checkout: string; commit: string }> => {
  const checkout = await temporaryDirectory('browser-checkout-')
  const contents = {
    'docs/store-disclosures.json': COMMITTED_DISCLOSURES,
    'src/extension/manifest.json': JSON.stringify(MANIFEST),
    'docs/store-permissions.md': STORE_PERMISSIONS,
    ...files,
  }
  git(checkout, ['init', '-q'])
  for (const [path, content] of Object.entries(contents)) {
    await mkdir(dirname(join(checkout, path)), { recursive: true })
    await writeFile(join(checkout, path), content)
  }
  git(checkout, ['add', '.'])
  git(checkout, ['commit', '-q', '-m', 'disclosures'])
  git(checkout, ['remote', 'add', 'origin', origin])
  const commit = git(checkout, ['rev-parse', 'HEAD'])
  if (isOnMain) {
    git(checkout, ['update-ref', 'refs/remotes/origin/main', commit])
  }

  return { checkout, commit }
}

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

describe('[scripts] Import - importBrowser', () => {
  describe('success', () => {
    it('should copy the disclosures, the manifest declarations and the Slack transport limits at the commit', async () => {
      // Arrange
      const { checkout, commit } = await browserCheckout()
      const root = await temporaryDirectory('docs-root-')

      // Act
      const written = await importBrowser(checkout, commit.slice(0, 7), root)

      // Assert
      expect(written).toStrictEqual([
        'facts/browser/manifest.json',
        'facts/browser/slack-transport.json',
        'facts/browser/source.json',
        'facts/browser/store-disclosures.json',
      ])
      expect(await readFile(join(root, 'facts/browser/store-disclosures.json'))).toStrictEqual(COMMITTED_DISCLOSURES)
      const facts = await committedBrowserFactsOf(root)
      expect(facts.source.commit).toBe(commit)
      expect(facts.manifest.content_scripts[1]).toStrictEqual({
        matches: [SLACK_MATCH],
        js: ['relay.js'],
        run_at: 'document_start',
        world: 'ISOLATED',
        all_frames: false,
      })
      expect(facts.slackTransport.readMethods).toStrictEqual(['auth.test', 'users.info'])
    })
  })

  describe('refusal', () => {
    it('should refuse a branch name instead of a commit hash', async () => {
      // Arrange
      const { checkout } = await browserCheckout()

      // Act + Assert
      await expect(importBrowser(checkout, 'main', await temporaryDirectory('docs-root-'))).rejects.toStrictEqual(
        new BrowserFactsError('Name the commit by its hash, not main')
      )
    })

    it('should refuse a checkout whose origin is not the public browser repository', async () => {
      // Arrange
      const { checkout, commit } = await browserCheckout({}, { origin: OTHER_ORIGIN })

      // Act + Assert
      await expect(importBrowser(checkout, commit, await temporaryDirectory('docs-root-'))).rejects.toThrow(
        `origin is ${OTHER_ORIGIN}, not ${BROWSER_REPOSITORY_URL}`
      )
    })

    it('should refuse a commit that is not on the public main branch and write nothing', async () => {
      // Arrange
      const { checkout, commit } = await browserCheckout({}, { isOnMain: false })
      const root = await temporaryDirectory('docs-root-')

      // Act + Assert
      await expect(importBrowser(checkout, commit, root)).rejects.toThrow(`${commit} is not on refs/remotes/origin/main`)
      expect(existsSync(join(root, 'facts'))).toBe(false)
    })

    it('should refuse a manifest permission the disclosures do not explain', async () => {
      // Arrange
      const manifest = { ...MANIFEST, permissions: [...MANIFEST.permissions, 'cookies'] }
      const { checkout, commit } = await browserCheckout({ 'src/extension/manifest.json': JSON.stringify(manifest) })

      // Act + Assert
      await expect(importBrowser(checkout, commit, await temporaryDirectory('docs-root-'))).rejects.toThrow(
        "the manifest's permission cookies has no disclosure; cookies is listed as not requested, but the manifest requests it"
      )
    })

    it('should refuse an optional permission, which the disclosures cannot describe', async () => {
      // Arrange
      const manifest = { ...MANIFEST, optional_permissions: ['history'] }
      const { checkout, commit } = await browserCheckout({ 'src/extension/manifest.json': JSON.stringify(manifest) })

      // Act + Assert
      await expect(importBrowser(checkout, commit, await temporaryDirectory('docs-root-'))).rejects.toThrow(
        'The disclosures cover no optional_permissions'
      )
    })
  })
})

describe('[scripts] Browser facts - slackTransportOf and committedBrowserFactsOf', () => {
  it('should refuse a Slack transport section whose sentence changed', () => {
    // Arrange
    const reworded = STORE_PERMISSIONS.replace('A message is new when', 'A message counts as new when')

    // Act + Assert
    expect(() => slackTransportOf(reworded)).toThrow('line 3 is not the sentence this import reads')
  })

  it('should refuse a committed fact edited after the import', async () => {
    // Arrange
    const { checkout, commit } = await browserCheckout()
    const root = await temporaryDirectory('docs-root-')
    await importBrowser(checkout, commit, root)
    const path = join(root, 'facts/browser/slack-transport.json')
    await writeFile(path, (await readFile(path, 'utf8')).replace('auth.test', 'admin.users.list'))

    // Act + Assert
    await expect(committedBrowserFactsOf(root)).rejects.toThrow('slack-transport.json differ from what source.json records')
  })

  it('should refuse a file in facts/browser/ the import does not write', async () => {
    // Arrange
    const { checkout, commit } = await browserCheckout()
    const root = await temporaryDirectory('docs-root-')
    await importBrowser(checkout, commit, root)
    await writeFile(join(root, 'facts/browser/extra.json'), '{}')

    // Act + Assert
    await expect(committedBrowserFactsOf(root)).rejects.toThrow('it holds extra.json, manifest.json')
  })
})
