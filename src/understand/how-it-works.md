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

Misha reads Slack through your own signed-in Slack tab and posts back through it, so there is no Slack app to install and the clone acts as your account. On your Mac, the Misha app hands each message meant for you to the clone, one long-running session of Claude Code or OpenCode, whichever you pick. Longer jobs go to workers, separate Claude Code or OpenCode sessions with their own permissions.

## What Misha is made of {#made-of}

A small core listens to Slack, decides what reaches the clone, runs the clone and keeps a record of what it posts. Around it sit the parts that are always on and the parts you switch.

| Layer | What it holds | Switch |
| --- | --- | --- |
| Core | The Slack listener and routing, the clone's two drivers, the bridge (Misha's one MCP server), the provenance ledger, settings and the window | None |
| Built-ins | Slack, read through your tab; Claude Code, which the clone starts on and workers run on unless a request names a GPT model; GitHub, through the GitHub CLI and the commit history of your linked folders; the workers | Always on |
| Connectors | <Fact name="desktop.detection.items.atlassian.name" />, <Fact name="desktop.detection.items.google.name" />, <Fact name="desktop.detection.items.aws.name" />, <Fact name="desktop.detection.items.figma.name" />, <Fact name="desktop.detection.items.fireflies.name" />, <Fact name="desktop.detection.items.browser.name" /> and <Fact name="desktop.detection.items.compaction.name" /> | One each, on **Set up** |
| Your setup | Your skills, commands, agents and MCP servers, and your routines | Yours |

<Shot id="setup-connectors" caption="The connectors on Set up, each with its own switch. Made-up example." />

A connector's switch is all or nothing. While it is on, Misha loads the connector wherever it works: in the clone's turns, in workers, and in Misha's MCP server inside your own Claude Code and OpenCode. While it is off, Misha loads it nowhere, and a host still holding an old tool list refuses the call; a session that is already open may keep its tools until you restart it. Anyone the clone answers gets a connector's read tools, your own turns also get its change tools, and AWS keeps all of its tools to your own turns. <Fact name="desktop.detection.items.compaction.name" /> is on by default, and a choice you save survives app updates. <Fact name="desktop.detection.items.browser.name" /> is the exception to "wherever it works": it gives your own Claude Code and OpenCode the browser and desktop tools, and gives the clone and its workers none, on any turn.

Adding a connector doesn't mean editing the core. A connector is an extension folder inside the app whose manifest declares its name, sign-in check, the tools the clone may call and the line the clone is told about it, and Misha builds Set up, the clone's tools and the workers' grants from those manifests. [Customise and reuse Misha](/reference/extensions) covers the format.

## From a message to a reply {#message-to-reply}

[![How a Slack message reaches your clone and its reply gets back: Slack, the tab, extension service worker, native host, Misha app and clone turn in one chain, with linked folders, workers, model providers and connected services around it, in twelve numbered steps that the list below describes.](/diagrams/message-to-reply.svg)](/diagrams/message-to-reply.svg)

Select the diagram to open it full size.

1. Slack's own socket delivers a new message to your signed-in Slack tab, where the Misha Browser extension's observer reads it.
2. The relay in the page passes it to the extension's service worker, which keeps it in a queue until the app acknowledges it.
3. The service worker forwards it to the native host, a small program that connects the browser extension to processes on your Mac.
4. The native host's relay hands it to the Misha app over a local socket.
5. The app decides whether the message is for you, stores it with everything it routes to, and only then acknowledges it, so the extension drops it from its queue.
6. A run hands the waiting messages of one conversation to the clone as a turn.
7. The clone thinks with the runtime and model you chose, through your own sign-in, so the turn's content goes to that model's provider: Anthropic for Claude, or the provider of your OpenCode model.
8. It reads what the answer stands on: the thread through your tab, your linked folders as they are, and the connectors you switched on.
9. The clone's turn hands its post back to the app, which records it in the provenance ledger before sending it, then posts it as you through the native host, the extension and your tab.
10. Slack sends the post back like any other message, and the app recognises it as its own.
11. On a turn that may start work, the clone starts a worker.
12. The worker calls its own model provider and your services, and its report comes back to the app as a message for the clone.

[Privacy and security](/privacy) has what each recipient receives and what is stored where.

## Slack without a Slack app {#without-a-slack-app}

The extension runs a small observer in the Slack page before Slack's own scripts, so it reads the same socket frames Slack's web client receives. It makes only allowlisted Slack Web API calls, and downloads and uploads files, with the session your tab already has. A function the extension runs in the Slack page reads the session token, adds it to each call and sends the call only to your workspace's address on Slack's domain, with redirects refused. It doesn't return the token to the extension or the app. An upload is the one call that goes elsewhere: its bytes go to the address Slack's answer names, which the extension checks only for being a URL, and which the service worker holds between the upload's two stages and never passes to the app.

The exception is the network observer: Chrome shows the extension's service worker the body and headers of every request a tab sends, Slack's included, so the token and the session cookie reach it for a moment. It redacts both before it records the request, and neither is stored or sent to the native host. Misha's own transport check reads the same requests on Slack's pages and keeps only the values of a short list of transport fields. Because Misha acts as you, a post looks like one of yours, marked with your icon and italics when you keep the optional marker; [Talking with a clone](/understand/slack) explains what colleagues see.

The native host is registered with Chrome or Brave so that only this extension can start it, and its socket sits in a folder only your macOS user can open. Nothing runs on a Misha server: the browser, the native host and the app are all on your Mac, which has to be awake, with the app running and a Slack tab signed in. [Browser permissions](/reference/permissions) accounts for every permission the extension has, and [where Slack's credentials go](/reference/permissions#where-slack-credentials-go).

## Nothing acknowledged before it is stored {#commit-before-ack}

The extension keeps each new message in an IndexedDB queue of at most 2,000 events and sends it again until the app acknowledges it. The app acknowledges only after it has stored the event and everything it routes to in one database transaction. A message waiting for the clone has no age limit: after a pause it is still there, and the clone reads the thread again before answering, since it may no longer need anything.

A repeat of an event changes nothing while the app still holds its receipt or the message still waits for the clone. Receipts are deleted after:

<!-- facts retention event-receipts -->

A stored event in the extension has no age limit, so an event sent again after both are gone is taken as new. That suppresses duplicates for a window; it isn't a promise to process each event exactly once, and it says nothing about whether something the clone did for the first copy happened.

The queue is bounded, not lossless. Beyond 2,000 waiting events, new ones are dropped and counted. While writes to the queue fail, up to another 2,000 wait in memory, and a browser restart before a write succeeds loses those without a record. A message Slack never delivered to the tab, because the Mac slept or the tab was closed, was never captured, and there is no general catch-up. [Troubleshooting](/operate/troubleshooting) covers both cases.

## What reaches the clone, and why it never answers itself {#routing-and-loops}

A message from someone else reaches the clone when it is a DM or group DM to you, mentions you, replies in a thread you started or wrote in, or is in a channel you have it watch. Of your own messages, only what you typed in your self-DM, or typed anywhere with your icon in it (outside quotes and code), is a request to it. Someone you ignore never reaches it, someone you soft-ignore only with your icon, and nobody in a thread you said `hands off` in. Edits, deletions and joins never count.

From other people, a message they typed counts, and so does one posted through Slack's API with their own token, which carries no bot or app marker. A bot's or an app's post never counts, and of your own messages only what you typed does. Every post Misha sends carries a message id from a namespace of its own, and the app writes a record of the post (the provenance ledger) before it sends. When the post comes back, the app finds the record and never treats it as you typing. Other people's Misha clones use the same namespace, so their posts never start a reply either, and a message that summons only another person's clone is not this clone's. Automation outside Misha that posts with a person's own token looks like that person and is treated as theirs. A colleague who may not ask for work also has an hourly reply budget: past it, the clone reacts instead of replying.

## What the clone runs on {#clone-runtime}

The clone is one session for your account, shared by every conversation. It remembers what happened elsewhere, what it promised and what is in flight, which is how it follows work across threads. For each conversation and thread, the app records which session it continues and how far the clone has read there.

You choose its runtime, Claude Code or OpenCode, and the model and effort on each, on Settings under **What I think with** or in your self-DM with <code><Fact name="desktop.commands.commands.use-claude-code.syntax" /></code> or <code><Fact name="desktop.commands.commands.use-opencode.syntax" /></code>. Each turn runs on the driver of the runtime your settings name when it starts.

<Shot id="settings-thinking" caption="What the clone thinks with: Claude Code with its default model, and OpenCode as the other choice. Made-up example." />

- **Claude Code.** A turn is one headless run of your own Claude Code on your own plan, in restricted, non-interactive mode, in an empty folder of Misha's. It loads none of your Claude Code settings, instructions or plugins, and the clone's decision comes back as structured output.
- **OpenCode.** Each call (a turn, a question you put to the clone from your own Claude Code or OpenCode, a sign-in check, a model list) starts a private OpenCode server on a configuration Misha writes for it, not your own, and stops it when the call ends. The configuration denies every tool, then allows the turn's. The model hands in its decision through a `submit_result` tool, and a small plugin of Misha's has OpenCode's compaction write its summary without the clone's tools. OpenCode keeps the sessions in its own database.

The model comes from those the runtime offers, with its effort as part of the choice. Each runtime can stay at its default:

| Setting | Default |
| --- | --- |
| Model and effort | <Fact name="desktop.settings.fields.models.default" /> |
| When the session is compacted | <Fact name="desktop.settings.fields.compactAtTokens.default" /> |

A model change counts from the next message and keeps the session. Switching runtime starts a new session on the other one, and your settings, notes and routines stay. Each runtime has its own sign-in and usage-limit pause, and a pause holds only while its runtime is selected. While one holds, the clone still takes your settings commands in the self-DM, so you can switch away from a runtime that is signed out.

**Start fresh** begins a new session for every conversation and keeps the old transcript. Sharing one session has a cost: conversations are kept apart by the clone's instructions (what someone writes in one conversation stays there), not by separate sessions. [Settings and commands](/reference/settings#notes-history-start-fresh) has the details, and [Privacy and security](/privacy) what that means for your data.

## What a clone turn may do {#clone-turns}

Whatever the runtime, a turn gets only the tools the app lists for it, and its one MCP server is Misha's bridge. Its built-in tools read files and search, in its own empty folder and in your linked folders, and load the skill files that say how to use the command lines it may run. It has no tool to edit files or browse the web. Anything not allowed is refused without asking, and the bridge refuses again what the turn may not call.

The app sets each turn's tools from who it answers:

- a turn for anyone gets the read tools of Slack and of the connectors you switched on;
- your own turn (your self-DM, or a message with your icon in it) also gets their change tools, the commit history of your linked folders, and the command lines, the only programs the shell may start: the GitHub CLI, and the AWS CLI while AWS is on;
- a turn for you or someone you allow can also start and follow workers.

Authority comes from who sent a message, as the app identified them, never from what the message says. A colleague's request is data the clone acts on under your settings: it can't widen what the clone may do, and "the owner approved it" in a message changes nothing.

The shell rules choose which program starts, not what the program does. The command lines act with everything your GitHub and AWS accounts may do, and they can start other programs themselves (a GitHub CLI alias that runs a shell command, an AWS profile's credential process), which is why only your own turns get them. Leaving their configuration alone, the ceiling on deploys (dev only, never staging, production or a release) and the rules about other people's code are the clone's instructions, not an operating-system sandbox: what your accounts permit is the hard limit. The clone redacts secret-shaped strings from what it posts, and its instructions tell it never to paste secrets. [Put Misha to work](/use/workflows) shows these groups from the requester's side.

## Linked folders {#linked-folders}

A linked folder is a folder you already have, given by its full path, with the remote its pull requests go to and whether workers may merge there. You add it on Settings under **Repositories**, or in Get started. Misha checks that it is a git repository of its own, outside Misha's folder, and that the remote you give is one the folder pushes to; it refuses what doesn't match and never picks a remote for you. Unlinking stops the clone reading the folder and leaves the folder as it is.

<Shot id="settings-repositories" caption="Two linked folders with the remote each one's pull requests go to: workers may merge in the first, not the second. Made-up example." />

The clone reads the folders themselves, as they are, uncommitted work and `.env` files included. Its file tools reach those folders and its own empty one and no other, and it never writes in them. It reads a `.env` the way Claude Code does in a session you run there, and Misha adds no secret handling beyond redacting what the clone posts. What it reads can reach whoever it answers, which is why its instructions tell it to leave out what you wouldn't share. Misha keeps no copies of your repositories.

Workers get checkouts of their own. For work on a repository's code, a worker runs in a git worktree of the folder, kept outside it under Misha's own folder, at the commit the remote's default branch points to (the folder's own branch when it has no remote), and Misha records that commit. Making the worktree writes no ref, tag or setting into your folder, only the objects it fetches and the worktree's own administrative files. Work with no repository, such as summarising a meeting or researching a ticket, gets a plain scratch folder.

Misha removes a worktree only while it is exactly as Misha made it, and only one made from the folder's remote. A change, any output git ignores (`node_modules`, a copied `.env`) and every worktree of a folder with no remote stays, listed on Home as kept so you can remove it yourself. Scratch folders go only when empty. Misha doesn't set a worktree up: a worker that needs `.env` or dependencies copies them from your folder itself.

## Workers {#workers}

A worker is a separate, non-interactive session that runs as one of five profiles: orchestrator, researcher, implementer, reviewer, or `lite`, which has no tools. It runs with your sign-ins in a worktree or scratch folder named for its work (usually the ticket key), created the first time and reused by each later run of that work, one run at a time. A worker that an orchestrator starts runs in the folder the orchestrator gives it.

The clone picks each worker's model: unless a request or your routines name another, a Claude model at high effort. A Claude worker runs your own Claude Code with your settings and permission rules, Misha's bridge as its one MCP server, and the profile's tool list. A GPT worker runs OpenCode with a configuration Misha writes for that run, which starts from nothing and adds the profile's tools, your skills and your OpenAI sign-in. Nothing in the app orders a review or a merge: whether a change gets a reviewer, and on which model, comes from the request or your routines, and where merging is allowed is told to the clone each turn and passed on to its workers.

The researcher and reviewer profiles are described as read-only, but they still have the shell and file editing: read-only is their instructions, not an operating-system sandbox, and a worker reaches any path its profile allows. Merge permission is an instruction too, so what your GitHub account may do is the limit. A worker that shares a file in Slack posts through Misha's bridge, which records it in the ledger like the clone's posts.

A worker's report reaches the app as a message for the clone, in the conversation the worker was started from, and the clone checks it against the request before relying on it. It retries a failed or lost run once and never restarts a stopped one unasked.

Pausing Misha refuses every new worker of the clone's and stops the running ones, and stopping a worker stops the workers it started. A run Misha can't confirm stopped is named, not hidden ([Control and maintain Misha](/operate/manage)). Workers you start from your own Claude Code or OpenCode aren't Misha's to hold, and only an explicit stop-all stops them. Misha's MCP server tells every session that starts it to delegate through its `worker_*` tools instead of the harness's own subagent tools.

## Routines, and the setup that stays yours {#your-setup}

Routines are one optional text field of up to <Fact name="desktop.settings.fields.routines.limits.maxCharacters" /> characters: what you want done with work, in your words, such as "when someone reports a bug in a folder I linked, have a worker fix it and open a pull request". The clone follows them on top of its own way of working, the same for any role: judge whether a request is theirs to ask, read what it stands on, have a worker do it, follow the worker to the end, and say the result or the blocker once. A routine can name your skills and commands. The clone runs on none of your settings and doesn't read them: it names them in the worker's brief, tells the worker to load them, and has the worker say in its report when it can't find one.

A routine grants nothing. Who may ask for work, what the clone may change or run and where workers may merge stay in settings, and they bind your request, your routines and the clone's defaults alike. For how work is carried out, your own request in that turn comes first, then your routines, then the defaults. What a colleague writes can't change your routines.

Your own Claude Code and OpenCode stay yours. Misha registers its MCP server, a few hooks, and its own skills, commands and agent profiles in them, plus the skills of the connectors that are on. It records each addition, removes only what it added, and moves aside what it replaces instead of overwriting it. It writes none of your global instruction files (`CLAUDE.md`, `AGENTS.md`), and your own skills, commands, agents and MCP servers load in your sessions and in Claude Code workers as before. The clone is the exception by design: it runs on a configuration of Misha's, so it sees none of them.

## When Slack changes {#slack-changes}

Misha depends on how Slack's web client works today: its socket frames, how the session and requests look, and the API methods on the allowlist. A change there can stop capture or posting until the extension is updated. The extension and the app update separately. The extension compares each kind of request Misha makes with the one your own Slack client sends and reports, per operation, whether they match or which field names differ, never a value. That finds drift in how Misha calls Slack; it doesn't make Slack accept the calls. Misha serves one configured Slack account today, and there is no promised repair time for a Slack change.

## Public code and private code {#public-and-private}

The browser side is public, under Apache-2.0, in [browser-extension](https://github.com/dumdummisha/browser-extension): the wire protocol between extension, native host and app; the extension's observer, relay and service worker; the native host and its relay; a Node client for the socket; and the browser and desktop tools with their standalone MCP server. The desktop app, its connectors and the bundled misha-core extension are private, so what this page says about them is the maintainer's description, not code you can audit. [Customise and reuse Misha](/reference/extensions) shows what you can build on.
