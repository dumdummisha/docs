import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { checkLinks } from './check-links.ts'

const directories: string[] = []

const builtSite = async (files: Readonly<Record<string, string>>): Promise<string> => {
  const built = await mkdtemp(join(tmpdir(), 'docs-links-'))
  directories.push(built)
  await Promise.all(
    Object.entries(files).map(async ([file, content]) => {
      await mkdir(dirname(join(built, file)), { recursive: true })
      await writeFile(join(built, file), content)
    })
  )

  return built
}

const DECIDE_PAGE = '<h1 id="decide">Decide</h1><h2 id="what-it-costs">What it costs</h2>'

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

describe('[scripts] Links - checkLinks', () => {
  it('should pass clean URLs, folder indexes, anchors, same-page anchors, assets and external links', async () => {
    // Arrange
    const built = await builtSite({
      'index.html': [
        '<a href="#VPContent">Skip</a><main id="VPContent">',
        '<a href="/start/decide">Decide</a> <a href="/start/decide#what-it-costs">Cost</a>',
        '<a href="/reference/">Reference</a> <a href="./start/decide.html">Old style</a>',
        '<img src="/logo.svg" alt=""> <script src="/assets/app.js"></script>',
        '<a href="https://github.com/dumdummisha/misha">GitHub</a> <a href="mailto:x">Mail</a>',
      ].join('\n'),
      'start/decide.html': DECIDE_PAGE,
      'reference/index.html': '<h1 id="reference">Reference</h1>',
      'logo.svg': '<svg/>',
      'assets/app.js': '',
    })

    // Act
    const findings = await checkLinks(built)

    // Assert
    expect(findings).toStrictEqual([])
  })

  it('should fail a missing page, a missing anchor, a missing same-page anchor and a missing asset', async () => {
    // Arrange
    const built = await builtSite({
      'index.html': [
        '<a href="/start/decid">Typo</a>',
        '<a href="/start/decide#what-it-cost">Wrong anchor</a>',
        '<a href="#nowhere">Same page</a>',
        '<img src="/captures/home.png" alt="">',
      ].join('\n'),
      'start/decide.html': DECIDE_PAGE,
    })

    // Act
    const findings = await checkLinks(built)

    // Assert
    expect(findings).toStrictEqual([
      { page: 'index.html', target: '/start/decid', problem: 'missing page or file' },
      { page: 'index.html', target: '/start/decide#what-it-cost', problem: 'missing anchor' },
      { page: 'index.html', target: '#nowhere', problem: 'missing anchor' },
      { page: 'index.html', target: '/captures/home.png', problem: 'missing page or file' },
    ])
  })
})
