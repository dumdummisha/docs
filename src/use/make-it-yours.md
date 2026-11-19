---
title: Make it yours
description: "Choose your clone's marker, tone, working notes and scope, and connect the services your first task needs."
prev:
  text: Get started
  link: /start/get-started
next:
  text: Put Misha to work
  link: /use/workflows
---

# Make it yours

Your clone is already live with the face you saved on Get started. This page makes it sound like you, gives it the context it needs, and decides who can ask it for work and what it may reach. The first three sections suit everyone. The rest depend on the first task you choose, so take only the ones it needs. Everything here is on **Settings** and **Set up** in the Misha window, and [Settings and commands](/reference/settings#surfaces) lists every other way to make each change.

## Your first control {#your-first-control}

<!--@include: ../_includes/first-control.md-->

You can tell the state at a glance. The foot of the sidebar reads "Shop · I answer as you" while the clone is live and "Shop · paused" while it isn't, and Home's top card says "I'm listening in Slack." or "I'm paused." Try it once now: pause, read the card, resume.

## Voice and marker {#voice-and-marker}

Every post your clone makes starts with its icon, followed by the text in italics, so people can tell it apart from what you type yourself. On **Settings › Icon**, the preview "How a message starts" shows a post as Slack will. The icon also calls the clone: a message you write with your icon in it reaches the clone as yours, wherever you write it. You can change the icon but not remove it; every clone has one.

<Shot id="settings-icon" caption="The icon card, with a preview of how a post by Sam Rivera's clone starts. Made-up example." />

**Personality** is your words on how the clone sounds, in up to <Fact name="desktop.settings.fields.2.limits.maxCharacters" /> characters. It shapes tone, language and formatting. It doesn't change what the clone may do, and it can't override the clone's fixed rules. Sam's is in the picture below; another owner might write:

> Reply in English, in two or three sentences. Link the ticket or file you read. Keep the humour to a minimum.

It shapes style, not knowledge: the clone doesn't learn to think like you, and a reply can still be wrong.

<Shot id="settings-personality" caption="Sam Rivera's personality: short, friendly, first names, no exclamation marks. Made-up example." />

## Working context {#working-context}

**What I remember** holds notes in your exact words, numbered, up to <Fact name="desktop.settings.fields.3.limits.maxNotes" /> of <Fact name="desktop.settings.fields.3.limits.maxCharactersEach" /> characters each. The clone is given them as standing context. Add one with **Remember**, or `remember` followed by the note in your self-DM; remove one with **Forget** in the window or through the setup command. A good first note is one a colleague would otherwise have to ask you about, such as "Priya owns payments. Ask Priya before touching the checkout."

<Shot id="settings-notes" caption="Three notes in Sam's words, each with Forget. Made-up example." />

Notes aren't conversation history. History is the clone's one Claude Code session, shared by every conversation. It is compacted as it grows, and start fresh replaces it. **Start fresh** under **More** keeps your settings, notes and the old transcript. It isn't a first-day step; [Settings and commands](/reference/settings#notes-history-start-fresh) explains the difference in full.

## Choose your scope {#choose-your-scope}

Three cards on Settings decide who gets what. Each is separate, and leaving one empty is a valid choice:

| Card | What adding someone or something does | When it's empty |
| --- | --- | --- |
| **Who may ask me for work** | They can start workers: research, a ticket, an implementation and its review. They don't get your direct changes in Jira, Google and the other services. | Only you can start work. Everyone else the clone answers gets answers from reads. |
| **Channels I watch** | The clone reads every message there and answers what asks something of you or your work. | It answers only DMs to you, mentions of you and threads you're in. |
| **Who I ignore** | **Ignore**: the clone never answers them. **Soft-ignore**: it answers only when they call it with your icon. | Nobody is ignored. |

Allowing someone doesn't make the clone answer more, and watching a channel doesn't let anyone there ask for work. **Stop allowing**, **Stop watching** and **Stop ignoring** sit beside each entry. Some of these also have a Slack command for your self-DM, but stopping an allowance or a watch is done only in the window:

<!-- facts surfaces allow disallow watch unwatch set-rule remove-rule -->

<Shot id="settings-allowed" caption="Priya Nair and Jonas Weber may ask Sam's clone for work, each with Stop allowing. Made-up example." />

<Shot id="settings-watched" caption="The clone reads #shop-backend in full, with Stop watching beside it. Made-up example." />

<Shot id="settings-rules" caption="Jonas Weber is soft-ignored, so the clone answers him only when he calls it with Sam's icon. Made-up example." />

A change counts from the clone's next turn. Work already started keeps going, so to stop it, pause ([when a change takes effect](/reference/settings#when-changes-apply)). Three ways Sam might begin, depending on the role, as examples rather than presets. As a developer, Sam allows Priya Nair, who shares the backend, and watches `#shop-backend`. As a PM, Sam leaves both lists empty until the first week shows what colleagues ask. As a designer, Sam allows no one and soft-ignores Jonas Weber, who only wants Sam's own answers. When colleagues ask what's answering them, send them [Talking with a clone](/understand/slack).

## Connect for a task {#connect-for-a-task}

Pick a first task from [Put Misha to work](/use/workflows#choose-a-first-task), then connect only what it needs on **Set up**. Each service has a row with its sign-in button and an **I use it** switch. The switch works only once the row shows the service ready, and the clone gets that service's tools only while the switch is on and the sign-in still works.

| For a task like | Turn on |
| --- | --- |
| Asking what code does or who changed it | A repository [below](#repositories), which the **GitHub CLI** clones |
| Reading a pull request's checks | **GitHub CLI** |
| Reading a ticket or a Confluence page | **Jira and Confluence** |
| Reading or editing a Doc or Sheet | **Google** |
| Answering from a meeting's transcript | **Fireflies** |
| Reading a Figma screen's text or rendering it | **Figma** |
| Reading logs in your AWS accounts | **AWS** |
| GPT reviews of tickets and pull requests | **OpenCode**, signed in to OpenAI |

Figma and Fireflies give you a key that you paste into OpenCode, never into Misha, so they need OpenCode installed. As a PM, Sam might start with Jira and Confluence and Fireflies; as a designer, with Figma; as a developer, with the GitHub CLI and a repository.

Connecting a service doesn't widen who may do what. Colleagues get reads only; changes in a service, and the GitHub and AWS command lines, are for your own messages ([who may ask for what](/use/workflows#who-may-ask)). Figma and Fireflies only read.

## Repositories {#repositories}

If your clone should read code, add each repository as `owner/name` on **Settings › Repositories**. The clone keeps its own copy on this Mac and never touches your checkouts. Workers open pull requests there for the people allowed to ask for work.

<Shot id="settings-repositories" caption="Two repositories: workers may merge in shop/shop-backend, not in shop/shop-web. Made-up example." />

**May merge** is separate from reading. A repository is added with it off, and leaving it off is a sound way to begin: delivery then ends at a reviewed pull request that someone merges. Turning it on tells the clone that workers may merge reviewed pull requests there and deploy them to dev. It's an instruction the clone passes to its workers, not a lock the app enforces. Whatever it says, the clone's instructions rule out staging, production, releases and a colleague's code. A merge also needs the repository's own delivery command, which [Delivery](/use/workflows#delivery) explains. In your self-DM, `allow merging shop/shop-backend` and `stop merging shop/shop-backend` do the same.

## Ready {#ready}

Your clone now has:

- a brake you've tried, and a state you can read on Home
- an icon and a voice that sound like you, and the notes a colleague would ask you for
- the people who may ask for work and the channels it watches, or neither yet
- the connections for one task, and the repositories if you work in code

You don't have to connect every service or let anyone else ask for work. Next, [put Misha to work](/use/workflows) with one real request. To change any of this later, see [Control and maintain Misha](/operate/manage#scope); for what the clone's access means for your data, see [Privacy and security](/privacy).
