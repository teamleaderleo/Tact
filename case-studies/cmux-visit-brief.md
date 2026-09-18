# CMUX visit — room-ready brief

This is the short version.

The useful story is:

> I use cmux hard enough to hit real product seams, I keep the daily environment reproducible, I measure the painful loops instead of hand-waving them, and I try to turn the strongest findings into working fixes or prototypes.

The four repos are different parts of that loop:

| repo | job |
| --- | --- |
| **Tact** | product judgment: observe, compare, explain, prototype |
| **terminal-kit** | the real daily-use environment and repeatable dogfood harness |
| **Glaeda** | make expensive local work reusable when reuse can be proven safe |
| **cmux fork / upstream PRs** | where the ideas become actual product changes |

This does **not** need to become a grand unified pitch. The strongest material is concrete.

---

## If there are five minutes

### 1. Start with the visible thing

Open the **sidebar-density** case.

Same cmux instance, same nine workspaces, one preference change. It gets immediately to a useful product question:

> Is the workspace list glanceable navigation furniture, or a status surface people are expected to read?

That opens the conversation without requiring anyone to accept a theory first.

- Tact: [sidebar-density](case-studies/cmux-visit-packet/sidebar-density.md)
- Related live fork: [teamleaderleo/cmux#57](https://github.com/teamleaderleo/cmux/pull/57)

### 2. Show one complete notice → trace → fix → verify loop

Use **accessibility-labels**.

The surface tab-bar buttons exposed SF Symbol names such as `square.split.2x1` instead of actions such as “Split Right.” The right localized strings already existed and were already used as tooltips; the label was applied only on a branch real cmux buttons never take.

The fix is already written in [teamleaderleo/bonsplit#1](https://github.com/teamleaderleo/bonsplit/pull/1), passed 223 tests, and was checked against the live accessibility tree.

The interesting question is larger than this bug:

> What would have caught this automatically?

- Tact: [accessibility-labels](case-studies/cmux-visit-packet/accessibility-labels.md)

### 3. End with the contributor loop

Use **build-loop**.

The packet has 58 real build receipts from the cmux fork. The memorable contrast is roughly:

- cold setup/build path: **34 minutes**
- warm path: **32 seconds**

That leads naturally into terminal-kit and Glaeda without turning the meeting into a Glaeda presentation.

The question:

> What is a founding-team member’s actual edit-to-see-it loop today, and which parts are intentional?

- Tact: [build-loop](case-studies/cmux-visit-packet/build-loop.md)
- terminal-kit: [PR #44](https://github.com/teamleaderleo/terminal-kit/pull/44)
- Glaeda: [README](https://github.com/teamleaderleo/glaeda)

---

## If there are ten minutes

After the three items above, show that this work also produced actual cmux contributions.

### Upstream work that shipped

Two recent upstream PRs are unusually clean proof that the fieldwork loop can produce useful repairs:

- [manaflow-ai/cmux#12142](https://github.com/manaflow-ai/cmux/pull/12142) — durable terminal input waits for acknowledgement from the PTY-owning host before reporting success.
- [manaflow-ai/cmux#12424](https://github.com/manaflow-ai/cmux/pull/12424) — stale fatal callbacks from an old proxy tunnel generation can no longer tear down its healthy replacement.

Both merged.

They are useful to mention because they are concrete reliability fixes with regression coverage, not speculative redesigns.

### The working fork

[teamleaderleo/cmux#57](https://github.com/teamleaderleo/cmux/pull/57) is the larger interaction experiment:

- one Claude/Codex/OpenCode conversation sidebar;
- open tabs above searchable history;
- shared treatment for bare terminals and native views;
- a collapsible Spaces/tile navigator;
- exact focus/move/create actions through existing cmux host actions;
- bounded history paging and cached metadata;
- restored hidden terminals wait for presentation or explicit input instead of eagerly waking providers.

This is the thing to open if the conversation turns toward **what cmux could feel like as a persistent work environment**, rather than toward individual defects.

Treat it as a prototype to argue with, not a proposed wholesale replacement.

---

## The clean product thread

There is a real through-line across the repos:

### Tact

Tact asks what the human should actually see, touch, understand, and enjoy using.

The current packet is strong because it uses artifacts and measured behavior before claims. The corrected shortcut analysis is especially useful evidence of discipline: the first hypothesis was wrong, cmux already had the better mechanism, and the packet keeps the correction.

### terminal-kit

terminal-kit proves these ideas against an environment used every day.

It owns:

- reproducible cmux/Ghostty/Zsh setup;
- `tk do` task launch into owned worktrees;
- durable task receipts and recovery;
- cmux customization toggles and density presets;
- dogfood helpers;
- the cmux/Glaeda build entrypoint.

Recent interaction experiments include:

- [#45](https://github.com/teamleaderleo/terminal-kit/pull/45) reversible cmux/Ghostty customization;
- [#46](https://github.com/teamleaderleo/terminal-kit/pull/46) quiet vs detailed sidebar density;
- [#47](https://github.com/teamleaderleo/terminal-kit/pull/47) project-local Claude + Codex side-by-side;
- [#48](https://github.com/teamleaderleo/terminal-kit/pull/48) native desktop-agent access strip.

### Glaeda

Glaeda is the compute-side answer to repeated setup cost.

Its concise pitch here is:

> Start from the hottest reusable state whose identity and validity can be proved for this workload.

Useful measured examples already in the repo:

- resident repository evidence: about **114×** the measured GitHub baseline for one exact review-evidence workload;
- resident developer loop: **3.95×** versus fresh local on the frozen Big Red Rust edit/verify workload.

For the cmux visit, Glaeda is strongest as the mechanism behind a better contributor loop. The deeper trust/runtime design can stay in reserve unless the conversation goes there.

---

## Three questions worth leaving the room with

### What is the primary user object?

Surface? Workspace? Project? Agent? Delegated task? Human obligation?

cmux already contains several of these. The navigation model gets much easier to discuss once the team says which identities are primary and which are projections.

### Where should substantial customization live?

cmux has interpreted sidebars, settings, CLI control, and core forks. The interesting missing layer is the space between a small sidebar script and carrying a long-lived product fork.

How much of #57 should eventually be possible through a supported extension/dev surface?

### How should attention differ from navigation?

A stable Home and a dynamic Triage answer different questions.

- Home: “where is the thing I already know?”
- Triage: “what needs me now?”

That distinction is already prototyped in Tact and is more useful than arguing about one universal sidebar ordering.

---

## Keep these in reserve

These are good material once the discussion asks for them. They are weaker opening moves.

- **AppDelegate ownership** — the useful result is that 32.4% of the file is DEBUG-gated and there are two plausible mechanical seams. Use when talking about contributor/code ownership.
- **Shortcut namespace** — a valuable corrected negative result. Use when keyboard design comes up.
- **Default config drift** — useful for customization/versioning discussions.
- **Glaeda internals** — deep trust, admission, runtime and recovery details can consume the whole conversation. Bring them out when someone cares about the compute problem.
- **terminal-kit test-repair sequence** — good engineering hygiene, weak room opener.
- **Fieldwork execution carriers** — excellent evidence trail, mostly appendix material.

---

## Before showing the fork

There are three concrete cleanup items.

### 1. Make cmux PR #57 tell the truth about its pushed diff

The current PR description includes validation/details from three local commits that were absent from the pushed head when the packet audited it. The branch has since moved, so re-check the exact head before the meeting and make the prose match what GitHub actually shows.

Keep the reviewable comparison against the pinned upstream base if possible; that is much easier to discuss than dragging the entire fork history into the diff.

### 2. Finish the fork-main upstream merge verification

[teamleaderleo/cmux#58](https://github.com/teamleaderleo/cmux/pull/58) resolves the giant upstream merge cleanly enough to explain, and its CI-policy guard passes.

Its own PR description still records one important gap: no native macOS app build had been run against the merge. Do that before treating #58 as settled.

### 3. Avoid making the live demo depend on a quarantined warm generation

terminal-kit [issue #50](https://github.com/teamleaderleo/terminal-kit/issues/50) records a real dead end: an interrupted Glaeda cache generation can be quarantined, while `tk cmux warm` exposes no generation passthrough to choose another one.

That safety refusal is useful; the missing recovery path is the bug.

Until that path is repaired, bring a known-good built app or screenshots as the deterministic fallback.

---

## One-sentence opener

> I’ve been using cmux as a serious daily work environment, and I brought a few places where repeated use turned into something concrete: a visible design question, a measured contributor-loop problem, two upstream reliability fixes, and a working navigation experiment.

Then open an artifact.
