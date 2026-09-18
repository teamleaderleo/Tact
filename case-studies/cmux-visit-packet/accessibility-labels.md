# Every surface tab bar button announces its icon, not its name

**Status:** read from the live accessibility tree of a running cmux on 2026-09-17, then traced to source and fixed.
**Fix:** [teamleaderleo/bonsplit#1](https://github.com/teamleaderleo/bonsplit/pull/1) — `swift build` clean, `swift test` 223 tests / 0 failures.

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

| button | announced | should be |
| --- | --- | --- |
| `cmux.newTerminal` | `terminal` | New Terminal Tab |
| `cmux.newBrowser` | `Globe` | New Browser Tab |
| `cmux.splitRight` | `square.split.2x1` | **Split Right** |
| `cmux.splitDown` | `square.split.1x2` | **Split Down** |
| custom action, `title: "Copy Cmd"` | `Copy` | Copy Cmd |
| custom action, `title: "Copy Screen"` | `Screen Sharing` | Copy Screen |
| custom action, `title: "Copy Path"` | `Move` | Copy Path |

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

One move, to where the identifier and tooltip already live and already apply to both branches:

```swift
splitActionButton(button, tooltips: tooltips)
    .accessibilityIdentifier(splitActionButtonAccessibilityIdentifier(button))
    .accessibilityElement(children: .ignore)
    .accessibilityLabel(splitActionButtonTooltip(button, tooltips: tooltips))
    .safeHelp(splitActionButtonTooltip(button, tooltips: tooltips))
```

No behavior change for sighted users; tooltips, hit targets and styling are untouched. The mouse-down branch keeps `.accessibilityAddTraits(.isButton)` because its overlay-driven element is not a real `Button`.

Submitted as [teamleaderleo/bonsplit#1](https://github.com/teamleaderleo/bonsplit/pull/1).

**Not yet verified end to end.** The Bonsplit suite passes, but cmux has not been rebuilt and its accessibility tree re-read. The source path is unambiguous; the confirmation is still owed.

## The precedent

This is the cheapest possible instance of a general Mac rule: **a control's name belongs to the control, not to its picture.** AppKit and SwiftUI both make the icon the fallback precisely because the fallback is meant to be wrong often enough to notice.

The related pattern worth stealing is that Xcode, Finder and Mail all treat the tooltip and the accessibility label as *the same string by construction* rather than two things that happen to agree. Bonsplit almost does this already — `splitActionButtonTooltip` is the single source — which is why the fix is a move rather than new copy.

## The unresolved question for the room

The interesting question is not "will you take this patch." It is:

> **What would have caught this?**

The accessibility label was wrong for every button in a visible, frequently-used control, and nothing failed. There is an `accessibilityIdentifier` on each of these buttons for UI tests, so the tests can find them — by identifier, which is exactly the channel that does *not* exercise the label.

A ten-line test asserting that every `SplitActionButton`'s exposed label equals its tooltip would have caught it and would keep catching it. Whether that is worth having — and whether there are other controls in the same shape — is a question about how much the team wants accessibility to be a tested property rather than a reviewed one.

Related: the custom-action API has the same shape. Anyone configuring `ui.surfaceTabBar.buttons` in `cmux.json` gets a `title` that becomes a tooltip and never an accessibility label, so this affects extension authors too, not just built-ins.

---

## Related

- [`shortcut-namespace.md`](shortcut-namespace.md) — the other half of "how do you reach an action without looking."
- Tact #38 (native-Mac microcraft), #45 (extensibility middle layer).
