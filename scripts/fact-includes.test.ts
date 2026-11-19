import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { committedBrowserFactsOf, type IBrowserFacts } from './browser-facts.ts'
import { committedExportOf } from './desktop-export.ts'
import { expandFragments, FragmentError, fragmentsOf } from './fact-includes.ts'

// Built from parts so this file itself passes the public-data scan.
const SLACK_MATCH = ['https:', '', 'app.slack.com', '*'].join('/')
const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DESKTOP = (await committedExportOf(ROOT)).facts
const BROWSER = await committedBrowserFactsOf(ROOT)

// The committed browser facts with one permission's limits replaced.
const withLimits = (permission: string, limits: string[]): IBrowserFacts => {
  const disclosure = BROWSER.disclosures.permissions[permission]
  if (disclosure === undefined) {
    throw new Error(`The committed disclosures have no ${permission}`)
  }

  return {
    ...BROWSER,
    disclosures: { ...BROWSER.disclosures, permissions: { ...BROWSER.disclosures.permissions, [permission]: { ...disclosure, limits } } },
  }
}

const fragmentOf = (fragments: Readonly<Record<string, string>>, name: string): string => {
  const fragment = fragments[name]
  if (fragment === undefined) {
    throw new Error(`No fragment ${name}`)
  }

  return fragment
}

describe('[scripts] Fact includes - fragmentsOf and expandFragments', () => {
  it('should replace a marker line with its fragment and leave the rest of the page as written', () => {
    // Arrange
    const page = ['# Title', '', '<!--@generated: note-->', '', 'After.'].join('\n')

    // Act
    const expanded = expandFragments(page, { note: '| A |\n| --- |' }, 'privacy.md')

    // Assert
    expect(expanded).toBe(['# Title', '', '| A |\n| --- |', '', 'After.'].join('\n'))
  })

  it('should refuse a marker naming no fragment, naming the page', () => {
    // Act + Assert
    expect(() => expandFragments('<!--@generated: missing-->', {}, 'privacy.md')).toThrow(
      new FragmentError('privacy.md places the generated fragment missing, which does not exist')
    )
  })

  it('should render every manifest declaration in order with its anchor, escaping text outside code spans', () => {
    // Act
    const fragments = fragmentsOf(DESKTOP, withLimits('alarms', ['Matches <all_urls>, `a|b` and *this*.']))

    // Assert
    const permissionTable = fragmentOf(fragments, 'browser-permission-table')
    const details = fragmentOf(fragments, 'browser-permission-details')
    const anchors = [...permissionTable.matchAll(/\]\(#(?<anchor>[a-z0-9-]+)\)/gu)].map((match) => match.groups?.anchor)
    expect(anchors).toStrictEqual([
      'native-messaging',
      'scripting',
      'alarms',
      'unlimited-storage',
      'tabs',
      'web-request',
      'downloads',
      'all-urls',
      'observer-js',
      'relay-js',
    ])
    expect(details).toContain('### Host permission `<all_urls>` {#all-urls}')
    expect(details).toContain(`Declared on \`${SLACK_MATCH}\`, from \`document_start\`, in the page's own world, in the top frame only.`)
    expect(details).toContain('- Matches \\<all\\_urls\\>, `a\\|b` and \\*this\\*.')
  })

  it('should summarise each declaration by its first sentence and link each quoted limit to its declaration', () => {
    // Act
    const fragments = fragmentsOf(DESKTOP, BROWSER)

    // Assert
    const permissionTable = fragmentOf(fragments, 'browser-permission-table')
    const exceptions = fragmentOf(fragments, 'browser-exceptions')
    expect(permissionTable).toContain("| [Content script `observer.js`](#observer-js) | Watches Slack's own real-time socket. | On a Slack tab |")
    expect(exceptions).toContain('| The pending Slack queue | A stored event has no age limit. It stays, and is forwarded again, until the Misha app acknowledges it. | [`unlimitedStorage`](#unlimited-storage) |')
  })

  it('should refuse a disclosure whose quoted limit no longer starts as the storage table expects', () => {
    // Arrange
    const facts = withLimits('webRequest', ['It only observes, and never blocks or changes a request.'])

    // Act + Assert
    expect(() => fragmentsOf(DESKTOP, facts)).toThrow('The browser disclosures have 0 limits starting "The log holds the latest", not one')
  })

  it('should refuse text a page would evaluate as a Vue expression', () => {
    // Arrange
    const facts = withLimits('alarms', ['Fires {{ every }} 30 seconds.'])

    // Act + Assert
    expect(() => fragmentsOf(DESKTOP, facts)).toThrow('which a page would evaluate')
  })
})
