import { fileURLToPath } from 'node:url'

import { defineLoader } from 'vitepress'

import { type ISiteFacts, loadSiteFacts } from '../../scripts/site-facts.ts'

declare const data: ISiteFacts
export { data }

const ROOT = fileURLToPath(new URL('../..', import.meta.url))

// The committed facts and capture list that <Fact> and <Shot> read, revalidated and reloaded when an import changes them.
export default defineLoader({
  watch: ['../../facts/**/*', '../../src/public/captures/*'],
  load: () => loadSiteFacts(ROOT),
})
