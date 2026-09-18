# AppDelegate.swift: an ownership map, not a line count

**Status:** measured against `manaflow-ai/cmux` at `e9ec596d1`, 2026-09-17.
**Method:** static parse of `Sources/AppDelegate.swift`. Read-only.
**Reproduce:** [`evidence/appdelegate.py`](evidence/appdelegate.py).

---

"`AppDelegate.swift` is over 20,000 lines" is true and nearly useless. The measurement changes the claim:

| region | lines | share |
| --- | ---: | ---: |
| inside `#if DEBUG` | 6,594 | **32.4%** |
| production | 13,731 | 67.6% |

A third of the file does not ship. By top-level member: 724 production members / 15,299 lines, 201 debug members / 4,983 lines.

Of the debug side, **72 members / 2,749 lines are named test scaffolding** — `setupTerminalCmdClickUITestIfNeeded` alone is 792 lines — driven by `CMUX_UI_TEST_*` environment variables so UI tests can plant fixtures and read state back. **71 of the 72 are `#if DEBUG`-gated**; the exception, `installWindowResponderSwizzlesForTesting` (13 lines), only forces evaluation of swizzles that are production behaviour anyway, with its one test-only call gated inside.

So the accurate statement is:

> **A ~13,700-line production AppDelegate and a 6,600-line in-process UI-test harness share one file.**

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

Two of the top three are keyboard-event routing — the amount of *input-state* precedence cmux resolves, not shortcut-table size ([`shortcut-namespace.md`](shortcut-namespace.md)).

## Two seams

45 `AppDelegate+*.swift` files already exist (9,171 lines), so extraction is accepted practice. The question is what to extract next.

Domain clustering does not answer it: a keyword classifier puts ~63% of production members in a "workspace + window lifecycle" bucket, which is just "AppDelegate does AppDelegate things." A coordination point with many small members is a normal shape. Not a seam.

**Seam 1 — the UI-test harness. 2,749 lines, mechanical, zero release risk.** 71 members, already gated, already speaking a documented env-var protocol. Behind one injected `UITestHarness` type: the file drops ~13% with no production change, the harness becomes greppable and testable, 30-odd scattered `ProcessInfo…environment[...]` reads become an interface, and the gating stops being something a reviewer has to keep getting right by hand. The payback is that someone reading this file for window lifecycle currently walks through 2,700 lines of fixture plumbing.

**Seam 2 — the shortcut dispatch tail. ~1,127 lines, weaker.** `handleCustomShortcut` splits into a 622-line prologue resolving input state (must stay ordered) and a tail matching 76 actions. But sampling the tail, only **2 of 40** branches are a pure routing call; the rest carry per-action handling a `[ShortcutAction: (Context) -> Bool]` registry would not absorb. Treat the line count as an upper bound on the payoff.

Together: ~3,900 lines, both reviewable as pure moves, neither requiring agreement on what an app delegate should own.

## Questions for the room

1. Is the in-process UI-test harness **deliberate** — is driving the real delegate through env vars what makes these tests trustworthy — or is it where fixture code accumulated for lack of a seam? If deliberate, it deserves to be a named component.
2. Which of the 45 existing `AppDelegate+*` splits paid off, and what made those the right cut lines? That should drive the next extraction more than any outside analysis.
3. `cmux_performKeyEquivalent` (451 lines) and `cmux_makeFirstResponder` (144) are swizzle-side entry points. Is routing keyboard input at the `NSApplication.sendEvent` layer rather than through the responder chain a considered trade, or historical?

---

Related: [`shortcut-namespace.md`](shortcut-namespace.md), [`default-config.md`](default-config.md). Tact #44, #46, #53 §4.
