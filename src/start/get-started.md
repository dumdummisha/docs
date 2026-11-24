---
title: Get started
description: "From a fresh Mac to your clone's first answer in your self-DM: what you need, the two steps in Misha's window and what to do when a step is stuck."
prev:
  text: Try it
  link: /start/try
next:
  text: Make it yours
  link: /use/make-it-yours
---

# Get started

Misha is in an invite-only pilot. There is no public download, Chrome Web Store listing or invite key yet, so this page starts with Misha already on your Mac. Getting to the clone's first answer takes two steps in Misha's window and one message from you.

## What you need {#requirements}

- A Mac with Chrome or Brave.
- Claude Code, signed in with your own Claude subscription. Misha starts on it and its workers run on it, even if you later run the clone itself on OpenCode.
- git. On a Mac without it, `xcode-select --install` installs it.
- Slack signed in in that browser.

Everything else (the GitHub CLI, OpenCode, Jira, Google and the other services) is optional and can wait until after the first answer.

## Step 1: Give me consciousness {#consciousness}

Open Misha. Its window shows **Get started**, a checklist that ticks itself from what it finds on your Mac. The first group, **So I can be you**, holds the two steps the clone can't answer without.

**Give me consciousness** is done when Claude Code is on the Mac and signed in, and git is on the Mac. It then says "Claude Code is signed in on this Mac. I think with your own subscription." Until then it shows the first thing missing and one button for it:

| The step says | Do this |
| --- | --- |
| "I run on Claude Code, and it isn't on this Mac." | Click **Get Claude Code**, install it, then restart Misha. |
| "I found it, but I started before it was installed. Restart me to use it." | Click **Restart Misha**. |
| "Claude Code is on this Mac, but signed out." | Click **Sign in to Claude**, which opens Terminal with `claude auth login`, and finish signing in there. The step ticks by itself once you have. |
| "I'm checking whether Claude Code is signed in." | Wait a few seconds. |
| "git isn't on this Mac, and I can't start without it. Install it with xcode-select --install, then restart me." | Run `xcode-select --install` in Terminal, then restart Misha. |

## Step 2: Let me hear Slack {#hear-slack}

**Let me hear Slack** needs the Misha Browser extension running in your browser, reaching Misha through a small helper on this Mac, and a Slack tab signed in as you.

| The step says | Do this |
| --- | --- |
| "My extension isn't running. It reads Slack for me, in the browser you already use." | Click **Show the extension**. Finder shows the extension's folder: open your browser's extensions page, turn on Developer mode, click **Load unpacked** and pick that folder. |
| "My extension reaches me through a small helper on this Mac, and the helper isn't installed." | Click **Install the helper**. |
| "My extension is running, but no Slack tab is signed in." | Click **Open Slack** (or **Open Slack in Chrome** or **in Brave**) and sign in to your workspace. |
| "I see Slack once my extension reports." | Wait a moment, with Slack open in the browser. |

Once the extension hears Slack, Misha sets itself up as you. You don't fill in a form:

- Signed in to one Slack workspace, the step says "Setting myself up as you in Shop." and carries on by itself.
- Signed in to several, it asks "Which Slack account do I answer as?" with a button per workspace. Click the one the clone should answer in. You can't change it later.

Misha starts with `:misha:` as the clone's emoji, no personality and no Routines, and with **Require my approval** on, so everything the clone would send or start waits for your OK. [Make it yours](/use/make-it-yours) changes all of this.

If setting itself up fails, the step says why and offers a way back:

| The step says | Do this |
| --- | --- |
| "Slack's tab needs a reload before I can use it. Press Reload Slack, and Check again once Slack has loaded." | Click **Reload Slack**, which opens Slack again in the browser with the extension. Once Slack has loaded, click **Check again**. |
| "Slack isn't signed in to Shop anymore, where I was setting myself up as you." | Sign in to that workspace again and Misha finishes, or click another workspace's button. |
| "I couldn't read your self-DM through Slack.", "I couldn't save my settings." or "I couldn't tell whether my settings were saved.", each with a reason | Fix what the reason names, then click **Check again**. If Slack is still loading, wait for it first. |
| "My extension is running, and Slack is signed in to Shop. I set myself up as you once I can think." | Finish [Give me consciousness](#consciousness) first. |

## Step 3: Say hi {#first-reply}

When Let me hear Slack is done, it says "Say hi in your self-DM. My answer waits on Home under "Waiting for your OK"; approve it there and it arrives in Slack." Your self-DM is the direct message to yourself in Slack.

1. Write "hi" to yourself in Slack.
2. In Misha's window, click **Home** in the sidebar. Under **Waiting for your OK**, a card asks "Reply to you in your self-DM?" and shows the words under **What goes out**.
3. Click **Approve**.

The answer arrives in your self-DM, starting with `:misha:` in italics. That is your clone working.

From now on the clone answers DMs to you, mentions of you and threads you're in, and each answer waits on Home for your OK the same way until you turn **Before anything goes out** off ([Make it yours](/use/make-it-yours#approvals)). The menu bar's Misha menu shows "Waiting for your OK" with a count whenever something waits. If nothing reaches Home after your hi, see [Troubleshooting](/operate/troubleshooting).

## Optional steps {#optional}

Get started also lists two optional groups. You can skip both and come back from **Settings** and **Extensions** at any time.

- **Show me your code** links a repository folder on your Mac, so the clone can read your code. **Choose folder…** picks it and fills in its remote from git ([Repositories](/use/make-it-yours#repositories)).
- **Add tools** has **Open the catalogue**, where you add the services your tasks need, such as Jira or Google.

## Keep it running {#keep-it-running}

- **Keep the Mac awake.** The clone is offline while the Mac sleeps. When the Mac is set to sleep, **Settings** says so under **Pause Misha**. Set sleep to Never in System Settings, or run `caffeinate -d` in Terminal while you want the clone up. Closing a laptop's lid still puts it to sleep.
- **Keep the browser open with Slack signed in.** Without a signed-in Slack tab, nothing reaches the clone.
- **Turn on Open at login** in the menu bar's Misha menu, so Misha starts when you log in.
- **Closing the window doesn't stop Misha.** It keeps answering from the menu bar. To stop it, [pause](/operate/manage#pause).

## What setup changes on your Mac {#before-you-install}

Each time Misha starts, it installs or updates misha-core, its bundled Misha extension and the connectors you added, in Claude Code and OpenCode wherever it finds them: tools, commands, agent profiles, hooks and skills (kept once in `~/.agents/skills`, with links for Claude Code). A file already where it writes is first moved into `~/.misha/overwritten`, which keeps the newest 10 batches; nothing puts those files back for you. The browser part adds the Misha Browser extension and the native host, the helper that connects the extension to Misha; [Browser permissions](/reference/permissions) explains what each can do.

There is no uninstall yet. [Remove Misha](/operate/manage#remove) says what is safe to remove today.

## Next {#next}

[Make it yours](/use/make-it-yours): what the clone listens to, who may ask it for work and when it asks for your OK.
