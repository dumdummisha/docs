---
title: Browser permissions
description: "Each permission the Misha Browser extension asks for, what it lets the extension do, when data flows and its limits, and how browser access differs from macOS Accessibility and Screen Recording."
prev: false
next: false
outline: [2, 3]
---

# Browser permissions

The Misha Browser extension asks for access to every site, the requests every tab sends and a native messaging connection to your Mac. It has one purpose with two uses: Misha's Slack transport, which reads new messages in your signed-in Slack tab and posts for the Misha app, and the browser tools, which let an AI agent on your Mac read and drive your tabs.

::: warning The extension records every tab's requests automatically
From the moment it runs, it records the fetch and XHR requests every tab sends, request bodies and headers included, whether or not a tool is in use. The log stays in browser memory, with credentials redacted only by name and pattern, until a `tab_network` call returns it to a local agent.
:::

What happens to the data once it reaches the Misha app or an agent is in the [privacy policy](/privacy#data-flows).

## Source and purpose {#purpose}

<!--@generated: browser-source-->

The declaration table, the quoted limits and the exact disclosures on this page are the extension's own disclosure text, rendered from that file rather than rewritten; the macOS grant matrix is this page's own, from the tools' code. The browser repository generates its Chrome Web Store text from the same source. The single purpose its listing states:

<!--@generated: browser-single-purpose-->

## Every declaration at a glance {#summary}

Each row quotes the first sentence of the declaration's disclosure; the link opens the full text under [Exact reviewed disclosures](#declarations).

<!--@generated: browser-permission-table-->

<!--@generated: browser-not-requested-->

## Browser access and macOS grants {#macos-grants}

Browser permissions and macOS permissions are separate. The extension's permissions let it read pages, observe requests and capture a tab's visible part through the browser. Tools that move the real mouse, press keys or capture the whole screen go through one macOS input session instead, which needs Accessibility, to post mouse and keyboard events, and Screen Recording, for the screen capture. That session asks for both when it starts, and its input fails without either.

| What runs | Needs the extension and native host | Needs Accessibility and Screen Recording |
| --- | --- | --- |
| Misha's Slack transport | Yes | No |
| Browser tools that work only through the extension: `tab_list`, `tab_read`, `tab_find`, `tab_wait`, `tab_screenshot`, `tab_network`, `tab_open`, `tab_switch`, `tab_close` | Yes | No. `tab_screenshot` captures through the extension, not the screen. |
| `tab_select_option`, and `tab_fill` when it only picks options and submits nothing | Yes | No, except that `tab_select_option` presses Return through the input session when the choice starts a download that waits in the browser's save dialog |
| Browser tools that act with real input: `tab_click`, `tab_drag`, `tab_type`, `tab_press`, `tab_scroll`, and `tab_fill` when it types text or submits | Yes | Yes |
| Desktop tools: every `macos_mouse_*` and `macos_keyboard_*` tool, and `macos_screen_capture` | No | Yes |
| `macos_list_apps` and `macos_focus_app` | No | No |

The grants go to the app that runs the agent (the terminal, the editor whose terminal you use, or the desktop app), not to the browser. After a click, drag, typing or key press, the same save-dialog Return goes through the input session those tools already use. This matrix follows the browser tools' code at the commit above; the [misha-browser README](https://github.com/dumdummisha/misha-browser) groups `tab_select_option` with the extension-only tools without the download exception.

A permission says what the extension can do, not which agent may use it. Misha's clone does not get the general `tab_*` and `macos_*` tools by default: you register them with your own Claude Code or OpenCode, or an extension grants them to a worker. [Customise and reuse Misha](/reference/extensions) explains both routes.

## Limits to read first {#exceptions}

These are quoted from the declarations' limits. The storage limits, and what the extension keeps in memory and on disk, are under [In the browser](/privacy#browser-storage) on the privacy page.

<!--@generated: browser-exceptions-->

## Exact reviewed disclosures {#declarations}

The full disclosure for each declaration, with what it lets the extension do, why, when data flows and every limit, followed by the Slack transport limits, credential handling, native messaging and remote code statements.

<!--@generated: browser-introduction-->

<!--@generated: browser-permission-details-->

### Slack transport limits {#slack-transport-limits}

These are the Slack Web API methods and message fields the extension's protocol allows, as the browser repository generates them from its code:

<!--@generated: browser-slack-transport-->

### Where Slack's credentials go {#where-slack-credentials-go}

<!--@generated: browser-credentials-->

### Native messaging {#native-host}

<!--@generated: browser-native-messaging-->

### Remote code {#remote-code}

<!--@generated: browser-remote-code-->

This statement describes the source. The extension has no store listing yet, and the built package's check for remote code is part of submitting it, not something this page shows.

## Related {#related}

The store's data-type answers, certifications and Limited Use statement are on the privacy page under [Chrome Web Store requirements](/privacy#store). The paste-ready store text is `docs/store-permissions.md` in [misha-browser](https://github.com/dumdummisha/misha-browser), generated from the same disclosures.
