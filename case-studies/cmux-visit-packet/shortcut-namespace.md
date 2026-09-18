# The shortcut namespace is full, and the dispatcher is paying for it

**Status:** measured against `manaflow-ai/cmux` at `e9ec596d1`, 2026-09-17.
**Method:** static extraction from `ShortcutAction+Defaults.swift` and `Sources/AppDelegate.swift`. Read-only; nothing was executed.
**Reproduce:** [`evidence/shortcuts.py`](evidence/shortcuts.py), [`evidence/appdelegate.py`](evidence/appdelegate.py).

---

## The user job

Reach any of ~128 actions without stopping to think, and keep reaching them as the app grows.

## What is actually there

cmux declares **128 default chords over 43 distinct keys**. 114 of those chords are distinct, which means **13 chords are bound to more than one action** — 27 actions in total share a chord with another action.

| chord | actions sharing it |
| --- | --- |
| `cmd+0` | `browserZoomReset`, `canvasZoomReset`, `markdownZoomReset` |
| `cmd+[` | `browserBack`, `focusHistoryBack` |
| `cmd+]` | `browserForward`, `focusHistoryForward` |
| `cmd+-` | `browserZoomOut`, `markdownZoomOut` |
| `cmd+=` | `browserZoomIn`, `markdownZoomIn` |
| `cmd+r` | `browserReload`, `renameTab` |
| `cmd+shift+r` | `browserHardReload`, `renameWorkspace` |
| `cmd+shift+a` | `focusTextBoxInput`, `simulatorToggleAppearance` |
| `cmd+shift+g` | `groupSelectedWorkspaces`, `toggleReactGrab` |
| `cmd+shift+h` | `simulatorHome`, `triggerFlash` |
| `ctrl+1` | `selectSurfaceByNumber`, `switchRightSidebarToFiles` |
| `ctrl+n` | `commandPaletteNext`, `diffViewerScrollDownEmacs` |
| `ctrl+p` | `commandPalettePrevious`, `diffViewerScrollUpEmacs` |

Most of these are **defensible**: `cmd+r` meaning reload in a browser and rename on a tab is the right answer in each context. They are collisions resolved by focus, not mistakes.

The second pattern is modifier depth. Distinct default chords by modifier count:

| modifiers | chords |
| ---: | ---: |
| 0 | 4 |
| 1 | 40 |
| 2 | 53 |
| 3 | 17 |

**70 of 114 chords need two or more modifiers.** The `[` and `]` keys carry seven actions each:

```text
]   cmd                 focusHistoryForward
    cmd                 browserForward
    cmd+ctrl            nextSidebarTab
    cmd+shift           nextSurface
    cmd+shift+opt       moveSurfaceRight
    cmd+shift+ctrl      moveSurfaceToNextPane
    cmd+opt+ctrl        moveWorkspaceDown
```

Six modifier depths on one key. Every new "move this thing that way" action has been added by taking the same key and adding a modifier.

## The seam: this is why `handleCustomShortcut` is 1,749 lines

`AppDelegate.handleCustomShortcut` (L14527–16275) is the single largest member of `AppDelegate.swift` — 8.6% of the file. It is not a switch: **221 `if`/`else if` branches, 6 `case` labels, max nesting depth 6.**

It splits cleanly in two:

| region | lines | share | what it does |
| --- | ---: | ---: | --- |
| ordered-precedence prologue | 622 | 36% | IME marked text, modal/sheet suppression, command-palette arming and escape suppression, address-bar focus, chord-prefix state |
| action dispatch tail | 1,127 | 64% | 76 `matchConfiguredShortcut(event:action:)` branches, largely `match → route to focused dock` |

The prologue is not accidental complexity, and it should not be "cleaned up" by flattening. **It is the runtime cost of the 13 context-resolved collisions above.** Deciding whether `cmd+r` means reload or rename requires knowing what has focus, whether an IME composition is open, whether a palette is armed, and whether a sheet is up — and that decision has to happen before any action matching.

The two findings are one finding: *the shortcut table's ambiguity is resolved imperatively, once, in the largest function in the app.*

## The precedent

Browsers, editors, and terminals solve this three ways, and cmux currently uses only the third:

1. **Responder chain / first-responder ownership** (AppKit's own answer). The focused view claims `cmd+r` and the delegate never sees it. cmux partly does this, but `handleCustomShortcut` runs at `performKeyEquivalent`/`sendEvent` level and re-derives focus itself.
2. **Declarative `when` clauses** (VS Code). Each binding carries a context predicate; the dispatcher is a table plus a context evaluator. Collisions become data, and the precedence is inspectable and user-overridable.
3. **Imperative precedence chain** (current cmux). Correct, fast to extend by one more `if`, and it is the thing that grows without bound.

cmux already has a `when`-clause concept — `globalSearchShortcutWhenClauseAllows(event:)` appears inside the prologue. The primitive exists; it just is not the dispatcher's organizing principle.

## The proposal, smallest first

**Do not** rewrite the prologue. It encodes real precedence knowledge that took incidents to learn, and flattening it into a table would lose that.

Do this instead, in order:

1. **Make the table observable.** Emit the 128-chord table (and its 13 collisions) as a build-time artifact and assert on it in a test. Today a new binding can silently collide; nothing fails.
2. **Give the tail a registry.** The 76 `match → route` branches are mechanical. A `[ShortcutAction: (Context) -> Bool]` registry moves them out of the delegate without touching the prologue. That is ~1,100 lines leaving `AppDelegate.swift` with no behavior change and no precedence risk.
3. **Only then** consider promoting the prologue's implicit predicates into named, testable `when` clauses — one at a time, each with the collision it exists to resolve named in a test.

Step 2 alone is a ~5% reduction in `AppDelegate.swift` with a mechanical, reviewable diff.

## The unresolved question for the room

Modifier stacking on a key family is a deliberate, learnable pattern — `[`/`]` always means "previous/next thing", and the modifier picks *which* thing. That is real spatial consistency, and it is arguably better than 128 unrelated mnemonics.

So the question is not "is this too many modifiers." It is:

> **Is the `[`/`]` family a designed accelerator that new users should be taught, or is it where actions go when the namespace is full?**

The answer changes what step 3 should be. If it is designed, the docs and the modifier-hold hints should teach the family explicitly, and the dispatcher should be organized around it. If it is pressure relief, the growth path needs somewhere else to go — and `ctrl+tab` for surface cycling (what this fork's config does) is the first thing to reclaim.

---

## Related

- [`appdelegate-ownership.md`](appdelegate-ownership.md) — where the 1,749 lines sit in the wider file.
- [`default-config.md`](default-config.md) — the 29 defaults this fork's config overrides, including the surface-cycling rebind.
- Tact #53 §4 (contributor/repository questions), Tact #56 (design language audit).
