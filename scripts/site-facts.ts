import { type Capture, committedExportOf } from './desktop-export.ts'

export type FactValue = string | number | boolean

// What a page needs to show a capture; the rest of its entry stays out of the client bundle.
export type SiteShot = Pick<Capture, 'file' | 'width' | 'height' | 'alt'>

// What pages can show: captures by id and every scalar fact by its dotted name.
export interface ISiteFacts {
  shots: Record<string, SiteShot>
  facts: Record<string, FactValue>
}

const scalarsOf = (prefix: string, value: unknown): [string, FactValue][] => {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return [[prefix, value]]
  }
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).flatMap(([key, item]) => scalarsOf(`${prefix}.${key}`, item))
  }

  return []
}

// Facts and captures from the committed desktop export, revalidated first. A fact's name is desktop., its document's
// name and its key path, joined with dots: retention.json holding { "rule": "..." } gives desktop.retention.rule.
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
