---
title: Talking with a clone
description: "How to tell a person's reply from their clone's, what happens to messages you send, and how to stop the clone answering you."
prev: false
next:
  text: Want your own? Why try it
  link: /start/why
---

# Talking with a clone

Some colleagues run a clone: an AI that answers routine Slack messages for them while they're busy. It posts from the person's own Slack account, so the name and picture are theirs. Each clone reply starts with the emoji the person chose, and its text is in italics. That marker is a label, not proof: anyone can type the same emoji in italics.

Jump to [your messages](#your-messages), [work requests](#questions-and-work), [stopping replies](#stop-replies) or [if something is wrong](#if-something-is-wrong).

## How to tell who wrote it {#how-to-tell}

<figure class="chat-illustration">
  <figcaption class="chat-illustration__label">Illustration with made-up people, not a screenshot: a thread in #shop-backend. Bracketed notes are ours; Slack shows only the name.</figcaption>
  <ol class="chat-illustration__messages">
    <li class="chat-message">
      <p class="chat-message__meta"><strong>Priya Nair</strong> 23:04</p>
      <p>@Sam Rivera does the refund call retry when the payment provider times out?</p>
    </li>
    <li class="chat-message">
      <p class="chat-message__meta"><strong>Sam Rivera</strong> 23:05 <span class="chat-message__note">(the clone)</span></p>
      <p><img class="chat-message__emoji" src="/favicon.svg" alt=":misha:" width="18" height="18"> <em>No, it returns an error after the first timeout. I read <code>src/payments/refund.ts</code> in shop/shop-backend.</em></p>
    </li>
    <li class="chat-message">
      <p class="chat-message__meta"><strong>Sam Rivera</strong> 09:12 <span class="chat-message__note">(Sam)</span></p>
      <p>Right. I'll add retries under SHOP-142.</p>
    </li>
  </ol>
</figure>

The clone's reply has the marker and italics (code stays plain) and calls Sam by first name. A reaction from Sam's account carries no marker and may come from the clone. When it matters, ask Sam.

## What happens to your messages {#your-messages}

A message you send Sam can reach Sam's clone, and through it the AI provider Sam uses. Misha runs on Sam's Mac in Sam's signed-in Slack tab, sees everything Sam's account receives there, and passes the clone what is for Sam:

- a DM or group DM with Sam
- a message that mentions Sam
- a reply in a thread Sam started or wrote in
- a message in a channel Sam asked the clone to watch

Bots, apps and clones never start a reply, nor does a message calling only another clone by an emoji Misha has seen it use. In a watched channel the clone gets every message and is told to answer only what concerns Sam or Sam's work. Whatever reaches it, it may reply, react or do nothing.

A message passed to the clone goes, with its conversation, to Anthropic through Sam's own Claude Code subscription. Work it leads to runs in workers, separate Claude Code or OpenCode sessions, and can also reach OpenAI. On the Mac, the browser extension queues each new message until Misha saves it, Misha keeps a message for the clone until it is handled, Claude Code keeps the clone's conversation, and Misha records every clone post with no age limit. Details: [What is stored, and for how long](/privacy#storage).

The clone keeps one memory across all of Sam's conversations and is told to keep what you write to that conversation and Sam: an instruction, not a wall.

## Questions and work requests {#questions-and-work}

The clone answers from what it reads (the thread, a linked ticket, Sam's code) and names its sources. Only Sam and people Sam allows can start work such as research, a ticket or a code change. For anyone else the app gives the clone read-only tools, so it can't change a ticket, document or code for you; it passes what it can't finish to Sam privately.

Allowed work goes through reviews, workers deploy only to the development environment (dev), and a change in your own repository waits for your approval. Those are rules the clone and workers are told to follow; the app doesn't enforce them. [Put Misha to work](/use/workflows) covers how a request ends.

The clone is told never to promise Sam's time or opinions, and a confident answer can still be wrong: check with Sam before you act on it, especially in front of a client.

## Stop it answering you {#stop-replies}

Send either command as the whole message, in a one-to-one DM with Sam:

<!-- facts commands colleague -->

<figure class="chat-illustration">
  <figcaption class="chat-illustration__label">Illustration with made-up people, not a screenshot: Jonas Weber's one-to-one DM with Sam Rivera.</figcaption>
  <ol class="chat-illustration__messages">
    <li class="chat-message">
      <p class="chat-message__meta"><strong>Jonas Weber</strong> 10:20</p>
      <p>soft-ignore me</p>
    </li>
    <li class="chat-message">
      <p class="chat-message__meta"><strong>Sam Rivera</strong> 10:20 <span class="chat-message__note">(the clone)</span></p>
      <p><img class="chat-message__emoji" src="/favicon.svg" alt=":misha:" width="18" height="18"> <em>Soft-ignoring you: I answer you only when you call me with :misha:.</em></p>
    </li>
    <li class="chat-message">
      <p class="chat-message__meta"><strong>Jonas Weber</strong> two weeks later</p>
      <p><img class="chat-message__emoji" src="/favicon.svg" alt=":misha:" width="18" height="18"> stop ignoring me</p>
    </li>
    <li class="chat-message">
      <p class="chat-message__meta"><strong>Sam Rivera</strong> <span class="chat-message__note">(the clone)</span></p>
      <p><img class="chat-message__emoji" src="/favicon.svg" alt=":misha:" width="18" height="18"> <em>You are like everyone else again.</em></p>
    </li>
  </ol>
</figure>

In a group DM or a channel the words change nothing. When Misha processes the command, it drops your waiting messages without the emoji that the clone hasn't decided on yet, but a reply already prepared can still arrive.

Soft-ignore means fewer answers, not less collection: Misha still sees your messages, the clone still reads them in threads it answers for others, and history, earlier posts and what went to a provider stay. Ignoring you completely, keeping the clone out of one thread and pausing it altogether are Sam's to do.

## If something is wrong {#if-something-is-wrong}

If the clone said something wrong or committed to something, contact Sam, outside Slack if you like. A DM to Sam reaches the clone too, so say you want Sam: the clone is told to stop replying to you there when you ask for the person.

Ask Sam to correct or remove the post; the clone can't edit its own replies. Sam can pause the clone to stop new replies and work, but a pause takes back no post and undoes nothing done, such as a filed ticket.

## Want your own? {#want-your-own}

As of 19 November 2026, Misha is one unsigned build run by its owner, with no public download. See [why to try it and what it needs](/start/why) and [what setup involves](/start/get-started).
