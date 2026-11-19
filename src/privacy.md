---
title: Privacy and security
description: "The Dumdum Misha privacy policy and security summary: what data goes where, who receives it, which credentials Misha touches, how long it keeps data and what it may do on your Mac."
prev: false
next: false
outline: [2, 3]
---

# Privacy and security

**Effective 19 November 2026.** Misha has no server of its own. It runs on your Mac and works through your own accounts: your Claude Code sends what the clone reads and writes to Anthropic, OpenCode sends GPT reviews to OpenAI if you use it, and Slack and the services you connect receive what Misha sends them. Misha keeps its own records on your Mac, some of them with no age limit.

This page covers the Misha app for macOS, the Misha Browser extension and its native host, the Claude Code and OpenCode sessions Misha starts, this documentation site and the landing page at [dumdummisha.ai](https://dumdummisha.ai). It is the privacy policy for all of them, including the extension's Chrome Web Store listing.

## Security assessment {#assessment}

Each row links to the section that holds its evidence.

| Question | Answer |
| --- | --- |
| [What leaves the Mac](#data-flows) | Slack messages, files, tool results and the clone's conversation go to Anthropic through your Claude Code. GPT reviews go to OpenAI through OpenCode if you use it. Replies go to Slack; queries and changes go to the services you connect. Nothing goes to a Misha server: there is none. |
| [Accounts and terms](#recipients) | Every recipient works under your own account and its terms. These docs do not establish any provider's retention or your organisation's terms. |
| [Slack identity](#slack-identity) | Misha acts as you through your signed-in Slack web session, not as a Slack app. What a workspace administrator sees, and whether this fits Slack's terms for your workspace, is not established here. |
| [Credentials](#credentials) | The Slack token is used only inside your Slack tab. Claude Code keeps its own sign-in. Integration tokens sit in their own stores, and Misha's modules read them to call those services. |
| [Browser access](/reference/permissions) | Access to all sites, observation of the requests every tab sends, and native messaging. What it observes stays in browser memory; new Slack messages wait in a bounded queue on disk. [Browser storage](#browser-storage) lists both. |
| [Machine authority](#authority) | The clone is restricted Claude Code with read-only tools for other people. Workers run your own Claude Code or OpenCode with a shell, limited by their instructions, your permission rules and your accounts, not by an operating system sandbox. |
| [Updates](#updates-and-audit) | One owner-operated unsigned local build. No public download, updater, pinning or rollback. |
| [Audit](#updates-and-audit) | A ledger of every Slack post, edit, upload and reaction, never deleted. No record of every shell or cloud command. |
| [Stopping](#authority) | Pause starts nothing new and tries to stop workers; a worker it could not stop is named for you to stop by hand. It does not undo anything already done. |
| [Removal](#deletion) | Deleting `~/.misha` removes Misha's own files only. Claude Code and OpenCode transcripts, browser storage, Slack posts and connected services' records stay. |
| [Residual risks](#residual-risks) | Confident wrong replies posted as you, instructions hidden in content, one clone session across conversations, broad browser observation, workers acting as your Mac user. |

## Privacy policy {#privacy-policy}

### Where data goes {#data-flows}

[![Diagram: inside your Mac, the Slack tab, the Misha Browser extension, the native host, the Misha app, the clone and workers; outside it Slack, Anthropic, optional OpenAI, the services you connect and the sites your tabs have open. Numbered arrows match the list below.](/diagrams/where-data-goes.svg)](/diagrams/where-data-goes.svg)

Select the diagram to open it full size.

1. In your signed-in Slack tab, the extension reads each new message from Slack's own connection, cut down to [fixed fields](/reference/permissions#slack-transport-limits).
2. The extension passes it through the native host, a small program that connects the extension to Misha on the same Mac, to the Misha app, which saves it in `~/.misha/misha.db`. Replies and Slack requests travel back the same way. The host stores nothing.
3. The app gives the message and the conversation it belongs to, your settings and notes to the clone: Claude Code started in its restricted mode.
4. Claude Code sends that conversation, any file or image the clone reads and every tool result to Anthropic, under your Claude subscription.
5. The clone and the workers read from the services you connected and, where you or your settings allow, change things there.
6. When you, or someone you allowed, asks for work, the app starts workers: separate Claude Code or OpenCode sessions that do one task.
7. Workers send their task, the code and their tool results to Anthropic, or to OpenAI for a GPT review.
8. The extension posts the clone's and workers' messages and makes its allowlisted Slack calls from inside your Slack tab, as you.
9. Optional and separate from the clone: if you register the misha-browser tools with your own Claude Code or OpenCode, or an extension grants them to a worker, they read and drive your other tabs through the same host and extension. The extension observes the requests every tab sends whether or not a tool is in use.
10. Those sessions send what the tools return to their own model provider.

Three configurations reach different data, and no single Slack message uses all of it: a baseline clone turn uses the tools and services above, a worker given an extension's extra tools reaches whatever those tools reach, and the standalone browser and desktop tools reach your tabs, screen and keyboard for the agent you register them with. Personalising the clone, adding extensions or using the browser tools adds no confidentiality guarantee. [Customise and reuse Misha](/reference/extensions) explains where additions run.

### Who receives it {#recipients}

| Recipient | What it receives | Under |
| --- | --- | --- |
| Anthropic | Messages the clone considers, their conversation, your personality and notes, files and images it reads, tool results, workers' tasks and code | Your Claude subscription in Claude Code, and Anthropic's terms for it |
| OpenAI, if you use it | What a GPT worker reviews: tickets, diffs and code | Your OpenAI sign-in in OpenCode |
| Slack | Posts, edits, uploads and reactions, and the Web API reads the clone makes | Your Slack account, through your web session |
| GitHub | Clones, branches, pull requests and merges where you allowed them | Your GitHub CLI sign-in |
| Atlassian, Google, Figma, Fireflies, AWS | Queries, and the tickets, pages, Docs and Sheets workers or your own turns create or change; Figma and Fireflies are read only | Your sign-in to each, where you connected it |
| The publisher of Dumdum Misha | Nothing from the app or the extension. Only an email you send to ask for an invite | See [the websites](#websites) |

For the browser extension, its disclosures state:

<!--@generated: browser-recipients-->

Each recipient's own retention, training and administrator-access rules apply to what it receives. These docs have not checked them.

### Slack identity {#slack-identity}

Misha has no Slack app, bot user or token of its own. It posts from your account through the Slack tab you are signed in to, so in Slack its posts are yours. Each clone reply starts with your chosen emoji and is set in italics; that marker is a label, not authentication, and anyone can type the same emoji. These docs do not establish whether Slack's terms or your organisation allow a personal agent to post this way: that is for you and your organisation to decide.

### Credentials {#credentials}

| Credential | Where it stays | What Misha's code does with it |
| --- | --- | --- |
| Slack session token and cookie | Slack's saved client state in your tab, and the browser's cookie store | The extension's function inside the Slack page reads the token for each call the app asks for and sends it only to your workspace's address on Slack's domain. It never returns the token. The network observer sees request credentials briefly and redacts the ones it recognises. |
| Claude sign-in | Claude Code | The app runs `claude auth status` to see whether you are signed in, and `claude auth login` when you sign in from the window. It does not read the token. |
| OpenAI sign-in | OpenCode | Used by OpenCode when a GPT worker runs. |
| Figma and Fireflies keys | OpenCode's credential store, where you paste them | Misha's Figma and Fireflies tools read the key there to call that service. |
| Atlassian and Google sign-ins | Token files in your user state folder, written when you sign in from Misha | Misha's tools for those services read and refresh them to make their calls. |
| GitHub and AWS | The GitHub CLI's and AWS CLI's own stores | Misha runs the CLIs; it does not read their stores. |

Messages, files, pages and tool results can contain secrets themselves, and nothing on this page detects every secret. The checks that exist match known shapes: a clone reply has text shaped like a known token redacted, a worker's Slack message holding one is refused, and the Jira, Confluence and Google Workspace tools refuse to send text holding a stored credential or a known token shape. The extension's own credential handling is set out under [Where Slack's credentials go](/reference/permissions#where-slack-credentials-go).

### What is stored, and for how long {#storage}

Misha's own files on your Mac:

<!--@generated: desktop-paths-->

#### Retention {#retention}

<!--@generated: desktop-retention-->

Starting fresh is not erasure: the clone's next message starts a new Claude session, and the old transcript stays in Claude Code, as do your settings and notes. A message waiting for the clone is still there after a pause and can be answered after you resume.

#### In the browser {#browser-storage}

The extension writes only its queue of new Slack messages to disk; everything else it keeps stays in memory:

<!--@generated: browser-holdings-->

#### Outside Misha's folders {#other-records}

Claude Code keeps the clone's and Claude workers' session transcripts with your other Claude Code sessions, and OpenCode keeps GPT workers' sessions with yours. Installing an extension writes skills, commands, agent profiles and tool registrations into your Claude Code and OpenCode configuration. Slack, the model providers and each connected service keep their own records under their own rules.

### Deleting your data {#deletion}

Quitting Misha and deleting `~/.misha` removes the files in the paths table above, including the ledger, and the native host launcher the browser repository installs in `~/.misha/browser-bridge`. It does not remove Claude Code or OpenCode transcripts, the files extensions installed into your harnesses, the extension's storage in your browser profile, the host's registration with your browsers, your sign-ins to connected services, what Misha already posted or uploaded to Slack, or anything a provider or service keeps. Removing Misha in the documented order, so workers stop and saved copies survive first, is on [Control and maintain Misha](/operate/manage). There is no Misha account to close.

### What Misha may do {#authority}

| Who acts | What it can do | What limits it |
| --- | --- | --- |
| The clone, answering anyone but you | Read connected services and its own read-only copies of your repositories. No shell and nothing that reaches the web. | Code: Claude Code's restricted mode, a per-turn list of callable read tools, and Misha's bridge refusing anything else |
| The clone, on your own turn | Also the services' write tools and the command-line tools your permission rules allow | Code: the same per-turn list; your own permission rules |
| The clone, asked for work by you or someone you allowed | Start workers | Code: the requester must be you or on your allowed list |
| Workers | Your own Claude Code or OpenCode with a profile's tools: a shell, file edits, git, the GitHub CLI and cloud CLIs, as far as your accounts allow | Instructions, your harness permission rules and your accounts. No operating system sandbox. |
| Merging | Workers merge a reviewed pull request only in a repository whose **May merge** is on | Instructions: the clone is told which repositories allow it. Your GitHub permissions are the hard limit. |
| Deploying | Only to dev, never to staging, production or a release | Instructions only; the app's code does not check where a deploy goes |
| Pause | Starts nothing new, tries to stop workers, answers only your commands in your self-DM | Code. A worker it could not stop keeps running until you stop it, and pause undoes nothing. [Control and maintain Misha](/operate/manage) has the procedure. |

[How Misha works](/understand/how-it-works) explains the runtime behind this table, and [Settings and commands](/reference/settings) lists who may change each setting.

### Residual risks {#residual-risks}

- The clone can be wrong and confident, in public, as you. Its marker does not stop that; correct it as yourself.
- Messages, tickets, pages and files are input to the model, and text in them can try to steer it. Other people's turns can only read, but workers' limits are instructions.
- One clone session spans your conversations, so something said in one conversation can reach a reply in another.
- The extension observes the requests every tab sends and redacts credentials only by name and pattern; the rest of a request body is kept in memory as sent.
- Workers act with your Mac user's authority and your accounts' permissions.
- Waiting messages and the ledger have no age limit.

### Updates and audit {#updates-and-audit}

Since 19 November 2026 Misha has been one owner-operated, unsigned local build. There is no public download, no Chrome Web Store listing and no invite keys yet. The app has no automatic updater and contacts no update server, so no update can be pinned or rolled back; that changes only with a signed release. The app's code contains no analytics or crash reporting.

The ledger records every post, edit, upload and reaction the clone and its workers made in Slack. Home shows current and recent work. Neither is a complete record of the shell commands, file changes or cloud calls workers make; those are in the workers' logs and their harness transcripts. The browser extension's source is public in [misha-browser](https://github.com/dumdummisha/misha-browser); the desktop app's source is not, so its behaviour on this page is described by its maintainer rather than open to your own audit.

### The websites {#websites}

This site and [dumdummisha.ai](https://dumdummisha.ai) are static pages with no sign-in, forms or cookies of their own and no analytics scripts. This site runs only its own JavaScript, for navigation and a search index that ships with the site, so a search never leaves your browser. The landing page has no JavaScript of its own and serves its fonts itself. Both are hosted by Vercel, which receives each request (your IP address, the address you asked for and your browser's headers) as any web host does. What Vercel logs for these sites and for how long has not been checked.

The landing page's **Ask for an invite** opens an email to the publisher. Your address and message reach the publisher's mailbox and are used to answer you. This policy sets no deletion period for them.

### Commitments {#commitments}

The publisher does not sell your data, does not use it for advertising, and does not use or transfer it for anything but providing Misha and answering you, in line with the Limited Use requirements the extension certifies [below](#store). Since the app and the extension send the publisher nothing, in practice this covers invite emails. Model providers and connected services process your content under your own account and their terms, not the publisher's.

### Chrome Web Store requirements {#store}

The extension's single purpose, as its listing states it:

<!--@generated: browser-single-purpose-->

What it handles, by the store's data types:

<!--@generated: browser-data-usage-->

Its certifications:

<!--@generated: browser-certifications-->

[Browser permissions](/reference/permissions) explains each permission from the same source.

### Changes to this policy {#changes}

A change updates the effective date at the top. Every earlier version is in the public history of [this site's repository](https://github.com/dumdummisha/misha).

### Contact {#contact}

Ask through the invite link on [dumdummisha.ai](https://dumdummisha.ai). No support response time is promised.
