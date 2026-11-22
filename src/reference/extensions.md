---
title: Customise and reuse Misha
description: "Keep your own skills and routines, switch connectors on, use Misha's tools in your own Claude Code and OpenCode, package your own extension, or use the browser tools without the app."
prev:
  text: How Misha works
  link: /understand/how-it-works
next: false
---

# Customise and reuse Misha

Misha is a small core with a few built-in parts, connectors you switch on one by one, and your own setup on top. Most changes need no code. Pick the level that matches what you want:

- **Change how your clone sounds, what it may do, or what it thinks with:** the voice, routines, requesters, channels, linked folders, runtime and model are settings. [Make it yours](/use/make-it-yours) walks through them.
- **Keep working the way you do:** your own skills and commands stay yours, and a routine can name them. See [Your skills and commands](#your-setup).
- **Add a service:** connectors are optional extensions with one switch each. See [Connectors](#connectors).
- **Use Misha's tools in your own agent:** one MCP server puts Misha's tools in your Claude Code and OpenCode sessions. See [Misha in your own sessions](#your-sessions).
- **Package your own tools and instructions:** that is a Misha extension, a folder with a manifest. See [Your own extension](#your-own-extension).
- **Use the browser and desktop tools without the app:** the public misha-browser package runs on its own. See [Browser and desktop tools](#browser-and-desktop).
- **Take a job over yourself:** [pause Misha](/operate/manage#pause) and carry on in your own tools. [Put Misha to work](/use/workflows) shows where the work stands and how to follow it.

## Your skills and commands stay yours {#your-setup}

Misha doesn't ship your workflow, and it doesn't need to know it. You describe it in **Routines**, on Settings, in your own words: when something happens, what the clone does and what it tells you. A routine can name one of your skills or commands. The clone doesn't read it. It names the skill in the worker's brief, tells the worker to load it, and tells the worker to say in its report if it can't find it, instead of carrying on without it.

Where a worker finds your skills depends on its runtime. A Claude worker is your own Claude Code with your settings. A GPT worker is OpenCode with a configuration Misha writes for the run, and it reads your skills from `~/.agents/skills` and Claude Code's skills folder.

A routine grants nothing. Who may ask for work, what the clone may change and where workers may merge stay in settings, whatever a routine says. A colleague's message is handled under your routines and never changes them.

## Connectors {#connectors}

A connector is an extension for one service or one capability, shipped inside the app. Each has one switch, **I use it**, on Set up. On means Misha loads it everywhere, and the clone uses it for colleagues too, within the limits of who asked. Off means Misha loads it nowhere, including in Misha's tools in your own Claude Code and OpenCode. A service you connected to your harness yourself, such as a Jira MCP server of your own, stays yours, and Misha can't switch it off.

On a fresh install the connectors setting's default is <Fact name="desktop.settings.fields.connectors.default" /> The rest start off. A switch you saved stays across updates, so turning handoff compaction off keeps it off.

| Connector | Gives | Clone turns | Worker profiles granted its tools | Your own sessions |
| --- | --- | --- | --- | --- |
| <Fact name="desktop.detection.items.atlassian.name" /> | Tickets and pages | Reads for anyone the clone answers; changes on your own turns | Orchestrator, researcher, implementer, reviewer (Jira tools) | Tools |
| <Fact name="desktop.detection.items.google.name" /> | Docs and Sheets | Reads for anyone; changes on your own turns | Orchestrator, researcher, implementer, reviewer | Tools |
| <Fact name="desktop.detection.items.figma.name" /> | Design files, read only | Reads for anyone | None | Tools |
| <Fact name="desktop.detection.items.fireflies.name" /> | Meeting transcripts | Reads for anyone | Orchestrator, researcher | Tools |
| <Fact name="desktop.detection.items.aws.name" /> | AWS sessions and the AWS command line | Your own turns only | Orchestrator, researcher, implementer | Tools |
| <Fact name="desktop.detection.items.browser.name" /> | Your browser's tabs, and the Mac's mouse, keyboard and screen | None | None | Browser and desktop tools |
| <Fact name="desktop.detection.items.compaction.name" /> | A handoff written when a session compacts, and resumed from | None | None | Hooks in Claude Code and OpenCode |

Colleagues reach a connector only through the clone, and a colleague's request is data to it, never an instruction: it can't widen what the clone may do. Sign-ins differ by connector. Figma and Fireflies hand you a key that you paste into OpenCode, never into Misha, and Set up shows each connector's state. A change on Set up applies to new Claude Code and OpenCode sessions. Misha tells an open session its tool list changed and refuses a call to a connector that is off, but a session that is already open may keep its list until you restart it.

Adding a connector doesn't mean changing the core: it is a module in an extension folder that declares itself. [Your own extension](#your-own-extension) shows what the declaration holds.

## What misha-core ships {#misha-core}

misha-core is the shipped extension that every other one installs beside, in each harness Misha finds. It holds what the runtime needs and nothing about a particular service:

- **Modules:** git history tools (log, show, blame), the worker tools, your own Slack tools, and the tools that read and change Misha itself.
- **Five worker profiles:** orchestrator, researcher, implementer, reviewer and one with no tools.
- **Three skills:** how the clone and your sessions start and follow workers, the GitHub command line, and git worktrees.
- **One command:** `/misha-setup`, which sets Misha up from your own Claude Code or OpenCode ([Settings and commands](/reference/settings#setup-command)).

The connectors above are extensions of their own, so a connector you leave off adds nothing to any session. Ticket, review, merge and deploy procedures aren't part of what ships: you write yours as routines and skills.

## Misha in your own sessions {#your-sessions}

Misha registers one MCP server, `misha`, in Claude Code (user scope) and in OpenCode's global configuration. It serves your sessions the tools of every installed extension for that harness, except connectors that are off:

- **Misha itself:** status, pause and resume, reading and changing settings, recent activity, a question for the clone, and the setup probe. A change made here has the same effect as one from the self-DM, and the tools say so when the app isn't running.
- **Your Slack:** reading channels, threads and history, and sending, reacting, editing and downloading attachments, through your signed-in Slack tab. A post you make this way is yours: it isn't in the clone's post record, and the clone reads it as a person's message.
- **Workers:** starting, following and stopping them, and reading and searching their sessions. The server sends your harness one instruction at session start: delegate through Misha's worker tools, not the harness's own subagent tools. That is how it avoids editing your `CLAUDE.md` or `AGENTS.md`, which no extension ever writes.
- **Connectors you switched on**, and the browser and desktop tools while Browser control is on.

Workers you start from your own session are your own, and you pick the model and effort for each run.

## Your own extension {#your-own-extension}

A Misha extension is a folder with a `misha-extension.json` manifest that declares what it contributes. It isn't a Claude Code plugin or an OpenCode package: Misha's installers translate it for each harness, so one folder serves both.

```text
shop-team/
├── misha-extension.json        the manifest
├── skills/team-writing/SKILL.md
├── commands/tidy-pr.md
└── modules/glossary/index.js   a built ES module serving one tool
```

A manifest can declare:

- **skills**, each a folder with a `SKILL.md` and anything beside it;
- **commands**, each a Markdown file both harnesses read alike;
- **agent profiles**, each a JSON file naming built-in tools, shell and skill access, and extension tools;
- **modules**, each with an entry that serves tools, and hooks per harness: Claude Code hooks on `PreCompact`, `SessionStart` or `Stop`, or the module's own OpenCode plugin;
- **agent grants**, which add this extension's tools to the agents of any installed extension;
- a **connector** block on a module, which makes it a connector.

An installer adds exactly what the manifest declares and refuses an extension whose declared files are missing. The entry default-exports an object with `create`, which builds the tools, and `jsonSchema`, which converts an input schema. The [misha-browser modules](https://github.com/dumdummisha/browser-extension) are a working example. An extension installs only beside misha-core.

A made-up example: Shop's team keeps its writing conventions for tickets and pull requests in one skill, a command that tidies a pull request description, and a read-only tool that looks a term up in the team's glossary. The manifest passes the app's manifest schema; the module, the skill and the command are yours to write.

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

The `connector` block is what puts the glossary on Set up with its own switch and in front of the clone. It declares:

- what Set up shows (`displayName`, `description`) and how sign-in works: settings it takes (`userConfig`), or a `keyPage` where the service hands out a key that goes into OpenCode;
- the tools clone turns get, each with its standard MCP annotations. A tool without `readOnlyHint: true` counts as a change, so only the owner's own turns may call it; `isUsersTurnOnly` keeps all of a connector's tools to the owner's turns;
- a command line the owner's turns may run (`cli`), the program it needs (`program`), its own skills (`skills`) and the host its links may go to (`linkHost`);
- `isOnByDefault`, the line the clone is told while it is on (`promptFragment`), and the grants it gives worker profiles (`agentGrants`).

The `agentGrants` in the connector apply only while its switch is on. The manifest's own `agentGrants` apply whenever the extension is installed.

::: warning Not available yet
The Misha app installs only the extensions it ships. The installer for yours runs from the app's private source, and the app has no control for it. An extension like this one is something to design against the format, not yet install from a release.
:::

## Where additions run {#where-additions-run}

[![Where an extension reaches: its skills, commands and agent profiles go to your Claude Code and OpenCode sessions, and a worker can run as one of its profiles. Its modules load only while their connector switch is on, then serve tools and hooks to your sessions, tools to workers where a grant names them, and the tools a connector declares to clone turns. The numbered list below describes each route.](/diagrams/extension-to-consumers.svg)](/diagrams/extension-to-consumers.svg)

1. **Your Claude Code sessions.** Skills sit in a shared skills folder, `~/.agents/skills`, with a link from Claude Code's own skills folder. Commands and agents go to Claude Code's folders, hook groups to its settings, and the tools come from the `misha` server.
2. **Your OpenCode sessions.** OpenCode reads the shared skills folder itself. Commands are copied into its global configuration folder, agents become members of its configuration, a module's OpenCode plugin carries its hooks, and the tools come from the `misha` server.
3. **Misha's workers.** A worker's bridge serves the tools of every module marked as served to workers, and a worker can call a tool only when its profile, with every installed extension's grants added, names it. A worker runs as any profile an installed extension declares, so your agent profiles can be run by name, and the clone's workers are served what is marked for workers while your own sessions' workers are served what your sessions are.
4. **Clone turns.** The clone gets the tools a connector declares for it while the connector is on, with the command line and skills it declares. Apart from misha-core's git history on your own turns, nothing else of an extension reaches a clone turn, and a connector with no clone tools, such as Browser control, adds none.

A module served to workers may not serve a tool with the name of one Misha's bridge serves itself (the workers' and Slack's): the installer refuses it.

### Names, collisions and what an install writes over {#installer-rules}

Skills go by `<extension>-<skill>`, so `team-writing` in `shop-team` is `shop-team-team-writing`, and the `SKILL.md` frontmatter must name itself that. Commands are `/shop-team:tidy-pr` in Claude Code and `shop-team/tidy-pr` in OpenCode. `"isNamespaced": false` installs both under bare names instead. Agents keep their own names.

An install treats the files it writes differently:

- A skill's folder is refused when something not the extension's own is already there. Nothing is written over it.
- A command or an agent of the same name is written over, after the installer moves the old file into <code><Fact name="desktop.paths.paths.overwritten.path" /></code>. One batch is kept per install run, and the newest <Fact name="desktop.retention.overwrittenBatches.kept" /> stay. Uninstalling doesn't restore them.
- A name that matches a Claude Code built-in, a command of yours elsewhere or a skill in another folder OpenCode reads gets a warning, and the extension is installed beside it.

[Control and maintain Misha](/operate/manage#remove) covers removal.

## Claude Code and OpenCode {#claude-code-and-opencode}

You choose the runtime the clone thinks with on Settings, and a model and effort for each. The default runtime is <Fact name="desktop.settings.fields.runtime.default" /> The other is OpenCode. Switching starts a new session in the other runtime; settings, notes and routines stay. Either way, an extension's skills, commands, agents and tools install into every harness Misha finds, so installing it doesn't depend on which one runs the clone.

Workers run Claude Code, or OpenCode with a GPT model. The clone picks a Claude model unless the request or a routine names another, and a routine can ask for a reviewer worker on a model it names. [Put Misha to work](/use/workflows) covers what each kind of request needs.

## Other apps {#other-apps}

A tool for another service, say the team's internal status page, is a module in your extension. With a connector block it gets a Set up row and a switch, and the clone is told what it is for. Without one it reaches your own sessions, and workers where the module is served to them and a grant names the profile. Signing in is up to the module: its entry can export a check that Set up runs, and a connector that needs a key can send you to the service's key page with the key going into OpenCode.

Misha has no setting that swaps one service for another: a connector for a different tracker sits beside Jira and Confluence rather than replacing it.

## Browser and desktop tools {#browser-and-desktop}

The public misha-browser package has tools that read and drive your own browser through the Misha Browser extension, and tools that move the Mac's mouse, press its keys, capture its screen and bring apps to the front. A page reads as a compact outline (headings, visible text, and each control with a numbered ref, role, name and state) instead of HTML. Clicks, typing, key presses and scrolling are real input, so the page gets the same events a person makes, and after an action the result lists what changed.

Inside Misha they are the **Browser control** connector. While it is on, Misha's server gives the tools to your own Claude Code and OpenCode sessions. It gives none of them to the clone or to the workers the clone starts.

<!-- facts capabilities browser-read browser-act desktop-control -->

Two made-up examples, both in Leo Novak's own Claude Code session:

- **Browser:** "In my signed-in Shop admin tab, find this morning's order for Emma Lee and read me its refund status." This uses tab listing, reading and finding, and needs the extension and native host. It types into the search field, so it also needs Accessibility and Screen Recording for the terminal or app running Claude Code.
- **Desktop:** "Bring Simulator to the front and capture the screen." Focusing an app needs no grant; the capture needs both.

An extension of yours can serve the same tools through the package's `browserModule` and `desktopModule` exports, for your sessions and, with `isServedToWorkers` and a grant, for workers. A worker that gets them acts in your signed-in browser and on your screen as you.

The extension records every tab's fetch and XHR requests while it runs, not only during a tool call, with credentials redacted by name and pattern, which misses an opaque credential under an ordinary name. Page text, field values and screenshots come back as the page or screen shows them. [Browser permissions](/reference/permissions) explains each permission and which tools need the macOS grants, and [Privacy and security](/privacy) where the data goes.

## Using them without Misha {#standalone}

The standalone MCP server serves the browser and desktop tools over stdio to Claude Code, OpenCode or any other MCP client, without the Misha app or an invite. It runs on macOS only, and the browser tools need the extension and its native host loaded in Chrome or Brave. Follow the [misha-browser README](https://github.com/dumdummisha/browser-extension#readme) to build it, load the unpacked extension, install the native host, register the server and grant the macOS permissions; this page doesn't repeat those steps.

## Public and private {#public-and-private}

| Part | Where | Licence |
| --- | --- | --- |
| These docs | [dumdummisha/docs](https://github.com/dumdummisha/docs) | Apache-2.0 for code and prose, OFL-1.1 for the fonts; the name, mascot and app icon are brand artwork |
| Browser extension, native host, protocol, client, browser and desktop tools, MCP server | [browser-extension](https://github.com/dumdummisha/browser-extension) | Apache-2.0 |
| Signed builds and the update feed, once there are releases | [desktop-downloads](https://github.com/dumdummisha/desktop-downloads) | No licence file; no public release yet |
| The desktop app, misha-core and the connectors it ships | Private | Not published |

To see how Misha does it, start with misha-browser: its protocol shows what passes between the extension, the native host and the app, and its tools are the ones you can reuse today.
