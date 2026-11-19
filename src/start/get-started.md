---
title: Get started
description: "Who can get Misha today, what setting it up involves and what happens when you first save its settings."
prev:
  text: Try it
  link: /start/try
next:
  text: Make it yours
  link: /use/make-it-yours
---

# Get started

Misha is in an invite-only pilot. There is no public download, Chrome Web Store listing or invite key yet, so the steps below begin with Misha already running on a Mac.

## What you need {#requirements}

- A Mac with a Chromium browser (Chrome or Brave).
- Claude Code, signed in with your own Claude subscription.
- git, and the GitHub CLI if your clone should read code.
- Your Slack workspace, signed in in that browser (adapters for Microsoft Teams and Discord are in progress).
- Optional but recommended: OpenCode signed in to OpenAI, so GPT can review tickets and pull requests, and the services your tasks need. [Put Misha to work](/use/workflows#review-requirements) explains why delivery waits without GPT.

## The setup sequence {#setup}

The first time Misha opens, its window shows **Get started**, a checklist that ticks itself from what it finds on your Mac. Four steps take you from signing in to a first reply:

<ol class="steps">
  <li class="step">
    <div class="step__body">
      <p class="step__title">Give me consciousness</p>
      <p class="step__line">Claude Code is on the Mac and signed in.</p>
    </div>
    <div class="step__visual" aria-hidden="true"><span class="mini-control mini-control--button">Sign in to Claude</span></div>
  </li>
  <li class="step">
    <div class="step__body">
      <p class="step__title">Let me hear Slack</p>
      <p class="step__line">Load the extension, install the native host and open Slack in your browser.</p>
    </div>
    <div class="step__visual" aria-hidden="true"><span class="mini-control mini-control--button">Load unpacked</span></div>
  </li>
  <li class="step">
    <div class="step__body">
      <p class="step__title">Give me a face</p>
      <p class="step__line">Click <strong>Keep the defaults</strong>, or pick your own icon and tone first. Saving makes the clone live.</p>
    </div>
    <div class="step__visual" aria-hidden="true"><span class="mini-control mini-control--button">Keep the defaults</span></div>
  </li>
  <li class="step">
    <div class="step__body">
      <p class="step__title"><a href="#first-reply">Say hi</a></p>
      <p class="step__line">Write to yourself in Slack and the clone answers there. It answers your colleagues too from the moment you save.</p>
    </div>
    <div class="step__visual" aria-hidden="true"><span class="mini-control mini-control--message"><strong>Leo Novak</strong> hi</span></div>
  </li>
</ol>

The checklist also offers **Show me your code**, which adds a repository the clone can read. It's optional: the clone answers without one. To pause the clone, see [Pause Misha](/operate/manage#pause).

## Check your first reply {#first-reply}

Once saved, the face step says "Saved. Say hi in your self-DM, and I answer there." Write to yourself and the clone answers, starting with your icon.

This isn't a trial confined to your self-DM. From the save on, the clone answers DMs to you, mentions of you and threads you're in, in the Slack workspace it answers in. An empty **Who may ask me for work** means only you can start workers, and an empty **Channels I watch** means it reads no channel in full. Neither stops those ordinary replies. If nothing answers, see [Troubleshooting](/operate/troubleshooting).

## Keep it running {#keep-it-running}

- **The Mac stays awake.** The clone is offline while the Mac sleeps. Set up shows when it sleeps, but Misha changes no system setting: change it in System Settings, or run `caffeinate -d` in Terminal, which keeps the display, and with it the Mac, awake for as long as it runs. Closing a laptop's lid still puts it to sleep.
- **Open at login** is a switch on Set up, so Misha starts when you log in.
- **The browser stays open with Slack signed in.** Without a signed-in Slack tab, nothing reaches the clone. If Slack is signed in as someone else, Misha stops rather than answer as them.
- **Closing the window doesn't stop Misha.** It keeps answering from the menu bar. Quitting stops the clone but not its workers ([pause, close or quit](/operate/manage#pause-close-quit)).

## What setup changes on your Mac {#before-you-install}

Each time Misha starts, it installs misha-core, its bundled Misha extension, into Claude Code and OpenCode wherever it finds them: skills, commands, agent profiles and Misha's tools. When a file is already where it writes, Misha first moves it into <code><Fact name="desktop.paths.paths.overwritten.path" /></code>, which keeps the newest <Fact name="desktop.retention.overwrittenBatches.kept" /> batches. Nothing puts those files back for you. The browser part adds the Misha Browser extension and the native host, a small program that connects the extension to Misha on this Mac; [Browser permissions](/reference/permissions) explains what each can do.

There is no uninstall yet. [Remove Misha](/operate/manage#remove) says what is safe to remove today and what has to stay.

## Next: make it yours {#next}

Your clone now answers with a default voice and no working context. [Make it yours](/use/make-it-yours) sets its voice, notes, who may ask it for work, which channels it watches and the services your first task needs.
