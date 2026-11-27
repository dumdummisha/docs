Dumdum Misha: your Slack clone, on your Mac. Documentation site.

<img src="src/public/logo.svg" alt="The Dumdum Misha mascot" width="96" height="96">

This repository is the source of [docs.dumdummisha.ai](https://docs.dumdummisha.ai).

Misha is a Mac app that answers routine Slack questions through your own Slack account, as a clone.

- **Got a reply from someone's clone?** Read [Talking with a clone](https://docs.dumdummisha.ai/understand/slack).
- **Deciding whether to try it?** Start at [Try it](https://docs.dumdummisha.ai/start/try).
- **Setting up your own?** Follow [Get started](https://docs.dumdummisha.ai/start/get-started), then [Make it yours](https://docs.dumdummisha.ai/use/make-it-yours) and [Put Misha to work](https://docs.dumdummisha.ai/use/workflows).
- **Checking how it works?** Read [How Misha works](https://docs.dumdummisha.ai/understand/how-it-works) and [Privacy and security](https://docs.dumdummisha.ai/privacy).
- **Fixing or adding to the docs?** See [Contributing](#contributing).

**Status:** invite only. Ask for an invite on [dumdummisha.ai](https://dumdummisha.ai), then download the app from [the latest release](https://github.com/dumdummisha/desktop-downloads/releases/latest).

<img src="https://docs.dumdummisha.ai/captures/home.png" alt="Misha's Home window, listening in Slack as Leo Novak: it is answering Emma Lee's thread in #shop-backend, two workers are running, and its recent posts are listed below. Pause Misha sits in the sidebar." width="640">

*Home, with made-up people.*

## Run and build

The site is VitePress at the repository root. It needs Node 24 and pnpm 11.

| Script | What it does |
| --- | --- |
| `pnpm dev` | Serves the site locally with live reload. |
| `pnpm build` | Builds the static site into `.vitepress/dist`. Vercel and CI run this, so a failing build fails the deployment. |
| `pnpm preview` | Serves the built site. |
| `pnpm typecheck` | Type-checks the VitePress config and theme. CI runs it before the build. |

## How content is organised

| Path | What lives there |
| --- | --- |
| `src/` | The pages, one Markdown file each. |
| `.vitepress/config.mts` | The sidebar that lists the pages, and the footer. |
| `.vitepress/theme/` | The theme and its styling. |
| `src/public/` | Files served as they are: screenshots in `captures/`, diagrams in `diagrams/`, fonts and icons. |
| `diagrams/` | The Mermaid sources of the diagrams. |

The first line of this README is also the site's description, so it stays one sentence with no heading above it.

## Where facts come from

Commands, paths, limits and other values from the desktop app and the browser extension are plain text in the pages. They describe the desktop app version and day named in the footer. When the app changes, edit the pages and the footer together.

## Contributing

Found something wrong? Every page has a **Suggest a change to this page** link that opens its source here. Propose the fix as a pull request.

[CONTRIBUTING.md](CONTRIBUTING.md) covers adding a screenshot, rendering a diagram and what to check after a VitePress upgrade. Everything here is public, so examples use made-up people only, and nothing private goes into a commit.

## Repositories

| Repository | What it holds | Source |
| --- | --- | --- |
| [dumdummisha/docs](https://github.com/dumdummisha/docs) (this one) | The docs site: its pages, theme, screenshots and diagrams. | Public, Apache-2.0 except the fonts and brand artwork |
| [dumdummisha/browser-extension](https://github.com/dumdummisha/browser-extension) | The Misha Browser extension that carries Slack to the app, its native host, and browser and desktop tools you can use in any MCP client without the app. | Public, Apache-2.0 |
| [dumdummisha/desktop-downloads](https://github.com/dumdummisha/desktop-downloads) | Signed and notarized desktop builds as GitHub Releases, which are also the app's update feed. | Public |
| The Misha desktop app | The Mac app, misha-core and the connectors it installs in Claude Code and OpenCode. | Private |

## Licence

Code and prose are under the [Apache License 2.0](LICENSE). See [NOTICE](NOTICE) for the fonts and the brand artwork.
