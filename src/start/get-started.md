---
title: Get started
description: "Who can get Misha today, what setting it up involves and what happens when you first save its settings."
prev:
  text: Decide whether to try it
  link: /start/decide
next:
  text: Make it yours
  link: /use/make-it-yours
---

# Get started

You can't install Misha yet. Since 19 November 2026 one owner has run an unsigned local build. There is no public download, no Chrome Web Store listing for the browser extension and no invite keys. To ask for access, use the invite on the [Dumdum Misha website](https://dumdummisha.ai). This page describes setup as the Misha window walks through it today, so you know what it takes and what happens when your clone goes live.

## What isn't available yet {#availability}

A signed download, its first launch and the store listing will be described here once they exist. Until then, the steps below begin with Misha already running on a Mac.

## What you need {#requirements}

- A Mac with Chrome or Brave, and Slack open and signed in there.
- Claude Code, signed in with your own Claude subscription.
- git, and the GitHub CLI if your clone should read code.
- Optional: OpenCode signed in to OpenAI, so GPT can review tickets and pull requests, and the services your tasks need. [Put Misha to work](/use/workflows#review-requirements) explains why delivery waits without GPT.

There's no Misha fee in the invite-only pilot. You pay for your own Claude, and OpenAI if you add it ([Decide whether to try it](/start/decide)). Misha's **Set up** page checks each item and offers the one action that fixes it:

<!-- facts detection -->

<Shot id="setup" caption="Set up with three things to do: Google and Figma aren't signed in, and this Mac sleeps after 10 idle minutes. Made-up example." />

## What setup changes on your Mac {#before-you-install}

Each time Misha starts, it installs misha-core, its bundled Misha extension, into Claude Code and OpenCode wherever it finds them: skills, commands, agent profiles and Misha's tools. When a file is already where it writes, Misha first moves it into <code><Fact name="desktop.paths.paths.overwritten.path" /></code>, which keeps the newest <Fact name="desktop.retention.overwrittenBatches.kept" /> batches. Nothing puts those files back for you. The browser part adds the Misha Browser extension and the native host, a small program that connects the extension to Misha on this Mac; [Browser permissions](/reference/permissions) explains what each can do.

There is no uninstall yet. [Remove Misha](/operate/manage#remove) says what is safe to remove today and what has to stay.

## The setup sequence {#setup}

The first time Misha opens, its window shows **Get started**, a checklist that ticks itself from what it finds on your Mac. Only two steps ask you for anything: your clone's face and your code.

<Shot id="first-run" caption="Get started with Claude Code and Slack done, and the face and the code still to do. Made-up example." />

### Sign in to Claude Code and Slack {#sign-in}

**Give me consciousness** ticks once Claude Code is on the Mac and signed in. Its button is **Get Claude Code** or **Sign in to Claude**, which opens Terminal to sign in.

**Let me hear Slack** ticks once the browser extension runs and a Slack tab is signed in. The extension is loaded unpacked for now: **Show the extension** shows its folder in Finder, and on your browser's extensions page you turn on Developer mode, choose **Load unpacked** and pick that folder. **Install the native host** on **Set up** runs the native host's installer in Terminal. Then open Slack in Chrome or Brave.

### Before you save: find the brake {#before-you-save}

::: warning Saving starts live replies
<!--@include: ../_includes/first-control.md-->
:::

The Get started screen has no Pause button of its own. Pause appears once the face below is saved.

### Give your clone a face {#face}

**Give me a face** saves your first settings:

- **The Slack account.** With several accounts signed in, Misha asks which one it answers as. That choice is for good: Misha serves one Slack account, and no control changes it after this save.
- **The icon**, the emoji every one of its posts starts with, followed by the text in italics. It's required and starts as `:misha:`. Writing it in a message also calls the clone.
- **How it sounds**, optional, in up to <Fact name="desktop.settings.fields.personality.limits.maxCharacters" /> characters. Left empty, the clone is plain, short and polite.

**Save and start** saves your choices, and **Keep the defaults** saves `:misha:` with no tone. Either one makes the clone live at once. [Make it yours](/use/make-it-yours#voice-and-marker) is where you refine both.

### Show it your code {#code}

**Show me your code** signs in the GitHub CLI and adds a repository as `owner/name`, which the clone keeps its own read-only copy of. Until a repository is added, the window keeps opening on Get started instead of Home, but the clone already answers. If your work isn't code, there's no need to add one just to finish the list.

The optional groups under it, **So I have context** and **So I stay up**, can wait: the first is covered in [Make it yours](/use/make-it-yours#connect-for-a-task), the second [below](#keep-it-running).

### Or use the setup command {#setup-command}

The same setup runs in Claude Code or OpenCode, and the Misha menu in the menu bar has an item that copies the command for each one it found:

<!-- facts setup-commands -->

OpenCode can run setup, but the clone still answers on Claude Code.

## Check your first reply {#first-reply}

Once saved, the face step says "Saved. Say hi in your self-DM, and I answer there." Write to yourself and the clone answers, starting with your icon.

This isn't a trial confined to your self-DM. From the save on, the clone answers DMs to you, mentions of you and threads you're in, in the Slack workspace it answers in. An empty **Who may ask me for work** means only you can start workers, and an empty **Channels I watch** means it reads no channel in full. Neither stops those ordinary replies. If nothing answers, see [Troubleshooting](/operate/troubleshooting).

## Keep it running {#keep-it-running}

- **The Mac stays awake.** The clone is offline while the Mac sleeps. Set up shows when it sleeps, but Misha changes no system setting, so change it in System Settings.
- **Open at login** is a switch on Set up, so Misha starts when you log in.
- **The browser stays open with Slack signed in.** Without a signed-in Slack tab, nothing reaches the clone. If Slack is signed in as someone else, Misha stops rather than answer as them.
- **Closing the window doesn't stop Misha.** It keeps answering from the menu bar. Quitting stops the clone but not its workers ([pause, close or quit](/operate/manage#pause-close-quit)).

## Next: make it yours {#next}

Your clone now answers with a default voice and no working context. [Make it yours](/use/make-it-yours) sets its voice, notes, who may ask it for work, which channels it watches and the services your first task needs.
