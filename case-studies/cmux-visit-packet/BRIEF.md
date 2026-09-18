# CMUX visit — short brief

**Status snapshot:** 2026-09-18.  
This is the compact talk track. The deeper packet remains in this directory.

## 30-second version

I’ve been using CMUX as the live meeting point for three projects:

- **Tact** asks what the human should see, touch, understand, and enjoy using.
- **terminal-kit** is my everyday Mac terminal + agent environment, so interaction ideas get dogfooded in real work.
- **Glaeda** keeps expensive compute and project state hot when reuse can be proven safe, so the edit/build/verify loop can stay quick without hand-waving identity or results.
- **the CMUX fork** is where those ideas meet the real app.

I already have upstream CMUX fixes merged, a fairly large native sidebar/tiling experiment running in the fork, measured contributor-loop evidence, and a handful of small product questions that are much more useful to discuss with the people building CMUX than to turn into a grand theory.

The visit goal is simple: **learn how the founding team actually works, show a few concrete artifacts, and hack on whichever seam turns out to be real.**

---

## What is already real

### Upstream contributions

Two recent upstream CMUX PRs are merged:

- [manaflow-ai/cmux#12142](https://github.com/manaflow-ai/cmux/pull/12142) — durable terminal input waits for acknowledgement from the PTY-owning host before reporting success.
- [manaflow-ai/cmux#12424](https://github.com/manaflow-ai/cmux/pull/12424) — stale fatal callbacks from a replaced proxy tunnel can no longer tear down its healthy successor.

These are useful context because they show the style of work I care about: exact ownership, failure boundaries, receipts, and small regressions that can be reproduced.

### Working fork

[teamleaderleo/cmux#57](https://github.com/teamleaderleo/cmux/pull/57) is the big interaction experiment:

- unified Claude / Codex / OpenCode conversation sidebar;
- open tabs above searchable history;
- folder merging and pins across providers;
- native spaces + tile navigator;
- exact focus/move/create actions against real CMUX surfaces;
- hidden workspaces avoid eagerly launching provider sessions;
- real terminal stays visible through restore/startup instead of being replaced by a synthetic transcript.

This is the best centerpiece because it is real code in the real app and it exposes several product questions at once.

### Everyday dogfood

terminal-kit has a stack of small experiments around the same workflow:

- [#45](https://github.com/teamleaderleo/terminal-kit/pull/45) — reversible CMUX/Ghostty customization profiles;
- [#46](https://github.com/teamleaderleo/terminal-kit/pull/46) — Quiet vs Details sidebar density;
- [#47](https://github.com/teamleaderleo/terminal-kit/pull/47) — open Claude + Codex side by side for one project;
- [#48](https://github.com/teamleaderleo/terminal-kit/pull/48) — a tiny native strip for jumping among desktop agent apps;
- [#44](https://github.com/teamleaderleo/terminal-kit/pull/44) — CMUX builds from the canonical checkout through the Glaeda warm-build profile.

The point is less “here are five features” and more: **I have a live environment where these ideas can be tried repeatedly instead of judged from mockups.**

---

## The three things I would actually show

### 1. The unified conversation sidebar + native tiling

**Show:** fork PR #57 running.

**Why:** this gets immediately to the primary-object question.

CMUX currently has workspaces, panes, surfaces, terminal sessions, browser tabs, agents, conversations, projects, history, and Cloud machines. The experiment asks whether a user can operate primarily in terms of the live thing they care about — conversation/surface/project — while CMUX preserves the richer model underneath.

**Question for them:**  
**What do you expect the primary user object to become over the next year: surface, workspace, project, agent, delegated task, or some linked combination?**

---

### 2. Sidebar density + the accessibility fix

Start with the visual one because it reads instantly:

- [sidebar-density.md](sidebar-density.md) — the same nine workspaces under default detail and quiet detail.
- [accessibility-labels.md](accessibility-labels.md) — the surface-tab buttons exposed SF Symbol names such as `square.split.2x1` instead of actions such as “Split Right.”

The accessibility case is especially useful because the correct localized strings already existed and were already used as tooltips. The defect came from where the label was attached. The patch is in [teamleaderleo/bonsplit#1](https://github.com/teamleaderleo/bonsplit/pull/1), with the package test suite passing and the live accessibility tree used as the final check.

**Questions for them:**

- **Is the sidebar primarily glanceable navigation, or a status surface people are expected to read?**
- **Which UI properties do they want tests to assert directly — labels, focus behavior, restore behavior, shortcut context, etc.?**

---

### 3. The contributor loop

[build-loop.md](build-loop.md) has 58 real build receipts from the fork work.

The interesting contrast is roughly:

- an initial cold/setup path that stretched into tens of minutes;
- repeated warm CMUX app builds around half a minute;
- a Glaeda-backed path that made that repeat loop practical enough to dogfood.

The useful conversation is about the loop around the build, not a benchmark trophy.

**Questions for them:**

- **What is the founding team’s real edit → build → launch → see-it loop today?**
- **Which parts are intentionally internal, and which should become the obvious contributor path?**
- **How much substantial UI experimentation should require a core fork versus a supported dev/extension layer?**

---

## If there are ten minutes

1. **Ask how they actually use CMUX every day.** What stays open, what they jump among, what they poll, what they customized internally.
2. **Show fork PR #57.** Let their reaction choose the branch of the conversation.
3. **Show sidebar density.** Three-second visual comparison.
4. **Show the accessibility case.** Small bug, exact source trace, patch already written.
5. **Show the build-loop receipts if contributor experience comes up.**
6. Pick one thing to sketch, change, or prototype together.

That is enough. The rest can stay available as ammunition.

---

## Questions worth carrying into the room

### Product model

- What object does the team personally think in while using CMUX all day?
- How much context should a new agent/conversation inherit automatically?
- Which views are permanent workspace furniture, and which are attention queues?
- What do they repeatedly poll because CMUX has yet to surface it?

### Extensibility

- Where is the intended middle layer between a custom sidebar and a core fork?
- Should a successful personal workflow become something shareable/forkable?
- Can an agent observe a working setup and turn it into an inspectable reusable configuration?

### Attention

- Which agent events deserve human interruption?
- Can healthy machine work collapse into a few human obligations while exact evidence stays one gesture away?
- What independent audit view should exist so a reducer can be challenged?

### Native Mac craft

- Which platform conventions are deliberate CMUX choices?
- Which interaction details are inherited from Ghostty/AppKit/SwiftUI?
- Where would the team happily adopt boring Mac behavior instead of inventing another CMUX-specific interaction?

---

## Keep these in the appendix

### AppDelegate ownership

[appdelegate-ownership.md](appdelegate-ownership.md) is useful when the conversation turns technical:

- about 32% of the file is `#if DEBUG`;
- a large in-process UI-test harness shares the file with production app lifecycle;
- shortcut routing is another large concentrated region.

The page proposes mechanical seams and asks whether the current arrangement is deliberate.

### Shortcut namespace

[shortcut-namespace.md](shortcut-namespace.md) is valuable because it contains a corrected negative result.

I initially thought CMUX lacked a proper context model for overlapping shortcuts. It already has a VS Code-style `when` model, priority-aware collision detection, refusal of dead bindings, Settings feedback, and tests.

That is useful evidence of an area that is already well thought through. The surviving question is learnability: the `[` / `]` family carries many actions across many modifier depths.

### Config drift

[default-config.md](default-config.md) asks a smaller configuration question: when a user writes out a value equal to today’s default, should CMUX be able to preserve the intent “follow the default” instead of turning it into a permanent pin?

### Glaeda

Glaeda is broader than this visit, so keep it available until performance/reuse/compute comes up.

Two useful measured results from its current README:

- resident repository evidence answered one real review question in about 40 ms versus a 4.4 s remote-read baseline;
- the resident developer loop was 3.95× faster than fresh local execution on one frozen Rust workload, while an ordinary warm worktree still beat Glaeda by about 7%.

That second number is worth keeping because it makes the claim precise: Glaeda is buying identity, isolation, reuse policy, and evidence while trying to get close to ordinary warm-local latency.

---

## Volatile status — check before presenting

This section ages quickly.

- Tact visit-packet PR [#58](https://github.com/teamleaderleo/Tact/pull/58) is open.
- Claude-coauthored packet work continued through **08:39 UTC on 2026-09-18**.
- CMUX fork PR [#57](https://github.com/teamleaderleo/cmux/pull/57) advanced again at **08:42 UTC**. The packet currently contains a warning saying three local commits are missing from the pushed PR; that warning is stale now because the PR head has advanced to the commit it named as local-only.
- terminal-kit PR [#44](https://github.com/teamleaderleo/terminal-kit/pull/44) also updated at **08:43 UTC**, which is further evidence that work continued after the packet warning was written.
- CMUX fork PR #57 currently has several red CI jobs. The failures include Zig SDK timing/timeout tests, a GhosttyKit checksum pin, CMUX Cloud skill-doc coverage drift, web typecheck errors, and a Testbox runner-policy assertion. Treat the branch as active dogfood, rather than presenting it as a fully green merge candidate.
- CMUX fork PR [#58](https://github.com/teamleaderleo/cmux/pull/58) is the upstream-sync PR. Its own description says a full native macOS app build still needs to run, and CI currently has additional failures. That is the clearest concrete merge blocker in the fork today.
- terminal-kit issue [#50](https://github.com/teamleaderleo/terminal-kit/issues/50) records a real Glaeda integration gap: one interrupted warm-cache generation can leave `tk cmux warm` refusing forever because the wrapper currently gives the operator no way to choose a new generation.

---

## One sentence to end on

**I’m interested in the point where terminal, browser, agents, project context, and human attention become one continuous working environment — and I have enough real CMUX code and daily dogfood now to discuss that concretely instead of philosophically.**
