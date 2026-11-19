import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

import { pngFixture } from './png-fixture.ts'

export interface IManifestEntry {
  path: string
  bytes: number
  sha256: string
}

export type ExportFiles = Readonly<Record<string, string | Buffer>>

export const HOME_PNG = pngFixture(1100, 760)

export const sha256 = (bytes: Buffer): string => createHash('sha256').update(bytes).digest('hex')

const RECIPE = {
  version: 1,
  browser: 'Brave, headless',
  window: { width: 1100, height: 760, scale: 2 },
  clock: '14:14 on 19 November 2026, local time',
  data: 'Made-up docs fixtures: Leo Novak, Emma Lee and Max Becker in the Shop workspace.',
}

export const HOME_CAPTURE = {
  id: 'home',
  scenario: 'home',
  page: 'home',
  region: { kind: 'window' },
  file: 'captures/home.png',
  width: 1100,
  height: 760,
  sha256: sha256(HOME_PNG),
  alt: 'Misha is listening as Leo Novak; Pause Misha is in the rail.',
  text: 'Listening as Leo Novak',
}

export const capturesJson = (captures: readonly object[]): string => JSON.stringify({ recipe: RECIPE, captures })

// One valid file of every kind an export holds, by its path in the bundle, without the manifest.
export const EXPORT_FILES: ExportFiles = {
  'captures.json': capturesJson([HOME_CAPTURE]),
  'captures/home.png': HOME_PNG,
  'facts/commands.json': JSON.stringify({
    rule: 'A command is the whole message.',
    senders: [{ id: 'owner', description: 'The person whose clone it is.' }],
    places: [{ id: 'self-dm', description: 'Your self-DM.' }],
    commands: [
      { id: 'pause', syntax: 'pause', sender: 'owner', places: ['self-dm'], effect: 'Misha pauses.', example: 'pause', mutation: 'pause' },
    ],
  }),
  'facts/settings.json': JSON.stringify({
    fields: [{ field: 'personality', description: 'How the clone sounds.', default: 'Empty.', limits: { maxCharacters: 2000 } }],
    mutations: [
      {
        type: 'pause',
        description: 'Pause Misha.',
        setting: null,
        window: [{ page: 'rail', section: null, control: 'Pause Misha', note: null }],
        slackCommands: ['pause'],
        setupTool: 'misha_pause',
      },
    ],
  }),
  'facts/detection.json': JSON.stringify({
    items: [
      {
        item: 'git',
        name: 'git',
        about: 'I keep my copies of your repositories with it.',
        readyLabel: 'Found',
        isRequired: true,
        group: 'How I work in your code',
        signIn: null,
        signInLabel: null,
        getIt: null,
      },
    ],
  }),
  'facts/retention.json': JSON.stringify({
    rule: 'Cleanup deletes these.',
    stores: [{ id: 'outcomes', keptDays: 30, description: 'How the clone closed each message.' }],
    overwrittenBatches: { kept: 10, description: 'What the installers moved aside.' },
  }),
  'facts/paths.json': JSON.stringify({
    home: '~/.misha',
    rule: 'Everything lives under ~/.misha.',
    paths: [{ id: 'database', path: '~/.misha/misha.db', description: 'The settings.' }],
  }),
  'facts/setup-commands.json': JSON.stringify({
    commands: [{ harness: 'claude-code', name: 'Claude Code', command: '/misha-core:misha-setup' }],
  }),
}

export const digestOf = (entries: readonly IManifestEntry[]): string =>
  sha256(Buffer.from(entries.map((entry) => `${entry.sha256}  ${entry.path}`).join('\n')))

// The files with a manifest listing them, or listing the entries a test supplies instead.
export const withManifest = (files: ExportFiles, listed?: readonly IManifestEntry[]): ExportFiles => {
  const entries =
    listed ??
    Object.entries(files)
      .sort(([first], [second]) => first.localeCompare(second))
      .map(([path, content]) => ({ path, bytes: Buffer.from(content).length, sha256: sha256(Buffer.from(content)) }))
  const manifest = {
    exportSchemaVersion: 2,
    productVersion: '0.1.0',
    evidenceDate: '2026-11-19',
    captureRecipeVersion: 1,
    digest: digestOf(entries),
    files: entries,
  }

  return { ...files, 'manifest.json': JSON.stringify(manifest) }
}

// Writes each file under the directory, at the path the pathOf function gives it.
export const writeFiles = async (
  directory: string,
  files: ExportFiles,
  pathOf: (file: string) => string = (file) => file
): Promise<void> => {
  await Promise.all(
    Object.entries(files).map(async ([file, content]) => {
      const path = join(directory, pathOf(file))
      await mkdir(dirname(path), { recursive: true })
      await writeFile(path, content)
    })
  )
}
