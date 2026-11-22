import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { diagramFindings, renderBackgroundOf } from './diagrams.ts'

const directories: string[] = []
const SOURCE = 'flowchart TB\n  a["A"] --> b["B"]\n'

const sha256 = (text: string): string => createHash('sha256').update(text).digest('hex')

const renderedFrom = (source: string): string =>
  `<!-- Rendered by pnpm render:diagrams from diagrams/flow.mmd, sha256 ${sha256(source)}. -->\n<svg></svg>`

// A repository with the diagram sources and rendered SVGs given, by name.
const repository = async (sources: Record<string, string>, svgs: Record<string, string>): Promise<string> => {
  const root = await mkdtemp(join(tmpdir(), 'docs-root-'))
  directories.push(root)
  await mkdir(join(root, 'diagrams'))
  await mkdir(join(root, 'src/public/diagrams'), { recursive: true })
  await Promise.all([
    ...Object.entries(sources).map(([name, text]) => writeFile(join(root, 'diagrams', `${name}.mmd`), text)),
    ...Object.entries(svgs).map(([name, text]) => writeFile(join(root, 'src/public/diagrams', `${name}.svg`), text)),
  ])

  return root
}

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

describe('[scripts] Diagrams - diagramFindings', () => {
  it('should pass an SVG rendered from the current source', async () => {
    // Arrange
    const root = await repository({ flow: SOURCE }, { flow: renderedFrom(SOURCE) })

    // Act + Assert
    expect(await diagramFindings(root)).toStrictEqual([])
  })

  it('should report a source edited since its SVG was rendered, a missing SVG and an SVG without a source', async () => {
    // Arrange
    const root = await repository(
      { flow: `${SOURCE}  b --> c["C"]\n`, fresh: SOURCE },
      { flow: renderedFrom(SOURCE), old: renderedFrom(SOURCE) }
    )

    // Act + Assert
    expect(await diagramFindings(root)).toStrictEqual([
      { diagram: 'flow', problem: 'rendered from another version of its source' },
      { diagram: 'fresh', problem: 'not rendered' },
      { diagram: 'old', problem: 'rendered without a source' },
    ])
  })

  it('should leave a hand-drawn SVG, which has no render header, out of the check', async () => {
    // Arrange
    const root = await repository({ flow: SOURCE }, { flow: renderedFrom(SOURCE), drawn: '<svg><title>Drawn</title></svg>' })

    // Act + Assert
    expect(await diagramFindings(root)).toStrictEqual([])
  })

  it('should report a hand-drawn SVG that has the name of a source as not rendered from it', async () => {
    // Arrange
    const root = await repository({ flow: SOURCE }, { flow: '<svg><title>Drawn</title></svg>' })

    // Act + Assert
    expect(await diagramFindings(root)).toStrictEqual([
      { diagram: 'flow', problem: 'rendered from another version of its source' },
    ])
  })
})

describe('[scripts] Diagrams - renderBackgroundOf', () => {
  it("should draw the SVG on the theme's background", async () => {
    // Arrange
    const root = await repository({}, {})
    await writeFile(join(root, 'diagrams/mermaid.json'), JSON.stringify({ theme: 'base', themeVariables: { background: '#fffef8' } }))

    // Act + Assert
    expect(await renderBackgroundOf(root)).toBe('#fffef8')
  })

  it('should refuse a configuration whose theme names no background as one #rrggbb colour', async () => {
    // Arrange
    const root = await repository({}, {})
    await writeFile(join(root, 'diagrams/mermaid.json'), JSON.stringify({ themeVariables: { background: 'white' } }))

    // Act + Assert
    await expect(renderBackgroundOf(root)).rejects.toThrow('names no theme background as one #rrggbb colour')
  })
})
