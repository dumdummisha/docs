import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { z } from 'zod'

// The records a maintainer writes by hand after reviewing the private app and the public browser package: what each
// request needs and who may make it, and how each workflow ends. They sit beside the desktop export, not in it.
export const REVIEWED_FACTS_DIRECTORY = 'facts/reviewed'
const REVIEWED_FACTS_README = 'README.md'

const SLUG = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u)
const TEXT = z.string().min(1)
const PRODUCT_VERSION = z.string().regex(/^\d+\.\d+\.\d+$/u)
// A commit of the public misha-browser repository.
const GIT_REVISION = z.string().regex(/^[0-9a-f]{7,40}$/u)

// Who carries the work out: the clone in its own turn, a worker it starts, or the reader's own agent session.
export const ACTORS = ['clone', 'worker', 'your-agent'] as const
// Who may cause it: anyone the clone answers, the owner in their self-DM or with their icon, the owner and the people
// they allow to ask for work, or the reader in their own agent session.
export const ACCESS = ['anyone', 'owner', 'allowed', 'session'] as const
// How a capability reaches its user: included with Misha (the app and its bundled misha-core extension, though it may
// need a connection), an optional extension module that serves it, or the public browser package used standalone.
export const AVAILABILITY = ['included', 'optional', 'standalone'] as const
// How a workflow can end: with a result, waiting, stopped, or with a decision only the owner makes.
export const ENDPOINT_KINDS = ['result', 'wait', 'stop', 'decision'] as const

// Refuses a list whose items share an id, naming the list and the id.
const uniqueIds =
  (list: string) =>
  (items: readonly { id: string }[], context: z.RefinementCtx): void => {
    const ids = items.map(({ id }) => id)
    const duplicate = ids.find((id, index) => ids.indexOf(id) !== index)
    if (duplicate !== undefined) {
      context.addIssue({ code: 'custom', message: `${list} lists ${duplicate} more than once` })
    }
  }

const CAPABILITIES_SCHEMA = z.strictObject({
  productVersion: PRODUCT_VERSION,
  evidenceDate: z.iso.date(),
  browserRevision: GIT_REVISION,
  capabilities: z
    .array(
      z.strictObject({
        id: SLUG,
        request: TEXT,
        // Each way to get it: whether it is included, optional or standalone, who carries it out, and where.
        routes: z
          .array(z.strictObject({ availability: z.enum(AVAILABILITY), actor: z.enum(ACTORS), surface: TEXT }))
          .min(1),
        access: z.enum(ACCESS),
        needs: z.array(TEXT).min(1),
        result: TEXT,
        limit: TEXT,
      })
    )
    .superRefine(uniqueIds('capabilities.json')),
})

const WORKFLOWS_SCHEMA = z.strictObject({
  productVersion: PRODUCT_VERSION,
  evidenceDate: z.iso.date(),
  workflows: z
    .array(
      z.strictObject({
        id: SLUG,
        name: TEXT,
        trigger: TEXT,
        actor: z.enum(ACTORS),
        access: z.enum(ACCESS),
        needs: z.array(TEXT).min(1),
        // Commands a project's repository may hold, which the workflow uses when they are there.
        projectCommands: z.array(z.strictObject({ name: SLUG, role: TEXT })),
        review: TEXT.nullable(),
        endpoints: z
          .array(z.strictObject({ kind: z.enum(ENDPOINT_KINDS), outcome: TEXT, when: TEXT }))
          .refine((endpoints) => endpoints.some(({ kind }) => kind === 'result'), 'a workflow needs a result'),
      })
    )
    .superRefine(uniqueIds('workflows.json')),
})

const SCHEMAS = { capabilities: CAPABILITIES_SCHEMA, workflows: WORKFLOWS_SCHEMA } as const

export type ReviewedFacts = { [TName in keyof typeof SCHEMAS]: z.infer<(typeof SCHEMAS)[TName]> }

const NAMES = Object.keys(SCHEMAS) as (keyof typeof SCHEMAS)[]

const fileOf = (name: string): string => `${name}.json`

const parsedRecord = async <TSchema extends z.ZodType>(
  root: string,
  file: string,
  schema: TSchema
): Promise<z.infer<TSchema>> => {
  const path = join(root, REVIEWED_FACTS_DIRECTORY, file)
  let json: unknown
  try {
    json = JSON.parse(await readFile(path, 'utf8'))
  } catch (error) {
    throw new Error(`${REVIEWED_FACTS_DIRECTORY}/${file} is not readable JSON: ${String(error)}`, { cause: error })
  }

  const result = schema.safeParse(json)
  if (!result.success) {
    throw new Error(`${REVIEWED_FACTS_DIRECTORY}/${file} does not match its schema: ${z.prettifyError(result.error)}`)
  }

  return result.data
}

// The committed records, each checked against its strict schema, with nothing else in their folder but its README. A
// record reviewed for another desktop version than the export describes is refused, so a new export forces a re-review.
export const committedReviewedFactsOf = async (root: string, productVersion: string): Promise<ReviewedFacts> => {
  const known = [...NAMES.map(fileOf), REVIEWED_FACTS_README]
  const unknown = (await readdir(join(root, REVIEWED_FACTS_DIRECTORY))).filter((file) => !known.includes(file))
  if (unknown.length > 0) {
    throw new Error(`${REVIEWED_FACTS_DIRECTORY}/ holds ${unknown.join(', ')}, which is not a reviewed record`)
  }

  const facts: ReviewedFacts = {
    capabilities: await parsedRecord(root, fileOf('capabilities'), CAPABILITIES_SCHEMA),
    workflows: await parsedRecord(root, fileOf('workflows'), WORKFLOWS_SCHEMA),
  }
  const stale = NAMES.filter((name) => facts[name].productVersion !== productVersion)
  if (stale.length > 0) {
    const files = stale.map((name) => `${REVIEWED_FACTS_DIRECTORY}/${fileOf(name)}`).join(', ')
    throw new Error(`${files} was reviewed for another version than the desktop export's ${productVersion}: review it again`)
  }

  return facts
}
