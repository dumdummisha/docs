import { type Capture, committedExportOf } from './desktop-export.ts'

export type FactValue = string | number | boolean

// What a page needs to show a capture; the rest of its entry stays out of the client bundle.
export type SiteShot = Pick<Capture, 'file' | 'width' | 'height' | 'alt'>

// What pages can show: captures by id and every scalar fact by its dotted name.
export interface ISiteFacts {
  shots: Record<string, SiteShot>
  facts: Record<string, FactValue>
}

// The keys an exported list names its items by: commands, paths and stores by id, settings by field, detection items by
// item, setup commands by harness, settings mutations by type.
const KEY_NAMES = ['id', 'field', 'item', 'harness', 'type'] as const

const idOf = (item: unknown): string | undefined => {
  if (typeof item !== 'object' || item === null) {
    return undefined
  }
  const key = KEY_NAMES.find((name) => name in item)
  const value = key === undefined ? undefined : (item as Record<string, unknown>)[key]

  return typeof value === 'string' ? value : undefined
}

// An array whose every item has a key names its items by that key, so an item the export inserts or reorders cannot
// move a page's fact onto another item; any other array names its items by position.
const namedItemsOf = (prefix: string, items: readonly unknown[]): [string, unknown][] => {
  const byId = items.flatMap((item): [string, unknown][] => {
    const id = idOf(item)

    return id === undefined ? [] : [[id, item]]
  })
  if (items.length === 0 || byId.length < items.length) {
    return items.map((item, index) => [String(index), item])
  }
  const ids = byId.map(([id]) => id)
  const duplicate = ids.find((id, index) => ids.indexOf(id) !== index)
  if (duplicate !== undefined) {
    throw new Error(`${prefix} holds the id ${duplicate} more than once`)
  }

  return byId
}

const scalarsOf = (prefix: string, value: unknown): [string, FactValue][] => {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return [[prefix, value]]
  }
  if (typeof value === 'object' && value !== null) {
    const entries = Array.isArray(value) ? namedItemsOf(prefix, value) : Object.entries(value)

    return entries.flatMap(([key, item]) => scalarsOf(`${prefix}.${key}`, item))
  }

  return []
}

// Facts and captures from the committed desktop export, revalidated first. A fact's name is desktop., its document's
// name and its key path, joined with dots, with an item of an array of ids named by its id: retention.json holding
// { "rule": "...", "stores": [{ "id": "outcomes", "keptDays": 30 }] } gives desktop.retention.rule and
// desktop.retention.stores.outcomes.keptDays.
export const loadSiteFacts = async (root: string): Promise<ISiteFacts> => {
  const { manifest, captureList, facts } = await committedExportOf(root)
  const documents = { ...facts, manifest }

  return {
    shots: Object.fromEntries(
      captureList.captures.map(({ id, file, width, height, alt }) => [id, { file, width, height, alt }])
    ),
    facts: Object.fromEntries(Object.entries(documents).flatMap(([name, document]) => scalarsOf(`desktop.${name}`, document))),
  }
}

const attributesIn = (html: string, component: 'Fact' | 'Shot', attribute: string): string[] =>
  [...html.matchAll(new RegExp(`<${component}\\b[^>]*?\\b${attribute}="(?<value>[^"]*)"`, 'gu'))].map(
    (match) => match.groups?.value ?? ''
  )

// Refuses a <Shot id> or <Fact name> in a page's HTML that the site does not hold, naming it and the page. The build
// runs this while it renders Markdown, because VitePress logs a component's render error without failing the build.
export const checkPageComponents = (html: string, page: string, site: ISiteFacts): void => {
  for (const id of attributesIn(html, 'Shot', 'id')) {
    if (site.shots[id] === undefined) {
      throw new Error(`${page} shows the capture ${id}, which facts/captures.json does not list`)
    }
  }
  for (const name of attributesIn(html, 'Fact', 'name')) {
    if (site.facts[name] === undefined) {
      throw new Error(`${page} asks for the fact ${name}, which facts/ does not hold`)
    }
  }
}
