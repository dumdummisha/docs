---
title: Get started
description: "From a fresh Mac to your clone's first answer in your self-DM: what you need, the download and install, activating your invite, the two steps in Misha's window and what to do when a step is stuck."
prev:
  text: Try it
  link: /start/try
next:
  text: Make it yours
  link: /use/make-it-yours
---

# Get started

::: info Set up in the window, on purpose
There is no AI-guided setup, on purpose: doing these steps yourself in Misha's window gets you familiar with the app before you start automating. You can still set up from your own Claude Code or OpenCode if you want to: once Misha is open, it installs [MCP tools](/reference/tools) there that check and configure it, and `/misha-core:misha-setup` in Claude Code (`/misha-core/misha-setup` in OpenCode) walks you through setup with them. A session already open before Misha first ran sees them after a restart.
:::

Getting to your clone's first answer takes a download, your invite key, two steps in Misha's window, then a hi in Slack that you approve on Home.

## What you need {#requirements}

- A Mac with Apple silicon and macOS 13 or later.
- Chrome or Brave, version 140 or later.
- An invite key. Downloading Misha doesn't give you access: ask for an invite on [dumdummisha.ai](https://dumdummisha.ai).
- Claude Code or OpenCode, signed in. The clone and its workers run on one of them and count against that sign-in's usage limits. Until you choose on **Settings › What I think with**, Misha runs on the one it finds, and on Claude Code when it finds both. On Claude Code, sign in (`claude`) to the Claude account you want Misha to use. On OpenCode, the default model is OpenAI's `openai/gpt-6-astra`, so sign OpenCode in to OpenAI (`opencode auth login`).
- git. On a Mac without it, `xcode-select --install` installs it.
- Slack signed in in that browser.

Everything else (the GitHub CLI, the other runtime, Jira, Google and the other services) is optional and can wait until after the first answer.

## What Misha changes on your Mac {#before-you-install}

Each time Misha starts, it installs or updates misha-core, its bundled Misha extension and the connectors you added, in Claude Code and OpenCode wherever it finds them: tools, commands, agent profiles, hooks and skills (kept once in `~/.agents/skills`, with links for Claude Code). Skills and commands carry their extension's name, such as `misha-core-workflow-git-cli` and the `misha-core` commands folder. Agent profiles don't: misha-core writes `implementer`, `reviewer`, `researcher`, `orchestrator` and `lite`. A file of yours already where Misha writes, such as your own `reviewer` agent, is first moved into `~/.misha/overwritten`, which keeps the newest 10 batches; nothing puts those files back for you. Your other agents, commands and skills are left alone.

The browser part adds the Misha Browser extension and the helper that connects it to Misha ([Browser permissions](/reference/permissions) explains what each can do). **Uninstall Misha…** in the menu bar removes what Misha added ([Remove Misha](/operate/manage#remove)).

## Download and install {#download}

1. Download `Misha-<version>-darwin-arm64.zip` from [the latest release](https://github.com/dumdummisha/desktop-downloads/releases/latest). The release lists the ZIP's SHA-256: to check your download, run `shasum -a 256` on the file in Terminal and compare.
2. Open the ZIP, and move `Misha.app` to your Applications folder before you open it. Misha writes the app's location into Claude Code and OpenCode, so put it where it will stay.
3. Open Misha. The first time, macOS says that "Misha" is an app downloaded from the Internet and asks whether you're sure you want to open it. Click **Open**. Misha is signed with an Apple Developer ID and notarized by Apple, so after this it opens normally.

Misha appears in the menu bar and opens its window on **Get started**, which asks for your invite key.

## Activate your invite {#invite}

Until an invite key is verified, nothing of Misha runs. The window shows only **Get started** with **Paste your invite key**, and the menu bar's Misha menu says "Misha needs an invite" and offers **Open Misha**, **Uninstall Misha…** and **Quit Misha**.

1. Paste the key from your invitation into **Paste your invite key**.
2. Click **Activate**. The button says **Activating…** while Misha checks the key.
3. The window shows "Invited as" with the email your invite was made for, such as "Invited as ann@acme.example", and Misha starts. Step 1 below follows.

Misha checks the key on your Mac, with no network call, and checks it again each time it starts. A valid key is saved in `~/.misha/app/invite.json`, a file only you can read ([what Misha stores](/privacy#storage)); an invalid one saves nothing. Until you activate, a Claude Code or OpenCode session that calls Misha's tools gets "Misha needs an invite. Open Misha and paste your invite key."

| The window says | Do this |
| --- | --- |
| "Enter your invite key to use Misha." | Paste your key and click **Activate**. |
| "This invite key isn't valid. Paste the key from your invitation, or ask the person who invited you for a new one." | Copy the whole key from your invitation again and paste it. If it still isn't valid, ask whoever invited you for a new one. |
| "Misha couldn't read your invite at ...", with the file's path and a reason | A saved key exists but the file can't be read. Fix what the reason names, such as the file's permissions, or delete that file and paste your key again. |

## Step 1: Give me consciousness {#consciousness}

**Give me consciousness** needs the runtime the clone runs on, Claude Code or OpenCode, installed and signed in, and git. Until it has both, it shows the first thing missing and a button to fix it:

| The step says | Do this |
| --- | --- |
| "I need Claude Code or OpenCode on this Mac." | Install either one, then restart Misha. **Get Claude Code** opens Claude Code's page; to use OpenCode instead, install it from [opencode.ai](https://opencode.ai/). |
| "I run on Claude Code, and it isn't on this Mac." (or OpenCode) | The runtime chosen in Settings is missing. Click **Get Claude Code** or **Get OpenCode**, install it, then restart Misha. |
| "I found it, but I started before it was installed. Restart me to use it." | Click **Restart Misha**. |
| "Claude Code is on this Mac, but signed out." | Click **Sign in to Claude**, which opens Terminal with `claude auth login`, and finish signing in there. The step ticks by itself once you have. |
| "OpenCode is on this Mac, but has no sign-in for openai/gpt-6-astra, the model I think with." | Click **Sign in to OpenCode**, which opens Terminal with `opencode auth login`, and sign in to the provider of the model it names. |
| "I'm checking whether Claude Code is signed in." (or OpenCode) | Wait a few seconds. |
| "git isn't on this Mac, and I can't start without it. Install it with xcode-select --install, then restart me." | Run `xcode-select --install` in Terminal, then restart Misha. |

## Step 2: Let me hear Slack {#hear-slack}

**Let me hear Slack** needs the Misha Browser extension running in your browser, reaching Misha through a small helper on this Mac, and a Slack tab signed in as you.

| The step says | Do this |
| --- | --- |
| "My extension isn't running. It reads Slack for me, in the browser you already use." | Click **Show the extension**. Finder shows the extension's folder: open `chrome://extensions` (Chrome) or `brave://extensions` (Brave), turn on Developer mode, click **Load unpacked** and pick that folder. |
| "My extension reaches me through a small helper on this Mac, and the helper isn't installed." | Click **Install the helper**. Terminal opens and runs a short installer on Misha's own runtime, so the Mac needs no Node.js: it writes a launcher in `~/.misha/browser-bridge` and a small registration file for Chrome and Brave in your Library folder, and asks for no password. |
| "My extension is running, but no Slack tab is signed in." | Click **Open Slack** (or **Open Slack in Chrome** or **in Brave**) and sign in to your workspace. |
| "I see Slack once my extension reports." | Wait a moment, with Slack open in the browser. |

If Slack was already open before you loaded the extension, Misha asks you to reload it once (the first row of the table below).

Once the extension hears Slack, Misha sets itself up as you. You don't fill in a form:

- Signed in to one Slack workspace, the step names it, such as "Setting myself up as you in Shop.", and carries on by itself.
- Signed in to several, it asks "Which Slack account do I answer as?" with a button per workspace. Click the one the clone should answer in. The clone answers only there: messages from your other workspaces reach Misha on this Mac and are dropped unanswered. Until setup finishes you can pick another; once it has, the account can't change.

Misha starts with `:misha:` as the clone's emoji, no personality and no Routines, on the runtime it found (Claude Code when it found both) at that runtime's default model, and with both **Require my approval** switches on (**Before I start work** and **Before anything goes out**), so everything the clone would send or start waits for your OK. [Make it yours](/use/make-it-yours) changes all of this.

If setting itself up fails, the step says why and offers a way back:

| The step says | Do this |
| --- | --- |
| "Slack's tab needs a reload before I can use it. Press Reload Slack, and Check again once Slack has loaded." | Click **Reload Slack**, which opens Slack again in the browser with the extension. Once Slack has loaded, click **Check again**. A reload you do yourself works too, but the window learns of it only when you click **Check again**. |
| "Slack isn't signed in to Shop anymore, where I was setting myself up as you." | Sign in to that workspace again and Misha finishes, or click another workspace's button. |
| "I couldn't read your self-DM through Slack.", "I couldn't save my settings." or "I couldn't tell whether my settings were saved.", each with a reason | Fix what the reason names, then click **Check again**. If Slack is still loading, wait for it first. |
| "My extension is running, and Slack is signed in to Shop. I set myself up as you once I can think." | Finish [Give me consciousness](#consciousness) first. |

## Step 3: Say hi {#first-reply}

When Let me hear Slack is done, it says "Say hi in your self-DM. My answer waits on Home under "Waiting for your OK"; approve it there and it arrives in Slack." Your self-DM is the direct message to yourself in Slack.

1. Write "hi" to yourself in Slack.
2. Go back to Misha: nothing in Slack or on your desktop tells you the answer is waiting. Click **Home** in the sidebar, or, with the window closed, click Misha in the menu bar and choose **Waiting for your OK: 1**, which opens Home. Under **Waiting for your OK**, a card asks "Reply to you in your self-DM?" and shows the words under **What goes out**.
3. Click **Approve**.

The answer arrives in your self-DM, starting with `:misha:` in italics. That is your clone working. If your workspace has no `:misha:` emoji, Slack shows the text `:misha:` instead; choose an emoji your workspace has on **Settings › How I look and sound › Icon**.

From now on the clone answers DMs to you, mentions of you and threads you're in, and each answer waits on Home for your OK the same way until you turn **Before anything goes out** off ([Make it yours](/use/make-it-yours#approvals)). The menu bar's Misha menu shows "Waiting for your OK" with a count whenever something waits. If nothing reaches Home after your hi, see [Troubleshooting](/operate/troubleshooting).

## Optional steps {#optional}

Get started also lists two optional groups. You can skip both and come back from **Settings** and **Extensions** at any time.

- **Show me your code** links a repository folder on your Mac, so the clone can read your code. **Choose folder…** picks it and fills in its remote from git ([Repositories](/use/make-it-yours#repositories)).
- **Add tools** has **Open the catalogue**, where you add the services your tasks need, such as Jira or Google.

## Keep it running {#keep-it-running}

- **Keep the Mac awake.** The clone is offline while the Mac sleeps, and messages from that time aren't answered later. When the Mac is set to sleep, **Settings** says so under **Pause Misha**. In System Settings, turn on **Prevent automatic sleeping on power adapter when the display is off** (Battery › Options on a MacBook) or **Prevent automatic sleeping when the display is off** (Energy on a desktop Mac). Or run `caffeinate -d` in Terminal, which keeps the Mac awake until you close that Terminal window or press Control-C. With the lid closed, a MacBook stays awake only while it is on power with an external display connected.
- **Keep the browser open with Slack signed in.** Without a signed-in Slack tab, nothing reaches the clone.
- **Turn on Open at login** in the menu bar's Misha menu, so Misha starts when you log in.
- **Closing the window doesn't stop Misha.** It keeps answering from the menu bar. To stop it, [pause](/operate/manage#pause).

## Next {#next}

[Make it yours](/use/make-it-yours): what the clone listens to, who may ask it for work and when it asks for your OK.
