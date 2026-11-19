---
title: How Misha works
description: "How a Slack message reaches your clone and its reply gets back without a Slack app, and how workers carry out longer jobs."
prev:
  text: Put Misha to work
  link: /use/workflows
next:
  text: Customise and reuse Misha
  link: /reference/extensions
---

# How Misha works

Misha reads Slack through your own signed-in Slack tab and posts back through it, so there is no Slack app to install and the clone acts as your account. On your Mac, the Misha app hands each message meant for you to one long-running Claude Code session, the clone, and longer jobs go to workers, separate Claude Code or OpenCode sessions with their own permissions.

## From a message to a reply {#message-to-reply}

[![How a Slack message reaches your clone and its reply gets back: the Slack tab, extension, native host, Misha app, clone turn and workers on your Mac, with Slack, Anthropic, OpenAI and connected services outside it, in twelve numbered steps that the list below describes.](/diagrams/message-to-reply.svg)](/diagrams/message-to-reply.svg)

Select the diagram to open it full size.

1. Slack's own socket delivers a new message to your signed-in Slack tab, where the Misha Browser extension's observer reads it.
2. The relay in the page passes it to the extension's service worker, which keeps it in a queue until the app acknowledges it.
3. The service worker forwards it to the native host, a small program that connects the browser extension to processes on your Mac.
4. The native host's relay hands it to the Misha app over a local socket.
5. The app decides whether the message is for you, stores it with everything it routes to, and only then acknowledges it, so the extension drops it from its queue.
6. A run hands the waiting messages of one conversation to the clone as a turn.
7. The clone thinks with Claude, through your own Claude Code and plan, so the turn's content goes to Anthropic.
8. It reads what the answer stands on: the thread through your tab, Misha's copies of your repositories, and the services you connected.
9. The app records the clone's post before sending it, then posts it as you through the native host, the extension and your tab.
10. Slack sends the post back like any other message, and the app recognises it as its own.
11. On a turn that may start work, the clone starts a worker.
12. The worker calls Anthropic or OpenAI and your services, and its report comes back to the app as a message for the clone.

[Privacy and security](/privacy) has what each recipient receives and what is stored where.

## Slack without a Slack app {#without-a-slack-app}

The extension runs a small observer in the Slack page before Slack's own scripts, so it reads the same socket frames Slack's web client receives. It makes only allowlisted Slack Web API calls, and downloads and uploads files, with the session your tab already has. The session token stays in the page and goes only to your workspace's address on Slack's domain. Because Misha acts as you, a post looks like one of yours, marked with your icon and set in italics; [Talking with a clone](/understand/slack) explains what colleagues see.

The native host is registered with Chrome or Brave so that only this extension can start it, and its socket sits in a folder only your macOS user can open. Nothing runs on a Misha server: the browser, the native host and the app are all on your Mac, which has to be awake, with the app running and a Slack tab signed in. [Browser permissions](/reference/permissions) accounts for every permission the extension has.

## Nothing acknowledged before it is stored {#commit-before-ack}

The extension keeps each new message in an IndexedDB queue of at most 2,000 events and sends it again until the app acknowledges it. The app acknowledges only after it has stored the event and everything it routes to in one database transaction, and a repeat of an event it already took changes nothing. A message waiting for the clone has no age limit: after a pause it is still there, and the clone reads the thread again before answering, since it may no longer need anything.

The queue is bounded, not lossless. Beyond 2,000 waiting events, new ones are dropped and counted. While writes to the queue fail, up to another 2,000 wait in memory, and a browser restart before a write succeeds loses those without a record. A message Slack never delivered to the tab, because the Mac slept or the tab was closed, was never captured, and there is no general catch-up. [Troubleshooting](/operate/troubleshooting) covers both cases.

## What reaches the clone, and why it never answers itself {#routing-and-loops}

A message from someone else reaches the clone when it is a DM or group DM to you, mentions you, replies in a thread you started or wrote in, or is in a channel you have it watch. Of your own messages, only what you typed in your self-DM, or typed anywhere with your icon in it (outside quotes and code), is a request to it. Someone you ignore never reaches it, someone you soft-ignore only with your icon, and nobody in a thread you said `hands off` in. Edits, deletions and joins never count.

Only a person's typed message counts, never a post by a clone, a bot or an app. Every post Misha sends carries a message id from a namespace of its own, and the app writes a record of the post (the provenance ledger) before it sends. When the post comes back, the app finds the record and never treats it as you typing. Another person's clone uses the same namespace, so its posts never start a reply either, and a message that summons only another person's clone is not this clone's. A colleague who may not ask for work also has an hourly reply budget: past it, the clone reacts instead of replying.

## One shared session {#one-shared-session}

The clone is one Claude Code session for your account, shared by every conversation. It remembers what happened elsewhere, what it promised and what is in flight, which is how it follows work across threads. For each conversation and thread, the app records which session it continues and how far the clone has read there.

That sharing has a cost: conversations are kept apart by the clone's instructions (what someone writes in one conversation stays there), not by separate sessions. At a size you can set, the session is compacted, and **Start fresh** begins a new one for every conversation while keeping the old transcript. [Settings and commands](/reference/settings#notes-history-start-fresh) has the details, and [Privacy and security](/privacy) what that means for your data.

## What a clone turn may do {#clone-turns}

Each turn runs your unmodified Claude Code in restricted, non-interactive mode, in an empty folder of Misha's own. It loads none of your Claude Code settings, instructions or plugins, and its one MCP server is Misha's bridge. Its built-in tools only read (files and searches in Misha's copies of your repositories), plus the skills Misha gives it. Anything not allowed is refused without asking, and the bridge refuses again what the turn may not call. The clone can't edit files, change code or browse the web.

The app sets each turn's tools from who it answers:

- a turn for anyone gets the connected services' read tools;
- your own turn (your self-DM, or a message with your icon in it) also gets their change tools, the repositories' commit history, and the GitHub and AWS command lines, which Claude Code's shell may run and nothing else;
- a turn for you or someone you allow can also start and follow workers.

The clone's ceiling on deploys (dev only, never staging, production or a release) and its rules about other people's code are its instructions, not a lock. [Put Misha to work](/use/workflows#who-may-ask) shows these groups from the requester's side.

## Workers {#workers}

A worker is a separate, non-interactive session that runs as one of five profiles: orchestrator, researcher, implementer, reviewer, or one with no tools. Each works in its own git worktree, with your sign-ins. A Claude worker runs your own Claude Code with your settings and permission rules, Misha's bridge as its one MCP server, and the profile's tool list. A GPT worker runs OpenCode with a configuration Misha writes for that run, which starts from nothing and adds the profile's tools, and your OpenAI sign-in.

Profiles describe the researcher and reviewer as read-only, but those profiles still have the shell and file editing: read-only is their instructions, not an operating-system sandbox. At most two workers run at once. Pausing Misha refuses every new worker at once and tries to stop the running ones, reporting any it couldn't ([Control and maintain Misha](/operate/manage)). A worker that shares a file in Slack posts through Misha's bridge, which records it in the ledger like the clone's posts.

## When Slack changes {#slack-changes}

Misha depends on how Slack's web client works today: its socket frames, how the session and requests look, and the API methods on the allowlist. A change there can stop capture or posting until the extension is updated. The extension and the app update separately. Misha serves one configured Slack account today, and there is no promised repair time for a Slack change.

## Public code and private code {#public-and-private}

The browser side is public, under Apache-2.0, in [misha-browser](https://github.com/dumdummisha/misha-browser): the wire protocol between extension, native host and app; the extension's observer, relay and service worker; the native host and its relay; a Node client for the socket; and the browser and desktop tools with their standalone MCP server. The desktop app and the bundled misha-core extension are private, so what this page says about them is the maintainer's description, not code you can audit. [Customise and reuse Misha](/reference/extensions) shows what you can build on.
