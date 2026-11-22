---
title: Troubleshooting
description: "What to do when Misha stops hearing Slack, Claude Code or OpenCode is signed out or out of usage, or something else goes wrong."
prev:
  text: Control and maintain Misha
  link: /operate/manage
next: false
---

# Troubleshooting

To stop replies or work right now, [pause Misha](/operate/manage#pause) first and diagnose afterwards.

Each heading is a problem as Misha words it, mostly on Home's status card, with what it means, the one thing to do, how you know it worked and what may have been missed.

- [Which card Home shows](#which-card)
- [I can't hear Slack](#slack-unheard)
- [I'm paused](#paused)
- [Claude Code or OpenCode is signed out](#claude-signed-out)
- [Out of Claude or OpenCode usage](#claude-usage)
- [Something's wrong on my side](#something-wrong)
- [A program is missing, or Misha needs a restart](#program-missing)
- [A linked folder is unavailable](#linked-folder)
- [A connector needs you to sign in again](#integration-sign-in)
- [A tool isn't available](#tool-not-available)
- [A review you asked for is waiting for GPT](#gpt-review-waiting)
- [What I think with can't list models or refuses a choice](#model-choice)
- [Your settings changed since you loaded them](#settings-changed)
- [I couldn't set myself up in Claude Code or OpenCode](#install-refused)
- [A post is Not confirmed or Didn't go out](#send-not-confirmed)
- [Asking for help](#asking-for-help)

## Which card Home shows {#which-card}

Home shows one status card at a time, the first that applies in this order: "Something's wrong on my side.", "I can't hear Slack.", "I'm paused.", "I can't think: Claude Code is signed out." and "I'm out of Claude usage until...", the last two naming OpenCode when that is the runtime your clone uses. Fixing one problem can uncover the next. A pause you set stays until you resume it: signing in again, getting Slack back or waiting out a usage limit doesn't resume Misha. "I'm listening in Slack." comes back only once none of these is left.

## "I can't hear Slack." {#slack-unheard}

Home's card says **Not hearing Slack** and gives one of four reasons. While it shows, the clone answers nothing. Misha also shows a desktop notification, "Misha can't hear Slack", and, when it can still post, a notice in your self-DM. The card waits out a short grace period, so starting Misha or reloading Slack doesn't raise it.

| The card says | Do this |
| --- | --- |
| "No Slack tab is open and signed in to Shop..." | Click **Open Slack** (or **Open Slack in Chrome** or **in Brave**) and sign in. |
| "Slack is open, but I lost my hold on its tab..." | Open a fresh Slack tab, or reload the one you have. The same words show when the extension's own storage is failing, so if the card stays, [ask for help](#asking-for-help). |
| "Your browser isn't running, or my extension in it isn't..." | Open Slack in the browser that has the Misha Browser extension. |
| "Slack in your browser is signed in as someone else, so I stopped rather than answer as them." | Sign in to Slack as yourself again. Misha serves one Slack account, chosen at setup, and won't answer as anyone else. |

<Shot id="slack-deaf" caption="Home when no Slack tab is signed in, offering to open Slack in either browser with the native host. Made-up example." />

It worked when the Slack card leaves Home and a notification says "Misha hears Slack again", with how long the outage lasted.

Only messages the extension captured can reach Misha later. While no Slack tab was signed in as you, the browser was closed or a tab's capture was lost, the extension captured nothing, and Misha doesn't go back for those messages: it sees them only when it reads that conversation to answer something new there. When the extension kept capturing but couldn't hand messages over, or its storage was failing, it holds what it captured and hands it over once Misha hears it again, though a browser restart while its storage fails can lose some. The card can't tell you which messages were kept, so after an outage check Slack for requests that matter and ask again where the clone hasn't answered. Quitting Misha with the browser still open is different: the extension keeps up to 2,000 messages until Misha takes them in.

## "I'm paused." {#paused}

The clone answers only your self-DM commands, starts no workers and tries to stop the ones running. The window, the menu bar, `pause` in your self-DM and Misha's setup tool in Claude Code or OpenCode can all pause it. Click **Resume** on Home, or send `resume`. It worked when the paused card leaves Home: it shows "I'm listening in Slack." or the next problem in [the order above](#which-card). Messages that arrived meanwhile waited and are answered now. If the card says a worker couldn't be stopped, see [Pause Misha](/operate/manage#pause).

## "I can't think: Claude Code is signed out." {#claude-signed-out}

The card names the runtime your clone uses, Claude Code or OpenCode, and this section reads the same for both. The clone runs on your own sign-in to it, and that sign-in on this Mac ended, so the clone can't answer. Click **Sign in to Claude** or **Sign in to OpenCode**, which opens Terminal with `claude auth login` or `opencode auth login`, and finish signing in there. On OpenCode, reconnect the provider of the model chosen on **Settings › What I think with**.

<Shot id="claude-signed-out" caption="Home after Claude Code signed out, with the button that opens Terminal to sign in. Made-up example." />

It worked when **Set up** shows your clone's runtime as **Signed in** and the card leaves Home. Nothing was lost: messages that arrived meanwhile waited and are answered once the clone can think again, after you resume if you paused it.

## "I'm out of Claude usage until..." {#claude-usage}

Your Claude plan's usage limit ran out, or on OpenCode your provider's, and the card shows when it resets. Misha still hears Slack, keeps what arrives, and tells you in your self-DM. It never switches runtime or model by itself. You can wait for the reset, or choose another working runtime on **Settings**, or send <code><Fact name="desktop.commands.commands.use-claude-code.example" /></code> or <code><Fact name="desktop.commands.commands.use-opencode.example" /></code> in your self-DM; either starts a fresh conversation, and your settings commands still work while usage is limited. Changing only the model keeps that runtime's pause.

<Shot id="claude-limit" caption="Home while the Claude plan's limit has run out, with the reset time. Made-up example." />

It worked when the reset time passes and the card leaves Home. The messages that waited are answered then, possibly hours after they were written, or after you resume if you paused Misha meanwhile.

## "Something's wrong on my side." {#something-wrong}

The card shows **Not running** and a plain error: Misha couldn't read its settings or its runtime failed. Click **Restart Misha**. It worked when the card shows any other state. If the same error comes back, Misha can't serve until its cause is fixed; [ask for help](#asking-for-help) with the error's wording.

## A program is missing, or Misha needs a restart {#program-missing}

**Set up** marks what Misha can't run without, such as Claude Code, git, the browser extension or the native host, as **Missing** when it isn't found; an optional program shows **Not installed**. Each row offers its next step, such as **Get Claude Code**, **Get the GitHub CLI**, **Show the extension** or **Install the native host**. The menu bar's **Programs** list says where Misha found each program, or where it looked.

After you install a program while Misha runs, its row says "I found it, but I started before it was installed. Restart me to use it." Click **Restart Misha**. It worked when the row shows its ready word, such as **Signed in** or **Found**. [What Set up checks](/reference/settings#detection) lists every item.

## A linked folder is unavailable {#linked-folder}

Misha refuses to link a folder, or can't read one you linked, when a check fails, and its message names the check. Link the repository's real top-level folder by its full path, not a symlink, a subfolder or a shallow clone. Give its remote as `host/owner/name`, matching the fetch and push addresses of one of its git remotes, or leave the remote empty only if the repository has none. A folder that overlaps Misha's own data folder can't be linked. If you moved or replaced a folder, link its new location. If a worker can't reach the remote to start its worktree, restore that access and ask again; Misha doesn't start a worker from an older local branch instead. [Settings and commands](/reference/settings#linked-folders) lists the rules.

## A connector needs you to sign in again {#integration-sign-in}

Home lists, for example, "Jira needs you to sign in again" with "I can't use Jira until you do.", and its row on **Set up** shows **Needs sign-in**. This shows only for a connector whose **I use it** switch is on; if the row says **Off**, turn that on first, because a connector offers its sign-in only while it is on. Fill in any fields beside its sign-in button, then click the button, such as **Sign in to Jira** or **Open Set up**; the sign-in happens in that service's own program or browser page, never in Misha.

Set up checks again every few seconds for two minutes after a sign-in starts, and when you click **Check again**. It worked when the row shows its ready word, **Signed in** for OpenCode and GitHub or **Works** for a connector, and the item leaves Home. OpenCode and GitHub are built-in rows, not connector switches. Requests that needed the service meanwhile may have been answered without it; ask again.

## A tool isn't available {#tool-not-available}

When the clone or a worker reports it doesn't have a tool while **Set up** shows the service ready, signing in again won't help: the tool isn't offered to that agent. The connector's **I use it** switch may be off, the tool may come from a Misha extension that doesn't serve it to workers or grant it to that worker's profile, or it isn't among the clone's own tools. After you turn a connector on, restart an agent session that still lists its old tools; turning one off refuses further calls even in a session that still lists them. **Browser control** serves your own agent sessions and workers you start there with a profile that grants its tools, never the Slack clone or the workers it starts, even with its switch on. For other missing tools, [Customise and reuse Misha](/reference/extensions) explains where an extension's tools run. An expired sign-in shows on Home instead, as [above](#integration-sign-in).

## A review you asked for is waiting for GPT {#gpt-review-waiting}

A fresh setup requires no GPT review. If your request or your Routines ask for one, it needs OpenCode signed in to that model's provider, with usage left. When it isn't, the review waits, there's no Home card for the wait, and you learn of it from what the clone reports.

Check OpenCode on **Set up**, sign in again if it says so, or wait for the reset the worker reports. Whether the waiting review then starts by itself isn't established, so if nothing moves once the model works again, ask the clone in the same thread to continue.

## What I think with can't list models or refuses a choice {#model-choice}

If the card can't list models, restore the runtime or the provider connection and click **Try again**. Choose a model and effort the list offers. A refused switch to OpenCode names its cause: a linked folder whose path holds `*`, `?` or `\`, or a compaction limit at or above the selected model's input limit. Correct the setting it names and try again; Misha doesn't substitute another model.

## "Your settings changed since you loaded them. Nothing was saved." {#settings-changed}

A Slack command or the setup command changed your settings after the window loaded them, so your change was refused rather than applied to settings you hadn't seen. The window now shows the current settings and keeps what you typed: check them and save again. It worked when the save goes through without the message. [Revision conflicts](/reference/settings#revision-conflicts) explains why.

## "I couldn't set myself up in Claude Code or OpenCode" {#install-refused}

Each time Misha starts, it brings misha-core, its bundled extension, and the connectors into line with your switches in Claude Code and OpenCode: installed where they aren't yet, updated where they are, whatever their version. Changing a connector switch does the same. Home and the menu bar show what failed in that start. The message's wording says which case you're in:

| The message says | What it means | What to do |
| --- | --- | --- |
| "misha-core ... was not installed and ... stays, because you changed the folder ..." | The update was refused because you replaced a folder of the installed version with a symlink or a file, and Misha doesn't write through your replacement. The installed version stays in place and recorded; Misha doesn't check that it still works with your replacement. | Move your own files out of the way, put the named folder back as a real folder, then quit and reopen Misha, which tries the update again as it starts. It worked when the message doesn't come back. |
| "...'s agents keep their earlier tools, because you changed ..." or "...'s agents were not re-rendered: ..." | misha-core installed or updated, but another Misha extension's agents weren't brought up to date with it. | Fix the file or folder the message names, then quit and reopen Misha, which tries again as it starts. If the message comes back, [ask for help](#asking-for-help) with its wording. |
| Anything else | The installer's own error, on a first install or an update. | Quit and reopen Misha, which tries again as it starts. If the message comes back, [ask for help](#asking-for-help) with its wording. |

## A post is Not confirmed or Didn't go out {#send-not-confirmed}

In Home's **Recently**, a post marked **Not confirmed** went out without a reply from Slack that proves it arrived, or Misha stopped while sending it. Misha never sends it again by itself. Open the conversation in Slack and look. If the message is there, it arrived, whatever the mark says; if not, say it yourself or ask the clone again. **Didn't go out** means Slack refused the post, or no Slack tab was signed in to send it, so nothing was posted. "Couldn't answer Emma Lee in #shop-backend" means the clone gave up on a message. In both cases, the person is still waiting for an answer.

## Asking for help {#asking-for-help}

There is no support desk or response-time promise. Contact goes through the invite on the [Dumdum Misha website](https://dumdummisha.ai). Describe the state in Misha's own words, the steps you took, and a made-up example that reproduces it. Don't paste Slack conversations, sign-in output, Misha's database or unedited screenshots, because they carry other people's messages and your accounts.
