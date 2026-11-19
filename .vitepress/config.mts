import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { type DefaultTheme, defineConfig, type MarkdownEnv, type MarkdownRenderer } from 'vitepress'

import { checkPageComponents, type ISiteFacts, loadSiteFacts } from '../scripts/site-facts.ts'
import {
  BROWSER_REPOSITORY_URL,
  DOWNLOADS_REPOSITORY_URL,
  LANDING_URL,
  REPOSITORY_URL,
  SITE_URL,
} from '../scripts/site.ts'

const HEADING = /^#{1,6}\s/u

// Start, the owner's journey, the colleague's own entrance, operating Misha, then looking things up.
const SIDEBAR: DefaultTheme.SidebarItem[] = [
  {
    text: 'Start',
    items: [
      { text: 'Overview', link: '/' },
      { text: 'Decide whether to try it', link: '/start/decide' },
      { text: 'Get started', link: '/start/get-started' },
    ],
  },
  {
    text: 'Use Misha',
    items: [
      { text: 'Make it yours', link: '/use/make-it-yours' },
      { text: 'Put Misha to work', link: '/use/workflows' },
      { text: 'How Misha works', link: '/understand/how-it-works' },
      { text: 'Customise and reuse Misha', link: '/reference/extensions' },
    ],
  },
  {
    text: 'For colleagues',
    items: [{ text: 'Talking with a clone', link: '/understand/slack' }],
  },
  {
    text: 'Operate',
    items: [
      { text: 'Control and maintain Misha', link: '/operate/manage' },
      { text: 'Troubleshooting', link: '/operate/troubleshooting' },
    ],
  },
  {
    text: 'Reference',
    items: [
      { text: 'Privacy and security', link: '/privacy' },
      { text: 'Settings and commands', link: '/reference/settings' },
      { text: 'Browser permissions', link: '/reference/permissions' },
    ],
  },
]

// The README's first line, so the README and the site describe Misha in the same sentence.
const readmeFirstLine = (readme: string): string => {
  const [first = ''] = readme.split('\n')
  if (first.trim() === '' || HEADING.test(first)) {
    throw new Error('README.md must start with the one-sentence description, not an empty line or a heading')
  }

  return first
}

// Every <Shot> and <Fact> a page names exists in facts/, checked while the page's Markdown renders, so an unknown one
// stops the build.
const checkComponents =
  (site: ISiteFacts) =>
  (md: MarkdownRenderer): void => {
    md.core.ruler.push('site-facts', (state) => {
      const page = (state.env as MarkdownEnv).relativePath
      for (const token of state.tokens.flatMap((each) => [each, ...(each.children ?? [])])) {
        if (token.type === 'html_block' || token.type === 'html_inline') {
          checkPageComponents(token.content, page, site)
        }
      }
    })
  }

// The landing page, the canonical privacy policy, the browser extension's source and where availability is published,
// with the desktop app version and evidence day the site's facts describe.
const footerMessage = (site: ISiteFacts): string => {
  const fact = (name: string): string => {
    const value = site.facts[name]
    if (value === undefined) {
      throw new Error(`The footer needs the fact ${name}, which facts/ does not hold`)
    }

    return String(value)
  }

  return [
    `<a href="${LANDING_URL}">Dumdum Misha</a>`,
    '<a href="/privacy">Privacy</a>',
    `<a href="${BROWSER_REPOSITORY_URL}">Browser extension source</a>`,
    `<a href="${DOWNLOADS_REPOSITORY_URL}">Downloads and availability</a>`,
    `Describes the desktop app ${fact('desktop.manifest.productVersion')} as of ${fact('desktop.manifest.evidenceDate')}`,
  ].join(' · ')
}

const description = readmeFirstLine(await readFile(new URL('../README.md', import.meta.url), 'utf8'))
const site = await loadSiteFacts(fileURLToPath(new URL('..', import.meta.url)))

export default defineConfig({
  title: 'Dumdum Misha',
  description,
  lang: 'en',
  srcDir: 'src',
  markdown: { config: checkComponents(site) },
  base: '/',
  cleanUrls: true,
  // The brand defines a light theme only; the screenshots are light too.
  appearance: false,
  // A checkout's file dates say when Vercel cloned the repository, not when a page's facts were checked.
  lastUpdated: false,
  sitemap: { hostname: SITE_URL },
  // The page hash map and site data load as a script file, not an inline script, so the CSP needs no hash that changes
  // with every page edit.
  metaChunk: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' }],
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon-180.png' }],
    ['link', { rel: 'preload', href: '/fonts/figtree-400-800.woff2', as: 'font', type: 'font/woff2', crossorigin: '' }],
    [
      'link',
      { rel: 'preload', href: '/fonts/bricolage-grotesque-600.woff2', as: 'font', type: 'font/woff2', crossorigin: '' },
    ],
    ['meta', { property: 'og:image', content: `${SITE_URL}/app-icon-512.png` }],
    ['meta', { name: 'theme-color', content: '#ffcf4a' }],
  ],
  themeConfig: {
    logo: { src: '/logo.svg', alt: '' },
    nav: [
      { text: 'Start', link: '/start/get-started' },
      { text: 'Talking with a clone', link: '/understand/slack' },
      { text: 'Privacy', link: '/privacy' },
      { text: 'Reference', link: '/reference/settings' },
      { text: 'GitHub', link: REPOSITORY_URL },
    ],
    sidebar: SIDEBAR,
    // The index ships with the site, so a query never leaves the reader's browser.
    search: { provider: 'local' },
    editLink: { pattern: `${REPOSITORY_URL}/edit/main/src/:path`, text: 'Suggest a change to this page' },
    footer: {
      message: footerMessage(site),
      copyright:
        'Code and prose under Apache-2.0, fonts under OFL-1.1. The Dumdum Misha name, mascot and app icon are brand artwork.',
    },
  },
})
