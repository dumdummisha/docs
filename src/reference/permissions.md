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

These come from [`docs/store-disclosures.json`](https://github.com/dumdummisha/browser-extension/blob/f42082b9b258598af024c30790182ea4e7a65a4f/docs/store-disclosures.json) and the manifest of the public browser-extension repository at commit [f42082b](https://github.com/dumdummisha/browser-extension/commit/f42082b9b258598af024c30790182ea4e7a65a4f), the browser extension's version `0.1.0`, which needs Chrome 140 or later.

The declaration table, the quoted limits and the exact disclosures on this page are the extension's own disclosure text, rendered from that file rather than rewritten; the macOS grant matrix is this page's own, from the tools' code. The browser repository generates proposed Chrome Web Store text from the same source. Its declared single purpose:

> Misha Browser connects AI agents that run on the user's own Mac to the user's signed-in browser, so they can read pages and carry out the browser actions the user asks for. Misha's Slack transport is one such use: it reads new messages in the user's signed-in Slack tab and makes allowlisted Slack calls there for the Misha app. Both uses reach the browser through one native messaging host on the same Mac.

## Every declaration at a glance {#summary}

Each row quotes the first sentence of the declaration's disclosure. The link goes to the declaration under [Exact reviewed disclosures](#declarations), where its full text opens.

| Declaration | What it lets the extension do | When data flows |
| --- | --- | --- |
| [`nativeMessaging`](#native-messaging) | Exchanges messages with the native messaging host `misha.browser_bridge`, a program the user installs on their own Mac. | Automatic |
| [`scripting`](#scripting) | Runs the extension's own bundled functions, and its bundled relay script, in a tab: in the page's own world or in the extension's isolated world. | On a Slack tab, on a Misha app request, on a browser tool request |
| [`alarms`](#alarms) | Wakes the service worker every 30 seconds. | Automatic |
| [`unlimitedStorage`](#unlimited-storage) | Exempts the extension's own storage from Chrome's quota and from eviction under storage pressure. | On a Slack tab |
| [`tabs`](#tabs) | Reads every open tab's title and URL, and opens, focuses and closes tabs. | On a Slack tab, on a browser tool request |
| [`webRequest`](#web-request) | Observes the fetch and XHR requests every tab sends: method, URL, request body, request headers (cookies included) and the status or error that ends each one. | Automatic |
| [`downloads`](#downloads) | Searches the browser's download list. | On a browser tool request |
| [Host permission `<all_urls>`](#all-urls) | Gives the extension access to every site: to script any page, to observe any page's requests with `webRequest`, and to capture the visible part of a tab. | Automatic, on a browser tool request |
| [Content script `observer.js`](#observer-js) | Watches Slack's own real-time socket. | On a Slack tab |
| [Content script `relay.js`](#relay-js) | Takes a private channel from the observer, checks every message on it against the protocol's shapes, and forwards new messages and the socket's state to the service worker. | On a Slack tab |

The manifest asks for no other permission. Among those it does not request: `debugger`, `cookies`, `webRequestBlocking`, `history`, `bookmarks`.

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

The grants go to the app that runs the agent (the terminal, the editor whose terminal you use, or the desktop app), not to the browser. After a click, drag, typing or key press, the same save-dialog Return goes through the input session those tools already use. This matrix follows the browser tools' code at the commit above; the [misha-browser README](https://github.com/dumdummisha/browser-extension) groups `tab_select_option` with the extension-only tools without the download exception.

A permission says what the extension can do, not which agent may use it. Misha's clone does not get the general `tab_*` and `macos_*` tools. Add **Browser control** from the **Catalogue** on **Extensions** to make them available in your own Claude Code and OpenCode sessions; workers you start there also need a profile that grants the tools. That connector serves neither the Slack clone nor the workers it starts. Registering the standalone misha-browser server with your own Claude Code or OpenCode remains a separate route.

## Limits to read first {#exceptions}

These are quoted from the declarations' limits. The storage limits, and what the extension keeps in memory and on disk, are under [In the browser](/privacy#browser-storage) on the privacy page.

| Limit | What the disclosure says | Full disclosure |
| --- | --- | --- |
| Request recording and its redaction | Chrome exposes each request's body and headers, credentials included, to the service worker temporarily, for redaction. It redacts them before it records the request: a body field, query parameter or header named like a token, password, secret, API key, authorization or cookie, and any value shaped like a known token or key, is replaced with `[redacted]`. Matched credential values are replaced before storage; an unrecognized credential can remain. The redaction looks for credentials only. The rest of a body is recorded as the page sent it, so personal, health, financial or location data a site posts in a request is kept as it is. | [`webRequest`](#web-request) |
| What a page shows | Page text a tab command returns (an outline, search hits, the lines a change report lists, tab and page titles, ordinary field values, element descriptions, option labels, download file names and error messages) has each span shaped like a known credential replaced with `[redacted]`: Slack, GitHub and Google tokens, AWS access key ids, OpenAI and Anthropic API keys, JSON Web Tokens, Bearer values and PEM private keys. The rest of the text stays as the page shows it. A search matches the unredacted page in the page's isolated world; change reports and navigation compare unredacted outlines and URLs in the service worker, so unredacted page text and ordinary field values reach the service worker, which redacts what it returns to the native host. This is known credential-shape redaction, not a secret detector. A credential of another form, a password written in plain page text, and a private key whose BEGIN line falls outside what the read captured (off screen for a viewport read, past a read's character limit) come back as the page shows them. Words made only of letters and digits that follow a private key cut off before its END line are redacted with it, since text alone cannot tell them from the key's body. Screenshots are not redacted: `tab_screenshot` returns the pixels the tab shows, including any credential on screen. Page text, control names, field values and screenshots also come back with any personal, health, financial or location data the page displays. | [`<all_urls>`](#all-urls) |
| Password fields | A password field's value comes back only as filled or empty in an outline, or as its length in a field read. A field read, which the typing tools make while they type, still reads the raw value: the extension keeps the last value it read from each field, a password field's included, in the page's isolated world, to tell whether the value changed between reads even when the values it returns read the same after redaction, and keeps it until a later read of that field replaces it or the document unloads. The page's own scripts cannot see the isolated world. | [`scripting`](#scripting) |
| The pending Slack queue | A stored event has no age limit. It stays, and is forwarded again, until the Misha app acknowledges it. | [`unlimitedStorage`](#unlimited-storage) |
| Slack's activity session | Slack's web client reads the same entry in any of the browser profile's Slack tabs with the same key: every workspace of one Enterprise Grid shares the Grid's entry, and a workspace outside a Grid has its own. A tab on a workspace with another key reads another entry. For 60 seconds after each Slack call, its own Web API calls carry that session. Its usage reporting also reports the sessions it finds in the entry to Slack as time spent in Slack: a start, refreshes while a session stays active, and an end once it goes idle. So the Slack calls the Misha app makes count in Slack's usage reporting as the user's own activity. | [`scripting`](#scripting) |
| Download reports | The search covers the whole browser, not only the tab the action ran in, so a download started elsewhere in that time is reported too. | [`downloads`](#downloads) |
| Slack calls and uploads | Slack calls are limited to the Web API methods listed under Slack transport limits. A download is fetched only from `files.slack.com`, with redirects refused. An upload's bytes go to the upload URL Slack's answer names, whose host the extension does not check, with redirects refused (see Where Slack's credentials go). | [`scripting`](#scripting) |
| The native host | The host only relays: it passes messages between the extension and processes of the same user on the same Mac (the Misha app, misha-browser's MCP server) and stores none of them. | [`nativeMessaging`](#native-messaging) |

## Exact reviewed disclosures {#declarations}

Each declaration's full disclosure (what it lets the extension do, why, when data flows and every limit) is collapsed under its heading; open the one you need. The Slack transport limits and the credential handling, native messaging and remote code statements follow in full.

The Misha Browser extension (`src/extension/manifest.json`) asks for the permissions below. The extension has no backend of its own and loads no remote code. Everything it returns goes to the native messaging host on the user's own Mac. The Slack Web API calls and file downloads it makes run inside the user's signed-in Slack page and go to the workspace's address on Slack's domain and to `files.slack.com`. A file upload goes to the upload URL that Slack's Web API answered for it, whose host the extension does not check.

The extension does two jobs. Its Slack transport reads new messages in the user's signed-in Slack tab and makes allowlisted Slack Web API calls there for the Misha app. Its tab commands let the browser tools of misha-browser's MCP server (`tab_*`) read and drive the user's tabs.

### `nativeMessaging` {#native-messaging}

::: details Full disclosure: what it allows, why, when data flows, every limit

**What it lets the extension do:** Exchanges messages with the native messaging host `misha.browser_bridge`, a program the user installs on their own Mac.

**Why:** Every request reaches the extension this way: the Misha app's Slack requests and the browser tools' tab commands. Replies, new Slack messages and the extension's status go back the same way. The extension has no backend of its own, so nothing on the Mac could reach it otherwise.

**When data flows:** Automatic. The extension connects when it starts and keeps the connection open. New Slack messages and status go to the listening process as they happen; everything else goes only as the reply to a request.

**Limits:**

- The extension connects to no other native host, and the host's registration lets only this extension start it.
- The host only relays: it passes messages between the extension and processes of the same user on the same Mac (the Misha app, misha-browser's MCP server) and stores none of them.
- With no process listening, the host drops events and status. The extension keeps the events in its pending queue (see `unlimitedStorage`).

:::

### `scripting` {#scripting}

::: details Full disclosure: what it allows, why, when data flows, every limit

**What it lets the extension do:** Runs the extension's own bundled functions, and its bundled relay script, in a tab: in the page's own world or in the extension's isolated world.

**Why:** In a signed-in Slack tab it reads which workspace and user the tab is signed in as, from Slack's saved client state, and makes the allowlisted Slack Web API calls, file downloads and uploads the Misha app asks for. Right before each Web API call it records activity in Slack's own activity session for the workspace, in the page's localStorage, as Slack's web client does while someone uses the tab, so the call carries the session id the client's own calls carry. After the extension reloads or updates, it injects the extension's own relay script again into each open Slack tab whose relay the browser has cut off, so capture goes on without reloading the tab (see the content scripts below). It first checks, in the extension's isolated world, that the tab's top document is a page on `https://app.slack.com` with no relay of the running extension, and injects into that document only, never into a page the tab navigated to meanwhile. In the tab a browser tool names, it reads the page as an outline of its text and controls (`tab_read`, `tab_find`), finds where a control sits so the tool can click or type into it, reads a form field's state, selects a field's content before typing replaces it, picks an option in a select, reports where the pointer is and whether the page has focus, and waits until the page stops changing after an action.

**When data flows:** On a Slack tab, on a Misha app request, on a browser tool request. On Slack tabs it runs without a request: the relay check when the service worker starts, and the account read for each new message and, while a process listens, whenever the extension reports its status (a listener attaching, a Slack tab loading or closing, a change in a tab's capture or in the queue). Slack calls, downloads and uploads run only when the Misha app asks for one. Page commands run only when a browser tool asks, but the pointer listener that locating a target or taking a screenshot starts in a page keeps running after the tool finishes (see limits).

**Limits:**

- Everything it runs is part of the extension's package; no code comes from the network or the native host.
- The function that runs in Slack's page returns only the account's ids and the workspace's name, Slack's answers (an upload's ticket among them, whose upload URL the service worker holds only until it has sent the bytes, and never sends to the app), file bytes, or whether an upload's bytes were taken. It does not return the saved session token, though Chrome exposes the token it sends to the service worker temporarily, for redaction (see `webRequest` and Where Slack's credentials go).
- The function that runs in Slack's page returns only the account's ids and the workspace's name, Slack's answers (an upload's ticket among them, whose upload URL the service worker holds only until it has sent the bytes, and never sends to the app), file bytes, or whether an upload's bytes were taken. It does not return the saved session token, though Chrome exposes the token it sends to the service worker temporarily, for redaction (see `webRequest` and Where Slack's credentials go).
- The one thing the function that runs in Slack's page writes there is Slack's own activity-session entry for the workspace in the localStorage of `https://app.slack.com` (`activitySession_` and the team id, or the enterprise id in an Enterprise Grid), right before each Web API call, an upload's `files.getUploadURLExternal` and `files.completeUploadExternal` included: it extends the active session or starts a new one, and prunes entries idle for over a day, as Slack's web client does on a user's input. The entry holds session metadata: each session's id, start and last activity, and for a new session the version of Slack's session definition. Fields Slack's client stored on a session (whether it ended, what its usage reporting has queued) stay as stored. It holds no message content or credential. Fetching a file's bytes and posting an upload's bytes record nothing.
- Slack calls are limited to the Web API methods listed under Slack transport limits. A download is fetched only from `files.slack.com`, with redirects refused. An upload's bytes go to the upload URL Slack's answer names, whose host the extension does not check, with redirects refused (see Where Slack's credentials go).
- Page commands run in the extension's isolated world and read the page's DOM only: not a page's localStorage, Slack's saved session or the cookie store.
- When page commands walk the page for an outline or a search, they skip script and head content, hidden inputs and elements the page does not show. That filter decides which elements the walk visits, not what a visited element can reveal. A visible label whose control the page hides (a styled checkbox) is listed with that control's role, name and current state, so the value of a text field the page hides can appear in an ordinary outline, a password field's still only as filled or empty. A control's name can also come from label or `aria-labelledby` text the page hides. A ref the walk handed out keeps working while its element stays in the page, even after the page hides it, and a field read through that ref returns the field's current value, hidden or not. Reading the region of a ref lists the control the ref names without checking its visibility.
- A password field's value comes back only as filled or empty in an outline, or as its length in a field read. A field read, which the typing tools make while they type, still reads the raw value: the extension keeps the last value it read from each field, a password field's included, in the page's isolated world, to tell whether the value changed between reads even when the values it returns read the same after redaction, and keeps it until a later read of that field replaces it or the document unloads. The page's own scripts cannot see the isolated world.
- The first time a browser tool locates a target in a page, which clicks, drags, scrolling, typing into a referenced field and screenshots do, the extension starts listening for mouse movement in that document and keeps listening until the document unloads, whether or not a tool is acting. Key presses, picking an option and typing into the focused element do not start it. It keeps only the latest pointer position and a count of moves, not a history, and sends them only when a browser tool asks for them while it moves the pointer.
- Before a click, a drag, a key press, picking an option, or typing that submits or goes to the focused element, the extension records the page's unredacted outline (its text, controls and ordinary field values, with a password field only as filled or empty) and URL in the service worker's memory, to report what the action changed; the report it returns is redacted (see host access). The record stays until another of those actions in that tab records a new one, the tab closes or the service worker stops. Opening or navigating to a page, reading it, scrolling and typing into a referenced field without submitting do not replace it, so the record of a page can stay after the tab has left it.
- A downloaded Slack file's bytes stay in the service worker's memory until the Misha app pulls the last chunk, and an upload's chunks until the app asks to prepare the upload. Neither has a timeout: a transfer the app abandons stays until the service worker stops, and closing the Slack tab or disconnecting the app does not clear it.
- While the connection to the native host is open, Chrome keeps the service worker running, so what stays in its memory until the worker stops can stay for as long as the browser runs.

:::

### `alarms` {#alarms}

::: details Full disclosure: what it allows, why, when data flows, every limit

**What it lets the extension do:** Wakes the service worker every 30 seconds.

**Why:** On each alarm the extension reconnects to the native messaging host when the connection is down, for example before the user has installed the host or after it stopped.

**When data flows:** Automatic. The alarm fires on its schedule. It carries no data.

**Limits:**

- While the connection is open, the alarm does nothing.

:::

### `unlimitedStorage` {#unlimited-storage}

::: details Full disclosure: what it allows, why, when data flows, every limit

**What it lets the extension do:** Exempts the extension's own storage from Chrome's quota and from eviction under storage pressure.

**Why:** The Slack transport keeps its pending queue in IndexedDB, in the extension's own origin: each new Slack message waits there until the Misha app confirms it saved it, so a message the database stored survives a service worker or browser restart. Without this permission Chrome may evict the extension's IndexedDB under storage pressure, taking the queued messages and the count of lost ones with it.

**When data flows:** On a Slack tab. A new message is stored as soon as a Slack tab's capture hands it over, and removed when the Misha app acknowledges it, which the app does only after saving it on its side. While writes to the database fail, a new message is held in the service worker's memory instead and forwarded from there without being stored.

**Limits:**

- The durable queue holds at most 2000 pending events. When it is full, a new event is not stored: it is counted as lost, and the Misha app sees the count in the extension's status.
- While writes to the database fail, the extension holds new events in the service worker's memory, up to a separate limit of 2000, and forwards them from there. An event past that limit is lost, and its loss is counted in memory only. The status reports the failure, the number of held events and that in-memory count.
- The first write that succeeds after a failure stores the held events the Misha app has not acknowledged yet, as far as the durable queue has room. It counts the rest as lost, and adds the in-memory count to the stored one.
- A service worker or browser restart while writes fail loses every held event the Misha app has not acknowledged, and the in-memory count of lost ones, with no record of either.
- A stored event has no age limit. It stays, and is forwarded again, until the Misha app acknowledges it.
- A stored event holds the account it came to and the message cut down to the fields listed under Slack transport limits.
- Nothing else the extension owns is written to disk: the network log (see `webRequest`), page outlines and file transfers (see `scripting`) stay in the service worker's memory. Apart from its own storage, the function that runs in Slack's page writes Slack's activity-session entry to the localStorage of `https://app.slack.com`, which the browser keeps on disk for Slack's origin (see `scripting`).

:::

### `tabs` {#tabs}

::: details Full disclosure: what it allows, why, when data flows, every limit

**What it lets the extension do:** Reads every open tab's title and URL, and opens, focuses and closes tabs.

**Why:** `tab_list` lists the open tabs with their titles and URLs, and `tab_open`, `tab_switch` and `tab_close` open, focus and close tabs. The Slack transport uses it to find the open Slack tabs and to report its status again when one loads or closes.

**When data flows:** On a Slack tab, on a browser tool request. Tab titles and URLs leave the extension only in the reply to a browser tool. The Slack transport finds the Slack tabs without a request, and reports for each only the account it is signed in as and how its capture stands.

**Limits:**

- Each structured URL field a tab command returns (a tab's, a page's or a download's) goes through the name- and pattern-based redaction described under `webRequest`, which also removes a URL's userinfo and the grant in Slack's upload URLs.
- An opaque link that grants access under an ordinary name passes unchanged, and a URL that appears in page text or a field value gets only the known credential-shape redaction of page text (see host access).
- A tab's title goes through the known credential-shape redaction of page text described under host access.

:::

### `webRequest` {#web-request}

::: details Full disclosure: what it allows, why, when data flows, every limit

**What it lets the extension do:** Observes the fetch and XHR requests every tab sends: method, URL, request body, request headers (cookies included) and the status or error that ends each one. On Slack's own pages it also reads the requests Slack's web client sends to Slack, to check that the Slack transport's requests look like the client's.

**Why:** `tab_network` lists a tab's requests so the model can learn the API a web app calls, and the action tools wait for the requests an action started before they read the page again. The Slack transport compares each of its requests with the client's request for the same operation, so the Misha app can show when the transport's requests stop looking like the client's.

**When data flows:** Automatic. Observation does not wait for a tool: the service worker records every tab's fetch and XHR requests for as long as it runs, whether or not a browser tool is in use. A tab's log leaves the extension only when `tab_network` asks for it. The Slack transport reads Slack's client requests the same way, without a request; it keeps only what the limits below name, and the check's result leaves the extension only in the status the Misha app receives, as names.

**Limits:**

- It only observes, and never blocks or changes a request.
- Chrome exposes each request's body and headers, credentials included, to the service worker temporarily, for redaction. It redacts them before it records the request: a body field, query parameter or header named like a token, password, secret, API key, authorization or cookie, and any value shaped like a known token or key, is replaced with `[redacted]`. Matched credential values are replaced before storage; an unrecognized credential can remain.
- The redaction looks for credentials only. The rest of a body is recorded as the page sent it, so personal, health, financial or location data a site posts in a request is kept as it is.
- The log holds the latest 200 requests per tab and a request body up to 20,000 characters, and never stores response bodies.
- The log lives only in the service worker's memory and is never written to disk. A tab's log goes when the tab closes, and the whole log goes when the service worker stops, which an open connection to the native host can put off for as long as the browser runs.
- Requests no tab sent, such as the browser's own or another extension's, are not recorded.
- On Slack's pages, for the Slack transport, the service worker keeps from the requests Slack's client sends only what its rules allow, cut down inside the listener before anything holds it: the field names of the requests of the operations the transport performs, the values of listed transport fields that match their expected forms (browser headers such as `user-agent` and `accept`, the media type of `content-type`, the client's own `_x_mode`, `_x_sonic` and `_x_app_name` fields). It never keeps the token, the cookie, a call's arguments, a message, a file's address or an upload URL from those requests, and never a field name shaped like a secret. This stays in the service worker's memory until it stops.
- The transport check's result leaves the extension in the status the Misha app receives: per operation, unchecked, matching, or the names of the fields that differ, never a value. It compares the request envelope (header names and listed header values, query field names, the client's own `_x_` body fields and the encoding), and leaves out `_x_id`, `_x_reason` and every other body field, which are the call's arguments.

:::

### `downloads` {#downloads}

::: details Full disclosure: what it allows, why, when data flows, every limit

**What it lets the extension do:** Searches the browser's download list.

**Why:** After a browser tool's action, the extension reports the downloads started since the action began (each one's URL, local filename, state, bytes received and any error), so the tool can tell the model that a click downloaded a file, whether it finished, and whether the browser waits for the user to choose where to save it.

**When data flows:** On a browser tool request. After a browser tool's action, never on its own. The extension listens for no download events.

**Limits:**

- The search covers the whole browser, not only the tab the action ran in, so a download started elsewhere in that time is reported too.
- A download's URL goes through the name- and pattern-based redaction described under `webRequest`, which can leave an unrecognized credential.
- The extension only searches the download list. It never starts, opens or deletes a download.

:::

### Host permission `<all_urls>` {#all-urls}

::: details Full disclosure: what it allows, why, when data flows, every limit

**What it lets the extension do:** Gives the extension access to every site: to script any page, to observe any page's requests with `webRequest`, and to capture the visible part of a tab.

**Why:** The browser tools work on whatever site the user has open, so the sites cannot be named in advance. The tools read and drive a page with `scripting`, and `tab_screenshot` captures the visible part of a tab.

**When data flows:** Automatic, on a browser tool request. A page's content and screenshots are read only when a browser tool asks. Request observation under `webRequest` runs on every site without a request. The Slack transport's capture in Slack tabs is described under the content scripts below.

**Limits:**

- Page text a tab command returns (an outline, search hits, the lines a change report lists, tab and page titles, ordinary field values, element descriptions, option labels, download file names and error messages) has each span shaped like a known credential replaced with `[redacted]`: Slack, GitHub and Google tokens, AWS access key ids, OpenAI and Anthropic API keys, JSON Web Tokens, Bearer values and PEM private keys. The rest of the text stays as the page shows it. A search matches the unredacted page in the page's isolated world; change reports and navigation compare unredacted outlines and URLs in the service worker, so unredacted page text and ordinary field values reach the service worker, which redacts what it returns to the native host.
- This is known credential-shape redaction, not a secret detector. A credential of another form, a password written in plain page text, and a private key whose BEGIN line falls outside what the read captured (off screen for a viewport read, past a read's character limit) come back as the page shows them. Words made only of letters and digits that follow a private key cut off before its END line are redacted with it, since text alone cannot tell them from the key's body.
- Screenshots are not redacted: `tab_screenshot` returns the pixels the tab shows, including any credential on screen. Page text, control names, field values and screenshots also come back with any personal, health, financial or location data the page displays.
- The extension reads the localStorage of no page but Slack's, where its own code reads the saved client state and reads and writes Slack's activity-session entry for the workspace (see `scripting`), and it never reads the cookie store.

:::

### Content script `observer.js` {#observer-js}

::: details Full disclosure: what it allows, why, when data flows, every limit

Declared on `https://app.slack.com/*`, from `document_start`, in the page's own world, in the top frame only.

**What it lets the extension do:** Watches Slack's own real-time socket. It passes each new message to the relay, cut down to the fields the Misha app reads (listed under Slack transport limits), with the account the tab showed when it came, and reports whether the socket is open. It reads the signed-in user's id from Slack's saved client state to key each message. It also receives the page's resource timing entries and reads each one's initiator type and start time. It reads the address only of the XHR requests Slack's web client sends, keeps per workspace API the listed session fields of the client's latest Web API call (such as `_x_csid`, `slack_route` and `_x_version_ts`), and drops the rest of the address as it reads it.

**Why:** Slack's web client receives new messages on this socket, and the Misha app needs them as they arrive to answer in Slack. The script runs before Slack's own scripts so it can watch the socket Slack opens. Slack answers a Slack Web API call made from the page only when it carries the session fields of the client's own calls, so the Slack transport sends its calls with the ones the observer kept. The observer runs for as long as the page does, so they outlast a restart of the service worker or a reload of the extension.

**When data flows:** On a Slack tab. Without a request, while a Slack tab is open: each new message is passed on as it arrives. Edits and deletions are not passed on. The client's session fields are kept automatically from page load for the document's lifetime, and each change goes to the relay as it happens.

**Limits:**

- It sends nothing on Slack's socket and never passes on the socket's address, which holds a token.
- Nothing else the page received leaves it, such as file URLs, profiles or message formatting.
- Message text goes on as written, including any credential someone wrote into a message.
- It holds up to 50 messages no relay has taken yet, such as those that come while the extension reloads, in the page's memory, and hands them to the next relay; past that the oldest is dropped.
- It holds up to 50 messages no relay has taken yet, such as those that come while the extension reloads, in the page's memory, and hands them to the next relay; past that the oldest is dropped.
- Of the page's resource timing entries it reads only the initiator type and start time, and the address only of XHR requests. Of a Web API call's address it keeps only the workspace API's origin and the listed session fields, each in its expected form: never the full address, the request id, the call's arguments or a value shaped like a known token or key, and no entry, body or header.
- Beside each workspace API's session fields it keeps the start time of the call they came from, only to tell which of the client's calls is the latest. That time never leaves the page.

:::

### Content script `relay.js` {#relay-js}

::: details Full disclosure: what it allows, why, when data flows, every limit

Declared on `https://app.slack.com/*`, from `document_start`, in the extension's isolated world, in the top frame only.

**What it lets the extension do:** Takes a private channel from the observer, checks every message on it against the protocol's shapes, and forwards new messages and the socket's state to the service worker. It receives the client's session fields the observer keeps, holds them in memory for the document's lifetime, and gives them to the service worker when the Misha app asks for a Slack Web API call.

**Why:** A script in the page's own world has no channel to the extension, so the observer needs a partner in the extension's world. Checking what the observer sends keeps anything outside the fixed shapes from reaching the extension.

**When data flows:** On a Slack tab. Without a request, while a Slack tab is open. When the extension reloads or updates, the browser cuts the relay in every open tab off from the extension and loads the manifest's scripts only into pages that load afterwards, so the service worker injects the relay again into each open Slack tab (see `scripting`). There it takes a new channel from the observer, which has kept watching the socket and held any new message that came while no relay ran, and gets the client's session fields the observer kept. It receives those fields automatically, and the service worker reads them only for a Slack Web API call the Misha app asks for.

**Limits:**

- It takes a channel only in the top frame of a page on `https://app.slack.com`.
- It passes on nothing that does not match the protocol's shapes, and reports the tab's capture as failed instead.
- Re-attaching works for pages whose observer holds new messages under a sequence number (any build from commit `51b179f` on). A page still running an observer from before that captures again only once the tab reloads, so upgrading from such a build needs each open Slack tab reloaded once.
- A page whose observer predates the client's session fields keeps capturing, but its Slack Web API calls fail with a message to reload the tab until it reloads once. Downloads and upload bytes, which use no session fields, still work there.

:::

### Slack transport limits {#slack-transport-limits}

These are the Slack Web API methods and message fields the extension's protocol allows, as the browser repository generates them from its code:

- Web API methods the extension calls when the Misha app asks: the reads `auth.test`, `chat.getPermalink`, `conversations.history`, `conversations.info`, `conversations.list`, `conversations.open`, `conversations.replies`, `emoji.list`, `search.messages`, `users.info`, `users.list`, the writes `chat.postMessage`, `chat.update`, `reactions.add`, `reactions.remove`, and for an upload `files.getUploadURLExternal`, `files.completeUploadExternal`.
- Fields a new message keeps when it leaves the page: `type`, `subtype`, `channel`, `channel_type`, `ts`, `user`, `bot_id`, `app_id`, `client_msg_id`, `text`, `thread_ts`, `parent_user_id`, and the id of each file it shares.
- A message is new when it has no subtype or one of `thread_broadcast`, `file_share`.

### Where Slack's credentials go {#where-slack-credentials-go}

The function the service worker injects into a Slack tab's own page (`src/service-worker/slack-page.ts`) is the only code that uses the Slack session token. For each call the Misha app asks for, it reads the token from Slack's saved client state, records activity in Slack's activity-session entry for the workspace, which holds no credential, adds the token to the request, and sends that request only to the workspace's https address on Slack's domain, with redirects refused. A private file is fetched only from `files.slack.com`, with the browser's cookies and no token, and redirects refused. An upload is different: its bytes go, without the token, to the `upload_url` in Slack's `files.getUploadURLExternal` answer, with the browser's default credentials and redirects refused. The extension checks only that the URL parses, not its host, and holds it in the service worker's memory between the upload's two stages, never sending it to the app; the browser sends cookies only when the URL is on the page's own origin, and Slack's usual upload URL, on `files.slack.com`, is not. It returns the account's ids and the workspace's name, Slack's answer, file bytes, or whether an upload's bytes were taken. It does not return the token it reads from Slack's saved client state, though a credential someone wrote into a message or a file comes back like any other content. Slack's answers and file bytes go on as Slack sent them, without credential filtering. A command that fails returns a fixed failure code, so no error message can quote what the page holds.

The script that watches Slack's socket reads only the signed-in user's id from the saved state and never passes on the socket's address, which holds a token. It sends only whether the socket is open, new messages cut down to fixed fields, with the account the tab showed, and the listed session fields of the client's latest Web API call per workspace, never the call's token or arguments. Message text goes on as written. Its partner script and the service worker reject anything outside those shapes. The native host passes messages between the extension and processes on the same Mac and keeps nothing.

The exception is `webRequest`. Chrome exposes the body and headers of every fetch and XHR request a tab sends, Slack's included, to the service worker temporarily, for redaction, so the token in the `token` field of Slack's API calls and the session cookie in the `Cookie` header reach it. It redacts both before it records the request, so `tab_network` shows them as `[redacted]`, and neither is stored or sent to the native host. The Slack transport's check reads the same requests on Slack's pages and keeps neither: inside the listener it drops every value but those of the listed transport fields.

What the tab commands can return, on the Slack tab or any other:

- The page commands behind `tab_read`, `tab_find` and field reads run in the extension's isolated world and read the page's DOM. They do not read Slack's saved session, a page's localStorage or the cookie store. Their walk of the page skips script and head content, hidden inputs and elements the page does not show, but a visible label lists the current state of the hidden control it stands for, a hidden text field's value included, a control's name can come from label text the page hides, and a ref the walk handed out keeps reading its element after the page hides it (see `scripting`). They give a password field's value only as filled or empty in an outline, or as its length in a field read, while keeping the last raw value of a field read in the page's isolated world (see `scripting`). Page text, control names and ordinary field values come back with only the spans shaped like a known token or key redacted (see host access), so a credential of another form the page displays comes back, and a credential pasted into a Slack message comes back through the Slack transport as written.
- `tab_screenshot` returns the pixels the tab shows, unredacted, including any credential on screen.
- Network requests and returned URLs are redacted by name and pattern only, page text by the known credential shapes only. An opaque credential under an ordinary name, such as the key in a share link, comes back unchanged.

Scripts that already run in the Slack page (Slack's own code, or another extension's) are out of scope: they hold the session themselves. The README's Security section states this threat model.

### Native messaging {#native-host}

The native messaging host is part of this repository (`src/host/`). The user installs it on their own Mac, and the installer registers it as `misha.browser_bridge` with Chrome, Brave or both, naming only this extension's id as allowed to start it. The browser starts the host when the extension connects.

The host relays between the extension and processes of the same user on the same Mac, over a socket in a folder only that user can open: the Misha app and misha-browser's MCP server connect there. Requests come in from those processes and replies go back to the process that asked. New Slack messages and status go to the one process that listens for them, and its acknowledgements go back to the extension. The host keeps none of it.

A request names a method from the extension's fixed set of handlers and carries data as its parameters. It never carries code, and a method the extension does not know is answered with an error.

### Remote code {#remote-code}

**Uses remote code:** No.

Every script the extension runs is in its package: the service worker, the two content scripts and the functions it injects with `scripting`, bundled from this repository's source without minification. The extension evaluates no string as code, and its schema library runs in its mode that generates no code. Requests from the native host name a method and carry data, never code. Slack messages and page content are data and never run as script.

This statement describes the source. The extension has no store listing yet, and the built package's check for remote code is part of submitting it, not something this page shows.

## Related {#related}

The store's data-type answers, certifications and Limited Use statement are on the privacy page under [Chrome Web Store requirements](/privacy#store). The paste-ready store text is `docs/store-permissions.md` in [browser-extension](https://github.com/dumdummisha/browser-extension), generated from the same disclosures.
