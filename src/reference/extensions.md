---
title: Customise and reuse Misha
description: "Take work over yourself, package your own tools and instructions as an extension, or use the public browser and desktop tools on their own."
prev:
  text: How Misha works
  link: /understand/how-it-works
next: false
---

# Customise and reuse Misha

Most changes need no code. Pick the level that matches what you want:

- **Change how your clone sounds or what it may do:** the voice, notes, requesters, channels and repositories are settings. [Make it yours](/use/make-it-yours) walks through them.
- **Take a job over and finish it yourself:** pause, look at where the work stands, and carry on in your own tools. See [Take work over](#take-work-over).
- **Add instructions or tools you use again and again:** that is a Misha extension, a folder of skills, commands, agent profiles and tool modules. See [Your own extension](#your-own-extension).
- **Use the browser and desktop tools in your own agent:** the public misha-browser package runs on its own, without the Misha app or an invite. See [Browser and desktop tools](#browser-and-desktop).

## Take work over {#take-work-over}

When work is in flight and you want it to stop, [pause Misha](/operate/manage) first: no new worker starts, and Misha tries to stop the running ones. Then read where the work stands from its own records: the Slack thread, the ticket, the branch and the pull request on GitHub, and Home's **Working on now** and **Recently** in the Misha window. An implementing worker commits and pushes its branch, so you can check it out in your own clone of the repository and continue there.

To hand a delivery back to a person without pausing everything, reassign its ticket or remove the `auto` label it was taken with. The delivery procedure tells the clone to read the ticket before it starts a delivery worker and when that worker reports back, and the worker re-reads it before a merge, so the work stops at the next of those checks, not at once. These checks are the procedure's instructions, not a watcher in the app ([Put Misha to work](/use/workflows#follow-and-take-over)). Removing someone from **Who may ask me for work**, or turning **May merge** off, applies to the clone's next turns. It doesn't cancel what a worker was already told to do. There is no take-over button, no automatic handover of a worker's workspace to you, and no undo for a post, a merge or a deploy that already happened.

## Your own extension {#your-own-extension}

A Misha extension is a folder with a `misha-extension.json` manifest that declares what it contributes. It isn't a Claude Code plugin or an OpenCode package: Misha's installers translate it for each harness, so one folder serves both.

```text
shop-team/
├── misha-extension.json        the manifest
├── skills/team-writing/SKILL.md
└── modules/glossary/index.js   a built ES module serving one tool
```

The parts an extension can declare:

- **skills**, each a folder with a `SKILL.md` and anything beside it;
- **commands**, each a Markdown file both harnesses read alike;
- **agent profiles**, each a JSON file naming built-in tools, shell and skill access, and extension tools;
- **modules**, each with an entry that serves tools, and hooks declared per harness (Claude Code hooks, or the module's own OpenCode plugin);
- **agent grants**, which add this extension's tools to another extension's agent profiles;
- optionally, global instructions for each harness and a few members of Claude Code's settings or OpenCode's configuration.

An installer adds exactly what the manifest declares and refuses an extension whose declared files are missing. Skills and commands go by names that carry the extension's name, such as `shop-team:team-writing`, unless the manifest asks for bare names. A bare-named skill or command goes into the harness's own skills or commands folder under that name and replaces a file already at that path; a same name elsewhere, such as a built-in command or a skill in another folder, gets a warning, not a refusal. Agents keep their own names, so an agent of the same name is replaced too. The installer moves each replaced file aside first, and uninstalling doesn't restore it ([Where additions run](#where-additions-run) has how many batches it keeps).

A made-up example: Shop's team keeps its writing conventions for tickets and pull requests in one skill, and a read-only tool that looks a term up in the team's glossary. This manifest passes the app's manifest schema; the module and the skill are yours to write.

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
      "isServedToWorkers": true
    }
  ],
  "agents": [],
  "skills": ["team-writing"],
  "commands": [],
  "agentGrants": {
    "researcher": ["glossary_lookup"],
    "implementer": ["glossary_lookup"],
    "reviewer": ["glossary_lookup"]
  }
}
```

`isServedToWorkers` makes Misha's bridge serve the glossary tool to workers, and the grants let three of misha-core's worker profiles call it. The module's entry default-exports a module definition that creates its tools; that contract is part of the private app and isn't published yet.

::: warning Not available yet
The Misha app installs only its bundled extension, misha-core, today. It has no control for installing your own, so an extension like this one is something you can design against the format, not yet install from a release.
:::

## Where additions run {#where-additions-run}

[![Where an extension reaches: your Claude Code and OpenCode sessions get what its manifest declares, Misha's workers get the tools of modules served to workers where a grant names the profile, and clone turns get nothing from an extension. The numbered list below describes each route.](/diagrams/extension-to-consumers.svg)](/diagrams/extension-to-consumers.svg)

1. **Your Claude Code sessions.** Namespaced skills and commands arrive as a plugin from Misha's own marketplace, agents go to your agents folder, hooks and settings members to your Claude Code settings, and every installed extension's tools are served by one MCP server named `misha`.
2. **Your OpenCode sessions.** Skills and commands are copied into OpenCode's global configuration folder, agents become members of its configuration, and each module's tools are served by a generated plugin that wraps the module.
3. **Misha's workers.** A worker's bridge serves the tools of every module marked as served to workers. A worker always runs as one of misha-core's five profiles, never as your extension's own agents, and it can call a tool only when its profile, with every installed extension's grants added, names it.
4. **Clone turns.** The clone's tools come from the connections you turn on and a fixed list per connection, so no extension tool reaches a clone turn.

So installing a module, or granting it to one profile, doesn't put it in front of the clone. A module served to workers may not serve a tool with the name of one Misha's bridge serves itself (the workers' and Slack's): the installer refuses it.

Installing writes into your harness configuration, and it can write over a file that is already there. The installer moves what it replaces aside first, one batch per install run, and keeps the newest <Fact name="desktop.retention.overwrittenBatches.kept" /> batches. Uninstalling doesn't put those files back. [Control and maintain Misha](/operate/manage) covers removal.

## Claude Code and OpenCode {#claude-code-and-opencode}

The Slack clone always runs your unmodified Claude Code. Workers run Claude Code, or OpenCode with a GPT model. Installing Misha's extension in OpenCode, or running the setup command there ([Settings and commands](/reference/settings#setup-command)), gives your OpenCode sessions the tools and skills; it doesn't replace the clone. The delivery procedure assigns Claude to research, tickets and code and GPT to reviews. A note or personality saying otherwise doesn't change that, and there is no setting to choose a worker's model.

## Other apps {#other-apps}

A tool for another service, say the team's internal status page, is a module in your extension. It reaches your own sessions once installed, and Misha's workers when the module is served to workers and a grant names the profile. Signing in to that service is up to the module: **Set up** lists only Misha's built-in connections, and a custom module gets no row there.

Turning off a built-in connection doesn't swap in another app, and a ticket tool for a different tracker doesn't change the delivery procedure, which writes its tickets in Jira. There is no generic adapter or settings switch for another tracker or chat tool today.

## Browser and desktop tools {#browser-and-desktop}

The public misha-browser package has tools that read and drive your own browser through the Misha Browser extension, and tools that move the Mac's mouse, press its keys, capture its screen and bring apps to the front. A page reads as a compact outline (headings, visible text, and each control with a numbered ref, role, name and state) instead of HTML. Clicks, typing, key presses and scrolling are real input, so the page gets the same events a person makes, and after an action the result lists what changed.

<!-- facts capabilities browser-read browser-act desktop-control -->

These aren't clone tools. misha-core doesn't declare them, and the clone's connections don't include them. To use them, register the standalone MCP server in your own Claude Code or OpenCode, or serve them from an extension module through the package's `browserModule` and `desktopModule` exports, for your sessions and, with a grant, for workers. A worker that gets them acts in your signed-in browser and on your screen as you.

Two made-up examples, both in Leo Novak's own Claude Code session:

- **Browser:** "In my signed-in Shop admin tab, find this morning's order for Emma Lee and read me its refund status." This uses tab listing, reading and finding, and needs the extension and native host. It types into the search field, so it also needs Accessibility and Screen Recording for the terminal or app running Claude Code.
- **Desktop:** "Bring Simulator to the front and capture the screen." Focusing an app needs no grant; the capture needs both.

The extension records every tab's fetch and XHR requests while it runs, not only during a tool call, with credentials redacted by name and pattern, which misses an opaque credential under an ordinary name. Page text, field values and screenshots come back as the page or screen shows them. [Browser permissions](/reference/permissions) explains each permission and which tools need the macOS grants, and [Privacy and security](/privacy) where the data goes.

## Using them without Misha {#standalone}

The standalone MCP server serves the browser and desktop tools over stdio to Claude Code, OpenCode or any other MCP client, without the Misha app or an invite. It runs on macOS only, and the browser tools need the extension and its native host loaded in Chrome or Brave. Follow the [misha-browser README](https://github.com/dumdummisha/browser-extension#readme) to build it, load the unpacked extension, install the native host, register the server and grant the macOS permissions; this page doesn't repeat those steps.

## Public and private {#public-and-private}

| Part | Where | Licence |
| --- | --- | --- |
| These docs | [dumdummisha/docs](https://github.com/dumdummisha/docs) | Apache-2.0 for code and prose, OFL-1.1 for the fonts; the name, mascot and app icon are brand artwork |
| Browser extension, native host, protocol, client, browser and desktop tools, MCP server | [browser-extension](https://github.com/dumdummisha/browser-extension) | Apache-2.0 |
| Signed builds and the update feed, once there are releases | [desktop-downloads](https://github.com/dumdummisha/desktop-downloads) | No licence file; no public release yet |
| The desktop app and misha-core | Private | Not published |

To see how Misha does it, start with misha-browser: its protocol shows what passes between the extension, the native host and the app, and its tools are the ones you can reuse today.
