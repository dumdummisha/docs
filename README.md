Dumdum Misha: your Slack clone, on your Mac. Documentation site.

<img src="src/public/logo.svg" alt="The Dumdum Misha mascot" width="96" height="96">

Misha is a Mac app that answers routine Slack questions through your own Slack account, as a clone whose replies can start with an emoji you choose and be set in italics. Work you allow, such as research, a ticket or a code change, goes to workers on the same Mac. The clone and its workers run on your Claude Code or OpenCode, and workers use that runtime's model by default; your requests and Routines can choose other models and review steps, through OpenCode.

This repository is the source of [docs.dumdummisha.ai](https://docs.dumdummisha.ai). The docs are for colleagues who got a reply from someone's clone, people deciding whether to try one, owners setting one up, and developers and security reviewers checking how it works.

**Status on 19 November 2026:** one unsigned local build, run by its owner. There is no public download, no Chrome Web Store listing and no invite keys yet. Access starts with the invite on [dumdummisha.ai](https://dumdummisha.ai).

- **[Read the docs](https://docs.dumdummisha.ai)**
- **[Was that the person or their clone?](https://docs.dumdummisha.ai/understand/slack)**
- **[Try it](https://docs.dumdummisha.ai/start/try)**
- **[Privacy and security](https://docs.dumdummisha.ai/privacy)**

Setting up your own clone runs from [Get started](https://docs.dumdummisha.ai/start/get-started) through [Make it yours](https://docs.dumdummisha.ai/use/make-it-yours) to [Put Misha to work](https://docs.dumdummisha.ai/use/workflows). [How Misha works](https://docs.dumdummisha.ai/understand/how-it-works) explains what runs where.

<img src="https://docs.dumdummisha.ai/captures/home.png" alt="Misha's Home window, listening in Slack as Leo Novak: it is answering Emma Lee's thread in #shop-backend, two workers are running, and its recent posts are listed below. Pause Misha sits in the sidebar." width="640">

*Home while the clone answers Emma Lee in #shop-backend and two workers run. Made-up example.*

## Repositories

| Repository | What it holds | Source |
| --- | --- | --- |
| [dumdummisha/docs](https://github.com/dumdummisha/docs) (this one) | The docs site: its pages, theme, screenshots and diagrams. | Public, Apache-2.0 except the fonts and brand artwork |
| [dumdummisha/browser-extension](https://github.com/dumdummisha/browser-extension) | The Misha Browser extension that carries Slack to the app, its native host, and browser and desktop tools you can use in any MCP client without the app. | Public, Apache-2.0 |
| [dumdummisha/desktop-downloads](https://github.com/dumdummisha/desktop-downloads) | Reserved for signed desktop builds and the update feed. Only a README until a signed build exists. | Public |
| The Misha desktop app | The Mac app, misha-core and the connectors it installs in Claude Code and OpenCode. | Private |

## Contributing

Found something wrong? Every page has a **Suggest a change to this page** link that opens its source here, so you can propose the fix as a pull request.

The site is VitePress at the repository root. It needs Node 24 and pnpm 11.

| Script | What it does |
| --- | --- |
| `pnpm dev` | Serves the site locally with live reload. |
| `pnpm build` | Builds the static site into `.vitepress/dist`. Vercel and CI run this, so a failing build fails the deployment. |
| `pnpm preview` | Serves the built site. |
| `pnpm typecheck` | Type-checks the VitePress config and theme. CI runs it before the build. |

Each page is a Markdown file in `src/`, and the sidebar that lists them is in `.vitepress/config.mts`. The theme and its styling are in `.vitepress/theme/`. Everything under `src/public/` is served as is: screenshots in `src/public/captures/`, diagrams in `src/public/diagrams/`, fonts and icons.

Commands, paths, limits and other values from the desktop app and the browser extension are plain text in the pages. They describe the desktop app version and day named in the footer, which is set in `.vitepress/config.mts`. When the app changes, edit the pages and the footer together.

A screenshot goes into a page as a figure, so it gets the site's screenshot styling, its size and lazy loading:

```html
<figure class="shot"><img class="shot__image" src="/captures/home.png" alt="What the screenshot shows" width="2200" height="2214" loading="lazy" decoding="async"><figcaption class="shot__caption">The caption under it.</figcaption></figure>
```

Give `width` and `height` the PNG's pixel size, so the page doesn't move while the image loads.

Diagrams are Mermaid sources in `diagrams/`, with the theme in `diagrams/mermaid.json`. Readers get the committed SVG in `src/public/diagrams/` and no Mermaid runtime, so after you change a source, render it again locally (this needs a headless browser) and commit the SVG:

```sh
npx -y @mermaid-js/mermaid-cli@11.17.0 -i diagrams/<name>.mmd -o src/public/diagrams/<name>.svg -c diagrams/mermaid.json -b '#fffef8'
```

The `-b` colour is the `background` in `diagrams/mermaid.json`. Mermaid still writes an SVG when a source doesn't parse, with "Syntax error" in it, so look at the result before you commit it.

Everything here is public. Examples use made-up people only (Leo Novak, the owner; Emma Lee and Max Becker, colleagues) in a made-up Shop workspace and `#shop-backend`. No email addresses, internal ids, private URLs or personal file paths, and nothing copied from private source code. Check what you commit before each push, because a pushed commit cannot be taken back.

<!-- CSP in vercel.json, written for the 1.6.4 build: script-src is 'self' plus the hash of the one inline script VitePress emits (check-mac-os, constant); metaChunk moves the page hash map into a script file. After a VitePress upgrade, compare the built pages' inline scripts with the listed hash. style-src keeps 'unsafe-inline' because the server-rendered pages carry style attributes (position:relative, --vp-vh) that only 'unsafe-hashes' could list. img-src keeps data: for the theme's inline SVG icons in CSS. -->

## Licence

Code and prose are under the [Apache License 2.0](LICENSE). See [NOTICE](NOTICE) for the fonts and the brand artwork.
