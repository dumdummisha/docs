---
title: Decide whether to try it
description: "What Misha does, what it needs, what it costs and what can go wrong, so you can decide whether to try it."
prev:
  text: Overview
  link: /
next:
  text: Get started
  link: /start/get-started
---

# Decide whether to try it

Misha gives a person an AI clone that answers routine Slack questions from their code and connected services, posting from their own account with a visible marker. It can hand research to workers (separate AI sessions that each do one task), change tickets, documents and pages when its owner asks, and take permitted code work to a reviewed pull request, or, where the owner allows merging and the repository supports it, to a change checked on the development environment (dev). Time saved hasn't been measured.

## What each person needs {#requirements}

- A Mac, awake and online, with the Misha app running; the clone answers only then.
- Chrome or Brave, signed in to Slack on the web, with the Slack tab open.
- The Misha Browser extension and its native host, which connects it to the app. A managed Mac may need IT approval for both.
- Claude Code, unmodified, signed in with the person's own Claude subscription, and git. Which Claude plans are enough isn't established.
- For code work, access to the repositories through the GitHub CLI.
- Optionally, Jira and Confluence, Google, Figma, Fireflies or AWS, for the tasks that need them.
- Optionally, OpenCode with a GPT model. Basic use works without it, but reviewed tickets and pull requests wait for its review; Claude doesn't stand in.

Slack replies need no macOS Accessibility or Screen Recording permission; optional browser and desktop control tools do.

## What it costs {#cost}

There is no Misha fee during the invite-only pilot. Each person pays for their own Claude and, if used, OpenAI. No price is promised after the pilot.

## The main risk, and the brake {#risk}

The clone posts as the person, so a wrong answer or commitment in a client channel appears under their name, marked only by an emoji and italics that anyone could type.

Each owner chooses who else may ask for work, which channels the clone watches, which repositories it reads and where workers may merge. On anyone else's request, the clone itself can only read; only people the owner allows can start workers. Workers are instructed, not forced, to deploy to dev only.

Pause, from Slack or the app, stops new replies and new work and tries to stop running workers. It can't take back a post or undo finished work. There is no preview mode: saving the first settings can start live replies. Send colleagues [Talking with a clone](/understand/slack).

## How mature it is {#maturity}

Since 19 November 2026 there is one unsigned local build, run by its owner on their own Mac. There is no public download, no Chrome Web Store listing, no invite keys and no updater yet. No support response time is promised; contact goes through the invite request on [dumdummisha.ai](https://dumdummisha.ai).

## For your security team {#security}

Forward [the security assessment](/privacy#assessment). It covers data flows, credentials, browser permissions, worker authority, updates, audit, stopping and removal, with the evidence for each.

## Your decision {#decision}

Trying Misha today starts with an invite request on the landing page. A trial needs each person's Mac and the accounts above, plus your organisation's view on a personal agent posting through Slack's web session, which these docs don't settle. [Get started](/start/get-started) shows what setup involves.
