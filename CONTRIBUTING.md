# Contributing to the Dumdum Misha docs

The quickest fix is the **Suggest a change to this page** link on every page. It opens the page's source here, and you propose the change as a pull request. The [README](README.md) has the commands and where each kind of file lives.

## Keep it public-safe

Everything here is public. Examples use made-up people only (Leo Novak, the owner; Emma Lee and Max Becker, colleagues) in a made-up Shop workspace and `#shop-backend`. Leave out email addresses, internal ids, private URLs, personal file paths and anything copied from private source code. Check what you commit before each push, because a pushed commit cannot be taken back.

## Add a screenshot

Screenshots are PNG files in `src/public/captures/`. A screenshot goes into a page as a figure, so it gets the site's screenshot styling, its size and lazy loading:

```html
<figure class="shot"><img class="shot__image" src="/captures/home.png" alt="What the screenshot shows" width="2200" height="2214" loading="lazy" decoding="async"><figcaption class="shot__caption">The caption under it.</figcaption></figure>
```

Give `width` and `height` the PNG's pixel size, so the page doesn't move while the image loads.

## Change a diagram

Diagrams are Mermaid sources in `diagrams/`, with the theme in `diagrams/mermaid.json`. Readers get the committed SVG in `src/public/diagrams/` and no Mermaid runtime. After you change a source, render it again locally (this needs a headless browser) and commit the SVG:

```sh
npx -y @mermaid-js/mermaid-cli@11.17.0 -i diagrams/<name>.mmd -o src/public/diagrams/<name>.svg -c diagrams/mermaid.json -b '#fffef8'
```

The `-b` colour is the `background` in `diagrams/mermaid.json`. Mermaid still writes an SVG when a source doesn't parse, with "Syntax error" in it, so look at the result before you commit it.

## Upgrade VitePress

The Content-Security-Policy in `vercel.json` was written for the VitePress 1.6.4 build. After an upgrade, compare the inline scripts of the built pages with the hash it lists.

| Directive | Why it is set this way |
| --- | --- |
| `script-src` | `'self'` plus the hash of the one inline script VitePress emits. `metaChunk` in `.vitepress/config.mts` moves the page hash map into a script file, so it needs no hash. |
| `style-src` | Keeps `'unsafe-inline'`, because the server-rendered pages carry style attributes that only `'unsafe-hashes'` could list. |
| `img-src` | Keeps `data:` for the theme's inline SVG icons in CSS. |
