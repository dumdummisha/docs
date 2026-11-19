import { type MarkdownEnv, type MarkdownRenderer } from 'vitepress'

import {
  type CollectionTrigger,
  type ContentScript,
  contentScriptKey,
  type Disclosure,
  type IBrowserFacts,
} from './browser-facts.ts'
import { type DesktopFacts } from './desktop-export.ts'
import { BROWSER_REPOSITORY_URL } from './site.ts'

type Command = DesktopFacts['commands']['commands'][number]
type Mutation = DesktopFacts['settings']['mutations'][number]
type WindowControl = Mutation['window'][number]
type Limits = DesktopFacts['settings']['fields'][number]['limits']

// The committed facts a page's tables and disclosures render: the desktop export's and the browser extension's.
export interface IFacts {
  desktop: DesktopFacts
  browser: IBrowserFacts
}

// A page asks for a table with an HTML comment on lines of its own: <!-- facts <table> [<argument> ...] -->. Markdown
// lets an HTML block start up to three spaces in and keeps them in the block, so both allow leading whitespace. The start
// ignores letter case, so a <!-- Facts ... --> is recognised and then refused by the exact form, never left a comment.
const MARKER_START = /^\s*<!--\s*facts\b/iu
const MARKER = /^\s*<!--\s*facts(?<words>(?:\s+[a-z0-9-]+)+)\s*-->\s*$/u
// Escaped wherever a desktop fact's plain text sits in a table cell, so its words never become Markdown or HTML.
const MARKDOWN_PUNCTUATION = /[\\`*_[\]<>|~]/gu
// The browser disclosures write code as Markdown code spans. Markdown and HTML characters are escaped outside them; a
// pipe is escaped inside them too, so table cells hold it.
const DISCLOSURE_SPECIAL = /[\\*_[\]<>|]/gu
const CODE_SPAN = /(`[^`]*`)/u
// Vue reads a double brace in a page as an expression.
const VUE_INTERPOLATION = '{{'
// A full stop that ends a sentence, outside a code span or a name such as misha.browser_bridge.
const SENTENCE_END = /(?<=\.) (?=[A-Z])/u
const NUMBER_FORMAT = new Intl.NumberFormat('en')
const NONE = 'None'
// The export names the window's sidebar rail, the one place a control sits that the window gives no title; every other
// page is named by its title.
const RAIL = 'rail'
const RAIL_LABEL = 'Sidebar'
// What a cell says of a value checked against a format, in place of the format itself (see LIMIT_TEXT).
const FORMAT_CHECKED = 'format checked when saved'

// The short label of each place a command may be sent from, beside the place's full description in command-terms.
const PLACE_LABELS: Readonly<Record<string, string>> = {
  'self-dm': 'Self-DM',
  'dm-with-owner': 'One-to-one DM with the owner',
  summon: 'Any conversation, with the icon',
}

// Who sends a command, and where, as a change's Slack cell says it under the example.
const SENDER_PHRASES: Readonly<Record<Command['sender'], string>> = {
  owner: 'You',
  colleague: 'A colleague',
}
// Every command sent with the icon acts on the conversation or thread it is sent in, which the self-DM refuses to be
// (hands off and hands on).
const PLACE_PHRASES: Readonly<Record<string, string>> = {
  'self-dm': 'in your self-DM',
  'dm-with-owner': 'in a one-to-one DM with you',
  summon: 'with the icon, in the conversation or thread it is for, not your self-DM',
}

const TRIGGER_LABELS: Readonly<Record<CollectionTrigger, string>> = {
  'automatic': 'automatic',
  'slack-tab': 'on a Slack tab',
  'app-request': 'on a Misha app request',
  'tool-request': 'on a browser tool request',
}

const WORLD_TEXT: Readonly<Record<ContentScript['world'], string>> = {
  ISOLATED: "the extension's isolated world",
  MAIN: "the page's own world",
}

type DisclosureGroup = 'permissions' | 'hostPermissions' | 'contentScripts'

// Disclosure limits a table quotes, found by how they start in one declaration's limits. A sentence that no longer
// starts that way, or two that do, stops the build, so a reworded disclosure cannot leave a table quoting the wrong
// limit.
interface IQuotedLimits {
  item: string
  group: DisclosureGroup
  key: string
  starts: readonly string[]
}

// What the browser extension keeps between requests, each with the disclosure sentences that say where and for how
// long.
const BROWSER_HOLDINGS: readonly IQuotedLimits[] = [
  {
    item: 'New Slack messages waiting for the Misha app to save them',
    group: 'permissions',
    key: 'unlimitedStorage',
    starts: ['The durable queue holds', 'A stored event has no age limit', 'A stored event holds the account'],
  },
  {
    item: 'New Slack messages while writes to that queue fail',
    group: 'permissions',
    key: 'unlimitedStorage',
    starts: ['While writes to the database fail', 'A service worker or browser restart'],
  },
  {
    item: 'New Slack messages no relay has taken yet',
    group: 'contentScripts',
    key: 'observer.js',
    starts: ['It holds up to'],
  },
  {
    item: 'The network request log',
    group: 'permissions',
    key: 'webRequest',
    starts: ['The log holds the latest', 'The log lives only in'],
  },
  {
    item: 'The page outline recorded before an action',
    group: 'permissions',
    key: 'scripting',
    starts: ['Before a click, a drag'],
  },
  {
    item: 'Slack file downloads and uploads in progress',
    group: 'permissions',
    key: 'scripting',
    starts: ["A downloaded Slack file's bytes"],
  },
  {
    item: 'The last value read from each password field',
    group: 'permissions',
    key: 'scripting',
    starts: ["A password field's value comes back"],
  },
  {
    item: 'The latest pointer position in a page',
    group: 'permissions',
    key: 'scripting',
    starts: ['The first time a browser tool locates a target'],
  },
  {
    item: 'Anything the native host relays',
    group: 'permissions',
    key: 'nativeMessaging',
    starts: ['The host only relays'],
  },
]

// The limits a quick security or store review most needs, quoted at the top of the permissions page, each linked to
// its declaration's full disclosure.
const BROWSER_EXCEPTIONS: readonly IQuotedLimits[] = [
  {
    item: 'Request recording and its redaction',
    group: 'permissions',
    key: 'webRequest',
    starts: ["Chrome exposes each request's body", 'The redaction looks for credentials only'],
  },
  {
    item: 'What a page shows',
    group: 'hostPermissions',
    key: '<all_urls>',
    starts: ['Page text, control names'],
  },
  {
    item: 'Password fields',
    group: 'permissions',
    key: 'scripting',
    starts: ["A password field's value comes back"],
  },
  {
    item: 'The pending Slack queue',
    group: 'permissions',
    key: 'unlimitedStorage',
    starts: ['A stored event has no age limit'],
  },
  {
    item: 'Download reports',
    group: 'permissions',
    key: 'downloads',
    starts: ['The search covers the whole browser'],
  },
  {
    item: 'Slack calls and uploads',
    group: 'permissions',
    key: 'scripting',
    starts: ['Slack calls are limited to the Web API methods'],
  },
  {
    item: 'The native host',
    group: 'permissions',
    key: 'nativeMessaging',
    starts: ['The host only relays'],
  },
]

export class FactTableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FactTableError'
  }
}

const text = (value: string): string => value.replaceAll(MARKDOWN_PUNCTUATION, (character) => `\\${character}`)

// Disclosure text as inline Markdown: its code spans kept, Markdown and HTML characters escaped elsewhere.
const disclosureText = (value: string): string => {
  if (value.includes(VUE_INTERPOLATION)) {
    throw new FactTableError(`A fact holds ${VUE_INTERPOLATION}, which a page would evaluate: ${value}`)
  }

  return value
    .split(CODE_SPAN)
    .map((part) => (part.startsWith('`') ? part.replaceAll('|', '\\|') : part.replaceAll(DISCLOSURE_SPECIAL, '\\$&')))
    .join('')
}

// A code span for a table cell, where a pipe would end the cell.
const code = (value: string): string => `\`${value.replaceAll('|', String.raw`\|`)}\``

const codes = (values: readonly string[]): string => values.map(code).join(', ')

// A code span for a heading or prose, where a backslash before a pipe would show.
const proseCode = (value: string): string => `\`${value}\``

const proseCodes = (values: readonly string[]): string => values.map(proseCode).join(', ')

const capitalised = (value: string): string => `${value.charAt(0).toUpperCase()}${value.slice(1)}`

const days = (count: number): string => `${NUMBER_FORMAT.format(count)} ${count === 1 ? 'day' : 'days'}`

const table = (headers: readonly string[], rows: readonly (readonly string[])[]): string =>
  [headers, headers.map(() => '---'), ...rows].map((cells) => `| ${cells.join(' | ')} |`).join('\n')

const bullets = (items: readonly string[]): string => items.map((item) => `- ${disclosureText(item)}`).join('\n')

const paragraphs = (items: readonly string[]): string => items.map(disclosureText).join('\n\n')

const labelOf = (labels: Readonly<Record<string, string>>, place: string): string => {
  const label = labels[place]
  if (label === undefined) {
    throw new FactTableError(`The commands name the place ${place}, which has no label in fact-tables.ts`)
  }

  return label
}

const placeLabel = (place: string): string => labelOf(PLACE_LABELS, place)

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

// Empty when the export lists no limit: the export says what the app checks, not that a value has no constraint.
const limitsCell = (limits: Limits): string => {
  const parts = [...new Set(Object.values(LIMIT_TEXT).flatMap((textOf) => textOf(limits) ?? []))]

  return capitalised(parts.join('; '))
}

const commandById = (desktop: DesktopFacts, id: string): Command => {
  const command = desktop.commands.commands.find((each) => each.id === id)
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
      const path = [page === RAIL ? RAIL_LABEL : page, ...(section === null ? [] : [section])].map(text).join(' › ')
      const where = `${path} › **${text(control)}**`

      return note === null ? where : `${where} (${text(note)})`
    })
    .join('<br>')
}

const slackCell = (desktop: DesktopFacts, ids: readonly string[]): string => {
  if (ids.length === 0) {
    return NONE
  }

  return ids
    .map((id) => {
      const { example, sender, places } = commandById(desktop, id)
      const where = places.map((place) => labelOf(PLACE_PHRASES, place)).join(' or ')

      return `${code(example)}<br>${SENDER_PHRASES[sender]}, ${where}`
    })
    .join('<br>')
}

// The rule a command follows and what the command table's senders and places mean.
const commandTerms = (desktop: DesktopFacts): string => {
  const { rule, senders, places } = desktop.commands
  const rows = [
    ...senders.map(({ id, description }) => [capitalised(id), text(description)]),
    ...places.map(({ id, description }) => [placeLabel(id), text(description)]),
  ]

  return `${text(rule)}\n\n${table(['Term', 'Meaning'], rows)}`
}

// The exact Slack commands one sender may send, in the grammar's order.
const commandTable = (desktop: DesktopFacts, sender: string): string => {
  const role = desktop.commands.senders.find(({ id }) => id === sender)?.id
  if (role === undefined) {
    throw new FactTableError(`commands takes one sender, ${desktop.commands.senders.map(({ id }) => id).join(' or ')}`)
  }

  return table(
    ['Command', 'Where', 'What it does', 'Example'],
    desktop.commands.commands
      .filter((command) => command.sender === role)
      .map(({ syntax, places, effect, example }) => [
        code(syntax),
        places.map(placeLabel).join(', '),
        text(effect),
        code(example),
      ])
  )
}

const settingsTable = (desktop: DesktopFacts): string =>
  table(
    ['Setting', 'What it holds', 'Default', 'Limits'],
    desktop.settings.fields.map(({ field, description, default: initial, limits }) => [
      code(field),
      text(description),
      text(initial),
      limitsCell(limits),
    ])
  )

// Every change, or the ones named, with each surface that makes it.
const surfacesTable = (desktop: DesktopFacts, types: readonly string[]): string =>
  table(
    ['Change', 'In the window', 'In Slack', 'Setup tool'],
    picked(desktop.settings.mutations, ({ type }) => type, types, 'settings change').map(
      ({ description, window, slackCommands, setupTool }) => [
        text(description),
        windowCell(window),
        slackCell(desktop, slackCommands),
        setupTool === null ? NONE : code(setupTool),
      ]
    )
  )

const setupCommandsTable = (desktop: DesktopFacts): string =>
  table(
    ['Harness', 'Command'],
    desktop['setup-commands'].commands.map(({ name, command }) => [text(name), code(command)])
  )

const detectionTable = (desktop: DesktopFacts): string =>
  table(
    ['Item', 'Set up group', 'Needed', 'Ready shows', 'What Set up says', 'Actions'],
    desktop.detection.items.map(({ name, group, isRequired, readyLabel, about, signInLabel, getIt }) => {
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

const retentionTable = (desktop: DesktopFacts, ids: readonly string[]): string =>
  table(
    ['Record', 'Deleted after'],
    picked(desktop.retention.stores, ({ id }) => id, ids, 'retention store').map(({ description, keptDays }) => [
      text(description),
      keptDays === null ? 'No age limit' : days(keptDays),
    ])
  )

// The rule that deletes Misha's records, then every record it covers with how long it is kept and what it is.
const retentionPolicy = ({ retention }: DesktopFacts): string =>
  [
    disclosureText(retention.rule),
    table(
      ['Record', 'Kept', 'What it is'],
      [
        ...retention.stores.map(({ id, keptDays, description }) => [
          capitalised(id.replaceAll('-', ' ')),
          keptDays === null ? 'No age limit' : days(keptDays),
          disclosureText(description),
        ]),
        [
          'Overwritten files',
          `Newest ${retention.overwrittenBatches.kept} batches`,
          disclosureText(retention.overwrittenBatches.description),
        ],
      ]
    ),
  ].join('\n\n')

// The rule for Misha's files on the Mac, then each path and what it holds.
const pathsTable = ({ paths }: DesktopFacts): string =>
  [
    disclosureText(paths.rule),
    table(
      ['Path', 'What it holds'],
      paths.paths.map(({ path, description }) => [code(path), disclosureText(description)])
    ),
  ].join('\n\n')

const disclosureOf = (disclosures: Readonly<Record<string, Disclosure>>, key: string): Disclosure => {
  const disclosure = disclosures[key]
  if (disclosure === undefined) {
    throw new FactTableError(`The browser disclosures have no entry ${key}`)
  }

  return disclosure
}

const triggersOf = ({ collectionTiming }: Disclosure): string =>
  capitalised(collectionTiming.triggers.map((trigger) => TRIGGER_LABELS[trigger]).join(', '))

// A stable anchor for a declaration: camelCase split, everything but letters and digits a hyphen.
const anchorOf = (key: string): string =>
  key
    .replaceAll(/([a-z])([A-Z])/gu, '$1-$2')
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/gu, '-')
    .replaceAll(/^-|-$/gu, '')

interface IDeclaration {
  heading: string
  anchor: string
  scope: string | null
  disclosure: Disclosure
}

// Every manifest declaration in the manifest's order, with its heading, anchor and disclosure.
const declarationsOf = ({ disclosures, manifest }: IBrowserFacts): IDeclaration[] => [
  ...manifest.permissions.map((permission) => ({
    heading: proseCode(permission),
    anchor: anchorOf(permission),
    scope: null,
    disclosure: disclosureOf(disclosures.permissions, permission),
  })),
  ...manifest.host_permissions.map((host) => ({
    heading: `Host permission ${proseCode(host)}`,
    anchor: anchorOf(host),
    scope: null,
    disclosure: disclosureOf(disclosures.hostPermissions, host),
  })),
  ...manifest.content_scripts.map((script) => ({
    heading: `Content script ${proseCodes(script.js)}`,
    anchor: anchorOf(contentScriptKey(script)),
    scope: `Declared on ${proseCodes(script.matches)}, from ${proseCode(script.run_at)}, in ${WORLD_TEXT[script.world]}, ${script.all_frames ? 'in every frame' : 'in the top frame only'}.`,
    disclosure: disclosureOf(disclosures.contentScripts, contentScriptKey(script)),
  })),
]

const quotedLimits = (browser: IBrowserFacts, { group, key, starts }: IQuotedLimits): string => {
  const disclosure = disclosureOf(browser.disclosures[group], key)

  return starts
    .map((start) => {
      const [limit, ...others] = disclosure.limits.filter((each) => each.startsWith(start))
      if (limit === undefined || others.length > 0) {
        throw new FactTableError(
          `The browser disclosures have ${others.length + (limit === undefined ? 0 : 1)} limits starting "${start}", not one`
        )
      }

      return disclosureText(limit)
    })
    .join(' ')
}

// The first sentence of a disclosure's text, for a one-line summary that quotes it rather than rewording it.
const firstSentence = (value: string): string => value.split(SENTENCE_END)[0] ?? value

const commitLink = ({ source }: IBrowserFacts): string =>
  `[${source.commit.slice(0, 7)}](${BROWSER_REPOSITORY_URL}/commit/${source.commit})`

const browserHoldings = (browser: IBrowserFacts): string =>
  table(
    ['What the extension keeps', 'Where, and for how long'],
    BROWSER_HOLDINGS.map((holding) => [holding.item, quotedLimits(browser, holding)])
  )

const browserExceptions = (browser: IBrowserFacts): string =>
  table(
    ['Limit', 'What the disclosure says', 'Full disclosure'],
    BROWSER_EXCEPTIONS.map((exception) => [
      exception.item,
      quotedLimits(browser, exception),
      `[${code(exception.key)}](#${anchorOf(exception.key)})`,
    ])
  )

const browserDataUsage = ({ disclosures }: IBrowserFacts): string =>
  table(
    ['Data type', 'Handled', 'What the extension handles'],
    disclosures.dataUsage.categories.map(({ category, isHandled, detail }) => [
      category,
      isHandled ? 'Yes' : 'No',
      disclosureText(detail),
    ])
  )

const browserSource = (browser: IBrowserFacts): string =>
  `These come from [\`docs/store-disclosures.json\`](${BROWSER_REPOSITORY_URL}/blob/${browser.source.commit}/docs/store-disclosures.json) and the manifest of the public misha-browser repository at commit ${commitLink(browser)}, the browser extension's version ${proseCode(browser.manifest.version)}, which needs Chrome ${browser.manifest.minimum_chrome_version} or later.`

const browserPermissionTable = (browser: IBrowserFacts): string =>
  table(
    ['Declaration', 'What it lets the extension do', 'When data flows'],
    declarationsOf(browser).map(({ heading, anchor, disclosure }) => [
      `[${heading.replaceAll('|', '\\|')}](#${anchor})`,
      disclosureText(firstSentence(disclosure.capability)),
      triggersOf(disclosure),
    ])
  )

const browserPermissionDetails = (browser: IBrowserFacts): string =>
  declarationsOf(browser)
    .map(({ heading, anchor, scope, disclosure }) =>
      [
        `### ${heading} {#${anchor}}`,
        ...(scope === null ? [] : [scope]),
        `**What it lets the extension do:** ${disclosureText(disclosure.capability)}`,
        `**Why:** ${disclosureText(disclosure.justification)}`,
        `**When data flows:** ${triggersOf(disclosure)}. ${disclosureText(disclosure.collectionTiming.detail)}`,
        `**Limits:**`,
        bullets(disclosure.limits),
      ].join('\n\n')
    )
    .join('\n\n')

const browserSlackTransport = ({ slackTransport }: IBrowserFacts): string =>
  [
    `- Web API methods the extension calls when the Misha app asks: the reads ${proseCodes(slackTransport.readMethods)}, the writes ${proseCodes(slackTransport.writeMethods)}, and for an upload ${proseCodes(slackTransport.uploadMethods)}.`,
    `- Fields a new message keeps when it leaves the page: ${proseCodes(slackTransport.messageFields)}, and the id of each file it shares.`,
    `- A message is new when it has no subtype or one of ${proseCodes(slackTransport.newMessageSubtypes)}.`,
  ].join('\n')

const browserCredentials = ({ disclosures }: IBrowserFacts): string =>
  [
    paragraphs(disclosures.credentialHandling.paragraphs),
    'What the tab commands can return, on the Slack tab or any other:',
    bullets(disclosures.credentialHandling.tabCommandReturns),
    disclosureText(disclosures.credentialHandling.outOfScope),
  ].join('\n\n')

// Renders the table a marker names from the facts and the marker's arguments after the table's name.
type TableRenderer = (facts: IFacts, args: readonly string[], name: string) => string

// A table that takes no arguments.
const fixed =
  (render: (facts: IFacts) => string): TableRenderer =>
  (facts, args, name) => {
    if (args.length > 0) {
      throw new FactTableError(`${name} takes no arguments, not ${args.join(' ')}`)
    }

    return render(facts)
  }

const TABLES: Readonly<Record<string, TableRenderer>> = {
  'command-terms': fixed(({ desktop }) => commandTerms(desktop)),
  commands: ({ desktop }, args) => {
    const [sender, ...extra] = args
    if (sender === undefined || extra.length > 0) {
      throw new FactTableError('commands takes exactly one sender')
    }

    return commandTable(desktop, sender)
  },
  settings: fixed(({ desktop }) => settingsTable(desktop)),
  surfaces: ({ desktop }, args) => surfacesTable(desktop, args),
  'setup-commands': fixed(({ desktop }) => setupCommandsTable(desktop)),
  detection: fixed(({ desktop }) => detectionTable(desktop)),
  retention: ({ desktop }, args) => retentionTable(desktop, args),
  'retention-policy': fixed(({ desktop }) => retentionPolicy(desktop)),
  paths: fixed(({ desktop }) => pathsTable(desktop)),
  'browser-holdings': fixed(({ browser }) => browserHoldings(browser)),
  'browser-exceptions': fixed(({ browser }) => browserExceptions(browser)),
  'browser-recipients': fixed(({ browser }) => disclosureText(browser.disclosures.dataUsage.recipients)),
  'browser-single-purpose': fixed(({ browser }) => `> ${disclosureText(browser.disclosures.singlePurpose)}`),
  'browser-certifications': fixed(({ browser }) =>
    [
      bullets(browser.disclosures.dataUsage.certifications),
      disclosureText(browser.disclosures.dataUsage.limitedUse),
    ].join('\n\n')
  ),
  'browser-data-usage': fixed(({ browser }) => browserDataUsage(browser)),
  'browser-source': fixed(({ browser }) => browserSource(browser)),
  'browser-introduction': fixed(({ browser }) => paragraphs(browser.disclosures.introduction)),
  'browser-permission-table': fixed(({ browser }) => browserPermissionTable(browser)),
  'browser-permission-details': fixed(({ browser }) => browserPermissionDetails(browser)),
  'browser-not-requested': fixed(
    ({ browser }) =>
      `The manifest asks for no other permission. Among those it does not request: ${proseCodes(browser.disclosures.notRequested)}.`
  ),
  'browser-native-messaging': fixed(({ browser }) => paragraphs(browser.disclosures.nativeMessaging)),
  'browser-remote-code': fixed(({ browser }) =>
    [
      `**Uses remote code:** ${browser.disclosures.remoteCode.isUsed ? 'Yes' : 'No'}.`,
      disclosureText(browser.disclosures.remoteCode.statement),
    ].join('\n\n')
  ),
  'browser-slack-transport': fixed(({ browser }) => browserSlackTransport(browser)),
  'browser-credentials': fixed(({ browser }) => browserCredentials(browser)),
}

// Whether an HTML block or inline comment is a facts marker, well formed or not: one that is not is an error, never left
// as a comment.
export const isFactTableMarker = (html: string): boolean => MARKER_START.test(html)

// The Markdown a facts marker stands for, from the committed facts. An unknown table, argument or id is an error.
export const factTableMarkdown = (facts: IFacts, marker: string): string => {
  const words = MARKER.exec(marker)?.groups?.words?.trim().split(/\s+/u)
  const [name, ...args] = words ?? []
  if (name === undefined) {
    throw new FactTableError(`${marker.trim()} is not <!-- facts <table> [<argument> ...] -->`)
  }

  const render = TABLES[name]
  if (render === undefined) {
    throw new FactTableError(`There is no facts table ${name}; use ${Object.keys(TABLES).join(', ')}`)
  }

  return render(facts, args, name)
}

// Each <!-- facts <table> ... --> block of a page replaced by the Markdown it names, rendered from the committed facts
// while the page's Markdown renders. The replacement goes through the full parse, so its headings get anchors, and it is
// in the built HTML, the outline and the local search index, which VitePress all take from the rendered tokens. A marker
// that is malformed, names no table, or sits inside a paragraph instead of on lines of its own stops the build, naming
// the page.
export const expandFactTables =
  (facts: IFacts) =>
  (md: MarkdownRenderer): void => {
    md.core.ruler.push('fact-tables', (state) => {
      const page = (state.env as MarkdownEnv).relativePath
      state.tokens = state.tokens.flatMap((token) => {
        const inline = token.children?.find((child) => child.type === 'html_inline' && isFactTableMarker(child.content))
        if (inline !== undefined) {
          throw new FactTableError(`${page}: ${inline.content.trim()} must stand on lines of its own`)
        }

        if (token.type !== 'html_block' || !isFactTableMarker(token.content)) {
          return [token]
        }

        try {
          return md.parse(factTableMarkdown(facts, token.content), state.env)
        } catch (error) {
          throw new Error(`${page}: ${String(error)}`, { cause: error })
        }
      })
    })
  }
