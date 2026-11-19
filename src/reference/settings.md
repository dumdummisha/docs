---
title: Settings and commands
description: "Every Misha setting and Slack command: who can use it, where, and when a change takes effect."
prev: false
next: false
---

# Settings and commands

Most settings are in the Misha window, on **Settings**, with integrations on **Set up**. Some also have an exact Slack command that you type in your self-DM (your direct message to yourself in Slack), and colleagues have two commands of their own. To choose settings the first time, follow [Make it yours](/use/make-it-yours). The tables come from the desktop app's reviewed export, for the version named in the footer.

## Common changes {#recipes}

Each row names the control in the Misha window, where the sidebar is the window's left column with its pages and Pause, then the Slack command with who sends it and where, then the setup tool that the [setup command](#setup-command) uses when you ask for the change in plain words.

<!-- facts surfaces pause resume allow disallow set-merging forget hands-off soft-ignore-me -->

**None** in the Slack column means no command exists: typing "stop allowing Priya" in your self-DM is ordinary conversation and changes nothing. [Control and maintain Misha](/operate/manage) explains what Pause stops and what it can't.

## Slack commands {#commands}

<!-- facts command-terms -->

A command counts only when the right person typed it in the right place. Posts by the clone, its workers, other clones, bots and apps never count, and the same words anywhere else are conversation for the clone to answer.

### Your commands {#owner-commands}

<!-- facts commands owner -->

While Misha is paused it still takes your self-DM commands. A `hands off` sent elsewhere waits until you resume.

### Your colleagues' commands {#colleague-commands}

<!-- facts commands colleague -->

These work only in a one-to-one DM with you, never in a group DM or channel. Someone you ignore, rather than soft-ignore, can't send `stop ignoring me`, because their messages no longer reach the clone: only you can lift it. Neither command deletes anything or stops Misha seeing their messages; [Talking with a clone](/understand/slack) explains this to colleagues.

## Every setting and where to change it {#settings}

### What each setting holds {#fields}

<!-- facts settings -->

An empty **Limits** cell means the export lists no limit. `compactAtTokens` takes a positive whole number of tokens, or nothing for the default, and the window refuses anything else. No control changes `account` after the first save, and `sessionEpoch` moves only with start fresh.

### Where each change is made {#surfaces}

Every change, in the columns [Common changes](#recipes) explains. The window and the setup tool are you at your own Mac. For what workers do with these permissions, see [Put Misha to work](/use/workflows).

<!-- facts surfaces -->

## When a change takes effect {#when-changes-apply}

The icon, ignore, soft-ignore, watch and hands off decide which new Slack messages reach the clone from the moment they are saved. Watching doesn't reach back to earlier messages in the channel, while ignore, soft-ignore and hands off also drop what already waits, as their rows say.

The rest reaches the clone on its next turn. A change to what it is told about you (personality, notes, who it ignores, who may ask for work, watched channels, where workers merge, start fresh) also drops an answer it was writing, and the message is answered again under the new settings.

No change reaches into work already started. After **Stop allowing**, the clone's next turns can't start workers for that person, including a turn that handles a report on their earlier work. A turn already running when you save keeps the permissions it started with and may still start a worker, and a running worker keeps running. **May merge** is an instruction, not a lock: Misha tells the clone where merging is allowed on each turn, the clone passes it on when it briefs a worker, and nothing in the app blocks a merge. A worker briefed before you turned merging off isn't told again. To stop new work at once, [pause Misha](/operate/manage): no worker starts while Misha is paused, and it tries to stop the running ones.

## Revision conflicts {#revision-conflicts}

The window and the setup tool make each change against the settings they last loaded. If a Slack command or the setup tool changed them in between, the change is refused and nothing is saved. The window says so, shows the current settings and keeps what you typed. This stops a change acting on something you didn't see, such as forgetting note 3 after an earlier note went and the rest moved up. Slack commands apply to the settings as they are when Misha handles them.

## Notes, history and starting fresh {#notes-history-start-fresh}

Notes are settings: your exact words, numbered, given to the clone as standing context. **Remember** or `remember` adds one; only **Forget** in the window, or the setup tool, removes one.

History is the clone's one Claude Code session. Every conversation shares it, rather than each conversation or thread having its own, so the session remembers them all. Claude Code keeps its transcript on your Mac. At `compactAtTokens` the session is compacted and the clone is given your settings again. For each conversation and thread, Misha records the session it answers in and how far the clone has read there. When cleanup removes that record, the clone next reads the latest messages there again, and the session and its transcript stay:

<!-- facts retention sessions -->

Start fresh replaces the shared session for every conversation at once. It keeps your settings, notes and the old transcript, so it deletes no history. [Privacy and security](/privacy) covers what is stored where.

## Hands off {#hands-off}

`hands off` applies to one conversation and thread, as its row says: there is no channel-wide or DM-wide version. It isn't a setting, so neither the window nor the `settings` answer lists it. It ends with `hands on` in the same place, or when Misha's regular cleanup removes it:

<!-- facts retention hands-off -->

## Setup command {#setup-command}

<!-- facts setup-commands -->

It walks you through setup and can make any change with a setup tool [above](#surfaces). OpenCode can run it, but the clone always answers on Claude Code.

## What Set up checks {#detection}

<!-- facts detection -->

Set up also shows **So I stay up**: **Open at login**, a switch, and **Sleep**, which shows when this Mac sleeps and changes nothing. Neither is a checked item. When an item isn't ready, see [Troubleshooting](/operate/troubleshooting).
