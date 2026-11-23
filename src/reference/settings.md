---
title: Settings and commands
description: "Every Misha setting and Slack command: who can use it, where, and when a change takes effect."
prev: false
next: false
---

# Settings and commands

Most settings are in the Misha window, on **Settings**, with connectors on **Set up**. Some also have an exact Slack command that you type in your self-DM (your direct message to yourself in Slack), and colleagues have two commands of their own. To choose settings the first time, follow [Make it yours](/use/make-it-yours). The tables come from the desktop app's reviewed export, for the version named in the footer.

## Common changes {#recipes}

Each row names the control in the Misha window, where the sidebar is the window's left column with its pages and Pause, then the Slack command with who sends it and where, then the setup tool that the [setup command](#setup-command) uses when you ask for the change in plain words.

| Change | In the window | In Slack | Setup tool |
| --- | --- | --- | --- |
| Pause Misha. | Sidebar › **Pause Misha** | `pause`<br>You, in your self-DM | `misha_pause` |
| Resume Misha. | Sidebar › **Resume Misha**<br>Home › I'm paused. › **Resume** | `resume`<br>You, in your self-DM | `misha_resume` |
| Let people ask the clone for work. | Settings › Who may ask me for work › **Allow** (On someone Find someone in Slack found.) | `allow @Emma Lee @Max Becker`<br>You, in your self-DM | `misha_apply_setting` |
| Stop letting a person ask the clone for work. | Settings › Who may ask me for work › **Stop allowing** | None | `misha_apply_setting` |
| Let workers merge pull requests in a linked folder's remote, or stop them. | Settings › Repositories › **May merge** | `allow merging /Volumes/Code/shop-backend`<br>You, in your self-DM<br>`stop merging /Volumes/Code/shop-backend`<br>You, in your self-DM | `misha_apply_setting` |
| Forget a note; the notes after it move up a number. | Settings › What I remember › **Forget** | None | `misha_apply_setting` |
| Keep the clone from answering others in a thread or a DM conversation. | None | `:misha: hands off`<br>You, with the icon, in the conversation or thread it is for, not your self-DM | None |
| A colleague has the clone answer them only when they call it. | None | `soft-ignore me`<br>A colleague, in a one-to-one DM with you | None |

**None** in the Slack column means no command exists: typing "stop allowing Emma" in your self-DM is ordinary conversation and changes nothing. [Control and maintain Misha](/operate/manage) explains what Pause stops and what it can't.

## Slack commands {#commands}

A command is the whole message, in any letter case. The clone's icon written on its own anywhere in it is left out, so a command may carry it. Anything else is ordinary conversation.

| Term | Meaning |
| --- | --- |
| Owner | The person whose clone it is. |
| Colleague | Anyone in the workspace but the owner. |
| Self-DM | The owner's direct message to themselves in Slack. |
| One-to-one DM with the owner | A colleague's one-to-one DM with the owner. |
| Any conversation, with the icon | Any conversation the clone hears, with the clone's icon in the message. |

A command counts only when the right person typed it in the right place. Posts by the clone, its workers, other clones, bots and apps never count, and the same words anywhere else are conversation for the clone to answer.

### Your commands {#owner-commands}

| Command | Where | What it does | Example |
| --- | --- | --- | --- |
| `hands off` | Any conversation, with the icon | For 14 days, or until hands on, the clone answers nobody else in one place: in a thread, that thread; in a channel's main conversation, the thread under your message; in a DM's main conversation, that conversation but not its threads. What others wrote there that waits for it is dropped. Your own messages with the clone's icon still reach it. Write the icon in the command, or the clone never sees it. Refused in your self-DM. | `:misha: hands off` |
| `hands on` | Any conversation, with the icon | The clone may answer others again in the place hands off named, the one this message is in: the same thread, or a DM's main conversation. Write the clone's icon in the command, or the clone never sees it. | `:misha: hands on` |
| `ignore <@person>` | Self-DM | The clone stops answering the person: their messages no longer reach it as something to answer, they can't call it, and what of theirs waits for it is dropped. It can still see their messages in a thread or conversation it reads to answer someone else, and nothing they wrote is deleted. | `ignore @Max Becker` |
| `soft-ignore <@person>` | Self-DM | The clone answers the person only when they call it with its icon. | `soft-ignore @Max Becker` |
| `stop ignoring <@person>` | Self-DM | The clone treats the person like everyone else again, whether it ignored or soft-ignored them. | `stop ignoring @Max Becker` |
| `allow <@person> [<@person> ...]` | Self-DM | The people named may ask the clone for work besides you: tickets, implementation and reviews. | `allow @Emma Lee @Max Becker` |
| `watch <#channel> [<#channel> ...]` | Self-DM | The clone reads every message in the channels named, and answers what asks something of you or your work. | `watch #shop-backend` |
| `allow merging <folder>` | Self-DM | Workers may merge pull requests in the linked folder's remote, the folder named by its full path. Refused for a folder your settings don't link, and for one with no remote. | `allow merging /Volumes/Code/shop-backend` |
| `stop merging <folder>` | Self-DM | Workers stop at an open pull request in the linked folder's remote, the folder named by its full path. Refused for a folder your settings don't link. | `stop merging /Volumes/Code/shop-backend` |
| `remember <text>` | Self-DM | The clone keeps your words as your next numbered note. | `remember Releases go out on Tuesdays.` |
| `set routines <text>` | Self-DM | Your words replace your routines whole: what the clone does with work, on top of its own way of working. They grant no access. | `set routines When someone asks for a fix, have a worker create or update its ticket with the steps and the affected service, fix it in its own worktree with a regression test, and open a pull request for my review.` |
| `start fresh` | Self-DM | The clone's next message starts a new session. The old session's transcript stays, and so do your settings and notes. | `start fresh` |
| `use claude code` | Self-DM | The clone runs on Claude Code from its next message, in a new session there, with the model your settings choose for it; your settings and notes stay. Refused, saying why, when the clone cannot run there as your settings stand. | `use claude code` |
| `use opencode` | Self-DM | The clone runs on OpenCode from its next message, in a new session there, with the model your settings choose for it; your settings and notes stay. Refused, saying why, when the clone cannot run there as your settings stand. | `use opencode` |
| `pause` | Self-DM | Misha pauses: the clone tries to stop its workers, starts nothing new and answers only your commands in your self-DM until you resume. It still sees what arrives in Slack. A worker it could not stop may still run: Home names it, and you stop it by hand. | `pause` |
| `resume` | Self-DM | Misha answers again. | `resume` |
| `settings` | Self-DM | The clone answers with your settings: its icon, personality, routines, who it ignores, who may ask for work, the channels it watches, where workers merge, the runtime and model it runs on, and your notes. | `settings` |

While Misha is paused it still takes your self-DM commands. A `hands off` sent elsewhere waits until you resume.

### Your colleagues' commands {#colleague-commands}

| Command | Where | What it does | Example |
| --- | --- | --- | --- |
| `soft-ignore me` | One-to-one DM with the owner | The clone answers you only when you call it with its icon. | `soft-ignore me` |
| `stop ignoring me` | One-to-one DM with the owner | The clone treats you like everyone else again. While it soft-ignores you, write the clone's icon in the message too, or the message never reaches it. | `:misha: stop ignoring me` |

These work only in a one-to-one DM with you, never in a group DM or channel. Someone you ignore, rather than soft-ignore, can't send `stop ignoring me`, because their messages no longer reach the clone: only you can lift it. Neither command deletes anything or stops Misha seeing their messages; [Talking with a clone](/understand/slack) explains this to colleagues.

## Every setting and where to change it {#settings}

### What each setting holds {#fields}

| Setting | What it holds | Default | Limits |
| --- | --- | --- | --- |
| `account` | The Slack account the clone answers as, and your self-DM there. | Chosen when the settings are first saved; it never changes after. |  |
| `icon` | The emoji every post of the clone starts with. Writing it in a message calls the clone. | :misha: | Format checked when saved |
| `personality` | Your words on how the clone sounds: tone and wording only, never what it may do. | Empty, so the clone's own plain style. | Up to 2,000 characters |
| `routines` | Your standing instructions for work: when something happens, what the clone does and what it tells you. They grant no access. | Empty, so none. | Up to 2,000 characters |
| `notes` | What the clone remembers, in your exact words, numbered from 1. | None. | Up to 200 notes; 1,000 characters each |
| `rules` | Who the clone ignores or soft-ignores. | Nobody. | Names up to 80 characters; levels `ignore`, `soft-ignore` |
| `allowed` | Who besides you may ask the clone for work. | Nobody but you. | Names up to 80 characters |
| `watched` | The channels the clone reads in full. | None. | Names up to 80 characters; format checked when saved |
| `repositories` | Your own folders the clone reads as they are, each with the remote its pull requests go to, and where its workers may merge. | None. | Format checked when saved |
| `connectors` | The connectors the clone may use, which Misha loads everywhere while they are on and nowhere while they are off. | Handoff compaction. | Each one of `atlassian`, `aws`, `browser`, `compaction`, `figma`, `fireflies`, `google` |
| `compactAtTokens` | How many tokens the clone's session grows to before it is compacted. On OpenCode it must be below the model's input limit. | Empty, so 750000 tokens on Claude Code, and OpenCode's own threshold there. | Whole number; at least 1 token |
| `runtime` | The runtime the clone runs on. Switching to the other one starts a new session there; the settings, notes and routines stay. | Claude Code. | One of Claude Code, OpenCode |
| `models` | For each runtime, the model and effort the clone thinks with there, from the models that runtime offers. A change takes effect on the next message, in the same session. | Empty for each, so claude-opus-5-5 at high on Claude Code and openai/gpt-6-astra at medium on OpenCode. |  |
| `sessionEpoch` | Moves on with each start fresh and each switch of runtime, so the next message starts a new session. | 0 |  |

An empty **Limits** cell means the export lists no limit. `compactAtTokens` takes a positive whole number of tokens, or nothing for the runtime's default, which the table gives for each runtime; the window refuses anything else. On OpenCode a number must be below the selected model's input limit. No control changes `account` after the first save, and `sessionEpoch` moves with start fresh and with a switch to another runtime.

### Where each change is made {#surfaces}

Every change, in the columns [Common changes](#recipes) explains. The window and the setup tool are you at your own Mac. For what workers do with these permissions, see [Put Misha to work](/use/workflows).

| Change | In the window | In Slack | Setup tool |
| --- | --- | --- | --- |
| The first save of the whole settings, for an account that has none. | Get started › Give me a face › **Save and start**<br>Get started › Give me a face › **Keep the defaults** | None | `misha_apply_setting` |
| Ignore or soft-ignore a person. | Settings › Who I ignore › **Ignore** (On someone Find someone in Slack found.)<br>Settings › Who I ignore › **Soft-ignore** (On someone Find someone in Slack found.) | `ignore @Max Becker`<br>You, in your self-DM<br>`soft-ignore @Max Becker`<br>You, in your self-DM | `misha_apply_setting` |
| Stop ignoring or soft-ignoring a person. | Settings › Who I ignore › **Stop ignoring** | `stop ignoring @Max Becker`<br>You, in your self-DM | `misha_apply_setting` |
| Let people ask the clone for work. | Settings › Who may ask me for work › **Allow** (On someone Find someone in Slack found.) | `allow @Emma Lee @Max Becker`<br>You, in your self-DM | `misha_apply_setting` |
| Stop letting a person ask the clone for work. | Settings › Who may ask me for work › **Stop allowing** | None | `misha_apply_setting` |
| Have the clone read channels in full. | Settings › Channels I watch › **Watch** (On a channel Find a channel in Slack found.) | `watch #shop-backend`<br>You, in your self-DM | `misha_apply_setting` |
| Stop the clone reading a channel in full. | Settings › Channels I watch › **Stop watching** | None | `misha_apply_setting` |
| Let workers merge pull requests in a linked folder's remote, or stop them. | Settings › Repositories › **May merge** | `allow merging /Volumes/Code/shop-backend`<br>You, in your self-DM<br>`stop merging /Volumes/Code/shop-backend`<br>You, in your self-DM | `misha_apply_setting` |
| Link a folder of yours for the clone to read, with the remote its pull requests go to. | Settings › Repositories › **Add** (After writing the folder's full path and its remote.)<br>Get started › Show me your code › **Add** (Once the face is saved, after writing the folder's full path and its remote.) | None | `misha_apply_setting` |
| Unlink a folder: the clone stops reading it, and the folder stays as it is. | Settings › Repositories › **Remove** | None | `misha_apply_setting` |
| Keep your words as the next note. | Settings › What I remember › **Remember** (After writing the note.) | `remember Releases go out on Tuesdays.`<br>You, in your self-DM | `misha_apply_setting` |
| Forget a note; the notes after it move up a number. | Settings › What I remember › **Forget** | None | `misha_apply_setting` |
| Start the clone's next message in a new session. | Settings › Start fresh › **Start fresh…** (Under More, then Start fresh in the dialog it opens.) | `start fresh`<br>You, in your self-DM | `misha_apply_setting` |
| Change the clone's icon. | Settings › Icon › **Save icon** | None | `misha_apply_setting` |
| Change the clone's personality. | Settings › Personality › **Save personality** | None | `misha_apply_setting` |
| Change your routines. | Settings › Routines › **Save routines** | `set routines When someone asks for a fix, have a worker create or update its ticket with the steps and the affected service, fix it in its own worktree with a regression test, and open a pull request for my review.`<br>You, in your self-DM | `misha_apply_setting` |
| Turn a connector on or off. | Set up › Connectors › **I use it** (On each connector's row.) | None | `misha_apply_setting` |
| Change when the clone's session is compacted, or go back to the default. | Settings › When I tidy my conversation › **Save** (Under More.) | None | `misha_apply_setting` |
| Switch the runtime the clone runs on, which starts a new session there. | Settings › What I think with › **OpenCode** (Or Claude Code while the clone runs on OpenCode; then Switch to it in the dialog it opens.) | `use claude code`<br>You, in your self-DM<br>`use opencode`<br>You, in your self-DM | `misha_apply_setting` |
| Change the selected runtime's model and effort, or go back to its default. | Settings › What I think with › **Save** (After picking a model and its effort from those it offers, or Default.) | None | `misha_apply_setting` |
| Show the settings; changes nothing. | None | `settings`<br>You, in your self-DM | `misha_apply_setting` |
| A colleague has the clone answer them only when they call it. | None | `soft-ignore me`<br>A colleague, in a one-to-one DM with you | None |
| A colleague has the clone treat them like everyone else again. | None | `:misha: stop ignoring me`<br>A colleague, in a one-to-one DM with you | None |
| Keep the clone from answering others in a thread or a DM conversation. | None | `:misha: hands off`<br>You, with the icon, in the conversation or thread it is for, not your self-DM | None |
| Let the clone answer others again where hands off kept it out. | None | `:misha: hands on`<br>You, with the icon, in the conversation or thread it is for, not your self-DM | None |
| Pause Misha. | Sidebar › **Pause Misha** | `pause`<br>You, in your self-DM | `misha_pause` |
| Resume Misha. | Sidebar › **Resume Misha**<br>Home › I'm paused. › **Resume** | `resume`<br>You, in your self-DM | `misha_resume` |

### What I think with {#what-i-think-with}

**What I think with** keeps a model and effort for each runtime, Claude Code and OpenCode, and the table under [What each setting holds](#fields) gives the **Default** for each. A change of model or effort counts from the next message, in the same conversation. Switching runtime starts a new conversation, keeps your settings, notes and Routines, and finds the model you left on the other runtime when you switch back. The window and the setup tool accept only a model and effort the runtime lists, and refuse any other rather than substituting one. There is no self-DM command for the model, only the two commands that switch runtime, in the table just above.

### Linked folders {#linked-folders}

A repository link is the full path to a real top-level git folder, not a symlink, a subfolder or a shallow clone. Its remote is `host/owner/name`, not a remote's name such as `origin`, and must match the fetch and push addresses of one of the folder's git remotes. Leave it empty only for a repository with no remote. A remote can be linked once, and **May merge** needs one. Misha's own data folder can't overlap a linked folder.

## When a change takes effect {#when-changes-apply}

The icon, ignore, soft-ignore, watch and hands off decide which new Slack messages reach the clone from the moment they are saved. Watching doesn't reach back to earlier messages in the channel, while ignore, soft-ignore and hands off also drop what already waits, as their rows say.

The rest reaches the clone on its next turn. A change to what it is told about you (personality, Routines, notes, who it ignores, who may ask for work, watched channels, where workers merge, start fresh, switching runtime) also drops an answer it was writing, and the message is answered again under the new settings.

A change to who may ask for work or where workers merge doesn't reach into work already started. After **Stop allowing**, the clone's next turns can't start workers for that person, including a turn that handles a report on their earlier work. A turn already running when you save keeps the permissions it started with and may still start a worker, and a running worker keeps running. **May merge** is an instruction, not a lock: Misha tells the clone where merging is allowed on each turn, the clone passes it on when it briefs a worker, and nothing in the app blocks a merge. A worker briefed before you turned merging off isn't told again.

Connector switches are different: turning one off refuses its next tool call, even in work already running. A call already admitted is not undone. Restart open agent sessions for the full change to their tools, skills and hooks.

To stop new work at once, [pause Misha](/operate/manage): no worker starts on the clone's work while Misha is paused, and it tries to stop the running ones. Workers you start from your own agent sessions are not affected.

## Revision conflicts {#revision-conflicts}

The window and the setup tool make each change against the settings they last loaded. If a Slack command or the setup tool changed them in between, the change is refused and nothing is saved. The window says so, shows the current settings and keeps what you typed. This stops a change acting on something you didn't see, such as forgetting note 3 after an earlier note went and the rest moved up. Slack commands apply to the settings as they are when Misha handles them.

## Notes, history and starting fresh {#notes-history-start-fresh}

Notes are settings: your exact words, numbered, given to the clone as standing context. **Remember** or `remember` adds one; only **Forget** in the window, or the setup tool, removes one.

History is the clone's one session in the runtime you chose. Every conversation shares it, rather than each conversation or thread having its own, so the session remembers them all. Claude Code or OpenCode keeps its record on your Mac. At `compactAtTokens` the session is compacted and the clone is given your settings again. For each conversation and thread, Misha records the session it answers in and how far the clone has read there. When cleanup removes that record, the clone next reads the latest messages there again, and the session and its transcript stay:

| Record | Deleted after |
| --- | --- |
| Which session a conversation continues, counted from its last use. The runtime's own record of the session is not part of this. | 14 days |

Start fresh replaces the shared session for every conversation at once, and so does switching to another runtime. Both keep your settings, notes and the old transcript, so they delete no history. [Privacy and security](/privacy) covers what is stored where.

## Hands off {#hands-off}

`hands off` applies to one conversation and thread, as its row says: there is no channel-wide or DM-wide version. It isn't a setting, so neither the window nor the `settings` answer lists it. It ends with `hands on` in the same place, or when Misha's regular cleanup removes it:

| Record | Deleted after |
| --- | --- |
| The threads and DMs you told the clone hands off, counted from when you said it. | 14 days |

## Setup command {#setup-command}

| Harness | Command |
| --- | --- |
| Claude Code | `/misha-core:misha-setup` |
| OpenCode | `/misha-core/misha-setup` |

It walks you through setup and can make any change with a setup tool [above](#surfaces). Claude Code and OpenCode can both run it. The clone starts on Claude Code; choose its runtime on **Settings › What I think with**.

## What Set up checks {#detection}

| Item | Set up group | Needed | Ready shows | What Set up says | Actions |
| --- | --- | --- | --- | --- | --- |
| Claude Code | What I think with | Required | Signed in | "I answer and run workers on it, on your own subscription." | Sign in to Claude<br>[Get Claude Code](https://claude.com/product/claude-code) |
| OpenCode | What I think with | Optional | Signed in | "Signed in to OpenAI, it lets GPT review my work." | Sign in to OpenCode<br>[Get OpenCode](https://opencode.ai/) |
| git | How I work in your code | Required | Found | "I read your code, and my workers commit, with it." | None |
| GitHub CLI | How I work in your code | Optional | Signed in | "I clone and open pull requests with it." | Sign in to GitHub<br>[Get the GitHub CLI](https://cli.github.com/) |
| Browser extension | How I hear Slack | Required | Running | "It reads Slack for me in your browser, and posts what I write." | Show the extension |
| Browser native host | How I hear Slack | Required | Installed | "A small program that connects the browser extension to me on this Mac." | Install the native host |
| Slack | How I hear Slack | Required | Signed in | "Where I answer as you." | Open Slack |
| Jira and Confluence | Connectors | Optional | Works | "Your tickets and pages." | None |
| AWS | Connectors | Optional | Works | "Logs in your AWS accounts." | None |
| Browser control | Connectors | Optional | Works | "Your browser's tabs, and the Mac's mouse, keyboard and screen." | None |
| Handoff compaction | Connectors | Optional | Works | "Writes a handoff when your Claude Code and OpenCode sessions compact, and resumes from it." | None |
| Figma | Connectors | Optional | Works | "Your design files, read only. Figma gives you a key, and you paste it into OpenCode, never into me." | None |
| Fireflies | Connectors | Optional | Works | "Your meeting notes. Fireflies gives you a key, and you paste it into OpenCode, never into me." | None |
| Google Workspace | Connectors | Optional | Works | "Your Docs and Sheets." | None |

Set up also shows **So I stay up**: **Open at login**, a switch, and **Sleep**, which shows when this Mac sleeps and changes nothing. Neither is a checked item. When an item isn't ready, see [Troubleshooting](/operate/troubleshooting).
