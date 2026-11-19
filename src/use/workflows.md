---
title: Put Misha to work
description: "What you can ask Misha to do, what it needs for each request, and how a request ends: an answer, a reviewed pull request or a question back to you."
prev:
  text: Make it yours
  link: /use/make-it-yours
next: false
---

# Put Misha to work

Ask your clone in Slack the way you'd ask a colleague. A question gets a marked answer that names what it read. A longer job goes to workers, separate Claude Code or OpenCode sessions that each do one task, and ends at a reviewed pull request or, where you allow it, a change checked on dev. This page shows what to ask, what each request needs, and how it ends.

## Choose a first task {#choose-a-first-task}

Pick something you'd otherwise look up yourself, and connect only the service it needs on **Set up** ([Make it yours](/use/make-it-yours) shows how). Three made-up first tasks for an owner, Sam Rivera, in three roles, each sent in Sam's self-DM (the direct message to yourself in Slack):

- **A developer:** "What does shop/shop-backend do when the payment call times out?" The clone reads its copy of the repository and answers, naming the files. It needs the repository added on **Settings**.
- **A PM:** "What does SHOP-142 leave out of scope, and did Thursday's planning call change that?" The clone reads the ticket and the meeting's transcript. It needs **Jira and Confluence** and **Fireflies** on Set up.
- **A designer:** "Render the checkout screen from this Figma link and list its button labels." The clone renders the screen, attaches the image and lists the text. It needs **Figma** on Set up.

None needs a worker or changes anything, and colleagues get the same reads: Priya Nair asking in a `#shop-backend` thread Sam is in gets the same kind of answer.

## Who may ask for what {#who-may-ask}

The app decides which of three groups each turn belongs to, and gives it only that group's tools:

- **Anyone** the clone answers (a DM to you, a mention, a thread you're in, a channel you have it watch) gets answers from reads only.
- **You**, in your self-DM or in a message that starts with your icon, also get changes in connected services, the GitHub and AWS command lines, and the repositories' commit history.
- **You and those you allow** (Settings › **Who may ask me for work**) can start workers. Allowing Priya lets her ask for research or a fix, not use your direct change tools.

A turn that answers several messages gets only what every one of them may ask for.

## How a request ends {#request-to-outcome}

[![A request and its possible outcomes, from a Slack message through five paths to answers, changes, reviewed pull requests, dev, waits, stops and your decisions. The numbered list below describes it.](/diagrams/request-to-outcome.svg)](/diagrams/request-to-outcome.svg)

Select the diagram to open it full size.

1. A Slack message reaches your clone.
2. The clone reads the thread and judges the request. Staging, production, a release or someone else's code gets a one-line refusal.
3. **A question** one read settles gets a marked answer naming its source. If it needs more and the asker may not ask for work, the rest goes to you.
4. **Research** goes to a worker. The clone answers from its report, with sources and doubts, or tells you what to reconnect. A needed change goes on to delivery.
5. **Your own change** to a Doc, Sheet, ticket or page is made by the clone, which says what changed. Anyone else's request changes nothing.
6. **Delivery** runs analysis, a ticket, its GPT review, implementation and a GPT pull request review, and ends at a reviewed pull request. Only a repository that may merge and has its own `execute` command goes on to merge, deploy to dev and check the change there. It can wait for GPT, stop when the ticket changes hands, or ask you.
7. **Dependency updates** go to one orchestrator worker. Each pull request gets a GPT review, then merges and is checked on dev, stays reviewed and unmerged, is flagged for you, or waits for GPT. A report ends the run.

## Questions {#question-to-answer}

The clone answers what one lookup settles, and it reads before it answers, so a status such as merged or deployed comes from a read in that turn, not from memory. Tracing behaviour, comparing versions, a failure or sources that disagree is research: a researcher takes it when the turn may start workers, and otherwise the clone answers what it found and passes the rest to you. A question never becomes a ticket by itself.

What the clone does in its own turn, without a worker, with the groups above in **Who may ask**:

<!-- facts capabilities slack-context code-question code-history ticket-read ticket-change docs-read docs-change meeting-notes design-read github-cli aws-cli -->

Anyone the clone answers may get what it read, and its instructions tell it to leave out what you wouldn't share with them.

## Your changes in connected services {#connected-service-actions}

When your own message in that turn asks for it, the clone makes the change in the Doc, Sheet, ticket or page and says what it changed, first checking that a failed earlier turn didn't already do it. A request from an earlier turn or from anyone else changes nothing; the clone passes it on or asks you to ask again yourself. This direct path is separate from delivery, where workers write the ticket and the code. Figma and Fireflies only read: the clone can't edit a design or join a meeting.

## Research {#research}

A worker investigates; the requester hears that the clone is looking into it, then gets the answer with its sources, and you get a brief in your self-DM when the requester is someone else. For a reported incident the worker first proves it can read that environment's logs and data, since code alone shows what could happen, not what did, and until that evidence settles the cause the requester hears what is being checked, never a guess. A missing sign-in is a blocker: the clone names the connection to reconnect on Set up and keeps the work open. The researcher is read-only by its brief, not by a sandbox ([How Misha works](/understand/how-it-works) explains what workers can do).

## Delivery {#delivery}

A change request from you or someone you allow, which needs nothing more from you, goes through:

1. **Analysis**, when needed: where the change lands, and a sourced default for each open point.
2. **A ticket**, new or existing. The repository's own `create-ticket` command writes it when there is one; otherwise a worker writes it, labelled `auto`.
3. **A GPT review of the ticket**, when this delivery wrote or rewrote it: two rounds at most, then what's left goes to you.
4. **Implementation** on a branch, and a pull request.
5. **A GPT review of the pull request**, which leaves a reviewed pull request.

It goes further only when the repository has **May merge** on and its own `execute` command (in `.claude/commands/` or `.opencode/commands/`). Misha ships no such command: it is your project's delivery procedure, and the worker running it merges, deploys to dev, checks the change there and replies in the thread. Without it, delivery stops at the reviewed pull request even with May merge on.

**May merge** is an instruction, not a lock: Misha tells the clone each turn where merging is allowed and the clone passes that to the worker, but nothing in the app blocks a merge ([Settings and commands](/reference/settings#when-changes-apply) has the timing). Dev is the ceiling: staging, production and releases stay yours whoever asks. That is also an instruction to the clone and its workers, so what your GitHub and AWS accounts permit is the hard limit.

A colleague's code, branch and pull request are theirs: a change in their repository needs their approval in their own message, and otherwise a worker writes them a short ticket. One delivery runs per ticket, and a failed run is retried once before the clone says so and stops.

How a delivery can end:

<!-- facts endpoints delivery -->

## Reviews need GPT {#review-requirements}

Delivery and dependency runs have GPT, through OpenCode signed in to your OpenAI account, review the tickets they write and every pull request. While OpenCode is signed out or GPT is out of usage, the review waits: Claude never reviews in its place, and nothing switches to another provider. OpenCode is optional for answers and research only. A working sign-in on Set up doesn't prove a delivery succeeded; the worker's report says what it checked.

## Dependency updates {#dependency-updates}

A run you ask for, such as "work through the open Dependabot pull requests in shop/shop-backend", not daily maintenance. One orchestrator worker checks what each update breaks and offers, has fixes made on the pull request's own branch, gets a GPT review of each pull request's current head, and merges ready ones one at a time, checking each dev deploy first. At most two workers run at once, the orchestrator included, so its own workers run one after another. Dangerous updates come back to you with evidence and options; closing a pull request or telling the bot to ignore a version is yours, and proposals for new features stay proposals until you ask.

<!-- facts endpoints dependency-updates -->

## Follow the work and take it over {#follow-and-take-over}

The requester hears in the thread when the clone takes the work, needs an answer, and finishes or stops. When the requester is someone else, you get a one-line brief in your self-DM at the start and when it lands, stops or needs you, and a question only you can answer never goes into their thread. A made-up exchange in `#shop-backend`, where `:misha:` is Sam's icon:

> **Priya Nair:** @Sam Rivera the checkout total drops discount codes again, can you take a look?
>
> **Sam Rivera:** :misha: *On it, SHOP-142. I'll post here when the fix is ready for review.*

Home in the Misha window lists what is in flight under **Working on now** and what the clone posted and decided under **Recently**:

<Shot id="home" caption="Home with one answer and two workers in flight, and the clone's recent posts and decisions. Made-up example." />

Implemented, reviewed, merged, deployed and checked are different states, and Home shows that a worker runs, not which state it reached. To hand a delivery to a person, reassign its ticket or remove its `auto` label: the ticket is checked before each delivery step, when a delivery reports and before a merge, so the work stops at the next check, not at once. To stop new work at once, [pause Misha](/operate/manage); [Customise and reuse Misha](/reference/extensions) covers carrying on yourself.

## Ready for everyday use {#ready-for-everyday-use}

You can now choose a request, see what it needs, recognise the reply and the result, tell a wait or a blocker from a finished job, and stop further work. That is the end of getting started. Send colleagues [Talking with a clone](/understand/slack) so they know what they're talking to.

## Where to go next

Read on only if you want to:

- see how a Slack message reaches your clone and how workers take on longer jobs: [How Misha works](/understand/how-it-works)
- add your own skills and tools, or reuse Misha's parts: [Customise and reuse Misha](/reference/extensions)
- pause Misha, change what it may do, or update and remove it: [Control and maintain Misha](/operate/manage)
