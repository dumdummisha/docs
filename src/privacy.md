---
title: Privacy and security
description: "The Dumdum Misha privacy policy and security summary: what data goes where, who receives it, which credentials Misha touches, how long it keeps data and what it may do on your Mac."
prev: false
next: false
outline: [2, 3]
---

# Privacy and security

**Effective 19 November 2026.** Misha has no server of its own. It runs on your Mac and works through your own accounts: your Claude Code sends what the clone reads and writes to Anthropic, OpenCode sends whatever you run on another model (GPT workers, for example) to that model's provider, and Slack and the services you connect receive what Misha sends them. Misha keeps its own records on your Mac, some of them with no age limit.

This page covers the Misha app for macOS, the Misha Browser extension and its native host, the Claude Code and OpenCode sessions Misha starts, this documentation site and the landing page at [dumdummisha.ai](https://dumdummisha.ai). It is the privacy policy for all of them, including the extension's Chrome Web Store listing.

## Security assessment {#assessment}

Each row links to the section that holds its evidence.

| Question | Answer |
| --- | --- |
| [What leaves the Mac](#data-flows) | Slack messages that need the clone, their conversation, files and tool results go to Anthropic through your Claude Code. A Slack image the clone reads goes to a separate model call, Claude by default. Workers send their work to their model's provider: Anthropic, or through OpenCode any provider it is set up for (OpenAI for GPT). Replies go to Slack; queries and changes to the services you connect. There is no Misha server. |
| [Accounts and terms](#recipients) | Every recipient works under your own account and its terms. These docs do not establish any provider's retention or your organisation's terms. |
| [Slack identity](#slack-identity) | Misha acts as you through your signed-in Slack web session, not as a Slack app. What a workspace administrator sees, and whether this fits Slack's terms for your workspace, is not established here. |
| [Credentials](#credentials) | The Slack token is used only inside your Slack tab. Claude Code keeps its own sign-in. Integration tokens sit in their own stores; Misha's modules read them to call those services, and read every stored credential they know of to check outgoing text on the Mac. |
| [Browser access](/reference/permissions) | Access to all sites, automatic recording of every tab's fetch and XHR requests, and native messaging. The request log stays in browser memory until `tab_network` returns it, redacted only by name and pattern, to a local agent that can send it to its model provider. New Slack messages wait in a bounded queue on disk. [Browser storage](#browser-storage) lists both. |
| [Machine authority](#authority) | The clone is restricted Claude Code with read-only tools for other people. Workers run Claude Code or OpenCode with a shell. Claude workers keep your Claude Code permission rules; GPT workers run on Misha's own OpenCode configuration, which grants a shell and outside-folder access and approves requests left at ask. No operating system sandbox. |
| [Updates](#updates-and-audit) | One owner-operated unsigned local build. No public download, updater, pinning or rollback. |
| [Audit](#updates-and-audit) | A ledger of every Slack post, edit, upload and reaction, never deleted. No record of every shell or cloud command. |
| [Stopping](/operate/manage#pause) | Pause starts nothing new and tries to stop workers; one it could not confirm stopped is named on Home. It undoes nothing already done. |
| [Removal](#deletion) | No uninstall yet. The safe steps today remove the browser parts and keep the data folder, which Claude Code loads Misha's extensions from. Transcripts, sign-in tokens, Slack posts and services' records stay. |
| [Residual risks](#residual-risks) | Confident wrong replies posted as you, instructions hidden in content, one clone session across conversations, broad browser observation, workers acting as your Mac user, work records with no age limit. |

## Privacy policy {#privacy-policy}

### Where data goes {#data-flows}

[![Diagram: inside your Mac, the Slack tab, the Misha Browser extension, the native host, the Misha app, the clone, the image-reading call, workers and optional agents with the misha-browser tools; outside it Slack, Anthropic, OpenAI or another provider set up in OpenCode, the services you connect and the sites your tabs have open. Numbered arrows match the list below.](/diagrams/where-data-goes.svg)](/diagrams/where-data-goes.svg)

Select the diagram to open it full size.

1. Your signed-in Slack tab receives messages over Slack's own connection. The extension reads every new message that arrives there, in any conversation, cut down to [fixed fields](/reference/permissions#slack-transport-limits), and queues it in the browser.
2. The extension passes each message through the native host, a small program that connects the extension to Misha on the same Mac, to the Misha app. The host stores nothing. The app records that the event arrived and decides from your settings whether the message needs the clone. Only a message that does is saved with its text in `misha.db`, to wait for the clone; for any other it keeps bookkeeping only, such as the receipt and the threads you reply in.
3. For a waiting message, the app gives the clone (Claude Code started in its restricted mode) the message, the conversation it belongs to, your settings and notes.
4. Claude Code sends that conversation, any file it reads and every tool result to Anthropic, under your Claude subscription.
5. The clone and the workers read from the services you connected and, where you or your settings allow, change things there.
6. When the clone reads an image posted in Slack, a separate one-shot model call answers its question about the image: by default Claude Haiku through your Claude Code, with no tools and no saved session, or a model the clone names, which runs through your OpenCode's `vision` agent when it is another provider's. The image and the question go to that model's provider, and the answer joins the clone's conversation.
7. When you, or someone you allowed, asks for work, the app starts workers: separate Claude Code or OpenCode sessions that do one task.
8. A worker sends its task, the code and its tool results to the provider of the model it runs on: Anthropic for a Claude model, OpenAI for a GPT model, or any other provider your OpenCode is set up for, which the code does not rule out.
9. The extension posts the clone's and workers' messages and makes its allowlisted Slack calls from a function it runs inside your signed-in Slack page, so the calls reach Slack from that page, as you. A file upload's bytes go to the upload address Slack's answer names, whose host the extension does not check.
10. Optional and separate from the clone: if you register the misha-browser tools with your own Claude Code or OpenCode, or an extension grants them to a worker, they send requests through the same host and extension to your other tabs and get back page text, screenshots and the request log. Their desktop tools capture your screen and move the mouse and keyboard through macOS, without the extension. The extension records the fetch and XHR requests every tab sends whether or not a tool is in use.
11. Those sessions send what the tools return to their own model provider.

Three configurations reach different data, and no single Slack message uses all of it: a baseline clone turn uses the tools and services above, a worker given an extension's extra tools reaches whatever those tools reach, and the standalone browser and desktop tools reach your tabs, screen and keyboard for the agent you register them with. Personalising the clone, adding extensions or using the browser tools adds no confidentiality guarantee. [Customise and reuse Misha](/reference/extensions) explains where additions run.

### Who receives it {#recipients}

| Recipient | What it receives | Under |
| --- | --- | --- |
| Anthropic | Messages the clone considers, their conversation, your personality and notes, files it reads, tool results; Claude workers' tasks, code and tool results; Slack images and questions sent to a Claude model, the default | Your Claude subscription in Claude Code, and Anthropic's terms for it |
| OpenAI, if you use it | Everything a GPT worker is given and produces, for a review or any other task: its task, code, tool results and what it reads; a Slack image and question the clone sends to a GPT model | Your OpenAI sign-in in OpenCode |
| Another provider set up in OpenCode | The same, for a worker or image read run on that provider's model. Misha's intended workflow uses Claude and GPT models; the code does not enforce that | Your sign-in to that provider in OpenCode |
| Slack | Posts, edits, uploads and reactions, and the Web API reads the clone makes | Your Slack account, through your web session |
| GitHub | Clones, branches, pull requests and merges where you allowed them | Your GitHub CLI sign-in |
| Atlassian, Google, Figma, Fireflies, AWS | Queries, and the tickets, pages, Docs and Sheets workers or your own turns create or change; Figma and Fireflies are read only | Your sign-in to each, where you connected it |
| The publisher of Dumdum Misha | Nothing from the app or the extension. Only an email you send to ask for an invite | See [the websites](#websites) |

For the browser extension, its disclosures state:

<!-- facts browser-recipients -->

Each recipient's own retention, training and administrator-access rules apply to what it receives. These docs have not checked them.

### Slack identity {#slack-identity}

Misha has no Slack app, bot user or token of its own. It posts from your account through the Slack tab you are signed in to, so in Slack its posts are yours. A clone reply can start with your chosen emoji and be set in italics; that marker is optional, and it is a label, not authentication: anyone can type the same emoji. These docs do not establish whether Slack's terms or your organisation allow a personal agent to post this way: that is for you and your organisation to decide.

### Credentials {#credentials}

| Credential | Where it stays | What Misha's code does with it |
| --- | --- | --- |
| Slack session token and cookie | Slack's saved client state in your tab, and the browser's cookie store | The extension's function inside the Slack page reads the token for each call the app asks for and sends it only to your workspace's address on Slack's domain. It never returns the token. The network observer sees request credentials briefly and redacts the ones it recognises. |
| Claude sign-in | Claude Code | The app runs `claude auth status` to see whether you are signed in, and `claude auth login` when you sign in from the window. It does not read the token. |
| OpenAI and other provider sign-ins | OpenCode | Used by OpenCode when a worker or image read runs on that provider's model. |
| Figma and Fireflies keys | OpenCode's credential store, where you paste them | Misha's Figma and Fireflies tools read the key there to call that service. |
| Atlassian and Google sign-ins | Token files in your user state folder, written when you sign in from Misha | Misha's tools for those services read and refresh them to make their calls. |
| GitHub and AWS | The GitHub CLI's and AWS CLI's own stores | Misha runs the CLIs; it does not read their stores. |

#### The outgoing-text check {#outgoing-check}

Before the Jira, Confluence and Google Workspace write tools send text, Misha reads, on your Mac, every stored credential value it knows of and compares the text against them. It reads every entry in OpenCode's credential store, including integrations you do not use; Atlassian and mail token files; the OAuth client secrets for Atlassian, Google mail and Google Workspace; Google Workspace token files, including retired gcloud sign-in data; database passwords in the project's database configuration; and two client secrets from its environment. The comparison happens locally and sends none of these values anywhere. A match refuses the whole send, as does text shaped like a known token (Slack, GitHub, AWS, Anthropic, OpenAI or Google keys, private keys and web tokens).

The check covers only stored values of at least eight characters from stores it could read: a store it cannot read, or a malformed entry, is skipped with a warning in Misha's log, and a shorter value is not checked. Messages, files, pages and tool results can contain secrets themselves, and nothing on this page detects every secret. Elsewhere, a clone reply has text shaped like a known token redacted, and a worker's Slack message holding one is refused. The extension's own credential handling is set out under [Where Slack's credentials go](/reference/permissions#where-slack-credentials-go).

### What is stored, and for how long {#storage}

Misha's own files on your Mac:

<!-- facts paths -->

One more file comes from Misha's code, outside the Misha home: misha-browser's desktop tool `macos_screen_capture` saves a PNG of your primary screen in a `misha-browser` folder in macOS's temporary folder, and deletes it once the screenshot is read into the tool's result. A failed deletion is only logged, and a capture whose process is killed before that point stays. Nothing sweeps the folder.

#### Retention {#retention}

<!-- facts retention-policy -->

Starting fresh is not erasure: the clone's next message starts a new Claude session, and the old transcript stays in Claude Code, as do your settings and notes. A message waiting for the clone is still there after a pause and can be answered after you resume.

#### In the browser {#browser-storage}

The extension writes only its queue of new Slack messages to disk; everything else it keeps stays in memory:

<!-- facts browser-holdings -->

#### Outside Misha's folders {#other-records}

Claude Code keeps the clone's and Claude workers' session transcripts with your other Claude Code sessions, and OpenCode keeps GPT workers' sessions with yours. Signing in to Atlassian or Google Workspace from Misha writes token files to your user state folder, `~/.local/state` unless `XDG_STATE_HOME` names another: one file per Atlassian site under `jira`, and Google Workspace's under `google-workspace/oauth`. The OAuth client files those sign-ins read are ones you create yourself in `~/.config/opencode`. Installing an extension writes skills, commands, agent profiles and tool registrations into your Claude Code and OpenCode configuration. The browser repository's installer registers the native host with Chrome and Brave in `~/Library/Application Support/Google/Chrome/NativeMessagingHosts` and `~/Library/Application Support/BraveSoftware/Brave-Browser/NativeMessagingHosts`, and writes its launcher to `~/.misha/browser-bridge`, which stays there even when `MISHA_HOME` moves the app's files. Slack, the model providers and each connected service keep their own records under their own rules.

### Deleting your data {#deletion}

There is no Misha account to close: what Misha keeps is on your Mac, and the rest sits in the accounts it works through. Misha has no uninstall yet. [Remove Misha](/operate/manage#remove) gives the steps that are safe today, starting with a [pause](/operate/manage#pause) and waiting until no worker is listed. They remove the browser extension, its message queue and the native host, and they leave the app and its data folder in place, because Claude Code loads Misha's extensions from that folder and its install records are what a later removal needs. Until then, the files [listed above](#storage) stay.

Remove Misha does not cover two kinds of local file:

- **Sign-in tokens:** the Atlassian and Google Workspace token files in your [user state folder](#other-records). Deleting them removes the local copy only. Deleting local files signs you out of nothing, here or for any other service: revoke Misha's access at each service, or sign out there, to end it.
- **Screen captures:** any PNG left in the `misha-browser` folder of macOS's temporary folder.

Deleting on your Mac erases nothing elsewhere. Claude Code and OpenCode transcripts, what Misha posted or uploaded to Slack, and what providers and services keep stay under their own rules, and these docs make no promise about what they erase.

### What Misha may do {#authority}

| Who acts | What it can do | What limits it |
| --- | --- | --- |
| The clone, answering anyone but you | Read connected services through Misha's tools, which call those services over the network, and its own read-only copies of your repositories. No shell and no general web browsing or search. | Code: Claude Code's restricted mode with no settings files loaded, a per-turn list of callable read tools, every other tool refused, and Misha's bridge refusing it again |
| The clone, on your own turn | Also the services' write tools, and any `gh` or `aws` command when GitHub or AWS is connected, with what those CLIs can do under your sign-in | Code: the same per-turn list, with command rules Misha supplies for those two CLIs. Your own Claude Code settings and permission rules are not loaded. |
| The clone, asked for work by you or someone you allowed | Start workers | Code: the requester must be you or on your allowed list |
| Claude workers | `claude -p` with a profile's tools: a shell, file edits, git, the GitHub CLI and cloud CLIs, as far as your accounts allow | Code: the profile names the tools the worker sees, and Misha's bridge is the only MCP server it loads; your Claude Code settings, your permission rules included, load as usual. Instructions and your accounts. No operating system sandbox. |
| GPT workers (OpenCode) | The same tools through OpenCode | Code: Misha writes the run's whole OpenCode configuration, and yours, global and project, does not load. Each profile denies everything, then grants its tools; the implementer and reviewer profiles both grant every shell command and access outside the working folder, so a reviewer is not read-only in code. Misha approves at once any request a rule leaves at ask; a deny still refuses. Instructions and your accounts. No operating system sandbox. |
| Merging | Workers merge a reviewed pull request only in a repository whose **May merge** is on | Instructions: the clone is told which repositories allow it. Your GitHub permissions are the hard limit. |
| Deploying | Only to dev, never to staging, production or a release | Instructions only; the app's code does not check where a deploy goes |
| Pause | Starts nothing new, tries to stop workers, answers only your commands in your self-DM ([how to pause](/operate/manage#pause)) | Code. A worker it could not confirm stopped may keep running, and pause undoes nothing. |

[How Misha works](/understand/how-it-works) explains the runtime behind this table, and [Settings and commands](/reference/settings) lists who may change each setting.

### Residual risks {#residual-risks}

- The clone can be wrong and confident, in public, as you. Its marker does not stop that; correct it as yourself.
- Messages, tickets, pages and files are input to the model, and text in them can try to steer it. Other people's turns can only read, but workers' limits are instructions and their profiles' grants.
- One clone session spans your conversations, so something said in one conversation can reach a reply in another.
- The extension records the fetch and XHR requests every tab sends and redacts credentials only by name and pattern; the rest of a request body is kept in memory as sent and returned to an agent that asks.
- Workers act with your Mac user's authority and your accounts' permissions.
- Waiting messages, the ledger, workers' prompts, logs and working copies have no age limit.

### Updates and audit {#updates-and-audit}

Since 19 November 2026 Misha has been one owner-operated, unsigned local build. There is no public download, no Chrome Web Store listing and no invite keys yet. The app has no automatic updater and contacts no update server, so no update can be pinned or rolled back; that changes only with a signed release. [Updates](/operate/manage#updates) says what a newer build changes when it starts. The app's code contains no analytics or crash reporting.

The ledger records every post, edit, upload and reaction the clone and its workers made in Slack. Home shows current and recent work. Neither is a complete record of the shell commands, file changes or cloud calls workers make; those are in the workers' logs and their harness transcripts. The browser extension's source is public in [misha-browser](https://github.com/dumdummisha/misha-browser); the desktop app's source is not, so its behaviour on this page is described by its maintainer rather than open to your own audit.

### The websites {#websites}

This site and [dumdummisha.ai](https://dumdummisha.ai) are static pages with no sign-in, forms or cookies of their own and no analytics scripts. This site runs only its own JavaScript, for navigation and a search index that ships with the site, so a search never leaves your browser. The landing page has no JavaScript of its own and serves its fonts itself. Both are hosted by Vercel, which receives each request (your IP address, the address you asked for and your browser's headers) as any web host does. What Vercel logs for these sites and for how long has not been checked.

The landing page's **Ask for an invite** opens an email to the publisher. Your address and message reach the publisher's mailbox and are used to answer you. This policy sets no deletion period for them.

### Commitments {#commitments}

The publisher does not sell your data, does not use it for advertising, and does not use or transfer it for anything but providing Misha and answering you, in line with the Limited Use requirements the extension certifies [below](#store). Since the app and the extension send the publisher nothing, in practice this covers invite emails. Model providers and connected services process your content under your own account and their terms, not the publisher's.

### Chrome Web Store requirements {#store}

The extension's single purpose, as its listing states it:

<!-- facts browser-single-purpose -->

What it handles, by the store's data types:

<!-- facts browser-data-usage -->

Its certifications:

<!-- facts browser-certifications -->

[Browser permissions](/reference/permissions) explains each permission from the same source.

### Changes to this policy {#changes}

A change updates the effective date at the top. Every earlier version is in the public history of [this site's repository](https://github.com/dumdummisha/misha).

### Contact {#contact}

Ask through the invite link on [dumdummisha.ai](https://dumdummisha.ai). No support response time is promised.
