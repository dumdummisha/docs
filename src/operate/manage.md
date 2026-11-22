---
title: Control and maintain Misha
description: "Pause Misha, change what it may do, check what it has done, and update or remove it."
prev: false
next:
  text: Troubleshooting
  link: /operate/troubleshooting
---

# Control and maintain Misha

Pause is the brake: the clone stops answering, no new worker starts on its work and Misha tries to stop the workers on it that are running, while Slack messages keep arriving and wait for you to resume. Below are pausing, changing what Misha may do, reading what it did, and what is known today about updating and removing it. For a problem Misha shows you, see [Troubleshooting](/operate/troubleshooting).

## Pause Misha {#pause}

The window's sidebar, the menu bar's Misha menu (**Pause Misha**, **Resume Misha**) and your self-DM all set the same pause:

<!-- facts surfaces pause resume -->

While Misha is paused:

- The answer being written is cancelled. The clone answers only your self-DM commands, such as `settings` and `resume`, and posts nothing else in Slack; a worker's post is refused.
- No new worker starts on the clone's work, and Misha tries to stop every worker on that work that still runs, including the workers those started. Home says how that went. Workers you start from your own Claude Code or OpenCode sessions keep running and can start more work; check those in the session that started them.
- Messages from Slack keep arriving and wait, with no age limit, so after a long pause the clone may answer requests that are days old.
- The pause survives quitting: Misha starts paused and, once it runs, tries again to stop any worker on the clone's work still running.

Home's paused card shows how the stop is going:

| Home says | What it means | What to do |
| --- | --- | --- |
| "I'm stopping my workers, start no new ones..." | The stop is under way. The workers show under **Working on now** until they end. | Wait. |
| "...but I stopped my workers..." | Every worker on the clone's work has ended: Misha counts one as stopped only once its processes are gone. | Nothing. |
| "I couldn't stop one of my workers (...)" | Misha couldn't confirm that this worker stopped. It may have refused to signal a process it couldn't verify as the worker's, or the worker's processes didn't end after it signalled them; its log says which. The card and a desktop notification name the run by its id, not by a process. | Keep Misha paused. The worker stays under **Working on now** while its processes may still run. The window doesn't show which process on your Mac belongs to the run, so [ask for help](/operate/troubleshooting#asking-for-help) with the run id rather than quitting a process that only looks like it. |
| "I couldn't stop my workers, so they may still run; my log says why." | The stop failed as a whole, so Misha can't say which workers ended. | Keep Misha paused. Quit and open Misha again, which starts paused and tries the stop again. If workers are still listed under **Working on now**, [ask for help](/operate/troubleshooting#asking-for-help). |

<Shot id="paused" caption="Paused, with the workers stopped and Resume on the card. Made-up example." />

<Shot id="workers-stopping" caption="A moment after pausing: two workers are still listed while Misha stops them. Made-up example." />

<Shot id="worker-unstopped" caption="A worker Misha couldn't confirm stopped, named on Home by its run id. Made-up example." />

Home shows these lines only while the paused card is the one on top. "Something's wrong on my side." and "I can't hear Slack." take its place, and the pause stays in force under them ([which card Home shows](/operate/troubleshooting#which-card)). With Slack lost, Misha still tries to stop the workers; while its runtime has failed, it isn't running to stop them. Either way **Working on now** is the check: a worker of the clone's work stays listed there while its processes may still run, so once none is listed, none of the clone's workers is running. If workers stay listed, keep the pause and [ask for help](/operate/troubleshooting#asking-for-help).

Pause can't reach what has left your Mac. A posted message, a merged pull request, an edited ticket or a dev deploy stays as it is, and a build or CI run a worker started may still finish. To correct something in public, write there yourself.

### Pause, close, quit or disconnect {#pause-close-quit}

| You | The clone | Workers | Slack messages |
| --- | --- | --- | --- |
| Pause | Answers only your self-DM commands | Misha tries to stop the clone's (check Home); none start on its work | Taken in; they wait |
| Close the window | Keeps answering: Misha stays in the menu bar | Keep running | Taken in as usual |
| Quit Misha | Stops | Keep running: they are separate processes | Not taken in. While the browser runs, the extension queues up to 2,000 until Misha takes them in again |
| Close Slack or the browser | Hears nothing and answers nothing | Keep running; their Slack posts fail | Not captured; see [Troubleshooting](/operate/troubleshooting#slack-unheard) |

To stop the clone's work, pause and wait until none of its workers is listed under **Working on now**. Quit after that, not instead: quitting alone leaves the workers running.

## Change what Misha may do {#scope}

**Who may ask me for work**, **Channels I watch**, **Who I ignore** and **Repositories** with **May merge** are on **Settings**; each connector has one **I use it** switch on **Set up**. [Make it yours](/use/make-it-yours) walks through them and [Settings and commands](/reference/settings) lists every surface.

Changing who may ask for work or where workers may merge does not stop workers already running: after **Stop allowing**, a worker already running for that person keeps running, and **May merge** is an instruction the clone passes on, not a lock ([when a change takes effect](/reference/settings#when-changes-apply)). To halt work under way, pause.

A connector's switch is shared by the clone, its workers and your own Claude Code and OpenCode sessions, wherever Misha supplies that connector. Turning one off refuses its next tool call, even in a session already running, and undoes nothing already done. Restart open agent sessions to drop the connector's tools, skills and hooks from them.

## See what Misha has done {#activity}

Home's **Working on now** lists each answer being written and each worker, with who asked, where and for how long. **Recently** lists, newest first, what Misha posted, edited, shared and reacted to in Slack, and what it decided without posting, such as "Let a message in #shop-backend be."

Home can also say **I kept** and a folder's path: a work folder Misha left for you, with its reason. After the clone finishes a run, Misha removes only a worktree that is exactly as it made it and a scratch folder that is empty, once no worker may still be using them. Changed files, ignored files and commits keep a worktree, even after a push. Keep what you need, then remove the folder yourself.

<Shot id="home" caption="Home with an answer and two workers under way, and Recently below. Made-up example." />

A post Slack hasn't confirmed carries a pill: **Sending**, **Not confirmed** when Misha can't tell whether it arrived, or **Didn't go out** ([what to do](/operate/troubleshooting#send-not-confirmed)). Recently comes from two records in Misha's database:

<!-- facts retention outcomes ledger -->

The post record covers Slack only. Commands, pushes and ticket edits aren't in it: check those in GitHub, Jira and the other services, and in the workers' logs in <code><Fact name="desktop.paths.paths.workers-logs.path" /></code>. It is a provenance record in a local database you can change, not a tamper-proof audit log. [Privacy and security](/privacy) covers what is stored where.

## Updates {#updates}

Today there is one unsigned local build, run by its owner since 19 November 2026: no public download, no signed build and no updater, so automatic updates, pinning a version and rollback aren't supported yet. The browser extension is loaded unpacked, with no Chrome Web Store listing, so the browser doesn't update it either.

What a newer build does when it starts is known from the code. It brings misha-core, the bundled Misha extension, and the connectors into line with your switches in each installed runtime, even when their version hasn't changed; changing a connector switch does the same. Anything already where it writes, such as an agent file or your own edit of an earlier version, is first moved into <code><Fact name="desktop.paths.paths.overwritten.path" /></code>, which keeps the newest <Fact name="desktop.retention.overwrittenBatches.kept" /> batches. Its database changes go forward only: an older build refuses a database a newer build has upgraded, so going back to an older build with the same data doesn't work.

## Remove Misha {#remove}

::: warning Not a complete procedure yet
Misha has no uninstall button or command yet, and removing what it installed in Claude Code and OpenCode isn't available as a documented procedure. The steps below are the parts that are safe today. They leave Misha's additions in Claude Code and OpenCode, the app and its data folder in place, because the data folder holds what a later removal needs.
:::

1. **Pause, and wait until Working on now lists no worker.** If a worker stays listed, see [Pause Misha](#pause).
2. **Keep what you want.** Workers change code in <code><Fact name="desktop.paths.paths.workers-worktrees.path" /></code>, which may hold work you haven't pushed, and work without a repository leaves its files in <code><Fact name="desktop.paths.paths.workers-scratch.path" /></code>. Keep what you want from there and from any folder Home says Misha kept. The post record is in <code><Fact name="desktop.paths.paths.database.path" /></code>.
3. **Turn off Open at login, then quit.** Use the menu bar's **Open at login** or the switch on **Set up**, then **Quit Misha**.
4. **Remove the browser parts.** Remove the Misha Browser extension on your browser's Extensions page. Its queue of up to 2,000 messages not yet handed to Misha is in the extension's own browser storage, which the browser deletes with the extension. Then remove the native host, which the [browser extension's installer](https://github.com/dumdummisha/browser-extension) wrote: delete the file `misha.browser_bridge.json` where it exists in `~/Library/Application Support/Google/Chrome/NativeMessagingHosts/` and `~/Library/Application Support/BraveSoftware/Brave-Browser/NativeMessagingHosts/`, and the launcher `~/.misha/browser-bridge/native-host`, whose place is fixed even when `MISHA_HOME` names another folder. Delete only those files: the folders can hold other programs' registrations.

What Misha installed in Claude Code and OpenCode stays for now. Each extension's install record, in <code><Fact name="desktop.paths.paths.install-records-claude-code.path" /></code>, <code><Fact name="desktop.paths.paths.install-records-opencode.path" /></code> and, for skills, <code><Fact name="desktop.paths.paths.install-records-agents.path" /></code>, names the files, folders, settings and Claude Code registrations it added, but turning that list into deletions by hand isn't safe. A record can name a whole configuration file or folder that Misha created and you've since added your own settings or files to, and Claude Code's registrations are removed through Claude Code's own commands, not by deleting files. Misha's own uninstall handles this: it undoes the newest addition first, leaves anything you changed since, removes a folder only once it's empty and removes a setting rather than the file it sits in. That uninstall isn't available to you yet. Until it is:

- Don't delete the files, folders or settings an install record names.
- Don't delete the Misha app or its data folder, <code><Fact name="desktop.paths.home" /></code> (or the folder the `MISHA_HOME` environment variable names). Claude Code starts Misha's tool server from the app itself, and <code><Fact name="desktop.paths.paths.extensions.path" /></code> inside the data folder holds the install records and generated files a removal needs. Skills also live in `~/.agents/skills`, with links for Claude Code.
- Treat <code><Fact name="desktop.paths.paths.overwritten.path" /></code> as yours. It holds your own originals, the files and settings the installers moved aside before writing over them, and nothing restores them automatically. Copy back what you want: each batch's `manifest.json` names where an entry came from, and its `members.json` holds settings' earlier values.

If you need Misha gone before its uninstall is available, [ask for help](/operate/troubleshooting#asking-for-help).

Some records live outside Misha and need their own clean-up. Claude Code and OpenCode keep the sessions they ran for the clone and its workers in their own data on your Mac, and switching the clone's runtime doesn't erase its earlier sessions. What the clone and its workers did in Slack, GitHub, Jira and other services stays there, and model providers keep records under your own accounts as [Privacy and security](/privacy) describes.
