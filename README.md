Dumdum Misha: your Slack clone, on your Mac. Documentation site.

<img src="src/public/logo.svg" alt="The Dumdum Misha mascot" width="96" height="96">

Misha is a Mac app that answers routine Slack questions through your own Slack account, as a clone whose replies can start with an emoji you choose and be set in italics. Work you allow, such as research, a ticket or a code change, goes to workers in your own Claude Code on the same Mac, and GPT through OpenCode reviews the tickets and pull requests they write.

This repository is the source of [docs.dumdummisha.ai](https://docs.dumdummisha.ai). The docs are for colleagues who got a reply from someone's clone, people deciding whether to try one, owners setting one up, and developers and security reviewers checking how it works.

**Status on 19 November 2026:** one unsigned local build, run by its owner. There is no public download, no Chrome Web Store listing and no invite keys yet. Access starts with the invite on [dumdummisha.ai](https://dumdummisha.ai).

- **[Read the docs](https://docs.dumdummisha.ai)**
- **[Was that the person or their clone?](https://docs.dumdummisha.ai/understand/slack)**
- **[Why try it](https://docs.dumdummisha.ai/start/why)**
- **[Privacy and security](https://docs.dumdummisha.ai/privacy)**

Setting up your own clone runs from [Get started](https://docs.dumdummisha.ai/start/get-started) through [Make it yours](https://docs.dumdummisha.ai/use/make-it-yours) to [Put Misha to work](https://docs.dumdummisha.ai/use/workflows). [How Misha works](https://docs.dumdummisha.ai/understand/how-it-works) explains the architecture, and [Customise and reuse Misha](https://docs.dumdummisha.ai/reference/extensions) what you can add or reuse.

<img src="https://docs.dumdummisha.ai/captures/home.png" alt="Misha's Home window, listening in Slack as Sam Rivera: it is answering Priya Nair's thread in #shop-backend, two workers are running, and its recent posts are listed below. Pause Misha sits in the sidebar." width="640">

*Home while the clone answers Priya Nair in #shop-backend and two workers run. Made-up example.*

## Repositories

| Repository | What it holds | Source |
| --- | --- | --- |
| [dumdummisha/docs](https://github.com/dumdummisha/docs) (this one) | The docs site: its pages, theme and build checks, and the reviewed facts and screenshots exported from the app. | Public, Apache-2.0 except the fonts and brand artwork |
| [dumdummisha/browser-extension](https://github.com/dumdummisha/browser-extension) | The Misha Browser extension that carries Slack to the app, its native host, and browser and desktop tools you can use in any MCP client without the app. | Public, Apache-2.0 |
| [dumdummisha/desktop-downloads](https://github.com/dumdummisha/desktop-downloads) | Reserved for signed desktop builds and the update feed. Only a README until a signed build exists. | Public |
| The Misha desktop app | The Mac app and misha-core, the extension it installs in Claude Code and OpenCode. | Private |

## Contributing

Found something wrong? Every page has a **Suggest a change to this page** link that opens its source here, so you can propose the fix as a pull request.

The site is VitePress at the repository root with pages in `src/`. It needs Node 24 and pnpm 11.

| Script | What it does |
| --- | --- |
| `pnpm dev` | Serves the site locally with live reload. |
| `pnpm build` | Scans the source, checks the diagrams are rendered from their current sources, revalidates the imported desktop export and browser facts, builds the static site into `.vitepress/dist`, then scans it and checks its links and CSP. Vercel and CI run this, so any failing gate fails the deployment. |
| `pnpm preview` | Serves the built site. |
| `pnpm typecheck` | Type-checks the theme, the config and the scripts. |
| `pnpm test` | Runs the script tests. |
| `pnpm check:privacy` | Before a push: scans what the push would publish (every committed file of `HEAD` and of each commit not yet on `origin/main` that `origin/main` does not already hold, or the whole history before the first push, and each commit's message and identities) for data that must not be public. |
| `pnpm check:source` | Scans the files a build of this checkout reads for data that must not be public. |
| `pnpm check:built` | Scans the built site for data that must not be public. |
| `pnpm check:links` | Checks every internal link and anchor in the built site. |
| `pnpm check:csp` | Checks that the CSP in `vercel.json` allows exactly the inline scripts the built site has. |
| `pnpm check:diagrams` | Checks that every Mermaid source in `diagrams/` has an SVG in `src/public/diagrams/` rendered from its current version, and that no rendered SVG outlived its source. |
| `pnpm render:diagrams` | Renders every Mermaid source in `diagrams/` to SVG with the pinned Mermaid CLI, which needs a local headless browser. |
| `pnpm import:desktop -- <bundle-dir>` | Imports a reviewed export bundle from the private desktop app. |
| `pnpm import:browser -- <commit>` | Fetches the public browser repository's main branch and imports the browser extension's disclosures and manifest declarations at one commit on it. |

The desktop app's source is private, so this repository never reads it: a maintainer exports reviewed JSON facts and PNG screenshots from the app, and `pnpm import:desktop` checks the bundle (known files only, every hash, a strict schema for every document, the public-data scan) before copying facts to `facts/desktop/`, the capture list to `facts/captures.json` and the screenshots to `src/public/captures/`. Every build checks the committed copy the same way again, so a fact or screenshot changed after the import stops the build. Pages show those values with `<Fact name="...">` and `<Shot id="..." caption="...">`, and an unknown name or id stops the build. A fact's name is its document and key path, with an item of a list whose items all have an `id` named by that id rather than its position, such as `desktop.paths.paths.workers-logs.path`, so a re-import that adds or reorders items cannot point a page at another item. A table of facts is an HTML comment on lines of its own, such as `<!-- facts commands owner -->`, `<!-- facts surfaces pause resume -->` or `<!-- facts browser-permission-table -->`: the build replaces it with the Markdown `scripts/fact-tables.ts` renders from `facts/`, so the table, and any heading it holds, is in the built page, the outline and the search index, and a malformed marker or an unknown table, argument or id stops the build. The table names are in `scripts/fact-tables.ts`. A passage several pages share lives once in `src/_includes/`, which is never a page of its own, and each page pulls it in with VitePress's `<!--@include: ../_includes/<name>.md-->` on a line of its own; `first-control.md` is the short pause passage that [Control and maintain Misha](src/operate/manage.md) owns, for the setup pages to show before live replies start.

Some facts can't come from an export: what each request Misha takes needs and who may make it, and how each workflow ends. A maintainer writes them by hand in `facts/reviewed/` after reviewing the private app and the public browser repository, in the docs' own words, and every build checks them against a strict schema (`scripts/reviewed-facts.ts`) and refuses them when they were reviewed for another desktop version than the export's. Pages render them with the same markers: `<!-- facts capabilities [<id> ...] -->` and `<!-- facts endpoints <workflow> -->`.

The browser extension's permissions and data disclosures come from the public [browser-extension](https://github.com/dumdummisha/browser-extension) repository instead. `pnpm import:browser` takes a commit by its hash, fetches that repository's main branch from GitHub into a fresh temporary repository (ignoring your git configuration and any local checkout), refuses a commit that is not on it, and copies its `docs/store-disclosures.json`, the manifest's permission declarations and the Slack transport limits to `facts/browser/`, with the commit and each file's hash in `source.json`. Strict schemas (the manifest's unreviewed top-level fields included) and a check that the disclosures and the manifest describe the same declarations run at the import and on every build. The build works offline: it checks the committed files against the hashes in `source.json`, which is an integrity check of the import, not a second proof that the commit is public. Pages place its tables and disclosures with the same `<!-- facts browser-... -->` markers.

Diagrams are Mermaid sources in `diagrams/`. Rendering needs a headless browser that the deployment's build does not have, so `pnpm render:diagrams` renders them locally to static SVG in `src/public/diagrams/`, each SVG naming the hash of its source, and the build refuses an SVG rendered from an older source. Readers get the SVG and no Mermaid runtime. An SVG in `src/public/diagrams/` without that header was drawn by hand; the check and the render leave it alone.

Everything here is public. Examples use made-up people only (Sam Rivera, the owner; Priya Nair and Jonas Weber, colleagues) in a made-up Shop workspace and `#shop-backend`. No email addresses, internal ids, private URLs or personal file paths, and nothing copied from private source code. The build enforces what the scans can on every pull request and Vercel deployment; run `pnpm check:privacy` before each push, because a pushed commit cannot be taken back.

<!-- CSP in vercel.json, checked against the 1.6.4 build: script-src is 'self' plus the hash of the one inline script VitePress emits (check-mac-os, constant); metaChunk moves the page hash map into a script file, and pnpm check:csp fails when the built inline scripts and the listed hashes differ. style-src keeps 'unsafe-inline' because the server-rendered pages carry style attributes (position:relative, --vp-vh) that only 'unsafe-hashes' could list. img-src keeps data: for the theme's inline SVG icons in CSS. -->

## Licence

Code and prose are under the [Apache License 2.0](LICENSE). See [NOTICE](NOTICE) for the fonts and the brand artwork.
