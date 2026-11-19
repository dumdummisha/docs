import { execFileSync } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { checkPublic } from './check-public.ts'

const directories: string[] = []
// Built from parts so this file itself passes the public-data scan.
const EMAIL = ['priya.nair', 'shop.example'].join('@')
const NOREPLY = ['1+sam-rivera', 'users.noreply.github.com'].join('@')

const git = (root: string, args: readonly string[], email = NOREPLY): string =>
  execFileSync('git', ['-c', 'user.name=Leo Novak', '-c', `user.email=${email}`, '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', ...args], {
    cwd: root,
    encoding: 'utf8',
  })

const repository = async (): Promise<string> => {
  const root = await mkdtemp(join(tmpdir(), 'docs-git-'))
  directories.push(root)
  git(root, ['init', '-q', '-b', 'main'])

  return root
}

const commit = async (root: string, file: string, content: string, message: string, email?: string): Promise<string> => {
  await writeFile(join(root, file), content)
  git(root, ['add', '-A'])
  git(root, ['commit', '-q', '-m', message], email)

  return git(root, ['rev-parse', 'HEAD']).trim()
}

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

describe('[scripts] Public check - checkPublic outgoing', () => {
  it('should find a value committed and then removed, and a commit that is not on origin', async () => {
    // Arrange
    const root = await repository()
    await commit(root, 'page.md', `Mail ${EMAIL}`, 'docs: add the page')
    await commit(root, 'page.md', 'Mail Leo Novak', 'docs: drop the address')

    // Act
    const findings = await checkPublic(root, 'outgoing')

    // Assert
    expect(findings).toStrictEqual([{ file: expect.stringMatching(/^page\.md \(blob [0-9a-f]{7}\)$/u), line: 1, rule: 'email address' }])
  })

  it('should skip commits origin already has and scan what is new, its message and its identities', async () => {
    // Arrange
    const root = await repository()
    const published = await commit(root, 'page.md', `Mail ${EMAIL}`, 'docs: add the page')
    git(root, ['update-ref', 'refs/remotes/origin/main', published])
    await writeFile(join(root, 'page.md'), 'Mail Leo Novak')
    const outgoing = await commit(root, 'other.md', 'Hello', `docs: thanks ${EMAIL}`, EMAIL)

    // Act
    const findings = await checkPublic(root, 'outgoing')

    // Assert
    const label = `commit ${outgoing.slice(0, 7)}`
    expect(findings).toStrictEqual([
      { file: `${label} message`, line: 1, rule: 'email address' },
      { file: `${label} identity`, line: 1, rule: 'email address' },
      { file: `${label} identity`, line: 1, rule: 'email address' },
    ])
  })

  it('should skip a blob origin already holds, even in an outgoing tree, and scan a new one beside it', async () => {
    // Arrange
    const root = await repository()
    const published = await commit(root, 'page.md', `Mail ${EMAIL}`, 'docs: add the page')
    git(root, ['update-ref', 'refs/remotes/origin/main', published])
    await commit(root, 'other.md', `Ask ${EMAIL}`, 'docs: add another page')

    // Act
    const findings = await checkPublic(root, 'outgoing')

    // Assert
    expect(findings).toStrictEqual([{ file: expect.stringMatching(/^other\.md \(blob [0-9a-f]{7}\)$/u), line: 1, rule: 'email address' }])
  })

  it('should not scan an uncommitted working-tree file', async () => {
    // Arrange
    const root = await repository()
    await commit(root, 'page.md', 'Mail Leo Novak', 'docs: add the page')
    await writeFile(join(root, 'draft.md'), `Mail ${EMAIL}`)

    // Act
    const findings = await checkPublic(root, 'outgoing')

    // Assert
    expect(findings).toStrictEqual([])
  })
})
