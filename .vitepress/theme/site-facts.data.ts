import { fileURLToPath } from 'node:url'

import { defineLoader } from 'vitepress'

import { type ISiteFacts, loadSiteFacts } from '../../scripts/site-facts.ts'

declare const data: ISiteFacts
export { data }

const FACTS_DIRECTORY = fileURLToPath(new URL('../../facts', import.meta.url))

// The committed facts and capture list that <Fact> and <Shot> read, reloaded when an import changes them.
export default defineLoader({
  watch: ['../../facts/**/*.json'],
  load: () => loadSiteFacts(FACTS_DIRECTORY),
})
