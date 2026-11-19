import { type DesktopFacts } from './desktop-export.ts'

type Command = DesktopFacts['commands']['commands'][number]
type Mutation = DesktopFacts['settings']['mutations'][number]
type WindowControl = Mutation['window'][number]
type Limits = DesktopFacts['settings']['fields'][number]['limits']

// A page asks for a table with an HTML comment on lines of its own: <!-- facts <table> [<argument> ...] -->.
const MARKER_START = /^<!--\s*facts\b/u
const MARKER = /^<!--\s*facts(?<words>(?:\s+[a-z0-9-]+)+)\s*-->\s*$/u
// Escaped wherever a fact's text sits in a table cell, so its words never become Markdown or HTML.
const MARKDOWN_PUNCTUATION = /[\\`*_[\]<>|~]/gu
const NUMBER_FORMAT = new Intl.NumberFormat('en')
const NONE = 'None'
// What a cell says of a value checked against a format, in place of the format itself (see LIMIT_TEXT).
const FORMAT_CHECKED = 'format checked when saved'

// The short label of each place a command may be sent from, beside the place's full description in command-terms.
const PLACE_LABELS: Readonly<Record<string, string>> = {
  'self-dm': 'Self-DM',
  'dm-with-owner': 'One-to-one DM with the owner',
  summon: 'Any conversation, with the icon',
}

export class FactTableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FactTableError'
  }
}

const text = (value: string): string => value.replaceAll(MARKDOWN_PUNCTUATION, (character) => `\\${character}`)

const code = (value: string): string => `\`${value.replaceAll('|', String.raw`\|`)}\``

const codes = (values: readonly string[]): string => values.map(code).join(', ')

const capitalised = (value: string): string => `${value.charAt(0).toUpperCase()}${value.slice(1)}`

const days = (count: number): string => `${NUMBER_FORMAT.format(count)} ${count === 1 ? 'day' : 'days'}`

const table = (headers: readonly string[], rows: readonly (readonly string[])[]): string =>
  [headers, headers.map(() => '---'), ...rows].map((cells) => `| ${cells.join(' | ')} |`).join('\n')

const placeLabel = (place: string): string => {
  const label = PLACE_LABELS[place]
  if (label === undefined) {
    throw new FactTableError(`The commands name the place ${place}, which has no label in fact-tables.ts`)
  }

  return label
}

// Each limit a setting can carry, in the order a cell lists them. Every key of the schema's limits is here, so a key
// the export adds fails the typecheck until this says how to show it. Format patterns are exported without their
// regular-expression flags, so printing one could misstate it (the case-insensitive repository owner and name would read
// as lowercase only): a cell says a format is checked instead.
const LIMIT_TEXT: Readonly<Record<keyof Limits, (limits: Limits) => string | undefined>> = {
  maxCharacters: ({ maxCharacters }) =>
    maxCharacters === undefined ? undefined : `up to ${NUMBER_FORMAT.format(maxCharacters)} characters`,
  maxNotes: ({ maxNotes }) => (maxNotes === undefined ? undefined : `up to ${NUMBER_FORMAT.format(maxNotes)} notes`),
  maxCharactersEach: ({ maxCharactersEach }) =>
    maxCharactersEach === undefined ? undefined : `${NUMBER_FORMAT.format(maxCharactersEach)} characters each`,
  maxNameCharacters: ({ maxNameCharacters }) =>
    maxNameCharacters === undefined ? undefined : `names up to ${NUMBER_FORMAT.format(maxNameCharacters)} characters`,
  levels: ({ levels }) => (levels === undefined ? undefined : `levels ${codes(levels)}`),
  names: ({ names }) => (names === undefined ? undefined : `each one of ${codes(names)}`),
  pattern: ({ pattern }) => (pattern === undefined ? undefined : FORMAT_CHECKED),
  channelId: ({ channelId }) => (channelId === undefined ? undefined : FORMAT_CHECKED),
  owner: ({ owner }) => (owner === undefined ? undefined : FORMAT_CHECKED),
  name: ({ name }) => (name === undefined ? undefined : FORMAT_CHECKED),
}

const limitsCell = (limits: Limits): string => {
  const parts = [...new Set(Object.values(LIMIT_TEXT).flatMap((textOf) => textOf(limits) ?? []))]

  return parts.length === 0 ? NONE : capitalised(parts.join('; '))
}

const commandById = (facts: DesktopFacts, id: string): Command => {
  const command = facts.commands.commands.find((each) => each.id === id)
  if (command === undefined) {
    throw new FactTableError(`The settings name the Slack command ${id}, which the commands do not hold`)
  }

  return command
}

// The items the keys name, in the keys' order, or every item when no key is given.
const picked = <TItem>(
  items: readonly TItem[],
  keyOf: (item: TItem) => string,
  keys: readonly string[],
  kind: string
): readonly TItem[] => {
  if (keys.length === 0) {
    return items
  }

  return keys.map((key) => {
    const item = items.find((each) => keyOf(each) === key)
    if (item === undefined) {
      throw new FactTableError(`There is no ${kind} ${key} in the facts`)
    }

    return item
  })
}

const windowCell = (controls: readonly WindowControl[]): string => {
  if (controls.length === 0) {
    return NONE
  }

  return controls
    .map(({ page, section, control, note }) => {
      const path = [capitalised(page), ...(section === null ? [] : [section])].map(text).join(' › ')
      const where = `${path} › **${text(control)}**`

      return note === null ? where : `${where} (${text(note)})`
    })
    .join('<br>')
}

const slackCell = (facts: DesktopFacts, ids: readonly string[]): string => {
  if (ids.length === 0) {
    return NONE
  }

  return ids
    .map((id) => {
      const { example, sender } = commandById(facts, id)

      return sender === 'owner' ? code(example) : `${code(example)} (${text(sender)})`
    })
    .join('<br>')
}

// The rule a command follows and what the command table's senders and places mean.
const commandTerms = (facts: DesktopFacts): string => {
  const { rule, senders, places } = facts.commands
  const rows = [
    ...senders.map(({ id, description }) => [capitalised(id), text(description)]),
    ...places.map(({ id, description }) => [placeLabel(id), text(description)]),
  ]

  return `${text(rule)}\n\n${table(['Term', 'Meaning'], rows)}`
}

// The exact Slack commands one sender may send, in the grammar's order.
const commandTable = (facts: DesktopFacts, sender: string): string => {
  const role = facts.commands.senders.find(({ id }) => id === sender)?.id
  if (role === undefined) {
    throw new FactTableError(`commands takes one sender, ${facts.commands.senders.map(({ id }) => id).join(' or ')}`)
  }

  return table(
    ['Command', 'Where', 'What it does', 'Example'],
    facts.commands.commands
      .filter((command) => command.sender === role)
      .map(({ syntax, places, effect, example }) => [
        code(syntax),
        places.map(placeLabel).join(', '),
        text(effect),
        code(example),
      ])
  )
}

const settingsTable = (facts: DesktopFacts): string =>
  table(
    ['Setting', 'What it holds', 'Default', 'Limits'],
    facts.settings.fields.map(({ field, description, default: initial, limits }) => [
      code(field),
      text(description),
      text(initial),
      limitsCell(limits),
    ])
  )

// Every change, or the ones named, with each surface that makes it.
const surfacesTable = (facts: DesktopFacts, types: readonly string[]): string =>
  table(
    ['Change', 'In the window', 'In Slack', 'Setup tool'],
    picked(facts.settings.mutations, ({ type }) => type, types, 'settings change').map(
      ({ description, window, slackCommands, setupTool }) => [
        text(description),
        windowCell(window),
        slackCell(facts, slackCommands),
        setupTool === null ? NONE : code(setupTool),
      ]
    )
  )

const setupCommandsTable = (facts: DesktopFacts): string =>
  table(
    ['Harness', 'Command'],
    facts['setup-commands'].commands.map(({ name, command }) => [text(name), code(command)])
  )

const detectionTable = (facts: DesktopFacts): string =>
  table(
    ['Item', 'Set up group', 'Needed', 'Ready shows', 'What Set up says', 'Actions'],
    facts.detection.items.map(({ name, group, isRequired, readyLabel, about, signInLabel, getIt }) => {
      const actions = [
        ...(signInLabel === null ? [] : [text(signInLabel)]),
        ...(getIt === null ? [] : [`[${text(getIt.label)}](${getIt.url})`]),
      ]

      return [
        text(name),
        text(group),
        isRequired ? 'Required' : 'Optional',
        text(readyLabel),
        `"${text(about)}"`,
        actions.length === 0 ? NONE : actions.join('<br>'),
      ]
    })
  )

const retentionTable = (facts: DesktopFacts, ids: readonly string[]): string =>
  table(
    ['Record', 'Deleted after'],
    picked(facts.retention.stores, ({ id }) => id, ids, 'retention store').map(({ description, keptDays }) => [
      text(description),
      keptDays === null ? 'No age limit' : days(keptDays),
    ])
  )

const withoutArguments = (name: string, rest: readonly string[], markdown: () => string): string => {
  if (rest.length > 0) {
    throw new FactTableError(`${name} takes no arguments, not ${rest.join(' ')}`)
  }

  return markdown()
}

// Whether an HTML block is a facts marker, well formed or not: one that is not is an error, never left as a comment.
export const isFactTableMarker = (html: string): boolean => MARKER_START.test(html)

// The Markdown a facts marker stands for, from the committed export. An unknown table, argument or id is an error.
export const factTableMarkdown = (facts: DesktopFacts, marker: string): string => {
  const words = MARKER.exec(marker)?.groups?.words?.trim().split(/\s+/u)
  const [name, ...rest] = words ?? []
  if (name === undefined) {
    throw new FactTableError(`${marker.trim()} is not <!-- facts <table> [<argument> ...] -->`)
  }

  switch (name) {
    case 'command-terms':
      return withoutArguments(name, rest, () => commandTerms(facts))
    case 'commands': {
      const [sender, ...extra] = rest
      if (sender === undefined || extra.length > 0) {
        throw new FactTableError('commands takes exactly one sender')
      }

      return commandTable(facts, sender)
    }
    case 'settings':
      return withoutArguments(name, rest, () => settingsTable(facts))
    case 'surfaces':
      return surfacesTable(facts, rest)
    case 'setup-commands':
      return withoutArguments(name, rest, () => setupCommandsTable(facts))
    case 'detection':
      return withoutArguments(name, rest, () => detectionTable(facts))
    case 'retention':
      return retentionTable(facts, rest)
    default:
      throw new FactTableError(
        `There is no facts table ${name}; use command-terms, commands, settings, surfaces, setup-commands, detection or retention`
      )
  }
}
