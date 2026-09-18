# cmux visit packet

Material prepared for the cmux founding-team visit. Every page here follows the same shape, from Tact [#53](https://github.com/teamleaderleo/Tact/issues/53) §5:

```text
show the artifact
state the user job
state the seam
show one precedent / alternative
ask the unresolved question
stop
```

Each page stands alone and is short enough to open in the room. Every counted claim is reproduced by a script in [`evidence/`](evidence/) that reads the cmux checkout and executes nothing; the two screenshot-based pages say exactly how the images were captured.

**Baseline for all measurements:** `manaflow-ai/cmux` at `e9ec596d1`, measured 2026-09-17.

---

## The five pages

| page | the artifact | the question it ends on |
| --- | --- | --- |
| [**sidebar-density**](sidebar-density.md) | Two screenshots of the same nine workspaces, one config change apart | Is the workspace list glanceable furniture, or a status surface you read? |
| [**accessibility-labels**](accessibility-labels.md) | Every tab bar button announces its SF Symbol name | What would have caught this? |
| [**shortcut-namespace**](shortcut-namespace.md) | **A corrected negative result** — I claimed a namespace defect; cmux already implements the VS Code `when`-clause model | Is the `[`/`]` modifier family a designed accelerator, or where actions go when the namespace is full? |
| [**appdelegate-ownership**](appdelegate-ownership.md) | A third of the "20,000-line AppDelegate" is `#if DEBUG` | Is the in-process UI-test harness deliberate, or where fixture code accumulated? |
| [**build-loop**](build-loop.md) | 58 real build receipts: 34 minutes cold, 32 seconds warm | What is a founding-team member's actual edit-to-see-it time today? |

**One of these comes with a fix already written and verified**: `accessibility-labels` ships as [teamleaderleo/bonsplit#1](https://github.com/teamleaderleo/bonsplit/pull/1) — 223 tests passing, and confirmed by reading the accessibility tree of two cmux builds at the same commit that differ only in that submodule. The first version of the patch passed all 223 tests and still broke an accessibility identifier; only the live read caught it.

### Reading order if there is time for one

**sidebar-density** — it has pictures, the finding is visible in three seconds, and the unresolved question is the one only they can answer.

### Reading order if there is time for two

Add **accessibility-labels**. It is small, it is unambiguous, the correct strings already exist in their codebase, and the patch is written, tested and verified against a real build — so it demonstrates the whole loop (notice → trace to source → fix → verify → catch your own regression) rather than just the noticing.

If contributor experience is the better topic for the room, use **build-loop** instead; it is the least likely of the five to read as criticism.

### If the conversation turns to code

**appdelegate-ownership** is the page with a standing argument: two mechanical seams worth ~3,900 lines.

**shortcut-namespace** is a negative result and is included deliberately. I thought I had found a namespace defect; cmux turned out to already implement the VS Code `when`-clause model, with priority-aware collision detection, refusal of dead bindings, and a rejection banner in Settings. The page says what I got wrong and why. It is worth showing precisely because it is the failure mode the AppDelegate page warns about — asserting absence without searching for the mechanism.

---

## What these pages are not

They are not a code review, and they are deliberately not a list of things that are wrong.

Three of the five findings are **defensible decisions with a visible cost**, not mistakes:

- `cmd+r` meaning reload in a browser and rename on a tab is correct in both places, and cmux resolves it declaratively rather than by accident.
- An in-process UI-test harness driven by environment variables is a real tactic for making native UI tests trustworthy. The cost is 2,700 lines sharing a file with window lifecycle.
- Nine sidebar detail flags defaulting to on is generous, not careless. The cost is that a user expresses one preference nine times.

The build loop is not about cmux's choices at all — it is about what an outside contributor hits before they can change anything.

The accessibility labels are the one plain bug in the set, and it is a small one with the patch attached. It is here because of what it implies about testing, not to make a point about the bug.

Where I am guessing, the pages say so. Where a claim needs their answer to be worth anything, the page stops and asks instead of concluding.

## The prototypes these connect to

Four interaction prototypes exist as issues and running code rather than as pages here. They are the "show the artifact" material if the conversation goes toward interaction design rather than evidence:

| prototype | issue | runnable |
| --- | --- | --- |
| Home can stay put; Triage can move | [#37](https://github.com/teamleaderleo/Tact/issues/37) | [`prototypes/cmux-surface-navigator/`](../../prototypes/cmux-surface-navigator/) |
| Keep the thing I pointed at, across browser → terminal → agent → source → proof | [#39](https://github.com/teamleaderleo/Tact/issues/39) | [`prototypes/causal-debugger/`](../../prototypes/causal-debugger/) |
| Native-Mac microcraft: Quick Look, selection vs focus, boring window behavior | [#38](https://github.com/teamleaderleo/Tact/issues/38) | [`experiments/microcraft/`](../../experiments/microcraft/) |
| Surface-first navigation with simultaneous vertical + horizontal tabs | [#36](https://github.com/teamleaderleo/Tact/issues/36) | [`prototypes/cmux-surface-navigator/`](../../prototypes/cmux-surface-navigator/) |

## The working fork

[`teamleaderleo/cmux` PR #57](https://github.com/teamleaderleo/cmux/pull/57) — unified Claude/Codex/OpenCode conversation sidebar promoted into the native window, plus a collapsible spaces-and-tiles navigator.

The PR is based on upstream `e9ec596d1`. Its base branch is pinned to that commit (`base/upstream-e9ec596d`) so the diff shows **the work and not the fast-forward**: 100 files, +4,237 / −219. Reviewing it against the fork's `main` instead renders 5,280 files and +1.17M lines, essentially all of it upstream history.

## Running the evidence

```bash
cd evidence
python3 shortcuts.py     ~/Projects/cmux
python3 appdelegate.py   ~/Projects/cmux
python3 config-drift.py  ~/Projects/cmux ~/.config/cmux/cmux.json
python3 build-times.py   ~/Projects/cmux
```

No dependencies beyond the standard library. Each script parses files and prints a table; none of them build, launch, or modify anything.

---

## Index

- [`sidebar-density.md`](sidebar-density.md) · screenshots, nine default-on detail flags
- [`accessibility-labels.md`](accessibility-labels.md) · the tab bar announces icons; fix submitted
- [`shortcut-namespace.md`](shortcut-namespace.md) · corrected negative result: cmux already does this well
- [`appdelegate-ownership.md`](appdelegate-ownership.md) · 32.4% `#if DEBUG`, two mechanical seams
- [`build-loop.md`](build-loop.md) · 58 receipts, 37× warm-vs-cold, and what receipts bought
- [`default-config.md`](default-config.md) · 29 overrides, 16 pins, 11 undeclared — the supporting inventory
- [`evidence/`](evidence/) · four scripts and four screenshots

Umbrella issues: Tact [#53](https://github.com/teamleaderleo/Tact/issues/53) (visit index), [#35](https://github.com/teamleaderleo/Tact/issues/35) (interaction thesis), [#52](https://github.com/teamleaderleo/Tact/issues/52) (persistent delegated work).
