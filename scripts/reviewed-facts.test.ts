import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { committedReviewedFactsOf, REVIEWED_FACTS_DIRECTORY } from './reviewed-facts.ts'

const FIGMA_READ = {
  id: 'design-read',
  request: 'Render a Figma screen',
  routes: [{ availability: 'included', actor: 'clone', surface: 'in its own turn' }],
  access: 'anyone',
  needs: ['Figma on Set up'],
  result: 'The image in the reply',
  limit: 'Reads and renders only.',
}

const CAPABILITY_RECORD = {
  productVersion: '0.1.0',
  evidenceDate: '2026-11-19',
  browserRevision: '9cba991',
  capabilities: [FIGMA_READ],
}

const QUICK_ANSWER = {
  id: 'quick-answer',
  name: 'Quick answer',
  trigger: 'One bounded read',
  actor: 'clone',
  access: 'anyone',
  needs: ['The connection that holds the answer'],
  projectCommands: [],
  review: null,
  endpoints: [{ kind: 'result', outcome: 'A marked reply', when: 'The read answers it' }],
}

const WORKFLOW_RECORD = { productVersion: '0.1.0', evidenceDate: '2026-11-19', workflows: [QUICK_ANSWER] }

const directories: string[] = []

// A repository holding the reviewed records, and any other file named, in facts/reviewed/.
const rootWith = async (files: Record<string, unknown>): Promise<string> => {
  const root = await mkdtemp(join(tmpdir(), 'docs-reviewed-'))
  directories.push(root)
  await mkdir(join(root, REVIEWED_FACTS_DIRECTORY), { recursive: true })
  const contents = { 'README.md': 'Reviewed.', 'capabilities.json': CAPABILITY_RECORD, 'workflows.json': WORKFLOW_RECORD, ...files }
  await Promise.all(
    Object.entries(contents).map(([file, content]) =>
      writeFile(
        join(root, REVIEWED_FACTS_DIRECTORY, file),
        typeof content === 'string' ? content : JSON.stringify(content)
      )
    )
  )

  return root
}

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

describe('[scripts] Reviewed facts - committedReviewedFactsOf', () => {
  it('should return both records when they match their schemas and the export version', async () => {
    // Act
    const facts = await committedReviewedFactsOf(await rootWith({}), '0.1.0')

    // Assert
    expect(facts.capabilities.capabilities).toStrictEqual([FIGMA_READ])
    expect(facts.workflows.workflows).toStrictEqual([QUICK_ANSWER])
  })

  it('should refuse records reviewed for another desktop version, naming them', async () => {
    // Act + Assert
    await expect(committedReviewedFactsOf(await rootWith({}), '0.2.0')).rejects.toThrow(
      'facts/reviewed/capabilities.json, facts/reviewed/workflows.json was reviewed for another version'
    )
  })

  it.each([
    ['an unknown file', { 'product-status.json': '{}' }, 'holds product-status.json, which is not a reviewed record'],
    [
      'a field the schema does not know',
      { 'capabilities.json': { ...CAPABILITY_RECORD, capabilities: [{ ...FIGMA_READ, actor: 'clone' }] } },
      'capabilities.json does not match its schema',
    ],
    [
      'a capability with no route',
      { 'capabilities.json': { ...CAPABILITY_RECORD, capabilities: [{ ...FIGMA_READ, routes: [] }] } },
      'capabilities.json does not match its schema',
    ],
    [
      'an availability the schema does not know',
      {
        'capabilities.json': {
          ...CAPABILITY_RECORD,
          capabilities: [{ ...FIGMA_READ, routes: [{ ...FIGMA_READ.routes[0], availability: 'bundled' }] }],
        },
      },
      'capabilities.json does not match its schema',
    ],
    [
      'an id listed twice',
      { 'capabilities.json': { ...CAPABILITY_RECORD, capabilities: [FIGMA_READ, FIGMA_READ] } },
      'capabilities.json lists design-read more than once',
    ],
    [
      'a workflow with no result',
      {
        'workflows.json': {
          ...WORKFLOW_RECORD,
          workflows: [{ ...QUICK_ANSWER, endpoints: [{ kind: 'wait', outcome: 'Waits', when: 'Always' }] }],
        },
      },
      'a workflow needs a result',
    ],
    ['a record that is not JSON', { 'workflows.json': '{' }, 'workflows.json is not readable JSON'],
  ])('should refuse %s', async (_case, files, message) => {
    // Act + Assert
    await expect(committedReviewedFactsOf(await rootWith(files), '0.1.0')).rejects.toThrow(message)
  })
})
