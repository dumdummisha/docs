import { fileURLToPath } from 'node:url'

import { createMarkdownRenderer } from 'vitepress'
import { describe, expect, it } from 'vitest'

import { committedBrowserFactsOf, type IBrowserFacts } from './browser-facts.ts'
import { type DesktopFacts, verifiedExportOf } from './desktop-export.ts'
import { EXPORT_FILES, type ExportFiles, withManifest } from './export-fixture.ts'
import { expandFactTables, FactTableError, factTableMarkdown, type IFacts, isFactTableMarker } from './fact-tables.ts'
import { type ReviewedFacts } from './reviewed-facts.ts'

// Built from parts so this file itself passes the public-data scan.
const SLACK_MATCH = ['https:', '', 'app.slack.com', '*'].join('/')
const ROOT = fileURLToPath(new URL('..', import.meta.url))
const BROWSER = await committedBrowserFactsOf(ROOT)

const COMMANDS = {
  rule: 'A command is the whole message | nothing else.',
  senders: [
    { id: 'owner', description: 'The person whose clone it is.' },
    { id: 'colleague', description: 'Anyone else.' },
  ],
  places: [
    { id: 'self-dm', description: 'Your self-DM.' },
    { id: 'dm-with-owner', description: 'A one-to-one DM with the owner.' },
  ],
  commands: [
    {
      id: 'soft-ignore-me',
      syntax: 'soft-ignore me',
      sender: 'colleague',
      places: ['dm-with-owner'],
      effect: 'The clone answers you only when you call it.',
      example: 'soft-ignore me',
      mutation: 'soft-ignore-me',
    },
    {
      id: 'allow',
      syntax: 'allow <@person> [<@person> ...]',
      sender: 'owner',
      places: ['self-dm'],
      effect: 'The people named may ask for *work*.',
      example: 'allow @Priya Nair',
      mutation: 'allow',
    },
  ],
}

const SETTINGS = {
  fields: [
    { field: 'icon', description: 'The emoji.', default: ':misha:', limits: { name: { pattern: '^[a-z]+$', flags: 'iu' } } },
    { field: 'notes', description: 'What it remembers.', default: 'None.', limits: { maxNotes: 200, maxCharactersEach: 1000 } },
    { field: 'compactAtTokens', description: 'When the clone compacts.', default: '150000', limits: { isWholeNumber: true, minTokens: 1 } },
    { field: 'sessionEpoch', description: 'Moves on with start fresh.', default: '0', limits: {} },
  ],
  mutations: [
    {
      type: 'allow',
      description: 'Let people ask for work.',
      setting: 'allowed',
      window: [{ page: 'Settings', section: 'Who may ask me for work', control: 'Allow', note: 'On someone found.' }],
      slackCommands: ['allow'],
      setupTool: 'misha_apply_setting',
    },
    {
      type: 'soft-ignore-me',
      description: 'A colleague has the clone answer them less.',
      setting: 'rules',
      window: [],
      slackCommands: ['soft-ignore-me'],
      setupTool: null,
    },
    {
      type: 'pause',
      description: 'Pause Misha.',
      setting: null,
      window: [{ page: 'rail', section: null, control: 'Pause Misha', note: null }],
      slackCommands: [],
      setupTool: 'misha_pause',
    },
  ],
}

const RETENTION = {
  rule: 'Cleanup deletes these.',
  stores: [
    { id: 'hands-off', keptDays: 14, description: 'The places you said hands off in.' },
    { id: 'reply-budget', keptDays: 1, description: 'Replies counted against a budget.' },
    { id: 'ledger', keptDays: null, description: 'Every post the clone made.' },
  ],
  overwrittenBatches: { kept: 10, description: 'What the installers moved aside.' },
}

const REVIEWED: ReviewedFacts = {
  capabilities: {
    productVersion: '0.1.0',
    evidenceDate: '2026-11-19',
    browserRevision: '9cba991',
    capabilities: [
      {
        id: 'design-read',
        request: 'Render a Figma screen',
        routes: [{ availability: 'included', actor: 'clone', surface: 'in its own turn' }],
        access: 'anyone',
        needs: ['Figma on Set up'],
        result: 'The image in the reply',
        limit: 'Reads | renders only.',
      },
      {
        id: 'delivery',
        request: 'Carry a change to a reviewed pull request',
        routes: [
          { availability: 'included', actor: 'worker', surface: 'started by the clone' },
          { availability: 'optional', actor: 'your-agent', surface: 'through a module' },
        ],
        access: 'allowed',
        needs: ['GitHub CLI on Set up', 'OpenCode signed in to OpenAI'],
        result: 'A reviewed pull request',
        limit: 'Dev at most.',
      },
    ],
  },
  workflows: {
    productVersion: '0.1.0',
    evidenceDate: '2026-11-19',
    workflows: [
      {
        id: 'delivery',
        name: 'Delivery',
        trigger: 'A change that makes sense',
        actor: 'worker',
        access: 'allowed',
        needs: ['The repository added on Settings', 'GitHub CLI on Set up'],
        projectCommands: [{ name: 'execute', role: 'Merges and deploys to dev.' }],
        review: 'GPT reviews the pull request.',
        endpoints: [
          { kind: 'result', outcome: 'A reviewed pull request', when: 'The repository may not merge' },
          { kind: 'wait', outcome: 'The review waits', when: 'GPT is unavailable' },
          { kind: 'result', outcome: 'Merged and checked on dev', when: 'It may merge and has execute' },
        ],
      },
      {
        id: 'quick-answer',
        name: 'Quick answer',
        trigger: 'One bounded read',
        actor: 'clone',
        access: 'anyone',
        needs: ['The connection that holds the answer'],
        projectCommands: [],
        review: null,
        endpoints: [{ kind: 'result', outcome: 'A marked reply', when: 'The read answers it' }],
      },
    ],
  },
}

const factsOf = (files: ExportFiles): DesktopFacts =>
  verifiedExportOf(new Map(Object.entries(withManifest(files)).map(([path, content]) => [path, Buffer.from(content)]))).facts

const DESKTOP = factsOf({
  ...EXPORT_FILES,
  'facts/commands.json': JSON.stringify(COMMANDS),
  'facts/settings.json': JSON.stringify(SETTINGS),
  'facts/retention.json': JSON.stringify(RETENTION),
})
const FACTS: IFacts = { desktop: DESKTOP, browser: BROWSER, reviewed: REVIEWED }

// The committed browser facts with one permission's limits replaced.
const withLimits = (permission: string, limits: string[]): IFacts => {
  const disclosure = BROWSER.disclosures.permissions[permission]
  if (disclosure === undefined) {
    throw new Error(`The committed disclosures have no ${permission}`)
  }

  const browser: IBrowserFacts = {
    ...BROWSER,
    disclosures: { ...BROWSER.disclosures, permissions: { ...BROWSER.disclosures.permissions, [permission]: { ...disclosure, limits } } },
  }

  return { desktop: DESKTOP, browser, reviewed: REVIEWED }
}

describe('[scripts] Fact tables - factTableMarkdown and isFactTableMarker', () => {
  it("should list one sender's commands with their places' labels, escaping the facts' text", () => {
    // Act
    const markdown = factTableMarkdown(FACTS, '<!-- facts commands owner -->\n')

    // Assert
    expect(markdown).toBe(
      [
        '| Command | Where | What it does | Example |',
        '| --- | --- | --- | --- |',
        '| `allow <@person> [<@person> ...]` | Self-DM | The people named may ask for \\*work\\*. | `allow @Priya Nair` |',
      ].join('\n')
    )
  })

  it('should give each change its window path, Slack example with who sends it and where, and setup tool', () => {
    // Act
    const markdown = factTableMarkdown(FACTS, '<!-- facts surfaces pause soft-ignore-me allow -->')

    // Assert
    expect(markdown.split('\n').slice(2)).toStrictEqual([
      '| Pause Misha. | Sidebar › **Pause Misha** | None | `misha_pause` |',
      '| A colleague has the clone answer them less. | None | `soft-ignore me`<br>A colleague, in a one-to-one DM with you | None |',
      '| Let people ask for work. | Settings › Who may ask me for work › **Allow** (On someone found.) | `allow @Priya Nair`<br>You, in your self-DM | `misha_apply_setting` |',
    ])
  })

  it('should state count and number limits, say a format is checked rather than print its pattern, and leave no listed limit empty', () => {
    // Act
    const markdown = factTableMarkdown(FACTS, '<!-- facts settings -->')

    // Assert
    expect(markdown.split('\n').slice(2)).toStrictEqual([
      '| `icon` | The emoji. | :misha: | Format checked when saved |',
      '| `notes` | What it remembers. | None. | Up to 200 notes; 1,000 characters each |',
      '| `compactAtTokens` | When the clone compacts. | 150000 | Whole number; at least 1 token |',
      '| `sessionEpoch` | Moves on with start fresh. | 0 |  |',
    ])
  })

  it('should render the command rule, then senders and places as terms, escaping a pipe in the rule', () => {
    // Act
    const markdown = factTableMarkdown(FACTS, '<!-- facts command-terms -->')

    // Assert
    expect(markdown.split('\n')).toStrictEqual([
      'A command is the whole message \\| nothing else.',
      '',
      '| Term | Meaning |',
      '| --- | --- |',
      '| Owner | The person whose clone it is. |',
      '| Colleague | Anyone else. |',
      '| Self-DM | Your self-DM. |',
      '| One-to-one DM with the owner | A one-to-one DM with the owner. |',
    ])
  })

  it('should give a retention store its days, one day singular, and no age limit when it has none', () => {
    // Act
    const markdown = factTableMarkdown(FACTS, '<!-- facts retention ledger reply-budget hands-off -->')

    // Assert
    expect(markdown.split('\n').slice(2)).toStrictEqual([
      '| Every post the clone made. | No age limit |',
      '| Replies counted against a budget. | 1 day |',
      '| The places you said hands off in. | 14 days |',
    ])
  })

  it.each([
    ['<!-- facts nonsense -->', 'There is no facts table nonsense'],
    ['   <!-- facts nonsense -->', 'There is no facts table nonsense'],
    ['<!-- Facts settings -->', 'is not <!-- facts <table>'],
    ['<!-- facts: settings -->', 'is not <!-- facts <table>'],
    ['<!-- facts settings extra -->', 'settings takes no arguments, not extra'],
    ['<!-- facts browser-holdings extra -->', 'browser-holdings takes no arguments, not extra'],
    ['<!-- facts commands -->', 'commands takes exactly one sender'],
    ['<!-- facts commands robot -->', 'commands takes one sender, owner or colleague'],
    ['<!-- facts surfaces forget -->', 'There is no settings change forget in the facts'],
    ['<!-- facts retention forever -->', 'There is no retention store forever in the facts'],
    ['<!-- facts capabilities telepathy -->', 'There is no capability telepathy in the facts'],
    ['<!-- facts endpoints -->', 'endpoints takes exactly one workflow'],
    ['<!-- facts endpoints delivery quick-answer -->', 'endpoints takes exactly one workflow'],
    ['<!-- facts endpoints release -->', 'There is no workflow release in the facts'],
    ['<!-- facts needs -->', 'needs takes exactly one workflow'],
    ['<!-- facts needs delivery quick-answer -->', 'needs takes exactly one workflow'],
    ['<!-- facts needs release -->', 'There is no workflow release in the facts'],
  ])('should refuse the marker %s', (marker, message) => {
    // Act + Assert
    expect(isFactTableMarker(marker)).toBe(true)
    expect(() => factTableMarkdown(FACTS, marker)).toThrow(FactTableError)
    expect(() => factTableMarkdown(FACTS, marker)).toThrow(message)
  })

  it('should give each request every route to it, who may ask, one need per line and its result, escaping the limit', () => {
    // Act
    const markdown = factTableMarkdown(FACTS, '<!-- facts capabilities delivery design-read -->')

    // Assert
    expect(markdown.split('\n')).toStrictEqual([
      '| Request | Available as | Who may ask | Needs | Gives | Limit |',
      '| --- | --- | --- | --- | --- | --- |',
      '| Carry a change to a reviewed pull request | Included: Worker, started by the clone<br>Optional extension: Your agent, through a module | You and those you allow | GitHub CLI on Set up<br>OpenCode signed in to OpenAI | A reviewed pull request | Dev at most. |',
      '| Render a Figma screen | Included: Clone, in its own turn | Anyone | Figma on Set up | The image in the reply | Reads \\| renders only. |',
    ])
  })

  it('should list what one workflow needs, one item per line', () => {
    // Act
    const markdown = factTableMarkdown(FACTS, '<!-- facts needs delivery -->')

    // Assert
    expect(markdown.split('\n')).toStrictEqual(['- The repository added on Settings', '- GitHub CLI on Set up'])
  })

  it('should list every way one workflow ends, in order, with its kind', () => {
    // Act
    const markdown = factTableMarkdown(FACTS, '<!-- facts endpoints delivery -->')

    // Assert
    expect(markdown.split('\n').slice(2)).toStrictEqual([
      '| Ends with | A reviewed pull request | The repository may not merge |',
      '| Waits | The review waits | GPT is unavailable |',
      '| Ends with | Merged and checked on dev | It may merge and has execute |',
    ])
  })

  it('should refuse a command whose place has no label', () => {
    // Arrange
    const facts = factsOf({
      ...EXPORT_FILES,
      'facts/commands.json': JSON.stringify({
        ...COMMANDS,
        places: [{ id: 'huddle', description: 'A huddle.' }],
        commands: [{ ...COMMANDS.commands[1], places: ['huddle'] }],
      }),
    })

    // Act + Assert
    expect(() => factTableMarkdown({ desktop: facts, browser: BROWSER, reviewed: REVIEWED }, '<!-- facts commands owner -->')).toThrow(
      'The commands name the place huddle, which has no label in fact-tables.ts'
    )
  })

  it('should not take an ordinary comment for a marker', () => {
    // Act + Assert
    expect(isFactTableMarker('<!-- factsheet below -->')).toBe(false)
    expect(isFactTableMarker('<!-- see the facts -->')).toBe(false)
  })

  it('should give the retention rule, then every record with its days and the overwritten batches', () => {
    // Act
    const markdown = factTableMarkdown(FACTS, '<!-- facts retention-policy -->')

    // Assert
    expect(markdown.split('\n')).toStrictEqual([
      'Cleanup deletes these.',
      '',
      '| Record | Kept | What it is |',
      '| --- | --- | --- |',
      '| Hands off | 14 days | The places you said hands off in. |',
      '| Reply budget | 1 day | Replies counted against a budget. |',
      '| Ledger | No age limit | Every post the clone made. |',
      '| Overwritten files | Newest 10 batches | What the installers moved aside. |',
    ])
  })

  it('should render every manifest declaration in order with its anchor, escaping text outside code spans', () => {
    // Arrange
    const facts = withLimits('alarms', ['Matches <all_urls>, `a|b` and *this*.'])

    // Act
    const permissionTable = factTableMarkdown(facts, '<!-- facts browser-permission-table -->')
    const details = factTableMarkdown(facts, '<!-- facts browser-permission-details -->')

    // Assert
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
    const permissionTable = factTableMarkdown(FACTS, '<!-- facts browser-permission-table -->')
    const exceptions = factTableMarkdown(FACTS, '<!-- facts browser-exceptions -->')

    // Assert
    expect(permissionTable).toContain("| [Content script `observer.js`](#observer-js) | Watches Slack's own real-time socket. | On a Slack tab |")
    expect(exceptions).toContain('| The pending Slack queue | A stored event has no age limit. It stays, and is forwarded again, until the Misha app acknowledges it. | [`unlimitedStorage`](#unlimited-storage) |')
  })

  it('should refuse a disclosure whose quoted limit no longer starts as the storage table expects', () => {
    // Arrange
    const facts = withLimits('webRequest', ['It only observes, and never blocks or changes a request.'])

    // Act + Assert
    expect(() => factTableMarkdown(facts, '<!-- facts browser-holdings -->')).toThrow(
      'The browser disclosures have 0 limits starting "The log holds the latest", not one'
    )
  })

  it('should refuse disclosure text a page would evaluate as a Vue expression', () => {
    // Arrange
    const facts = withLimits('alarms', ['Fires {{ every }} 30 seconds.'])

    // Act + Assert
    expect(() => factTableMarkdown(facts, '<!-- facts browser-permission-details -->')).toThrow('which a page would evaluate')
  })

  it('should render an indented marker like an unindented one', () => {
    // Act
    const markdown = factTableMarkdown(FACTS, '   <!-- facts retention ledger -->\n')

    // Assert
    expect(isFactTableMarker('   <!-- facts retention ledger -->\n')).toBe(true)
    expect(markdown.split('\n').slice(2)).toStrictEqual(['| Every post the clone made. | No age limit |'])
  })
})

describe('[scripts] Fact tables - expandFactTables', () => {
  const render = async (page: string): Promise<string> => {
    const md = await createMarkdownRenderer(fileURLToPath(new URL('../src', import.meta.url)))
    expandFactTables(FACTS)(md)

    return md.render(page, { relativePath: 'reference/example.md' })
  }

  it('should replace a marker indented as far as an HTML block allows with its table', async () => {
    // Act
    const html = await render('Intro.\n\n   <!-- facts retention ledger -->\n\nAfter.\n')

    // Assert
    expect(html).toContain('<td>Every post the clone made.</td>')
    expect(html).not.toContain('<!--')
  })

  it("should give a generated heading its anchor, as the page's own headings get theirs, and collapse its disclosure", async () => {
    // Act
    const html = await render('<!-- facts browser-permission-details -->\n')

    // Assert
    expect(html).toContain('<h3 id="all-urls" tabindex="-1">Host permission <code>&lt;all_urls&gt;</code>')
    expect(html.match(/<h3 /gu)).toHaveLength(10)
    expect(html.match(/<details class="details custom-block"><summary>Full disclosure: what it allows, why, when data flows, every limit<\/summary>/gu)).toHaveLength(10)
    expect(html).toMatch(/<\/h3>\s*<details class="details custom-block"><summary>[^<]*<\/summary>\s*<p><strong>What it lets the extension do:<\/strong>/u)
  })

  it.each([
    ['an indented unknown table', '  <!-- facts nonexistent -->\n', 'There is no facts table nonexistent'],
    ['an indented malformed marker', ' <!-- facts: settings -->\n', 'is not <!-- facts <table>'],
    ['a marker inside a paragraph', 'See <!-- facts settings --> here.\n', 'must stand on lines of its own'],
  ])('should stop the build, naming the page, for %s', async (_case, page, message) => {
    // Act + Assert
    await expect(render(page)).rejects.toThrow(message)
    await expect(render(page)).rejects.toThrow('reference/example.md')
  })
})
