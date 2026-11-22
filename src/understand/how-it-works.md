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

Misha reads and posts through your signed-in Slack tab, acting as your account without a Slack app. On your Mac, one shared Claude Code or OpenCode session answers; separate workers handle longer jobs.

## From a message to a reply {#message-to-reply}

[![Message, acknowledgement, reply and worker paths across the Mac boundary; numbered steps follow.](/diagrams/message-to-reply.svg)](/diagrams/message-to-reply.svg)

Select the diagram to open it full size. The dashed Workers box marks optional delegated work; the large dashed boundary encloses your Mac.

1. Slack's socket delivers a message to the signed-in tab's Misha Browser observer.
2. The page relay forwards it to the extension service worker's queue.
3. The service worker forwards it to the native host, which connects the extension to local processes.
4. The host relays it to the app over a local socket.
5. The app routes and stores it, then acknowledges it back to the service worker.
6. Waiting messages enter the shared clone session as a turn.
7. The turn goes to your selected model's provider through your sign-in.
8. The clone reads Slack through its bridge and your tab, linked folders, and services its turn permits.
9. The app records the reply before posting through the native host, extension and tab.
10. Slack echoes the post; the app recognises its own.
11. An authorised turn can start a worker.
12. The worker calls its provider and services, then reports to the app for the clone.

[Privacy and security](/privacy) has what each recipient receives and what is stored where.

## Slack without a Slack app {#without-a-slack-app}

The observer loads before Slack's scripts and reads its socket frames. Only the page function uses the session token: Web API calls send it to your workspace's Slack address, refuse redirects and never return it. Downloads go to `files.slack.com` with the browser's cookies and no token, redirects refused. An upload's bytes go to the URL Slack's answer names, without the token and with redirects refused; the extension checks only that the URL parses, not its host, and never passes it to the app.

The exception is the network observer: Chrome shows the service worker every request a tab sends, so the token and session cookie reach it for a moment. It redacts both before recording the request, and neither is stored or sent to the native host. Because Misha acts as you, clone replies carry the marker you chose and are set in italics ([Talking with a clone](/understand/slack)).

Nothing runs on a Misha server. Chrome or Brave starts the native host, registered for this extension only, and its socket sits in a folder only your macOS user can open. The browser, host and app are all on your Mac, which has to be awake, with a Slack tab signed in. [Browser permissions](/reference/permissions) accounts for each permission and [where Slack's credentials go](/reference/permissions#where-slack-credentials-go).

## Nothing acknowledged before it is stored {#commit-before-ack}

The extension resends a message until the app acknowledges it, which happens only after the app has stored the event and what it routes to in one database transaction. A message waiting for the clone has no age limit, and the clone rereads the thread before answering. A repeat changes nothing while the app still holds its receipt, kept for:

<!-- facts retention event-receipts -->

That suppresses duplicates for a window; it isn't a promise to process each event exactly once. The extension's queue is durable IndexedDB storage that survives a browser restart, but it is bounded, not lossless: when it is full new events are dropped and counted. While writes to it fail, unacknowledged events wait in memory, and a restart then loses them without a record ([browser storage](/privacy#browser-storage) lists both limits). A message Slack never delivered to the tab, because the Mac slept or the tab was closed, was never captured, and there is no general catch-up. [Troubleshooting](/operate/troubleshooting) covers both.

Sending has its own rule. The app records a post in the provenance ledger before sending it. When Slack's answer proves the post arrived or was refused, the record says so. When it doesn't, the record is uncertain: the app never resends it by itself, and the post's echo can confirm it later. [Troubleshooting](/operate/troubleshooting#send-not-confirmed) covers checking the conversation before you send again.

## What reaches the clone, and why it never answers itself {#routing-and-loops}

A message from someone else reaches the clone when it is a DM or group DM to you, mentions you, replies in a thread you started or wrote in, or is in a channel you have it watch, unless you ignore that person (soft-ignored people reach it only with the clone's emoji). Of your own messages, only what you typed counts: in your self-DM (your direct message to yourself in Slack), or anywhere with the clone's emoji standing alone outside quotes and code. Thread exclusion (<code><Fact name="desktop.commands.commands.hands-off.syntax" /></code>) keeps other people's messages in a thread from the clone, and your own eligible messages still reach it.

Other people's typed messages count, and so does an unmarked Web API post made with a person's own token. A bot's or app's post, an edit, a deletion, a join, and a message that summons only another person's clone never count. Every post Misha sends carries a message id from a namespace of its own and a ledger record made before it goes out, so when it comes back the app never treats it as you typing. Other people's Misha clones share that namespace, so their posts never start a reply.

## What Misha is made of {#made-of}

Always on: Slack, Claude Code (the clone starts on it, and workers use it by default), GitHub (its CLI, and the commit history of your linked folders) and the workers. Connectors are opt-in, one switch each ([what Set up checks](/reference/settings#detection)). Out of the box the connectors on are: <Fact name="desktop.settings.fields.connectors.default" /> A switch that is on loads the connector wherever it works: in the clone's turns, in workers, and in Misha's MCP server inside your own Claude Code and OpenCode. Off loads it nowhere, and a host with an old tool list refuses the call. Browser control is the exception: it serves your own Claude Code and OpenCode, and gives the clone and its workers nothing. A new connector needs no change to the core ([Customise and reuse Misha](/reference/extensions)).

## What the clone runs on {#clone-runtime}

The clone is one session for your account, shared by every conversation, so it remembers what is in flight elsewhere. The cost: conversations are kept apart by the clone's instructions, not by separate sessions, and what it read earlier stays in that session's memory. [Settings and commands](/reference/settings#notes-history-start-fresh) covers compaction and **Start fresh**.

You choose the runtime, model and effort on Settings ([Settings and commands](/reference/settings#fields)). On Claude Code, a turn is one headless run of your own Claude Code on your own plan, loading none of your settings, instructions or plugins. On OpenCode, each call starts a private server on a configuration Misha writes, not yours. Switching runtime starts a new session and keeps your settings, notes and routines.

## What a clone turn may do {#clone-turns}

The app limits each turn's tools, and its bridge, the one MCP server, enforces the same list. Built-ins read and search only the turn's work folder and your linked folders, with no file editor or web browser. The tools depend on who the turn answers:

- a turn for anyone gets the read tools of Slack and of the connectors you switched on, except AWS, whose tools are owner-turn-only;
- your own turn (your self-DM, or a message with the clone's emoji in it) also gets their change tools, the commit history of your linked folders, and the command lines, the only programs the shell may start: the GitHub CLI, and the AWS CLI while AWS is on;
- a turn for you or someone you allow can also start and follow workers.

Authority comes from who sent a message, as the app identified them, never from what it says. The shell rules choose which program starts, not what it does: the command lines act with everything your GitHub and AWS accounts may do, and can start other programs (a GitHub CLI alias that runs a shell command, an AWS profile's credential process), which is why only your own turns get them. The ceiling on deploys (dev only, never staging, production or a release) and the rules about other people's code are the clone's instructions, not an operating-system sandbox: what your accounts permit is the hard limit. The clone redacts secret-shaped strings from what it posts. [Put Misha to work](/use/workflows) shows them from the requester's side.

## Linked folders {#linked-folders}

A linked folder is one you already have, with the remote its pull requests go to and whether workers may merge there. The clone reads it as it is, uncommitted work and `.env` files included, the way Claude Code would in a session you run there, and never writes in it. What it reads can reach whoever it answers; its instructions tell it to leave out what you wouldn't share.

Unlinking removes the folder from later runs and leaves its files alone. It doesn't stop a run already under way or erase what the session read, so [pause Misha](/operate/manage#pause) first when access has to stop now. Clone-dispatched code workers work in separate git worktrees; they may read and copy needed files from your linked folder. Other work gets a scratch folder.

## Workers {#workers}

A worker runs with your sign-ins, as a profile that sets its tools, on Claude or, when the request or your routines say so, a GPT model through OpenCode. A Claude worker keeps your Claude Code settings and skills but runs as the profile Misha selects, with Misha's bridge as its only MCP server. A GPT worker runs OpenCode on a configuration Misha writes for that run.

The researcher and reviewer profiles are read-only by instruction, not by sandbox: they still have the shell and file editing, and a worker reaches any path its profile allows. Nothing in the app orders a review or a merge, and where merging is allowed is an instruction to the clone and its workers, so what your GitHub account may do is the limit. Pausing Misha stops the clone's workers, and names any run it can't confirm stopped.

## Routines, and the setup that stays yours {#your-setup}

Routines are your standing instructions for work, in your words. A routine grants nothing: who may ask for work, what the clone may change or run and where workers may merge stay in settings. Your request comes first, then your routines, then the clone's defaults, and a colleague's message can't change your routines. The clone runs on a configuration of Misha's, so it sees none of your skills or settings.

In your own sessions, Misha installs its bridge and recorded additions, preserves replaced material, removes only its additions and leaves your global instruction files and personal setup intact.

## When Slack changes {#slack-changes}

Misha depends on how Slack's web client works today, so a change there can stop capture or posting until the extension is updated; the extension and the app update separately. The extension compares each kind of request Misha makes with your own Slack client's and reports which field names differ, never a value. That finds drift; it doesn't make Slack accept the calls. Misha serves one configured Slack account today, and there is no promised repair time.

## Public code and private code {#public-and-private}

The browser side is public, under Apache-2.0, in [browser-extension](https://github.com/dumdummisha/browser-extension): the wire protocol, the extension, the native host, a Node client for the socket, and the browser and desktop tools with their standalone MCP server. The desktop app, its connectors and the bundled misha-core extension are private, so what this page says about them is the maintainer's description, not auditable code. [Customise and reuse Misha](/reference/extensions) shows what you can build on.
