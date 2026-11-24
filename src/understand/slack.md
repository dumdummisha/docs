---
title: Talking with a clone
description: "How to tell a person's reply from their clone's, what happens to messages you send, and how to stop the clone answering you."
prev: false
next:
  text: Want your own? Try it
  link: /start/try
---

# Talking with a clone

Some colleagues run a clone: an AI that answers routine Slack messages for them while they're busy. It posts from the person's own Slack account, so the name and picture are theirs. A clone reply can start with an emoji the person chose, with its text in italics. The person can switch it off with stealth mode, so a reply without it may still be the clone's, and it's a label, not proof: anyone can type the same emoji in italics.

Jump to [your messages](#your-messages), [work requests](#questions-and-work), [stopping replies](#stop-replies) or [if something is wrong](#if-something-is-wrong).

## How to tell who wrote it {#how-to-tell}

<figure class="chat-illustration">
  <figcaption class="chat-illustration__label">Illustration with made-up people, not a screenshot: a thread in #shop-backend. Bracketed notes are ours; Slack shows only the name.</figcaption>
  <ol class="chat-illustration__messages">
    <li class="chat-message">
      <p class="chat-message__meta"><strong>Emma Lee</strong> 23:04</p>
      <p>@Leo Novak does the refund call retry when the payment provider times out?</p>
    </li>
    <li class="chat-message">
      <p class="chat-message__meta"><strong>Leo Novak</strong> 23:05 <span class="chat-message__note">(the clone)</span></p>
      <p><img class="chat-message__emoji" src="/favicon.svg" alt=":misha:" width="18" height="18"> <em>No, it returns an error after the first timeout. I read <code>src/payments/refund.ts</code> in shop/shop-backend.</em></p>
    </li>
    <li class="chat-message">
      <p class="chat-message__meta"><strong>Leo Novak</strong> 09:12 <span class="chat-message__note">(Leo)</span></p>
      <p>Right. I'll add retries under SHOP-142.</p>
    </li>
  </ol>
</figure>

The clone's reply has the marker and italics (code stays plain). A reaction from Leo's account carries no marker and may come from the clone. Workers can also post from Leo's account. Misha sends their text as they wrote it, without adding the clone's emoji or italics. When it matters, ask Leo: every post the clone made is listed under **Recently** on Home in Misha's window, so Leo can check.

## What happens to your messages {#your-messages}

A message you send Leo can reach Leo's clone, and through it the AI provider Leo uses. Misha runs on Leo's Mac in Leo's signed-in Slack tab, sees everything Leo's account receives there, and passes the clone what is for Leo:

- a DM or group DM with Leo
- a message that mentions Leo
- a reply in a thread Leo started or wrote in
- a message in a channel Leo asked the clone to watch

Bots, apps and clones never start a reply, nor does a message calling only another clone by an emoji Misha has seen it use. In a watched channel the clone gets every message and is told to answer only what concerns Leo or Leo's work. Whatever reaches it, it may reply, react, do both or do nothing.

A message passed to the clone goes, with its conversation, to the provider of the model Leo chose for it: Anthropic through Leo's own Claude Code subscription, or a provider such as OpenAI through Leo's own OpenCode sign-in. Work it leads to runs in workers, separate Claude Code or OpenCode sessions, which can use another provider. On the Mac, the browser extension queues each new message until Misha saves it, Misha keeps a message for the clone until it is handled, whichever of Claude Code and OpenCode runs the clone keeps its conversation, and Misha records every clone post with no age limit. Details: [What is stored, and for how long](/privacy#storage).

The clone keeps one memory across all of Leo's conversations and is told to keep what you write to that conversation and Leo: an instruction, not a wall.

## Questions and work requests {#questions-and-work}

The clone answers from what it reads (the thread, a linked ticket, Leo's code) and names its sources. Only Leo and people Leo allows can start work such as research, a ticket or a code change. For anyone else the app gives the clone read-only tools, so it can't change a ticket, document or code for you; it passes what it can't finish to Leo privately.

The request and Leo's own standing instructions decide how allowed work is done and whether it is reviewed. Workers are told to deploy only to the development environment (dev), and a change to your own repository, document or pull request waits for your approval. Those are instructions the clone and workers are told to follow; the app doesn't enforce them. [Put Misha to work](/use/workflows) covers how a request ends.

Leo can have the app hold the clone's replies, and any work it would start, until Leo approves them; a new clone starts that way. So an answer can arrive late, or not at all when Leo declines it.

The clone is told never to promise Leo's time or opinions, and a confident answer can still be wrong: check with Leo before you act on it, especially in front of a client.

## Stop it answering you {#stop-replies}

Send either command as the whole message, in a one-to-one DM with Leo:

| Command | Where | What it does | Example |
| --- | --- | --- | --- |
| `soft-ignore me` | One-to-one DM with the owner | The clone answers you only when you call it with its icon. | `soft-ignore me` |
| `stop ignoring me` | One-to-one DM with the owner | The clone treats you like everyone else again. While it soft-ignores you, write the clone's icon in the message too, or the message never reaches it. | `:misha: stop ignoring me` |

<figure class="chat-illustration">
  <figcaption class="chat-illustration__label">Illustration with made-up people, not a screenshot: Max Becker's one-to-one DM with Leo Novak.</figcaption>
  <ol class="chat-illustration__messages">
    <li class="chat-message">
      <p class="chat-message__meta"><strong>Max Becker</strong> 10:20</p>
      <p>soft-ignore me</p>
    </li>
    <li class="chat-message">
      <p class="chat-message__meta"><strong>Leo Novak</strong> 10:20 <span class="chat-message__note">(the clone)</span></p>
      <p><img class="chat-message__emoji" src="/favicon.svg" alt=":misha:" width="18" height="18"> <em>Soft-ignoring you: I answer you only when you call me with :misha:.</em></p>
    </li>
    <li class="chat-message">
      <p class="chat-message__meta"><strong>Max Becker</strong> two weeks later</p>
      <p><img class="chat-message__emoji" src="/favicon.svg" alt=":misha:" width="18" height="18"> stop ignoring me</p>
    </li>
    <li class="chat-message">
      <p class="chat-message__meta"><strong>Leo Novak</strong> <span class="chat-message__note">(the clone)</span></p>
      <p><img class="chat-message__emoji" src="/favicon.svg" alt=":misha:" width="18" height="18"> <em>You are like everyone else again.</em></p>
    </li>
  </ol>
</figure>

In a group DM or a channel the words change nothing. When Misha processes the command, it drops your waiting messages without the emoji that the clone hasn't decided on yet, but a reply already prepared can still arrive.

Soft-ignore means fewer answers, not less collection: Misha still sees your messages, the clone still reads them in threads it answers for others, and history, earlier posts and what went to a provider stay. Ignoring you completely, keeping the clone out of one thread and pausing it altogether are Leo's to do.

## If something is wrong {#if-something-is-wrong}

If the clone said something wrong or committed to something, contact Leo, outside Slack if you like. A DM to Leo reaches the clone too, so say you want Leo: the clone is told to stop replying to you there when you ask for the person.

Ask Leo to correct or remove the post; the clone can't edit its own replies. Leo can pause the clone to stop new replies and work, but a pause takes back no post and undoes nothing done, such as a filed ticket.

## Want your own? {#want-your-own}

See [why to try it](/start/try) and [what setup involves](/start/get-started).
