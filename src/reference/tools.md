---
title: MCP tools
description: "The tools Misha gives your own Claude Code and OpenCode sessions to check, configure and pause it: what each takes and answers, every settings change and the revision rule."
prev: false
next: false
---

# MCP tools

Misha registers one MCP server, `misha`, in your own Claude Code (user scope) and OpenCode. Its tools let you, or an agent in one of your sessions, check Misha, change its settings and pause it without opening the window. Every tool talks to the running Misha app, so a change made here has the same effect as the same change in the window or your self-DM, and each tool says so when the app isn't running.

In Claude Code the tools are named `mcp__misha__<tool>`, in OpenCode just `<tool>`. The setup command, `/misha-core:misha-setup` in Claude Code and `/misha-core/misha-setup` in OpenCode, walks through setup with these same tools. No clone turn lists them and no worker profile grants them: they are for your own sessions.

The `misha` server also serves your Slack tools, worker tools and the connectors you added. This page covers only the tools that check and configure Misha.

## The tools {#tools}

| Tool | What it does | Input |
| --- | --- | --- |
| `misha_status` | Misha's state: version, whether it is paused, open at login, the runtime the clone runs on with its model and sign-in, why the clone isn't running, the programs it found, the harnesses misha-core is installed in, the Slack accounts the browser extension reports (each with its `accountId`) and whether each account hears Slack. | None |
| `misha_read_settings` | Your settings, every field on [Settings and commands](/reference/settings#fields), with the `revision` a change is made against. | None |
| `misha_apply_setting` | Makes one settings change, or creates the settings once. Answers the settings before and after, or why the change was refused. | `mutation`, `expectedRevision` ([below](#apply-setting)) |
| `misha_read_self_conversation` | The id of your self-DM for one signed-in Slack account, which creating the settings needs. | `accountId`, as `misha_status` names it: `slack:<team>:<user>` |
| `misha_setup_probe` | What this Mac has, per capability: `ready`, `action-needed` or `undetermined`, each with a detail. It reads status only, never a credential. | `capabilities`: one or more of `claude-code`, `opencode`, `git`, `github`, `browser-extension`, `native-host`, `slack`, `clone-settings`, `always-on`, `connectors`, each once |
| `misha_activity` | What the clone is answering now, the workers still running (without their prompts), its latest 30 posts and outcomes, and whether Claude is out of usage or signed out. | None |
| `misha_pause` | Pauses Misha: the clone stops answering and watching Slack, ordinary messages that reach it meanwhile aren't queued for later, and it tries to stop the clone's workers. Your self-DM commands still work, and your own sessions and their workers keep going. | None |
| `misha_resume` | Resumes Misha: it watches Slack again and continues what was queued before the pause. | None |
| `misha_set_open_at_login` | Turns opening the Misha app at login on or off. | `isOn` |
| `misha_ask` | Asks the clone a question, such as what it did today. The clone answers from its own memory with tools that only look, and starts no work: ask for work in your self-DM. It can take minutes. | `question`, up to 4,000 characters |

[Control and maintain Misha](/operate/manage#pause) explains what a pause stops.

## Changing settings {#apply-setting}

`misha_apply_setting` takes one `mutation`, named by its `type`, and `expectedRevision`: the `revision` of the settings you last read, from `misha_read_settings` or from the settings the last change answered with. When the settings changed since (you changed them in the window or your self-DM), the change is refused with the settings as they are now, so you can check the change still fits and send it again with the new revision. This stops a change acting on something you didn't see, such as forgetting note 3 after the notes moved up. `expectedRevision` is `null` only for `create`.

A change takes effect as the same change in the window does ([When a change takes effect](/reference/settings#when-changes-apply)). A change the settings can't hold, such as a folder that fails its check, is refused whole and nothing is saved.

| `type` | Fields | What it changes |
| --- | --- | --- |
| `create` | `document`: the whole settings | Creates the settings for an account that has none. Get started does this for you. |
| `set-icon` | `icon` | The clone's emoji. |
| `set-personality` | `personality` | How the clone sounds. |
| `set-routines` | `routines` | Your routines, replaced whole. |
| `allow` | `people`: each `personId` and `name` | Lets people ask the clone for work. |
| `disallow` | `personId` | Stops letting a person ask for work. |
| `watch` | `channels`: each `conversation` and `name` (or `null`) | Has the clone read channels in full. |
| `unwatch` | `conversation` | Stops the clone reading a channel in full. |
| `set-rule` | `personId`, `name`, `level`: `ignore` or `soft-ignore` | Ignores or soft-ignores a person. |
| `remove-rule` | `personId` | Stops ignoring or soft-ignoring a person. |
| `add-repository` | `path`, `remote` (`host/owner/name`, or `null` for none), `canMerge` | Links a folder of yours. Misha checks the folder and its remote first ([Linked folders](/reference/settings#linked-folders)). |
| `remove-repository` | `path` | Unlinks a folder; the folder stays as it is. |
| `set-merging` | `path`, `canMerge` | Lets workers merge pull requests in a linked folder's remote, or stops them. |
| `remember` | `text` | Keeps your words as the next note. |
| `forget` | `number` | Forgets a note; the notes after it move up a number. |
| `start-fresh` | None | The clone's next message starts a new session. |
| `set-runtime` | `runtime`: `claude-code` or `opencode` | Switches the runtime the clone runs on, which starts a new session there. |
| `set-model` | `runtime`, `choice`: `model` and `effort` (or `null`), or `null` for the default | The model and effort the clone thinks with on that runtime. |
| `set-compact-at-tokens` | `compactAtTokens`, or `null` for the default | When the clone's session is compacted. |
| `set-approval` | `gate`: `start-work` or `outgoing`, `isRequired` | Turns one **Require my approval** switch on or off. It counts from the next thing Misha starts or sends. |
| `set-connector` | `connector`, `isOn` | Adds or removes a connector, as **Add** and **Remove** in the Catalogue do. |
| `set-program` | `program`: `opencode` (GPT) or `github`, `isOn` | Adds or removes a program for Extensions to check. It grants nothing. |
| `set-unchecked-requests` | `isShown` | Whether Home also shows the Slack requests not checked yet. |
| `describe` | None | Changes nothing. |

People and channels are named by their Slack ids, which your Slack tools in the same session can find. The colleagues' commands, `hands off`, `hands on`, `pause` and `resume` aren't settings changes here: pause with `misha_pause` and `misha_resume`, and send the others in Slack.

## Examples {#examples}

Each example is a made-up call an agent in Leo Novak's own Claude Code makes after reading the settings at revision 41. In practice you ask in plain words, such as "link my shop-backend folder for Misha", and the agent makes the call.

Link a folder, with the remote its pull requests go to:

```json
{
  "mutation": {
    "type": "add-repository",
    "path": "/Volumes/Code/shop-backend",
    "remote": "github.com/shop/shop-backend",
    "canMerge": false
  },
  "expectedRevision": 41
}
```

Have the clone read #shop-backend in full:

```json
{
  "mutation": { "type": "watch", "channels": [{ "conversation": "CSHOPBACKEND", "name": "shop-backend" }] },
  "expectedRevision": 41
}
```

Switch the clone to OpenCode:

```json
{ "mutation": { "type": "set-runtime", "runtime": "opencode" }, "expectedRevision": 41 }
```

Pause Misha: call `misha_pause` with no input. It answers "Misha is paused: the clone and its Slack watching are stopped until it resumes, but for the owner's self-DM commands; your own sessions' Misha tools and workers keep working."
