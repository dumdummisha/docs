import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { z } from 'zod'

import { findingLine, findingsInFile } from './public-data.ts'

// The site's diagrams: Mermaid sources in diagrams/, rendered to static SVG in src/public/diagrams/ by
// pnpm render:diagrams, so readers get an image and no Mermaid runtime. Rendering needs a headless browser, which the
// deployment's build does not have, so the SVGs are committed and every build checks that each still names the hash
// of the source it was rendered from. An SVG without that header was drawn by hand: it has no source, and neither the
// check nor the render touches it.

export const DIAGRAMS_DIRECTORY = 'diagrams'
export const RENDERED_DIRECTORY = 'src/public/diagrams'
const MERMAID_CONFIG = `${DIAGRAMS_DIRECTORY}/mermaid.json`
const SOURCE_EXTENSION = '.mmd'
const RENDERED_EXTENSION = '.svg'
const MERMAID_CLI = '@mermaid-js/mermaid-cli@11.17.0'
// Mermaid writes this into an otherwise valid SVG, with exit status 0, when a statement does not parse.
const SYNTAX_ERROR = 'Syntax error'
// The part of the Mermaid configuration the renderer reads itself: the theme's background, which the SVG is drawn on, so
// the diagram's canvas and its theme come from one place.
const MERMAID_BACKGROUND_SCHEMA = z.object({
  themeVariables: z.object({ background: z.string().regex(/^#[0-9a-f]{6}$/u) }),
})
const RENDERED_FROM = /^<!-- Rendered by pnpm render:diagrams from (?<source>\S+), sha256 (?<hash>[0-9a-f]{64})\. -->\n/u

export interface IDiagramFinding {
  diagram: string
  problem: 'not rendered' | 'rendered from another version of its source' | 'rendered without a source'
}

const sha256 = (bytes: Buffer): string => createHash('sha256').update(bytes).digest('hex')

const namesIn = async (directory: string, extension: string): Promise<string[]> =>
  existsSync(directory)
    ? (await readdir(directory)).filter((name) => name.endsWith(extension)).map((name) => name.slice(0, -extension.length)).sort()
    : []

// The SVGs pnpm render:diagrams wrote, told from hand-drawn ones by the header it writes first.
const renderedNamesIn = async (root: string): Promise<string[]> => {
  const names = await namesIn(join(root, RENDERED_DIRECTORY), RENDERED_EXTENSION)
  const svgs = await Promise.all(names.map((name) => readFile(join(root, RENDERED_DIRECTORY, `${name}${RENDERED_EXTENSION}`), 'utf8')))

  return names.filter((_, index) => RENDERED_FROM.test(svgs[index] ?? ''))
}

// The background the theme in diagrams/mermaid.json names, refused unless it is one #rrggbb colour.
export const renderBackgroundOf = async (root: string): Promise<string> => {
  const result = MERMAID_BACKGROUND_SCHEMA.safeParse(JSON.parse(await readFile(join(root, MERMAID_CONFIG), 'utf8')))
  if (!result.success) {
    throw new Error(`${MERMAID_CONFIG} names no theme background as one #rrggbb colour: ${z.prettifyError(result.error)}`)
  }

  return result.data.themeVariables.background
}

const renderedFromLine = (source: string, bytes: Buffer): string =>
  `<!-- Rendered by pnpm render:diagrams from ${source}, sha256 ${sha256(bytes)}. -->\n`

// Every diagram whose SVG is missing, was rendered from another version of its source, or has no source any more.
export const diagramFindings = async (root: string): Promise<IDiagramFinding[]> => {
  const sources = await namesIn(join(root, DIAGRAMS_DIRECTORY), SOURCE_EXTENSION)
  const svgs = await namesIn(join(root, RENDERED_DIRECTORY), RENDERED_EXTENSION)
  const rendered = await renderedNamesIn(root)
  const findings = await Promise.all(
    sources.map(async (diagram): Promise<IDiagramFinding[]> => {
      if (!svgs.includes(diagram)) {
        return [{ diagram, problem: 'not rendered' }]
      }
      const source = `${DIAGRAMS_DIRECTORY}/${diagram}${SOURCE_EXTENSION}`
      const svg = await readFile(join(root, RENDERED_DIRECTORY, `${diagram}${RENDERED_EXTENSION}`), 'utf8')
      const header = RENDERED_FROM.exec(svg)
      const isCurrent =
        header?.groups?.source === source && header.groups.hash === sha256(await readFile(join(root, source)))

      return isCurrent ? [] : [{ diagram, problem: 'rendered from another version of its source' }]
    })
  )
  const orphans = rendered
    .filter((diagram) => !sources.includes(diagram))
    .map((diagram): IDiagramFinding => ({ diagram, problem: 'rendered without a source' }))

  return [...findings.flat(), ...orphans]
}

// Renders every diagram with the pinned Mermaid CLI, refusing one that did not parse or that fails the public-data
// scan, and deletes rendered SVGs whose source is gone. Nothing is written until every diagram renders.
export const renderDiagrams = async (root: string): Promise<string[]> => {
  const sources = await namesIn(join(root, DIAGRAMS_DIRECTORY), SOURCE_EXTENSION)
  const background = await renderBackgroundOf(root)
  const scratch = await mkdtemp(join(tmpdir(), 'diagrams-'))
  try {
    const svgs = await Promise.all(
      sources.map(async (diagram) => {
        const source = `${DIAGRAMS_DIRECTORY}/${diagram}${SOURCE_EXTENSION}`
        const output = join(scratch, `${diagram}${RENDERED_EXTENSION}`)
        execFileSync(
          'npx',
          ['-y', MERMAID_CLI, '-i', join(root, source), '-o', output, '-c', join(root, MERMAID_CONFIG), '-b', background, '-q'],
          { stdio: ['ignore', 'ignore', 'inherit'] }
        )
        const svg = await readFile(output, 'utf8')
        if (svg.includes(SYNTAX_ERROR)) {
          throw new Error(`${source} does not parse: Mermaid rendered "${SYNTAX_ERROR}"`)
        }
        const target = `${RENDERED_DIRECTORY}/${diagram}${RENDERED_EXTENSION}`
        const bytes = Buffer.from(`${renderedFromLine(source, await readFile(join(root, source)))}${svg}`)
        const findings = findingsInFile(target, bytes)
        if (findings.length > 0) {
          throw new Error(`${target} fails the public-data scan:\n${findings.map(findingLine).join('\n')}`)
        }

        return [target, bytes] as const
      })
    )

    await mkdir(join(root, RENDERED_DIRECTORY), { recursive: true })
    const orphans = (await renderedNamesIn(root)).filter((name) => !sources.includes(name))
    await Promise.all(orphans.map((name) => rm(join(root, RENDERED_DIRECTORY, `${name}${RENDERED_EXTENSION}`))))
    await Promise.all(svgs.map(([target, bytes]) => writeFile(join(root, target), bytes)))

    return svgs.map(([target]) => target)
  } finally {
    await rm(scratch, { recursive: true, force: true })
  }
}

if (import.meta.main) {
  const [command] = process.argv.slice(2)
  if (command === 'render') {
    const written = await renderDiagrams(process.cwd())
    console.log(`Rendered ${written.length} diagram(s):\n${written.join('\n')}`)
  } else if (command === 'check') {
    const findings = await diagramFindings(process.cwd())
    for (const { diagram, problem } of findings) {
      console.error(`${DIAGRAMS_DIRECTORY}/${diagram}${SOURCE_EXTENSION}: ${problem}`)
    }
    if (findings.length > 0) {
      console.error('The diagram check failed: run pnpm render:diagrams and commit the SVGs')
      process.exit(1)
    }
    console.log('Every diagram is rendered from its current source')
  } else {
    console.error('Usage: node scripts/diagrams.ts <render|check>')
    process.exit(1)
  }
}
