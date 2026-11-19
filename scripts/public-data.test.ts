import { readFile } from 'node:fs/promises'

import { describe, expect, it } from 'vitest'

import { pngFixture } from './png-fixture.ts'
import { findingsInFile } from './public-data.ts'

// Built from parts so this file itself passes the scan it tests.
const EMAIL = ['priya.nair', 'shop.example'].join('@')
const HOME_PATH = ['', 'Users', 'sam', 'notes.md'].join('/')
const SLACK_ID = ['U', '024BE7LH9'].join('')
const LETTERS_SLACK_ID = ['U', 'ABCDEFGH'].join('')
const SLACK_MENTION = ['<', '@U12', '>'].join('')
const LICENCE_WORD = ['CONDI', 'TIONS'].join('')
const OUTSIDER = ['Alex', 'Morgan'].join(' ')
const SLACK_TOKEN = ['xoxb', '1234-abcd'].join('-')
const SIGNING_IDENTITY = ['Developer ID', 'Application: Shop'].join(' ')
const TRACKER_URL = ['https:', '', 'tracker.example', 'pixel.gif'].join('/')
const PRIVATE_REPOSITORY_URL = ['https:', '', 'github.com', 'dumdummisha', 'misha-desktop'].join('/')
const QUERY_URL = ['https:', '', 'docs.dumdummisha.ai', 'privacy?ref=mail'].join('/')
const CREDENTIALS_URL = ['https:', '', ['sam:secret', 'docs.dumdummisha.ai'].join('@'), 'privacy'].join('/')
const SCHEME_RELATIVE_URL = ['', '', 'private.example', 'path'].join('/')
const UPPERCASE_URL = ['HTTPS:', '', 'private.example', 'path'].join('/')
const ESCAPED_AT = ['\\', 'u0040'].join('')

const text = (value: string): Buffer => Buffer.from(value, 'utf8')

describe('[scripts] Public data - findingsInFile', () => {
  describe('text', () => {
    it('should pass the cast, approved URLs, licence words in licence files and ordinary capitals', async () => {
      // Arrange
      const markdown = [
        'Sam Rivera asked Priya Nair and Jonas Weber in #shop-backend; ask @Jonas Weber or @Priya.',
        'Read https://docs.dumdummisha.ai/privacy#data, https://github.com/dumdummisha/misha/edit/main/src/index.md and',
        'https://github.com/dumdummisha/misha-browser. SHOP-142 IS DONE.',
      ].join('\n')

      // Act
      const findings = [
        ...findingsInFile('src/page.md', text(markdown)),
        ...findingsInFile('LICENSE', text(`TERMS AND ${LICENCE_WORD}`)),
        ...findingsInFile('src/public/fonts/OFL-figtree.txt', text(`TERMS AND ${LICENCE_WORD}`)),
        ...findingsInFile('src/public/fonts/figtree-400-800.woff2', await readFile('src/public/fonts/figtree-400-800.woff2')),
      ]

      // Assert
      expect(findings).toStrictEqual([])
    })

    it('should fail each private value on its line', () => {
      // Arrange
      const markdown = [
        `Mail ${EMAIL}.`,
        `Open ${HOME_PATH}.`,
        `Thread from ${SLACK_ID}.`,
        `Thread from ${LETTERS_SLACK_ID}.`,
        `Mention ${SLACK_MENTION}.`,
        `Token ${SLACK_TOKEN}, signed by ${SIGNING_IDENTITY}.`,
        `Ask @${OUTSIDER}.`,
        `The licence says ${LICENCE_WORD}.`,
      ].join('\n')

      // Act
      const findings = findingsInFile('src/page.md', text(markdown))

      // Assert
      expect(findings).toStrictEqual([
        { file: 'src/page.md', line: 1, rule: 'email address' },
        { file: 'src/page.md', line: 2, rule: 'home path' },
        { file: 'src/page.md', line: 3, rule: 'Slack id' },
        { file: 'src/page.md', line: 4, rule: 'Slack id' },
        { file: 'src/page.md', line: 8, rule: 'Slack id' },
        { file: 'src/page.md', line: 5, rule: 'Slack id' },
        { file: 'src/page.md', line: 6, rule: 'credential' },
        { file: 'src/page.md', line: 6, rule: 'credential' },
        { file: 'src/page.md', line: 7, rule: 'person outside the cast' },
      ])
    })

    it('should fail a Slack mention even in a licence file', () => {
      // Act
      const findings = findingsInFile('LICENSE', text(`${LICENCE_WORD} ${SLACK_MENTION}`))

      // Assert
      expect(findings).toStrictEqual([{ file: 'LICENSE', line: 1, rule: 'Slack id' }])
    })

    it('should fail unapproved URLs in every form, and a build-only URL outside the built assets', () => {
      // Arrange
      const markdown = [
        TRACKER_URL,
        PRIVATE_REPOSITORY_URL,
        QUERY_URL,
        CREDENTIALS_URL,
        `See ${SCHEME_RELATIVE_URL}.`,
        UPPERCASE_URL,
        ['http:', '', 'a.com', ''].join('/'),
      ].join('\n')

      // Act
      const findings = findingsInFile('src/page.md', text(markdown))

      // Assert
      expect(findings).toStrictEqual([
        { file: 'src/page.md', line: 4, rule: 'email address' },
        { file: 'src/page.md', line: 1, rule: 'unapproved URL' },
        { file: 'src/page.md', line: 2, rule: 'unapproved URL' },
        { file: 'src/page.md', line: 3, rule: 'unapproved URL' },
        { file: 'src/page.md', line: 4, rule: 'URL credentials' },
        { file: 'src/page.md', line: 6, rule: 'unapproved URL' },
        { file: 'src/page.md', line: 7, rule: 'unapproved URL' },
        { file: 'src/page.md', line: 5, rule: 'unapproved URL' },
      ])
    })

    it('should decode character references in markup and escapes in scripts before scanning', () => {
      // Arrange
      const html = `<p>Mail priya&#64;shop.example or <a href="https:&sol;&sol;tracker.example">here</a></p>`
      const script = `const contact = 'priya${ESCAPED_AT}shop.example'`

      // Act
      const findings = [...findingsInFile('.vitepress/dist/index.html', text(html)), ...findingsInFile('.vitepress/dist/assets/app.js', text(script))]

      // Assert
      expect(findings).toStrictEqual([
        { file: '.vitepress/dist/index.html', line: 1, rule: 'email address' },
        { file: '.vitepress/dist/index.html', line: 1, rule: 'unapproved URL' },
        { file: '.vitepress/dist/assets/app.js', line: 1, rule: 'email address' },
      ])
    })
  })

  describe('JSON', () => {
    it('should pass the cast under person keys, role ids at their locations and reviewed phrases', () => {
      // Arrange
      const commands = JSON.stringify({
        senders: [{ id: 'owner', description: 'The person whose clone it is.' }],
        commands: [{ id: 'pause', sender: 'owner', example: 'allow @Priya Nair' }],
      })
      const captures = JSON.stringify({
        captures: [{ people: ['Sam Rivera'], alt: 'Home while Misha listens as Sam Rivera.', text: 'Pause Misha\nClaude Code' }],
      })

      // Act
      const findings = [
        ...findingsInFile('facts/desktop/commands.json', text(commands)),
        ...findingsInFile('facts/captures.json', text(captures)),
      ]

      // Assert
      expect(findings).toStrictEqual([])
    })

    it("should pass a repository owner's format and a token count at their reviewed locations, and fail them elsewhere", () => {
      // Arrange
      const settings = JSON.stringify(
        {
          fields: [
            { limits: { owner: { pattern: '^[a-z0-9-]{1,39}$', flags: 'iu' } } },
            { limits: { isWholeNumber: true, minTokens: 1 } },
          ],
          owner: { pattern: '^[a-z]+$' },
          minTokens: 1,
        },
        null,
        2
      )

      // Act
      const findings = findingsInFile('facts/desktop/settings.json', text(settings))

      // Assert
      expect(findings).toStrictEqual([
        { file: 'facts/desktop/settings.json', line: 19, rule: 'person outside the cast' },
        { file: 'facts/desktop/settings.json', line: 21, rule: 'credential field' },
      ])
    })

    it('should fail people outside the cast under every person key, nested or not, and a role id elsewhere', () => {
      // Arrange
      const json = JSON.stringify(
        { owner: OUTSIDER, requesters: [OUTSIDER], people: [{ name: OUTSIDER }], commands: [{ sender: 'owner' }] },
        null,
        2
      )

      // Act
      const findings = findingsInFile('facts/desktop/settings.json', text(json))

      // Assert
      expect(findings).toStrictEqual([
        { file: 'facts/desktop/settings.json', line: 2, rule: 'person outside the cast' },
        { file: 'facts/desktop/settings.json', line: 4, rule: 'person outside the cast' },
        { file: 'facts/desktop/settings.json', line: 8, rule: 'person outside the cast' },
        { file: 'facts/desktop/settings.json', line: 13, rule: 'person outside the cast' },
      ])
    })

    it('should fail a name-shaped phrase in capture text or alt that is neither the cast nor reviewed', () => {
      // Arrange
      const json = JSON.stringify({ captures: [{ alt: 'Sam Rivera reads Slack.', text: `From ${OUTSIDER}` }] })

      // Act
      const findings = findingsInFile('facts/captures.json', text(json))

      // Assert
      expect(findings).toStrictEqual([
        { file: 'facts/captures.json', line: 1, rule: 'unapproved name-shaped phrase' },
        { file: 'facts/captures.json', line: 1, rule: 'unapproved name-shaped phrase' },
      ])
    })

    it('should fail a value hidden behind a JSON escape and a credential-like key', () => {
      // Arrange
      const json = ['{', `  "contact": "priya${ESCAPED_AT}shop.example",`, '  "clientSecret": "s"', '}'].join('\n')

      // Act
      const findings = findingsInFile('facts/desktop/paths.json', text(json))

      // Assert
      expect(findings).toStrictEqual([
        { file: 'facts/desktop/paths.json', line: 2, rule: 'email address' },
        { file: 'facts/desktop/paths.json', line: 2, rule: 'person outside the cast' },
        { file: 'facts/desktop/paths.json', line: 3, rule: 'credential field' },
      ])
    })
  })

  describe('binary files', () => {
    it('should pass a PNG holding only image chunks', () => {
      // Act
      const findings = findingsInFile('src/public/app-icon-512.png', pngFixture(512, 512, [{ type: 'sRGB', data: Buffer.from([0]) }]))

      // Assert
      expect(findings).toStrictEqual([])
    })

    it('should fail every metadata chunk of a PNG, an unreviewed font and an unexpected binary file', () => {
      // Arrange
      const png = pngFixture(4, 4, [
        { type: 'tEXt', data: Buffer.from('Comment\0made up', 'latin1') },
        { type: 'eXIf', data: Buffer.from([0x4d, 0x4d, 0, 0x2a]) },
      ])

      // Act
      const findings = [
        ...findingsInFile('src/public/captures/home.png', png),
        ...findingsInFile('src/public/fonts/figtree-400-800.woff2', Buffer.from([0x77, 0x4f, 0x46, 0x32, 0, 0, 1])),
        ...findingsInFile('src/public/fonts/renamed.woff2', text('a text file with a font name')),
        ...findingsInFile('src/public/archive.bin', Buffer.from([1, 0, 2])),
      ]

      // Assert
      expect(findings).toStrictEqual([
        { file: 'src/public/captures/home.png', line: 1, rule: 'unapproved PNG chunk' },
        { file: 'src/public/captures/home.png', line: 1, rule: 'unapproved PNG chunk' },
        { file: 'src/public/fonts/figtree-400-800.woff2', line: 1, rule: 'unapproved font' },
        { file: 'src/public/fonts/renamed.woff2', line: 1, rule: 'unapproved font' },
        { file: 'src/public/archive.bin', line: 1, rule: 'unexpected binary file' },
      ])
    })

    it('should fail a broken PNG and invalid JSON as unreadable', () => {
      // Act
      const findings = [
        ...findingsInFile('src/public/captures/broken.png', Buffer.from('not a png')),
        ...findingsInFile('facts/desktop/paths.json', text('{ "unclosed": ')),
      ]

      // Assert
      expect(findings).toStrictEqual([
        { file: 'src/public/captures/broken.png', line: 1, rule: 'unreadable file' },
        { file: 'facts/desktop/paths.json', line: 1, rule: 'unreadable file' },
      ])
    })
  })
})
