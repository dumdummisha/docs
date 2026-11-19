import {
  type CollectionTrigger,
  type ContentScript,
  contentScriptKey,
  type Disclosure,
  type IBrowserFacts,
} from './browser-facts.ts'
import { type DesktopFacts } from './desktop-export.ts'
import { BROWSER_REPOSITORY_URL } from './site.ts'

// Markdown generated from facts/ that pages place with a line holding only <!--@generated: name-->, so a table or a
// disclosure on a page is the committed fact itself, not a retyped copy. The fragments are expanded before the page's
// Markdown is parsed, so their headings get anchors, enter the outline and the local search index like written ones.

const MARKER = /^<!--@generated: (?<name>[a-z0-9-]+)-->$/gmu
// Markdown and HTML characters escaped outside code spans; a pipe is escaped inside them too, so table cells hold it.
const MARKDOWN_SPECIAL = /[\\*_[\]<>|]/gu
const CODE_SPAN = /(`[^`]*`)/u
// Vue reads a double brace in a page as an expression.
const VUE_INTERPOLATION = '{{'
// A full stop that ends a sentence, outside a code span or a name such as misha.browser_bridge.
const SENTENCE_END = /(?<=\.) (?=[A-Z])/u

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

export class FragmentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FragmentError'
  }
}

const disclosureOf = (disclosures: Readonly<Record<string, Disclosure>>, key: string): Disclosure => {
  const disclosure = disclosures[key]
  if (disclosure === undefined) {
    throw new FragmentError(`The browser disclosures have no entry ${key}`)
  }

  return disclosure
}

// Source text as inline Markdown: code spans kept, Markdown and HTML characters escaped elsewhere.
const inline = (text: string): string => {
  if (text.includes(VUE_INTERPOLATION)) {
    throw new FragmentError(`A fact holds ${VUE_INTERPOLATION}, which a page would evaluate: ${text}`)
  }

  return text
    .split(CODE_SPAN)
    .map((part) => (part.startsWith('`') ? part.replaceAll('|', '\\|') : part.replaceAll(MARKDOWN_SPECIAL, '\\$&')))
    .join('')
}

const code = (text: string): string => `\`${text}\``

const codeList = (items: readonly string[]): string => items.map(code).join(', ')

const sentenceCase = (text: string): string => `${text.charAt(0).toUpperCase()}${text.slice(1)}`

const table = (header: readonly string[], rows: readonly (readonly string[])[]): string =>
  [header, header.map(() => '---'), ...rows].map((cells) => `| ${cells.join(' | ')} |`).join('\n')

const bullets = (items: readonly string[]): string => items.map((item) => `- ${inline(item)}`).join('\n')

const paragraphs = (items: readonly string[]): string => items.map(inline).join('\n\n')

const triggersOf = ({ collectionTiming }: Disclosure): string =>
  sentenceCase(collectionTiming.triggers.map((trigger) => TRIGGER_LABELS[trigger]).join(', '))

// A stable anchor for a declaration: camelCase split, everything but letters and digits a hyphen.
const anchorOf = (key: string): string =>
  key
    .replaceAll(/([a-z])([A-Z])/gu, '$1-$2')
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/gu, '-')
    .replaceAll(/^-|-$/gu, '')

// Every manifest declaration in the manifest's order, with its heading, anchor and disclosure.
const declarationsOf = ({ disclosures, manifest }: IBrowserFacts): { heading: string; anchor: string; scope: string | null; disclosure: Disclosure }[] => [
  ...manifest.permissions.map((permission) => ({
    heading: code(permission),
    anchor: anchorOf(permission),
    scope: null,
    disclosure: disclosureOf(disclosures.permissions, permission),
  })),
  ...manifest.host_permissions.map((host) => ({
    heading: `Host permission ${code(host)}`,
    anchor: anchorOf(host),
    scope: null,
    disclosure: disclosureOf(disclosures.hostPermissions, host),
  })),
  ...manifest.content_scripts.map((script) => ({
    heading: `Content script ${codeList(script.js)}`,
    anchor: anchorOf(contentScriptKey(script)),
    scope: `Declared on ${codeList(script.matches)}, from ${code(script.run_at)}, in ${WORLD_TEXT[script.world]}, ${script.all_frames ? 'in every frame' : 'in the top frame only'}.`,
    disclosure: disclosureOf(disclosures.contentScripts, contentScriptKey(script)),
  })),
]

const quotedLimits = (browser: IBrowserFacts, { group, key, starts }: IQuotedLimits): string => {
  const disclosure = disclosureOf(browser.disclosures[group], key)

  return starts
    .map((start) => {
      const [limit, ...others] = disclosure.limits.filter((each) => each.startsWith(start))
      if (limit === undefined || others.length > 0) {
        throw new FragmentError(`The browser disclosures have ${others.length + (limit === undefined ? 0 : 1)} limits starting "${start}", not one`)
      }

      return inline(limit)
    })
    .join(' ')
}

// The first sentence of a disclosure's text, for a one-line summary that quotes it rather than rewording it.
const firstSentence = (text: string): string => text.split(SENTENCE_END)[0] ?? text

const days = (count: number): string => (count === 1 ? '1 day' : `${count} days`)

const commitLink = ({ source }: IBrowserFacts): string =>
  `[${source.commit.slice(0, 7)}](${BROWSER_REPOSITORY_URL}/commit/${source.commit})`

// Every fragment by name, rendered once from the verified facts.
export const fragmentsOf = (desktop: DesktopFacts, browser: IBrowserFacts): Record<string, string> => {
  const { disclosures, slackTransport } = browser
  const { paths, retention } = desktop

  return {
    'desktop-paths': [
      inline(paths.rule),
      table(
        ['Path', 'What it holds'],
        paths.paths.map(({ path, description }) => [code(path), inline(description)])
      ),
    ].join('\n\n'),
    'desktop-retention': [
      inline(retention.rule),
      table(
        ['Record', 'Kept', 'What it is'],
        [
          ...retention.stores.map(({ id, keptDays, description }) => [
            sentenceCase(id.replaceAll('-', ' ')),
            keptDays === null ? 'No age limit' : days(keptDays),
            inline(description),
          ]),
          ['Overwritten files', `Newest ${retention.overwrittenBatches.kept} batches`, inline(retention.overwrittenBatches.description)],
        ]
      ),
    ].join('\n\n'),
    'browser-holdings': table(
      ['What the extension keeps', 'Where, and for how long'],
      BROWSER_HOLDINGS.map((holding) => [holding.item, quotedLimits(browser, holding)])
    ),
    'browser-exceptions': table(
      ['Limit', 'What the disclosure says', 'Full disclosure'],
      BROWSER_EXCEPTIONS.map((exception) => [
        exception.item,
        quotedLimits(browser, exception),
        `[${code(exception.key)}](#${anchorOf(exception.key)})`,
      ])
    ),
    'browser-recipients': inline(disclosures.dataUsage.recipients),
    'browser-single-purpose': `> ${inline(disclosures.singlePurpose)}`,
    'browser-certifications': [bullets(disclosures.dataUsage.certifications), inline(disclosures.dataUsage.limitedUse)].join('\n\n'),
    'browser-data-usage': table(
      ['Data type', 'Handled', 'What the extension handles'],
      disclosures.dataUsage.categories.map(({ category, isHandled, detail }) => [category, isHandled ? 'Yes' : 'No', inline(detail)])
    ),
    'browser-source': `These come from [\`docs/store-disclosures.json\`](${BROWSER_REPOSITORY_URL}/blob/${browser.source.commit}/docs/store-disclosures.json) and the manifest of the public misha-browser repository at commit ${commitLink(browser)}, the browser extension's version ${code(browser.manifest.version)}, which needs Chrome ${browser.manifest.minimum_chrome_version} or later.`,
    'browser-introduction': paragraphs(disclosures.introduction),
    'browser-permission-table': table(
      ['Declaration', 'What it lets the extension do', 'When data flows'],
      declarationsOf(browser).map(({ heading, anchor, disclosure }) => [
        `[${heading.replaceAll('|', '\\|')}](#${anchor})`,
        inline(firstSentence(disclosure.capability)),
        triggersOf(disclosure),
      ])
    ),
    'browser-permission-details': declarationsOf(browser)
      .map(({ heading, anchor, scope, disclosure }) =>
        [
          `### ${heading} {#${anchor}}`,
          ...(scope === null ? [] : [scope]),
          `**What it lets the extension do:** ${inline(disclosure.capability)}`,
          `**Why:** ${inline(disclosure.justification)}`,
          `**When data flows:** ${triggersOf(disclosure)}. ${inline(disclosure.collectionTiming.detail)}`,
          `**Limits:**`,
          bullets(disclosure.limits),
        ].join('\n\n')
      )
      .join('\n\n'),
    'browser-not-requested': `The manifest asks for no other permission. Among those it does not request: ${codeList(disclosures.notRequested)}.`,
    'browser-native-messaging': paragraphs(disclosures.nativeMessaging),
    'browser-remote-code': [`**Uses remote code:** ${disclosures.remoteCode.isUsed ? 'Yes' : 'No'}.`, inline(disclosures.remoteCode.statement)].join('\n\n'),
    'browser-slack-transport': [
      `- Web API methods the extension calls when the Misha app asks: the reads ${codeList(slackTransport.readMethods)}, the writes ${codeList(slackTransport.writeMethods)}, and for an upload ${codeList(slackTransport.uploadMethods)}.`,
      `- Fields a new message keeps when it leaves the page: ${codeList(slackTransport.messageFields)}, and the id of each file it shares.`,
      `- A message is new when it has no subtype or one of ${codeList(slackTransport.newMessageSubtypes)}.`,
    ].join('\n'),
    'browser-credentials': [
      paragraphs(disclosures.credentialHandling.paragraphs),
      'What the tab commands can return, on the Slack tab or any other:',
      bullets(disclosures.credentialHandling.tabCommandReturns),
      inline(disclosures.credentialHandling.outOfScope),
    ].join('\n\n'),
  }
}

// A page's Markdown with every <!--@generated: name--> line replaced by its fragment; an unknown name stops the build,
// naming it and the page.
export const expandFragments = (markdown: string, fragments: Readonly<Record<string, string>>, page: string): string =>
  markdown.replaceAll(MARKER, (_line, name: string) => {
    const fragment = fragments[name]
    if (fragment === undefined) {
      throw new FragmentError(`${page} places the generated fragment ${name}, which does not exist`)
    }

    return fragment
  })
