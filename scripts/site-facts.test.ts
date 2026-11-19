import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { checkPageComponents, loadSiteFacts } from './site-facts.ts'

const directories: string[] = []

const RECIPE = {
  version: 1,
  browser: 'Brave, headless',
  window: { width: 1100, height: 760, scale: 2 },
  clock: '14:14 on 19 November 2026, local time',
  data: 'Made-up docs fixtures.',
}

const HOME_CAPTURE = {
  id: 'home',
  scenario: 'home',
  page: 'home',
  region: { kind: 'element', id: 'icon' },
  file: 'captures/home.png',
  width: 2200,
  height: 1520,
  sha256: 'a'.repeat(64),
  alt: 'Misha is listening as Sam Rivera.',
  people: ['Sam Rivera'],
  text: 'Listening as Sam Rivera',
}

const factsDirectory = async (captures: readonly unknown[]): Promise<string> => {
  const facts = await mkdtemp(join(tmpdir(), 'docs-facts-'))
  directories.push(facts)
  await mkdir(join(facts, 'desktop'))
  await writeFile(join(facts, 'captures.json'), JSON.stringify({ recipe: RECIPE, captures }))
  await writeFile(
    join(facts, 'desktop', 'retention.json'),
    JSON.stringify({ outcomeDays: 30, receipts: { days: 7, isAcknowledged: true }, kinds: ['outcome'], unset: null })
  )

  return facts
}

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

describe('[scripts] Site facts - loadSiteFacts and checkPageComponents', () => {
  it('should name each scalar fact by its file path and key path, and list captures by id', async () => {
    // Act
    const site = await loadSiteFacts(await factsDirectory([HOME_CAPTURE]))

    // Assert
    expect(site).toStrictEqual({
      shots: { home: { file: 'captures/home.png', width: 2200, height: 1520, alt: 'Misha is listening as Sam Rivera.' } },
      facts: {
        'desktop.retention.outcomeDays': 30,
        'desktop.retention.receipts.days': 7,
        'desktop.retention.receipts.isAcknowledged': true,
        'desktop.retention.kinds.0': 'outcome',
      },
    })
  })

  it('should refuse a capture list that names one id twice', async () => {
    // Arrange
    const facts = await factsDirectory([HOME_CAPTURE, HOME_CAPTURE])

    // Act + Assert
    await expect(loadSiteFacts(facts)).rejects.toThrow('captures.json lists the capture home more than once')
  })

  it('should pass known components and refuse an unknown capture or fact, naming the page', async () => {
    // Arrange
    const site = await loadSiteFacts(await factsDirectory([HOME_CAPTURE]))
    const known = '<Shot id="home" caption="Home." /> kept for <Fact name="desktop.retention.outcomeDays" /> days'

    // Act + Assert
    expect(() => {
      checkPageComponents(known, 'privacy.md', site)
    }).not.toThrow()
    expect(() => {
      checkPageComponents('<Shot caption="Home." id="settings" />', 'privacy.md', site)
    }).toThrow('privacy.md shows the capture settings, which facts/captures.json does not list')
    expect(() => {
      checkPageComponents('<Fact name="desktop.retention.unset" />', 'privacy.md', site)
    }).toThrow('privacy.md asks for the fact desktop.retention.unset, which facts/ does not hold')
  })
})
