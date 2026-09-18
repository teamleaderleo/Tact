# The shortcut namespace is crowded — and cmux already solved the hard part

**Status:** measured against `manaflow-ai/cmux` at `e9ec596d1`, 2026-09-17.
**Method:** static extraction from `ShortcutAction+Defaults.swift`, `KeyboardShortcutActionContext.swift`, `ShortcutWhenClause.swift` and `Sources/AppDelegate.swift`. Read-only; nothing was executed.
**Reproduce:** [`evidence/shortcuts.py`](evidence/shortcuts.py), [`evidence/appdelegate.py`](evidence/appdelegate.py).

> **This page is a corrected negative result.** An earlier draft claimed cmux had 13 undeclared chord collisions resolved only by statement order, with no test and no UI signal. **That was wrong on every count**, and the section below says exactly how. I am leaving the correction visible because the way I got it wrong is more useful than the finding would have been.

---

## What is actually there

cmux declares **128 default chords over 43 distinct keys**. 114 are distinct, so **13 chords carry more than one action** — 27 actions in total. 70 of 114 chords need two or more modifiers.

The `[` and `]` keys each carry **seven** actions across six modifier depths:

```text
]   cmd            focusHistoryForward        cmd+shift+opt   moveSurfaceRight
    cmd            browserForward             cmd+shift+ctrl  moveSurfaceToNextPane
    cmd+ctrl       nextSidebarTab             cmd+opt+ctrl    moveWorkspaceDown
    cmd+shift      nextSurface
```

That much is true and reproducible. What I got wrong was the conclusion I drew from it.

## What I assumed, and what is actually the case

I saw `cmd+r` bound to both `browserReload` and `renameTab`, found a 1,749-line `handleCustomShortcut`, and concluded the overlaps were resolved imperatively by the order of `if` statements. I wrote that cmux used "an imperative precedence chain" where VS Code uses declarative `when` clauses.

**cmux implements the VS Code model.** It is not an approximation of it — the doc comment says so by name.

### 1. Every action declares a context

`KeyboardShortcutActionContext.swift` maps each action to a `ShortcutContext`, and each context to a `ShortcutWhenClause` built from a real algebra (`.and`, `.or`, `.not`, `.atom`, `.key`):

```swift
case .nonBrowserPanel:    return .and(.not(.atom(.browserFocus)), .not(.atom(.sidebarFocus)))
case .outsideBrowserPanel: return .not(.atom(.browserFocus))
case .browserPanel:       return .atom(.browserFocus)
case .viewerPanel:        return .or(.atom(.browserFocus), .atom(.markdownFocus))
```

`matchConfiguredShortcut(event:action:)` evaluates the clause *before* matching the stroke:

```swift
if !shortcutWhenClauseAllows(action: action, event: event) { return false }
```

So **9 of the 13 collisions are resolved by mutually exclusive contexts**, not by ordering:

| chord | action / context | action / context |
| --- | --- | --- |
| `cmd+r` | `browserReload` · `browserPanel` | `renameTab` · `nonBrowserPanel` |
| `cmd+[` | `browserBack` · `browserPanel` | `focusHistoryBack` · `outsideBrowserPanel` |
| `cmd+=` | `browserZoomIn` · `browserOrFilePreviewTextEditor` | `markdownZoomIn` · `markdownPanel` |
| `ctrl+n` | `commandPaletteNext` · `commandPaletteVisible` | `diffViewerScrollDownEmacs` · `viewerPanel` |

These pairs cannot both fire. The overlap is *declared*, which is the opposite of what I claimed.

### 2. The remaining four are deliberate, and documented in the source

Four pairs do have overlapping clauses, because one side is `.application` (→ `.always`): `cmd+shift+g`, `cmd+shift+a`, `cmd+shift+h`, `ctrl+1`.

I expected to find the later action unreachable. Instead:

```swift
if matchConfiguredShortcut(event: event, action: .groupSelectedWorkspaces) {
    // Only consume the event when grouping actually happened; otherwise
    // fall through so the dispatcher reaches the later
    // `.toggleReactGrab` check (default ⌘⇧G collides with React Grab
    // and grouping returns false when no multi-selection exists).
    if handleGroupSelectedWorkspacesShortcut(...) { return true }
}
```

The collision is named in a comment, and resolved by conditional consumption — consume only if the action actually did something, otherwise fall through. The same pattern appears on `toggleFocusedWorkspaceGroupCollapsed`, with a comment about preserving rebinding.

### 3. Collisions are detected, tested, and refused in the UI

`ShortcutWhenClause.bindingsCollide(_:lhsHasPriority:_:rhsHasPriority:)` implements priority-aware, most-specific-wins overlap detection. Its own documentation cites VS Code and calls out one of the very pairs I flagged:

> *The shipped defaults rely on this: Select Surface `⌃1…9` coexists with the sidebar's `⌃1…5`, which win only while the sidebar is focused.*

It also refuses to let a user save a **dead binding** — a clause that implies the winner's, and so could never fire, is reported as a collision rather than silently accepted.

It is wired into `ShortcutListModel.detectConflict`, which rejects the rebind and raises a dismissible conflict banner in Settings (`ShortcutListRowView`). `shortcuts.when` in `cmux.json` has a real parser, and unknown context keys parse to an always-false clause — again matching VS Code.

Tests live in `ShortcutWhenClauseTests.swift`, including the priority-aware collision cases.

### What this means for the Settings screenshot

![Settings, Keyboard Shortcuts](evidence/settings-keyboard-shortcuts.png)

I originally captioned this as showing "no collision indicator." That was an inference from a static screenshot of a pane in its resting state. The indicator is a **rejection banner that appears when you attempt a colliding rebind** — not a passive annotation, so of course it is not visible here.

What is fair to say about this pane is narrower and less interesting: in its resting state it does not *show* which chords are shared or what context governs them. The information exists and the system acts on it; the list just does not display it until you trip it.

## What actually survives

Two things, neither a defect:

1. **Modifier depth is a learnability question, not a correctness one.** Seven actions on `]` across six depths is real. The system resolves them correctly; a new user still has to acquire them.
2. **`handleCustomShortcut` is still 1,749 lines** with a 622-line ordered prologue. But I mis-attributed its purpose: the prologue is IME marked text, modal and sheet suppression, command-palette arming and escape suppression — *input-state* precedence, not collision resolution. Collision resolution is in the when-clauses. The size argument stands on its own footing in [`appdelegate-ownership.md`](appdelegate-ownership.md); it is not evidence of a namespace problem.

## What I should have done

Searched for the mechanism before asserting its absence. `bindingsCollide`, `ShortcutWhenClause`, and `shortcutContext` were each one `grep` away. I reasoned from a screenshot and one function to a conclusion about the whole system.

That is precisely the failure mode this packet's [`appdelegate-ownership.md`](appdelegate-ownership.md) opens by warning about — the outside engineer who read a file listing rather than the file. Worth keeping visible.

## The unresolved question for the room

The correctness question is closed. The remaining one is genuinely open and is about teaching, not architecture:

> **Is the `[`/`]` modifier family a designed accelerator that users should be taught, or is it where actions go when the namespace is full?**

There is a `showModifierHoldHints` setting that reveals chips while Cmd or Control is held, which suggests the former. If it is designed, the family deserves to be taught explicitly — "`[`/`]` is always previous/next, the modifier picks *which* thing" is a one-sentence mental model that the current flat list does not convey.

---

## Related

- [`appdelegate-ownership.md`](appdelegate-ownership.md) — the dispatcher's size, argued without this page's mistake.
- [`default-config.md`](default-config.md) — the two surface-cycling rebinds this fork actually makes.
- Tact #59 (corrected), fieldwork #948 (closed as a negative result).
