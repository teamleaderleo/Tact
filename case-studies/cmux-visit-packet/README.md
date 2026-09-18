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

Each page stands alone and is short enough to open in the room. Every number is reproduced by a script in [`evidence/`](evidence/) that reads the cmux checkout and executes nothing.

**Baseline for all measurements:** `manaflow-ai/cmux` at `e9ec596d1`, measured 2026-09-17.

---

## The four pages

| page | the artifact | the question it ends on |
| --- | --- | --- |
| [**sidebar-density**](sidebar-density.md) | Two screenshots of the same nine workspaces, one config change apart | Is the workspace list glanceable furniture, or a status surface you read? |
| [**shortcut-namespace**](shortcut-namespace.md) | 128 default chords, 13 of them bound to two or more actions | Is the `[`/`]` modifier family a designed accelerator, or where actions go when the namespace is full? |
| [**appdelegate-ownership**](appdelegate-ownership.md) | A third of the "20,000-line AppDelegate" is `#if DEBUG` | Is the in-process UI-test harness deliberate, or where fixture code accumulated? |
| [**build-loop**](build-loop.md) | 58 real build receipts: 34 minutes cold, 32 seconds warm | What is a founding-team member's actual edit-to-see-it time today? |

### Reading order if there is time for one

**sidebar-density** — it has pictures, the finding is visible in three seconds, and the unresolved question is the one only they can answer.

### Reading order if there is time for two

Add **build-loop**. It is the one that is about their contributor experience rather than their design decisions, and it is the least likely to read as criticism.

### If the conversation turns to code

**appdelegate-ownership** and **shortcut-namespace** are two halves of one finding: the shortcut table has 13 context-resolved chord collisions, and resolving them imperatively is a 622-line prologue inside the largest function in the app. Read the shortcut page first; the AppDelegate page is the wider context.

---

## What these pages are not

They are not a code review, and they are deliberately not a list of things that are wrong.

Three of the four findings are **defensible decisions with a visible cost**, not mistakes:

- `cmd+r` meaning reload in a browser and rename on a tab is correct in both places. The cost is that something has to decide, early, which context you are in.
- An in-process UI-test harness driven by environment variables is a real tactic for making native UI tests trustworthy. The cost is 2,700 lines sharing a file with window lifecycle.
- Nine sidebar detail flags defaulting to on is generous, not careless. The cost is that a user expresses one preference nine times.

The fourth — the build loop — is not about cmux's choices at all. It is about what an outside contributor hits before they can change anything.

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
- [`shortcut-namespace.md`](shortcut-namespace.md) · 128 chords, 13 collisions, a 1,749-line dispatcher
- [`appdelegate-ownership.md`](appdelegate-ownership.md) · 32.4% `#if DEBUG`, two mechanical seams
- [`build-loop.md`](build-loop.md) · 58 receipts, 37× warm-vs-cold, and what receipts bought
- [`default-config.md`](default-config.md) · 29 overrides, 16 pins, 11 undeclared — the supporting inventory
- [`evidence/`](evidence/) · four scripts and three screenshots

Umbrella issues: Tact [#53](https://github.com/teamleaderleo/Tact/issues/53) (visit index), [#35](https://github.com/teamleaderleo/Tact/issues/35) (interaction thesis), [#52](https://github.com/teamleaderleo/Tact/issues/52) (persistent delegated work).
