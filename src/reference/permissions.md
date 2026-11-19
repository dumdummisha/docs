---
title: Browser permissions
description: "Each permission the Misha Browser extension asks for, what it lets the extension do, when data flows and its limits, and how browser access differs from macOS Accessibility and Screen Recording."
prev: false
next: false
outline: [2, 3]
---

# Browser permissions

The Misha Browser extension asks for access to every site, the requests every tab sends and a native messaging connection to your Mac. It needs that breadth for two jobs: Misha's Slack transport, which reads new messages in your signed-in Slack tab and posts for the Misha app, and the browser tools, which let an AI agent on your Mac read and drive your tabs. Each permission below says what it allows, why the extension asks for it, when data flows and what limits it.

<!--@generated: browser-source-->

The explanations on this page are the extension's own disclosures, rendered here rather than rewritten, from the same source the browser repository generates its Chrome Web Store text from. What happens to the data once it reaches the Misha app or an agent is in the [privacy policy](/privacy#data-flows).

## What the extension is for {#purpose}

<!--@generated: browser-introduction-->

The single purpose its listing states:

<!--@generated: browser-single-purpose-->

## Every declaration at a glance {#summary}

<!--@generated: browser-permission-table-->

<!--@generated: browser-not-requested-->

## Browser access and macOS grants {#macos-grants}

Browser permissions and macOS permissions are separate. The extension's permissions let it read pages, observe requests and capture a tab's visible part through the browser. Tools that move the real mouse, press keys or capture the whole screen go through one macOS input session instead, which needs Accessibility, to post mouse and keyboard events, and Screen Recording, for the screen capture. That session asks for both when it starts, and its input fails without either.

| What runs | Needs the extension and native host | Needs Accessibility and Screen Recording |
| --- | --- | --- |
| Misha's Slack transport | Yes | No |
| Browser tools that read or work through the extension: `tab_list`, `tab_read`, `tab_find`, `tab_wait`, `tab_screenshot`, `tab_network`, `tab_open`, `tab_switch`, `tab_close`, `tab_select_option` | Yes | No. `tab_screenshot` captures through the extension, not the screen. |
| Browser tools that act with real input: `tab_click`, `tab_drag`, `tab_type`, `tab_fill`, `tab_press`, `tab_scroll` | Yes | Yes |
| Desktop tools: every `macos_mouse_*` and `macos_keyboard_*` tool, and `macos_screen_capture` | No | Yes |
| `macos_list_apps` and `macos_focus_app` | No | No |

The grants go to the app that runs the agent (the terminal, the editor whose terminal you use, or the desktop app), not to the browser. The Return that accepts a download's save dialog after a browser action goes through the same input session. This follows the [misha-browser README](https://github.com/dumdummisha/misha-browser) at the commit above.

A permission says what the extension can do, not which agent may use it. Misha's clone does not get the general `tab_*` and `macos_*` tools by default: you register them with your own Claude Code or OpenCode, or an extension grants them to a worker. [Customise and reuse Misha](/reference/extensions) explains both routes.

## Each declaration {#declarations}

<!--@generated: browser-permission-details-->

## Slack transport limits {#slack-transport-limits}

These are the Slack Web API methods and message fields the extension's protocol allows, as the browser repository generates them from its code:

<!--@generated: browser-slack-transport-->

## Where Slack's credentials go {#where-slack-credentials-go}

<!--@generated: browser-credentials-->

## Native messaging {#native-host}

<!--@generated: browser-native-messaging-->

## Remote code {#remote-code}

<!--@generated: browser-remote-code-->

This statement describes the source. The extension has no store listing yet, and the built package's check for remote code is part of submitting it, not something this page shows.

## Related {#related}

The store's data-type answers, certifications and Limited Use statement are on the privacy page under [Chrome Web Store requirements](/privacy#store), and what the extension keeps in memory and on disk is under [In the browser](/privacy#browser-storage). The paste-ready store text is `docs/store-permissions.md` in [misha-browser](https://github.com/dumdummisha/misha-browser), generated from the same disclosures.
