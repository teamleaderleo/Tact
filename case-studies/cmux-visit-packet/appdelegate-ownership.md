# AppDelegate.swift: an ownership map, not a line count

**Status:** measured against `manaflow-ai/cmux` at `e9ec596d1`, 2026-09-17.
**Method:** static parse of `Sources/AppDelegate.swift`. Read-only; nothing was executed.
**Reproduce:** [`evidence/appdelegate.py`](evidence/appdelegate.py).

---

## Why this exists

"`AppDelegate.swift` is over 20,000 lines" is true and nearly useless. It is the kind of observation that makes an outside engineer sound like they read a file listing rather than the file. Tact #53 §4 says so explicitly:

> Avoid arguing from line count alone. The useful artifact would be an ownership/dependency map that identifies specific seams whose extraction improves iteration, tests, or local reasoning.

This is that artifact. The headline is that **the line count is misleading in cmux's favour.**

## What the 20,325 lines actually are

| region | lines | share |
| --- | ---: | ---: |
| inside `#if DEBUG` | 6,594 | **32.4%** |
| production | 13,731 | 67.6% |

A third of the file does not ship. Measured by top-level member instead of raw lines: 720 production-side members holding 14,744 lines, and 205 debug-side members holding 5,538 lines.

Of the debug side, **73 members / 2,753 lines are named test scaffolding** — `setupTerminalCmdClickUITestIfNeeded` alone is 792 lines. 64 of those 73 members (2,682 lines) are fully `#if DEBUG`-gated. They are driven by `CMUX_UI_TEST_*` environment variables and exist so UI tests can plant fixtures and read state back.

So the honest statement is not "you have a 20,000-line AppDelegate." It is:

> **You have a ~13,700-line production AppDelegate and a 6,600-line in-process UI-test harness living in the same file.**

That is a much more interesting problem, and it suggests a different first move.

## The largest production members

| lines | at | member |
| ---: | --- | --- |
| 1,749 | L14527 | `handleCustomShortcut` |
| 451 | L19470 | `cmux_performKeyEquivalent` |
| 357 | L1506 | `applicationDidFinishLaunching` |
| 295 | L10227 | `createMainWindow` |
| 242 | L5943 | `moveSurface` |
| 230 | L11155 | `sendTextWhenReady` |
| 200 | L5595 | `registerMainWindow` |
| 162 | L2540 | `configure` |
| 161 | L8647 | `performNewWorkspaceCreationAction` |
| 149 | L2151 | `deferTerminateForOwnedCleanupAndFreshSnapshot` |

Two of the top three are keyboard-event routing. That is not a coincidence — see [`shortcut-namespace.md`](shortcut-namespace.md).

## What this says about decomposition

45 `AppDelegate+*.swift` files already exist, totalling 9,171 lines. Extraction is clearly an accepted practice here; the question is what to extract *next* and why.

The domain clustering is the weakest part of this analysis and I want to be straight about that: a keyword classifier puts ~63% of production members into a "workspace + window lifecycle" bucket, which is really just "AppDelegate does AppDelegate things." **That bucket is not a seam.** It is a coordination point, and a coordination point with a lot of small members is a normal shape for an app delegate. I am not going to argue it should be split on aesthetic grounds.

The two seams worth naming are the ones where the *evidence*, not the taxonomy, points:

### Seam 1 — the UI-test harness (2,682 lines, mechanical, zero release risk)

64 members, already `#if DEBUG`-gated, already communicating through a documented env-var protocol. Moving them behind one injected `UITestHarness` type is close to a pure move:

- `AppDelegate.swift` drops ~13% with no production behavior change;
- the harness becomes independently greppable and testable;
- the env-var protocol becomes a real interface instead of 30 scattered `ProcessInfo.processInfo.environment[...]` reads;
- the 9 members that are *not* fully DEBUG-gated (71 lines, e.g. `installWindowResponderSwizzlesForTesting`, `sessionSnapshotForTesting`) get audited on the way out — some of those probably want to be gated and currently are not.

The payback is not tidiness. It is that a contributor reading `AppDelegate.swift` to understand window lifecycle currently walks through 2,700 lines of fixture plumbing to get there.

### Seam 2 — the shortcut dispatch tail (~1,127 lines, mechanical)

Covered in detail in [`shortcut-namespace.md`](shortcut-namespace.md). The short version: `handleCustomShortcut` divides into a 622-line ordered-precedence prologue that must stay ordered, and a 1,127-line tail of 76 `match → route` branches that a registry expresses better. Extract the tail, leave the prologue alone.

### Together

Seams 1 and 2 are ~3,800 lines, both mechanical, both reviewable as pure moves, and neither requires agreeing on what an app delegate is "supposed" to own. That is the whole proposal.

## The unresolved questions for the room

1. Is the in-process UI-test harness **deliberate** — i.e. is driving the real delegate through env vars the tactic that makes these tests trustworthy — or is it where fixture code accumulated because there was no other seam? If it is deliberate, it deserves to be a named, documented component rather than an implicit one.
2. Which of the 45 existing `AppDelegate+*` splits have actually paid off, and what made those the right cut lines? That answer should drive the next extraction more than any external analysis.
3. `cmux_performKeyEquivalent` (451 lines) and `cmux_makeFirstResponder` (144) are swizzle-side entry points. Is routing keyboard input at the `NSApplication.sendEvent` layer, rather than through the responder chain, a considered trade (control, ordering) or historical?

---

## Related

- [`shortcut-namespace.md`](shortcut-namespace.md) — why the dispatcher is the size it is.
- [`default-config.md`](default-config.md) — what a heavy user overrides and what that implies.
- Tact #44 (contributor loop), #46 (public vs internal `AGENTS.md`), #53 §4.
