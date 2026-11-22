---
title: How Misha works
description: "How a Slack message reaches your clone and its reply gets back without a Slack app, what the clone runs on, and how workers, connectors and your own setup fit around it."
prev:
  text: Put Misha to work
  link: /use/workflows
next:
  text: Customise and reuse Misha
  link: /reference/extensions
---

# How Misha works

Misha reads Slack through your own signed-in Slack tab and posts back through it, so there is no Slack app to install and the clone acts as your account. On your Mac, the Misha app hands each message meant for you to the clone, one long-running Claude Code or OpenCode session, and longer jobs go to workers, separate sessions with their own permissions.

## From a message to a reply {#message-to-reply}

[![How a Slack message reaches your clone and its reply gets back: Slack, your tab, the extension, the native host, the Misha app and the clone on your Mac, with workers, linked folders, model providers and connected services around them, in twelve numbered steps that the list below describes.](/diagrams/message-to-reply.svg)](/diagrams/message-to-reply.svg)

Select the diagram to open it full size. The dashed box is the one step that happens only when a turn may start work.

1. Slack's socket delivers a new message to your signed-in Slack tab, where the Misha Browser extension's observer reads it.
2. The extension's service worker queues it until the app acknowledges it.
3. It forwards it to the native host, a small program that connects the browser extension to processes on your Mac.
4. The native host hands it to the Misha app over a local socket.
5. The app decides whether it is for you, stores it, and only then acknowledges it back along the same path.
6. A run hands the waiting messages of one conversation to the clone as a turn.
7. The clone thinks with the runtime and model you chose, through your own sign-in, so the turn goes to that model's provider.
8. It reads what the answer stands on: the thread (through Misha's bridge, the native host and your tab), your linked folders, GitHub and the connectors you switched on.
9. The turn hands its post to the app, which records it in the provenance ledger before sending it as you, back along the same path.
10. Slack sends the post back like any message, and the app recognises it as its own.
11. On a turn that may start work, the clone starts a worker.
12. The worker calls its own model provider and your services, and its report returns to the app as a message for the clone.

[Privacy and security](/privacy) has what each recipient receives and what is stored where.

## Slack without a Slack app {#without-a-slack-app}

The extension runs an observer in the Slack page before Slack's own scripts, so it reads the same socket frames Slack's web client receives. A function the extension runs in that page reads the session token, adds it to each Web API call and sends the call only to your workspace's address on Slack's domain, with redirects refused. It doesn't return the token. Downloads go to `files.slack.com` with the browser's cookies and no token. An upload's bytes go to the URL Slack's answer names, without the token and with redirects refused; the extension checks only that the URL parses, not its host, and never passes it to the app.

The exception is the network observer: Chrome shows the service worker every request a tab sends, so the token and session cookie reach it for a moment. It redacts both before recording the request, and neither is stored or sent to the native host. Because Misha acts as you, clone replies carry the marker you chose and are set in italics ([Talking with a clone](/understand/slack)).

Nothing runs on a Misha server: the browser, the native host (which only this extension can start, over a socket only your macOS user can open) and the app are all on your Mac, which has to be awake, with a Slack tab signed in. [Browser permissions](/reference/permissions) accounts for each permission and [where Slack's credentials go](/reference/permissions#where-slack-credentials-go).

## Nothing acknowledged before it is stored {#commit-before-ack}

The extension resends a message until the app acknowledges it, which happens only after the app has stored the event and what it routes to in one database transaction. A message waiting for the clone has no age limit, and the clone rereads the thread before answering. A repeat changes nothing while the app still holds its receipt, kept for:

<!-- facts retention event-receipts -->

That suppresses duplicates for a window; it isn't a promise to process each event exactly once. The queue is bounded, not lossless: when it is full new events are dropped and counted, and a restart while writes fail loses the events held in memory without a record ([the limits](/reference/permissions#exceptions)). A message Slack never delivered to the tab, because the Mac slept or the tab was closed, was never captured. [Troubleshooting](/operate/troubleshooting) covers both.

Sending has its own rule. The app records a post in the provenance ledger before sending it. When Slack's answer proves the post arrived or was refused, the record says so. When it doesn't, the record is uncertain: the app never resends it by itself, and the post's echo can confirm it later. [Troubleshooting](/operate/troubleshooting#send-not-confirmed) covers checking the conversation before you send again.

## What reaches the clone, and why it never answers itself {#routing-and-loops}

A message from someone else reaches the clone when it is a DM to you, mentions you, replies in a thread you are in, or is in a channel you have it watch, unless you ignore that person (soft-ignored people reach it only with the clone's emoji). Of your own messages, only what you typed in your self-DM (your direct message to yourself in Slack), or anywhere with the clone's emoji in it, is a request to it. `hands off` in a thread keeps other people's messages there from the clone, and your own still reach it.

Only what a person typed counts, never a bot's or an app's post. Every post Misha sends carries a message id from a namespace of its own and a ledger record made before it goes out, so when it comes back the app never treats it as you typing. Other people's Misha clones share that namespace, so their posts never start a reply.

## What Misha is made of {#made-of}

A small core listens to Slack, decides what reaches the clone, runs it and keeps the ledger. Always on beside it: Slack, Claude Code (the clone starts on it, and workers use it by default), GitHub (its CLI, and the commit history of your linked folders) and the workers. Connectors are opt-in, one switch each on **Set up**: <Fact name="desktop.detection.items.atlassian.name" />, <Fact name="desktop.detection.items.google.name" />, <Fact name="desktop.detection.items.aws.name" />, <Fact name="desktop.detection.items.figma.name" />, <Fact name="desktop.detection.items.fireflies.name" />, <Fact name="desktop.detection.items.browser.name" /> and <Fact name="desktop.detection.items.compaction.name" />. Out of the box the connectors on are: <Fact name="desktop.settings.fields.connectors.default" />

<Shot id="setup-connectors" caption="The connectors on Set up, each with its own switch. Made-up example." />

A switch that is on loads the connector wherever it works: in the clone's turns, in workers, and in Misha's MCP server inside your own Claude Code and OpenCode. Off loads it nowhere, and a host with an old tool list refuses the call. Browser control is the exception: it serves your own Claude Code and OpenCode, and gives the clone and its workers nothing. A new connector needs no change to the core ([Customise and reuse Misha](/reference/extensions)).

## What the clone runs on {#clone-runtime}

The clone is one session for your account, shared by every conversation, so it remembers what is in flight elsewhere. The cost: conversations are kept apart by the clone's instructions, not by separate sessions, and what it read earlier stays in that session's memory. [Settings and commands](/reference/settings#notes-history-start-fresh) covers compaction and **Start fresh**.

You choose the runtime, and the model and effort on each, on Settings under **What I think with**. <code><Fact name="desktop.commands.commands.use-claude-code.syntax" /></code> and <code><Fact name="desktop.commands.commands.use-opencode.syntax" /></code> in your self-DM switch the runtime and keep the model already saved for it.

<Shot id="settings-thinking" caption="What the clone thinks with: Claude Code with its default model, and OpenCode as the other choice. Made-up example." />

| Setting | Default |
| --- | --- |
| Model and effort | <Fact name="desktop.settings.fields.models.default" /> |
| When the session is compacted | <Fact name="desktop.settings.fields.compactAtTokens.default" /> |

On Claude Code, a turn is one headless run of your own Claude Code on your own plan, loading none of your settings, instructions or plugins. On OpenCode, each call starts a private server on a configuration Misha writes, not yours. Switching runtime starts a new session and keeps your settings, notes and routines.

## What a clone turn may do {#clone-turns}

A turn gets only the tools the app lists for it, with Misha's bridge as its one MCP server. Its built-in tools read files and search in its own empty folder and your linked folders; it has no tool to edit files or browse the web. Anything not allowed is refused, and the bridge refuses again what a turn may not call. The tools depend on who the turn answers:

- a turn for anyone gets the read tools of Slack and of the connectors you switched on;
- your own turn (your self-DM, or a message with the clone's emoji in it) also gets their change tools, the commit history of your linked folders, and the command lines, the only programs the shell may start: the GitHub CLI, and the AWS CLI while AWS is on;
- a turn for you or someone you allow can also start and follow workers.

Authority comes from who sent a message, as the app identified them, never from what it says. The shell rules choose which program starts, not what it does: the command lines act with everything your GitHub and AWS accounts may do, and can start other programs (a GitHub CLI alias that runs a shell command, an AWS profile's credential process), which is why only your own turns get them. The ceiling on deploys (dev only, never staging, production or a release) and the rules about other people's code are the clone's instructions, not an operating-system sandbox: what your accounts permit is the hard limit. The clone redacts secret-shaped strings from what it posts. [Put Misha to work](/use/workflows) shows them from the requester's side.

## Linked folders {#linked-folders}

A linked folder is one you already have, with the remote its pull requests go to and whether workers may merge there. The clone reads it as it is, uncommitted work and `.env` files included, the way Claude Code would in a session you run there, and never writes in it. What it reads can reach whoever it answers; its instructions tell it to leave out what you wouldn't share.

Unlinking removes the folder from later runs and leaves its files alone. It doesn't stop a run already under way or erase what the session read, so [pause Misha](/operate/manage#pause) first when access has to stop now. Workers never use your folder itself: code work gets a git worktree made from it, under Misha's own folder, and other work gets a scratch folder.

## Workers {#workers}

A worker runs with your sign-ins, as a profile that sets its tools, on Claude or, when the request or your routines say so, a GPT model through OpenCode. A Claude worker keeps your Claude Code settings and skills but runs as the profile Misha selects, with Misha's bridge as its only MCP server. A GPT worker runs OpenCode on a configuration Misha writes for that run.

The researcher and reviewer profiles are read-only by instruction, not by sandbox: they still have the shell and file editing, and a worker reaches any path its profile allows. Nothing in the app orders a review or a merge, and where merging is allowed is an instruction to the clone and its workers, so what your GitHub account may do is the limit. Pausing Misha stops the clone's workers, and names any run it can't confirm stopped.

## Routines, and the setup that stays yours {#your-setup}

Routines are one optional field of up to <Fact name="desktop.settings.fields.routines.limits.maxCharacters" /> characters: what you want done with work. A routine grants nothing: who may ask for work, what the clone may change or run and where workers may merge stay in settings. Your request comes first, then your routines, then the clone's defaults, and a colleague's message can't change your routines.

Your own Claude Code and OpenCode stay yours. Misha registers its MCP server, a few hooks and its own skills, commands and agent profiles in them, records each addition, removes only what it added, and moves aside what it replaces. It writes none of your global instruction files (`CLAUDE.md`, `AGENTS.md`), and your skills, commands, agents and MCP servers load in your own sessions as before. The clone runs on a configuration of Misha's, so it sees none of them.

## When Slack changes {#slack-changes}

Misha depends on how Slack's web client works today, so a change there can stop capture or posting until the extension is updated; the extension and the app update separately. The extension compares each kind of request Misha makes with your own Slack client's and reports which field names differ, never a value. That finds drift; it doesn't make Slack accept the calls. Misha serves one configured Slack account today, and there is no promised repair time.

## Public code and private code {#public-and-private}

The browser side is public, under Apache-2.0, in [browser-extension](https://github.com/dumdummisha/browser-extension): the wire protocol, the extension, the native host, a Node client for the socket, and the browser and desktop tools with their standalone MCP server. The desktop app, its connectors and the bundled misha-core extension are private, so what this page says about them is the maintainer's description, not auditable code. [Customise and reuse Misha](/reference/extensions) shows what you can build on.
