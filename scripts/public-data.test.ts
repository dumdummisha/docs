import { deflateSync } from 'node:zlib'

import { describe, expect, it } from 'vitest'

import { pngFixture } from './png-fixture.ts'
import { findingsInFile } from './public-data.ts'

// Built from parts so this file itself passes the scan it tests.
const EMAIL = ['priya.nair', 'shop.example'].join('@')
const HOME_PATH = ['', 'Users', 'sam', 'notes.md'].join('/')
const SLACK_ID = ['U', '024BE7LH9'].join('')
const TRACKER_URL = ['https:', '', 'tracker.example', 'pixel.gif'].join('/')
const OTHER_ORG_URL = ['https:', '', 'github.com', 'someone-else', 'misha'].join('/')

const text = (value: string): Buffer => Buffer.from(value, 'utf8')

describe('[scripts] Public data - findingsInFile', () => {
  it('should pass the cast, approved URLs and ordinary capitals', () => {
    // Arrange
    const markdown = [
      'Sam Rivera asked Priya Nair and Jonas Weber in #shop-backend.',
      'Read https://docs.dumdummisha.ai/privacy and https://github.com/dumdummisha/misha.',
      'TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION',
    ].join('\n')
    const json = JSON.stringify({ owner: 'Sam Rivera', colleagues: ['Priya Nair', 'Jonas'], name: 'pause' })

    // Act
    const findings = [...findingsInFile('src/page.md', text(markdown)), ...findingsInFile('facts/x.json', text(json))]

    // Assert
    expect(findings).toStrictEqual([])
  })

  it('should fail an email address, a home path, a Slack id and unapproved URLs, each on its line', () => {
    // Arrange
    const markdown = [`Mail ${EMAIL}.`, `Open ${HOME_PATH}.`, `Thread from ${SLACK_ID}.`, TRACKER_URL, OTHER_ORG_URL].join('\n')

    // Act
    const findings = findingsInFile('src/page.md', text(markdown))

    // Assert
    expect(findings).toStrictEqual([
      { file: 'src/page.md', line: 1, rule: 'email address' },
      { file: 'src/page.md', line: 2, rule: 'home path' },
      { file: 'src/page.md', line: 3, rule: 'Slack id' },
      { file: 'src/page.md', line: 4, rule: 'unapproved URL' },
      { file: 'src/page.md', line: 5, rule: 'unapproved URL' },
    ])
  })

  it('should fail a build-only URL outside the built assets', () => {
    // Arrange
    const markdown = ['https:', '', 'a.com', ''].join('/')

    // Act
    const findings = findingsInFile('src/page.md', text(markdown))

    // Assert
    expect(findings).toStrictEqual([{ file: 'src/page.md', line: 1, rule: 'unapproved URL' }])
  })

  it('should fail a person field outside the cast in JSON', () => {
    // Arrange
    const json = JSON.stringify({ owner: 'Sam Rivera', requesters: ['Priya Nair', 'Alex Morgan'] }, null, 2)

    // Act
    const findings = findingsInFile('facts/desktop/settings.json', text(json))

    // Assert
    expect(findings).toStrictEqual([{ file: 'facts/desktop/settings.json', line: 5, rule: 'person outside the cast' }])
  })

  it('should fail an email address in each kind of PNG text chunk', () => {
    // Arrange
    const png = pngFixture(4, 4, [
      { type: 'tEXt', data: Buffer.from(`Author\0${EMAIL}`, 'latin1') },
      { type: 'zTXt', data: Buffer.concat([Buffer.from('Comment\0\0', 'latin1'), deflateSync(Buffer.from(HOME_PATH))]) },
      { type: 'iTXt', data: Buffer.from(`Source\0\0\0en\0\0${SLACK_ID}`, 'utf8') },
    ])

    // Act
    const findings = findingsInFile('src/public/captures/home.png', png)

    // Assert
    expect(findings).toStrictEqual([
      { file: 'src/public/captures/home.png', line: 1, rule: 'email address' },
      { file: 'src/public/captures/home.png', line: 1, rule: 'home path' },
      { file: 'src/public/captures/home.png', line: 1, rule: 'Slack id' },
    ])
  })

  it('should pass a PNG without text chunks and a font', () => {
    // Act
    const findings = [
      ...findingsInFile('src/public/app-icon-512.png', pngFixture(512, 512)),
      ...findingsInFile('src/public/fonts/figtree.woff2', Buffer.from([0x77, 0x4f, 0x46, 0x32, 0, 0, 1])),
    ]

    // Assert
    expect(findings).toStrictEqual([])
  })

  it('should fail an unexpected binary file, a broken PNG and invalid JSON', () => {
    // Act
    const findings = [
      ...findingsInFile('src/public/archive.bin', Buffer.from([1, 0, 2])),
      ...findingsInFile('src/public/captures/broken.png', Buffer.from('not a png')),
      ...findingsInFile('facts/desktop/paths.json', text('{ "unclosed": ')),
    ]

    // Assert
    expect(findings).toStrictEqual([
      { file: 'src/public/archive.bin', line: 1, rule: 'unexpected binary file' },
      { file: 'src/public/captures/broken.png', line: 1, rule: 'unreadable file' },
      { file: 'facts/desktop/paths.json', line: 1, rule: 'unreadable file' },
    ])
  })
})
