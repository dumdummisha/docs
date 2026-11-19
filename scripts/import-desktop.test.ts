import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { BundleError } from './desktop-export.ts'
import {
  capturesJson,
  EXPORT_FILES,
  type ExportFiles,
  HOME_CAPTURE,
  HOME_PNG,
  type IManifestEntry,
  sha256,
  withManifest,
  writeFiles,
} from './export-fixture.ts'
import { importDesktop } from './import-desktop.ts'

const directories: string[] = []
// Built from parts so this file itself passes the public-data scan.
const EMAIL = ['jonas.weber', 'shop.example'].join('@')
const OUTSIDER = ['Alex', 'Morgan'].join(' ')

const temporaryDirectory = async (prefix: string): Promise<string> => {
  const directory = await mkdtemp(join(tmpdir(), prefix))
  directories.push(directory)

  return directory
}

// A bundle holding the files, with a manifest listing them unless the test supplies its own list.
const writeBundle = async (files: ExportFiles, listed?: readonly IManifestEntry[]): Promise<string> => {
  const bundle = await temporaryDirectory('desktop-bundle-')
  await writeFiles(bundle, withManifest(files, listed))

  return bundle
}

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

describe('[scripts] Import - importDesktop', () => {
  describe('success', () => {
    it('should copy facts, the capture list and PNGs, replacing the previous import', async () => {
      // Arrange
      const bundle = await writeBundle(EXPORT_FILES)
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
      expect(await readFile(join(root, 'facts/desktop/retention.json'), 'utf8')).toBe(EXPORT_FILES['facts/retention.json'])
      expect(existsSync(join(root, 'src/public/captures/old.png'))).toBe(false)
    })
  })

  describe('refusal', () => {
    it('should refuse a file the import does not know and write nothing', async () => {
      // Arrange
      const bundle = await writeBundle({ ...EXPORT_FILES, 'notes.txt': 'scratch' })
      const root = await temporaryDirectory('docs-root-')

      // Act + Assert
      await expect(importDesktop(bundle, root)).rejects.toStrictEqual(
        new BundleError('The bundle holds files the import does not know: notes.txt')
      )
      expect(existsSync(join(root, 'facts'))).toBe(false)
    })

    it('should refuse a symlink', async () => {
      // Arrange
      const bundle = await writeBundle(EXPORT_FILES)
      await symlink(join(bundle, 'captures/home.png'), join(bundle, 'captures/link.png'))

      // Act + Assert
      await expect(importDesktop(bundle, await temporaryDirectory('docs-root-'))).rejects.toStrictEqual(
        new BundleError('The bundle holds a symlink, captures/link.png')
      )
    })

    it('should refuse a missing fact file', async () => {
      // Arrange
      const { 'facts/paths.json': _paths, ...withoutPaths } = EXPORT_FILES
      const bundle = await writeBundle(withoutPaths)

      // Act + Assert
      await expect(importDesktop(bundle, await temporaryDirectory('docs-root-'))).rejects.toStrictEqual(
        new BundleError('The bundle lacks facts/paths.json')
      )
    })

    it('should refuse a file whose hash differs from the manifest', async () => {
      // Arrange
      const bundle = await writeBundle(EXPORT_FILES)
      await writeFile(join(bundle, 'facts/retention.json'), '{}')

      // Act + Assert
      await expect(importDesktop(bundle, await temporaryDirectory('docs-root-'))).rejects.toStrictEqual(
        new BundleError('The size or SHA-256 of facts/retention.json differs from manifest.json')
      )
    })

    it('should refuse a manifest that hashes a file outside the bundle', async () => {
      // Arrange
      const bundle = await writeBundle(EXPORT_FILES, [{ path: '../outside.json', bytes: 2, sha256: sha256(Buffer.from('{}')) }])

      // Act + Assert
      await expect(importDesktop(bundle, await temporaryDirectory('docs-root-'))).rejects.toThrow(
        'manifest.json lists ../outside.json but the bundle holds captures.json'
      )
    })

    it('should refuse a manifest whose digest does not match its file list', async () => {
      // Arrange
      const bundle = await writeBundle(EXPORT_FILES)
      const manifest = JSON.parse(await readFile(join(bundle, 'manifest.json'), 'utf8')) as Record<string, unknown>
      await writeFile(join(bundle, 'manifest.json'), JSON.stringify({ ...manifest, digest: 'f'.repeat(64) }))

      // Act + Assert
      await expect(importDesktop(bundle, await temporaryDirectory('docs-root-'))).rejects.toStrictEqual(
        new BundleError('The digest in manifest.json does not match its file list')
      )
    })

    it('should refuse a fact file with a field its schema does not hold, even with valid hashes', async () => {
      // Arrange
      const settings = JSON.parse(String(EXPORT_FILES['facts/settings.json'])) as Record<string, unknown>
      const bundle = await writeBundle({ ...EXPORT_FILES, 'facts/settings.json': JSON.stringify({ ...settings, accountNumber: 4021 }) })

      // Act + Assert
      await expect(importDesktop(bundle, await temporaryDirectory('docs-root-'))).rejects.toThrow(
        'facts/settings.json does not match its schema'
      )
    })

    it('should refuse a capture whose file climbs out of the captures folder', async () => {
      // Arrange
      const capture = { ...HOME_CAPTURE, file: 'captures/../../evil.png' }
      const bundle = await writeBundle({ ...EXPORT_FILES, 'captures.json': capturesJson([capture]) })

      // Act + Assert
      await expect(importDesktop(bundle, await temporaryDirectory('docs-root-'))).rejects.toThrow(
        'captures.json does not match its schema'
      )
    })

    it('should refuse a capture whose text names someone outside the cast', async () => {
      // Arrange
      const capture = { ...HOME_CAPTURE, text: `Listening as Sam Rivera, answering ${OUTSIDER}` }
      const bundle = await writeBundle({ ...EXPORT_FILES, 'captures.json': capturesJson([capture]) })

      // Act + Assert
      await expect(importDesktop(bundle, await temporaryDirectory('docs-root-'))).rejects.toStrictEqual(
        new BundleError('The bundle fails the public-data scan:\nfacts/captures.json:1 unapproved name-shaped phrase')
      )
    })

    it('should refuse a capture whose size differs from its PNG', async () => {
      // Arrange
      const capture = { ...HOME_CAPTURE, width: 1200 }
      const bundle = await writeBundle({ ...EXPORT_FILES, 'captures.json': capturesJson([capture]) })

      // Act + Assert
      await expect(importDesktop(bundle, await temporaryDirectory('docs-root-'))).rejects.toStrictEqual(
        new BundleError('captures/home.png is 1100x760, not the 1200x760 captures.json says')
      )
    })

    it('should refuse a bundle that fails the public-data scan, naming the repository path', async () => {
      // Arrange
      const paths = JSON.parse(String(EXPORT_FILES['facts/paths.json'])) as Record<string, unknown>
      const bundle = await writeBundle({ ...EXPORT_FILES, 'facts/paths.json': JSON.stringify({ ...paths, rule: `Ask ${EMAIL}.` }) })

      // Act + Assert
      await expect(importDesktop(bundle, await temporaryDirectory('docs-root-'))).rejects.toStrictEqual(
        new BundleError('The bundle fails the public-data scan:\nfacts/desktop/paths.json:1 email address')
      )
    })
  })
})
