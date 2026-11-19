import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { BundleError, importDesktop } from './import-desktop.ts'
import { pngFixture } from './png-fixture.ts'

const directories: string[] = []
const HOME_PNG = pngFixture(1100, 760)
// Built from parts so this file itself passes the public-data scan.
const EMAIL = ['jonas.weber', 'shop.example'].join('@')

const sha256 = (bytes: Buffer): string => createHash('sha256').update(bytes).digest('hex')

const capturesJson = (file: string, bytes: Buffer, width = 1100): string =>
  JSON.stringify({
    captures: [
      {
        id: 'home',
        scenario: 'home',
        file,
        width,
        height: 760,
        sha256: sha256(bytes),
        alt: 'Misha is listening as Sam Rivera; Pause Misha is in the rail.',
        visibleText: 'Listening as Sam Rivera',
      },
    ],
  })

const VALID_FILES: Readonly<Record<string, string | Buffer>> = {
  'captures.json': capturesJson('home.png', HOME_PNG),
  'captures/home.png': HOME_PNG,
  'facts/commands.json': JSON.stringify({ commands: [{ name: 'pause', actor: 'owner' }] }),
  'facts/settings.json': JSON.stringify({ owner: 'Sam Rivera', personalityLimit: 500 }),
  'facts/detection.json': JSON.stringify({ items: ['claude', 'slack'] }),
  'facts/retention.json': JSON.stringify({ outcomeDays: 30 }),
  'facts/paths.json': JSON.stringify({ database: '~/.misha/misha.db' }),
  'facts/setup-commands.json': JSON.stringify({ claudeCode: '/misha-core:misha-setup' }),
}

const temporaryDirectory = async (prefix: string): Promise<string> => {
  const directory = await mkdtemp(join(tmpdir(), prefix))
  directories.push(directory)

  return directory
}

// A bundle holding the files, with a manifest hashing them unless the test supplies its own.
const writeBundle = async (
  files: Readonly<Record<string, string | Buffer>>,
  manifestFiles?: Readonly<Record<string, string>>
): Promise<string> => {
  const bundle = await temporaryDirectory('desktop-bundle-')
  const hashes = Object.fromEntries(Object.entries(files).map(([file, content]) => [file, sha256(Buffer.from(content))]))
  const manifest = { exportSchemaVersion: 1, productVersion: '0.4.0', evidenceDate: '2026-11-19', files: manifestFiles ?? hashes }
  await Promise.all(
    Object.entries({ ...files, 'manifest.json': JSON.stringify(manifest) }).map(async ([file, content]) => {
      await mkdir(dirname(join(bundle, file)), { recursive: true })
      await writeFile(join(bundle, file), content)
    })
  )

  return bundle
}

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

describe('[scripts] Import - importDesktop', () => {
  describe('success', () => {
    it('should copy facts, the capture list and PNGs, replacing the previous import', async () => {
      // Arrange
      const bundle = await writeBundle(VALID_FILES)
      const root = await temporaryDirectory('docs-root-')
      await mkdir(join(root, 'src/public/captures'), { recursive: true })
      await writeFile(join(root, 'src/public/captures/old.png'), HOME_PNG)

      // Act
      const written = await importDesktop(bundle, root)

      // Assert
      expect(written).toStrictEqual([
        'facts/captures.json',
        'facts/desktop/commands.json',
        'facts/desktop/detection.json',
        'facts/desktop/manifest.json',
        'facts/desktop/paths.json',
        'facts/desktop/retention.json',
        'facts/desktop/settings.json',
        'facts/desktop/setup-commands.json',
        'src/public/captures/home.png',
      ])
      expect(await readFile(join(root, 'src/public/captures/home.png'))).toStrictEqual(HOME_PNG)
      expect(await readFile(join(root, 'facts/desktop/retention.json'), 'utf8')).toBe('{"outcomeDays":30}')
      expect(existsSync(join(root, 'src/public/captures/old.png'))).toBe(false)
    })
  })

  describe('refusal', () => {
    it('should refuse a file the import does not know and write nothing', async () => {
      // Arrange
      const bundle = await writeBundle({ ...VALID_FILES, 'notes.txt': 'scratch' })
      const root = await temporaryDirectory('docs-root-')

      // Act + Assert
      await expect(importDesktop(bundle, root)).rejects.toStrictEqual(
        new BundleError('The bundle holds files the import does not know: notes.txt')
      )
      expect(existsSync(join(root, 'facts'))).toBe(false)
    })

    it('should refuse a symlink', async () => {
      // Arrange
      const bundle = await writeBundle(VALID_FILES)
      await symlink(join(bundle, 'captures/home.png'), join(bundle, 'captures/link.png'))

      // Act + Assert
      await expect(importDesktop(bundle, await temporaryDirectory('docs-root-'))).rejects.toStrictEqual(
        new BundleError('The bundle holds a symlink, captures/link.png')
      )
    })

    it('should refuse a missing fact file', async () => {
      // Arrange
      const { 'facts/paths.json': _paths, ...withoutPaths } = VALID_FILES
      const bundle = await writeBundle(withoutPaths)

      // Act + Assert
      await expect(importDesktop(bundle, await temporaryDirectory('docs-root-'))).rejects.toStrictEqual(
        new BundleError('The bundle lacks facts/paths.json')
      )
    })

    it('should refuse a file whose hash differs from the manifest', async () => {
      // Arrange
      const bundle = await writeBundle(VALID_FILES)
      await writeFile(join(bundle, 'facts/retention.json'), JSON.stringify({ outcomeDays: 31 }))

      // Act + Assert
      await expect(importDesktop(bundle, await temporaryDirectory('docs-root-'))).rejects.toStrictEqual(
        new BundleError('The SHA-256 of facts/retention.json differs from manifest.json')
      )
    })

    it('should refuse a manifest that hashes a file outside the bundle', async () => {
      // Arrange
      const bundle = await writeBundle(VALID_FILES, { '../outside.json': sha256(Buffer.from('{}')) })

      // Act + Assert
      await expect(importDesktop(bundle, await temporaryDirectory('docs-root-'))).rejects.toThrow(
        'manifest.json hashes ../outside.json but the bundle holds captures.json'
      )
    })

    it('should refuse a capture whose file climbs out of the captures folder', async () => {
      // Arrange
      const bundle = await writeBundle({ ...VALID_FILES, 'captures.json': capturesJson('../../evil.png', HOME_PNG) })

      // Act + Assert
      await expect(importDesktop(bundle, await temporaryDirectory('docs-root-'))).rejects.toThrow(
        'captures.json is not a valid capture list'
      )
    })

    it('should refuse a capture whose size differs from its PNG', async () => {
      // Arrange
      const bundle = await writeBundle({ ...VALID_FILES, 'captures.json': capturesJson('home.png', HOME_PNG, 1200) })

      // Act + Assert
      await expect(importDesktop(bundle, await temporaryDirectory('docs-root-'))).rejects.toStrictEqual(
        new BundleError('captures/home.png is 1100x760, not the 1200x760 captures.json says')
      )
    })

    it('should refuse a bundle that fails the public-data scan', async () => {
      // Arrange
      const settings = JSON.stringify({ owner: 'Sam Rivera', contact: EMAIL })
      const bundle = await writeBundle({ ...VALID_FILES, 'facts/settings.json': settings })

      // Act + Assert
      await expect(importDesktop(bundle, await temporaryDirectory('docs-root-'))).rejects.toStrictEqual(
        new BundleError('The bundle fails the public-data scan:\nfacts/settings.json:1 email address')
      )
    })
  })
})
