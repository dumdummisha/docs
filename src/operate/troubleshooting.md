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
- [Missed messages while the Mac slept](#mac-slept)
- [I'm paused](#paused)
- [Claude Code or OpenCode is signed out](#claude-signed-out)
- [Out of Claude or OpenCode usage](#claude-usage)
- [Something's wrong on my side](#something-wrong)
- [Slack's tab needs a reload](#slack-reload)
- [A program is missing, or Misha needs a restart](#program-missing)
- [A linked folder is unavailable](#linked-folder)
- [A connector needs you to sign in again](#integration-sign-in)
- [A tool isn't available](#tool-not-available)
- [A review you asked for is waiting for GPT](#gpt-review-waiting)
- [What I think with can't list models or refuses a choice](#model-choice)
- [Your settings changed since you loaded them](#settings-changed)
- [I couldn't set myself up in Claude Code or OpenCode](#install-refused)
- [Something waiting for your OK didn't go as approved](#approvals)
- [A post is Not confirmed or Didn't go out](#send-not-confirmed)
- [Pills and cards that need nothing from you](#nothing-to-do)
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

It worked when the Slack card leaves Home and a notification says "Misha hears Slack again", with how long the outage lasted.

Only messages the extension captured can reach Misha later. While no Slack tab was signed in as you, the browser was closed or a tab's capture was lost, the extension captured nothing, and Misha doesn't go back for those messages: it sees them only when it reads that conversation to answer something new there. When the extension kept capturing but couldn't hand messages over, or its storage was failing, it holds what it captured and hands it over once Misha hears it again, though a browser restart while its storage fails can lose some. The card can't tell you which messages were kept, so after an outage check Slack for requests that matter and ask again where the clone hasn't answered. Quitting Misha with the browser still open is different: the extension keeps up to 2,000 messages until Misha takes them in.

## Missed messages while the Mac slept {#mac-slept}

While the Mac sleeps, the browser captures nothing and the clone answers nothing, and Misha doesn't go back for those messages after it wakes. No card says so. Answer them yourself or ask again. To stay covered, see [Keep it running](/start/get-started#keep-it-running).

## "I'm paused." {#paused}

The clone answers only your self-DM commands, starts no workers and stops the ones it started. The window, the menu bar, `pause` in your self-DM and Misha's setup tool in Claude Code or OpenCode can all pause it. Click **Resume** on Home, or send `resume`. It worked when the paused card leaves Home: it shows "I'm listening in Slack." or the next problem in [the order above](#which-card). Requests queued before the pause continue now; messages that reached the clone while it was paused weren't kept, so ask again where one matters. If the card says a worker couldn't be stopped, see [Pause Misha](/operate/manage#pause).

## "I can't think: Claude Code is signed out." {#claude-signed-out}

The card names the runtime your clone uses, Claude Code or OpenCode, and this section reads the same for both. The clone runs on your own sign-in to it, and that sign-in on this Mac ended, so the clone can't answer. Click **Sign in to Claude** or **Sign in to OpenCode**, which opens Terminal with `claude auth login` or `opencode auth login`, and finish signing in there. On OpenCode, reconnect the provider of the model chosen on **Settings › What I think with**.

It worked when **Extensions › What I can't run without** shows your clone's runtime as **Signed in** and the card leaves Home. Nothing was lost: messages that arrived meanwhile waited and are answered once the clone can think again, after you resume if you paused it.

## "I'm out of Claude usage until..." {#claude-usage}

Your Claude plan's usage limit ran out, or on OpenCode your provider's, and the card shows when it resets. Misha still hears Slack, keeps what arrives, and tells you in your self-DM. It never switches runtime or model by itself. You can wait for the reset, or choose another working runtime on **Settings**, or send `use claude code` or `use opencode` in your self-DM; either starts a fresh conversation, and your settings commands still work while usage is limited. Changing only the model keeps that runtime's pause.

It worked when the reset time passes and the card leaves Home. The messages that waited are answered then, possibly hours after they were written, or after you resume if you paused Misha meanwhile.

## "Something's wrong on my side." {#something-wrong}

The card shows **Not running** and a plain error: Misha couldn't read its settings or its runtime failed. Click **Restart Misha**. It worked when the card shows any other state. If the same error comes back, Misha can't serve until its cause is fixed; [ask for help](#asking-for-help) with the error's wording.

## "Slack's tab needs a reload before I can use it." {#slack-reload}

Get started shows this while Misha sets itself up, when the Slack tab was opened before the Misha Browser extension could watch it. Click **Reload Slack**, which opens Slack again in the browser with the extension, wait for Slack to load, then click **Check again**. It worked when Let me hear Slack shows **Done**.

## A program is missing, or Misha needs a restart {#program-missing}

**Extensions › What I can't run without** marks what Misha can't run without (Claude Code, git, the browser extension with its helper, and Slack) as **Missing** when it isn't found. A program you added from the Catalogue, such as the GitHub CLI, shows **Not installed** under **Added by you**. Each card offers its next step, such as **Get Claude Code**, **Get the GitHub CLI**, **Show the extension** or **Install the helper**. The menu bar's **Programs** list says where Misha found each program, or where it looked.

After you install a program while Misha runs, its card says "I found it, but I started before it was installed. Restart me to use it." Click **Restart Misha**. It worked when the card shows its ready word, such as **Signed in** or **Found**. [What Extensions checks](/reference/settings#detection) lists every item.

## A linked folder is unavailable {#linked-folder}

Misha refuses to link a folder, or can't read one you linked, when a check fails, and its message names the check. Link the repository's real top-level folder by its full path, not a symlink, a subfolder or a shallow clone. Give its remote as `host/owner/name`, matching the fetch and push addresses of one of its git remotes, or leave the remote empty only if the repository has none. A folder that overlaps Misha's own data folder can't be linked. **Choose folder…** says what it found: "That folder isn't a git repository." (pick the repository's top-level folder), "It has no remote, so none." (fine for local work), or "The remote origin isn't host/owner/name. Write it yourself." (type the remote). If the folder moved, remove its old entry on **Settings › Repositories**, then add its new full path and remote; removing an entry leaves the folder itself alone. If a folder was replaced at the same path, correct the check the message names instead. If a worker can't reach the remote to start its worktree, restore that access and ask again; Misha doesn't start a worker from an older local branch instead. [Settings and commands](/reference/settings#linked-folders) lists the rules.

## A connector needs you to sign in again {#integration-sign-in}

Home's **Needs you** lists, for example, "Jira needs you to sign in again" with "I can't use Jira until you do.", and its card under **Extensions › Added by you** shows **Needs sign-in**. A connector you haven't added has no card: add it from the **Catalogue** first. Fill in any field on the card, such as Jira's site, then click its sign-in button, such as **Sign in to Jira**, or **Open Extensions** on Home's card. The sign-in happens in that service's own program or browser page, never in Misha.

Once the browser has opened, the page says so, for example "Opened Google's sign-in in your browser: approve it there." If it couldn't start, the card says why, such as "I couldn't open Jira's sign-in: it failed with ..."; try again, and if it keeps failing, [ask for help](#asking-for-help). Extensions checks again every 3 seconds for two minutes after a sign-in starts, and when you click **Check again**. It worked when the card shows **Works** and the item leaves Home. Requests that needed the service meanwhile may have been answered without it; ask again.

## A tool isn't available {#tool-not-available}

When the clone or a worker reports it doesn't have a tool while **Extensions** shows the service ready, signing in again won't help: the tool isn't offered to that agent. The connector may not be added in the **Catalogue**, the tool may not be served to workers or to that worker's profile, or it isn't among the clone's own tools. After you add a connector, restart an agent session that still lists its old tools; removing one refuses further calls even in a session that still lists them. **Browser control** serves your own agent sessions and workers you start there, never the Slack clone or the workers it starts. An expired sign-in shows on Home instead, as [above](#integration-sign-in).

## A review you asked for is waiting for GPT {#gpt-review-waiting}

A fresh setup requires no GPT review. If your request or your Routines ask for one, it needs OpenCode signed in to that model's provider, with usage left. When it isn't, the review waits, there's no Home card for the wait, and you learn of it from what the clone reports.

Add **GPT** from the **Catalogue** on Extensions, and check its card under **Added by you**: it shows **Signed in** once OpenCode is signed in to OpenAI. Sign in with **Sign in to OpenAI** if it says so, or wait for the reset the worker reports. Whether the waiting review then starts by itself isn't established, so if nothing moves once the model works again, ask the clone in the same thread to continue.

## What I think with can't list models or refuses a choice {#model-choice}

If the card can't list models, restore the runtime or the provider connection and click **Try again**. Choose a model and effort the list offers. A refused switch names what failed: the runtime or model may be unavailable, the effort may not be offered, a linked path may contain `*`, `?` or `\`, or the compaction limit may be too high. Correct what the message names and try again; Misha doesn't substitute another model.

## "Your settings changed since you loaded them. Nothing was saved." {#settings-changed}

A Slack command or the setup command changed your settings after the window loaded them, so your change was refused rather than applied to settings you hadn't seen. The window now shows the current settings and keeps what you typed: check them and save again. It worked when the save goes through without the message. [Revision conflicts](/reference/settings#revision-conflicts) explains why.

## "I couldn't set myself up in Claude Code or OpenCode" {#install-refused}

Each time Misha starts, it brings misha-core, its bundled extension, and the connectors you added into line in Claude Code and OpenCode: installed where they aren't yet, updated where they are, whatever their version. Adding or removing a connector does the same. Home and the menu bar show what failed in that start. The message's wording says which case you're in:

| The message says | What it means | What to do |
| --- | --- | --- |
| "misha-core ... was not installed and ... stays, because you changed the folder ..." | The update was refused because you replaced a folder of the installed version with a symlink or a file, and Misha doesn't write through your replacement. The installed version stays in place and recorded; Misha doesn't check that it still works with your replacement. | Move your own files out of the way, put the named folder back as a real folder, then quit and reopen Misha, which tries the update again as it starts. It worked when the message doesn't come back. |
| "...'s agents keep their earlier tools, because you changed ..." or "...'s agents were not re-rendered: ..." | misha-core installed or updated, but another Misha extension's agents weren't brought up to date with it. | Fix the file or folder the message names, then quit and reopen Misha, which tries again as it starts. If the message comes back, [ask for help](#asking-for-help) with its wording. |
| Anything else | The installer's own error, on a first install or an update. | Quit and reopen Misha, which tries again as it starts. If the message comes back, [ask for help](#asking-for-help) with its wording. |

## Something waiting for your OK didn't go as approved {#approvals}

A card under Home's **Waiting for your OK** says what happened to what you approved:

| The card says | What it means | What to do |
| --- | --- | --- |
| "What I'd send changed after I asked you, so you can't approve it as it is." | What would go out now isn't what the card showed when the clone asked. | **Decline** it, or **Ask for changes**. |
| "What I'd send changed after you approved it, so I didn't send it." | It changed between your **Approve** and the send, so nothing went out. | Ask the clone again if it still matters. |
| "Approved. It goes out when you resume me." | Misha is paused. | **Resume** when you want it sent. |
| "Approved. It goes out once Slack is back." | Misha can't hear Slack. | See [I can't hear Slack](#slack-unheard). |
| "Not everything went out." | Part of it was sent and part wasn't. | Check the conversation in Slack and say the rest yourself, then **Dismiss**. |
| "Approved, but it didn't start: ..." or "Approved, but I can't tell whether it started." | Approved work didn't start, or Misha can't tell. | Check **Working on now**; ask the clone again if the work isn't there, then **Dismiss**. |

## A post is Not confirmed or Didn't go out {#send-not-confirmed}

In Home's **Recently**, a post marked **Not confirmed** went out without a reply from Slack that proves it arrived, or Misha stopped while sending it. Misha never sends it again by itself. Open the conversation in Slack and look. If the message is there, it arrived, whatever the mark says; if not, say it yourself or ask the clone again. **Didn't go out** means Slack refused the post, or no Slack tab was signed in to send it, so nothing was posted. "Couldn't answer Emma Lee in #shop-backend" means the clone gave up on a message. In both cases, the person is still waiting for an answer.

## Pills and cards that need nothing from you {#nothing-to-do}

- **"... unlike your Slack"** on Home's status card names a kind of request Misha sends to Slack that isn't quite like the one your Slack page sends. It's nothing to worry about and you don't need to change anything; let whoever maintains Misha know. The pill stays until the extension restarts. **"... not checked yet"** pills show only while **Settings › For whoever maintains me › Show requests not checked yet** is on.
- **"My last cleanup left something in place"** in **Needs you** lists, under **What, and why**, paths Misha's cleanup didn't delete and why. It looks at them again at its next cleanup, and they don't stop the clone from answering.
- **Sleep setting** with the minutes, under **Pause Misha** on **Settings**, means the Mac is set to sleep and the clone is offline while it sleeps. If `caffeinate` or another app keeps the Mac awake, ignore it; otherwise change the sleep setting as [Keep it running](/start/get-started#keep-it-running) says.

## Asking for help {#asking-for-help}

There is no support desk or response-time promise. Contact goes through the invite on the [Dumdum Misha website](https://dumdummisha.ai), or **Book a call with Michal** on the same page. Describe the state in Misha's own words, the steps you took, and a made-up example that reproduces it. Don't paste Slack conversations, sign-in output, Misha's database or unedited screenshots, because they carry other people's messages and your accounts.
