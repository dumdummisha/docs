---
title: Troubleshooting
description: "What to do when Misha stops hearing Slack, Claude is signed out or out of usage, or something else goes wrong."
prev:
  text: Control and maintain Misha
  link: /operate/manage
next: false
---

# Troubleshooting

To stop replies or work right now, [pause Misha](/operate/manage#pause) first and diagnose afterwards.

Each heading is a problem as Misha words it, mostly on Home's status card, with what it means, the one thing to do, how you know it worked and what may have been missed.

- [I can't hear Slack](#slack-unheard)
- [I'm paused](#paused)
- [Claude Code is signed out](#claude-signed-out)
- [Out of Claude usage](#claude-usage)
- [Something's wrong on my side](#something-wrong)
- [A program is missing, or Misha needs a restart](#program-missing)
- [An integration needs you to sign in again](#integration-sign-in)
- [A tool isn't available](#tool-not-available)
- [A review is waiting for GPT](#gpt-review-waiting)
- [Your settings changed since you loaded them](#settings-changed)
- [I couldn't set myself up in Claude Code or OpenCode](#install-refused)
- [A post is Not confirmed or Didn't go out](#send-not-confirmed)
- [Asking for help](#asking-for-help)

## "I can't hear Slack." {#slack-unheard}

Home's card says **Not hearing Slack** and gives one of four reasons. Nothing anyone writes reaches the clone, so it answers nothing. Misha also shows a desktop notification, "Misha can't hear Slack", and, when it can still post, a notice in your self-DM. The card waits out a short grace period, so starting Misha or reloading Slack doesn't raise it.

| The card says | Do this |
| --- | --- |
| "No Slack tab is open and signed in to Shop..." | Click **Open Slack** (or **Open Slack in Chrome** or **in Brave**) and sign in. |
| "Slack is open, but I lost my hold on its tab..." | Open a fresh Slack tab, or reload the one you have. |
| "Your browser isn't running, or my extension in it isn't..." | Open Slack in the browser that has the Misha Browser extension. |
| "Slack in your browser is signed in as someone else, so I stopped rather than answer as them." | Sign in to Slack as yourself again. Misha serves one Slack account, chosen at setup, and won't answer as anyone else. |

<Shot id="slack-deaf" caption="Home when no Slack tab is signed in, offering to open Slack in either browser with the native host. Made-up example." />

It worked when the card goes back to "I'm listening in Slack." and a notification says "Misha hears Slack again", with how long the outage lasted. A fresh tab or a reload restores a capture the tab lost; it can't fix a change Slack made to its web app.

Messages written while Misha couldn't hear Slack were never captured, and Misha doesn't go back for them: it sees them only when it reads that conversation to answer something new there. That differs from quitting Misha with the browser still open, where the extension keeps up to 2,000 messages until Misha takes them in.

## "I'm paused." {#paused}

The clone answers only your self-DM commands, and its workers are stopped or stopping. The window, the menu bar, `pause` in your self-DM and Misha's setup tool in Claude Code or OpenCode can all pause it. Click **Resume** on Home, or send `resume`. It worked when the card says "I'm listening in Slack." Messages that arrived meanwhile waited and are answered now. If the card says a worker couldn't be stopped, see [Pause Misha](/operate/manage#pause).

## "I can't think: Claude Code is signed out." {#claude-signed-out}

The clone runs on your own Claude Code, and its sign-in on this Mac ended, so the clone can't answer. Click **Sign in to Claude**, which opens Terminal with `claude auth login`, and finish signing in there.

<Shot id="claude-signed-out" caption="Home after Claude Code signed out, with the button that opens Terminal to sign in. Made-up example." />

It worked when the card goes back to "I'm listening in Slack." Nothing was lost: messages that arrived meanwhile waited and are answered after you sign in.

## "I'm out of Claude usage until..." {#claude-usage}

Your Claude plan's usage limit ran out, and the card shows when it resets. There's nothing to do but wait: Misha still hears Slack, keeps what arrives, and tells you in your self-DM. It doesn't switch to another provider or model to keep answering.

<Shot id="claude-limit" caption="Home while the Claude plan's limit has run out, with the reset time. Made-up example." />

It worked when the reset time passes and the card goes back to "I'm listening in Slack." The messages that waited are answered then, possibly hours after they were written.

## "Something's wrong on my side." {#something-wrong}

The card shows **Not running** and a plain error: Misha couldn't read its settings or its runtime failed. Click **Restart Misha**. It worked when the card shows any other state. If the same error comes back, Misha can't serve until its cause is fixed; [ask for help](#asking-for-help) with the error's wording.

## A program is missing, or Misha needs a restart {#program-missing}

**Set up** marks what Misha can't run without, such as Claude Code, git, the browser extension or the native host, as **Missing** when it isn't found; an optional program shows **Not installed**. Each row offers its next step, such as **Get Claude Code**, **Get the GitHub CLI**, **Show the extension** or **Install the native host**. The menu bar's **Programs** list says where Misha found each program, or where it looked.

After you install a program while Misha runs, its row says "I found it, but I started before it was installed. Restart me to use it." Click **Restart Misha**. It worked when the row shows its ready word, such as **Signed in** or **Found**. [What Set up checks](/reference/settings#detection) lists every item.

## An integration needs you to sign in again {#integration-sign-in}

Home lists, for example, "Jira needs you to sign in again" with "I can't read or write your tickets until you do.", and its row on **Set up** shows **Needs sign-in**. This shows only for an integration whose **I use it** switch is on. Click the button beside it, such as **Sign in to Jira** or **Open Set up**; the sign-in happens in that service's own program or browser page, never in Misha.

Set up checks again every few seconds for two minutes after a sign-in starts, and when you click **Check again**. It worked when the row shows **Works** and the item leaves Home. Requests that needed the service meanwhile may have been answered without it; ask again.

## A tool isn't available {#tool-not-available}

When the clone or a worker reports it doesn't have a tool while **Set up** shows the service ready, signing in again won't help: the tool isn't offered to that agent. The integration's **I use it** switch may be off, the tool may come from a Misha extension that doesn't serve it to workers or grant it to that worker's profile, or it isn't among the clone's own tools. Turn the switch on if that's the cause; otherwise [Customise and reuse Misha](/reference/extensions) explains where an extension's tools run. An expired sign-in shows on Home instead, as [above](#integration-sign-in).

## A review is waiting for GPT {#gpt-review-waiting}

Misha's delivery procedure has GPT, through OpenCode, review each ticket it writes or rewrites and each pull request before merging. When GPT isn't available, because OpenCode isn't signed in to OpenAI or the account is out of usage, the review waits. Claude doesn't review instead, and there's no Home card for this wait, so you learn of it from what the clone reports. [Put Misha to work](/use/workflows) explains the requirement.

If OpenCode signed out, Home says "OpenCode needs you to sign in again"; sign in as [above](#integration-sign-in). If the OpenAI account is out of usage, wait for its reset. Whether the waiting review then starts by itself isn't established, so if nothing moves once GPT works again, ask the clone in the same thread to continue.

## "Your settings changed since you loaded them. Nothing was saved." {#settings-changed}

A Slack command or the setup command changed your settings after the window loaded them, so your change was refused rather than applied to settings you hadn't seen. The window now shows the current settings and keeps what you typed: check them and save again. It worked when the save goes through without the message. [Revision conflicts](/reference/settings#revision-conflicts) explains why.

## "I couldn't set myself up in Claude Code or OpenCode" {#install-refused}

Each time Misha starts, it installs or updates misha-core, its bundled extension, in Claude Code and OpenCode, and Home and the menu bar show what failed. When the message says an update was refused "because you changed" a folder of the installed version, you replaced that folder with a symlink or a file. Misha doesn't write through your replacement, so the earlier version stays installed and keeps working. Any other message is the installer's own error.

To take the new version, move your own files out of the way and put the folder named in the message back as a real folder, then quit and reopen Misha, which tries again as it starts. It worked when the message no longer shows. Until then, Claude Code or OpenCode keeps the earlier misha-core.

## A post is Not confirmed or Didn't go out {#send-not-confirmed}

In Home's **Recently**, a post marked **Not confirmed** went out without a reply from Slack that proves it arrived, or Misha stopped while sending it. Misha never sends it again by itself. Open the conversation in Slack and look. If the message is there, it arrived, whatever the mark says; if not, say it yourself or ask the clone again. **Didn't go out** means Slack refused the post, or no Slack tab was signed in to send it, so nothing was posted. "Couldn't answer Priya Nair in #shop-backend" means the clone gave up on a message. In both cases, the person is still waiting for an answer.

## Asking for help {#asking-for-help}

There is no support desk or response-time promise. Contact goes through the invite on the [Dumdum Misha website](https://dumdummisha.ai). Describe the state in Misha's own words, the steps you took, and a made-up example that reproduces it. Don't paste Slack conversations, sign-in output, Misha's database or unedited screenshots, because they carry other people's messages and your accounts.
