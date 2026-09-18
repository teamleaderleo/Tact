# Every surface tab bar button announced its icon, not its name

**Status:** read from the live accessibility tree of a running cmux on 2026-09-17, traced to source, fixed, verified.
**Fix:** [teamleaderleo/bonsplit#1](https://github.com/teamleaderleo/bonsplit/pull/1) — `swift build` clean, 223 tests passing, **and verified against two cmux builds that differ only in this submodule.**

---

## The artifact

What macOS accessibility reported for the seven buttons in the surface tab bar:

```text
AXButton  "terminal"          AXButton  "Copy"
AXButton  "Globe"             AXButton  "Screen Sharing"
AXButton  "square.split.2x1"  AXButton  "Move"
AXButton  "square.split.1x2"
```

Those are SF Symbol identifiers and the generic system descriptions macOS attaches to them. `square.split.2x1` has no system description, so a VoiceOver user hears a raw API identifier read out.

| button | announced | the name it already has |
| --- | --- | --- |
| `cmux.newTerminal` | `terminal` | New Tab (Terminal) |
| `cmux.newBrowser` | `Globe` | New Tab (Browser) |
| `cmux.splitRight` | `square.split.2x1` | **Split Right** |
| `cmux.splitDown` | `square.split.1x2` | **Split Down** |
| `title: "Copy Last Command"` | `Copy` | Copy Last Command |
| `title: "Copy Visible Screen"` | `Screen Sharing` | Copy Visible Screen |
| `title: "Copy Current Path"` | `Move` | Copy Current Path |

**The user job:** operate the tab bar without seeing it.

## Why it is worth a page

**The correct strings already exist,** localized, already computed for these exact buttons:

```swift
case .splitRight:
    return (String(localized: "command.terminalSplitRight.title",
                   defaultValue: "Split Right"), ["terminal", "split", "right"])
```

That title is already used as the button's **tooltip**. Hovering has always shown it; the screen reader never had it. [PR #57](https://github.com/teamleaderleo/cmux/pull/57)'s localization audit reports six catalogs and nine locales with zero errors — all of it invisible to a screen reader for this control.

## The seam

`vendor/bonsplit/Sources/Bonsplit/Internal/Views/TabBarView.swift`:

```swift
if button.activatesOnMouseDown {
    splitActionButtonIcon(button.icon)
        .accessibilityLabel(splitActionButtonTooltip(button, tooltips: tooltips))   // labeled
} else {
    Button { ... } label: { splitActionButtonIcon(button.icon) }                    // not labeled
        .buttonStyle(SplitActionButtonStyle(...))
}
```

`activatesOnMouseDown` **defaults to `false`, and nothing in cmux sets it to `true`** — only Bonsplit's own tests do. Every real button takes the `else` branch, SwiftUI names the button after its image, and **the labeled branch is dead code**.

The defect is not a missing string. A control's accessibility ended up depending on an unrelated interaction property.

## The fix

One line, in the branch that was missing it — `.accessibilityLabel` on the `Button` itself, which is the canonical way to name an icon-only SwiftUI button. Call site and mouse-down branch untouched, so the `accessibilityIdentifier` is unaffected. No change for sighted users. The label source is `splitActionButtonTooltip`, already the single source of truth for this button's name.

## Verified end to end — and the first attempt was wrong

Two builds at the **same commit** (`381dc8091`), same machine, differing only in the `vendor/bonsplit` pin, each read with the same accessibility probe:

| button | control (`075cc0d`) | fixed (`b2d1da9`) |
| --- | --- | --- |
| `paneTabBarControl.newTerminal` | `terminal` | **New Tab (Terminal)** |
| `paneTabBarControl.newBrowser` | `Globe` | **New Tab (Browser)** |
| `paneTabBarControl.splitRight` | `square.split.2x1` | **Split Right** |
| `paneTabBarControl.splitDown` | `square.split.1x2` | **Split Down** |
| `…custom.terminal-kit.copyCommand` | `Copy` | **Copy Last Command** |
| `…custom.terminal-kit.copyScreen` | `Screen Sharing` | **Copy Visible Screen** |
| `…custom.terminal-kit.copyPath` | `Move` | **Copy Current Path** |

Every button kept `AXPress` and its `paneTabBarControl.*` identifier.

That last column is why the second build existed. **The first patch broke the identifier:** it moved `.accessibilityElement(children: .ignore)` to the call site, where it wrapped the row *after* `.accessibilityIdentifier(…)`, so the inner icon's identifier surfaced and `paneTabBarControl.newTerminal` became `terminal`. UI tests locate these buttons by identifier, so the "fix" would have broken them. **Both versions passed all 223 tests.** Only reading the live accessibility tree distinguished them.

## The precedent

A general Mac rule at its cheapest: **a control's name belongs to the control, not to its picture.** AppKit and SwiftUI make the icon the fallback precisely because the fallback is meant to be wrong often enough to notice. Xcode, Finder and Mail treat tooltip and accessibility label as the same string by construction. Bonsplit nearly does already, which is why the fix is a move rather than new copy.

## The question for the room

> **What would have caught this?**

The label was wrong for every button in a frequently-used control and nothing failed. Each button carries an `accessibilityIdentifier` for UI tests — exactly the channel that does not exercise the label. A ten-line test asserting every `SplitActionButton`'s exposed label equals its tooltip would catch it and keep catching it.

The sharper version comes from the identifier regression: it also passed 223 tests, and the label==tooltip guard would not have caught *that* either. What the tree exposes is a property of the composed hierarchy at runtime. Whatever the answer is, it probably has to run the app.

The custom-action API has the same shape: anyone configuring `ui.surfaceTabBar.buttons` in `cmux.json` gets a `title` that becomes a tooltip and never a label. This reaches extension authors too.

---

Related: [`shortcut-namespace.md`](shortcut-namespace.md). Tact #38, #45, #64; fieldwork #947.
