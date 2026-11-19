---
title: Control and maintain Misha
description: "Pause Misha, change what it may do, check what it has done, and update or remove it."
prev: false
next:
  text: Troubleshooting
  link: /operate/troubleshooting
---

# Control and maintain Misha

Pause is the brake: the clone stops answering and its workers stop, while Slack messages keep arriving and wait for you to resume. Below are pausing, changing what Misha may do, reading what it did, and what is known today about updating and removing it. For a problem Misha shows you, see [Troubleshooting](/operate/troubleshooting).

## Pause Misha {#pause}

The window's sidebar, the menu bar's Misha menu (**Pause Misha**, **Resume Misha**) and your self-DM all set the same pause:

<!-- facts surfaces pause resume -->

While Misha is paused:

- The answer being written is cancelled. The clone answers only your self-DM commands, such as `settings` and `resume`, and posts nothing else in Slack; a worker's post is refused.
- No worker starts, and Misha stops every worker it started that still runs, including the workers those started.
- Messages from Slack keep arriving and wait, with no age limit, so after a long pause the clone may answer requests that are days old.
- The pause survives quitting: Misha starts paused and stops any of its workers still running.

Home shows how the stop is going:

| Home says | What it means | What to do |
| --- | --- | --- |
| "I'm stopping my workers, start no new ones..." | They show under **Working on now** until they stop. | Wait. |
| "...but I stopped my workers..." | Every worker Misha started has stopped. | Nothing. |
| "I couldn't stop one of my workers (...)" | Misha couldn't verify the process as its worker, so it didn't signal it. The card and a desktop notification name the run. | Quit that Claude Code or OpenCode process yourself, for example in Activity Monitor. |
| "I couldn't stop my workers, so they may still run; my log says why." | The stop itself failed. | Treat every running worker as unstopped. |

<Shot id="paused" caption="Paused, with the workers stopped and Resume on the card. Made-up example." />

<Shot id="workers-stopping" caption="A moment after pausing: two workers are still listed while Misha stops them. Made-up example." />

<Shot id="worker-unstopped" caption="A worker Misha couldn't stop, named on Home for you to stop by hand. Made-up example." />

Pause can't reach what has left your Mac. A posted message, a merged pull request, an edited ticket or a dev deploy stays as it is, and a build or CI run a worker started may still finish. To correct something in public, write there yourself.

### Pause, close, quit or disconnect {#pause-close-quit}

| You | The clone | Workers | Slack messages |
| --- | --- | --- | --- |
| Pause | Answers only your self-DM commands | Stopped; none start | Taken in; they wait |
| Close the window | Keeps answering: Misha stays in the menu bar | Keep running | Taken in as usual |
| Quit Misha | Stops | Keep running: they are separate processes | Not taken in. While the browser runs, the extension queues up to 2,000 until Misha takes them in again |
| Close Slack or the browser | Hears nothing and answers nothing | Keep running; their Slack posts fail | Not captured; see [Troubleshooting](/operate/troubleshooting#slack-unheard) |

To stop work, pause and wait for Home to say the workers stopped. Quit after that, not instead.

## Change what Misha may do {#scope}

**Who may ask me for work**, **Channels I watch**, **Who I ignore** and **Repositories** with **May merge** are on **Settings**; integrations are the **I use it** switches on **Set up**. [Make it yours](/use/make-it-yours) walks through them and [Settings and commands](/reference/settings) lists every surface.

A change applies to what comes next, never to work already started: after **Stop allowing**, a worker already running for that person keeps running, and **May merge** is an instruction the clone passes on, not a lock ([when a change takes effect](/reference/settings#when-changes-apply)). To halt work under way, pause.

## See what Misha has done {#activity}

Home's **Working on now** lists each answer being written and each worker, with who asked, where and for how long. **Recently** lists, newest first, what Misha posted, edited, shared and reacted to in Slack, and what it decided without posting, such as "Let a message in #shop-backend be."

<Shot id="home" caption="Home with an answer and two workers under way, and Recently below. Made-up example." />

A post Slack hasn't confirmed carries a pill: **Sending**, **Not confirmed** when Misha can't tell whether it arrived, or **Didn't go out** ([what to do](/operate/troubleshooting#send-not-confirmed)). Recently comes from two records in Misha's database:

<!-- facts retention outcomes ledger -->

The post record covers Slack only. Commands, pushes and ticket edits aren't in it: check those in GitHub, Jira and the other services, and in the workers' logs in <code><Fact name="desktop.paths.paths.8.path" /></code>. It is a provenance record in a local database you can change, not a tamper-proof audit log. [Privacy and security](/privacy) covers what is stored where.

## Updates {#updates}

Today there is one unsigned local build, run by its owner since 19 November 2026: no public download, no signed build and no updater, so automatic updates, pinning a version and rollback aren't supported yet. The browser extension is loaded unpacked, with no Chrome Web Store listing, so the browser doesn't update it either.

What a newer build does when it starts is known from the code. It updates misha-core, the bundled Misha extension, in Claude Code and OpenCode wherever the installed version differs. Anything already where it writes, such as an agent file or your own edit of an earlier version, is first moved into <code><Fact name="desktop.paths.paths.14.path" /></code>, which keeps the newest <Fact name="desktop.retention.overwrittenBatches.kept" /> batches. Its database changes go forward only: an older build refuses a database a newer build has upgraded, so going back to an older build with the same data doesn't work.

## Remove Misha {#remove}

::: warning Not yet exercised
Misha has no uninstall button or command yet, and this order hasn't been tried on a clean installation. It covers what Misha puts on your Mac, in an order that keeps the records you need until you've used them. Deleting <code><Fact name="desktop.paths.home" /></code> first would throw away the install records that say what to remove from Claude Code and OpenCode.
:::

1. **Pause, and wait for Home to say the workers stopped.** Stop any it names by hand.
2. **Keep what you want.** Workers change code in <code><Fact name="desktop.paths.paths.9.path" /></code>, which may hold work you haven't pushed. Copies of what the installers wrote over are in <code><Fact name="desktop.paths.paths.14.path" /></code>. The post record is in <code><Fact name="desktop.paths.paths.0.path" /></code>.
3. **Turn off Open at login, then quit.** Use the menu bar's **Open at login** or the switch on **Set up**, then **Quit Misha**. Quit before the next step, because Misha installs misha-core again in each harness when it starts and finds no install record.
4. **Remove what Misha installed in Claude Code and OpenCode.** Each extension's install record, in <code><Fact name="desktop.paths.paths.12.path" /></code> and <code><Fact name="desktop.paths.paths.13.path" /></code>, lists the files, folders, settings, MCP servers, marketplaces and plugins it added. Remove any other Misha extension before misha-core, the order Misha's own installer enforces, since other extensions install only beside misha-core. Then put back what you want from the overwritten copies, which nothing restores automatically: each batch's `manifest.json` names where a file or folder came from, and its `members.json` holds settings' earlier values.
5. **Remove the browser parts.** Remove the Misha Browser extension on your browser's Extensions page. Its queue of up to 2,000 messages not yet handed to Misha is in the extension's own browser storage, which the browser deletes with the extension. Then remove the native host: its registration as `misha.browser_bridge` in Chrome's and Brave's native messaging folders, and its launcher. The [browser extension's README](https://github.com/dumdummisha/misha-browser) says where its installer writes both.
6. **Delete the Misha app.**
7. **Delete Misha's data folder,** <code><Fact name="desktop.paths.home" /></code>, or the folder the `MISHA_HOME` environment variable names. It holds the settings, waiting messages and post record, the clone's copies of your repositories, the workers' logs and working copies, the install records and the overwritten copies.

Some records live outside Misha and need their own clean-up. Claude Code keeps the transcripts of the clone's session and of Claude workers in its own data on your Mac, and GPT workers' sessions appear among your OpenCode sessions. What the clone and its workers did in Slack, GitHub, Jira and other services stays there, and model providers keep records under your own accounts as [Privacy and security](/privacy) describes.
