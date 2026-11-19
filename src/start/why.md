---
title: Try it
description: "Misha is a personal AI agent for routine Slack work: it runs on your own computer, needs no Slack app, has a stealth mode, comes with lean connectors and runs workers in Claude Code or OpenCode with any provider OpenCode supports."
prev: false
next:
  text: Get started
  link: /start/get-started
---

# Try it

Misha is a personal AI agent that takes routine work off you in Slack. Its clone answers routine questions from your own account, using your code and the services you connect, hands bigger jobs to workers (separate AI sessions that each do one task) and brings you the decisions that need you. These are the reasons to try it.

## It runs on your own computer {#runs-locally}

The Misha app, the clone and its workers run on your own computer (today, a Mac), and Misha has no server of its own. Your settings, its records and its read-only copies of your repositories stay in folders on that Mac. The models still see what they process, under your own accounts: Claude Code sends what the clone and Claude workers read and write to Anthropic, and OpenCode sends a GPT worker's task to OpenAI. [Privacy and security](/privacy) lists every recipient and what each one gets.

## No Slack app to approve {#no-slack-app}

There is no Slack app to install, so there's nothing for a workspace admin to approve. Misha acts through the Slack you're already signed in to in Chrome or Brave, with your own session ([how that works](/understand/how-it-works#without-a-slack-app)). Your organisation's policies on tools and personal agents still apply, and a managed Mac may need IT to allow the browser extension and its native host.

## Marked by default, or stealth mode {#marker}

By default, your clone's posts start with an emoji you choose and are set in italics, so colleagues can tell them from what you type. Stealth mode drops the marker, so the clone's replies look like your own. [Talking with a clone](/understand/slack) is the page to send colleagues either way.

## Lean connectors, ready to use {#connectors}

Misha ships its own small connectors instead of each vendor's full MCP server. Each one has the few tools the clone and its workers use, so a session carries fewer tool descriptions; how much that saves hasn't been measured. Slack is always on, and you turn the service connectors on during setup; each works only while its sign-in on your Mac does.

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

## Claude Code and OpenCode together {#harnesses}

The clone itself runs in unmodified Claude Code on your own Claude subscription. Workers run either in Claude Code or in OpenCode, which can reach the models of any provider you sign it in to, GPT included: you don't need Codex as a separate tool. One request can pass through several workers, each on its own model and effort. Misha's bundled routing gives most work to Claude and reviews to GPT, so another provider's model checks the tickets and pull requests Claude writes.

## A Mac of its own {#own-device}

Misha answers only while its Mac is awake, online and has Slack open. You can give it a Mac of its own, such as a Mac mini that stays on, the way many people run personal agents. That Mac is under your control: Misha's records stay on it, and you decide what it signs in to.

## What you need {#requirements}

- A Mac with the Misha app, kept awake and online.
- Slack, which is the only chat Misha works with today; adapters for Microsoft Teams and Discord are in progress.
- Chrome or Brave, signed in to Slack, with the Misha Browser extension.
- Claude Code, signed in with your own Claude subscription, and git. The GitHub CLI if the clone should read code.
- Optionally, OpenCode signed in to OpenAI, for GPT reviews of tickets and pull requests.

Misha is free for now, during the invite-only pilot. You pay for your own Claude and, if you use it, OpenAI. No price is promised after the pilot.

## Availability {#availability}

There is no public download yet. Since 19 November 2026 one owner runs an unsigned local build. To try it, ask through the invite on [dumdummisha.ai](https://dumdummisha.ai). [Get started](/start/get-started) shows what setup involves.

## Tested alongside real people {#tested}

Misha has worked alongside real people at a professional software development agency, where plenty of them tried to talk it out of its rules, so it is battle-tested. That doesn't make it trick-proof: text in messages, tickets and files can still try to steer the model, and the clone can be wrong in public as you. The [residual risks](/privacy#residual-risks) list what the rules don't stop.

## Who makes it {#publisher}

Misha is built and published by Michal Jarnot, a software engineer with a decade of experience building products for Silicon Valley companies. You reach him through the invite on [dumdummisha.ai](https://dumdummisha.ai).

## For your security team {#security}

Forward [the security assessment](/privacy#assessment). It covers data flows, credentials, browser permissions, worker authority, updates, audit, stopping and removal, and its [residual risks](/privacy#residual-risks) start with the main one: the clone posts as you and can be wrong.
