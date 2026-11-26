---
title: Control and maintain Misha
description: "Pause Misha, approve what it would send or start, change what it may do, check what it has done, and update or remove it."
prev: false
next:
  text: Troubleshooting
  link: /operate/troubleshooting
---

# Control and maintain Misha

Pause is the brake: the clone stops, the workers it started are stopped, and Misha stops watching Slack for the clone until you resume. Approvals are the everyday control: what the clone would send or start waits on Home for your OK. For a problem Misha shows you, see [Troubleshooting](/operate/troubleshooting).

## Pause Misha {#pause}

The window's sidebar, **Settings › What I think with**, the menu bar's Misha menu and your self-DM all set the same pause:

| Change | In the window | In Slack | Setup tool |
| --- | --- | --- | --- |
| Pause Misha. | Sidebar › **Pause Misha**<br>Settings › What I think with › **Pause Misha** | `pause`<br>You, in your self-DM | `misha_pause` |
| Resume Misha. | Sidebar › **Resume Misha**<br>Settings › What I think with › **Resume Misha**<br>Home › I'm paused. › **Resume** | `resume`<br>You, in your self-DM | `misha_resume` |

While Misha is paused:

- The answer being written is cancelled. The clone answers only your self-DM commands, such as `settings` and `resume`, and posts nothing else in Slack. Workers of the clone's work can't post.
- No new worker starts on the clone's work, and Misha stops every worker on that work that still runs, including the workers those started. Home says how that went.
- Messages that reach the clone while paused aren't queued for it to catch up on. A `hands off` you send in a thread while paused doesn't count, so send it again after you resume. Requests already queued before the pause continue once you resume.
- A worker the pause stopped doesn't start again on resume: the clone tells whoever asked, and you ask again to continue. What it changed stays in its worktree in `~/.misha/workers/worktrees`.
- Your own Claude Code and OpenCode sessions, and the workers they start, keep every Misha tool and keep posting.
- Something you already approved on Home waits and goes out when you resume. A message already on its way to Slack may still land.
- The pause survives quitting: Misha starts paused and, once it runs, tries again to stop any worker on the clone's work still running.

Pause is all or nothing. To keep the clone out of one channel or thread, see [What it listens to](/use/make-it-yours#listens).

Home's card says "I'm paused." and how the stop is going:

| Home says | What it means | What to do |
| --- | --- | --- |
| "I'm stopping my workers and start no new ones." | The stop is under way. The workers show under **Working on now** until they end. | Wait. |
| "I stopped my workers." | Every worker on the clone's work has ended: Misha counts one as stopped only once its processes are gone. | Nothing. |
| "I couldn't stop one of my workers (...)" | Misha couldn't confirm that this worker stopped. The card and a desktop notification name the run by its id. | Keep Misha paused. The window doesn't show which process belongs to the run, so [ask for help](/operate/troubleshooting#asking-for-help) with the run id rather than quitting a process that only looks like it. |
| "I couldn't stop my workers, so they may still run; my log says why." | The stop failed as a whole. | Keep Misha paused. Quit and open Misha again, which starts paused and tries the stop again. If workers are still listed under **Working on now**, [ask for help](/operate/troubleshooting#asking-for-help). |

These lines show only while the paused card is the one on top. "Something's wrong on my side." and "I can't hear Slack." take its place, and the pause stays in force under them ([which card Home shows](/operate/troubleshooting#which-card)). Either way **Working on now** is the check: once it lists no worker, none of the clone's workers is running.

Pause can't reach what has left your Mac. A posted message, a merged pull request, an edited ticket or a dev deploy stays as it is, and a build or CI run a worker started may still finish. To correct something in public, write there yourself.

### Pause, close, quit or disconnect {#pause-close-quit}

| You | The clone | Workers | Slack messages |
| --- | --- | --- | --- |
| Pause | Answers only your self-DM commands | Misha stops the clone's (check Home); none start on its work. Your own sessions' workers keep running | Not queued for the clone; requests queued before the pause continue on resume |
| Close the window | Keeps answering: Misha stays in the menu bar | Keep running | Taken in as usual |
| Quit Misha | Stops | Keep running: they are separate processes | Not taken in. While the browser runs, the extension queues up to 2,000 until Misha takes them in again |
| Close Slack or the browser | Hears nothing and answers nothing | Keep running; their Slack posts fail | Not captured; see [Troubleshooting](/operate/troubleshooting#slack-unheard) |

To stop the clone's work, pause and wait until none of its workers is listed under **Working on now**. Quit after that, not instead: quitting alone leaves the workers running.

## Approve what goes out {#approvals}

While **Settings › Require my approval** holds them ([Make it yours](/use/make-it-yours#approvals)), the clone's replies, reactions, files, edits and notes to you, and the work it would start, wait on Home under **Waiting for your OK** ("Nothing here happens until you say so."). Misha shows no notification for these: the menu bar's Misha menu shows "Waiting for your OK" with a count, and clicking it opens Home.

Each card asks a question, such as "Reply to Emma Lee in #shop-backend?" or "Start work for Emma Lee in #shop-backend?", and shows exactly what would go out, or the brief the worker would get. **Open in Slack** and **Show message** show the message it answers. A **Thread moved on** pill means someone wrote in the thread after the clone read it.

- **Approve** lets it go. Approved work starts its workers, which don't ask again; stopping that work stops all of them.
- **Decline** drops it: nothing goes out and no work starts. The clone learns you declined.
- **Ask for changes**, on something the clone wrote, sends your note and the clone writes it again.
- **Decline all** declines everything waiting at that moment, after asking first.
- **Dismiss** clears a card that has ended, such as one that says "Not everything went out."

What a card shows is what the click approves. If what the clone would send changed after it asked you, Approve is disabled and the card says so; decline it or ask for changes.

## Change what Misha may do {#scope}

**Channels I watch**, **Who may ask me for work**, **Who I ignore**, **Repositories** with **May merge** and **Require my approval** are on **Settings**; the services the clone and workers may use are added and removed in the **Catalogue** on **Extensions**. [Make it yours](/use/make-it-yours) walks through them and [Settings and commands](/reference/settings) lists every surface.

Changing who may ask for work or where workers may merge doesn't stop workers already running: after **Stop allowing**, a worker already running for that person keeps running, and **May merge** is an instruction the clone passes on, not a lock ([when a change takes effect](/reference/settings#when-changes-apply)). To halt work under way, pause.

A connector you add or remove counts for the clone, its workers and your own Claude Code and OpenCode sessions, wherever Misha supplies it. Removing one refuses its next tool call, even in a session already running, and undoes nothing already done. Restart open agent sessions to drop its tools, skills and hooks from them.

## See what Misha has done {#activity}

Home shows, top to bottom:

- **The status card**: "I'm listening in Slack." or the problem that stops the clone ([Troubleshooting](/operate/troubleshooting)).
- **Needs you**, only when something does: a connector that needs you to sign in again (with its sign-in button or **Open Extensions**), a setup Misha couldn't finish in Claude Code or OpenCode, work folders Misha left in place, and paths its last cleanup left.
- **Waiting for your OK**, while anything waits ([above](#approvals)).
- **Working on now**: each answer being written and each worker, with who asked, where and for how long.
- **Recently**: newest first, what Misha posted, edited, shared and reacted to in Slack, and what it decided without posting, such as "Let a message in #shop-backend be." **Open in Slack** opens a row's message in your browser, **Show message** reads it from Slack, and **Load more** shows older rows.

"I left a work folder in place" lists, under **Which folders, and why**, a work folder's full path and why Misha kept it. Misha removes only a worktree that is exactly as it made it and a scratch folder that is empty, once no worker may still be using them. Changed files, ignored files and commits keep a worktree, even after a push. Keep what you need, then remove the folder yourself.

A post Slack hasn't confirmed carries a pill: **Sending**, **Not confirmed** when Misha can't tell whether it arrived, or **Didn't go out** ([what to do](/operate/troubleshooting#send-not-confirmed)). Recently comes from two records in Misha's database:

| Record | Deleted after |
| --- | --- |
| How the clone closed each message it considered: replied, reacted, let it be, stayed out or failed. | 30 days |
| The record of every post, edit, upload and reaction the clone and its workers made in Slack. | No age limit |

The post record covers Slack only. Commands, pushes and ticket edits aren't in it: check those in GitHub, Jira and the other services, and in the workers' logs in `~/.misha/workers/logs`. It is a provenance record in a local database you can change, not a tamper-proof audit log. [Privacy and security](/privacy) covers what is stored where.

## Updates {#updates}

Misha updates itself from its [GitHub releases](https://github.com/dumdummisha/desktop-downloads/releases). It checks for a newer release when it starts and each time the Mac wakes from sleep, with no other schedule. A newer release downloads in the background, and once it's ready the menu bar's Misha menu shows one line, **Restart to update Misha**, followed by the release in parentheses. The line shows whatever else the menu says, even before you've activated an invite.

- Click **Restart to update Misha** to restart once, on the new version.
- Or carry on. **Quit Misha** quits and doesn't open Misha again; the downloaded update is installed the next time you open it.

A check that fails changes nothing, and Misha checks again at its next start or wake. Each update replaces the whole app. There are no update channels, and a version can't be pinned or rolled back. Your data in `~/.misha` stays.

After an update, a Claude Code or OpenCode session that was already open says "Misha was updated. Restart this Claude Code or OpenCode session." Restart that session so it loads the new version. If the app on disk changes while Misha runs, Misha says "Misha was updated. Quit Misha and open it again." ([Troubleshooting](/operate/troubleshooting#updated)).

When a newer build starts, it brings misha-core, the bundled Misha extension and the connectors you added into line in each installed runtime, even when their version hasn't changed; adding or removing a connector does the same. Anything already where it writes, such as an agent file or your own edit of an earlier version, is first moved into `~/.misha/overwritten`, which keeps the newest 10 batches. Its database changes go forward only: an older build refuses a database a newer build has upgraded and says "Your Misha data was saved by a newer Misha. Install the latest Misha, then open it again.", so going back to an older build with the same data doesn't work.

Misha Browser comes with the app and is loaded unpacked from the folder Misha shows, with no Chrome Web Store listing. If the extension and the app disagree after an update, Misha says which parts can't connect and what to do ([The browser bridge cannot be used](/operate/troubleshooting#bridge-versions)).

## Remove Misha {#remove}

Choose **Uninstall Misha…** in the menu bar's Misha menu. It is there whatever state Misha is in, including before you've activated an invite. Misha removes only what it can prove is its own and unchanged, never through a link, and lists everything else with what to do.

Before you start:

1. **Keep what you want.** Workers change code in `~/.misha/workers/worktrees`, which may hold work you haven't pushed, and work without a repository leaves its files in `~/.misha/workers/scratch`. The uninstall keeps any work folder that isn't exactly as Misha made it, but copy out what you want first. The post record is in `~/.misha/misha.db`.
2. **Quit every Claude Code and OpenCode session and IDE agent.** They load Misha until they restart.
3. **Remove Misha Browser** from each browser's Extensions page. Its queue of up to 2,000 messages not yet handed to Misha is in the extension's own browser storage, which the browser deletes with the extension.

Then:

1. **Confirm.** "Uninstall Misha?" lists what Misha will remove: its additions to Claude Code, OpenCode and `~/.agents/skills`, with how many of each, its native host, the work folders nobody changed and its files in `~/.misha`. Tick **Keep misha.db as a record** to keep the database. Click **Uninstall**.
2. **Clear what still runs.** Misha pauses, then checks that nothing still uses it: a worker that may still be running, a session with `misha.db` open, a browser running Misha's native host, or another task holding one of Misha's locks. If anything does, it lists each with what to do; choose **Uninstall Misha…** again once they're done. **Resume** is in the menu if you change your mind.
3. **Misha removes itself.** It removes its additions, the native host files, the work folders nobody changed and its own files, and turns **Open at login** off. Last, once nothing it keeps can start Misha again, it moves `Misha.app` to the Trash and deletes its pause and invite files.
4. **Read the last window.** "Misha is uninstalled" says what it removed and what it kept. **Open full list** opens a text file with every path, which Misha leaves in place.

What Misha keeps is grouped in that window, each group with what to do:

| Group | Why it stays |
| --- | --- |
| Additions you changed: edit or delete each | You edited a file Misha added, so it isn't Misha's alone any more. |
| Records left: remove the integrations they list, then delete them | Misha couldn't remove those additions, for example because Claude Code or OpenCode isn't found or a folder is now a link. The shared skills stay while either runtime keeps an integration that may use them. |
| Native host files: delete them if you no longer use Misha Browser | The files aren't the ones Misha's helper wrote. |
| Work folders: save the work, then `git worktree remove <path>` | A worktree with changed or ignored files or commits, a scratch folder with files in it, or any work folder while git isn't found. |
| Unknown entries: delete each you do not need | Something in `~/.misha` that Misha doesn't recognise. |
| Backups: manifest.json names each original location; restore by hand | `~/.misha/overwritten`, your own files that the installers moved aside. |
| Database | You ticked **Keep misha.db as a record**, or an integration that opens it remains. |
| Misha.app, its pause and its invite | Something listed above can still start Misha, or the removal stopped. |

The window also lists what is for you, with paths as they are on your Mac: remove Misha Browser from each browser if you haven't, restart any Claude Code or OpenCode session still open, and after Misha quits, delete the app's own support folder and run the `defaults delete` command it names. It leaves on purpose what isn't Misha's alone: the clone's and workers' sessions in Claude Code and OpenCode, connector sign-ins and caches (revoke each on the service's account page if you no longer want it), and your Claude Code, OpenCode and GitHub CLI logins.

If the removal stops partway, the window says "Misha's removal stopped" and where. Don't open Misha again to retry, because opening it reinstalls its additions: finish by hand from the list.

Some records live outside Misha and need their own clean-up. Claude Code and OpenCode keep the sessions they ran for the clone and its workers in their own data on your Mac, and switching the clone's runtime doesn't erase its earlier sessions. What the clone and its workers did in Slack, GitHub, Jira and other services stays there, and model providers keep records under your own accounts as [Privacy and security](/privacy) describes. The uninstall also doesn't revoke the OAuth grants you gave each service or the permissions you gave Misha in **System Settings › Privacy & Security**.
