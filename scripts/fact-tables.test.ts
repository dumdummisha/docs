import { fileURLToPath } from 'node:url'

import { createMarkdownRenderer } from 'vitepress'
import { describe, expect, it } from 'vitest'

import { verifiedExportOf } from './desktop-export.ts'
import { EXPORT_FILES, type ExportFiles, withManifest } from './export-fixture.ts'
import { expandFactTables, FactTableError, factTableMarkdown, isFactTableMarker, type TableFacts } from './fact-tables.ts'
import { type ReviewedFacts } from './reviewed-facts.ts'

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
    { field: 'icon', description: 'The emoji.', default: ':misha:', limits: { pattern: '^[a-z]+$' } },
    { field: 'notes', description: 'What it remembers.', default: 'None.', limits: { maxNotes: 200, maxCharactersEach: 1000 } },
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
        actor: 'clone',
        access: 'anyone',
        needs: ['Figma on Set up'],
        limit: 'Reads | renders only.',
      },
      {
        id: 'delivery',
        request: 'Carry a change to a reviewed pull request',
        actor: 'worker',
        access: 'allowed',
        needs: ['GitHub CLI on Set up', 'OpenCode signed in to OpenAI'],
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
        needs: ['GitHub CLI on Set up'],
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

const factsOf = (files: ExportFiles): TableFacts => ({
  ...verifiedExportOf(new Map(Object.entries(withManifest(files)).map(([path, content]) => [path, Buffer.from(content)])))
    .facts,
  ...REVIEWED,
})

const FACTS = factsOf({
  ...EXPORT_FILES,
  'facts/commands.json': JSON.stringify(COMMANDS),
  'facts/settings.json': JSON.stringify(SETTINGS),
  'facts/retention.json': JSON.stringify(RETENTION),
})

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

  it('should state count limits, say a format is checked rather than print its pattern, and leave no listed limit empty', () => {
    // Act
    const markdown = factTableMarkdown(FACTS, '<!-- facts settings -->')

    // Assert
    expect(markdown.split('\n').slice(2)).toStrictEqual([
      '| `icon` | The emoji. | :misha: | Format checked when saved |',
      '| `notes` | What it remembers. | None. | Up to 200 notes; 1,000 characters each |',
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
    ['<!-- facts commands -->', 'commands takes exactly one sender'],
    ['<!-- facts commands robot -->', 'commands takes one sender, owner or colleague'],
    ['<!-- facts surfaces forget -->', 'There is no settings change forget in the facts'],
    ['<!-- facts retention forever -->', 'There is no retention store forever in the facts'],
    ['<!-- facts capabilities telepathy -->', 'There is no capability telepathy in the facts'],
    ['<!-- facts workflows release -->', 'There is no workflow release in the facts'],
    ['<!-- facts endpoints -->', 'endpoints takes exactly one workflow'],
    ['<!-- facts endpoints delivery quick-answer -->', 'endpoints takes exactly one workflow'],
    ['<!-- facts endpoints release -->', 'There is no workflow release in the facts'],
  ])('should refuse the marker %s', (marker, message) => {
    // Act + Assert
    expect(isFactTableMarker(marker)).toBe(true)
    expect(() => factTableMarkdown(FACTS, marker)).toThrow(FactTableError)
    expect(() => factTableMarkdown(FACTS, marker)).toThrow(message)
  })

  it('should give each request who does it and who may ask, one need per line, escaping the limit', () => {
    // Act
    const markdown = factTableMarkdown(FACTS, '<!-- facts capabilities delivery design-read -->')

    // Assert
    expect(markdown.split('\n')).toStrictEqual([
      '| Request | Done by | Who may ask | Needs | Limit |',
      '| --- | --- | --- | --- | --- |',
      '| Carry a change to a reviewed pull request | A worker | You and the people you allow | GitHub CLI on Set up<br>OpenCode signed in to OpenAI | Dev at most. |',
      '| Render a Figma screen | The clone | Anyone the clone answers | Figma on Set up | Reads \\| renders only. |',
    ])
  })

  it("should list a workflow's repository commands with its needs and only its results as its ends", () => {
    // Act
    const markdown = factTableMarkdown(FACTS, '<!-- facts workflows -->')

    // Assert
    expect(markdown.split('\n').slice(2)).toStrictEqual([
      '| **Delivery** | A change that makes sense | You and the people you allow | GitHub CLI on Set up<br>Optional `execute` command in the repository: Merges and deploys to dev. | GPT reviews the pull request. | A reviewed pull request<br>Merged and checked on dev |',
      '| **Quick answer** | One bounded read | Anyone the clone answers | The connection that holds the answer | None | A marked reply |',
    ])
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
    expect(() => factTableMarkdown(facts, '<!-- facts commands owner -->')).toThrow(
      'The commands name the place huddle, which has no label in fact-tables.ts'
    )
  })

  it('should not take an ordinary comment for a marker', () => {
    // Act + Assert
    expect(isFactTableMarker('<!-- factsheet below -->')).toBe(false)
    expect(isFactTableMarker('<!-- see the facts -->')).toBe(false)
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
