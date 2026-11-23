---
title: Make it yours
description: "Give your clone your voice, its Routines and the notes a colleague would ask you for, choose what it watches and who can ask it for work, and link your repositories."
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

<figure class="shot"><img class="shot__image" src="/captures/settings-icon.png" alt="The icon card: the emoji every post starts with, and a preview of a post by Leo Novak." width="1544" height="960" loading="lazy" decoding="async"><figcaption class="shot__caption">The icon card, with a preview of how a post by Leo Novak's clone starts. Made-up example.</figcaption></figure>

**Personality** is how the clone should sound, in your own words, up to 2000 characters. It shapes tone, language and formatting, not what the clone may do.

<figure class="shot"><img class="shot__image" src="/captures/settings-personality.png" alt="The personality card with Leo's words on how the clone sounds." width="1544" height="736" loading="lazy" decoding="async"><figcaption class="shot__caption">Leo Novak's personality: short, friendly, first names, no exclamation marks. Made-up example.</figcaption></figure>

Another owner might write:

> Reply in English, in two or three sentences. Link the ticket or file you read. Keep the humour to a minimum.

**Routines** is what the clone should do with work, in your own words, up to 2000 characters. Write one per line: when something happens, what to do, then whether to tell you or ask you. You can name skills and commands for workers to follow, and you shouldn't put passwords or tokens in it. Your own request in the moment comes first, and Routines grant no access: who may ask for work and where workers may merge stay on Settings. Leave it empty and the clone works its usual way. [Put Misha to work](/use/workflows) shows how a request becomes work.

<figure class="shot"><img class="shot__image" src="/captures/settings-routines.png" alt="The routines card with Leo's standing instruction for a fix: a worker updates its ticket, fixes it in its own worktree with a regression test, and opens a pull request for review." width="1544" height="912" loading="lazy" decoding="async"><figcaption class="shot__caption">Leo Novak's routine for a fix: a worker updates its ticket, fixes it in its own worktree and opens a pull request for review. Made-up example.</figcaption></figure>

## Working context {#working-context}

**What I remember** holds up to 200 notes of 1000 characters each, in your exact words, which the clone keeps as standing context. Add one with **Remember**, or write `remember` and the note in your self-DM; **Forget** removes it. A good first note is one a colleague would otherwise ask you about, such as "Emma owns payments. Ask Emma before touching the checkout."

<figure class="shot"><img class="shot__image" src="/captures/settings-notes.png" alt="What the clone remembers: three numbered notes in your words." width="1544" height="784" loading="lazy" decoding="async"><figcaption class="shot__caption">Three notes in Leo's words, each with Forget. Made-up example.</figcaption></figure>

Notes are separate from the clone's conversation history; [Settings and commands](/reference/settings#notes-history-start-fresh) explains both.

## What it thinks with {#thinking}

On **Settings › What I think with**, choose whether the clone runs on Claude Code or OpenCode, then a model and effort from the list that runtime offers. Switching runtime starts a new conversation with the same settings, notes and Routines; changing only the model keeps the conversation and counts from the next message. [Settings and commands](/reference/settings#what-i-think-with) has the defaults and limits.

## Choose your scope {#choose-your-scope}

Three cards on Settings decide who gets what. Each is separate, and leaving one empty is fine:

| Card | What adding someone or something does | When it's empty |
| --- | --- | --- |
| **Channels I watch** | The clone reads every message there and answers what asks something of you or your work. | It answers only DMs to you, mentions of you and threads you're in. |
| **Who may ask me for work** | They can start workers: research, a ticket, an implementation and its review. They don't get your direct changes in Jira, Google and the other services. | Only you can start work. Everyone else the clone answers gets answers from reads. |
| **Who I ignore** | **Soft-ignore** someone and the clone answers them only when they call it with your icon. **Ignore** them and it never answers them at all. | Nobody is ignored. |

Each entry has **Stop watching**, **Stop allowing** or **Stop ignoring** beside it. Watching and ignoring affect new messages as soon as you save. Who may ask for work changes on the clone's next turn and does not stop workers already running. [Settings and commands](/reference/settings#surfaces) lists the Slack commands that make the same changes.

<figure class="shot"><img class="shot__image" src="/captures/settings-allowed.png" alt="Who may ask for work besides Leo: Emma Lee and Max Becker." width="1544" height="688" loading="lazy" decoding="async"><figcaption class="shot__caption">Emma Lee and Max Becker may ask Leo's clone for work, each with Stop allowing. Made-up example.</figcaption></figure>

How Leo might begin depends on the role. As a developer, Leo allows Emma Lee, who shares the backend, and watches `#shop-backend`. As a PM, Leo leaves both lists empty until the first week shows what colleagues ask. As a designer, Leo allows no one and soft-ignores Max Becker, who only wants Leo's own answers. When colleagues ask what's answering them, send them [Talking with a clone](/understand/slack).

## Repositories {#repositories}

If your clone should read code, link each repository on **Settings › Repositories** by its full folder path, and give its remote as `host/owner/name`, or leave the remote empty if it has none. The clone reads that folder as it is, uncommitted and ignored files included. Workers get worktrees of their own outside it.

<figure class="shot"><img class="shot__image" src="/captures/settings-repositories.png" alt="The folders the clone reads: workers may merge in example.com/shop/shop-backend, not in example.com/shop/shop-web." width="1544" height="844" loading="lazy" decoding="async"><figcaption class="shot__caption">Two linked folders: workers may merge in the remote of one, not the other. Made-up example.</figcaption></figure>

For a folder with a remote, **May merge** starts off, so pull requests stay unmerged for someone to merge. Turn it on to let workers merge in that remote; your request and Routines decide the procedure. A folder with no remote can still be worked on locally, but has no pull request to open or merge. In your self-DM, `allow merging /Volumes/Code/shop-backend` and `stop merging /Volumes/Code/shop-backend` do the same.

## Pause when you need to {#pause}

**Pause Misha** is in the window's sidebar and in the Misha menu in the menu bar, and `pause` works in your self-DM. Pausing stops the clone's new work at once and tries to stop the workers on it that are running; messages that arrive meanwhile wait until you **Resume**. To stop the clone's work already under way, pause. [Pause Misha](/operate/manage#pause) has the details.

## Ready {#ready}

Your clone now has:

- an icon and a voice that sound like you, Routines for work, and the notes a colleague would ask you for
- the people who may ask for work and the channels it watches, or neither yet
- the repositories, if you work in code
- a brake for when you need it

Next, [put Misha to work](/use/workflows) with one real request. To change any of this later, see [Control and maintain Misha](/operate/manage#scope).
