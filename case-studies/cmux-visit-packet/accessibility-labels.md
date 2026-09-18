# Every surface tab bar button announces its icon, not its name

**Status:** read from the live accessibility tree of a running cmux on 2026-09-17, then traced to source and fixed.
**Fix:** [teamleaderleo/bonsplit#1](https://github.com/teamleaderleo/bonsplit/pull/1) — `swift build` clean, `swift test` 223 tests / 0 failures, **and verified end to end against two builds of cmux that differ only in this submodule.**

---

## The artifact

This is what macOS accessibility reports for the seven buttons in the surface tab bar:

```text
AXButton  "terminal"
AXButton  "Globe"
AXButton  "square.split.2x1"
AXButton  "square.split.1x2"
AXButton  "Copy"
AXButton  "Screen Sharing"
AXButton  "Move"
```

Those are not names. They are **SF Symbol identifiers** and the generic system descriptions macOS attaches to them. `square.split.2x1` has no system description at all, so a VoiceOver user hears a raw API identifier read out character by character.

Here is what each button actually is:

| button | announced | the name it already has |
| --- | --- | --- |
| `cmux.newTerminal` | `terminal` | New Tab (Terminal) |
| `cmux.newBrowser` | `Globe` | New Tab (Browser) |
| `cmux.splitRight` | `square.split.2x1` | **Split Right** |
| `cmux.splitDown` | `square.split.1x2` | **Split Down** |
| custom action, `title: "Copy Last Command"` | `Copy` | Copy Last Command |
| custom action, `title: "Copy Visible Screen"` | `Screen Sharing` | Copy Visible Screen |
| custom action, `title: "Copy Current Path"` | `Move` | Copy Current Path |

The right-hand column is not aspirational — it is the tooltip each button already carries, confirmed by reading the fixed build. Hovering has always shown it; the screen reader has never had it.

## The user job

Operate the tab bar without seeing it.

## What makes this worth a page

**The correct strings already exist.** cmux is not missing this copy — it is localized and it is already computed for these exact buttons:

```swift
case .splitRight:
    return (String(localized: "command.terminalSplitRight.title",
                   defaultValue: "Split Right"), ["terminal", "split", "right"])
```

That title is already passed down and already used as the button's **tooltip**. A sighted user hovering gets "Split Right". The same string, in the same call, simply never reaches the accessibility label.

The localization audit in [PR #57](https://github.com/teamleaderleo/cmux/pull/57) reports six catalogs and nine locales with zero errors — and all of that work is invisible to a screen reader for this control.

## The seam

`vendor/bonsplit/Sources/Bonsplit/Internal/Views/TabBarView.swift`:

```swift
if button.activatesOnMouseDown {
    splitActionButtonIcon(button.icon)
        ...
        .accessibilityLabel(splitActionButtonTooltip(button, tooltips: tooltips))   // labeled
} else {
    Button { ... } label: { splitActionButtonIcon(button.icon) }                    // not labeled
        .buttonStyle(SplitActionButtonStyle(...))
}
```

`activatesOnMouseDown` **defaults to `false`, and nothing in cmux sets it to `true`** — only Bonsplit's own tests do. So every real button takes the `else` branch, SwiftUI falls back to naming the button after its image, and **the labeled branch is dead code**.

The accessibility of a control ends up depending on an unrelated interaction property. That is the actual defect: not a missing string, but a label attached at the wrong level of the view tree.

## The fix

Label the `Button` where it is built, which is the canonical way to name an icon-only SwiftUI button:

```swift
} else {
    Button {
        performSplitActionButton(button)
    } label: {
        splitActionButtonIcon(button.icon)
    }
    .buttonStyle(SplitActionButtonStyle(appearance: appearance, layout: tabBarLayout))
    .accessibilityLabel(splitActionButtonTooltip(button, tooltips: tooltips))   // added
}
```

One line, in the one branch that was missing it. The call site and the mouse-down branch are untouched, so the `accessibilityIdentifier` is unaffected. No behavior change for sighted users; tooltips, hit targets and styling are the same.

The label source is `splitActionButtonTooltip` — already the single source of truth for this button's name, and already used for the hover tooltip.

Submitted as [teamleaderleo/bonsplit#1](https://github.com/teamleaderleo/bonsplit/pull/1).

### Verified end to end — and the first attempt was wrong

Two builds of cmux at the **same commit** (`381dc8091`), on the same machine, differing only in the `vendor/bonsplit` pin, each read with the same accessibility-API probe:

| button | control (`075cc0d`) | fixed (`b2d1da9`) |
| --- | --- | --- |
| `paneTabBarControl.newTerminal` | `terminal` | **New Tab (Terminal)** |
| `paneTabBarControl.newBrowser` | `Globe` | **New Tab (Browser)** |
| `paneTabBarControl.splitRight` | `square.split.2x1` | **Split Right** |
| `paneTabBarControl.splitDown` | `square.split.1x2` | **Split Down** |
| `…custom.terminal-kit.copyCommand` | `Copy` | **Copy Last Command** |
| `…custom.terminal-kit.copyScreen` | `Screen Sharing` | **Copy Visible Screen** |
| `…custom.terminal-kit.copyPath` | `Move` | **Copy Current Path** |

Every button kept `AXPress` and kept its `paneTabBarControl.*` identifier.

That last column is the point of doing this. **My first patch broke the identifier.** It moved `.accessibilityElement(children: .ignore)` to the call site, where it wrapped the row *after* `.accessibilityIdentifier(…)` — so the inner icon's identifier surfaced instead, and `paneTabBarControl.newTerminal` became `terminal`. UI tests locate these buttons by identifier, so the "fix" would have broken them.

The revised patch applies `.accessibilityLabel` to the `Button` in the `else` branch directly — the canonical way to name an icon-only SwiftUI button — and leaves the call site and the mouse-down branch untouched.

Nothing in the Bonsplit test suite caught that regression; both versions passed all 223 tests. Only reading the live accessibility tree did.

## The precedent

This is the cheapest possible instance of a general Mac rule: **a control's name belongs to the control, not to its picture.** AppKit and SwiftUI both make the icon the fallback precisely because the fallback is meant to be wrong often enough to notice.

The related pattern worth stealing is that Xcode, Finder and Mail all treat the tooltip and the accessibility label as *the same string by construction* rather than two things that happen to agree. Bonsplit almost does this already — `splitActionButtonTooltip` is the single source — which is why the fix is a move rather than new copy.

## The unresolved question for the room

The interesting question is not "will you take this patch." It is:

> **What would have caught this?**

The accessibility label was wrong for every button in a visible, frequently-used control, and nothing failed. There is an `accessibilityIdentifier` on each of these buttons for UI tests, so the tests can find them — by identifier, which is exactly the channel that does *not* exercise the label.

A ten-line test asserting that every `SplitActionButton`'s exposed label equals its tooltip would have caught it and would keep catching it. Whether that is worth having — and whether there are other controls in the same shape — is a question about how much the team wants accessibility to be a tested property rather than a reviewed one.

The sharper version of the question comes from my own mistake above: the identifier regression also passed 223 tests. A unit suite cannot see what the accessibility tree actually exposes, because that is a property of the composed view hierarchy at runtime. Whatever the answer is, it probably has to run the app.

Related: the custom-action API has the same shape. Anyone configuring `ui.surfaceTabBar.buttons` in `cmux.json` gets a `title` that becomes a tooltip and never an accessibility label, so this affects extension authors too, not just built-ins.

---

## Related

- [`shortcut-namespace.md`](shortcut-namespace.md) — the other half of "how do you reach an action without looking."
- Tact #38 (native-Mac microcraft), #45 (extensibility middle layer).
