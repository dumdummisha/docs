Dumdum Misha: your Slack clone, on your Mac. Documentation site.

<img src="src/public/logo.svg" alt="The Dumdum Misha mascot" width="96" height="96">

Read the docs at [docs.dumdummisha.ai](https://docs.dumdummisha.ai).

## Contributing

The site is VitePress at the repository root with pages in `src/`. It needs Node 24 and pnpm 11.

| Script | What it does |
| --- | --- |
| `pnpm dev` | Serves the site locally with live reload. |
| `pnpm build` | Builds the static site into `.vitepress/dist`. |
| `pnpm preview` | Serves the built site. |
| `pnpm typecheck` | Type-checks the theme, the config and the scripts. |
| `pnpm test` | Runs the script tests. |
| `pnpm check:privacy` | Scans tracked files and the built site for data that must not be public. |
| `pnpm check:links` | Checks every internal link and anchor in the built site. |
| `pnpm check:csp` | Checks that the CSP in `vercel.json` allows exactly the inline scripts the built site has. |
| `pnpm import:desktop -- <bundle-dir>` | Imports a reviewed export bundle from the private desktop app. |

The desktop app's source is private, so this repository never reads it: a maintainer exports reviewed JSON facts and PNG screenshots from the app, and `pnpm import:desktop` checks the bundle (known files only, every hash, the public-data scan) before copying facts to `facts/desktop/`, the capture list to `facts/captures.json` and the screenshots to `src/public/captures/`. Pages show those values with `<Fact name="...">` and `<Shot id="..." caption="...">`, and an unknown name or id stops the build.

Everything here is public. Examples use made-up people only (Sam Rivera, the owner; Priya Nair and Jonas Weber, colleagues) in a made-up Shop workspace and `#shop-backend`. No email addresses, internal ids, private URLs or personal file paths, and nothing copied from private source code. `pnpm check:privacy` enforces what it can, and CI runs it on every pull request.

<!-- CSP in vercel.json, checked against the 1.6.4 build: script-src is 'self' plus the hash of the one inline script VitePress emits (check-mac-os, constant); metaChunk moves the page hash map into a script file, and pnpm check:csp fails when the built inline scripts and the listed hashes differ. style-src keeps 'unsafe-inline' because the server-rendered pages carry style attributes (position:relative, --vp-vh) that only 'unsafe-hashes' could list. img-src keeps data: for the theme's inline SVG icons in CSS. -->

## Licence

Code and prose are under the [Apache License 2.0](LICENSE). See [NOTICE](NOTICE) for the fonts and the brand artwork.
