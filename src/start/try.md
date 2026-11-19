---
title: Try it
description: "Misha is a personal AI agent for routine Slack work. It is battle-tested, runs on your own subscription and computer, needs no Slack app, has a stealth mode and lean connectors, and does real multi-provider, multi-effort agentic development."
prev: false
next:
  text: Get started
  link: /start/get-started
---

# Try it

Misha is a personal AI agent that takes routine work off you in Slack. It answers routine questions from your own account, using your code and the services you connect, hands bigger jobs to workers (separate AI sessions that each do one task) and brings you the decisions that need you.

## Battle-tested, not a gimmick {#tested}

Misha is a real project, not a demo. It has worked alongside real people at a professional software development agency, and plenty of them tried to talk it out of its rules.

## Your subscription, your tools, your machine {#runs-locally}

Unlike hosted agents, Misha runs on the subscription you already pay for and fits the environment you already have: your Claude Code, your repositories and the services you're signed in to. It has no server of its own. The Misha app, the clone and its workers run on your own computer or on a machine you dedicate to it, and your settings, its records and its read-only copies of your repositories stay in folders there. The goal is to run on local models alone as well, which would keep your work automated, under your control and private.

## No Slack app to approve {#no-slack-app}

There is no Slack app to install, so there's nothing for a workspace admin to approve. Misha acts through the Slack you're already signed in to in Chrome or Brave, using your own session ([how that works](/understand/how-it-works#without-a-slack-app)). Your organisation's policies on tools and personal agents still apply, and a managed Mac may need IT to allow the browser extension and its native host.

## Marked by default, or stealth mode {#marker}

By default, your clone's posts start with an emoji you choose and are set in italics, so colleagues can tell them from what you type. Stealth mode drops the marker, so the clone's replies look like your own. [Talking with a clone](/understand/slack) is the page to send colleagues either way.

## Lean connectors, ready to use {#connectors}

Misha ships its own small connectors instead of each vendor's full MCP server. Each carries only the few tools the clone and its workers use, so a session loads fewer tool descriptions. They come from tooling Michal Jarnot spent two to three years building, before Claude Code became popular. Slack is always on, and you turn the service connectors on during setup; each works only while you're signed in to that service on your Mac.

| Connector | What it does |
| --- | --- |
| Slack | Reads threads, channel history, linked messages and images through your Slack tab; workers post their results through it. |
| Jira | Finds and reads issues, sprints, backlogs, epics and attachments; creates, updates, comments on, transitions, links and moves issues. |
| Confluence | Finds and reads spaces and pages; creates, updates and moves pages and works with their comments. |
| Google Workspace | Reads Docs and Sheets with their comments; creates a Doc from Markdown, edits Docs, writes Sheet ranges and adds comments. |
| Figma | Outlines a file's pages and frames, inspects a frame's text, colours and type styles, and renders frames as images. |
| Fireflies | Lists, searches and reads your meeting transcripts and their summaries. |
| Git | Log, show and blame on the repositories the clone keeps copies of. |
| AWS sessions | Opens AWS CLI sessions that hold only the environment profiles a task needs, signed in through IAM Identity Center. |

GitHub work goes through the GitHub CLI. A Misha connector also lets you check status, pause, resume and change settings from inside Claude Code or OpenCode.

## Many models, many efforts, one piece of work {#harnesses}

Misha's selling point is real multi-provider, multi-effort agentic development. One piece of work can pass through several workers, each on the model and effort that suits its step: by default Claude writes the ticket and the code, and GPT reviews them, so another provider's model checks Claude's work. Claude Code on its own keeps to one provider's models.

The goal is to run on OpenCode alone, free of the big providers. For now, Claude Code is the only way to use a Claude subscription, so the clone runs in your own unmodified Claude Code. Workers run in Claude Code or in OpenCode, which reaches GPT and any other provider you sign it in to.

## Availability {#availability}

There is no public download yet. Since 19 November 2026, one owner has been running an unsigned local build. To try it, ask for an invite on [dumdummisha.ai](https://dumdummisha.ai). Misha is free during the invite-only pilot: you pay for your own Claude and, if you use it, OpenAI. No price is promised after the pilot. [Get started](/start/get-started) shows what setup involves.

## Who makes it {#publisher}

Misha is built and published by Michal Jarnot, a software engineer with a decade of experience building products for Silicon Valley companies. You reach him by asking for an invite on [dumdummisha.ai](https://dumdummisha.ai).

## For your security team {#security}

Forward [the security assessment](/privacy#assessment). It covers data flows, credentials, browser permissions, worker authority, updates, audit, stopping and removal, and its [residual risks](/privacy#residual-risks) start with the main one: the clone posts as you and can be wrong.
