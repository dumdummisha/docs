---
title: Put Misha to work
description: "What you can ask Misha to do, what each request needs, how workers carry out work, and how routines, linked folders, reviews and your own limits shape it."
prev:
  text: Make it yours
  link: /use/make-it-yours
next: false
---

# Put Misha to work

Ask your clone in Slack the way you'd ask a colleague. A question gets a marked answer that names what it read. A longer job goes to workers, separate Claude Code or OpenCode sessions that each do one task, and ends in a pull request, a result in the thread or a question back to you.

## Choose a first task {#choose-a-first-task}

Pick something you'd otherwise look up yourself, and connect only the service it needs on **Set up** ([Make it yours](/use/make-it-yours) shows how). Three made-up first tasks, sent by an owner, Leo Novak, in his self-DM (the direct message to yourself in Slack):

- **A developer:** "What does shop-backend do when the payment call times out?" The clone reads the folder Leo linked and answers, naming the files. It needs that folder linked on **Settings**.
- **A PM:** "What does SHOP-142 leave out of scope?" The clone answers from the ticket. It needs **Jira and Confluence** on Set up.
- **A designer:** "Render the checkout screen from this Figma link and list its button labels." It needs **Figma** on Set up.

Each is one bounded read, so none needs a worker or changes anything. Emma Lee asking in a `#shop-backend` thread Leo is in gets the same kind of answer.

## Who may ask for what {#who-may-ask}

Each turn belongs to one of three groups and gets only that group's tools:

- **Anyone** the clone answers (a DM, a mention, a thread you're in, a channel you have it watch) gets answers from reads only.
- **You**, in your self-DM or in a message with your icon in it, also get changes in connected services, the GitHub and AWS command lines, and the linked folders' commit history.
- **You and those you allow** (Settings › **Who may ask me for work**) can start workers. Allowing Emma lets her ask for research or work, not use your direct change tools, and nothing she writes widens what her workers may do.

A turn that answers several messages gets only what every one of them may ask for.

## How a request ends {#request-to-outcome}

[![A request and its possible outcomes, from a Slack message through five paths to answers, changes, pull requests, waits, stops and your decisions. The numbered list below describes it.](/diagrams/request-to-outcome.svg)](/diagrams/request-to-outcome.svg)

Select the diagram to open it full size. Teal ends with a result, orange waits, red stops or refuses, yellow is your decision, and a dashed outline applies only when its condition holds.

1. A Slack message reaches your clone.
2. The clone reads the thread and judges the request.
3. Staging, production and a release are refused. A change to someone else's code or document needs their approval first.
4. **A question** one read settles gets a marked answer naming its source. If it needs more and the asker may not ask for work, the rest goes to you.
5. **Your own change** to a Doc, Sheet, ticket or page is made by the clone, which says what changed. If anyone else asks, nothing changes and it goes to you.
6. **Research** goes to a worker, which reports with sources and doubts. A confirmed problem goes on as work.
7. **Work** goes to workers and ends as [Work](#work) lists.

## Questions {#question-to-answer}

The clone answers what one lookup settles, and reads before it answers. Tracing behaviour, comparing versions or a failure is research, which needs a turn that may start workers. Without a worker, the clone can do this in its own turn:

| Request | Available as | Who may ask | Needs | Gives | Limit |
| --- | --- | --- | --- | --- | --- |
| Read the whole thread, a Slack message someone links, or an image someone posted, before answering | Included: Clone, in its own turn, answering in Slack | Anyone | Nothing beyond setup | An answer that takes in the whole thread and any message or image it links to | Reads as you, through your Slack tab. The clone posts only through Misha, never with a Slack tool of its own. |
| Answer what code does | Included: Clone, in its own turn, answering in Slack | Anyone | A folder linked on Settings | A marked answer naming the files it read | Reads your linked folders as they are on this Mac, uncommitted work included, which may not be what is merged. One bounded read; tracing behaviour across the code is research. |
| Say who changed something, when and why, from the commits | Included: Clone, in its own turn, answering in Slack | You | A folder linked on Settings | Who changed it, when and why, naming each commit by its short hash | By default the history of the branch each folder has checked out, and a remote's branches only as you last fetched them. A pull request's discussion is not in it. |
| Read Jira tickets and Confluence pages | Included: Clone, in its own turn, answering in Slack | Anyone | Jira and Confluence on Set up | An answer naming the ticket or page it read | Whoever the clone answers may get what it read. |
| Create, edit, comment on, link or move Jira tickets and Confluence pages | Included: Clone, in its own turn, answering in Slack | You | Jira and Confluence on Set up | The change, and a reply saying what changed | Only what your own messages in that turn ask for. Someone you allow to ask for work does not get these tools. |
| Read Google Docs and Sheets, comments included | Included: Clone, in its own turn, answering in Slack | Anyone | Google Workspace on Set up | An answer naming the Doc or Sheet it read | Whoever the clone answers may get what it read. |
| Create a Doc from text, edit a Doc, write to a Sheet, or comment on either | Included: Clone, in its own turn, answering in Slack | You | Google Workspace on Set up | The change, and a reply saying what changed | Only what your own messages in that turn ask for. |
| Find a meeting's transcript and answer from it | Included: Clone, in its own turn, answering in Slack | Anyone | Fireflies on Set up | An answer naming the meeting it read | Reads transcripts Fireflies already has. It does not join or record meetings. |
| Find a Figma screen, read its text and specs, or render it as an image in the reply | Included: Clone, in its own turn, answering in Slack | Anyone | Figma on Set up | The screen's text and specs, or its image attached to the reply | Reads and renders only. It cannot change a design. |
| Run GitHub CLI commands, such as reading a pull request's checks | Included: Clone, in its own turn, answering in Slack | You | The GitHub CLI signed in, which Set up checks | What the command showed, or what it changed | One command at a time, as your GitHub account. Never a staging or production deployment or a release. |
| Run AWS CLI commands in a session for the environments a question needs, such as reading logs | Included: Clone, in its own turn, answering in Slack | You | AWS on Set up | What the commands showed, or what they changed | One command at a time, as your AWS access. Never a staging or production deployment or a release. |

Anyone the clone answers may get what it read, and it is told to leave out what you wouldn't share with them. It changes a connected service only when your own message in that turn asks for it.

## Research {#research}

A worker investigates what one lookup can't settle. It needs:

- For a question about code, a folder linked on Settings
- For an incident, read access to that environment's logs and data

For a reported incident, the worker first proves it can read that environment's logs and data. Until that evidence establishes the cause, the requester hears what is being checked, never a guess. A missing or expired sign-in is a blocker: the clone names the connection to reconnect on Set up and keeps the work open. The researcher is read-only by its brief, not by a sandbox ([How Misha works](/understand/how-it-works) explains what workers can do).

## Work {#work}

Work is anything beyond an answer that you or someone you allow ask for, such as a fix or a meeting summary. The clone judges whether the request is the asker's to make and has workers do it. It replies in the thread with what happens next, checks each report against the request, and says once how the work ended, telling you what it decided and why.

Misha ships no ticket, review or deploy procedure: which tracker the work uses, whether anything is reviewed and how far it goes come from the request and your [routines](#routines). A fix Emma Lee asks for in `#shop-backend` is code work in a worktree of Leo's `shop-backend` folder. A planning meeting Leo asks to have summarised into a Google Doc needs no repository, so it runs in a scratch folder.

| Request | Available as | Who may ask | Needs | Gives | Limit |
| --- | --- | --- | --- | --- | --- |
| Make a change in your code, in a worktree of its own, up to a pull request | Included: Worker, started by the clone, which reports in Slack | You and those you allow | A folder linked on Settings, with the remote its pull requests go to | A pull request on the remote, merged only where workers may merge | How far it goes is the request's and your routines' call, within Settings. Staging, production and releases stay yours, and a change in someone else's repository needs their approval in their own message. |
| Do work that needs no repository, such as summarising a meeting or researching a ticket | Included: Worker, started by the clone, which reports in Slack | You and those you allow | The connectors the work reads, on Set up | What the worker found or made, reported in the thread | Runs in a scratch folder of its own. A routine can say how such work is done, and grants no access. |

How work can end:

| Outcome | What happens | When |
| --- | --- | --- |
| Ends with | An open pull request, not merged | The task calls for a pull request, and workers may not merge in the folder's remote |
| Ends with | The pull request merged | The task calls for a pull request, workers may merge in the folder's remote, and the request or your routines take the work that far |
| Ends with | The change in the worker's own worktree, which Misha keeps and lists on Home for you | The folder has no remote, so there is no pull request to open or merge |
| Ends with | The result, said once in the thread | The work is done, including work with no repository, which runs in a scratch folder |
| Waits | The step that depends on it waits, the rest goes ahead, and the thread hears who it waits on | A contract, a value or another change it depends on hasn't landed |
| Stops | No retry unless someone asks again, and whoever waits on it hears so | You pause Misha or stop the worker |
| Stops | The clone says it failed and stops | A worker's run fails again after one retry |
| Stops | A blocked report, and you hear which connection to reconnect on Set up | A sign-in is missing, expired or invalid |
| Stops | What their side needs, instead of a change | The change is to someone else's repository, document or pull request and they have not approved it in their own message |
| Stops | Refused: those stay yours, whoever asks | The request is for staging, production or a release |
| Your decision | One short question to you | A decision belongs to you or another owner |

## Routines {#routines}

On **Settings**, beside Personality, one optional field of up to 2000 characters holds your routines, your standing instructions for work, one per line: when something happens, do this, then tell me or ask me.

<figure class="shot"><img class="shot__image" src="/captures/settings-routines.png" alt="The routines card with Leo's standing instruction for a fix: a worker updates its ticket, fixes it in its own worktree with a regression test, and opens a pull request for review." width="1544" height="912" loading="lazy" decoding="async"><figcaption class="shot__caption">Leo Novak's routine for a fix: a worker updates the ticket, fixes it in its own worktree with a regression test and opens a pull request for his review. Made-up example.</figcaption></figure>

Get started offers a starting text for backend, frontend, data, product or design work, which you edit before you save. Later, change it on Settings or send `set routines <text>` in your self-DM, which replaces it whole. A routine applies when a request reaches the clone; nothing runs on a schedule.

Your own request comes first, then your routines, then the clone's defaults. A routine grants nothing: who may ask for work and where workers may merge stay in Settings. A colleague's message can't change your routines.

## Linked folders and who may merge {#linked-folders}

Work on code needs a folder you already have on this Mac. Link it on **Settings › Repositories** with the remote its pull requests go to, written as host/owner/name, or empty for a folder with no remote. Removing a folder unlinks it and leaves it as it is.

<figure class="shot"><img class="shot__image" src="/captures/settings-repositories.png" alt="The folders the clone reads: workers may merge in example.com/shop/shop-backend, not in example.com/shop/shop-web." width="1544" height="844" loading="lazy" decoding="async"><figcaption class="shot__caption">Two linked folders: workers may merge in example.com/shop/shop-backend, not in example.com/shop/shop-web. Made-up example.</figcaption></figure>

The clone reads a linked folder as it is, uncommitted work and files such as `.env` included. Nothing filters what is inside, so link only folders you're willing to have it read. It writes nothing in them.

A worker doing code work gets its own git worktree in `~/.misha/workers/worktrees`, outside your folder; work with no repository runs in `~/.misha/workers/scratch`. Misha removes a worktree only while it is exactly as it made it. Any other, and every worktree of a folder with no remote, is kept and listed on Home for you to remove.

### Who may merge {#who-may-merge}

**May merge** is a switch on each linked folder that has a remote. It starts off, so a pull request the work opens there stays open for someone to merge. Turn it on and the clone tells workers each turn that they may merge in that remote and only there. It allows a merge and doesn't ask for one: whether the work goes that far is up to the request and your routines. In your self-DM, `allow merging <folder>` and `stop merging <folder>` do the same, with the folder's full path. It is an instruction, not a lock: nothing in the app blocks a merge ([Settings and commands](/reference/settings#when-changes-apply) has the timing).

## Reviews {#reviews}

No review is built in. A review is a worker of its own that reads the change and reports, and you ask for one in the request or in a routine, naming the model if you want a particular one:

> When a worker opens a pull request, have a reviewer on GPT through OpenCode review it, then tell me what it found.

GPT needs OpenCode signed in to your OpenAI account, which Set up checks; with no model named, a worker runs on Claude. When the named model can't run, the clone retries once; if that also fails, it says so and stops. A reviewer is read-only by its brief, not by a sandbox, and its report is not a gate: the clone takes the next step your request or routines call for.

## What stays yours {#what-stays-yours}

- **Staging, production and releases.** The clone refuses them whoever asks. That is an instruction to the clone and its workers, so what your GitHub and AWS accounts permit is the hard limit.
- **The limits.** Who may ask for work, where workers may merge, which connectors are on and your routines change only by you: in the Misha window, by a command in your self-DM or through the [setup command](/reference/settings#setup-command).
- **Your decisions.** A decision that is yours comes as one short question, and only the step that depends on it waits.
- **Someone else's work.** It needs their own approval in their own message, not a request or a review finding.

## Follow the work and take it over {#follow-and-take-over}

The requester hears in the thread when the clone takes the work, needs an answer, and finishes or stops; when it is someone else, you also get a brief in your self-DM. A made-up exchange in `#shop-backend`, where `:misha:` is Leo's icon:

> **Emma Lee:** @Leo Novak the checkout total drops discount codes again, can you take a look?
>
> **Leo Novak:** :misha: *On it, SHOP-142. I'll post here when the fix is ready for review.*

Home lists the workers in flight under **Working on now**:

<figure class="shot"><img class="shot__image" src="/captures/home.png" alt="Home while Misha listens as Leo Novak in Shop: it is answering Emma's thread in #shop-backend, two workers are running, and what it posted and decided lately is listed below." width="2200" height="2214" loading="lazy" decoding="async"><figcaption class="shot__caption">Home with one answer and two workers in flight, and the clone's recent posts and decisions. Made-up example.</figcaption></figure>

To carry on yourself, open the branch and pull request if the work made one, or the worktree, which Misha keeps while it holds anything of its own.

To stop work, ask the clone in your self-DM to stop a worker, or [pause Misha](/operate/manage#pause), which tries to stop every worker on the clone's work, the ones a worker started included. Workers you start from your own Claude Code or OpenCode sessions keep running. If one can't be stopped, Home names it and you stop it by hand. Removing someone from **Who may ask me for work**, or turning **May merge** off, doesn't cancel what a worker was already told to do, and nothing undoes a post, a merge or a deploy that already happened.

## Ready for everyday use {#ready-for-everyday-use}

That is the end of getting started. Send colleagues [Talking with a clone](/understand/slack) so they know what they're talking to.

## Where to go next

Optional reading:

- how a message reaches your clone and how workers run: [How Misha works](/understand/how-it-works)
- your own skills and tools, or reusing Misha's parts: [Customise and reuse Misha](/reference/extensions)
- pausing, changing what Misha may do, updating and removing it: [Control and maintain Misha](/operate/manage)
