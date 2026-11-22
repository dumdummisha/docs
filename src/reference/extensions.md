---
title: Customise and reuse Misha
description: "Keep your own skills and routines, switch connectors on, use Misha's tools in your own Claude Code and OpenCode, package your own extension, or use the browser tools without the app."
prev:
  text: How Misha works
  link: /understand/how-it-works
next: false
---

# Customise and reuse Misha

Misha is a small core, connectors you switch on one by one, and your own setup on top. Most changes need no code. Settings cover the clone's voice, limits and runtime ([Make it yours](/use/make-it-yours)). Beyond them you can [keep your own skills](#your-setup), [switch connectors on](#connectors), [use Misha's tools in your own agent](#your-sessions), [package an extension](#your-own-extension), or [use the browser and desktop tools alone](#browser-and-desktop). To take a job over yourself, [pause Misha](/operate/manage#pause) and carry on in your own tools; [Put Misha to work](/use/workflows) shows where the work stands.

## Your skills and commands stay yours {#your-setup}

Misha doesn't ship your workflow. You describe it in **Routines** on Settings, in your own words: when something happens, what the clone does and what it tells you. A routine can name one of your skills or commands. The clone doesn't read it: it names the skill in the worker's brief, and the worker loads it, or says in its report that it can't find it.

A Claude worker is your own Claude Code with your settings. A GPT worker is OpenCode with a configuration Misha writes for the run, and it reads your skills from the shared skills folder and Claude Code's skills folder.

A routine grants nothing: who may ask for work, what the clone may change and where workers may merge stay in settings. A colleague's message never changes your routines.

## Connectors {#connectors}

A connector is an extension for one service or capability, shipped inside the app. Each has one switch, **I use it**, on Set up. On means Misha loads it everywhere, and the clone uses it for colleagues too, within the limits of who asked. Off means Misha loads it nowhere, including in Misha's tools in your own Claude Code and OpenCode. A service you connected to your harness yourself, such as a Jira MCP server of your own, stays yours.

On a fresh install the connectors setting's default is <Fact name="desktop.settings.fields.connectors.default" /> These are the connectors, as Set up words them:

| Connector | What Set up says |
| --- | --- |
| <Fact name="desktop.detection.items.atlassian.name" /> | <Fact name="desktop.detection.items.atlassian.about" /> |
| <Fact name="desktop.detection.items.google.name" /> | <Fact name="desktop.detection.items.google.about" /> |
| <Fact name="desktop.detection.items.figma.name" /> | <Fact name="desktop.detection.items.figma.about" /> |
| <Fact name="desktop.detection.items.fireflies.name" /> | <Fact name="desktop.detection.items.fireflies.about" /> |
| <Fact name="desktop.detection.items.aws.name" /> | <Fact name="desktop.detection.items.aws.about" /> |
| <Fact name="desktop.detection.items.browser.name" /> | <Fact name="desktop.detection.items.browser.about" /> |
| <Fact name="desktop.detection.items.compaction.name" /> | <Fact name="desktop.detection.items.compaction.about" /> |

Each connector declares which tools the clone gets. A turn for anyone gets a connector's reads, unless the connector keeps all its tools to your own turns, as AWS does; your own turn also gets the changes. Browser control declares none for the clone. A change on Set up applies to new Claude Code and OpenCode sessions: Misha refuses a call to a connector that is off, but a session already open may keep its tool list until you restart it.

## What misha-core ships {#misha-core}

misha-core is the shipped extension that every other one installs beside, in each harness Misha finds. It holds what the runtime needs and nothing about one service: the worker profiles and tools, git history tools, your own Slack tools, the tools that read and change Misha, a few skills on workers and git, and the setup command ([Settings and commands](/reference/settings#setup-command)). Ticket, review, merge and deploy procedures aren't part of it: you write yours as routines and skills.

## Misha in your own sessions {#your-sessions}

Misha registers one MCP server, `misha`, in Claude Code (user scope) and in OpenCode's global configuration. It serves your sessions the tools of every installed extension for that harness, except connectors that are off:

- **Misha itself:** status, recent activity, settings, and pause and resume. A settings change or a pause made here has the same effect as one from the self-DM, and the tools say so when the app isn't running. A question tool asks about the clone's work without starting any; ask for work by typing in Slack.
- **Your Slack:** reading channels, threads and history, and sending, reacting, editing and downloading attachments, through your signed-in Slack tab. A post you make this way is yours: it is a person's message in history, not in the clone's post record, and it doesn't summon your clone or count as a request to it, even in your self-DM. Ask for work by typing in Slack.
- **Workers:** starting, following and stopping them, and reading their sessions. At session start the server tells your harness to delegate through Misha's worker tools, so nothing edits your `CLAUDE.md` or `AGENTS.md`.
- **Connectors you switched on**, and the browser and desktop tools while Browser control is on.

## Your own extension {#your-own-extension}

A Misha extension is a folder with a `misha-extension.json` manifest. It isn't a Claude Code plugin or an OpenCode package: Misha's installers translate it for each harness, so one folder serves both. A manifest can declare skills, commands, agent profiles, modules with tools and hooks, agent grants, and a connector block on a module.

```text
shop-team/
├── misha-extension.json        the manifest
├── skills/team-writing/SKILL.md
├── commands/tidy-pr.md
└── modules/glossary/index.js   a built ES module serving one tool
```

An installer adds exactly what the manifest declares and refuses an extension whose declared files are missing. A module's entry default-exports an object with `create`, which builds the tools, and `jsonSchema`; the [misha-browser modules](https://github.com/dumdummisha/browser-extension) are a working example. Hooks are per harness: Claude Code hooks on `PreCompact`, `SessionStart` or `Stop`, or the module's own OpenCode plugin. An extension installs only beside misha-core.

A made-up example: Shop's team keeps its writing conventions in one skill, a command that tidies a pull request description, and a read-only glossary lookup. The manifest passes the app's manifest schema; the module, skill and command are yours to write.

```json
{
  "name": "shop-team",
  "version": "0.1.0",
  "description": "Shop's writing conventions, and a glossary lookup for the terms the team uses.",
  "modules": [
    {
      "name": "glossary",
      "entry": "modules/glossary/index.js",
      "claudeCodeHooks": [],
      "opencodePlugin": null,
      "harnesses": ["claude-code", "opencode"],
      "isServedToWorkers": true,
      "connector": {
        "displayName": "Shop glossary",
        "description": "The terms Shop's team uses, and what they mean.",
        "userConfig": {},
        "tools": {
          "glossary_lookup": {
            "annotations": { "readOnlyHint": true, "openWorldHint": false },
            "localOutputArgument": null
          }
        },
        "promptFragment": "The Shop glossary holds the team's terms: look a term up with glossary_lookup before you explain it.",
        "agentGrants": {
          "researcher": ["glossary_lookup"],
          "implementer": ["glossary_lookup"]
        }
      }
    }
  ],
  "agents": [],
  "skills": ["team-writing"],
  "commands": ["tidy-pr"]
}
```

The `connector` block gives the glossary its own row and switch on Set up and puts it in front of the clone; a module without one has no switch and is always on. It declares:

- what Set up shows, and how sign-in works: settings it takes, or a `keyPage` where the service hands out a key that goes into OpenCode, never through Misha;
- the tools clone turns get, each with its standard MCP annotations. A tool without `readOnlyHint: true` counts as a change, so only your own turns may call it;
- optionally a command line your turns may run, its own skills and the host its links may go to;
- whether it is on by default, the line the clone is told while it is on, and the grants it gives worker profiles, which apply only while the switch is on. The manifest's own `agentGrants` apply whenever the extension is installed.

Misha has no setting that swaps one service for another: a connector for a different tracker sits beside Jira and Confluence rather than replacing it.

::: warning Not available yet
The Misha app installs only the extensions it ships. The installer for yours runs from the app's private source, and the app has no control for it. An extension like this one is something to design against the format, not yet install from a release.
:::

## Where additions run {#where-additions-run}

[![Where an extension reaches. The diagram and the numbered list below describe each route.](/diagrams/extension-to-consumers.svg)](/diagrams/extension-to-consumers.svg)

Dashed boxes apply only when their condition holds.

1. **Your Claude Code and OpenCode sessions.** Skills go into one shared skills folder, which OpenCode reads itself and Claude Code reads through a link. Commands and agents go into each harness's own folders or configuration, hooks into Claude Code's settings or an OpenCode plugin, and the tools come from the `misha` server.
2. **Workers you start from your own sessions.** They get the modules your session has for its harness, apart from any that serves a tool the bridge serves itself. A worker can call a tool only when its profile, with every installed extension's grants added, names it.
3. **Workers the clone starts.** They get only the modules marked as served to workers, under the same rule for profiles.
4. **Clone turns.** A connector's tools reach them by turn authority, and its command line brings the skills that command line names. Ordinary skills and commands don't reach a clone turn; apart from connectors, only misha-core's git history on your own turns and the built-in GitHub command line do.

A worker can run as a profile your extension declares if only one installed extension declares that name and its shell access is `all` or `none`, not a list of rules. The installer refuses a module served to workers that serves a tool named like one Misha's bridge serves itself.

### Names, collisions and what an install writes over {#installer-rules}

Skills go by `<extension>-<skill>`, so `team-writing` is `shop-team-team-writing`, and its `SKILL.md` frontmatter must name itself that. Commands are `/shop-team:tidy-pr` in Claude Code and `shop-team/tidy-pr` in OpenCode. `"isNamespaced": false` installs both under bare names. Agents keep their own names.

- A skill's folder is refused when something not the extension's own is already there. Nothing is written over it.
- A command or an agent of the same name is written over, after the installer moves the old file into <code><Fact name="desktop.paths.paths.overwritten.path" /></code>. One batch is kept per install run, the newest <Fact name="desktop.retention.overwrittenBatches.kept" /> stay, and uninstalling doesn't restore them.
- A name that matches a Claude Code built-in or a command or skill of yours elsewhere gets a warning, and the extension is installed beside it.

[Control and maintain Misha](/operate/manage#remove) covers removal.

## Claude Code and OpenCode {#claude-code-and-opencode}

You choose the runtime the clone thinks with on Settings, Claude Code or OpenCode. Switching starts a new session there; settings, notes and routines stay. An extension installs into every harness Misha finds, so it doesn't depend on which one runs the clone.

## Browser and desktop tools {#browser-and-desktop}

The public misha-browser package has tools that read and drive your own browser through the Misha Browser extension, and tools that move the Mac's mouse, press its keys, capture its screen and bring apps to the front. A page reads as a compact outline of headings, visible text and numbered controls instead of HTML. Clicks and typing are real input, and after an action the result lists what changed.

Inside Misha they are the **Browser control** connector. While it is on, Misha's server gives the tools to your own Claude Code and OpenCode sessions, and to a worker you start from one with a profile of yours that grants them. The Slack clone and the workers it starts never get them.

<!-- facts capabilities browser-read browser-act desktop-control -->

Two made-up examples, both in Leo Novak's own Claude Code session:

- **Browser:** "In my signed-in Shop admin tab, find this morning's order for Emma Lee and read me its refund status." It needs the extension and native host, and because it types into the search field, Accessibility and Screen Recording for the terminal or app running Claude Code.
- **Desktop:** "Bring Simulator to the front and capture the screen." Focusing an app needs no grant; the capture needs both.

An extension of yours can serve the same tools through the package's `browserModule` and `desktopModule` exports. A worker that gets them acts in your signed-in browser and on your screen as you. The extension records every tab's fetch and XHR requests while it runs, with credentials redacted by name and pattern, which misses an opaque credential under an ordinary name. Page text, ordinary field values and screenshots can return sensitive information the page displays. [Browser permissions](/reference/permissions) explains each permission, and [Privacy and security](/privacy) where the data goes.

## Using them without Misha {#standalone}

The standalone MCP server serves the browser and desktop tools over stdio to Claude Code, OpenCode or any other MCP client, without the Misha app or an invite. It runs on macOS only, and the browser tools need the extension and its native host in Chrome or Brave. The [misha-browser README](https://github.com/dumdummisha/browser-extension#readme) has the build, host, registration and permission steps; this page doesn't repeat them.

## Public and private {#public-and-private}

| Part | Where | Licence |
| --- | --- | --- |
| These docs | [dumdummisha/docs](https://github.com/dumdummisha/docs) | Apache-2.0 for code and prose, OFL-1.1 for the fonts; the name, mascot and app icon are brand artwork |
| Browser extension, native host, protocol, client, browser and desktop tools, MCP server | [browser-extension](https://github.com/dumdummisha/browser-extension) | Apache-2.0 |
| Signed builds and the update feed, once there are releases | [desktop-downloads](https://github.com/dumdummisha/desktop-downloads) | No licence file; no public release yet |
| The desktop app, misha-core and the connectors it ships | Private | Not published |

Start with misha-browser: its protocol shows what passes between the extension, the native host and the app, and its tools are the ones you can reuse today.
