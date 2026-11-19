import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { repositoryPathOf } from './desktop-export.ts'
import { capturesJson, EXPORT_FILES, type ExportFiles, HOME_CAPTURE, withManifest, writeFiles } from './export-fixture.ts'
import { pngFixture } from './png-fixture.ts'
import { checkPageComponents, loadSiteFacts } from './site-facts.ts'

const directories: string[] = []

// A repository holding the files as the import writes them, with their manifest.
const committedRoot = async (files: ExportFiles = EXPORT_FILES): Promise<string> => {
  const root = await mkdtemp(join(tmpdir(), 'docs-root-'))
  directories.push(root)
  await writeFiles(root, withManifest(files), repositoryPathOf)
  await writeFile(join(root, 'facts/desktop/README.md'), 'Imported facts.')

  return root
}

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

describe('[scripts] Site facts - loadSiteFacts and checkPageComponents', () => {
  it('should name each scalar fact by its document and key path, an item with a key by its key, and list captures by id', async () => {
    // Act
    const site = await loadSiteFacts(await committedRoot())

    // Assert
    expect(site.shots).toStrictEqual({
      home: { file: 'captures/home.png', width: 1100, height: 760, alt: HOME_CAPTURE.alt },
    })
    expect(site.facts).toMatchObject({
      'desktop.retention.stores.outcomes.keptDays': 30,
      'desktop.detection.items.git.isRequired': true,
      'desktop.manifest.productVersion': '0.1.0',
    })
    expect(site.facts['desktop.detection.items.git.signIn']).toBeUndefined()
    expect(site.facts['desktop.retention.stores.0.keptDays']).toBeUndefined()
  })

  it('should refuse a committed capture whose bytes were replaced after the import', async () => {
    // Arrange
    const root = await committedRoot()
    await writeFile(join(root, 'src/public/captures/home.png'), pngFixture(1100, 760, [{ type: 'sRGB', data: Buffer.from([0]) }]))

    // Act + Assert
    await expect(loadSiteFacts(root)).rejects.toThrow(
      'The committed desktop export in facts/ and src/public/captures/ fails its check: The size or SHA-256 of captures/home.png differs from manifest.json'
    )
  })

  it('should refuse a file in facts/ or src/public/captures/ that the export does not hold', async () => {
    // Arrange
    const withProductFacts = await committedRoot()
    await writeFile(join(withProductFacts, 'facts/product-status.json'), '{}')
    const withExtraCapture = await committedRoot()
    await writeFile(join(withExtraCapture, 'src/public/captures/extra.png'), pngFixture(1, 1))

    // Act + Assert
    await expect(loadSiteFacts(withProductFacts)).rejects.toThrow(
      'facts/ holds product-status.json, which is neither the desktop export, the browser facts nor the reviewed records'
    )
    await expect(loadSiteFacts(withExtraCapture)).rejects.toThrow('manifest.json lists')
  })

  it('should refuse a capture list that names one id twice', async () => {
    // Arrange
    const root = await committedRoot({ ...EXPORT_FILES, 'captures.json': capturesJson([HOME_CAPTURE, HOME_CAPTURE]) })

    // Act + Assert
    await expect(loadSiteFacts(root)).rejects.toThrow('captures.json lists the capture home more than once')
  })

  it('should refuse an array whose items repeat an id, since a fact named by that id would be ambiguous', async () => {
    // Arrange
    const store = { id: 'outcomes', keptDays: 30, description: 'How the clone closed each message.' }
    const retention = {
      rule: 'Deleted when the app starts.',
      stores: [store, { ...store, keptDays: 7 }],
      overwrittenBatches: { kept: 10, description: 'What the installers moved aside.' },
    }
    const root = await committedRoot({ ...EXPORT_FILES, 'facts/retention.json': JSON.stringify(retention) })

    // Act + Assert
    await expect(loadSiteFacts(root)).rejects.toThrow('desktop.retention.stores holds the id outcomes more than once')
  })

  it('should pass known components and refuse an unknown capture or fact, naming the page', async () => {
    // Arrange
    const site = await loadSiteFacts(await committedRoot())
    const known = '<Shot id="home" caption="Home." /> kept for <Fact name="desktop.retention.stores.outcomes.keptDays" /> days'

    // Act + Assert
    expect(() => {
      checkPageComponents(known, 'privacy.md', site)
    }).not.toThrow()
    expect(() => {
      checkPageComponents('<Shot caption="Home." id="settings" />', 'privacy.md', site)
    }).toThrow('privacy.md shows the capture settings, which facts/captures.json does not list')
    expect(() => {
      checkPageComponents('<Fact name="desktop.detection.items.git.signIn" />', 'privacy.md', site)
    }).toThrow('privacy.md asks for the fact desktop.detection.items.git.signIn, which facts/ does not hold')
  })
})
