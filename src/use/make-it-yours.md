---
title: Make it yours
description: "Give your clone your voice and the notes a colleague would ask you for, choose what it watches and who can ask it for work, and add your repositories."
prev:
  text: Get started
  link: /start/get-started
next:
  text: Put Misha to work
  link: /use/workflows
---

# Make it yours

Your clone is live with the face you saved on Get started. Here you give it your voice and the context a colleague would ask you for, then decide who can ask it for work and what it can reach. Everything here is on **Settings** in the Misha window.

## Voice and marker {#voice-and-marker}

By default, your clone's posts start with its icon and are set in italics, so people can tell them from what you type; stealth mode drops the marker. On **Settings › Icon**, the preview shows how a post starts in Slack. Your icon in any message you write also calls the clone.

<Shot id="settings-icon" caption="The icon card, with a preview of how a post by Leo Novak's clone starts. Made-up example." />

**Personality** is how the clone should sound, in your own words, up to <Fact name="desktop.settings.fields.personality.limits.maxCharacters" /> characters. It shapes tone, language and formatting, not what the clone may do.

<Shot id="settings-personality" caption="Leo Novak's personality: short, friendly, first names, no exclamation marks. Made-up example." />

Another owner might write:

> Reply in English, in two or three sentences. Link the ticket or file you read. Keep the humour to a minimum.

## Working context {#working-context}

**What I remember** holds up to <Fact name="desktop.settings.fields.notes.limits.maxNotes" /> notes of <Fact name="desktop.settings.fields.notes.limits.maxCharactersEach" /> characters each, in your exact words, which the clone keeps as standing context. Add one with **Remember**, or write `remember` and the note in your self-DM; **Forget** removes it. A good first note is one a colleague would otherwise ask you about, such as "Emma owns payments. Ask Emma before touching the checkout."

<Shot id="settings-notes" caption="Three notes in Leo's words, each with Forget. Made-up example." />

Notes are separate from the clone's conversation history; [Settings and commands](/reference/settings#notes-history-start-fresh) explains both.

## Choose your scope {#choose-your-scope}

Three cards on Settings decide who gets what. Each is separate, and leaving one empty is fine:

| Card | What adding someone or something does | When it's empty |
| --- | --- | --- |
| **Channels I watch** | The clone reads every message there and answers what asks something of you or your work. | It answers only DMs to you, mentions of you and threads you're in. |
| **Who may ask me for work** | They can start workers: research, a ticket, an implementation and its review. They don't get your direct changes in Jira, Google and the other services. | Only you can start work. Everyone else the clone answers gets answers from reads. |
| **Who I ignore** | **Soft-ignore** someone and the clone answers them only when they call it with your icon. **Ignore** them and it never answers them at all. | Nobody is ignored. |

Each entry has **Stop watching**, **Stop allowing** or **Stop ignoring** beside it. A change counts from the clone's next turn, and [Settings and commands](/reference/settings#surfaces) lists the Slack commands that make the same changes.

<Shot id="settings-allowed" caption="Emma Lee and Max Becker may ask Leo's clone for work, each with Stop allowing. Made-up example." />

How Leo might begin depends on the role. As a developer, Leo allows Emma Lee, who shares the backend, and watches `#shop-backend`. As a PM, Leo leaves both lists empty until the first week shows what colleagues ask. As a designer, Leo allows no one and soft-ignores Max Becker, who only wants Leo's own answers. When colleagues ask what's answering them, send them [Talking with a clone](/understand/slack).

## Repositories {#repositories}

If your clone should read code, add each repository as `owner/name` on **Settings › Repositories**. The clone keeps its own copy and never touches your checkouts.

<Shot id="settings-repositories" caption="Two repositories: workers may merge in shop/shop-backend, not in shop/shop-web. Made-up example." />

**May merge** starts off, so delivery ends at a reviewed pull request that someone merges. Turn it on to let workers merge reviewed pull requests there; a merge also needs the repository's own delivery command, which [Delivery](/use/workflows#delivery) explains. In your self-DM, `allow merging shop/shop-backend` and `stop merging shop/shop-backend` do the same.

## Pause when you need to {#pause}

**Pause Misha** is in the window's sidebar and in the Misha menu in the menu bar, and `pause` works in your self-DM. Pausing stops new work at once and tries to stop the workers that are running; messages that arrive meanwhile wait until you **Resume**. Because a settings change counts only from the clone's next turn, pause to stop work already under way. [Pause Misha](/operate/manage#pause) has the details.

## Ready {#ready}

Your clone now has:

- an icon and a voice that sound like you, and the notes a colleague would ask you for
- the people who may ask for work and the channels it watches, or neither yet
- the repositories, if you work in code
- a brake for when you need it

Next, [put Misha to work](/use/workflows) with one real request. To change any of this later, see [Control and maintain Misha](/operate/manage#scope).
