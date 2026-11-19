import { describe, expect, it } from 'vitest'

import { type DesktopFacts, verifiedExportOf } from './desktop-export.ts'
import { EXPORT_FILES, type ExportFiles, withManifest } from './export-fixture.ts'
import { FactTableError, factTableMarkdown, isFactTableMarker } from './fact-tables.ts'

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

const factsOf = (files: ExportFiles): DesktopFacts => verifiedExportOf(new Map(Object.entries(withManifest(files)).map(([path, content]) => [path, Buffer.from(content)]))).facts

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

  it('should give each change its window path, Slack example with a non-owner sender named, and setup tool', () => {
    // Act
    const markdown = factTableMarkdown(FACTS, '<!-- facts surfaces pause soft-ignore-me allow -->')

    // Assert
    expect(markdown.split('\n').slice(2)).toStrictEqual([
      '| Pause Misha. | Rail › **Pause Misha** | None | `misha_pause` |',
      '| A colleague has the clone answer them less. | None | `soft-ignore me` (colleague) | None |',
      '| Let people ask for work. | Settings › Who may ask me for work › **Allow** (On someone found.) | `allow @Priya Nair` | `misha_apply_setting` |',
    ])
  })

  it('should state count limits, say a format is checked rather than print its pattern, and say None for no limit', () => {
    // Act
    const markdown = factTableMarkdown(FACTS, '<!-- facts settings -->')

    // Assert
    expect(markdown.split('\n').slice(2)).toStrictEqual([
      '| `icon` | The emoji. | :misha: | Format checked when saved |',
      '| `notes` | What it remembers. | None. | Up to 200 notes; 1,000 characters each |',
      '| `sessionEpoch` | Moves on with start fresh. | 0 | None |',
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
    ['<!-- facts: settings -->', 'is not <!-- facts <table>'],
    ['<!-- facts settings extra -->', 'settings takes no arguments, not extra'],
    ['<!-- facts commands -->', 'commands takes exactly one sender'],
    ['<!-- facts commands robot -->', 'commands takes one sender, owner or colleague'],
    ['<!-- facts surfaces forget -->', 'There is no settings change forget in the facts'],
    ['<!-- facts retention forever -->', 'There is no retention store forever in the facts'],
  ])('should refuse the marker %s', (marker, message) => {
    // Act + Assert
    expect(isFactTableMarker(marker)).toBe(true)
    expect(() => factTableMarkdown(FACTS, marker)).toThrow(FactTableError)
    expect(() => factTableMarkdown(FACTS, marker)).toThrow(message)
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
})
