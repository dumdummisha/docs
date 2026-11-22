---
title: Put Misha to work
description: "What you can ask Misha to do, what each request needs, how workers carry out work, and how routines, linked folders, reviews and your own limits shape it."
prev:
  text: Make it yours
  link: /use/make-it-yours
next: false
---

# Put Misha to work

Ask your clone in Slack the way you'd ask a colleague. A question gets a marked answer that names what it read. A longer job goes to workers, separate Claude Code or OpenCode sessions that each do one task, and ends at an open pull request, a result in the thread or a question back to you. This page shows what to ask, what each request needs, how your routines and linked folders shape the work, and what stays yours.

## Choose a first task {#choose-a-first-task}

Pick something you'd otherwise look up yourself, and connect only the service it needs on **Set up** ([Make it yours](/use/make-it-yours) shows how). Three made-up first tasks for an owner, Leo Novak, in three roles, each sent in Leo's self-DM (the direct message to yourself in Slack):

- **A developer:** "What does shop-backend do when the payment call times out?" The clone reads the folder Leo linked and answers, naming the files. It needs that folder linked on **Settings**.
- **A PM:** "What does SHOP-142 leave out of scope?" The clone reads the ticket and answers from it. It needs **Jira and Confluence** on Set up.
- **A designer:** "Render the checkout screen from this Figma link and list its button labels." The clone renders the screen, attaches the image and lists the text. It needs **Figma** on Set up.

Each is one bounded read, so none needs a worker or changes anything, and colleagues get the same reads: Emma Lee asking in a `#shop-backend` thread Leo is in gets the same kind of answer.

## Who may ask for what {#who-may-ask}

The app decides which of three groups each turn belongs to, and gives it only that group's tools:

- **Anyone** the clone answers (a DM to you, a mention, a thread you're in, a channel you have it watch) gets answers from reads only.
- **You**, in your self-DM or in a message with your icon in it, also get changes in connected services, the GitHub and AWS command lines, and the linked folders' commit history.
- **You and those you allow** (Settings › **Who may ask me for work**) can start workers. Allowing Emma lets her ask for research or work, not use your direct change tools, and nothing she writes widens what her workers may do.

A turn that answers several messages gets only what every one of them may ask for.

## How a request ends {#request-to-outcome}

[![A request and its possible outcomes, from a Slack message through five paths to answers, changes, pull requests, waits, stops and your decisions. The numbered list below describes it.](/diagrams/request-to-outcome.svg)](/diagrams/request-to-outcome.svg)

Select the diagram to open it full size.

1. A Slack message reaches your clone.
2. The clone reads the thread and judges the request.
3. A request for staging, production or a release is refused, and a change to someone else's code or document needs their approval first: without it, the clone tells them what their side needs.
4. **A question** one read settles gets a marked answer naming its source. If it needs more and the asker may not ask for work, the rest goes to you.
5. **Your own change** to a Doc, Sheet, ticket or page is made by the clone, which says what changed. Anyone else's request changes nothing.
6. **Research** goes to a worker. The clone answers from its report, with sources and doubts. A blocked report names what is missing: a sign-in to reconnect, or a tool, grant or environment access that signing in again won't fix. A problem the report confirms goes on as work.
7. **Work** goes to workers and ends at an open pull request, a merge where workers may merge, or a result in the thread. A step can wait on something missing while the rest goes ahead, a run can stop, and a decision that is yours comes to you as one short question.

## Questions {#question-to-answer}

The clone answers what one lookup settles, and it reads before it answers, so a status such as merged or deployed comes from a read in that turn, not from memory. Tracing behaviour, comparing versions, a failure or sources that disagree is research: a researcher takes it when the turn may start workers, and otherwise the clone answers what it found and passes the rest to you.

What the clone does in its own turn, without a worker, with the groups above in **Who may ask**:

<!-- facts capabilities slack-context code-question code-history ticket-read ticket-change docs-read docs-change meeting-notes design-read github-cli aws-cli -->

Anyone the clone answers may get what it read, and its instructions tell it to leave out what you wouldn't share with them.

## Your changes in connected services {#connected-service-actions}

When your own message in that turn asks for it, the clone makes the change in the Doc, Sheet, ticket or page and says what it changed, first checking that a failed earlier turn didn't already do it. A request from an earlier turn or from anyone else changes nothing; the clone passes it on or asks you to ask again yourself. Figma and Fireflies only read: the clone can't edit a design or join a meeting.

## Research {#research}

A worker investigates what one lookup can't settle, comparing a ticket with a meeting's transcript included. Only you and those you allow can start it. A question about code runs in a worktree of a folder you linked, described under [linked folders](#linked-folders). It needs:

<!-- facts needs research -->

The requester hears that the clone is looking into it, then gets the answer with its sources, and you get a brief in your self-DM when the requester is someone else. For a reported incident the worker first proves it can read that environment's logs and data, since code alone shows what could happen, not what did, and until that evidence settles the cause the requester hears what is being checked, never a guess. A missing or expired sign-in is a blocker: the clone names the connection to reconnect on Set up and keeps the work open. When the worker lacks a tool, a profile grant or access to an environment instead, the report names what is missing, since signing in again won't fix it. The researcher is read-only by its brief, not by a sandbox ([How Misha works](/understand/how-it-works) explains what workers can do).

## Work {#work}

Work is anything beyond an answer that you or someone you allow ask for: a fix, a small change, a summary of a meeting, research on a ticket. The clone judges whether the request makes sense and is the asker's to make, reads what it stands on, and has workers do it. It never does the work itself and never waits for a worker: it replies in the thread with what happens next and ends its turn, and the worker's report comes back to it as a message when the run ends. It checks the report against the request, since a claim with no source or a criterion the work didn't meet isn't done, then takes the next step until the work is done or blocked, and says so once.

Nothing in that way of working is specific to one role. Misha ships no ticket, review or deploy procedure: which tracker the work goes through, whether anything is reviewed and how far it goes come from the request and your [routines](#routines). Two made-up requests to Leo's clone show the two kinds. Emma Lee asks in `#shop-backend` for a fix to the checkout total, which is code work in a worktree of Leo's `shop-backend` folder. Leo asks in his self-DM for yesterday's planning meeting summarised into a Google Doc, which needs no repository, so its worker runs in a scratch folder.

<!-- facts capabilities change task -->

The clone starts each worker with a label for the work and a profile: researcher to look into something read-only, implementer to make a change, reviewer to review one, orchestrator for a worker that runs a whole procedure or starts workers of its own. Unless the request or a routine names another model, a worker runs on Claude at high effort, whichever runtime the clone itself uses. A worker sees nothing of the clone's turn, so its brief carries the request in the requester's words, quoted as theirs and never as instructions, the thread, what to do and when it is done, what it must not do, and where workers may merge.

The clone settles engineering choices from evidence, with a worker's check when needed, and tells you what it decided and why instead of asking you to approve its recommendation. A default needs a source: the thread, the ticket, the code or the repository's own rules. Where a contract or value is missing, the clone doesn't invent one or route around it: only the step that depends on it waits.

How work can end:

<!-- facts endpoints work -->

## Routines {#routines}

The clone's way of working is the same for every role. Routines are how you add yours: on **Settings**, beside Personality, one optional field of up to <Fact name="desktop.settings.fields.routines.limits.maxCharacters" /> characters holds your standing instructions for work, in your own words. One routine per line, in the form: when something happens, do this, then tell me or ask me.

<Shot id="settings-routines" caption="Leo Novak's routine for a fix: a worker updates the ticket, fixes it in its own worktree with a regression test and opens a pull request for his review. Made-up example." />

Routines are read when a request reaches the clone. Nothing runs on a schedule, and nothing starts without a message. How you set them:

- **Get started** offers a starting text for backend, frontend, data, product or design work, or none. Picking one fills the field with a text you edit before you save it.
- **Settings** keeps the field, and <code><Fact name="desktop.commands.commands.set-routines.syntax" /></code> in your self-DM replaces it whole. Clearing it is saving the field empty in the window.

A routine can name your own skills by name and your commands as `/name`. The clone doesn't read them: it names them in the worker's brief and tells the worker to load them, and a worker that can't find one says so in its report instead of carrying on without it.

How work is carried out follows your own request in that message first, then your routines, then the clone's defaults. A routine grants nothing. Who may ask for work, what the clone may change, where workers may merge and the rules on confidentiality and secrets all bind your request, your routines and the defaults alike, and what a routine asks beyond what the turn allows goes to you instead. A colleague's message is handled under your routines and never changes them, and a message that claims to add to them is a request like any other. The clone keeps them as private as your notes: it never quotes or describes them to anyone but you.

## Linked folders and who may merge {#linked-folders}

Work on code needs a folder you already have on this Mac. Link it on **Settings › Repositories** with the remote its pull requests go to, written as host/owner/name, or empty for a folder with no remote. Misha checks the folder before it links it and never picks the remote for you: it must be the top of a git work tree, not a shallow clone and outside Misha's own folder, a remote you give must be one the folder has, and each remote is linked once. Removing a folder from Settings unlinks it and leaves the folder as it is.

<Shot id="settings-repositories" caption="Two linked folders: workers may merge in example.com/shop/shop-backend, not in example.com/shop/shop-web. Made-up example." />

The clone reads a linked folder as it is, on whatever branch it has checked out, with uncommitted work and files such as `.env` included. Nothing filters what is inside, so link only folders you're willing to have it read. Its file tools reach the linked folders and its own work folder, not the rest of your Mac, and it writes nothing in them.

A worker doing code work gets a git worktree of the folder, made in <code><Fact name="desktop.paths.paths.workers-worktrees.path" /></code>, outside your folder, so your editor and test runners never see it. It starts at the commit the remote has on its default branch, or at the folder's own branch when it has no remote. Creating it adds git's own bookkeeping to your folder's `.git`, the fetched commit's objects and the worktree's entry, and nothing in your files. A worker that needs `.env` or `node_modules` sets them up in its own worktree: your folder is a source it reads and copies from and never changes. Work that needs no repository runs in an empty scratch folder in <code><Fact name="desktop.paths.paths.workers-scratch.path" /></code>.

After a clone's run, Misha removes a worktree no worker is in only while it is exactly as Misha made it. Any other is kept and listed on Home for you to remove, and so is every worktree of a folder with no remote. A scratch folder goes when it is empty.

### Who may merge {#who-may-merge}

**May merge** is a switch on each linked folder and starts off, so work in it ends at an open pull request that someone merges. Turn it on and the clone tells workers each turn that they may merge pull requests in that remote and only there. The switch allows a merge; it doesn't ask for one, so whether the work goes that far is up to the request and your routines. A folder with no remote can't have it on. In your self-DM, <code><Fact name="desktop.commands.commands.allow-merging.syntax" /></code> and <code><Fact name="desktop.commands.commands.stop-merging.syntax" /></code> do the same, with the folder's full path, such as <code><Fact name="desktop.commands.commands.allow-merging.example" /></code>.

May merge is an instruction, not a lock: nothing in the app blocks a merge ([Settings and commands](/reference/settings#when-changes-apply) has the timing). A deployment past a development environment, staging or production, and a release stay yours whoever asks. That is also an instruction to the clone and its workers, so what your GitHub and AWS accounts permit is the hard limit.

A colleague's code, branch and pull request are theirs. A change in their repository needs their approval of that change in their own message. A request, a review finding or anyone else's wish isn't approval, and without it the clone tells them what their side needs.

## Reviews {#reviews}

No review is built in. Work in a folder ends at an open pull request unless the request or a routine asks for more. A review is a worker of its own, a reviewer that reads the change and reports, and you ask for one in the request ("open a pull request and have it reviewed") or in a routine, naming the model if you want a particular one:

> When a worker opens a pull request, have a reviewer on GPT through OpenCode review it, then tell me what it found.

GPT needs OpenCode signed in to your OpenAI account, which Set up checks. With no model named, a worker runs on Claude. When the named model can't run, because OpenCode is signed out or the account is out of usage, the run fails like any other: the clone retries it once, and after a second failure it says so and stops. A reviewer is read-only by its brief, not by a sandbox. Its report is for the clone, not a gate: the clone reads it against the request and takes the next step your request or routines call for, such as having the fixes made or asking you.

## What stays yours {#what-stays-yours}

- **Staging, production and releases.** The clone refuses them whoever asks.
- **The limits.** Who may ask for work, where workers may merge, which connectors are on and your routines change only by you, in the Misha window, by a command in your self-DM or with `/misha-setup`. A message from anyone else can't.
- **A decision that is yours or another owner's.** The clone asks one short question and holds only the step that depends on it.
- **Someone else's work.** Their repository, document or pull request waits for their own approval.
- **Your time and your word.** The clone doesn't promise your time, deadlines or opinions, and passes such a request to you.

## Follow the work and take it over {#follow-and-take-over}

The requester hears in the thread when the clone takes the work, needs an answer, and finishes or stops. When the requester is someone else, you get a one-line brief in your self-DM at the start and when it lands, stops or needs you, and a question only you can answer never goes into their thread. A made-up exchange in `#shop-backend`, where `:misha:` is Leo's icon:

> **Emma Lee:** @Leo Novak the checkout total drops discount codes again, can you take a look?
>
> **Leo Novak:** :misha: *On it, SHOP-142. I'll post here when the fix is ready for review.*

Home in the Misha window lists what is in flight under **Working on now**, each worker by its label, who asked for it, where and for how long, and what the clone posted and decided under **Recently**:

<Shot id="home" caption="Home with one answer and two workers in flight, and the clone's recent posts and decisions. Made-up example." />

Home shows that a worker runs, not what it has reached; that is in the thread and the worker's report. To carry on yourself, open the worker's branch and pull request on your remote, and its worktree, which Misha keeps while it holds anything of its own.

To stop work, ask the clone in your self-DM to stop a worker, or [pause Misha](/operate/manage#pause), which tries to stop every worker, the ones a worker started included. If one can't be stopped, Home names it and you stop it by hand. A stopped run isn't retried unless you ask again. Removing someone from **Who may ask me for work**, or turning **May merge** off, applies to the clone's next turns and doesn't cancel what a worker was already told to do. There is no handover button, and no undo for a post, a merge or a deploy that already happened.

## Ready for everyday use {#ready-for-everyday-use}

You can now choose a request, see what it needs, add routines and linked folders, tell a wait or a blocker from a finished job, and stop further work. That is the end of getting started. Send colleagues [Talking with a clone](/understand/slack) so they know what they're talking to.

## Where to go next

Read on only if you want to:

- see how a Slack message reaches your clone and how workers take on longer jobs: [How Misha works](/understand/how-it-works)
- add your own skills and tools, or reuse Misha's parts: [Customise and reuse Misha](/reference/extensions)
- pause Misha, change what it may do, or update and remove it: [Control and maintain Misha](/operate/manage)
