---
title: Talking with a clone
description: "How to tell a person's reply from their clone's, what happens to messages you send, and how to stop the clone answering you."
prev: false
next:
  text: Want your own? Decide whether to try it
  link: /start/decide
---

# Talking with a clone

Some colleagues run a clone: an AI that answers routine Slack messages for them while they're busy. It posts from the person's own Slack account, so the name and picture are theirs. Each reply the clone writes starts with the emoji the person chose for it, and its text is in italics. That marker is a label, not proof of who wrote a message: anyone can type the same emoji in italics.

Jump to [what happens to your messages](#your-messages), [questions and work requests](#questions-and-work), [stopping the clone answering you](#stop-replies) or [what to do if something is wrong](#if-something-is-wrong).

## How to tell who wrote it {#how-to-tell}

Priya Nair asks Sam Rivera a question late at night, and Sam follows up in the morning.

<figure class="chat-illustration">
  <figcaption class="chat-illustration__label">Illustration with made-up people, not a screenshot: a thread in #shop-backend. Notes in brackets are added here; Slack shows only the name.</figcaption>
  <ol class="chat-illustration__messages">
    <li class="chat-message">
      <p class="chat-message__meta"><strong>Priya Nair</strong> 23:04</p>
      <p>@Sam Rivera does the refund call retry when the payment provider times out?</p>
    </li>
    <li class="chat-message">
      <p class="chat-message__meta"><strong>Sam Rivera</strong> 23:05 <span class="chat-message__note">(the clone)</span></p>
      <p><img class="chat-message__emoji" src="/favicon.svg" alt=":misha:" width="18" height="18"> <em>No, it gives up after the first timeout and returns an error. I read <code>src/payments/refund.ts</code> in shop/shop-backend.</em></p>
    </li>
    <li class="chat-message">
      <p class="chat-message__meta"><strong>Sam Rivera</strong> 09:12 <span class="chat-message__note">(Sam)</span></p>
      <p>That's right. I'll add retries under SHOP-142 this week.</p>
    </li>
  </ol>
</figure>

The clone's reply has the marker in front and italic text, apart from code. It is told to speak as Sam's clone and to call Sam by first name. Sam's own message looks like any other. An emoji reaction from Sam's account carries no marker and may come from the clone, and a marker typed by hand looks the same as the clone's. When it matters who wrote something, ask Sam.

## What happens to your messages {#your-messages}

A message you send Sam can reach Sam's clone, and through it the AI provider Sam uses. Misha runs on Sam's Mac, works through Sam's signed-in Slack tab, and sees every message Sam's account receives there. It passes a message to the clone when it is for Sam:

- a DM or group DM with Sam
- a message that mentions Sam
- a reply in a thread Sam started or wrote in
- a message in a channel Sam asked the clone to watch

Posts by bots, apps and clones, Sam's own clone included, never start a reply, and a message that calls someone else's clone with that clone's emoji is left alone. Reaching the clone doesn't mean an answer: it can reply, react or do nothing, and in a watched channel it answers only what asks something of Sam or Sam's work.

A message passed to the clone goes, with the rest of its conversation, to Anthropic through Sam's own Claude Code subscription. Work it leads to goes to the workers' AI provider too, such as OpenAI. On Sam's Mac, Misha keeps the message until the clone has handled it, Claude Code keeps the clone's conversation, and Misha keeps a record of everything the clone posts, with no age limit. [Privacy and security](/privacy) lists what is kept and for how long.

The clone has one memory across all of Sam's conversations. It is told to keep what you write in one conversation there and with Sam, but that is an instruction, not a wall.

## Questions and work requests {#questions-and-work}

The clone answers a question from what it reads, such as the thread, a linked ticket or Sam's code, and names its sources. Anything needing more digging goes to a worker if you may ask for work; otherwise the clone tells you what it found and passes the rest to Sam privately.

Only Sam and the people Sam allows can start work such as research, a ticket or a code change. For anyone else the app gives the clone read-only tools, so your request can't change a ticket, document or code. Allowed work still goes through reviews, workers deploy only to the development environment (dev), and a change in your own repository waits for your approval. The app enforces the read-only tools; those other limits are rules the clone and its workers are told to follow. [Put Misha to work](/use/workflows) covers how a request ends.

The clone is also told never to promise anything of Sam's own, such as time, deadlines or opinions. And a confident answer can still be wrong: it may misread code or a ticket, or read a source that is out of date. Check anything you'll act on with Sam, especially in front of a client.

## Stop it answering you {#stop-replies}

You can ask the clone to answer you only when you call it with its emoji. Send the command as the whole message, in a one-to-one DM with Sam, and use the second one to undo it:

<!-- facts commands colleague -->

<figure class="chat-illustration">
  <figcaption class="chat-illustration__label">Illustration with made-up people, not a screenshot: Jonas Weber's one-to-one DM with Sam Rivera. Notes in brackets are added here.</figcaption>
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

The same words in a group DM or a channel change nothing. Your messages already waiting for the clone without the emoji are dropped when you send the command.

Soft-ignore means fewer answers. It doesn't stop Misha seeing your messages, the clone can still read them when it reads a thread to answer someone else, and it deletes nothing already kept or sent. Ignoring you completely, keeping the clone out of one thread, and pausing the clone altogether are Sam's to do, so ask Sam.

## If something is wrong {#if-something-is-wrong}

If the clone said something wrong or committed to something, contact Sam. A DM to Sam reaches the clone too, so say you want Sam, not the clone: it is told to stop replying to you in that conversation when you ask for the person. Or reach Sam outside Slack.

Only Sam can correct or delete the clone's post; the clone can't edit what it posted. Sam can also pause the clone, which stops new replies and new work, but pausing doesn't take back a post or undo what is already done, such as a ticket filed.

## Want your own? {#want-your-own}

As of 19 November 2026, Misha is one unsigned build run by its owner, with no public download. [Decide whether to try it](/start/decide) covers what it needs and costs, and [Get started](/start/get-started) what setup involves.
