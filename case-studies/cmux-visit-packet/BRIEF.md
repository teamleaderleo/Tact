# CMUX visit — room brief

## TL;DR

I use CMUX hard enough that the interesting questions come from repeated use instead of mockups.

The loop is:

```text
use CMUX every day
→ notice a recurring friction or ambiguity
→ measure / trace it
→ try a smaller alternative
→ build the useful ones into real code
→ bring the unresolved product question back to the people building CMUX
```

The repos are supporting pieces of that loop:

- **Tact** — product/design judgment and the case studies.
- **terminal-kit** — the actual daily environment where the interaction ideas get exercised.
- **Glaeda** — reusable compute and project state for keeping expensive edit/build/verify loops hot.
- **cmux fork** — the larger product experiments.

For the visit, lead with the artifacts. The repo map can stay in the background.

---

## A good opener

> I’ve been using CMUX as a serious daily work environment. A few repeated-use annoyances turned into measurable problems, and some turned into fixes or working prototypes. I brought three that seem worth arguing about together.

Then show something.

---

## The three things to show

### 1. Conversation sidebar + native tiling

**Artifact:** [teamleaderleo/cmux#57](https://github.com/teamleaderleo/cmux/pull/57)

The experiment brings Claude, Codex, OpenCode, ordinary terminals, searchable conversation history, and native spaces/tiles into one working surface.

The interesting part is the product question underneath it:

> **What should feel like the primary thing in CMUX: a surface, workspace, project, conversation, agent, delegated task, or some combination?**

That answer affects navigation, restore, history, attention, and extensibility.

Treat #57 as a live experiment to react to. It is large and active; the point is the interaction, not reviewing 173 changed files in the room.

---

### 2. Sidebar density + accessibility labels

Start with the visual case:

- [sidebar-density.md](sidebar-density.md)
- [accessibility-labels.md](accessibility-labels.md)

The sidebar comparison is immediate: the same nine workspaces can read either like compact navigation or like a small dashboard.

The accessibility case is a complete notice → trace → fix → verify loop. Real surface-tab buttons announced SF Symbol names such as `square.split.2x1`; the correct action names already existed as tooltips. The fix is in [teamleaderleo/bonsplit#1](https://github.com/teamleaderleo/bonsplit/pull/1) and was checked against the live accessibility tree after the package tests passed.

Two useful questions:

> **Is the workspace list primarily navigation, or a status surface people are expected to read?**

> **Which interaction properties should CMUX test directly — labels, focus, restore behavior, shortcut context, selection identity?**

This is probably the easiest place to start because the evidence is visible before any theory enters the conversation.

---

### 3. The contributor loop

**Artifact:** [build-loop.md](build-loop.md)

The packet contains 58 real build receipts from the fork work.

The memorable contrast is:

- cold/setup paths reaching tens of minutes;
- repeated warm app builds around half a minute.

terminal-kit and Glaeda grew around making that repeat loop reliable enough to use continuously. The interesting question is the contributor experience around the build, not the benchmark number by itself.

Ask:

> **What is your actual edit → build → launch → see-it loop today?**

Then:

> **Which parts should become the obvious external contributor path?**

If this topic catches, terminal-kit [#44](https://github.com/teamleaderleo/terminal-kit/pull/44) and Glaeda [#1048](https://github.com/teamleaderleo/glaeda/pull/1048) are the deeper implementation trail.

---

## Three questions worth leaving with

### 1. What is CMUX organizing?

CMUX already contains several overlapping identities: workspaces, surfaces, terminals, conversations, agents, projects, machines, history.

Which ones are primary, and which ones should be projections?

### 2. Where should serious customization live?

There is a large gap between a small interpreted sidebar and carrying a long-lived core fork.

How much of the #57 experiment should eventually be possible through supported extension/dev surfaces?

terminal-kit is useful here because it already has small reversible trials:

- [#45](https://github.com/teamleaderleo/terminal-kit/pull/45) — customization profiles;
- [#46](https://github.com/teamleaderleo/terminal-kit/pull/46) — quiet/detailed sidebar modes;
- [#47](https://github.com/teamleaderleo/terminal-kit/pull/47) — Claude + Codex side by side;
- [#48](https://github.com/teamleaderleo/terminal-kit/pull/48) — native desktop-agent access strip.

### 3. How should attention differ from navigation?

A stable place to return to and a dynamic list of things that need judgment are different jobs.

Tact’s longer thesis is that CMUX can become the place that preserves delegated-work context and routes scarce human attention without turning every agent event into a feed.

The useful version of that thesis is compact:

> **Keep the work context. Keep the receipts. Surface the few moments that need a person.**

---

## Keep in reserve

### Shortcut namespace

[shortcut-namespace.md](shortcut-namespace.md) is a good corrected negative result.

The first hypothesis was that CMUX lacked a proper context model for overlapping shortcuts. It already has a strong one. The surviving question is learnability and modifier depth, especially around the `[` / `]` family.

### AppDelegate ownership

[appdelegate-ownership.md](appdelegate-ownership.md) is useful if the conversation turns toward code ownership. The useful finding is narrower than “the file is huge”: a large DEBUG-gated UI-test harness and shortcut routing are two concrete concentrated regions worth discussing.

### Config semantics

[default-config.md](default-config.md) asks whether configuration can distinguish “follow the current default,” “pin today’s value,” and “this is my deliberate override.”

### Glaeda

Glaeda’s relevance here is simple:

> **Start from the hottest reusable state whose identity and validity can be proved for the workload.**

Its deeper runtime/trust model can stay in reserve unless the conversation moves into build systems, resident project state, or compute.

---

## Fork status before the visit

- **cmux #58** is the upstream-sync PR. GitHub renders roughly 6,282 changed files because it carries 4,239 upstream commits. The meaningful review surface is the 12 conflict resolutions described in the PR. A native macOS app build is still the obvious remaining verification item.
- **cmux #57** is the current interaction prototype. It is now 173 changed files / +7,159 / −409 against its pinned upstream base. Show the running behavior, screenshots, and product choices; skip the giant diff.
- The packet’s older warning about three unpushed #57 commits has aged out. The PR head advanced to `381dc8091`.

---

## Five-minute path

1. Ask how they personally use CMUX all day.
2. Show **sidebar density**.
3. Show **#57** if they want the larger interaction direction.
4. Show **accessibility labels** as the small complete fix loop.
5. Use **build-loop** if contributor experience or Glaeda comes up.

Then pick one thing to hack on together.

---

## One-line ending

> I’m interested in the point where terminal, browser, agents, project context, and human attention become one continuous working environment — and I finally have enough real CMUX use to talk about that through concrete artifacts.
