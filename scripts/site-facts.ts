import { readdir, readFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'

import { z } from 'zod'

export const CAPTURES_FILE = 'captures.json'

const SHA256 = z.string().regex(/^[0-9a-f]{64}$/u)

// How the desktop export took its screenshots: the browser, window size and scale, the frozen clock and the data set.
const RECIPE_SCHEMA = z.strictObject({
  version: z.int().positive(),
  browser: z.string().min(1),
  window: z.strictObject({ width: z.int().positive(), height: z.int().positive(), scale: z.int().positive() }),
  clock: z.string().min(1),
  data: z.string().min(1),
})

// One committed screenshot of the desktop app, as the export describes it and <Shot> shows it. The region is the whole
// page, the window's first screen, or one element of the page by its id.
export const CAPTURE_SCHEMA = z.strictObject({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u),
  scenario: z.string().min(1),
  page: z.string().min(1),
  region: z.discriminatedUnion('kind', [
    z.strictObject({ kind: z.literal('page') }),
    z.strictObject({ kind: z.literal('window') }),
    z.strictObject({ kind: z.literal('element'), id: z.string().min(1) }),
  ]),
  file: z.string().regex(/^captures\/[a-z0-9]+(?:-[a-z0-9]+)*\.png$/u),
  width: z.int().positive(),
  height: z.int().positive(),
  sha256: SHA256,
  alt: z.string().min(1),
  people: z.array(z.string().min(1)),
  text: z.string(),
})

export const CAPTURES_SCHEMA = z.strictObject({ recipe: RECIPE_SCHEMA, captures: z.array(CAPTURE_SCHEMA) })

export type Capture = z.infer<typeof CAPTURE_SCHEMA>
export type CaptureList = z.infer<typeof CAPTURES_SCHEMA>
export type FactValue = string | number | boolean

// What a page needs to show a capture; the rest of its entry stays out of the client bundle.
export type SiteShot = Pick<Capture, 'file' | 'width' | 'height' | 'alt'>

// What pages can show: captures by id and every scalar fact by its dotted name.
export interface ISiteFacts {
  shots: Record<string, SiteShot>
  facts: Record<string, FactValue>
}

export const captureListOf = (manifest: unknown): CaptureList => {
  const list = CAPTURES_SCHEMA.parse(manifest)
  const ids = list.captures.map((capture) => capture.id)
  const duplicate = ids.find((id, index) => ids.indexOf(id) !== index)
  if (duplicate !== undefined) {
    throw new Error(`${CAPTURES_FILE} lists the capture ${duplicate} more than once`)
  }

  return list
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
  const { captures } = captureListOf(JSON.parse(await readFile(join(factsDirectory, CAPTURES_FILE), 'utf8')))
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
    shots: Object.fromEntries(
      captures.map(({ id, file, width, height, alt }) => [id, { file, width, height, alt }])
    ),
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
