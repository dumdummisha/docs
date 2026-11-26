---
title: Try it
description: "Misha is a personal AI agent for routine Slack work. It is battle-tested, runs on your own subscription, needs no Slack app, asks before it acts, has a stealth mode and lean connectors, and does real multi-provider, multi-effort agentic development."
prev: false
next:
  text: Get started
  link: /start/get-started
---

## Battle-tested, not a gimmick {#tested}

Misha is a real project, not a demo. It has worked alongside real people in a professional environment.

## Your subscription, your tools {#runs-locally}

Unlike hosted agents, Misha runs on the subscription you already pay for and fits the environment you already have: your Claude Code or OpenCode, your repositories and the services you're signed in to. Either one is enough: Misha runs on whichever you have. [What Misha changes on your Mac](/start/get-started#before-you-install) lists what it installs there.

## No Slack app to approve {#no-slack-app}

There is no Slack app to install, so there's nothing for a workspace admin to approve. Misha acts through the Slack you're already signed in to in Chrome or Brave, using your own session ([how that works](/understand/how-it-works#without-a-slack-app)). Your organisation's policies on tools and personal agents still apply, and a managed Mac may need IT to allow the browser extension and its native host.

## It asks before it acts {#approvals}

Until you trust how it works, your clone shows you every reply, reaction and file before it goes out, and every piece of work before it starts, on Home in Misha's window. Nothing goes out and no work starts until you approve it. Both checks are on for a new clone, and you turn each off when you're ready ([Make it yours](/use/make-it-yours#approvals)).

**Pause** stops the clone and the workers it started, from the window, the menu bar or your self-DM. Your own Claude Code and OpenCode sessions keep working.

## Marked by default, or stealth mode {#marker}

By default, your clone's posts start with an emoji you choose and are set in italics, so colleagues can tell them from what you type. Stealth mode drops the marker, so the clone's replies look like your own. [Talking with a clone](/understand/slack) is the page to send colleagues either way.

## Lean connectors, ready to use {#connectors}

Misha ships its own small connectors instead of each vendor's full MCP server. The service connectors carry a small set of tools, so a session loads fewer tool descriptions. They come from tooling the author spent two to three years building, before Claude Code became popular. Slack and GitHub are built in. You add any other connector from the **Catalogue** in Misha's window, and it then works wherever Misha supplies it, your own Claude Code and OpenCode sessions included. A service connector also works only while you're signed in to that service on your Mac.

| Connector | What it does |
| --- | --- |
| Slack | Reads threads, channel history, linked messages and images through your Slack tab; workers post their results through it. |
| Jira and Confluence | Finds, reads, creates, updates, comments on, transitions, links and moves Jira issues across sprints, backlogs and epics; finds, reads, creates, updates and moves Confluence pages and works with their comments. |
| Git and GitHub | Works on branches, commits and opens pull requests, reads the CI results on a pull request and re-runs failed workflow runs, and reads a repository's history, through git and the GitHub CLI. |
| AWS | Opens AWS CLI sessions that hold only the environment profiles a task needs, signed in through IAM Identity Center. |
| Google Workspace | Reads Docs and Sheets with their comments; creates a Doc from Markdown, edits Docs, writes Sheet ranges and adds comments. |
| Figma | Outlines a file's pages and frames, inspects a frame's text, colours and type styles, and renders frames as images. |
| Fireflies | Lists, searches and reads your meeting transcripts and their summaries. |
| Browser control | Reads and drives your browser tabs, and controls the Mac's mouse, keyboard and screen, from your own agent sessions. It gives nothing to the Slack clone or the workers it starts. |
| Handoff compaction | Writes a handoff when your Claude Code or OpenCode session compacts, and resumes the work from it. On by default. |

Misha's built-in tools also let you check status, pause, resume and change settings from inside Claude Code or OpenCode.

## Many models, many efforts, one piece of work {#harnesses}

This is real multi-provider, multi-effort agentic development. One piece of work can pass through several workers (separate AI sessions that each do one task), each on the model and effort that suits its step: workers use the clone's runtime by default (Claude on Claude Code, GPT on OpenCode), and your requests or Routines can have Claude write a change and GPT review it, so another provider's model checks Claude's work. Parts of a request that don't depend on each other each get a worker, and they run at the same time. Claude Code on its own keeps to one provider's models.

## Availability {#availability}

Download Misha for macOS from [the latest release](https://github.com/dumdummisha/desktop-downloads/releases/latest), then follow [Get started](/start/get-started) to your clone's first answer. Misha itself costs nothing. You pay only for your own Claude and for any model provider you use through OpenCode.

## Who makes it {#publisher}

Misha is built and published by Michal Jarnot, a software engineer with a decade of experience building products for Silicon Valley companies. You reach him by asking for an invite on [dumdummisha.ai](https://dumdummisha.ai), or with **Book a call with Michal** on the same page.

## For your security team {#security}

Forward [the security assessment](/privacy#assessment). It covers data flows, credentials, browser permissions, worker authority, updates, audit, stopping and removal, and its [residual risks](/privacy#residual-risks) start with the main one: the clone posts as you and can be wrong.
