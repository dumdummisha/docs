import { readdir, readFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'

import { z } from 'zod'

export const CAPTURES_FILE = 'captures.json'

// One committed screenshot of the desktop app, as the export describes it and <Shot> shows it.
export const CAPTURE_SCHEMA = z.strictObject({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u),
  scenario: z.string().min(1),
  file: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*\.png$/u),
  width: z.int().positive(),
  height: z.int().positive(),
  sha256: z.string().regex(/^[0-9a-f]{64}$/u),
  alt: z.string().min(1),
  visibleText: z.string(),
})

export const CAPTURES_SCHEMA = z.strictObject({ captures: z.array(CAPTURE_SCHEMA) })

export type Capture = z.infer<typeof CAPTURE_SCHEMA>
export type FactValue = string | number | boolean

// What pages can show: captures by id and every scalar fact by its dotted name.
export interface ISiteFacts {
  shots: Record<string, Capture>
  facts: Record<string, FactValue>
}

export const capturesOf = (manifest: unknown): Capture[] => {
  const { captures } = CAPTURES_SCHEMA.parse(manifest)
  const ids = captures.map((capture) => capture.id)
  const duplicate = ids.find((id, index) => ids.indexOf(id) !== index)
  if (duplicate !== undefined) {
    throw new Error(`${CAPTURES_FILE} lists the capture ${duplicate} more than once`)
  }

  return captures
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

// Facts from the JSON files under facts/ other than captures.json. A fact's name is its file's path under facts/
// without .json, then its key path, joined with dots: retention.json under desktop/ holding { "outcomeDays": 30 } gives
// desktop.retention.outcomeDays.
export const loadSiteFacts = async (factsDirectory: string): Promise<ISiteFacts> => {
  const captures = capturesOf(JSON.parse(await readFile(join(factsDirectory, CAPTURES_FILE), 'utf8')))
  const entries = await readdir(factsDirectory, { recursive: true, withFileTypes: true })
  const factFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => join(entry.parentPath, entry.name))
    .filter((file) => file !== join(factsDirectory, CAPTURES_FILE))
  const facts = await Promise.all(
    factFiles.map(async (file) => {
      const prefix = relative(factsDirectory, file).replace(/\.json$/u, '').split(sep).join('.')

      return scalarsOf(prefix, JSON.parse(await readFile(file, 'utf8')))
    })
  )

  return {
    shots: Object.fromEntries(captures.map((capture) => [capture.id, capture])),
    facts: Object.fromEntries(facts.flat()),
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
